import { useContext, createContext, useState,  } from "react";

const MonthContext = createContext()

function MonthProvider({children}) {
    const [month, setMonth] = useState(new Date().getMonth())

    return <MonthContext.Provider value={{month, setMonth}}>{children}</MonthContext.Provider>
}

export default MonthProvider

export function useMonth() {
    return useContext(MonthContext);
}