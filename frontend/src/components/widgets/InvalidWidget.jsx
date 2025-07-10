import { FaLock } from "react-icons/fa";
import {useNavigate} from 'react-router-dom'
import { useCurrentScreen } from "../../contexts/CurrentScreenContext";

function InvalidWidget() {

    const navigate = useNavigate();

    const {setCurrentScreen} = useCurrentScreen()

    return (<div className="h-5/12  flex flex-col bg-gray-200 rounded-xl overflow-hidden justify-center items-center space-y-3 shadow-md">
        <div className="text-5xl text-gray-600/40">
        <FaLock/>
        </div>
            <h2 className="text-lg font-thin text-gray-600/40">Upgrade to premium to unlock all widget slots</h2>
        <button onClick={() => {
            setCurrentScreen("plans")
            navigate("/plans")}} className="bg-green-300/80 rounded-lg px-3 py-1.5 text-white font-semibold text-xl hover:-translate-y-0.5 hover:cursor-pointer hover:bg-green-300/40 transition-all duration-100">Upgrade</button>
    </div>)
}

export default InvalidWidget