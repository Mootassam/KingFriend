export type Category = "Forex" | "Crypto" | "Stocks" | "Commodities";
export type Side = "BUY" | "SELL";

export interface Quote {
  symbol: string;
  name: string;
  category: Category;
  price: number;
  change: number;
  precision: number;
  contract: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: Side;
  lots: number;
  open: number;
  margin: number;
  fee: number;
  stop?: number;
  take?: number;
  closed?: number;
  pnl?: number;
}

export interface DemoState {
  version: 1;
  name: string;
  balance: number;
  selectedSymbol: string;
  marketQuotes: Quote[];
  tick: number;
  pending: Position[];
  history: Position[];
  positions: Position[];
}

const rows: [string, string, Category, number, number, number, number][] = [
  ["EURUSD", "Euro / US Dollar", "Forex", 1.08456, 0.42, 5, 1e5],
  ["GBPUSD", "British Pound / US Dollar", "Forex", 1.27382, 0.68, 5, 1e5],
  ["USDJPY", "US Dollar / Japanese Yen", "Forex", 149.624, -0.31, 3, 670],
  ["AUDUSD", "Australian Dollar / US Dollar", "Forex", 0.65842, 0.24, 5, 1e5],
  ["AUDJPY", "Australian Dollar / Japanese Yen", "Forex", 98.519, 1.12, 3, 670],
  ["AUDCAD", "Australian Dollar / Canadian Dollar", "Forex", 0.89564, -0.23, 5, 74e3],
  ["EURJPY", "Euro / Japanese Yen", "Forex", 162.28, 0.83, 3, 670],
  ["AUDNZD", "Australian Dollar / New Zealand Dollar", "Forex", 1.08632, -0.17, 5, 61e3],
  ["AUDCHF", "Australian Dollar / Swiss Franc", "Forex", 0.57831, -0.44, 5, 112e3],
  ["BTCUSD", "Bitcoin / US Dollar", "Crypto", 63971.14, -2.61, 2, 1],
  ["ETHUSD", "Ethereum / US Dollar", "Crypto", 3458.72, -1.84, 2, 1],
  ["SOLUSD", "Solana / US Dollar", "Crypto", 146.83, 3.24, 2, 1],
  ["XAUUSD", "Gold / US Dollar", "Commodities", 2342.68, 1.38, 2, 100],
  ["USOIL", "WTI Crude Oil", "Commodities", 78.42, -1.27, 2, 100],
  ["MSFT", "Microsoft Corporation", "Stocks", 425.52, 0.92, 2, 1],
  ["AAPL", "Apple Inc.", "Stocks", 213.07, -0.68, 2, 1],
  ["NVDA", "NVIDIA Corporation", "Stocks", 124.58, 2.76, 2, 1],
];

export const quotes: Quote[] = rows.map(
  ([symbol, name, category, price, change, precision, contract]) => ({
    symbol,
    name,
    category,
    price,
    change,
    precision,
    contract,
  }),
);

export const categories = ["All", "Forex", "Crypto", "Stocks", "Commodities"] as const;
export type CategoryFilter = (typeof categories)[number];

// Display order used by the trade terminal's market watch.
export const watchOrder = [
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "XAUUSD", "USOIL", "BTCUSD", "ETHUSD", "SOLUSD",
  "MSFT", "AAPL", "NVDA", "AUDJPY", "AUDCAD", "EURJPY", "AUDNZD", "AUDCHF",
];

export const timeframes = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"] as const;
export type Timeframe = (typeof timeframes)[number];
export const timeframeSeconds: Record<Timeframe, number> = {
  M1: 60, M5: 300, M15: 900, M30: 1800, H1: 3600, H4: 14400, D1: 86400,
};

export const leverages = [1, 10, 20, 50, 100];

export const demoAccount = {
  email: "demo@kingfriend.local",
  password: "kingfriend-demo",
  uid: "NX10426507",
};

export const seedPositions: Position[] = [
  { id: "NX-80421", symbol: "BTCUSD", side: "BUY", lots: 0.1, open: 65240, margin: 652.4, fee: 0 },
  { id: "NX-80422", symbol: "EURUSD", side: "BUY", lots: 0.1, open: 1.0912, margin: 109.12, fee: 0 },
  { id: "NX-80423", symbol: "XAUUSD", side: "SELL", lots: 0.05, open: 2333.7, margin: 116.69, fee: 0 },
  { id: "NX-80424", symbol: "ETHUSD", side: "SELL", lots: 1, open: 3458.72, margin: 345.872, fee: 0 },
  { id: "NX-80425", symbol: "NVDA", side: "BUY", lots: 10, open: 124.58, margin: 1245.8, fee: 0 },
  { id: "NX-80426", symbol: "MSFT", side: "BUY", lots: 8, open: 425.52, margin: 3404.16, fee: 0 },
  { id: "NX-80427", symbol: "GBPUSD", side: "BUY", lots: 0.1, open: 1.27382, margin: 127.382, fee: 0 },
  { id: "NX-80428", symbol: "USOIL", side: "SELL", lots: 1, open: 78.42, margin: 784.2, fee: 0 },
];
