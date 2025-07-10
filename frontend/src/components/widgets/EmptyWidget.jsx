import { IoAdd } from "react-icons/io5";
import { useWidgets } from "../../contexts/WidgetsContext";

function EmptyWidget({loc}) {
  const {setIsChoosing} = useWidgets();

  return (
    <div onClick={() => setIsChoosing(loc)} className="h-5/12 text-7xl text-gray-400/60 flex justify-center items-center bg-green-200/40 rounded-xl overflow-hidden border-2 border-green-300/40 shadow-md hover:bg-green-300/40">
       <IoAdd />
    </div>
  );
}

export default EmptyWidget