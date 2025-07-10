import { useEffect, useState } from "react";
import api from "../../api";
import Swal from "sweetalert2";
import { MdCancel } from "react-icons/md";
import { useWidgets } from "../../contexts/WidgetsContext";
import { useMonth } from "../../contexts/MonthContext";
import { useAuth } from "../../contexts/AuthContext";

function Budget() {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [budget, setBudget] = useState(0);

  const { month } = useMonth();
  const {authenticated} = useAuth()

  useEffect(() => {
    if (authenticated) {
      fetchTotalExpenses();
    }
  }, [month]);

  const { handleRemove } = useWidgets();

  const fetchTotalExpenses = () => {
    api
      .get("/api/total_expense/", {
        params: { month: month ? parseInt(month) + 1 : null },
        withCredentials: true,
      })
      .then((res) => {
        const budget = res.data.budget
        setBudget(() => month ? budget : budget * 12);
        setTotalExpenses(res.data.expenses);
      })
      .catch((err) => alert(err));
  };

  const changeBudget = () => {
    Swal.fire({
      title: "Change budget",
      input: "number",
      inputLabel: "Enter new budget",
      inputValue: budget,
      inputAttributes: {
        min: "0",
        max: "10000",
        step: "10",
      },
      showCancelButton: true,
      confirmButtonText: "Save",
    }).then((res) => {
      if (res.isConfirmed) {
        api
          .put(
            "api/budget",
            { new_budget: res.value },
            { withCredentials: true }
          )
          .then(() => {
            fetchTotalExpenses();
          })
          .catch((err) => alert(err));
      }
    });
  };

  const getColor = (percentage) => {
    let r, g, b;
    if (percentage < 50) {
      r = 0 + percentage;
      g = 255 - percentage * 1.5;
      b = 0;
    } else {
      r = percentage * 2.55;
      g = 255 - percentage * 1.55;
      b = 0;
    }

    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  };

  const percentage = (totalExpenses / budget) * 100;
  const radius = 100;
  const strokeWidth = 15;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="h-5/12 bottom-0 flex flex-col bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md ">
      <div className="border-b-gray-200 border-b-2 py-2 px-4 flex justify-between items-center">
        <h1 className="font-semibold text-lg">Budget</h1>
        <div className="space-x-3 font-semibold flex items-center">
          <a
            onClick={changeBudget}
            className="hover:underline hover:cursor-pointer"
          >
            Edit
          </a>
          <button onClick={() => handleRemove("budget")}>
            <MdCancel />
          </button>
        </div>
      </div>
      <div className="flex h-full items-center justify-center relative ">
        <svg className="w-full h-full  flex justify-center items-center">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            className="text-gray-300"
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset >= 0 ? offset : 0}
            style={{
              color: getColor(percentage),
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center space-y-2 justify-center">
          <h1 className="text-2xl">{Math.round(percentage * 100) / 100}%</h1>
          <h2 className="font-thin text-lg">
            {totalExpenses} / {budget}
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Budget;
