import { useEffect } from "react";

import { fontSizeMap } from "@/constants/font";

export function useApplyFontSize() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const apply = (size: keyof typeof fontSizeMap) => {
      document.documentElement.style.setProperty(
        "--app-font-size",
        fontSizeMap[size]
      );
    };

    const saved = localStorage.getItem("fontSize");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed in fontSizeMap) {
          apply(parsed);
          return;
        }
      } catch {
        // ignore and fallback
      }
    }

    apply("medium");
  }, []);
}
