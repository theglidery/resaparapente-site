#!/usr/bin/env python3
"""Collect candidate stage sessions from the sources listed in the workbook.

Reads sheet "Sources de collecte" and, for each school whose channel is automatic,
reads the feed and writes the sessions found to a CSV with the same columns as the
workbook sheet "Sessions" (plus a few review columns). NOTHING is published
automatically: a person reviews the CSV, then pastes accepted rows into "Sessions"
(statut "Actif", "Vérifié le" = today) and runs `npm run data`.

Channels handled (column "Canal de collecte"):
  Agenda iCal                         .ics feed (Google Agenda, Outlook, any agenda)
  Données Event schema.org            web page with JSON-LD  {"@type": "Event" ...}
  Feuille de calcul (CSV ou Google Sheets)   CSV in the template public/modele-stages-ecoles.csv
                                      (a Google Sheet works with its "publish to the web as CSV" link)
  Formulaire école / Relevé manuel    skipped here (entered by hand or via /pour-les-ecoles/)

Usage:
  python3 scripts/collect-sessions.py                       # all automatic sources
  python3 scripts/collect-sessions.py --school S003         # one school
  python3 scripts/collect-sessions.py --xlsx data/xxx.xlsx --out collecte/
  python3 scripts/collect-sessions.py --csv-file ecole.csv --school S003   # a CSV sent by a school
  python3 scripts/collect-sessions.py --dry-run             # list what would be read

Only the Python standard library and openpyxl (already used by export-data.py).
URLs may be http(s):// or file:// (used by the tests). Be polite: one request per
source, identifying User-Agent, 20 s timeout, no crawling beyond the listed address.
"""
import argparse, csv, datetime as dt, glob, html, io, json, os, re, sys, urllib.request
from html.parser import HTMLParser

UA = "ResaParapente-collecte/1.0 (+https://resaparapente.fr/pour-les-ecoles/)"
TODAY = dt.date.today()
OUT_COLS = ["ID école", "École", "Intitulé", "Type de stage (devine)", "Début", "Fin", "Prix session (€)",
            "Places restantes", "Lieu du stage (ville)", "Source (URL)", "Vérifié le", "Canal",
            "Doublon d'une session existante", "Statut de revue"]

LEVEL_WORDS = [  # keyword -> type key used by the site (src/data/stage-types.ts)
    ("siv", "siv"), ("acro", "siv"), ("pilotage", "siv"),
    ("initiation", "initiation"), ("brevet initial", "initiation"), ("debutant", "initiation"), ("débutant", "initiation"),
    ("decouverte", "decouverte"), ("découverte", "decouverte"), ("mini-stage", "decouverte"), ("mini stage", "decouverte"),
    ("perfectionnement", "perfectionnement"), ("thermique", "perfectionnement"), ("cross", "perfectionnement"),
    ("progression", "progression"), ("autonomie", "progression"), ("pilote", "progression"),
    ("marche", "marche-vol"), ("hike", "marche-vol"), ("vol rando", "marche-vol"), ("bivouac", "voyage"), ("voyage", "voyage"), ("séjour", "voyage"), ("sejour", "voyage"), ("itinérant", "voyage"),
    ("encadr", "encadre"), ("séance", "encadre"), ("seance", "encadre"),
]

def guess_type(text):
    t = (text or "").lower()
    for w, k in LEVEL_WORDS:
        if w in t:
            return k
    return ""

def fetch(url):
    if url.startswith("file://"):
        with open(url[7:], "rb") as f:
            return f.read().decode("utf-8", "replace")
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=20) as r:
        raw = r.read(5_000_000)
        enc = r.headers.get_content_charset() or "utf-8"
        return raw.decode(enc, "replace")

def to_date(v):
    """Accept 2027-04-12, 12/04/2027, 20270412, 20270412T090000Z, ISO datetimes."""
    if not v:
        return None
    v = str(v).strip()
    for pat, fmt in ((r"^(\d{4})-(\d{2})-(\d{2})", "ymd"), (r"^(\d{2})/(\d{2})/(\d{4})", "dmy"), (r"^(\d{4})(\d{2})(\d{2})", "ymd")):
        m = re.match(pat, v)
        if m:
            a, b, c = map(int, m.groups())
            try:
                return dt.date(a, b, c) if fmt == "ymd" else dt.date(c, b, a)
            except ValueError:
                return None
    return None

def num(v):
    if v in (None, ""):
        return None
    m = re.search(r"\d+(?:[.,]\d+)?", str(v).replace(" ", "").replace(" ", ""))
    return float(m.group(0).replace(",", ".")) if m else None

