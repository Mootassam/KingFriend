import { AnyAction } from "redux";
import actions from "src/modules/auth/authActions";
import AuthService from "src/modules/auth/authService";

export interface AuthState {
  signedIn: boolean;
}

export default (
  state: AuthState = { signedIn: AuthService.isSignedIn() },
  { type }: AnyAction,
): AuthState => {
  switch (type) {
    case actions.SIGNIN:
      return { signedIn: true };
    case actions.SIGNOUT:
      return { signedIn: false };
    default:
      return state;
  }
};
