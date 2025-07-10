import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import WidgetPicker from "./WidgetPicker";
import { useWidgets } from "../contexts/WidgetsContext";
import { AnimatePresence } from "framer-motion";

function Layout() {
  const { isChoosing, setIsChoosing } = useWidgets();

  return (
    <div
      className="min-h-[100vh] flex justify-center items-center flex-col bg-gray-200"
    >
      <NavBar />
      <AnimatePresence>{isChoosing && <WidgetPicker />}</AnimatePresence>
      <div onClick={() => isChoosing && setIsChoosing(null)}>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
