import { useContext, createContext, useState, useEffect } from "react";
import TransactionHistory from "../components/widgets/History";
import HistoGram from "../components/widgets/Histogram";
import PieCharts from "../components/widgets/PieCharts";
import TransactionGraph from "../components/widgets/TransactionGraph";
import SaldoGraph from "../components/widgets/SaldoGraph";
import Budget from "../components/widgets/Budget";
import api from "../api";
import Swal from "sweetalert2";
import { useAuth } from "./AuthContext";

const WidgetsContext = createContext();

export const widgetsMap = {
  history: <TransactionHistory />,
  histogram: <HistoGram />,
  piecharts: <PieCharts />,
  transactiongraph: <TransactionGraph />,
  saldograph: <SaldoGraph />,
  budget: <Budget/>
};

function WidgetsProvider({ children }) {
  const [widgets, setWidgets] = useState(null);
  const [isChoosing, setIsChoosing] = useState(null);

  const {authenticated, isLoading} = useAuth();

  useEffect(() => {
    if (!isLoading && authenticated) {
      fetchWidgets();
    }
  }, [isLoading, authenticated]);

  const fetchWidgets = () => {
    api
      .get("/widgets", { withCredentials: true })
      .then((res) => setWidgets(res.data))
      .catch((err) => alert(err));
  };

  const handleRemove = (widget) => {
    Swal.fire({
      title: `Remove ${widget} widget?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Remove",
      confirmButtonColor: "red",
    }).then((res) => {
      if (res.isConfirmed) {
        api
          .put(`/widgets/remove/${widget}`, {}, { withCredentials: true })
          .then(() => {
            fetchWidgets();
          })
          .catch((err) => alert(err));
      }
    });
  };

  const handleAdd = (widget, loc) => {
    setIsChoosing(null)
    api
      .put(`/widgets/add/${widget}/${loc}`, {}, { withCredentials: true })
      .then(() => {
        fetchWidgets();
      })
      .catch((err) => alert(err));
  };

  return (
    <WidgetsContext.Provider
      value={{ widgets, handleRemove, handleAdd, isChoosing, setIsChoosing }}
    >
      {children}
    </WidgetsContext.Provider>
  );
}

export default WidgetsProvider;

export function useWidgets() {
  return useContext(WidgetsContext);
}
