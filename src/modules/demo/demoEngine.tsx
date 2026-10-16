import {
  CategoryFilter,
  DemoState,
  Position,
  Quote,
  Side,
  quotes,
  seedPositions,
} from "src/modules/demo/demoEnumerators";

export function initialState(): DemoState {
  return {
    version: 1,
    name: "Demo User",
    balance: 10238.15,
    selectedSymbol: "BTCUSD",
    marketQuotes: quotes.map((q) => ({ ...q })),
    tick: 0,
    pending: [],
    history: [],
    positions: seedPositions.map((p) => ({ ...p })),
  };
}

const findQuote = (list: Quote[], symbol: string) =>
  list.find((q) => q.symbol === symbol) as Quote;

export function pnl(position: Position, list: Quote[]) {
  const quote = findQuote(list, position.symbol);
  return (
    (quote.price - position.open) *
    position.lots *
    quote.contract *
    (position.side === "BUY" ? 1 : -1)
  );
}

export function metrics(state: DemoState) {
  const floating = state.positions.reduce((sum, p) => sum + pnl(p, state.marketQuotes), 0);
  const margin = state.positions.reduce((sum, p) => sum + p.margin, 0);
  return {
    floating,
    margin,
    equity: state.balance + floating,
    available: state.balance + floating - margin,
    today:
      floating -
      state.positions.reduce((sum, p) => sum + p.fee, 0) +
      state.history.reduce((sum, p) => sum + (p.pnl ?? 0) - p.fee, 0),
  };
}

export function closePosition(state: DemoState, id: string): DemoState {
  const position = state.positions.find((p) => p.id === id);
  if (!position) return state;
  const realized = pnl(position, state.marketQuotes);
  return {
    ...state,
    balance: state.balance + realized,
    positions: state.positions.filter((p) => p.id !== id),
    history: [
      { ...position, pnl: realized, closed: findQuote(state.marketQuotes, position.symbol).price },
      ...state.history,
    ],
  };
}

export function cancelPending(state: DemoState, id: string): DemoState {
  return { ...state, pending: state.pending.filter((p) => p.id !== id) };
}

// One simulated market step: move quotes, fill pending limits, trigger stop/take.
export function advance(state: DemoState): DemoState {
  const tick = state.tick + 1;
  let next: DemoState = {
    ...state,
    tick,
    marketQuotes: state.marketQuotes.map((q, i) => {
      const drift = 45e-6 * Math.sin(1.73 * tick + 2.31 * i);
      return { ...q, price: +(q.price * (1 + drift)).toFixed(q.precision), change: q.change + 100 * drift };
    }),
  };

  for (const order of next.pending) {
    const quote = findQuote(next.marketQuotes, order.symbol);
    const reached = order.side === "BUY" ? quote.price <= order.open : quote.price >= order.open;
    if (reached && metrics(next).available >= order.margin + order.fee) {
      next = {
        ...next,
        balance: next.balance - order.fee,
        pending: next.pending.filter((p) => p.id !== order.id),
        positions: [{ ...order, open: quote.price }, ...next.positions],
      };
    }
  }

  for (const position of next.positions) {
    const price = findQuote(next.marketQuotes, position.symbol).price;
    const stopHit =
      position.stop && (position.side === "BUY" ? price <= position.stop : price >= position.stop);
    const takeHit =
      position.take && (position.side === "BUY" ? price >= position.take : price <= position.take);
    if (stopHit || takeHit) next = closePosition(next, position.id);
  }

  return next;
}

export interface OrderRequest {
  side: Side;
  lots: number;
  leverage: number;
  limit?: number;
  stop?: number;
  take?: number;
}

export function orderCost(quote: Quote, entry: number, lots: number, leverage: number) {
  return {
    margin: (entry * lots * quote.contract) / leverage,
    fee: entry * lots * quote.contract * 2e-5,
  };
}

function newId() {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(16).slice(2) + Date.now().toString(16);
  return "NX-" + uuid.slice(0, 8);
}

// Throws with a user-facing message when the order is invalid.
export function createOrder(state: DemoState, request: OrderRequest): DemoState {
  const quote = findQuote(state.marketQuotes, state.selectedSymbol);
  const entry = request.limit ?? quote.price;
  const { margin, fee } = orderCost(quote, entry, request.lots, request.leverage);

  if (
    !Number.isFinite(request.lots) || request.lots < 0.01 || request.lots > 100 ||
    !Number.isFinite(entry) || entry <= 0 ||
    !Number.isFinite(request.leverage) || request.leverage < 1
  ) {
    throw new Error("Enter valid order values.");
  }
  if (margin + fee > metrics(state).available) {
    throw new Error("Insufficient virtual margin. Reduce the lot size.");
  }
  if (
    request.stop !== undefined &&
    (!Number.isFinite(request.stop) || request.stop <= 0 ||
      (request.side === "BUY" ? request.stop >= entry : request.stop <= entry))
  ) {
    throw new Error("Stop loss must be on the loss side of the entry price.");
  }
  if (
    request.take !== undefined &&
    (!Number.isFinite(request.take) || request.take <= 0 ||
      (request.side === "BUY" ? request.take <= entry : request.take >= entry))
  ) {
    throw new Error("Take profit must be on the profit side of the entry price.");
  }

  const order: Position = {
    id: newId(),
    symbol: quote.symbol,
    side: request.side,
    lots: request.lots,
    open: entry,
    margin,
    fee,
    stop: request.stop,
    take: request.take,
  };

  return request.limit
    ? { ...state, pending: [order, ...state.pending] }
    : { ...state, balance: state.balance - fee, positions: [order, ...state.positions] };
}

export function filterQuotes(list: Quote[], search: string, category: CategoryFilter) {
  const term = search.toLowerCase();
  return list.filter(
    (q) =>
      (category === "All" || q.category === category) &&
      (q.symbol + " " + q.name).toLowerCase().includes(term),
  );
}

// Validates persisted state; anything unexpected falls back to a fresh account.
export function restoreState(raw: string | null): DemoState {
  if (!raw) return initialState();
  try {
    const saved = JSON.parse(raw);
    const validPosition = (p: any) =>
      p &&
      typeof p.id === "string" &&
      quotes.some((q) => q.symbol === p.symbol) &&
      ["BUY", "SELL"].includes(p.side) &&
      [p.lots, p.open, p.margin, p.fee].every(Number.isFinite) &&
      p.lots > 0 && p.open > 0 && p.margin >= 0 && p.fee >= 0 &&
      [p.stop, p.take, p.closed, p.pnl].every((v) => v === undefined || Number.isFinite(v));

    const valid =
      saved.version === 1 &&
      typeof saved.name === "string" && saved.name.trim() &&
      Number.isFinite(saved.balance) &&
      Number.isInteger(saved.tick) && saved.tick >= 0 &&
      quotes.some((q) => q.symbol === saved.selectedSymbol) &&
      [saved.positions, saved.pending, saved.history].every(
        (list) => Array.isArray(list) && list.every(validPosition),
      ) &&
      Array.isArray(saved.marketQuotes) &&
      saved.marketQuotes.length === quotes.length &&
      quotes.every((q) =>
        saved.marketQuotes.some(
          (s: any) =>
            s.symbol === q.symbol && Number.isFinite(s.price) && s.price > 0 && Number.isFinite(s.change),
        ),
      );
    if (!valid) return initialState();

    return {
      ...saved,
      marketQuotes: quotes.map((q) => {
        const s = saved.marketQuotes.find((m: any) => m.symbol === q.symbol);
        return { ...q, price: s.price, change: s.change };
      }),
    };
  } catch {
    return initialState();
  }
}
