import { useState, useEffect } from "react";
import api from "../../api";
import NewTransaction from "../NewTransaction";
import { IoMdAddCircle } from "react-icons/io";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { useMonth } from "../../contexts/MonthContext";

function Overview() {
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    date: "",
    description: "",
    category: "",
  });
  const [currentMode, setCurrentMode] = useState("expense");

  const {month} = useMonth()

  useEffect(() => {
    fetchTransactions();
  }, [month]);

  const select = (id, isSelected) => {
    if (isSelected) {
      setSelected((prev) => prev.filter((el) => el !== id));
    } else {
      setSelected((prev) => [...prev, id]);
    }
  };

  const handleDelete = () => {
    Swal.fire({
      title: `Permanently delete ${selected.length} files?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "red",
    }).then((res) => {
      if (res.isConfirmed) {
        api
          .delete("/api/transactions", {
            data: selected,
            withCredentials: true,
          })
          .then((res) => {
            fetchTransactions();
            alert(res.data.message);
          })
          .catch((err) => alert(err))
          .finally(() => setSelected([]));
      }
    });
  };

  const setEdit = () => {
    const t = transactions.find((t) => t.id === selected[0]);
    console.log(t)
    setForm({
      amount: t.amount,
      date: t.date,
      description: t.description,
      category: t.category,
    });
    setCurrentMode(t.type)
    setIsEditing(selected[0])
  };

  const fetchTransactions = () => {
    api
      .get("/api/transactions/", {params:{month: month ? parseInt(month) + 1 : null}, withCredentials: true })
      .then((res) => setTransactions(res.data))
      .catch((err) => alert(err));
  };
  return (
    <div className="mt-12 rounded-3xl items-center overflow-hidden relative justify-center flex flex-col bg-white shadow-xl w-[85vw] h-[85vh]">
      <div className="m-5 absolute top-0 right-0 flex space-x-7  items-center">
        <button
        onClick={setEdit}
          disabled={selected.length !== 1}
          className={`rounded-xl text-lg text-white  bg-purple-200 px-2 py-0.5 border-2 border-purple-300 hover:bg-purple-300 hover:cursor-pointer transition-colors duration-100 disabled:bg-purple-200/20 disabled:border-purple-300/20 disabled:cursor-not-allowed`}
        >
          edit
        </button>
        <button
          onClick={handleDelete}
          disabled={selected.length < 1}
          className={`rounded-xl text-lg text-white  bg-red-200 px-2 py-0.5 border-2 border-red-300 hover:bg-red-300 hover:cursor-pointer transition-colors duration-100 disabled:bg-red-200/20 disabled:border-red-300/20 disabled:cursor-not-allowed`}
        >
          delete
        </button>
        <button
          onClick={() => setIsAdding(true)}
          type="submit"
          className=" text-5xl hover:cursor-pointer hover:-translate-y-0.5 transition-all "
        >
          <IoMdAddCircle />
        </button>
      </div>
      {(isAdding || isEditing) && (
        <NewTransaction
          fetchTransactions={fetchTransactions}
          setIsAdding={setIsAdding}
          form={form}
          setForm={setForm}
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          setSelected={setSelected}
        />
      )}
      <div className="overflow-y-auto relative h-full border border-gray-300 mt-20 w-11/12">
        <table className="table-fixed w-full">
          <thead>
            <tr className="sticky top-0 border-b-2 border-gray-300 z-10">
              <th className="bg-gray-200 p-2 text-left">Type</th>
              <th className=" bg-gray-200 p-2  text-left">Amount</th>
              <th className="bg-gray-200 p-2 text-left">Category</th>
              <th className="bg-gray-200 p-2 text-left">Description</th>
              <th className="bg-gray-200 p-2  text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const isExpense = t.type === "expense";
              const rowBg = isExpense ? "bg-blue-100/60" : "bg-green-100/60";
              const highlight = isExpense ? "bg-blue-100" : "bg-green-100";
              const isSelected = selected.includes(t.id);

              return (
                <tr
                  onClick={() => select(t.id, isSelected)}
                  className={`${!isSelected && rowBg} ${
                    isSelected && "bg-amber-200 "
                  } hover:cursor-pointer hover:opacity-60`}
                  key={t.id}
                >
                  <td className="p-2 border-gray-200 border">{t.type}</td>
                  <td
                    className={`p-2 border-gray-200 border ${
                      !isSelected && highlight
                    }`}
                  >
                    ${t.amount}
                  </td>
                  <td className="p-2 border-gray-200 border">{t.category}</td>
                  <td
                    className={`p-2 border-gray-200 border ${
                      !isSelected && highlight
                    }`}
                  >
                    {t.description}
                  </td>
                  <td className="p-2 border-gray-200 border">
                    {dayjs(t.date).format("YYYY-DD-MM")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Overview;
