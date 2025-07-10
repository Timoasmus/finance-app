import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GiMoneyStack } from "react-icons/gi";

function PrivateRoute({ children }) {
  const { authenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[100vh] flex justify-center items-center flex-col bg-gray-200">
        <GiMoneyStack className="size-30 text-green-900/80 animate-pulse "/>
        <h1 className="font-semibold text-2xl">Loading your finances...</h1>
      </div>
    );
  }
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
