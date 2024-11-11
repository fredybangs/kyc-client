import { fetchApi } from "./api";

const endPoints = {
  triggerPwdReset: '/api/trigger_password_reset',
  checkToken: '/api/check_reset_token',
  refreshToken: '/api/auth/refresh_token',
  setNewPwd: '/api/change_password',
  changePwd: '/api/change_user_password',
  geTokens: '/api/auth/get_tokens',
  signup: '/api/signup',
  faqs: '/api/faq/get',
};

const header = {
  'Content-Type': 'text/html',
  clientId: '12345',
};
const timer = 60000;
const database = 'kyc_db';

export const authenticate = payload =>
  fetchApi(
    endPoints.geTokens,
    header,
    {...payload, db: database},
    'POST',
    timer,
  );
export const refreshToken = payload =>
  fetchApi(endPoints.refreshToken, header, payload, 'POST', timer);

export const triggerPwdReset = payload =>
  fetchApi(endPoints.triggerPwdReset, header, payload, 'POST', timer);
export const checkResetToken = payload =>
  fetchApi(endPoints.checkToken, header, payload, 'POST', timer);
export const setNewPassword = payload =>
  fetchApi(endPoints.setNewPwd, header, payload, 'POST', timer);

export const changeUserPassword = (payload, token) =>
  fetchApi(
    endPoints.changePwd,
    {...header, accessToken: `${token}`},
    payload,
    'POST',
    timer,
  );

export const signup = payload =>
  fetchApi(
    endPoints.signup,
    header,
    {payload},
    'POST',
    timer,
  );