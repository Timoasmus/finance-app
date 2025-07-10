import { useWidgets, widgetsMap } from "../../contexts/WidgetsContext";
import EmptyWidget from "../widgets/EmptyWidget";
import { useAuth } from "../../contexts/AuthContext";
import InvalidWidget from "../widgets/InvalidWidget";

function DashBoard() {
  const { widgets } = useWidgets();
  const { plan } = useAuth();

 
  if (!widgets) {
    return;
  }
   console.log(`WIDGETS: ${widgets}`)

  return (
    <div className="justify-center mt-12 rounded-3xl p-10 overflow-hidden grid grid-cols-1 md:grid-cols-3 md:overflow-y-hidden overflow-y-auto gap-10 bg-white shadow-xl w-[85vw] h-[85vh]">
      <div className="h-[85vh] space-y-10">
        {widgetsMap[widgets.tl] ?? <EmptyWidget loc={"tl"} />}
        {widgetsMap[widgets.bl] ?? <EmptyWidget loc={"bl"} />}
      </div>
      {plan === "premium" ? (
        <div className="h-[85vh] space-y-10">
          {widgetsMap[widgets.tm] ?? <EmptyWidget loc={"tm"} />}
          {widgetsMap[widgets.bm] ?? <EmptyWidget loc={"bm"} />}
        </div>
      ) : (
        <div className="h-[85vh] space-y-10">
          <InvalidWidget/>
          <InvalidWidget/>
        </div>
      )}
      {plan === "premium" ? (
        <div className="h-[85vh] space-y-10">
          {widgetsMap[widgets.tr] ?? <EmptyWidget loc={"tr"} />}
          {widgetsMap[widgets.br] ?? <EmptyWidget loc={"br"} />}
        </div>
      ) : (
        <div className="h-[85vh] space-y-10">
          <InvalidWidget/>
          <InvalidWidget/>
        </div>
      )}
    </div>
  );
}

export default DashBoard;
