"""Builds the CGV page fragment (src/content/cgv.html, Part I only) from docs/CGV-ResaParapente.md.
Edit the Markdown (it is the text of the document « Conditions du site ResaParapente »), run `npm run cgv`, rebuild the site.
Part II (convention de référencement avec les écoles) is not published on the site: it is sent to schools that sign it."""
import re, html
md = open('docs/CGV-ResaParapente.md', encoding='utf-8').read()
a = md.index('## 1 Éditeur'); b = md.index('# Partie II')
out = []
def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'(Classement et référencement[^\[]{0,12})\[lien\]', r'<a href="/classement-et-referencement/">\1</a>', t)
    t = re.sub(r'(politique de confidentialité) \[lien\]', r'<a href="/politique-de-confidentialite/">\1</a>', t)
    t = t.replace('[ville]', 'Grenoble').replace('[SIREN]', '943 359 984')
    t = re.sub(r'\[e-mail\]', '<a href="mailto:contact@resaparapente.fr">contact@resaparapente.fr</a>', t)
    return re.sub(r'\[([^\]]+)\]', r'<mark class="todo">[\1]</mark>', t)
for blk in md[a:b].split('\n\n'):
    blk = blk.strip()
    if not blk or blk.startswith('# '): continue          # "# ..." lines are section captions of the source document
    if blk.startswith('## '):
        num, title = blk[3:].split(' ', 1)
        out.append(f'<h2 id="art-{num}">{num}. {html.escape(title, quote=False)}</h2>'); continue
    out.append('<p>' + inline(blk) + '</p>')
open('src/content/cgv.html', 'w', encoding='utf-8').write('\n'.join(out))
print(len(out), 'blocks')
