import openpyxl,json,sys,re,collections
wb=openpyxl.load_workbook(sys.argv[1],data_only=False)
def H(ws): return {c.value:c.column for c in ws[1] if c.value}
E,B,S,T=wb['Écoles'],wb['Baptêmes'],wb['Stages'],wb['Sessions']
hE,hB,hS,hT=H(E),H(B),H(S),H(T)
def g(ws,h,r,k):
    v=ws.cell(r,h[k]).value
    if isinstance(v,str) and v.startswith('='): return None
    return v
bap=collections.defaultdict(list); sta=collections.defaultdict(list); nses=collections.Counter()
for r in range(2,B.max_row+1):
    sid=B.cell(r,2).value
    if sid and g(B,hB,r,'Statut')!='Masqué': bap[sid].append(r)
for r in range(2,S.max_row+1):
    sid=S.cell(r,2).value
    if sid and not str(S.cell(r,1).value or '').startswith('OFF-DESC'): sta[sid].append(r)
for r in range(2,T.max_row+1):
    if T.cell(r,2).value: nses[T.cell(r,2).value]+=1
def f(v,n=80):
    return re.sub(r'\s+',' ',str(v)).strip()[:n] if v not in (None,'') else ''
out={}
for r in range(2,E.max_row+1):
    sid=E.cell(r,1).value
    if not sid: continue
    d={'n':E.cell(r,2).value,'v':g(E,hE,r,'Ville'),'cp':g(E,hE,r,'Code postal'),'mode':g(E,hE,r,'Mode de réservation'),
       'site':g(E,hE,r,'Site officiel'),'orig':f(g(E,hE,r,'Description originelle du site'),260),'old':f(g(E,hE,r,'Description (nos mots, 400 à 600 caractères)'),0),
       'team':f(g(E,hE,r,'Présentation : aux commandes (équipe, pilotes)'),160),'label':f(g(E,hE,r,'Labels et agréments'),80),'lang':f(g(E,hE,r,'Langues parlées'),40)}
    bl=[]
    for rr in bap[sid][:40]:
        bl.append((f(g(B,hB,rr,'Formule'),45),g(B,hB,rr,'Prix publié (€)'),g(B,hB,rr,'Durée du vol min (min)'),g(B,hB,rr,'Durée du vol max (min)'),f(g(B,hB,rr,'Lieu / décollage'),40),f(g(B,hB,rr,'Âge'),30),f(g(B,hB,rr,'Poids'),30),f(g(B,hB,rr,'Modalités de réservation'),50)))
    sl=[]
    for rr in sta[sid][:40]:
        sl.append((f(g(S,hS,rr,'Formule'),45),g(S,hS,rr,'Prix publié (€)'),g(S,hS,rr,'Durée min'),g(S,hS,rr,'Unité de durée'),f(g(S,hS,rr,'Lieu / décollage'),35),f(g(S,hS,rr,'Âge'),25),f(g(S,hS,rr,'Niveau / prérequis'),45)))
    d['b']=bl; d['s']=sl; d['nb']=len(bap[sid]); d['ns']=len(sta[sid]); d['ses']=nses[sid]
    out[sid]=d
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False)
print(len(out))
