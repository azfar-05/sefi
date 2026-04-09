import { createContext, useContext, useState } from "react";

type FilterContextType = {
  developer: string;
  setDeveloper: (value: string) => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [developer, setDeveloper] = useState("");

  return (
    <FilterContext.Provider value={{ developer, setDeveloper }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }

  return context;
}