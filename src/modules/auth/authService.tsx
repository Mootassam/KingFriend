import storage, { storageKeys } from "src/security/storage";

// Local demo session only: no credentials are collected or sent anywhere.
export default class AuthService {
  static isSignedIn() {
    return storage.get(storageKeys.session) === "demo";
  }

  static signIn() {
    storage.set(storageKeys.session, "demo");
    storage.setSession(storageKeys.demoReady, "true");
  }

  static signOut() {
    storage.remove(storageKeys.session);
  }

  // True once, right after sign-in, so the shell can show the welcome notice.
  static consumeDemoReady() {
    if (storage.getSession(storageKeys.demoReady) !== "true") return false;
    storage.removeSession(storageKeys.demoReady);
    return true;
  }
}
