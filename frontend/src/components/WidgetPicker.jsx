import { RiListView } from "react-icons/ri";
import { GiHistogram } from "react-icons/gi";
import { BiSolidPieChartAlt2 } from "react-icons/bi";
import { BsGraphUp } from "react-icons/bs";
import { TbPigMoney } from "react-icons/tb";
import { useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { IoWallet } from "react-icons/io5";
import { useWidgets } from "../contexts/WidgetsContext";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCurrentScreen } from "../contexts/CurrentScreenContext";

const allWidgets = [
  { name: "history", icon: <RiListView />, premiumOnly: false },
  { name: "histogram", icon: <GiHistogram />, premiumOnly: false },
  { name: "transactiongraph", icon: <BsGraphUp />, premiumOnly: false },
  { name: "piecharts", icon: <BiSolidPieChartAlt2 />, premiumOnly: true },
  { name: "saldograph", icon: <TbPigMoney />, premiumOnly: true },
  { name: "budget", icon: <IoWallet />, premiumOnly: true },
];
function WidgetPicker() {
  const [selected, setSelected] = useState("");

  const { isChoosing, setIsChoosing, widgets, handleAdd } = useWidgets();

  const { plan } = useAuth();

  const {setCurrentScreen} = useCurrentScreen()

  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex bg-white justify-between w-full fixed top-0 shadow py-3.5 items-center px-10"
    >
      <div className="space-x-12 flex items-center overflow-x-auto">
        {allWidgets.map((w) => {
          const isLocked = plan === "free" && w.premiumOnly;
          const isSelectable =
            !Object.values(widgets).includes(w.name) && !isLocked;
          return (
            <div
              onClick={() => isSelectable && setSelected(w.name)}
              key={w.name}
              className={`flex flex-col relative justify-center items-center p-2 ${
                !isSelectable && " text-gray-200"
              } ${
                isSelectable &&
                "hover:-translate-y-1 hover:bg-green-200/60 transition-all duration-100"
              } ${
                isSelectable &&
                w.name === selected &&
                "bg-green-200 border-2 border-green-300"
              }`}
            >
              <div className="text-7xl">{w.icon}</div>
              <h2 className="font-semibold">{w.name}</h2>

              {isLocked && (
                <div className="absolute flex flex-col items-center justify-center space-y-1">
                  <div className="text-3xl text-gray-600/40">
                    <FaLock />
                  </div>
                  <button
                    onClick={() => {
                      setCurrentScreen("plans")
                      navigate("/plans");
                      setIsChoosing(null);
                    }}
                    className="bg-green-300/80 rounded-lg px-2 py-0.5 text-white font-semibold text-md hover:-translate-y-0.5 hover:cursor-pointer hover:bg-green-300 transition-all duration-100"
                  >
                    Upgrade
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="self-end space-x-8 flex items-center">
        <button
          onClick={() => handleAdd(selected, isChoosing)}
          disabled={!selected}
          className={`text-xl bg-blue-500/60 px-4 py-1.5 rounded-md text-white hover:-translate-y-0.5 hover:bg-blue-400/60 hover:cursor-pointer transition-all disabled:bg-blue-100 disabled:hover:-translate-0 disabled:hover:cursor-not-allowed`}
        >
          Add
        </button>
        <button
          onClick={() => setIsChoosing(null)}
          className="text-2xl hover:text-gray-400"
        >
          <MdOutlineCancel />
        </button>
      </div>
    </motion.div>
  );
}

export default WidgetPicker;
