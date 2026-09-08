export const EXERCISES = [
  {
    id: "load",
    title: "Carica prima del peek",
    body: "Arma pronta, scudi e munizioni prima di uscire. Dieci peek puliti a sessione.",
  },
  {
    id: "onehand",
    title: "One-hand control",
    body: "Lobby dedicata one-hand. Obiettivo: alzare i colpi a segno, non le kill.",
  },
  {
    id: "twohand",
    title: "Two-hand recoil",
    body: "Burst corti, distanza media. Si conta la precisione, non il volume a caso.",
  },
  {
    id: "banana",
    title: "Banana / mobilità",
    body: "Path fisso, cronometro sul min time. Serve per entrare in fight già alto.",
  },
  {
    id: "res",
    title: "1 res in più",
    body: "Priorità revive sul chase. Fine sessione: più res che kill extra.",
  },
  {
    id: "comms",
    title: "Call da tre parole",
    body: "Posizione, scudo, intent. Niente romanzi in vocale.",
  },
] as const;

export const CERTS = [
  { id: "trial", title: "Trial 20 giorni", need: "Presenza e fogli compilati per il periodo di prova." },
  { id: "pds", title: "Tag PDS", need: "Dopo il trial si mette PDS_nome. Passaggio da ospite ad allievo." },
  { id: "acc", title: "Precisione dojo", need: "Precisione media ≥ 18% sul foglio caricato." },
  { id: "res", title: "Teamplay revive", need: "Almeno 0.8 revive a match." },
  { id: "arma", title: "Arma di riferimento", need: "Un’arma con ≥ 40 colpi e precisione sopra la lobby." },
] as const;
