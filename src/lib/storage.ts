import type { StateStorage } from "zustand/middleware";
let unavailable = false;
export const storageUnavailable = () => unavailable;
const failed = () => {
  unavailable = true;
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("hudl-storage-error"));
};
export const safeStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(name);
      if (raw) JSON.parse(raw);
      return raw;
    } catch {
      failed();
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      failed();
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      failed();
    }
  },
};
