import { Store } from "redux";
import demoActions from "src/modules/demo/demoActions";
import DemoService from "src/modules/demo/demoService";

// Runs once after the store is created.
const initializers: ((store: Store) => void)[] = [
  (store) => {
    store.dispatch(demoActions.doHydrate(DemoService.load()));

    let previous = store.getState().demo;
    store.subscribe(() => {
      const current = store.getState().demo;
      if (current !== previous) {
        previous = current;
        DemoService.save(current);
      }
    });
  },
];

export default initializers;
