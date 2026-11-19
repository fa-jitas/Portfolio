#!/usr/bin/env python3
"""Generate /foodlens, /co-op-watch and /mentorship-platform as static pages.

GitHub Pages can't rewrite URLs, so each case study gets its own folder with an
index.html: a copy of the homepage whose <head> carries that project's title,
description and Open Graph tags. The same main.js runs on every copy and opens
the matching case study from the URL.

Run from the repo root after editing index.html (the copies must stay in sync):

    python3 scripts/generate-case-pages.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://fajitas.me"

PAGES = [
    {
        "slug": "foodlens",
        "title": "FoodLens · Nicole Fajardo",
        "description": "A hands-free allergen scanner for Ray-Ban Meta smart glasses that works even when products aren't in a barcode database.",
        "image": "images_fl/hero.png",
    },
    {
        "slug": "co-op-watch",
        "title": "Co-op Watch · Nicole Fajardo",
        "description": "A cooperative surveillance game on a shared tabletop display. Poster accepted to SIGGRAPH Asia 2026.",
        "image": "images_cw/heroicon.png",
    },
    {
        "slug": "mentorship-platform",
        "title": "UCSC MS HCI Mentorship Platform · Nicole Fajardo",
        "description": "Designing the admin and onboarding experience for a mentor–mentee matching platform.",
        "image": "images_mp/hero.png",
    },
]


def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;")


def seo_block(p):
    url = f"{SITE}/{p['slug']}"
    img = f"{SITE}/{p['image']}"
    t, d = esc(p["title"]), esc(p["description"])
    return f"""<!-- seo:start -->
<meta name="description" content="{d}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Nicole Fajardo">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:image" content="{img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{img}">
<!-- seo:end -->"""


def main():
    src = (ROOT / "index.html").read_text()
    seo = re.compile(r"<!-- seo:start.*?<!-- seo:end -->", re.S)
    assert seo.search(src), "seo:start/seo:end markers missing from index.html"
    for p in PAGES:
        html = seo.sub(lambda m: seo_block(p), src, count=1)
        html = re.sub(r"<title>.*?</title>", lambda m: f"<title>{esc(p['title'])}</title>", html, count=1)
        # the page is served from /<slug>/, so resolve relative assets from the site root
        html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n<base href="/">', 1)
        out = ROOT / p["slug"] / "index.html"
        out.parent.mkdir(exist_ok=True)
        out.write_text(html)
        print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main()
