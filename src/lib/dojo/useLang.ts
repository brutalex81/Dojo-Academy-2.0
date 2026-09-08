import { create } from "zustand";
import { UI, type Lang } from "./i18n";

const KEY = "dojo-lang";

type LangState = {
  lang: Lang;
  choose: (next: Lang) => void;
};

export const useLangStore = create<LangState>((set) => ({
  lang: "it",
  choose: (next) => {
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, next);
    set({ lang: next });
  },
}));

if (typeof window !== "undefined") {
  const saved = window.localStorage.getItem(KEY);
  if (saved === "it" || saved === "en") useLangStore.setState({ lang: saved });
  else if (navigator.language.toLowerCase().startsWith("en")) useLangStore.setState({ lang: "en" });
}

export function useLang() {
  const lang = useLangStore((s) => s.lang);
  const choose = useLangStore((s) => s.choose);
  return { lang, choose, t: UI[lang] };
}
