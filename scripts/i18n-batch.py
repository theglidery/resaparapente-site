#!/usr/bin/env python3
"""Turns data/i18n/batches/*.txt (lines 'index|English') into JSON batches and merges them into src/data/i18n/en.json.
Usage: python3 scripts/i18n-batch.py todo.json data/i18n/batches/prog-1.txt [...]"""
import json, subprocess, sys, os
todo = sys.argv[1]
for f in sys.argv[2:]:
    rows = []
    for line in open(f, encoding='utf8'):
        line = line.rstrip('\n')
        if not line.strip(): continue
        i, en = line.split('|', 1); rows.append([int(i), en])
    tmp = f + '.json'; json.dump(rows, open(tmp, 'w'), ensure_ascii=False)
    subprocess.run(['node', 'scripts/i18n-merge.mjs', todo, tmp], check=True); os.remove(tmp)
