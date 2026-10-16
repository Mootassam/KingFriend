import type { RootState } from "src/modules/store";

const authSelectors = {
  selectSignedIn: (state: RootState) => state.auth.signedIn,
};

export default authSelectors;
