import { CircleCheck, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import demoActions from "src/modules/demo/demoActions";
import { orderCost } from "src/modules/demo/demoEngine";
import { Quote, Side, leverages } from "src/modules/demo/demoEnumerators";
import demoSelectors from "src/modules/demo/demoSelectors";
import type { AppDispatch } from "src/modules/store";
import { money } from "src/shared/Amount";
import EmptyState from "src/view/shared/EmptyState";
import SwitchTab from "src/view/shared/SwitchTab";
import Modal from "src/view/shared/modals/Modal";

const productTabs = ["Spot", "Futures"] as const;
const ticketTabs = ["Market Price", "Pending Orders"] as const;

export default function OrderTicket({ quote }: { quote: Quote }) {
  const dispatch = useDispatch<AppDispatch>();
  const balance = useSelector(demoSelectors.selectBalance);
  const [product, setProduct] = useState<(typeof productTabs)[number]>("Spot");
  const [ticket, setTicket] = useState<(typeof ticketTabs)[number]>("Market Price");
  const [lotsInput, setLotsInput] = useState("0.01");
  const [leverage, setLeverage] = useState(100);
  const [stopOn, setStopOn] = useState(false);
  const [takeOn, setTakeOn] = useState(false);
  const [stop, setStop] = useState("");
  const [take, setTake] = useState("");
  const [limit, setLimit] = useState("");
  const [confirmSide, setConfirmSide] = useState<Side | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const pendingMode = ticket === "Pending Orders";
  const lots = Number(lotsInput);
  const entry = pendingMode ? Number(limit) : quote.price;
  const { margin, fee } = orderCost(quote, entry, lots, leverage);
  const valid = lots >= 0.01 && lots <= 100 && entry > 0;

  function confirm() {
    if (!confirmSide) return;
    try {
      dispatch(
        demoActions.doPlaceOrder({
          side: confirmSide,
          lots,
          leverage,
          limit: pendingMode ? Number(limit) : undefined,
          stop: stopOn ? Number(stop) : undefined,
          take: takeOn ? Number(take) : undefined,
        }),
      );
      setConfirmSide(null);
      setNotice(pendingMode ? "Demo limit order placed." : `Demo ${confirmSide.toLowerCase()} position opened.`);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <aside className="order-ticket">
      <SwitchTab items={productTabs} value={product} onChange={setProduct} className="segmented product-tabs" />
      {product === "Futures" ? (
        <EmptyState
          icon={<Plus />}
          heading="Demo futures coming soon"
          description="Explore simulated spot orders in the meantime."
        />
      ) : (
        <>
          <SwitchTab
            items={ticketTabs}
            value={ticket}
            onChange={(tab) => {
              setTicket(tab);
              setLimit(String(quote.price));
            }}
            className="segmented ticket-tabs"
          />
          <div className="ticket-content">
            <h2>{ticket}</h2>
            {pendingMode && (
              <label>
                Limit price
                <input
                  aria-label="Limit price"
                  type="number"
                  min="0"
                  step={10 ** -quote.precision}
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
                <small>Buy at or below this price; sell at or above.</small>
              </label>
            )}
            <label>
              Multiplier
              <select aria-label="Multiplier" value={leverage} onChange={(e) => setLeverage(+e.target.value)}>
                {leverages.map((value) => (
                  <option key={value} value={value}>
                    {value}×
                  </option>
                ))}
              </select>
            </label>
            <div className="risk-controls">
              <label>
                <span>
                  Set Loss{" "}
                  <input
                    type="checkbox"
                    role="switch"
                    checked={stopOn}
                    onChange={(e) => {
                      setStopOn(e.target.checked);
                      if (!stop) setStop((quote.price * 0.99).toFixed(quote.precision));
                    }}
                  />
                </span>
                <input
                  aria-label="Stop loss price"
                  type="number"
                  step="any"
                  disabled={!stopOn}
                  value={stop}
                  placeholder="0"
                  onChange={(e) => setStop(e.target.value)}
                />
              </label>
              <label>
                <span>
                  Take Profit{" "}
                  <input
                    type="checkbox"
                    role="switch"
                    checked={takeOn}
                    onChange={(e) => {
                      setTakeOn(e.target.checked);
                      if (!take) setTake((quote.price * 1.01).toFixed(quote.precision));
                    }}
                  />
                </span>
                <input
                  aria-label="Take profit price"
                  type="number"
                  step="any"
                  disabled={!takeOn}
                  value={take}
                  placeholder="0"
                  onChange={(e) => setTake(e.target.value)}
                />
              </label>
            </div>
            <label>
              Lots
              <div className="lot-control">
                <button
                  aria-label="Decrease lots"
                  disabled={lots <= 0.01}
                  onClick={() => setLotsInput(Math.max(0.01, lots - 0.01).toFixed(2))}
                >
                  <Minus size={18} />
                </button>
                <input
                  aria-label="Lots"
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={lotsInput}
                  onChange={(e) => setLotsInput(e.target.value)}
                />
                <button
                  aria-label="Increase lots"
                  onClick={() => setLotsInput(Math.min(100, lots + 0.01).toFixed(2))}
                >
                  <Plus size={18} />
                </button>
              </div>
            </label>
            <div className="order-summary">
              <div>
                <span>Each Lot</span>
                <b>{quote.contract.toLocaleString()} units</b>
              </div>
              <div>
                <span>Estimated Handling Fee</span>
                <b className="numeric">{money(fee || 0)}</b>
              </div>
              <div>
                <span>Estimated Margin</span>
                <b className="numeric">{money(margin || 0)}</b>
              </div>
              <div>
                <span>Balance</span>
                <b className="numeric">{money(balance)}</b>
              </div>
            </div>
            {notice && (
              <p role="status" className="positive ticket-notice">
                <CircleCheck size={16} />
                {notice}
              </p>
            )}
            <small className="simulation-note">Simulated execution · Virtual funds only</small>
          </div>
          <div className="trade-buttons">
            {(["BUY", "SELL"] as Side[]).map((side) => (
              <button
                key={side}
                className={side === "BUY" ? "buy-button" : "sell-button"}
                disabled={!valid}
                onClick={() => {
                  setError("");
                  setConfirmSide(side);
                }}
              >
                {side === "BUY" ? "Buy" : "Sell"}
              </button>
            ))}
          </div>
        </>
      )}

      {confirmSide && (
        <Modal title={"Confirm demo " + confirmSide.toLowerCase()} onClose={() => setConfirmSide(null)}>
          <p>This is a simulated order using virtual funds.</p>
          <div className="confirmation">
            <b>{quote.symbol}</b>
            <span>
              {confirmSide} · {lots.toFixed(2)} lots
            </span>
            <span>Estimated margin: {money(margin)}</span>
            <span>Handling fee: {money(fee)}</span>
          </div>
          {error && (
            <p role="alert" className="negative">
              {error}
            </p>
          )}
          <button className={confirmSide === "BUY" ? "buy-button" : "sell-button"} onClick={confirm}>
            Confirm {confirmSide.toLowerCase()}
          </button>
        </Modal>
      )}
    </aside>
  );
}
