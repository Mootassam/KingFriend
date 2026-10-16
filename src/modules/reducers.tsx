import { combineReducers } from "redux";
import auth from "src/modules/auth/authReducers";
import demo from "src/modules/demo/demoReducers";
import layout from "src/modules/layout/layoutReducers";

export default () =>
  combineReducers({
    auth,
    demo,
    layout,
  });