# ---------------------------------------------------------------- iCal
def parse_ics(text):
    text = re.sub(r"\r?\n[ \t]", "", text)  # unfold
    out = []
    for blk in re.findall(r"BEGIN:VEVENT(.*?)END:VEVENT", text, re.S):
        f = {}
        for line in blk.strip().splitlines():
            if ":" not in line:
                continue
            k, v = line.split(":", 1)
            f[k.split(";")[0].upper()] = v.replace("\\,", ",").replace("\\n", " ").replace("\\;", ";").strip()
        start, end = to_date(f.get("DTSTART")), to_date(f.get("DTEND"))
        if end and "VALUE=DATE" in blk and end > (start or end):  # all-day DTEND is exclusive in iCal
            end = end - dt.timedelta(days=1)
        desc = f.get("DESCRIPTION", "")
        out.append(dict(title=f.get("SUMMARY", ""), start=start, end=end or start, price=num(re.search(r"(\d[\d .]*)\s*(?:€|eur)", desc, re.I).group(1)) if re.search(r"(\d[\d .]*)\s*(?:€|eur)", desc, re.I) else None,
                        places=None, city=f.get("LOCATION", ""), url=f.get("URL", "")))
    return out

# ---------------------------------------------------------------- JSON-LD
class LD(HTMLParser):
    def __init__(self):
        super().__init__(); self.on = False; self.buf = []; self.blocks = []
    def handle_starttag(self, tag, attrs):
        if tag == "script" and dict(attrs).get("type", "").lower() == "application/ld+json":
            self.on = True; self.buf = []
    def handle_endtag(self, tag):
        if tag == "script" and self.on:
            self.on = False; self.blocks.append("".join(self.buf))
    def handle_data(self, d):
        if self.on: self.buf.append(d)

def walk(o):
    if isinstance(o, list):
        for x in o: yield from walk(x)
    elif isinstance(o, dict):
        yield o
        for v in o.values():
            if isinstance(v, (dict, list)): yield from walk(v)

def parse_jsonld(text):
    p = LD(); p.feed(text); out = []
    for b in p.blocks:
        try: data = json.loads(b)
        except ValueError: continue
        for o in walk(data):
            t = o.get("@type"); t = t if isinstance(t, list) else [t]
            if not any(isinstance(x, str) and x.endswith("Event") for x in t):
                continue
            offers = o.get("offers"); offers = offers[0] if isinstance(offers, list) and offers else (offers or {})
            loc = o.get("location") or {}
            if isinstance(loc, list): loc = loc[0] if loc else {}
            addr = loc.get("address", {}) if isinstance(loc, dict) else {}
            city = addr.get("addressLocality") if isinstance(addr, dict) else (addr if isinstance(addr, str) else "")
            avail = offers.get("inventoryLevel", {}) if isinstance(offers, dict) else {}
            out.append(dict(title=html.unescape(str(o.get("name", ""))), start=to_date(o.get("startDate")), end=to_date(o.get("endDate")) or to_date(o.get("startDate")),
                            price=num(offers.get("price")) if isinstance(offers, dict) else None,
                            places=num(avail.get("value")) if isinstance(avail, dict) else None,
                            city=city or (loc.get("name", "") if isinstance(loc, dict) else ""),
                            url=(offers.get("url") if isinstance(offers, dict) else None) or o.get("url", "")))
    return out

# ---------------------------------------------------------------- CSV (school template)
def parse_csv(text):
    text = text.lstrip("﻿")
    dialect = csv.Sniffer().sniff(text[:2000], delimiters=";,\t") if text.strip() else csv.excel
    rd = csv.DictReader(io.StringIO(text), dialect=dialect)
    def pick(row, *keys):
        for k, v in row.items():
            kk = (k or "").lower()
            if any(x in kk for x in keys): return v
        return None
    out = []
    for r in rd:
        title = pick(r, "intitul")
        if not title and not pick(r, "début", "debut"): continue
        out.append(dict(title=title or pick(r, "type") or "", start=to_date(pick(r, "début", "debut")), end=to_date(pick(r, "fin")),
                        price=num(pick(r, "prix")), places=num(pick(r, "places")), city=pick(r, "ville") or "",
                        url=pick(r, "lien") or "", type_hint=pick(r, "type de stage")))
    return out

PARSERS = {"Agenda iCal": parse_ics, "Données Event schema.org": parse_jsonld, "Feuille de calcul (CSV ou Google Sheets)": parse_csv}

