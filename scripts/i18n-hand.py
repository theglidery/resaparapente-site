#!/usr/bin/env python3
"""Compiles the hand-written translation tables data/i18n/hand/*.py (dict D: French text -> English) into src/data/i18n/en.fr-hand.json.
Keys are the French texts (spaces normalised), so the tables stay valid whatever the order of the workbook."""
import glob, importlib.util, json, re, sys
out = {}
for f in sorted(glob.glob('data/i18n/hand/*.py')):
    spec = importlib.util.spec_from_file_location('h', f); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    for k, v in m.D.items(): out[re.sub(r'\s+', ' ', k).strip()] = v
json.dump(out, open('src/data/i18n/en.fr-hand.json', 'w'), ensure_ascii=False, indent=0, sort_keys=True)
print(len(out), 'entries ->', 'src/data/i18n/en.fr-hand.json')
