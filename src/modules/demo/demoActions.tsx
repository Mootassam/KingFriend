import { DemoState } from "src/modules/demo/demoEnumerators";
import { OrderRequest, createOrder } from "src/modules/demo/demoEngine";
import layoutActions from "src/modules/layout/layoutActions";
import type { AppThunk } from "src/modules/store";

const prefix = "DEMO";

const demoActions = {
  HYDRATE: `${prefix}_HYDRATE`,
  TICK: `${prefix}_TICK`,
  SELECT_SYMBOL: `${prefix}_SELECT_SYMBOL`,
  REPLACE: `${prefix}_REPLACE`,
  CLOSE_POSITION: `${prefix}_CLOSE_POSITION`,
  CANCEL_PENDING: `${prefix}_CANCEL_PENDING`,
  RENAME: `${prefix}_RENAME`,
  RESET: `${prefix}_RESET`,

  doHydrate: (state: DemoState) => ({ type: demoActions.HYDRATE, payload: state }),

  doTick: (): AppThunk => (dispatch) => {
    dispatch({ type: demoActions.TICK });
    dispatch(layoutActions.doMarkUpdated());
  },

  doSelectSymbol: (symbol: string) => ({ type: demoActions.SELECT_SYMBOL, payload: symbol }),

  // Throws when the engine rejects the order so the ticket can show the message.
  doPlaceOrder:
    (request: OrderRequest): AppThunk =>
    (dispatch, getState) => {
      const next = createOrder(getState().demo, request);
      dispatch({ type: demoActions.REPLACE, payload: next });
    },

  doClosePosition: (id: string) => ({ type: demoActions.CLOSE_POSITION, payload: id }),
  doCancelPending: (id: string) => ({ type: demoActions.CANCEL_PENDING, payload: id }),
  doRename: (name: string) => ({ type: demoActions.RENAME, payload: name.trim().slice(0, 50) }),
  doReset: () => ({ type: demoActions.RESET }),
};

export default demoActions;
