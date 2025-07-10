import { useEffect, useState } from "react";
import api from "../../api";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import dayjs from "dayjs";
import { MdCancel } from "react-icons/md";
import Swal from "sweetalert2";
import { useWidgets } from "../../contexts/WidgetsContext";
import { useMonth } from "../../contexts/MonthContext";
import { useAuth } from "../../contexts/AuthContext";

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [currentType, setCurrentType] = useState("all");

  const { month } = useMonth();
  const {authenticated} = useAuth()
  const { handleRemove } = useWidgets();

  useEffect(() => {
    if (authenticated) {
      fetchTransactions();
    }
  }, [month]);

  const fetchTransactions = () => {
    api
      .get("/api/transactions/", {
        params: { month: month ? parseInt(month) + 1 : null },
        withCredentials: true,
      })
      .then((res) => setTransactions(res.data))
      .catch((err) => alert(err));
  };

  return (
    <div className="h-5/12  flex flex-col bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
      <div className="border-b-gray-200 border-b-2 py-2 px-4 flex justify-between items-center">
        <h1 className="font-semibold text-lg">Transactions</h1>
        <div className="space-x-3 font-semibold flex items-center">
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
          <button onClick={() => handleRemove("history")}>
            <MdCancel />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto overflow-x-clip ">
        <table className="w-full border-collapse">
          {transactions
            .filter((t) => currentType === "all" || t.type === currentType)
            .map((t) => (
              <tr className="text-base" key={t.id}>
                <td
                  className={`p-2 border-gray-300 border-r border-b ${
                    t.type === "expense" ? "bg-blue-400/40" : "bg-green-400/40"
                  }`}
                >
                  {t.type === "expense" ? <FaMinus /> : <FaPlus />}
                </td>
                <td
                  className={`p-2 border-gray-300 border-b whitespace-nowrap ${
                    t.type === "expense" ? "bg-blue-300/20" : "bg-green-300/20"
                  }`}
                >
                  ${t.amount}
                </td>
                <td
                  className={`p-2 border-gray-300 border-b whitespace-nowrap ${
                    t.type === "expense" ? "bg-blue-400/20" : "bg-green-400/20"
                  }`}
                >
                  {t.category}
                </td>
                <td
                  className={`p-2 border-gray-300 border-b whitespace-nowrap ${
                    t.type === "expense" ? "bg-blue-300/20" : "bg-green-300/20"
                  }`}
                >
                  {t.description}
                </td>
                <td
                  className={`p-2 border-gray-300 border-b whitespace-nowrap ${
                    t.type === "expense" ? "bg-blue-400/20" : "bg-green-400/20"
                  }`}
                >
                  {dayjs(t.date).format("DD-MM")}
                </td>
              </tr>
            ))}
        </table>
      </div>
    </div>
  );
}

export default TransactionHistory;
