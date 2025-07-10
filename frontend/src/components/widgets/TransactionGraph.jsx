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

function TransactionGraph() {
  const [transactionData, setTransactionData] = useState([]);
  const [currentType, setCurrentType] = useState("all");

  const { handleRemove } = useWidgets();
  const { month } = useMonth();
  const { authenticated } = useAuth();

  useEffect(() => {
    if (authenticated) {
      fetchByDate();
    }
  }, [month]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
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
          text: "Date",
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
        label: "Income",
        data: transactionData
          .filter(
            (el) =>
              el.type === "income" &&
              (currentType === "income" || currentType === "all")
          )
          .map((el) => ({ x: el.date, y: el.total_amount })),
        borderColor: "rgb(134, 239, 172)",
        backgroundColor: "rgba(134, 239, 172, 0.5)",
        tension: 0.3,
      },
      {
        label: "Expense",
        data: transactionData
          .filter(
            (el) =>
              el.type === "expense" &&
              (currentType === "expense" || currentType === "all")
          )
          .map((el) => ({ x: el.date, y: el.total_amount })),
        borderColor: "rgb(96, 165, 250)",
        backgroundColor: "rgba(96, 165, 250, 0.5)",
        tension: 0.3,
      },
    ],
  };

  const fetchByDate = () => {
    api
      .get("/api/by_date/", {
        params: { month: month ? parseInt(month) + 1 : null },
        withCredentials: true,
      })
      .then((res) => {
        setTransactionData(res.data);
      })
      .catch((err) => alert(err));
  };

  return (
    <div className="h-5/12  flex flex-col bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
      <div className="border-b-gray-200 border-b-2 py-2 px-4 flex justify-between items-center">
        <h1 className="font-semibold text-lg">Graph</h1>
        <div className="space-x-3 font-semibold">
          <a
            className={`hover:underline hover:cursor-pointer ${
              currentType === "all" ? "underline" : ""
            }`}
            onClick={() => setCurrentType("all")}
          >
            All
          </a>
          <a
            className={`hover:underline hover:cursor-pointer ${
              currentType === "income" ? "underline" : ""
            }`}
            onClick={() => setCurrentType("income")}
          >
            Income
          </a>
          <a
            className={`hover:underline hover:cursor-pointer ${
              currentType === "expense" ? "underline" : ""
            }`}
            onClick={() => setCurrentType("expense")}
          >
            Expense
          </a>
          <button onClick={() => handleRemove("transactiongraph")}>
            <MdCancel />
          </button>
        </div>
      </div>
      <div className=" h-full flex items-center justify-center">
        <Line options={options} data={data} key={JSON.stringify(data)} />
      </div>
    </div>
  );
}

export default TransactionGraph;
