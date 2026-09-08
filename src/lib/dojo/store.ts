import { create } from "zustand";
import type { Dataset } from "./types";
import type { SchoolData } from "./parseSchool";

const DB_NAME = "dojo-academy";
const STORE = "kv";
const KEY = "dataset";
const KEY_SCHOOL = "school";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  if (typeof indexedDB === "undefined") return null;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key: string, value: unknown) {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    if (value) tx.objectStore(STORE).put(value, key);
    else tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

type DojoState = {
  ready: boolean;
  dataset: Dataset | null;
  school: SchoolData | null;
  sessionFilter: string;
  logs: string[];
  setSessionFilter: (code: string) => void;
  load: () => Promise<void>;
  saveDataset: (ds: Dataset) => Promise<void>;
  saveSchool: (s: SchoolData) => Promise<void>;
  clear: () => Promise<void>;
  pushLog: (line: string) => void;
};

export const useDojoStore = create<DojoState>((set, get) => ({
  ready: true,
  dataset: null,
  school: null,
  sessionFilter: "",
  logs: ["[OK] SYSTEM ONLINE"],
  setSessionFilter: (code) => set({ sessionFilter: code }),
  pushLog: (line) => set({ logs: [...get().logs.slice(-24), line] }),
  load: async () => {
    try {
      const ds = await idbGet<Dataset>(KEY);
      const school = await idbGet<SchoolData>(KEY_SCHOOL);
      set({ dataset: ds, school, ready: true });
    } catch {
      set({ ready: true });
    }
  },
  saveDataset: async (ds) => {
    await idbPut(KEY, ds);
    set({ dataset: ds, sessionFilter: "" });
  },
  saveSchool: async (s) => {
    await idbPut(KEY_SCHOOL, s);
    set({ school: s });
  },
  clear: async () => {
    await idbPut(KEY, null);
    await idbPut(KEY_SCHOOL, null);
    set({ dataset: null, school: null, sessionFilter: "" });
  },
}));
