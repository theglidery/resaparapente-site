#!/usr/bin/env python3
"""Renders data/guides-source.json (written by scripts/build-guides.mjs) into the two PDF guides. Called by build-guides.mjs."""
import json, sys, html
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether, ListFlowable, ListItem
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

for n, f in (('F', 'DejaVuSans.ttf'), ('FB', 'DejaVuSans-Bold.ttf'), ('FI', 'DejaVuSans-Oblique.ttf')):
    pdfmetrics.registerFont(TTFont(n, '/usr/share/fonts/truetype/dejavu/' + f))
pdfmetrics.registerFontFamily('F', normal='F', bold='FB', italic='FI', boldItalic='FB')
INK, SKY, DEEP, SUN, TINT, LINE = HexColor('#0b2540'), HexColor('#1478e0'), HexColor('#08397a'), HexColor('#ffb41f'), HexColor('#e3f2fe'), HexColor('#cfe2f2')
S = {
    'body': ParagraphStyle('body', fontName='F', fontSize=9.6, leading=14, textColor=INK, spaceAfter=5),
    'lead': ParagraphStyle('lead', fontName='F', fontSize=11.5, leading=16.5, textColor=INK, spaceAfter=8),
    'part': ParagraphStyle('part', fontName='FB', fontSize=20, leading=24, textColor=DEEP, spaceBefore=4, spaceAfter=10),
    'h1': ParagraphStyle('h1', fontName='FB', fontSize=15, leading=19, textColor=DEEP, spaceBefore=12, spaceAfter=6),
    'h2': ParagraphStyle('h2', fontName='FB', fontSize=11.5, leading=15, textColor=SKY, spaceBefore=9, spaceAfter=4),
    'small': ParagraphStyle('small', fontName='F', fontSize=8.2, leading=11.5, textColor=HexColor('#46607a')),
    'cell': ParagraphStyle('cell', fontName='F', fontSize=8.6, leading=11.5, textColor=INK),
    'cellb': ParagraphStyle('cellb', fontName='FB', fontSize=8.6, leading=11.5, textColor=white),
    'note': ParagraphStyle('note', fontName='F', fontSize=9.2, leading=13.2, textColor=INK, leftIndent=8, rightIndent=8, spaceBefore=3, spaceAfter=3),
}
esc = lambda t: html.escape(t, quote=False)
def P(t, st='body'): return Paragraph(esc(t), S[st])
def box(text, color=TINT):
    t = Table([[Paragraph(esc(text), S['note'])]], colWidths=[170 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), color), ('LINEBEFORE', (0, 0), (0, -1), 3, SUN), ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6)]))
    return t
def bullets(items): return ListFlowable([ListItem(P(i), leftIndent=12, bulletColor=SKY) for i in items], bulletType='bullet', start='•', leftIndent=12, bulletFontName='F')
def table(rows):
    data = [[Paragraph(esc(c), S['cellb'] if i == 0 else S['cell']) for c in r] for i, r in enumerate(rows)]
    w = 170 * mm / len(rows[0])
    t = Table(data, colWidths=[w] * len(rows[0]), repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), DEEP), ('GRID', (0, 0), (-1, -1), 0.4, LINE), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                           ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, TINT]), ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]))
    return t

def article(a, level=1):
    out = [P(a.get('h1') or a['title'], 'h1' if level == 1 else 'h2')]
    if a.get('lead'): out.append(P(a['lead'], 'lead' if level == 1 else 'body'))
    if a.get('brief'): out.append(table([['À retenir', '']] + [[b['k'], b['v']] for b in a['brief']]))
    for s in a['sections']:
        out.append(P(s['h'], 'h2'))
        for p in s.get('p', []): out.append(P(p))
        if s.get('ul'): out.append(bullets(s['ul']))
        for i, st in enumerate(s.get('steps', []), 1): out.append(P(f"{i}. {st['t']} : {st['d']}"))
        if s.get('table'): out += [table(s['table']), Spacer(1, 5)]
        if s.get('note'): out.append(box(s['note']))
    if a.get('faq'):
        out.append(P('Questions fréquentes', 'h2'))
        for f in a['faq']: out += [P(f['q'], 'h2' if False else 'body') if False else Paragraph('<b>' + esc(f['q']) + '</b>', S['body']), P(f['a'])]
    return out

def build(g):
    def deco(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(DEEP); canvas.rect(0, A4[1] - 11 * mm, A4[0], 11 * mm, stroke=0, fill=1)
        canvas.setFillColor(white); canvas.setFont('FB', 8.5); canvas.drawString(20 * mm, A4[1] - 7.3 * mm, g['title'])
        canvas.setFillColor(HexColor('#46607a')); canvas.setFont('F', 8); canvas.drawString(20 * mm, 10 * mm, 'resaparapente.fr · MonParapente.fr · guide gratuit, contenus généraux')
        canvas.drawRightString(A4[0] - 20 * mm, 10 * mm, f'{doc.page}'); canvas.restoreState()
    doc = BaseDocTemplate(g['file'], pagesize=A4, title=g['title'], author='Resa Parapente / MonParapente.fr', subject='Guide gratuit',
                          leftMargin=20 * mm, rightMargin=20 * mm, topMargin=20 * mm, bottomMargin=18 * mm)
    doc.addPageTemplates([PageTemplate(id='p', frames=[Frame(20 * mm, 18 * mm, 170 * mm, A4[1] - 38 * mm, id='f', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)], onPage=deco)])
    st = [Spacer(1, 30 * mm), Paragraph(esc(g['title']), ParagraphStyle('t', fontName='FB', fontSize=26, leading=31, textColor=DEEP)), Spacer(1, 8 * mm), P(g['lead'], 'lead'), Spacer(1, 6 * mm), box(g['note'])]
    st += [Spacer(1, 10 * mm), P('Sommaire', 'h1')]
    toc = [p['h'] for p in g['parts'] if p['h']] or [a.get('h1') or a['title'] for p in g['parts'] for a in p['articles']]
    st.append(bullets(toc + ['Pour aller plus loin : les liens utiles']))
    st.append(PageBreak())
    for part in g['parts']:
        if part['h']: st += [P(part['h'], 'part')]
        for a in part['articles']:
            st += article(a, 1 if not part['h'] or len(part['articles']) == 1 else 2) if part['h'] and len(part['articles']) > 1 else article(a, 1)
        st.append(PageBreak())
    st.append(P('Pour aller plus loin', 'part'))
    st.append(P('Cliquez sur les liens (ou recopiez-les) pour continuer à vous renseigner.'))
    for m in g['more']: st.append(Paragraph(f'<a href="{m["href"]}" color="#1478e0">{esc(m["label"])}</a><br/><font size="7.5" color="#46607a">{esc(m["href"])}</font>', S['body']))
    for p in g['parts']:
        for a in p['articles']:
            for src in a.get('sources', []) or []:
                pass
    srcs = {}
    for p in g['parts']:
        for a in p['articles']:
            for src in a.get('sources', []) or []: srcs[src['href']] = src['label']
    if srcs:
        st += [P('Sources des contenus', 'h1')]
        for h, l in srcs.items(): st.append(Paragraph(f'<a href="{html.escape(h)}" color="#1478e0">{esc(l)}</a>', S['small']))
    doc.build(st)

for key, g in json.load(open(sys.argv[1])).items():
    build(g); print('written', g['file'])
