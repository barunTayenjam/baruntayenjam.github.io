#!/usr/bin/env python3
"""Fetch the freshest commits across all public repos of both GitHub accounts.

Writes commits.json (latest N commits, repo-tagged) and prints verified
all-time totals per repo. Re-run any time to refresh the dataset.

Rate limit: unauthenticated = 60 req/hr. ~40 requests per full run.
"""
import json, re, urllib.request, urllib.error, time, sys

ACCOUNTS = ['baruntayenjam', 'barungrazitti']
LATEST_N = 100
PER_PAGE = 100

def get(url):
    req = urllib.request.Request(url, headers={
        'User-Agent': 'barun-site-commit-fetch',
        'Accept': 'application/vnd.github+json',
    })
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                return json.loads(r.read()), r.headers
        except urllib.error.HTTPError as e:
            if e.code == 409:      # empty repo (no commits yet)
                return [], {}
            if e.code == 403:      # rate limited
                wait = int(e.headers.get('X-RateLimit-Reset', 0)) - int(time.time())
                print(f'rate limited; reset in {max(wait,0)}s', file=sys.stderr)
                sys.exit(1)
            if e.code >= 500 and attempt < 2:
                time.sleep(1.5 * (attempt + 1)); continue
            return [], {}
        except urllib.error.URLError:
            if attempt < 2: time.sleep(1.5); continue
            return [], {}
    return [], {}

def total_commits(owner, repo):
    """Total commit count via Link header pagination trick (per_page=1)."""
    _, hdrs = get(f'https://api.github.com/repos/{owner}/{repo}/commits?per_page=1&page=2')
    link = hdrs.get('Link', '') or ''
    for seg in link.split(','):
        if 'rel="last"' in seg:
            m = re.search(r'page=(\d+)', seg)
            if m: return int(m.group(1))
    # no Link header: either 0 or 1 commits — count page 1
    data, _ = get(f'https://api.github.com/repos/{owner}/{repo}/commits?per_page=1')
    return len(data)

def fetch_commits(owner, repo, pages=2):
    """Fetch up to `pages` most-recent commit pages (newest first)."""
    out = []
    for page in range(1, pages + 1):
        data, _ = get(f'https://api.github.com/repos/{owner}/{repo}/commits?per_page={PER_PAGE}&page={page}')
        if not data: break
        for c in data:
            out.append({
                'hash': c['sha'][:8],
                'date': c['commit']['author']['date'][:10],
                'repo': repo,
                'msg': c['commit']['message'].split('\n')[0][:70],
                'add': 0,  # per-commit stats would need 1 req/commit; not worth the rate budget
                'del': 0,
            })
        if len(data) < PER_PAGE: break
    return out

def main():
    totals = {}
    recent = []
    for acct in ACCOUNTS:
        repos, _ = get(f'https://api.github.com/users/{acct}/repos?per_page=100&sort=pushed')
        print(f'{acct}: {len(repos)} repos', file=sys.stderr)
        for r in repos:
            full = r['full_name']
            if r.get('fork') and r.get('size', 0) == 0:
                continue
            t = total_commits(*full.split('/'))
            totals[full] = t
            print(f'  {full}: {t} commits', file=sys.stderr)
            recent.extend(fetch_commits(*full.split('/')))
            time.sleep(0.3)

    # dedupe by hash (repo exists on both accounts edge case), sort newest first
    seen, dedup = set(), []
    for c in sorted(recent, key=lambda x: x['date'], reverse=True):
        if c['hash'] in seen: continue
        seen.add(c['hash']); dedup.append(c)

    latest = dedup[:LATEST_N]
    json.dump(latest, open('commits.json', 'w'), indent=0)
    grand_total = sum(totals.values())
    print(json.dumps({
        'repos': totals,
        'repo_count': len(totals),
        'grand_total_commits': grand_total,
        'latest_written': len(latest),
        'newest_commit': latest[0]['date'] if latest else None,
        'oldest_in_dataset': latest[-1]['date'] if latest else None,
    }, indent=2))

if __name__ == '__main__':
    main()
