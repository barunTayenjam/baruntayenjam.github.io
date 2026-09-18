/* ============================================================
   baruntayenjam.github.io v3 — Swiss Terminal Editorial
   Three signature moments only:
     1. velocity-reactive skew on display type + marquee
     2. 100-commit wall with repo filter
     3. scroll progress + nav solid + counter animation
   Zero dependencies. Transform/opacity only. rAF-throttled.
   ============================================================ */

(async function () {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ── 1. nav solid + scroll progress ────────────────────── */
  const nav = $('#nav'), pbar = $('#pbar');
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('solid', y > 30);
    const h = document.documentElement.scrollHeight - innerHeight;
    pbar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 2. hero rise-in (JS-driven so it coexists with velocity skew) ── */
  if (!reduce) {
    const heroSpans = $$('.hero h1 .row > span');
    heroSpans.forEach((el, i) => {
      el.style.transition = 'transform 1.1s cubic-bezier(.22,1,.36,1) ' + (i * 0.12) + 's, opacity .9s ease ' + (i * 0.12) + 's';
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
    });
  }

  /* ── 3. velocity-reactive skew on display + marquee ────── */
  if (!reduce) {
    const skewTargets = $$('.hero h1 .row, .manifesto-q, .contact-head');
    const mq = $('.mq-track');
    let velocity = 0;
    let mqPos = 0;
    let prevY = scrollY;
    let lastTime = performance.now();
    let raf = null;
    let mqVisible = false;
    let mqPaused = false;

    if (mq) {
      const mqIO = new IntersectionObserver(es => {
        mqVisible = es[0].isIntersecting;
        if (mqVisible && !raf) { prevY = scrollY; lastTime = performance.now(); raf = requestAnimationFrame(tick); }
      }, { threshold: 0 });
      const mqSec = mq.closest('.marquee');
      mqIO.observe(mqSec);
      mqSec.addEventListener('mouseenter', () => { mqPaused = true; });
      mqSec.addEventListener('mouseleave', () => { mqPaused = false; if (mqVisible && !raf) { prevY = scrollY; lastTime = performance.now(); raf = requestAnimationFrame(tick); } });
    }

    const tick = () => {
      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      const dy = scrollY - prevY;
      const inst = (dy / dt) * 16;
      velocity += (inst - velocity) * 0.18;
      if (Math.abs(velocity) < 0.02) velocity = 0;

      const skew = Math.max(-1.6, Math.min(1.6, velocity * 0.04));
      for (const el of skewTargets) el.style.transform = 'skewX(' + skew + 'deg)';

      if (mq && mqVisible && !mqPaused) {
        const baseSpeed = 70;
        const accel = Math.min(60, Math.abs(velocity) * 5);
        mqPos += (baseSpeed + accel) * dt * 0.001 * (velocity >= 0 ? -1 : 1);
        const halfWidth = mq.scrollWidth / 2;
        if (halfWidth > 0) {
          if (mqPos < -halfWidth) mqPos += halfWidth;
          else if (mqPos > 0) mqPos -= halfWidth;
        }
        mq.style.transform = 'translateX(' + mqPos + 'px)';
      }

      lastTime = now;
      prevY = scrollY;
      const active = mqVisible && !mqPaused || Math.abs(velocity) > 0.05 || Math.abs(dy) > 0.5;
      if (active) {
        raf = requestAnimationFrame(tick);
      } else {
        for (const el of skewTargets) el.style.transform = '';
        raf = null;
      }
    };
    addEventListener('scroll', () => {
      if (!raf) { prevY = scrollY; lastTime = performance.now(); raf = requestAnimationFrame(tick); }
    }, { passive: true });
    raf = requestAnimationFrame(tick);
  }

  /* ── 4. manifesto word-reveal on enter ────────────────── */
  if (!reduce && $('.manifesto-q')) {
    const q = $('.manifesto-q');
    const text = q.textContent.trim();
    q.innerHTML = '';
    const tokens = text.split(/\s+/).filter(Boolean);
    tokens.forEach((t, i) => {
      if (i > 0) q.appendChild(document.createTextNode(' '));
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = t;
      q.appendChild(span);
    });
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        $$('.w', e.target).forEach((s, i) => {
          setTimeout(() => s.classList.add('in'), i * 30);
        });
      });
    }, { threshold: 0.2 });
    io.observe(q);
  }

  /* ── 5. generic reveals ───────────────────────────────── */
  const rio = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      rio.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
  $$('.reveal').forEach(el => rio.observe(el));

  /* ── 6. counters ──────────────────────────────────────── */
  const cio = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target;
      const end = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const suf = el.dataset.suffix || '';
      if (reduce) return;
      const t0 = performance.now();
      const step = (ts) => {
        const p = Math.min((ts - t0) / 1400, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = (end * ease).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  $$('.count').forEach(el => cio.observe(el));

  /* ── 7. commit wall ────────────────────────────────────── */
  const wall = $('#commitsWall');
  const countEl = $('#commitCount');
  if (wall) {
    let commits = [];
    try {
      const r = await fetch('commits.json');
      commits = await r.json();
    } catch (err) {
      wall.innerHTML = '<li class="g-fallback">Commit data offline \u2014 <a href="https://github.com/baruntayenjam">GitHub profile \u2192</a></li>';
    }

    const REPOS = {
      'casa-visitor-guardian':  { title: 'casa-visitor-guardian',  url: 'https://github.com/baruntayenjam/casa-visitor-guardian' },
      'wordpress-matrix':       { title: 'wordpress-matrix',       url: 'https://github.com/baruntayenjam/wordpress-matrix' },
      'baruntayenjam.github.io':{ title: 'baruntayenjam.github.io',url: 'https://baruntayenjam.github.io' },
      'gitops':                 { title: 'gitops',                 url: 'https://github.com/barungrazitti/gitops' },
      'JiraGrok':               { title: 'JiraGrok',               url: 'https://github.com/barungrazitti/JiraGrok' },
      'StarkCSS':               { title: 'StarkCSS',               url: 'https://github.com/barungrazitti/StarkCSS' },
      'year-in-code':           { title: 'year-in-code',           url: 'https://github.com/barungrazitti/year-in-code' },
      'manipur-economy':        { title: 'manipur-economy',        url: 'https://github.com/baruntayenjam/manipur-economy' },
      'SentryVision':           { title: 'SentryVision',           url: 'https://github.com/baruntayenjam/SentryVision' },
      'effects-of-e20':         { title: 'effects-of-e20',         url: 'https://github.com/baruntayenjam/effects-of-e20' },
      'taskapi':                { title: 'taskapi',                url: 'https://github.com/baruntayenjam/taskapi' },
      'home-security':          { title: 'home-security',          url: 'https://github.com/baruntayenjam/home-security' }
    };

    const sorted = commits.slice().sort((a, b) => a.date < b.date ? 1 : -1);
    const filtersEl = $('#cfOpts');
    const counts = {};
    sorted.forEach(c => counts[c.repo] = (counts[c.repo] || 0) + 1);
    let activeFilter = 'all';

    const renderOpts = () => {
      const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      filtersEl.innerHTML = '';
      const mk = (label, key, n) => {
        const b = document.createElement('button');
        b.className = 'cf-opt';
        b.type = 'button';
        b.setAttribute('aria-pressed', String(activeFilter === key));
        b.innerHTML = '<span>' + label + '</span><span class="n">' + n + '</span>';
        b.addEventListener('click', () => {
          activeFilter = key;
          renderOpts();
          render();
        });
        filtersEl.appendChild(b);
      };
      mk('All repos', 'all', sorted.length);
      entries.forEach(([k, n]) => mk(REPOS[k]?.title || k, k, n));
    };

    const render = () => {
      const list = activeFilter === 'all' ? sorted : sorted.filter(c => c.repo === activeFilter);
      wall.innerHTML = '';
      const frag = document.createDocumentFragment();
      const esc = s => { const d = document.createElement('div'); d.textContent = String(s ?? ''); return d.innerHTML; };
      list.forEach(c => {
        const li = document.createElement('li');
        const r = REPOS[c.repo] || { title: c.repo, url: '#' };
        const a = document.createElement('a');
        a.className = 'cw-row';
        a.target = '_blank';
        a.rel = 'noopener';
        a.href = esc(r.url);
        const dt = document.createElement('span');
        dt.className = 'cw-date';
        dt.textContent = (c.date || '').slice(0, 10);
        const msg = document.createElement('span');
        msg.className = 'cw-msg';
        msg.textContent = c.msg || '';
        const repo = document.createElement('span');
        repo.className = 'cw-repo';
        repo.textContent = r.title;
        a.append(dt, msg, repo);
        li.appendChild(a);
        frag.appendChild(li);
      });
      wall.appendChild(frag);
      countEl.textContent = list.length + ' commits';

      if (!reduce) {
        const rows = $$('.cw-row', wall);
        rows.forEach((r, i) => {
          setTimeout(() => r.classList.add('in'), Math.min(i * 8, 400));
        });
      } else {
        $$('.cw-row', wall).forEach(r => r.classList.add('in'));
      }
    };

    renderOpts();
    render();
  }

  /* ── 8. custom cursor + magnetic buttons (fine pointers) ── */
  if (!reduce && fine) {
    const dot = $('#cdot'), ring = $('#cring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    let cursorRunning = true;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + (mx - 3) + 'px,' + (my - 3) + 'px)';
      if (!cursorRunning) { cursorRunning = true; loop(); }
    }, { passive: true });
    addEventListener('mouseleave', () => { cursorRunning = false; });
    addEventListener('mouseenter', () => { if (!cursorRunning) { cursorRunning = true; loop(); } });
    const loop = () => {
      if (!cursorRunning) return;
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.setProperty('--rx', (rx - 18) + 'px');
      ring.style.setProperty('--ry', (ry - 18) + 'px');
      ring.style.transform = 'translate(' + (rx - 18) + 'px,' + (ry - 18) + 'px)';
      requestAnimationFrame(loop);
    };
    loop();
    $$('a,.btn,.soc,.mailto').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('big'));
      el.addEventListener('mouseleave', () => ring.classList.remove('big'));
    });
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) * 0.18;
        const dy = (e.clientY - r.top - r.height / 2) * 0.22;
        b.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });
  }

  /* ── 9. theme toggle ──────────────────────────────────── */
  const tbtn = $('#themeBtn');
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    if (tbtn) tbtn.textContent = t === 'light' ? '\u263e' : '\u2600';
    try { localStorage.setItem('bt-theme', t); } catch (e) {}
  }
  if (tbtn) {
    tbtn.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '\u263e' : '\u2600';
    tbtn.addEventListener('click', () => applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'));
  }

  /* ── 10. close mobile menu: link tap, Escape, outside click ── */
  $$('.nav-menu .m-links a').forEach(a => a.addEventListener('click', () => {
    const d = a.closest('details'); if (d) d.removeAttribute('open');
  }));
  addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.nav-menu[open]').forEach(d => d.removeAttribute('open'));
  });
  addEventListener('click', e => {
    $$('.nav-menu[open]').forEach(d => { if (!d.contains(e.target)) d.removeAttribute('open'); });
  });
})();
