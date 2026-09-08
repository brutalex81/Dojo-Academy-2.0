export const DISCORD_URL = "https://discord.gg/xw5byvvKn";
export const WHATSAPP_URL = "https://chat.whatsapp.com/CrwU4FrMEelIhcOZrKeQBn";

export type Lang = "it" | "en" | "fr" | "es";

export const LANGS: { id: Lang; label: string }[] = [
  { id: "it", label: "IT" },
  { id: "en", label: "EN" },
  { id: "fr", label: "FR" },
  { id: "es", label: "ES" },
];

export type Copy = {
  title: string;
  kicker: string;
  lead: string;
  rulesTitle: string;
  join: string;
  lab: string;
  labHint: string;
  ruleIntro: string;
  rules: { n: string; title: string; body: string }[];
};

export const COPY: Record<Lang, Copy> = {
  it: {
    title: "Un dojo, non una lobby",
    kicker: "Community · Population: One",
    lead: "Dojo Academy è la scuola della community. Si entra per migliorare volo, fight e voce di squadra — non per gonfiare il killfeed.",
    rulesTitle: "Regolamento",
    join: "Entra nel gruppo",
    lab: "Apri il lab",
    labHint: "Le statistiche arrivano dopo. Prima le regole, poi i numeri.",
    ruleIntro: "Poche regole, non negoziabili. Valgono in custom, in allenamento e in vocale.",
    rules: [
      { n: "01", title: "Rispetto", body: "Zero flame, zero tossicità. Si cresce insieme." },
      { n: "02", title: "Comunicazione aperta", body: "Call corte e chiare. Si dice quello che serve, si ascolta il resto." },
      { n: "03", title: "Solo se sei interessato", body: "Si partecipa se si ha voglia vera di allenarsi. Il posto in lobby non è un diritto." },
      { n: "04", title: "I contrasti in custom", body: "Ogni litigio si discute tutti insieme, in custom — non in chat sparsa." },
      { n: "05", title: "Decisioni collettive", body: "Chi si unisce al gruppo decide insieme. Niente decisioni da solista." },
      { n: "06", title: "Carica prima di sparare", body: "Arma pronta, scudi e munizioni prima del peek. Non si spreca il fight." },
      { n: "07", title: "1 kill in meno, 1 res in più", body: "Il revive vale più dell'ego. Si gioca per la squadra." },
      {
        n: "08",
        title: "Tag PDS dopo il trial",
        body: "Dopo i 20 giorni di prova si inserisce il tag PDS_nome. È il passaggio da ospite ad allievo.",
      },
    ],
  },
  en: {
    title: "A dojo, not a lobby",
    kicker: "Community · Population: One",
    lead: "Dojo Academy is the community school. You join to improve movement, fights and comms — not to pad the killfeed.",
    rulesTitle: "House rules",
    join: "Join the group",
    lab: "Open the lab",
    labHint: "Stats come later. Rules first, numbers second.",
    ruleIntro: "Few rules, non-negotiable. They apply in custom, training and voice.",
    rules: [
      { n: "01", title: "Respect", body: "No flame, no toxicity. We grow together." },
      { n: "02", title: "Open communication", body: "Short, clean calls. Say what matters, listen to the rest." },
      { n: "03", title: "Only if you mean it", body: "Show up if you actually want to train. A lobby slot is not a right." },
      { n: "04", title: "Arguments in custom", body: "Disagreements are talked through together in custom — not in scattered chat." },
      { n: "05", title: "Decisions together", body: "Anyone who joins decides with the group. No solo calls." },
      { n: "06", title: "Load before you shoot", body: "Weapon ready, shields and ammo before the peek. Don't waste the fight." },
      { n: "07", title: "1 kill less, 1 res more", body: "A revive beats ego. Play for the squad." },
      {
        n: "08",
        title: "PDS tag after trial",
        body: "After the 20-day trial, add the PDS_name tag. That's the step from guest to student.",
      },
    ],
  },
  fr: {
    title: "Un dojo, pas un lobby",
    kicker: "Communauté · Population: One",
    lead: "Dojo Academy est l'école de la communauté. On vient pour le vol, le fight et la com — pas pour gonfler le killfeed.",
    rulesTitle: "Règlement",
    join: "Rejoindre le groupe",
    lab: "Ouvrir le lab",
    labHint: "Les stats viennent après. D'abord les règles, ensuite les chiffres.",
    ruleIntro: "Peu de règles, non négociables. Elles valent en custom, à l'entraînement et en vocal.",
    rules: [
      { n: "01", title: "Respect", body: "Zéro flame, zéro toxicité. On progresse ensemble." },
      { n: "02", title: "Communication ouverte", body: "Calls courtes et claires. On dit l'essentiel, on écoute le reste." },
      { n: "03", title: "Seulement si tu es motivé", body: "On participe si on veut vraiment s'entraîner. Une place en lobby n'est pas un droit." },
      { n: "04", title: "Les désaccords en custom", body: "Tout conflit se discute ensemble en custom — pas dans le chat éparpillé." },
      { n: "05", title: "Décisions collectives", body: "Qui rejoint le groupe décide avec le groupe. Pas de décision solo." },
      { n: "06", title: "Charge avant de tirer", body: "Arme prête, boucliers et munitions avant le peek. On ne gâche pas le fight." },
      { n: "07", title: "Un kill de moins, une réa de plus", body: "Le revive vaut plus que l'ego. On joue pour l'équipe." },
      {
        n: "08",
        title: "Tag PDS après l'essai",
        body: "Après 20 jours d'essai, on ajoute le tag PDS_nom. C'est le passage d'invité à élève.",
      },
    ],
  },
  es: {
    title: "Un dojo, no un lobby",
    kicker: "Comunidad · Population: One",
    lead: "Dojo Academy es la escuela de la comunidad. Se entra para mejorar vuelo, fight y comms — no para inflar el killfeed.",
    rulesTitle: "Reglamento",
    join: "Entrar al grupo",
    lab: "Abrir el lab",
    labHint: "Las estadísticas llegan después. Primero las reglas, luego los números.",
    ruleIntro: "Pocas reglas, no negociables. Valen en custom, en entreno y en vocal.",
    rules: [
      { n: "01", title: "Respeto", body: "Cero flame, cero toxicidad. Se crece juntos." },
      { n: "02", title: "Comunicación abierta", body: "Calls cortas y claras. Se dice lo necesario, se escucha el resto." },
      { n: "03", title: "Solo si te interesa de verdad", body: "Se participa si hay ganas reales de entrenar. El slot no es un derecho." },
      { n: "04", title: "Los roces en custom", body: "Cualquier discusión se habla en grupo, en custom — no en el chat suelto." },
      { n: "05", title: "Decisiones en grupo", body: "Quien se une decide con el grupo. Nada de decisiones en solitario." },
      { n: "06", title: "Carga antes de disparar", body: "Arma lista, escudos y munición antes del peek. No se tira el fight." },
      { n: "07", title: "1 kill menos, 1 res más", body: "El revive vale más que el ego. Se juega para el equipo." },
      {
        n: "08",
        title: "Tag PDS tras la prueba",
        body: "Después de 20 días de trial se pone el tag PDS_nombre. Es el paso de invitado a alumno.",
      },
    ],
  },
};
