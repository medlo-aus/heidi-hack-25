import { useQuery } from "@tanstack/react-query";

import { type GeoExtended } from "../pages/api/geolocation";

export const useGeoQuery = () =>
  useQuery({
    queryKey: ["geo"],
    queryFn: async () => {
      const res = await fetch("/api/geolocation");
      return res.json() as Promise<GeoExtended>;
    },
  });
