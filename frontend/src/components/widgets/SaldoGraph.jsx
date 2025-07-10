import { Line } from "react-chartjs-2";
import api from "../../api";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { MdCancel } from "react-icons/md";
import { useWidgets } from "../../contexts/WidgetsContext";
import { useMonth } from "../../contexts/MonthContext";
import { useAuth } from "../../contexts/AuthContext";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend
);

function SaldoGraph() {
  const [saldoData, setSaldoData] = useState(null);

  const { handleRemove } = useWidgets();
  const { month } = useMonth();
  const {authenticated} = useAuth();

  useEffect(() => {
    if (authenticated) {
      fetchSaldo();
    }
  }, [month]);

  const fetchSaldo = () => {
    api
      .get("/api/saldo/", {
        params: { month: month ? parseInt(month) + 1 : null },
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data);
        setSaldoData(res.data);
      })
      .catch((err) => alert(err));
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
        },
        title: {
          display: true,
          text: "Saldo",
        },
      },
      y: {
        title: {
          display: true,
          text: "$",
        },
      },
    },
  };

  const data = {
    datasets: [
      {
        label: "Saldo",
        data: saldoData,
        borderColor: "rgb(237, 211, 12)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="h-5/12  flex flex-col bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
      <div className="border-b-gray-200 border-b-2 py-2 px-4 flex justify-between items-center">
        <h1 className="font-semibold text-lg">Saldo</h1>
        <button onClick={() => handleRemove("saldograph")}>
          <MdCancel />
        </button>
      </div>
      <div className=" h-full flex items-center justify-center">
        <Line options={options} data={data} key={JSON.stringify(data)} />
      </div>
    </div>
  );
}

export default SaldoGraph;
