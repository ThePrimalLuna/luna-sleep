#!/usr/bin/env python3
"""Writes ../releases.json from the catalog in ../index.html. Run it and push the file whenever release dates change.
The Worker reads that file each morning to find tracks that came out. Only SFW titles are ever shown in a notification."""
import json, re, os
d = os.path.dirname(os.path.abspath(__file__))
h = open(os.path.join(d, '..', 'index.html'), encoding='utf-8').read()
cat = json.loads(re.search(r'const CAT=(\{.*?\});\n', h, re.S).group(1))
out = [{'id': t['id'], 'title': t['title'], 'date': t['date'], 'sfw': t.get('rating') == 'SFW'} for t in cat['tracks'] if t.get('date')]
out.sort(key=lambda x: (x['date'], x['id']))
json.dump(out, open(os.path.join(d, '..', 'releases.json'), 'w', encoding='utf-8'), separators=(',', ':'), ensure_ascii=False)
print(len(out), 'tracks written')
