import { ListOrdered, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import demoActions from "src/modules/demo/demoActions";
import { pnl } from "src/modules/demo/demoEngine";
import type { Position } from "src/modules/demo/demoEnumerators";
import demoSelectors from "src/modules/demo/demoSelectors";
import { money, price } from "src/shared/Amount";
import EmptyState from "src/view/shared/EmptyState";

export type OrderMode = "Positions" | "Pending" | "History";

export default function PositionsTable({ items, mode }: { items: Position[]; mode: OrderMode }) {
  const dispatch = useDispatch();
  const quotes = useSelector(demoSelectors.selectQuotes);

  if (!items.length) {
    return (
      <EmptyState
        icon={<ListOrdered />}
        heading={"No " + mode.toLowerCase()}
        description={
          mode === "History"
            ? "Closed demo positions will appear here."
            : "Place a simulated order in the Trade terminal."
        }
      />
    );
  }

  const headings = ["Symbol", "Direction", "Lots", "Open Price", mode === "History" ? "Close Price" : "Current", "Margin", "P&L", "Action"];

  return (
    <div className="table-scroll">
      <table className="positions-table">
        <thead>
          <tr>
            {headings.map((heading) => (
              <th key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const quote = quotes.find((q) => q.symbol === item.symbol)!;
            const value = mode === "History" ? item.pnl ?? 0 : pnl(item, quotes);
            return (
              <tr key={item.id}>
                <td>
                  <b>{item.symbol}</b>
                </td>
                <td>
                  <span className={"direction " + (item.side === "BUY" ? "buy" : "sell")}>{item.side}</span>
                </td>
                <td className="numeric">{item.lots.toFixed(2)}</td>
                <td className="numeric">{price(quote, item.open)}</td>
                <td className="numeric">{price(quote, item.closed ?? quote.price)}</td>
                <td className="numeric">{money(item.margin)}</td>
                <td className={"numeric " + (value >= 0 ? "positive" : "negative")}>
                  {mode === "Pending" ? "—" : money(value)}
                </td>
                <td>
                  {mode === "History" ? (
                    <span className="text-muted">Closed</span>
                  ) : (
                    <button
                      className="text-muted close-position"
                      onClick={() =>
                        dispatch(
                          mode === "Pending"
                            ? demoActions.doCancelPending(item.id)
                            : demoActions.doClosePosition(item.id),
                        )
                      }
                    >
                      <X size={15} />
                      {mode === "Pending" ? "Cancel" : "Close"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
