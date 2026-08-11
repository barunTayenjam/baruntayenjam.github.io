#!/usr/bin/env python3
# ponytail: minimal md->pdf bridge. Replace with pandoc if installed later.
import markdown
from weasyprint import HTML

SRC = "Barun-Tayenjam-Tech-Lead-Resume.md"
OUT = "Barun-Tayenjam-Tech-Lead-Resume.pdf"

with open(SRC) as f:
    md_text = f.read()

body = markdown.markdown(md_text, extensions=["extra", "sane_lists"])

HTML_DOC = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 1.5cm 1.8cm; }}
* {{ box-sizing: border-box; }}
body {{ font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; font-size: 9.5pt; line-height: 1.5; }}
h1 {{ font-size: 21pt; margin: 0 0 2pt 0; color: #0b1f2a; letter-spacing: -0.5px; }}
h1 + p {{ margin: 0 0 4pt 0; color: #b8860b; font-weight: 600; font-size: 9.5pt; }}
h1 + p + p {{ margin: 0 0 8pt 0; color: #444; font-size: 8.5pt; }}
h1 + p + p a {{ color: #1e3a8a; text-decoration: none; }}
h2 {{ font-size: 10.5pt; text-transform: uppercase; letter-spacing: 1.5px;
      color: #0b1f2a; border-bottom: 1.5px solid #b8860b; padding-bottom: 2pt; margin: 14pt 0 6pt 0; }}
h3 {{ font-size: 10pt; margin: 8pt 0 1pt 0; }}
p {{ margin: 2pt 0; }}
ul {{ margin: 2pt 0 6pt 0; padding-left: 14pt; }}
li {{ margin: 1.5pt 0; }}
strong {{ color: #0b1f2a; }}
a {{ color: #1e3a8a; text-decoration: none; }}
hr {{ display: none; }}
</style></head><body>{body}</body></html>"""

HTML(string=HTML_DOC).write_pdf(OUT)
print(f"wrote {OUT}")
