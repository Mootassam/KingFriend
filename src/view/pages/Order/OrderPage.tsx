import { Activity } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import demoActions from "src/modules/demo/demoActions";
import demoSelectors, { useDemoStats } from "src/modules/demo/demoSelectors";
import type { AppDispatch } from "src/modules/store";
import { money } from "src/shared/Amount";
import SwitchTab from "src/view/shared/SwitchTab";
import PositionsTable, { OrderMode } from "src/view/pages/Order/PositionsTable";

const tabs: readonly OrderMode[] = ["Positions", "Pending", "History"];

export default function OrderPage() {
  const dispatch = useDispatch<AppDispatch>();
  const demo = useSelector(demoSelectors.selectRaw);
  const stats = useDemoStats();
  const [tab, setTab] = useState<OrderMode>("Positions");
  const items = tab === "Positions" ? demo.positions : tab === "Pending" ? demo.pending : demo.history;

  return (
    <div className="orders-page">
      <div className="orders-banner">
        <h1>Orders</h1>
        <SwitchTab
          items={tabs}
          value={tab}
          onChange={setTab}
          className="order-tabs"
          badges={{ Positions: demo.positions.length }}
        />
        <span className="positions-count">{demo.positions.length} open positions</span>
      </div>
      <div className={"floating-card " + (stats.floating >= 0 ? "profit" : "loss")}>
        <span className="floating-icon">
          <Activity />
        </span>
        <div>
          <small>FLOATING P&amp;L</small>
          <p>{demo.positions.length} positions open</p>
        </div>
        <div className="right">
          <strong className="numeric">{money(stats.floating)}</strong>
          <b>{((stats.floating / demo.balance) * 100).toFixed(2)}%</b>
        </div>
      </div>
      <div className="table-toolbar">
        <span>
          Open: <b>{demo.positions.length}</b> &nbsp; Floating P&amp;L:{" "}
          <b className={stats.floating >= 0 ? "positive" : "negative"}>{money(stats.floating)}</b>
        </span>
        <button onClick={() => dispatch(demoActions.doTick())}>Refresh</button>
      </div>
      <PositionsTable items={items} mode={tab} />
    </div>
  );
}
