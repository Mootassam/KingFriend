import Axios from "axios";
import config from "src/config";
import { getLanguageCode } from "src/i18n";
import AuthToken from "src/modules/auth/authToken";

const authAxios = Axios.create({
  baseURL: config.backendUrl,
  timeout: 20000,
});

authAxios.interceptors.request.use((options) => {
  const token = AuthToken.get();
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }
  options.headers["Accept-Language"] = getLanguageCode();
  return options;
});

export default authAxios;
