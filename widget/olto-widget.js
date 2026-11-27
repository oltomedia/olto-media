// Olto · widget d'écran d'accueil (app Scriptable). Tailles : moyenne ou grande.
// Les publications ponctuelles viennent de widget/agenda.json (mis à jour chaque dimanche).
const URL_AGENDA = "https://raw.githubusercontent.com/oltomedia/olto-media/main/widget/agenda.json";
const LIENS = {
  qg: "https://claude.ai/artifact/MhvzvV7Kgrq4mBM8jagN3p",
  claude: "https://claude.ai/code/session_01JkSZMspFK3rxYTF87cJYE3",
  metricool: "https://app.metricool.com/planner"
};
const C = { sapin: "#0F1E1B", encre: "#070C0B", ivoire: "#EEF3F4", jade: "#3FD3A4", jadeF: "#0A7A5A", gris: "#8FA6A0", ambre: "#F2B05A", carte: "#FFFFFF" };
const col = (h, a) => new Color(h, a === undefined ? 1 : a);

// ---------- Données ----------
async function agenda() {
  const fm = FileManager.local(), p = fm.joinPath(fm.documentsDirectory(), "olto-agenda.json");
  try { const r = new Request(URL_AGENDA); r.timeoutInterval = 8; const j = await r.loadJSON(); fm.writeString(p, JSON.stringify(j)); return j; }
  catch (e) { return fm.fileExists(p) ? JSON.parse(fm.readString(p)) : { ponctuels: [] }; }
}
function a(jour, h, m) { const d = new Date(jour); d.setHours(h, m, 0, 0); return d; }
function recurrents(jour) {
  const j = jour.getDay(), l = [];
  l.push({ d: a(jour, 19, 0), quoi: "10 min Instagram", sous: "Commentaires, likes, partage en story", url: "instagram://", icone: "heart.fill" });
  if (j >= 1 && j <= 5) l.push({ d: a(jour, 22, 40), quoi: "Story du Top 5", sous: "Notif Metricool → publier sur Instagram", url: LIENS.metricool, icone: "chart.bar.fill" });
  if (j === 6) l.push({ d: a(jour, 11, 30), quoi: "Récap Bourse de la semaine", sous: "Carrousel Instagram à publier", url: LIENS.metricool, icone: "chart.line.uptrend.xyaxis" });
  if (j === 0) l.push({ d: a(jour, 12, 0), quoi: "Valider la production", sous: "Les posts de la semaine dans le QG", url: LIENS.qg, icone: "checkmark.seal.fill" });
  return l;
}
const memeJour = (x, y) => x.toDateString() === y.toDateString();
const hm = d => ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
function dans(d) {
  const m = Math.round((d - new Date()) / 60e3);
  if (m <= 0) return "maintenant";
  if (m < 60) return "dans " + m + " min";
  const h = Math.floor(m / 60), r = m % 60;
  return "dans " + h + " h" + (r ? " " + ("0" + r).slice(-2) : "");
}

// ---------- Calcul ----------
const data = await agenda();
const now = new Date();
const ponct = (data.ponctuels || []).map(p => ({ d: new Date(p.quand), quoi: p.quoi, sous: "Notif Metricool → publier sur Instagram", url: LIENS.metricool, icone: "photo.on.rectangle.angled" }));
let jour = recurrents(now).concat(ponct.filter(p => memeJour(p.d, now)));
jour = jour.filter(t => t.d > new Date(now - 30 * 60e3)).sort((x, y) => x.d - y.d);
const prochaine = jour[0];
const ensuite = jour.slice(1);
const semaine = ponct.filter(p => p.d > now && !memeJour(p.d, now)).sort((x, y) => x.d - y.d).slice(0, 3);

// ---------- Rendu ----------
const taille = config.widgetFamily || "large";
const w = new ListWidget();
const g = new LinearGradient(); g.colors = [col(C.sapin), col(C.encre)]; g.locations = [0, 1];
g.startPoint = new Point(0, 0); g.endPoint = new Point(1, 1); w.backgroundGradient = g;
w.setPadding(16, 16, 14, 16);
w.url = LIENS.qg;
w.refreshAfterDate = new Date(Date.now() + 15 * 60e3);

function txt(s, t, font, color, lines) { const x = s.addText(t); x.font = font; x.textColor = color; if (lines) x.lineLimit = lines; return x; }
function sym(s, name, size, color) { const i = s.addImage(SFSymbol.named(name).image); i.imageSize = new Size(size, size); i.tintColor = color; return i; }
function label(t) { const x = w.addText(t.toUpperCase()); x.font = Font.semiboldMonospacedSystemFont(9); x.textColor = col(C.jade); w.addSpacer(5); }

