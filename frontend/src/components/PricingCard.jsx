import { FaCheckCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function PricingCard({ name, description, features, price, currentPlan }) {
  const navigate = useNavigate();

  const { setAuthenticated, setPlan } = useAuth();

  const handleChange = () => {
    const plan = currentPlan === "premium" ? "free" : "premium";
    const title =
      currentPlan === "premium"
        ? "Are you sure you want to cancel?"
        : "Are you sure you want to buy premium for $10/month?";
    Swal.fire({
      title: title,
      input: "text",
      inputLabel: "Enter your password below:",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "No password included";
        }
      },
    }).then((res) => {
      if (res.isConfirmed) {
        api
          .put(
            "/auth/subscription",
            { password: res.value, plan: plan },
            { withCredentials: true }
          )
          .then((res) => {
            setAuthenticated(false);
            setPlan(plan);
            alert(res.data.message);
            navigate("/login");
          })
          .catch((err) => alert(err));
      }
    });
  };

  const isCurrentplan =
    (currentPlan === "premium" && name === "Premium plan") ||
    (currentPlan === "free" && name === "Free plan");

  return (
    <div
      className={`lg:mx-20 md:mx-10  ${
        name === "Premium plan"
          ? "bg-black/80 border-2 border-amber-200 text-white"
          : "bg-white/60 border-2 border-gray-200"
      } shadow-lg h-3/4 lg w-1/2 md:w-7/12 lg:w-1/3 rounded-xl flex flex-col items-start p-10 justify-between hover:-translate-y-1 transition-transform`}
    >
      <h1 className="text-2xl font-bold">{name}</h1>
      <h2 className="text-xl font-semibold">{description}</h2>
      <h1 className="text-2xl font-bold">${price}</h1>

      {features.map((f) => (
        <span key={f} className="flex space-x-2.5">
          <FaCheckCircle className="size-6" />
          <p className="md:text-lg text-sm ">{f}</p>
        </span>
      ))}

      {!isCurrentplan && name === "Premium plan" && (
        <button
          onClick={handleChange}
          className={`${
            name === "Premium plan"
              ? "bg-white text-black hover:bg-white/60 active:bg-white border-2 border-amber-200"
              : "bg-black text-white hover:bg-black/40 active:bg-black"
          } rounded-4xl self-center px-3 py-2 font-semibold mt-1.5 hover:cursor-pointer  transition-colors duration-200`}
        >
          Subscribe now
        </button>
      )}
      {isCurrentplan && (
        <div className="self-center flex flex-col ">
          <p className="md:text-xl text-sm font-thin ">Current plan</p>

          {name === "Premium plan" && (
            <button
              onClick={handleChange}
              className="md:text-md text-sm font-extralight hover:underline hover:cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PricingCard;
