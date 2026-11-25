"""SEO checks for the deployed site files.

Seam: the files crawlers read (sitemap.xml, blog/*.html).
Run: python3 scripts/test_seo.py
"""
import re
import sys
import json
import unittest
import glob
import xml.etree.ElementTree as ET

ROOT = sys.path[0] + "/.."
SITEMAP_NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
CANONICAL_RE = re.compile(r'<link rel="canonical" href="([^"]+)"')


def sitemap_urls():
    tree = ET.parse(ROOT + "/sitemap.xml")
    return [loc.text.strip() for loc in tree.iter(SITEMAP_NS + "loc")]


def canonical_of(html_path):
    with open(html_path, encoding="utf-8") as fh:
        html = fh.read()
    m = CANONICAL_RE.search(html)
    return m.group(1) if m else None


class TestSitemapCanonicals(unittest.TestCase):
    def test_blog_urls_in_sitemap_match_canonicals(self):
        """Sitemap must list each blog post's canonical URL."""
        urls = set(sitemap_urls())
        for f in sorted(glob.glob(ROOT + "/blog/*.html")):
            canon = canonical_of(f)
            self.assertIsNotNone(canon, f + " missing canonical")
            self.assertIn(canon, urls,
                          "canonical " + canon + " of " + f
                          + " missing from sitemap.xml")


JSONLD_RE = re.compile(
    r'<script type="application/ld\+json">\s*(.*?)\s*</script>', re.S)
REQUIRED_FIELDS = ("@context", "@type", "headline", "datePublished",
                   "dateModified", "author", "mainEntityOfPage", "image")


class TestBlogPostingSchema(unittest.TestCase):
    def test_each_blog_post_has_valid_blogposting_jsonld(self):
        """Each blog post carries valid BlogPosting JSON-LD with required fields."""
        for f in sorted(glob.glob(ROOT + "/blog/*.html")):
            html = ""
            with open(f, encoding="utf-8") as fh:
                html = fh.read()
            blocks = JSONLD_RE.findall(html)
            self.assertTrue(blocks, f + " has no JSON-LD")
            data = json.loads(blocks[0])
            self.assertEqual(data["@type"], "BlogPosting",
                             f + " wrong @type: " + str(data.get("@type")))
            self.assertEqual(data["@context"], "https://schema.org")
            for field in REQUIRED_FIELDS:
                self.assertIn(field, data,
                              f + " missing " + field)
            # headline must match the visible <title> prefix
            title = re.search(r"<title>([^<—]+)", html).group(1).strip()
            self.assertEqual(data["headline"], title,
                             f + " headline != title prefix")


SOCIAL_TAGS = ("og:title", "og:description", "og:url", "og:type",
               "og:image", "twitter:card", "twitter:title",
               "twitter:description", "twitter:image")


class TestSocialMeta(unittest.TestCase):
    def test_each_blog_post_has_social_meta(self):
        """Each blog post carries OG + Twitter card tags for share previews."""
        for f in sorted(glob.glob(ROOT + "/blog/*.html")):
            with open(f, encoding="utf-8") as fh:
                html = fh.read()
            for tag in SOCIAL_TAGS:
                self.assertIn(tag, html, f + " missing " + tag)
            # OG url must equal canonical
            canon = canonical_of(f)
            ogurl = re.search(r'property="og:url" content="([^"]+)"', html)
            self.assertEqual(ogurl.group(1), canon,
                             f + " og:url != canonical")


class TestLlmsDiscovery(unittest.TestCase):
    def test_robots_and_index_reference_llms_txt(self):
        """llms.txt is discoverable: linked from robots.txt and index head."""
        robots = open(ROOT + "/robots.txt", encoding="utf-8").read()
        self.assertIn("llms.txt", robots, "robots.txt missing llms.txt link")
        with open(ROOT + "/index.html", encoding="utf-8") as fh:
            index = fh.read()
        self.assertIn('href="llms.txt"', index,
                      "index.html missing llms.txt link")


if __name__ == "__main__":
    unittest.main()
