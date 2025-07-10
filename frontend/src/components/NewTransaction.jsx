import { useState } from "react";
import { IoMdAddCircle } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md";
import api from "../api";
import Loader from "../components/Loader";
import { MdModeEdit } from "react-icons/md";

function NewTransaction({
  setIsAdding,
  fetchTransactions,
  form,
  setForm,
  currentMode,
  setCurrentMode,
  isEditing,
  setIsEditing,
  setSelected
}) {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const categories = {
    income: ["salary", "bonus", "rental"],
    expense: [
      "food",
      "travel",
      "rent",
      "subscriptions",
      "entertainment",
      "health",
      "other",
    ],
  };

  const validateInput = () => {
    const newErrors = {};
    if (!form.amount || form.amount <= 0)
      newErrors.amount = "Please enter a valid amount";
    if (!form.date) newErrors.date = "Please enter a date";
    if (!form.description.trim())
      newErrors.description = "Please enter a description";
    if (!form.category) newErrors.category = "Please select a category";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateInput();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    api
      .post(
        `/api/transactions`,
        { ...form, type: currentMode },
        { withCredentials: true }
      )
      .then(() => {
        setForm({
          amount: "",
          date: "",
          description: "",
          category: "",
        });
        fetchTransactions();
      })
      .catch((err) => alert(err))
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const validationErrors = validateInput();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    api
      .put(
        `/api/transactions/${isEditing}`,
        { ...form, type: currentMode },
        { withCredentials: true }
      )
      .then((res) => {
        setForm({
          amount: "",
          date: "",
          description: "",
          category: "",
        });
        fetchTransactions();
        alert(res.data.message)
      })
      .catch((err) => alert(err))
      .finally(() => {
        setSelected([]);
        setIsEditing(null)
        setIsAdding(false);
        setIsLoading(false);
      });
  };

  return (
    <div className="bg-gray-100 py-2 md:px-15 px-0 w-full h-min absolute items-center overflow-x-auto top-0 border-b-2 border-gray-200">
      <form
        onSubmit={isEditing ? handleUpdate : handleSubmit}
        className="flex items-center justify-center w-full space-x-10"
      >
        <div className="flex flex-col items-center">
          <label className="font-semibold self-baseline">Type:</label>
          <select
            value={currentMode}
            onChange={(e) => {
              setForm({
                amount: "",
                date: "",
                description: "",
                category: "",
              });
              setErrors({});
              setCurrentMode(e.target.value);
            }}
            className="border-2 border-gray-200 rounded px-2 py-0.5 bg-white/60"
          >
            {Object.keys(categories).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-center">
          <label className="font-semibold self-baseline">Amount:</label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className={`border-2 ${
              errors.amount ? "border-red-400" : "border-gray-200"
            } rounded px-2 py-0.5 bg-white/60`}
          />
        </div>

        <div className="flex  flex-col items-center">
          <label className="font-semibold self-baseline">Date:</label>
          <input
          max={new Date().toISOString().split('T')[0]}
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={`border-2 ${
              errors.date ? "border-red-400" : "border-gray-200"
            } rounded px-2 py-0.5 bg-white/60`}
          />
        </div>

        <div className="flex flex-col items-center">
          <label className="font-semibold self-baseline">Description:</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`border-2 ${
              errors.description ? "border-red-400" : "border-gray-200"
            } rounded px-2 py-0.5 bg-white/60`}
          />
        </div>

        <div className="flex  flex-col items-center">
          <label className="font-semibold self-baseline">Category:</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={`border-2 ${
              errors.category ? "border-red-400" : "border-gray-200"
            } rounded px-2 py-0.5 bg-white/60`}
          >
            <option value="">--Please choose--</option>
            {categories[currentMode].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className=" items-center justify-evenly flex ml-10  w-full">
          {isLoading ? (
            <Loader />
          ) : (
            <button
              type="submit"
              className={`text-5xl hover:cursor-pointer hover:-translate-y-0.5 transition-all  ${
                currentMode === "expense" ? "text-blue-300" : "text-green-300"
              }`}
            >
              {isEditing ? <MdModeEdit /> : <IoMdAddCircle />}
            </button>
          )}
          <button
            onClick={() => {
              setForm({
                amount: "",
                date: "",
                description: "",
                category: "",
              });
              setIsAdding(false);
              setIsEditing(null);
            }}
            className="text-2xl hover:cursor-pointer hover:text-black/50 transition-colors duration-100"
            type="button"
          >
            <MdOutlineCancel />
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewTransaction;
