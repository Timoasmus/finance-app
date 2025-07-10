import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import api from "../../api";
import { useEffect, useState } from "react";
import { MdCancel } from "react-icons/md";
import { useWidgets } from "../../contexts/WidgetsContext";
import { useMonth } from "../../contexts/MonthContext";
import { useAuth } from "../../contexts/AuthContext";

function PieCharts() {
  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [currentType, setCurrentType] = useState("income");

  const { month } = useMonth();
  const { handleRemove } = useWidgets();
  const {authenticated} = useAuth()

  useEffect(() => {
    if (authenticated) {
      fectchByCategory();
    }
  }, [month]);


  const COLORS = [
    "#00C49F",
    "#3B82F6",
    "#F97316",
    "#EF4444",
    "#A855F7",
    "#FACC15",
    "#64748B",
  ];

  const fectchByCategory = () => {
    api
      .get("/api/by_category/", {
        params: { month: month ? parseInt(month) + 1 : null },
        withCredentials: true,
      })
      .then((res) => {
        const newExpenseData = res.data
          .filter((el) => el.type === "expense")
          .map((el) => ({ name: el.category, value: el.total_amount }));
        const newIncomeData = res.data
          .filter((el) => el.type === "income")
          .map((el) => ({ name: el.category, value: el.total_amount }));
        setExpenseData(newExpenseData);
        setIncomeData(newIncomeData);
      });
  };

  return (
    <div className="h-5/12  flex flex-col bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
      <div className="border-b-gray-200 border-b-2 py-2 px-4 flex justify-between items-center">
        <h1 className="font-semibold text-lg">By category</h1>
        <div className="space-x-3 font-semibold flex items-center">
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
          <button onClick={() => handleRemove("piecharts")}>
            <MdCancel />
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center">
        <PieChart width={250} height={250}>
          <Pie
            data={currentType === "income" ? incomeData : expenseData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {incomeData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}

export default PieCharts;
