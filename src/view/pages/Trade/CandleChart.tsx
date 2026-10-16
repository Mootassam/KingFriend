import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  LineStyle,
  UTCTimestamp,
  createChart,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import { Quote, Timeframe, quotes, timeframeSeconds } from "src/modules/demo/demoEnumerators";
import { useTheme } from "src/modules/theme/themeContext";

export interface Candle {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

const UP = "#21a66b";
const DOWN = "#ea393f";
const VOLUME_UP = "#174835";
const VOLUME_DOWN = "#51272e";

// Deterministic 100-candle history ending at the seed price, shifted to the current quote.
export function generateCandles(symbol: string, timeframe: Timeframe, current: number): Candle[] {
  const seed = quotes.find((q) => q.symbol === symbol)!.price;
  const seconds = timeframeSeconds[timeframe];
  const end = Math.floor(Date.now() / 1000 / seconds) * seconds;
  const volatility = 65e-5 * Math.sqrt(seconds / 60);
  const candles: Candle[] = [];
  let last = 0.994 * seed;

  for (let i = 0; i < 100; i++) {
    const open = last;
    const close =
      open + seed * (0.7 * Math.sin(1.8 * i + symbol.length) + 0.65 * Math.cos(0.19 * i) + 0.05) * volatility;
    candles.push({
      time: (end - (99 - i) * seconds) as UTCTimestamp,
      open,
      close,
      high: Math.max(open, close) + seed * volatility * (0.25 + Math.abs(Math.sin(2.13 * i))),
      low: Math.min(open, close) - seed * volatility * (0.2 + Math.abs(Math.cos(1.47 * i))),
    });
    last = close;
  }

  const shift = current - candles[99].close;
  return candles.map((c) => ({
    ...c,
    open: c.open + shift,
    high: c.high + shift,
    low: c.low + shift,
    close: c.close + shift,
  }));
}

const palette = (light: boolean) => ({
  layout: {
    background: { type: ColorType.Solid, color: light ? "#ffffff" : "#111621" },
    textColor: light ? "#52627b" : "#7e879a",
    panes: { separatorColor: light ? "#d7e0ec" : "#263044" },
  },
  grid: {
    vertLines: { color: light ? "#e4eaf2" : "#212a3a" },
    horzLines: { color: light ? "#e4eaf2" : "#212a3a" },
  },
  rightPriceScale: { borderColor: light ? "#d7e0ec" : "#263249" },
  timeScale: { borderColor: light ? "#d7e0ec" : "#263249" },
});

interface Props {
  quote: Quote;
  timeframe: Timeframe;
  onOhlc: (candle: Candle) => void;
}

export default function CandleChart({ quote, timeframe, onOhlc }: Props) {
  const { light } = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const candles = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volume = useRef<ISeriesApi<"Histogram"> | null>(null);
  const lastCandle = useRef<Candle | null>(null);
  const shown = useRef<number | null>(null);

  // Rebuild the chart whenever the instrument or timeframe changes.
  useEffect(() => {
    if (!container.current) return;
    const api = createChart(container.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#111621" },
        textColor: "#7e879a",
        fontFamily: "Courier New",
        fontSize: 12,
        attributionLogo: true,
        panes: { separatorColor: "#263044", separatorHoverColor: "#344058" },
      },
      grid: { vertLines: { color: "#212a3a" }, horzLines: { color: "#212a3a" } },
      rightPriceScale: {
        borderColor: "#263249",
        scaleMargins: { top: 0.08, bottom: 0.08 },
        minimumWidth: 86,
      },
      timeScale: { borderColor: "#263249", timeVisible: true, secondsVisible: false, barSpacing: 10 },
      crosshair: { vertLine: { color: "#8098bb" }, horzLine: { color: "#8098bb" } },
    });
    api.applyOptions(palette(light));

    const series = api.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderVisible: false,
      wickUpColor: UP,
      wickDownColor: DOWN,
      priceFormat: { type: "price", precision: quote.precision, minMove: 10 ** -quote.precision },
      priceLineColor: "#eeb900",
      priceLineStyle: LineStyle.Dashed,
    });
    const data = generateCandles(quote.symbol, timeframe, quote.price);
    series.setData(data);

    const bars = api.addSeries(
      HistogramSeries,
      { priceFormat: { type: "volume" }, priceScaleId: "volume", lastValueVisible: false, priceLineVisible: false },
      1,
    );
    bars.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0 }, visible: false });
    api.panes()[0].setStretchFactor(0.93);
    api.panes()[1].setStretchFactor(0.07);
    bars.setData(
      data.map((c, i) => ({
        time: c.time,
        value: 20 + 200 * Math.abs(Math.sin(8.72 * i)),
        color: c.close >= c.open ? VOLUME_UP : VOLUME_DOWN,
      })),
    );
    api.timeScale().setVisibleLogicalRange({ from: 40, to: 101 });

    chart.current = api;
    candles.current = series;
    volume.current = bars;
    lastCandle.current = data[data.length - 1];
    shown.current = null;

    return () => {
      chart.current = null;
      candles.current = null;
      volume.current = null;
      api.remove();
    };
    // The live price is applied by the effect below; rebuilding on every tick would reset zoom.
  }, [quote.symbol, quote.precision, timeframe]);

  useEffect(() => {
    chart.current?.applyOptions(palette(light));
  }, [light, quote.symbol, timeframe]);

  // Feed each tick into the latest candle, easing the close toward the new price.
  useEffect(() => {
    if (!candles.current || !lastCandle.current) return;
    const seconds = timeframeSeconds[timeframe];
    const bucket = Math.floor(Date.now() / 1000 / seconds) * seconds;
    let current = lastCandle.current;
    if (bucket > current.time) {
      current = { time: bucket as UTCTimestamp, open: current.close, high: current.close, low: current.close, close: current.close };
    }
    const target: Candle = {
      ...current,
      close: quote.price,
      high: Math.max(current.high, quote.price),
      low: Math.min(current.low, quote.price),
    };
    lastCandle.current = target;
    onOhlc(target);

    const from = shown.current ?? quote.price;
    const start = performance.now();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const step = (now: number) => {
      const t = reduced ? 1 : Math.min(1, (now - start) / 400);
      const close = from + (target.close - from) * (1 - Math.pow(1 - t, 3));
      shown.current = close;
      candles.current?.update({ ...target, close, high: Math.max(target.high, close), low: Math.min(target.low, close) });
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    volume.current?.update({
      time: target.time,
      value: 20 + 2e5 * Math.abs((target.close - target.open) / quote.price),
      color: target.close >= target.open ? VOLUME_UP : VOLUME_DOWN,
    });
    return () => cancelAnimationFrame(frame);
  }, [quote.price, quote.symbol, timeframe, onOhlc]);

  return (
    <div ref={container} className="candle-chart" aria-label={`Interactive simulated ${quote.symbol} candlestick chart`} />
  );
}
