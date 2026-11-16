"""Make a copy of dist/ that opens by double-click (relative links, no server).
Usage: python3 scripts/make-html-copy.py dist out-folder"""
import os, re, sys, shutil, subprocess
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
src, out = sys.argv[1], sys.argv[2]
if os.path.exists(out): shutil.rmtree(out)
shutil.copytree(src, out)
for root, _, files in os.walk(out):
    depth = os.path.relpath(root, out).count(os.sep) + (0 if root == out else 1)
    pre = '../' * depth if depth else './'
    for f in files:
        p = os.path.join(root, f)
        if f.endswith('.css'):
            s = open(p, encoding='utf-8').read()
            s = s.replace('url(/_astro/', 'url(./')   # css sits in _astro/
            open(p, 'w', encoding='utf-8').write(s)
        elif f.endswith('.html'):
            s = open(p, encoding='utf-8').read()
            # inline external module scripts (browsers block them on file://)
            def inline(m):
                jsfile = os.path.join(out, m.group(1).lstrip('/'))
                js = open(jsfile, encoding='utf-8').read()
                if re.search(r'from\s*["\']\./', js):   # shares a chunk: bundle into one self-contained script
                    tmp = jsfile + '.bundle.js'
                    subprocess.run([os.path.join(ROOT, 'node_modules/.bin/rolldown'), jsfile, '--file', tmp, '--format', 'iife'], check=True, capture_output=True)
                    js = open(tmp, encoding='utf-8').read(); os.remove(tmp)
                return '<script type="module">' + js.replace('</script', '<\\/script') + '</script>'
            s = re.sub(r'<script type="module" src="(/_astro/[^"]+\.js)"></script>', inline, s)
            def fix(m):
                a, url = m.group(1), m.group(2)
                if url.startswith('//'): return m.group(0)
                path, sep, rest = (pre + url.lstrip('/')).partition('?') if '?' in url else (pre + url.lstrip('/'), '', '')
                if '?' not in url and '#' in path:
                    path, _, frag = path.partition('#'); rest = '#' + frag
                if path.endswith('/'): path += 'index.html'
                t = path + (sep + rest if sep else rest)
                return f'{a}="{t}"'
            s = re.sub(r'\b(href|src|action)="(/[^"]*)"', fix, s)
            def fixset(m):   # srcset="/a.png 1x, /b.png 2x"
                parts = [x.strip() for x in m.group(1).split(',')]
                return 'srcset="' + ', '.join((pre + x.lstrip('/')) if x.startswith('/') and not x.startswith('//') else x for x in parts) + '"'
            s = re.sub(r'srcset="([^"]*)"', fixset, s)
            s = re.sub(r'(href|src)="(\.\./|\./)index\.html"', r'\1="\2index.html"', s)
            open(p, 'w', encoding='utf-8').write(s)
