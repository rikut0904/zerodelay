import { useEffect, useState } from "react";

type LayerKey = "避難所";

const defaultVisibility: Record<LayerKey, boolean> = {
  避難所: true,
};

export function useLayerVisibility(layer: LayerKey) {
  const [visible, setVisible] = useState(defaultVisibility[layer]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const read = () => {
      const saved = localStorage.getItem("mapLayers");
      if (!saved) {
        setVisible(defaultVisibility[layer]);
        return;
      }
      try {
        const parsed = JSON.parse(saved);
        const stored = parsed?.[layer];
        setVisible(typeof stored === "boolean" ? stored : defaultVisibility[layer]);
      } catch {
        setVisible(defaultVisibility[layer]);
      }
    };

    read();

    const handleUpdate = (event: StorageEvent | Event) => {
      if (event instanceof StorageEvent && event.key && event.key !== "mapLayers") return;
      read();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("mapLayersUpdated", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("mapLayersUpdated", handleUpdate);
    };
  }, [layer]);

  return visible;
}
