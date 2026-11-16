"""Downloads the candidate logos listed in the workbook into logos-to-review/<slug>.<ext> so you can look at them.
Nothing is published: move a logo you accept to public/schools/<slug>/logo.<ext> and set
"Logo validé pour publication" to Oui in the workbook (and keep the school's permission on file).
Run on your own computer (the candidate URLs are on the schools' sites):
    python3 scripts/fetch-logos.py data/resaparapente-base-ecoles-offres-v3.xlsx
"""
import sys, os, re, urllib.request, urllib.parse
import openpyxl

wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
ws = wb['Écoles']
head = [c.value for c in ws[1]]
iu, isl, inm = head.index('URL logo candidat'), head.index('Slug (URL)'), head.index('Nom')
os.makedirs('logos-to-review', exist_ok=True)
ok = fail = 0
for r in ws.iter_rows(min_row=2, values_only=True):
    url, slug = r[iu], r[isl]
    if not url or not slug: continue
    ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower()
    ext = ext if ext in ('.png', '.jpg', '.jpeg', '.webp', '.svg') else '.png'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (logo review)'})
        data = urllib.request.urlopen(req, timeout=15).read()
        open(os.path.join('logos-to-review', slug + ext), 'wb').write(data); ok += 1
    except Exception as e:
        fail += 1; print('FAILED', r[inm], url, e)
print(f'{ok} logos downloaded, {fail} failed. Review them in logos-to-review/.')
