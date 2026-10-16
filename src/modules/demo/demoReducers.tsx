import { AnyAction } from "redux";
import actions from "src/modules/demo/demoActions";
import { DemoState, quotes } from "src/modules/demo/demoEnumerators";
import { advance, cancelPending, closePosition, initialState } from "src/modules/demo/demoEngine";

export default (state: DemoState = initialState(), { type, payload }: AnyAction): DemoState => {
  switch (type) {
    case actions.HYDRATE:
    case actions.REPLACE:
      return payload;
    case actions.TICK:
      return advance(state);
    case actions.SELECT_SYMBOL:
      return quotes.some((q) => q.symbol === payload) ? { ...state, selectedSymbol: payload } : state;
    case actions.CLOSE_POSITION:
      return closePosition(state, payload);
    case actions.CANCEL_PENDING:
      return cancelPending(state, payload);
    case actions.RENAME:
      return payload ? { ...state, name: payload } : state;
    case actions.RESET:
      return initialState();
    default:
      return state;
  }
};
