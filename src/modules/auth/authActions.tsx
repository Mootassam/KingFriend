import AuthService from "src/modules/auth/authService";

const prefix = "AUTH";

const authActions = {
  SIGNIN: `${prefix}_SIGNIN`,
  SIGNOUT: `${prefix}_SIGNOUT`,

  doSignin: () => {
    AuthService.signIn();
    return { type: authActions.SIGNIN };
  },

  doSignout: () => {
    AuthService.signOut();
    return { type: authActions.SIGNOUT };
  },
};

export default authActions;
