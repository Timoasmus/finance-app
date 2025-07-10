import { useState, useContext, createContext, useEffect } from "react";

const CurrentScreenContext = createContext();

function CurrentScreenProvider({ children }) {
  const [currentScreen, setCurrentScreen] = useState(() => {
    const saved = sessionStorage.getItem("currentScreen");
    const screen = saved !== null ? JSON.parse(saved) : "dashboard";
    return screen
  });

  useEffect(() => {
    sessionStorage.setItem("currentScreen", JSON.stringify(currentScreen))
  }, [currentScreen])

  return (
    <CurrentScreenContext.Provider value={{ currentScreen, setCurrentScreen }}>
      {children}
    </CurrentScreenContext.Provider>
  );
}

export default CurrentScreenProvider

export function useCurrentScreen() {
    return useContext(CurrentScreenContext);
}