#!/usr/bin/env python3
"""Lists tracks that are out (or about to be) but have no Spotify link in the catalog, so nothing goes live broken.
Usage: python3 tools/missing-links.py [days-ahead]   (default 14)
Reads the catalog in index.html. Prints a plain report and exits with status 1 if anything already released is missing a link."""
import json, os, re, sys, datetime
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
html = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
cat = json.loads(re.search(r'const CAT=(\{.*?\});\n', html, re.S).group(1))
ahead = int(sys.argv[1]) if len(sys.argv) > 1 else 14
today = datetime.date.today()
limit = today + datetime.timedelta(days=ahead)
out, soon = [], []
rows = [(t.get('id'), t.get('title'), t.get('date'), t.get('spotify')) for t in cat['tracks']]
rows += [(f.get('sku'), f.get('title'), f.get('date'), f.get('spotify')) for f in cat['found']]
for i, title, d, s in rows:
    if not d or (s and s.strip()):
        continue
    day = datetime.date.fromisoformat(d)
    if day <= today:
        out.append((d, i, title))
    elif day <= limit:
        soon.append((d, i, title))
print('Released with no Spotify link: %d' % len(out))
for d, i, t in sorted(out): print('  %s  %-8s %s' % (d, i, t))
print('Coming in the next %d days with no link yet: %d' % (ahead, len(soon)))
for d, i, t in sorted(soon): print('  %s  %-8s %s' % (d, i, t))
sys.exit(1 if out else 0)
