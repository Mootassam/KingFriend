import demoActions from "src/modules/demo/demoActions";
import type { AppDispatch } from "src/modules/store";

const TICK_MS = 800;

// Drives the simulated market while the workspace is open; returns a stop function.
export function startMarketTicker(dispatch: AppDispatch) {
  const id = setInterval(() => {
    if (!document.hidden) dispatch(demoActions.doTick());
  }, TICK_MS);
  return () => clearInterval(id);
}
