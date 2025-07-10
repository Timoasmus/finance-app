import { useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import api from "../api";
import Swal from "sweetalert2";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { GiMoneyStack } from "react-icons/gi";
import { useCurrentScreen } from "../contexts/CurrentScreenContext";
import { useMonth } from "../contexts/MonthContext";

function NavBar() {
  const navigate = useNavigate();

  const { currentScreen, setCurrentScreen } = useCurrentScreen();
  const { plan, setAuthenticated } = useAuth();
  const { month, setMonth } = useMonth();

  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();
  let months = [];
  for (let i = 0; i <= currentMonthIdx; i++) {
    const isSelectable = plan !== "free" || i === currentMonthIdx;
    months.push({
      index: i,
      name: new Date(2025, i).toLocaleString("en-US", { month: "short" }),
      selectable: isSelectable,
    });
  }

  const logout = () => {
    Swal.fire({
      title: `Logout?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
      confirmButtonColor: "blue",
    }).then((res) => {
      if (res.isConfirmed) {
        setAuthenticated(false)
        navigate("/login");
        api
          .get("/auth/logout", { withCredentials: true })
          .catch((err) => alert(err));
      }
    });
  };

  return (
    <nav className="flex bg-white w-full fixed top-0 shadow py-3.5 justify-between items-center">
      <div className="flex items-center  md:space-x-10">
        <div
          onClick={() => {
            setCurrentScreen("dashboard");
            navigate("/");
          }}
          className="ml-5 space-x-2 flex items-center hover:cursor-pointer"
        >
          <GiMoneyStack className="size-10" />
          <h1 className=" font-bold text-2xl">Finance Tracker</h1>
        </div>
        <div className="flex items-center">
          <h2 className="font-semibold text-xl">
            {currentYear} -{" "}
            <select
              value={month ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setMonth(value === "" ? null : value);
              }}
            >
              <option
                disabled={plan === "free"}
                value={""}
                className="disabled:bg-gray-200"
              >
                --All--
              </option>
              {months.map((m) => (
                <option
                  disabled={!m.selectable}
                  key={m.name}
                  value={m.index}
                  className="disabled:bg-gray-200"
                >
                  {m.name}
                </option>
              ))}
            </select>
          </h2>
        </div>
      </div>
      <div className="md:mr-10 md:space-x-5 space-x-2 flex items-center">
        <a
          onClick={() => {
            setCurrentScreen("dashboard");
            navigate("/");
          }}
          className={`hover:underline font-semibold text-lg hover:cursor-pointer ${
            currentScreen === "dashboard" && "underline"
          }`}
        >
          Dashboard
        </a>
        <a
          onClick={() => {
            setCurrentScreen("new");
            navigate("/overview");
          }}
          className={`hover:underline font-semibold text-lg hover:cursor-pointer ${
            currentScreen === "new" && "underline"
          }`}
        >
          Overview
        </a>
        <a
          onClick={() => {
            setCurrentScreen("plans");
            navigate("/plans");
          }}
          className={`hover:underline font-semibold text-lg hover:cursor-pointer ${
            currentScreen === "plans" && "underline"
          }`}
        >
          Plans
        </a>
        <button
          onClick={logout}
          className="hover:text-gray-400  transition-colors duration-100 text-3xl hover:cursor-pointer"
        >
          <IoLogOutOutline />
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