// En-tête
const top = w.addStack(); top.centerAlignContent();
txt(top, "olto", Font.heavySystemFont(19), col(C.ivoire));
txt(top, ".", Font.heavySystemFont(19), col(C.jade));
top.addSpacer();
const df = new DateFormatter(); df.locale = "fr_FR"; df.dateFormat = "EEEE d MMMM";
txt(top, df.string(now), Font.mediumSystemFont(11), col(C.gris));
w.addSpacer(10);

// Carte « prochaine action »
const hero = w.addStack(); hero.layoutVertically();
hero.backgroundColor = col(C.carte, 0.06); hero.cornerRadius = 16; hero.setPadding(12, 14, 12, 14);
hero.borderColor = col(C.jade, 0.25); hero.borderWidth = 1;
if (prochaine) {
  hero.url = prochaine.url;
  const l1 = hero.addStack(); l1.centerAlignContent();
  txt(l1, "PROCHAINE ACTION", Font.semiboldMonospacedSystemFont(9), col(C.jade));
  l1.addSpacer();
  const pill = l1.addStack(); pill.backgroundColor = col(prochaine.d - now < 30 * 60e3 ? C.ambre : C.jade, 0.18); pill.cornerRadius = 7; pill.setPadding(2, 7, 2, 7);
  txt(pill, dans(prochaine.d), Font.semiboldSystemFont(10), col(prochaine.d - now < 30 * 60e3 ? C.ambre : C.jade));
  hero.addSpacer(6);
  const l2 = hero.addStack(); l2.centerAlignContent();
  sym(l2, prochaine.icone, 22, col(C.jade)); l2.addSpacer(10);
  const tx = l2.addStack(); tx.layoutVertically();
  const t1 = tx.addStack(); t1.bottomAlignContent();
  txt(t1, hm(prochaine.d), Font.boldRoundedSystemFont(22), col(C.ivoire)); t1.addSpacer(8);
  txt(t1, prochaine.quoi, Font.semiboldSystemFont(14), col(C.ivoire), 1);
  txt(tx, prochaine.sous, Font.systemFont(11), col(C.gris), 1);
} else {
  const l = hero.addStack(); l.centerAlignContent();
  sym(l, "checkmark.circle.fill", 22, col(C.jade)); l.addSpacer(10);
  const tx = l.addStack(); tx.layoutVertically();
  txt(tx, "Journée terminée", Font.semiboldSystemFont(15), col(C.ivoire));
  txt(tx, "Les agents s'occupent du reste.", Font.systemFont(11), col(C.gris));
}

function ligne(s, gauche, droite, couleur) {
  const r = s.addStack(); r.centerAlignContent();
  const g1 = r.addStack(); g1.size = new Size(46, 0);
  txt(g1, gauche, Font.semiboldMonospacedSystemFont(11), couleur);
  txt(r, droite, Font.mediumSystemFont(12), col(C.ivoire), 1);
  r.addSpacer();
  s.addSpacer(6);
}

if (taille === "large") {
  w.addSpacer(12);
  if (ensuite.length) { label("Ensuite aujourd'hui"); ensuite.slice(0, 2).forEach(t => ligne(w, hm(t.d), t.quoi, col(C.jade))); w.addSpacer(6); }
  if (semaine.length) {
    label("Cette semaine sur Instagram");
    const f = new DateFormatter(); f.locale = "fr_FR"; f.dateFormat = "EEE d";
    semaine.forEach(p => ligne(w, f.string(p.d).replace(".", ""), p.quoi, col(C.ambre)));
  }
}
w.addSpacer();

// Boutons
const bas = w.addStack(); bas.centerAlignContent();
[["QG", "square.grid.2x2.fill", LIENS.qg], ["Claude", "bubble.left.and.bubble.right.fill", LIENS.claude], ["Metricool", "calendar", LIENS.metricool]].forEach(([n, ic, u], i) => {
  if (i) bas.addSpacer(8);
  const b = bas.addStack(); b.url = u; b.centerAlignContent();
  b.backgroundColor = col(C.carte, 0.07); b.cornerRadius = 10; b.setPadding(7, 0, 7, 0);
  b.addSpacer(); sym(b, ic, 12, col(C.jade)); b.addSpacer(5);
  txt(b, n, Font.semiboldSystemFont(11), col(C.ivoire)); b.addSpacer();
});

if (config.runsInWidget) Script.setWidget(w); else if (taille === "medium") await w.presentMedium(); else await w.presentLarge();
Script.complete();
