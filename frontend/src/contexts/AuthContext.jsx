import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [plan, setPlan] = useState("free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/verify", { withCredentials: true })
      .then((res) => {
        if (res.data.authenticated) {
          console.log(res);
          setAuthenticated(true);
          setPlan(res.data.plan);
        } else {
          api.get("auth/refresh", { withCredentials: true }).then((res) => {
            setAuthenticated(res.data.authenticated);
            setPlan(res.data.plan);
          });
        }
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{ authenticated, isLoading, setAuthenticated, plan, setPlan }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

export function useAuth() {
  return useContext(AuthContext);
}
