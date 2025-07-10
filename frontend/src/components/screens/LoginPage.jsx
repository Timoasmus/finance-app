import { useState } from "react";
import dollar from "../../assets/images/dollar1.avif";
import { GiMoneyStack } from "react-icons/gi";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../../api";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useCurrentScreen } from "../../contexts/CurrentScreenContext";
import Loader from "../Loader";

function LoginPage() {
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});

  const { authenticated, setAuthenticated, setPlan } = useAuth();
  const {setCurrentScreen} = useCurrentScreen()

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoginLoading(true);
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    api
      .post("/auth/login", formData, { withCredentials: true })
      .then((res) => {
        if (res.data.authenticated) {
          setAuthenticated(true)
          setPlan(res.data.plan)
          setCurrentScreen("dashboard")
          navigate("/");
        }
      })
      .catch((err) => alert(err))
      .finally(() => setIsLoginLoading(false));
  };

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "*Please fill in an username";
    if (!password.trim()) newErrors.password = "*Please fill in a password";
    return newErrors;
  };

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-[100vh] flex justify-center items-center flex-col bg-gray-200">
      <div className="mt-12 rounded-3xl overflow-hidden flex bg-white shadow-xl w-[85vw] h-[85vh]">
        <div className="relative w-0 md:w-1/3 h-full overflow-hidden flex items-center justify-center">
          <img
            className="absolute inset-0 w-full h-full object-cover "
            src={dollar}
            alt="dollar"
          />
          <div className="absolute inset-0 bg-gradient-to-tl from-black/80 to-green-800/60"></div>
          <div className="z-3 flex flex-col items-center space-y-3">
            <div className=" flex items-center bg-gradient-to-tl from-gray-600 to-gray-500 shadow-2xl border-2 border-white/40 p-12 rounded-full justify-center  text-white/40 text-9xl">
              <GiMoneyStack />
            </div>
            <h1 className="text-3xl text-white/80 font-bold tracking-widest">
              FINANCE TRACKER
            </h1>
            <h2 className="text-2xl text-white/80 font-thin tracking-wider">
              Finance. Simplified.
            </h2>
          </div>
        </div>

        <div className="md:w-2/3 w-full h-full overflow-hidden flex flex-col items-center justify-center bg-green-950/60">
          <h1 className="text-3xl font-semibold  text-white/80 mb-5 ">
            Log In
          </h1>
          <div className="bg-gradient-to-tl from-gray-500 to-gray-400 rounded-4xl h-5/12 w-1/2 flex shadow-lg p-6 border-2 border-white/40">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-baseline p-6 pt-12 space-y-3  w-full"
            >
              <div className=" w-full">
                <label
                  className="font-thin text-xl text-white/40"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  className="border-b-gray-600/60 text-white/40 border-b-2 w-full focus:outline-none focus:ring-0 py-1 focus:border-b-white/20 focus:border-b-2"
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && (
                  <p className="font-thin text-red-700 text-sm">
                    {errors.username}
                  </p>
                )}
              </div>
              <div className="w-full">
                <label className="font-thin text-xl text-white/40">
                  Password
                </label>
                <div className="relative flex w-full ">
                  <input
                    className="border-b-gray-600/60 text-white/40 border-b-2 w-full py-1  focus:outline-none focus:ring-0 focus:border-b-white/20 focus:border-b-2"
                    id="password"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute text-white/40 self-center right-3 text-xl hover:text-gray-400"
                  >
                    {showPwd ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
                {errors.password && (
                  <p className="font-thin text-red-700 text-sm">
                    {errors.password}
                  </p>
                )}
              </div>
              {isLoginLoading ? (
                <Loader />
              ) : (
                <button
                  className="self-center bg-green-500/40 text-2xl px-10 rounded-2xl border-2 mt-5 border-white/60 text-white shadow-lg py-2 hover:cursor-pointer hover:bg-green-400/40 hover:-translate-y-0.5 transition-all duration-150"
                  type="submit"
                >
                  Log In
                </button>
              )}
            </form>
          </div>
          <p className="font-thin text-white/60 text-lg mt-20 xl:mt-5">
            No account yet?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="hover:cursor-pointer hover:underline"
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
