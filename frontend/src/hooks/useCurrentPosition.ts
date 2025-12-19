import { useEffect, useState } from "react";

type LatLng = [number, number];

export function useCurrentPosition(fallback?: LatLng) {
  const [pos, setPos] = useState<LatLng | null>(fallback ?? null);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (p) => {
        setPos([p.coords.latitude, p.coords.longitude]);
      },
      () => {
        if (fallback) setPos(fallback);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [fallback]);

  return pos;
}
