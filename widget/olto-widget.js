// Olto · widget d'écran d'accueil (app Scriptable). Taille conseillée : moyen ou grand.
// Les publications ponctuelles viennent de widget/agenda.json (dépôt oltomedia/olto-media).
const URL_AGENDA = "https://raw.githubusercontent.com/oltomedia/olto-media/main/widget/agenda.json";
const LIENS = {
  qg: "https://claude.ai/artifact/MhvzvV7Kgrq4mBM8jagN3p",
  claude: "https://claude.ai/code/session_01JkSZMspFK3rxYTF87cJYE3",
  metricool: "https://app.metricool.com/planner"
};
const C = { fond: "#0F1E1B", ivoire: "#EEF3F4", jade: "#3FD3A4", gris: "#8FA6A0", ambre: "#F2B05A" };

// --- Données ---
async function agenda() {
  const fm = FileManager.local(), p = fm.joinPath(fm.documentsDirectory(), "olto-agenda.json");
  try { const r = new Request(URL_AGENDA); r.timeoutInterval = 8; const j = await r.loadJSON(); fm.writeString(p, JSON.stringify(j)); return j; }
  catch (e) { return fm.fileExists(p) ? JSON.parse(fm.readString(p)) : { ponctuels: [] }; }
}
function recurrents(jour) {
  const j = jour.getDay(), l = [];
  l.push({ h: "19:00", quoi: "10 min Instagram (commentaires, likes)" });
  if (j >= 1 && j <= 5) l.push({ h: "22:40", quoi: "Top 5 : poster la story Instagram" });
  if (j === 6) l.push({ h: "11:30", quoi: "Récap Bourse de la semaine (Instagram)" });
  if (j === 0) l.push({ h: "12:00", quoi: "Valider la production de la semaine (QG)" });
  return l;
}
const memeJour = (a, b) => a.toDateString() === b.toDateString();
const hm = d => ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);

// --- Construction ---
const data = await agenda();
const maintenant = new Date();
let today = recurrents(maintenant);
const ponct = (data.ponctuels || []).map(p => ({ d: new Date(p.quand), quoi: p.quoi })).filter(p => p.d > new Date(maintenant.getTime() - 3600e3));
ponct.filter(p => memeJour(p.d, maintenant)).forEach(p => today.push({ h: hm(p.d), quoi: p.quoi }));
today.sort((a, b) => a.h.localeCompare(b.h));
const restant = today.filter(t => t.h >= hm(new Date(maintenant.getTime() - 30 * 60e3)));
const aVenir = ponct.filter(p => !memeJour(p.d, maintenant)).sort((a, b) => a.d - b.d).slice(0, 3);

const taille = config.widgetFamily || "large";
const w = new ListWidget();
w.backgroundColor = new Color(C.fond);
w.setPadding(14, 16, 14, 16);
w.url = LIENS.qg;
w.refreshAfterDate = new Date(Date.now() + 30 * 60e3);

const tete = w.addStack(); tete.centerAlignContent();
const logo = tete.addText("olto."); logo.font = Font.heavySystemFont(18); logo.textColor = new Color(C.ivoire);
tete.addSpacer();
const df = new DateFormatter(); df.locale = "fr_FR"; df.dateFormat = "EEEE d MMM";
const dt = tete.addText(df.string(maintenant)); dt.font = Font.mediumSystemFont(11); dt.textColor = new Color(C.gris);
w.addSpacer(8);

function titre(t) { const x = w.addText(t.toUpperCase()); x.font = Font.semiboldMonospacedSystemFont(9); x.textColor = new Color(C.jade); w.addSpacer(4); }
function ligne(h, quoi, couleur) {
  const s = w.addStack(); s.centerAlignContent();
  const a = s.addText(h); a.font = Font.semiboldMonospacedSystemFont(12); a.textColor = new Color(couleur || C.jade);
  s.addSpacer(8);
  const b = s.addText(quoi); b.font = Font.mediumSystemFont(12); b.textColor = new Color(C.ivoire); b.lineLimit = 1;
  w.addSpacer(4);
}

titre("À faire aujourd'hui");
if (restant.length === 0) { const t = w.addText("Rien d'autre aujourd'hui ✓"); t.font = Font.mediumSystemFont(12); t.textColor = new Color(C.gris); w.addSpacer(4); }
restant.slice(0, taille === "medium" ? 2 : 4).forEach(t => ligne(t.h, t.quoi));

if (taille !== "medium" && aVenir.length) {
  w.addSpacer(6); titre("Prochaines publications Instagram");
  const f = new DateFormatter(); f.locale = "fr_FR"; f.dateFormat = "EEE d";
  aVenir.forEach(p => ligne(f.string(p.d), p.quoi, C.ambre));
}
w.addSpacer();

// Boutons (les zones cliquables marchent en taille moyenne et grande)
const bas = w.addStack(); bas.spacing = 8;
[["QG", LIENS.qg], ["Claude", LIENS.claude], ["Metricool", LIENS.metricool]].forEach(([n, u]) => {
  const b = bas.addStack(); b.url = u; b.backgroundColor = new Color(C.ivoire, 0.08); b.cornerRadius = 8; b.setPadding(5, 10, 5, 10);
  const t = b.addText(n); t.font = Font.semiboldSystemFont(11); t.textColor = new Color(C.ivoire);
});

if (config.runsInWidget) Script.setWidget(w); else await w.presentLarge();
Script.complete();
