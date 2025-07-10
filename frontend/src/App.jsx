import DashBoard from "./components/screens/Dashboard";
import Plans from "./components/screens/Plans";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./components/screens/LoginPage";
import SignupPage from "./components/screens/SignupPage";
import PrivateRoute from "./components/PrivateRoute";
import AuthProvider from "./contexts/AuthContext";
import WidgetsProvider from "./contexts/WidgetsContext";
import CurrentScreenProvider from "./contexts/CurrentScreenContext";
import Overview from "./components/screens/Overview";
import Layout from "./components/Layout";
import MonthProvider from "./contexts/MonthContext";

function App() {
  return (
    <CurrentScreenProvider>
      <AuthProvider>
        <WidgetsProvider>
          <MonthProvider>
            <Routes>
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<DashBoard />} />
                <Route path="overview" element={<Overview />} />
                <Route path="plans" element={<Plans />} />
              </Route>
            </Routes>
          </MonthProvider>
        </WidgetsProvider>
      </AuthProvider>
    </CurrentScreenProvider>
  );
}

export default App;
