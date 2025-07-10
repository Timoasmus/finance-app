import { useEffect, useState } from "react";
import api from "../../api";
import { useWidgets } from "../../contexts/WidgetsContext";
import { MdCancel } from "react-icons/md";
import { useMonth } from "../../contexts/MonthContext";
import { useAuth } from "../../contexts/AuthContext";

function HistoGram() {
  const [total, setTotal] = useState({
    income: 0,
    expense: 0,
    netto: 0,
  });
  const [largest, setLargest] = useState(null);

  const { handleRemove } = useWidgets();

  const { month } = useMonth();
  const {authenticated} = useAuth()
  
    useEffect(() => {
      if (authenticated) {
        fetchTotal();
      }
    }, [month]);

  const fetchTotal = () => {
    setTotal(
      {
    income: 0,
    expense: 0,
    netto: 0,
  }
    )
    api
      .get(`/api/total/`, {
        params: { month: month ? parseInt(month) + 1 : null },
        withCredentials: true,
      })
      .then((res) => {
        const totalIncome =
          res.data.find((el) => el.type === "income")?.total_amount ?? 0;
        const totalExpense =
          res.data.find((el) => el.type === "expense")?.total_amount ?? 0;
        const totalNetto = totalIncome - totalExpense;
        console.log(totalIncome, totalExpense, totalNetto);
        const largest = Math.max(totalIncome, totalExpense);
        setLargest(largest);
        setTotal({
          income: totalIncome,
          expense: totalExpense,
          netto: totalNetto,
        });
      })
      .catch((err) => alert(err));
  };

  return (
    <div className="h-5/12 bottom-0 flex flex-col bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md ">
      <div className="border-b-gray-200 border-b-2 py-2 px-4 flex justify-between items-center">
        <h1 className="font-semibold text-lg">Total</h1>
        <button onClick={() => handleRemove("histogram")}>
          <MdCancel />
        </button>
      </div>

      <div className=" h-full grid grid-cols-3 px-10 gap-x-10 items-end justify-evenly py-3">
        <div className=" flex flex-col items-center space-y-1.5">
          <h2 className="font-thin">${total.income}</h2>
          <div
            className="w-3/4 bg-green-300 rounded-sm transition-transform"
            style={{ height: (total.income / largest) * 200 }}
          ></div>
          <h2 className="font-semibold text-lg">Income</h2>
        </div>
        <div className=" flex flex-col items-center space-y-1.5">
          <h2 className="font-thin">${total.expense}</h2>
          <div
            className="w-3/4 bg-blue-300 rounded-sm"
            style={{ height: (total.expense / largest) * 200 }}
          ></div>
          <h2 className="font-semibold text-lg">Expense</h2>
        </div>
        <div className=" flex flex-col items-center space-y-1.5">
          <h2 className="font-thin">${total.netto}</h2>
          <div
            className={`w-3/4 rounded-sm ${
              total.netto < 0 ? "bg-red-400" : "bg-amber-400"
            }`}
            style={{ height: (Math.abs(total.netto) / largest) * 200 }}
          ></div>
          <h2 className="font-semibold text-lg">Netto</h2>
        </div>
      </div>
    </div>
  );
}

export default HistoGram;
