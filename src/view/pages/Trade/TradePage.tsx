import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import demoActions from "src/modules/demo/demoActions";
import { Timeframe, timeframes } from "src/modules/demo/demoEnumerators";
import demoSelectors from "src/modules/demo/demoSelectors";
import { price } from "src/shared/Amount";
import AnimatedPrice from "src/view/shared/AnimatedPrice";
import Change from "src/view/shared/Change";
import SwitchTab from "src/view/shared/SwitchTab";
import CandleChart, { Candle } from "src/view/pages/Trade/CandleChart";
import MarketWatch from "src/view/pages/Trade/MarketWatch";
import OrderTicket from "src/view/pages/Trade/OrderTicket";

const mobileTabs = ["Markets", "Chart", "Order"] as const;

export default function TradePage() {
  const dispatch = useDispatch();
  const symbol = new URLSearchParams(useLocation().search).get("symbol");
  const quote = useSelector(demoSelectors.selectSelectedQuote);
  const [timeframe, setTimeframe] = useState<Timeframe>("M1");
  const [mobileTab, setMobileTab] = useState<(typeof mobileTabs)[number]>("Chart");
  const [ohlc, setOhlc] = useState<Candle | null>(null);

  useEffect(() => {
    if (symbol) dispatch(demoActions.doSelectSymbol(symbol));
  }, [symbol, dispatch]);

  const spread = 2 * 10 ** -quote.precision;

  return (
    <div className={"terminal mobile-" + mobileTab.toLowerCase()}>
      <SwitchTab items={mobileTabs} value={mobileTab} onChange={setMobileTab} className="terminal-mobile-tabs" />
      <MarketWatch />
      <section className="chart-panel">
        <div className="chart-heading">
          <div className="instrument-line">
            <h1>{quote.symbol}</h1>
            <span className="asset-tag">{quote.category}</span>
            <b className="numeric">
              <AnimatedPrice quote={quote} />
            </b>
            <Change value={quote.change} />
            <div className="ohlc">
              <span>
                O <b>{price(quote, ohlc?.open ?? quote.price)}</b>
              </span>
              <span>
                H <b>{price(quote, ohlc?.high ?? quote.price)}</b>
              </span>
              <span>
                L <b>{price(quote, ohlc?.low ?? quote.price)}</b>
              </span>
              <span>
                C{" "}
                <b>
                  <AnimatedPrice quote={quote} />
                </b>
              </span>
            </div>
          </div>
          <SwitchTab items={timeframes} value={timeframe} onChange={setTimeframe} className="timeframes" />
        </div>
        <div className="bid-ask">
          <div>
            <small>BID</small>
            <b className="numeric negative">
              <AnimatedPrice quote={quote} value={quote.price - spread / 2} />
            </b>
          </div>
          <div>
            <small>ASK</small>
            <b className="numeric positive">
              <AnimatedPrice quote={quote} value={quote.price + spread / 2} />
            </b>
          </div>
          <div>
            <small>SPREAD</small>
            <b className="numeric">{spread.toFixed(quote.precision)}</b>
          </div>
          <small className="chart-hint">
            <span className="amber">{timeframe}</span> · Scroll/drag to zoom &amp; pan
          </small>
        </div>
        <CandleChart quote={quote} timeframe={timeframe} onOhlc={setOhlc} />
      </section>
      <OrderTicket key={quote.symbol} quote={quote} />
    </div>
  );
}
