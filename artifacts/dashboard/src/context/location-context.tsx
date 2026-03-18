import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocations } from "@/hooks/use-locations";

interface LocationContextType {
  locationId: string | null;
  setLocationId: (id: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [locationId, setLocationId] = useState<string | null>(null);
  const { data: locations } = useLocations();

  // Auto-select first location if none selected
  useEffect(() => {
    if (!locationId && locations && locations.length > 0) {
      setLocationId(locations[0].id);
    }
  }, [locations, locationId]);

  return (
    <LocationContext.Provider value={{ locationId, setLocationId }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
}
