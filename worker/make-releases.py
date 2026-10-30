#!/usr/bin/env python3
"""Writes ../releases.json from the catalog in ../index.html. Run it and push the file whenever release dates change.
The Worker reads that file each morning to find tracks that came out. Only SFW titles are ever shown in a notification."""
import json, re, os, sys
d = os.path.dirname(os.path.abspath(__file__))
h = open(os.path.join(d, '..', 'index.html'), encoding='utf-8').read()
cat = json.loads(re.search(r'const CAT=(\{.*?\});\n', h, re.S).group(1))
out = [{'id': t['id'], 'title': t['title'], 'date': t['date'], 'sfw': t.get('rating') == 'SFW'} for t in cat['tracks'] if t.get('date')]
out.sort(key=lambda x: (x['date'], x['id']))
text = json.dumps(out, separators=(',', ':'), ensure_ascii=False)
path = os.path.join(d, '..', 'releases.json')
if '--check' in sys.argv:
    cur = open(path, encoding='utf-8').read() if os.path.exists(path) else ''
    if cur != text:
        print('releases.json is out of date. Run: python3 worker/make-releases.py'); sys.exit(1)
    print('releases.json is up to date (' + str(len(out)) + ' tracks)'); sys.exit(0)
open(path, 'w', encoding='utf-8').write(text)
print(len(out), 'tracks written')