# ---------------------------------------------------------------- workbook
def read_sources(xlsx):
    import openpyxl
    wb = openpyxl.load_workbook(xlsx, data_only=True)
    ws = wb["Sources de collecte"]; hdr = [c.value for c in ws[1]]
    names = {r[0].value: r[1].value for r in wb["Écoles"].iter_rows(min_row=2) if r[0].value}
    src = []
    for r in ws.iter_rows(min_row=2, values_only=True):
        row = dict(zip(hdr, r))
        if row.get("ID école"):
            row["École"] = names.get(row["ID école"], row.get("École") or "")
            src.append(row)
    existing = set()
    for r in wb["Sessions"].iter_rows(min_row=2, values_only=True):
        h = dict(zip([c.value for c in wb["Sessions"][1]], r))
        if h.get("ID école") and h.get("Début"):
            d = h["Début"].date() if hasattr(h["Début"], "date") else to_date(h["Début"])
            existing.add((h["ID école"], d))
    return src, existing

def collect(src, existing, only=None, dry=False):
    rows, report = [], []
    for s in src:
        if only and s["ID école"] != only: continue
        canal, url = s.get("Canal de collecte"), s.get("Adresse du flux ou de la page à lire")
        if canal not in PARSERS or not url:
            continue
        if dry:
            report.append((s["ID école"], canal, url, "à lire")); continue
        try:
            found = PARSERS[canal](fetch(url)); err = None
        except Exception as e:
            found, err = [], f"{type(e).__name__}: {e}"
        rows += make_rows(s["ID école"], s["École"], canal, url, found, existing)
        report.append((s["ID école"], canal, url, err or f"{len(found)} session(s)"))
    return rows, report

def make_rows(sid, name, canal, url, found, existing):
    out = []
    for f in found:
        if not f["start"] or f["start"] < TODAY:
            continue  # past or undated: not a candidate
        dup = "Oui" if (sid, f["start"]) in existing else ""
        out.append({"ID école": sid, "École": name, "Intitulé": f["title"], "Type de stage (devine)": f.get("type_hint") and guess_type(f["type_hint"]) or guess_type(f["title"]),
                    "Début": f["start"].isoformat(), "Fin": (f["end"] or f["start"]).isoformat(), "Prix session (€)": "" if f["price"] is None else int(f["price"]) if f["price"] == int(f["price"]) else f["price"],
                    "Places restantes": "" if f["places"] is None else int(f["places"]), "Lieu du stage (ville)": f["city"], "Source (URL)": f["url"] or url,
                    "Vérifié le": TODAY.isoformat(), "Canal": canal, "Doublon d'une session existante": dup, "Statut de revue": "À valider"})
    return out

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--xlsx", default=None, help="workbook (default: latest data/resaparapente-base-ecoles-offres-v*.xlsx)")
    ap.add_argument("--out", default="collecte", help="output folder (default: collecte/)")
    ap.add_argument("--school", help="only this school ID (e.g. S003)")
    ap.add_argument("--csv-file", help="a CSV received from a school (template format); needs --school")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    xlsx = a.xlsx or sorted(glob.glob(os.path.join(os.path.dirname(__file__), "..", "data", "resaparapente-base-ecoles-offres-v*.xlsx")))[-1]
    src, existing = read_sources(xlsx)
    if a.csv_file:
        if not a.school: sys.exit("--csv-file needs --school Sxxx")
        name = next((s["École"] for s in src if s["ID école"] == a.school), a.school)
        rows = make_rows(a.school, name, "Feuille de calcul (CSV ou Google Sheets)", "", parse_csv(open(a.csv_file, encoding="utf-8-sig").read()), existing)
        report = [(a.school, "CSV reçu", a.csv_file, f"{len(rows)} session(s) à venir")]
    else:
        rows, report = collect(src, existing, a.school, a.dry_run)
    for r in report: print(" | ".join(map(str, r)))
    if a.dry_run: return
    os.makedirs(a.out, exist_ok=True)
    path = os.path.join(a.out, f"collecte-{TODAY.isoformat()}.csv")
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, OUT_COLS, delimiter=";"); w.writeheader(); w.writerows(rows)
    new = sum(1 for r in rows if not r["Doublon d'une session existante"])
    print(f"\n{len(rows)} session(s) candidate(s), dont {new} nouvelle(s) → {path}\nÀ relire avant de les copier dans la feuille Sessions (statut Actif).")

if __name__ == "__main__":
    main()
