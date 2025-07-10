import PricingCard from "../PricingCard";
import { useAuth } from "../../contexts/AuthContext";

function Plans() {

    const {plan} = useAuth()
    

  const plans = [
    {
      name: "Free plan",
      description: "Try out our app with limited functionality",
      features: [
        "Max 2 widgets",
        "Transition-history",
        "Histogram",
        "Transactiongraph",
      ],
      price: 0.0,
    },
    {
      name: "Premium plan",
      description: "Use our app with unlimited functionality",
      features: [
        "6 widgets",
        "Transition-history",
        "Histogram",
        "Transactiongraph",
        "Saldograph",
        "Budget",
        "Pie chart",
      ],
      price: 10.0,
    },
  ];
  return (
    <div className="justify-center  items-center mt-12 rounded-3xl p-10 overflow-hidden flex  bg-white shadow-xl w-[85vw] h-[85vh]">
      <div className="flex  h-full items-center justify-center flex-row">
      {plans.map((p) => (
        <PricingCard
        key={p.name}
          name={p.name}
          description={p.description}
          features={p.features}
          price={p.price}
          currentPlan={plan }
        />
      ))}
      </div>
    </div>
  );
}

export default Plans;
