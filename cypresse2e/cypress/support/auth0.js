const axios = require("axios");
const httpErrors = require("http-errors");
const qs = require("querystring");


const getAuthHeaders = (token) => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const wrapError = (err) => {
    const {
      response: { data, status },
    } = err;
    const { message } = data;
    const statusCode = status || data.statusCode;
    throw httpErrors(statusCode, message);
  };

  const buildOauthUrl = (connection, redirectTo) => {
    const qParams = qs.stringify({
      audience: Cypress.env('AUTH_DOMAIN') + `/api/v2/`,
      client_id: Cypress.env('AUTH_CLIENT_ID'),
      connection,
      redirect_uri: redirectTo,
      response_type: "code",
      scope: "openid email profile",
      state: Cypress.env('AUTH_STATE'),
    });
    return Cypress.env('AUTH_DOMAIN') + `/authorize?${qParams}`;
  };

  const authenticate = async (grantType, payload = {}) => {
    const body = {
      audience: Cypress.env('AUTH_DOMAIN') + `/api/v2/`,
      client_id: Cypress.env('AUTH_CLIENT_ID'),
      client_secret: Cypress.env('AUTH_SECRET_KEY'),
      grant_type: grantType,
      ...payload,
    };
    try {
      const res = await axios.post(Cypress.env('AUTH_DOMAIN') + `/oauth/token`, body);
      return res.data.access_token;
    } catch (err) {
      return wrapError(err);
    }
  };
  
  const createUser = async (token, payload) => {
    try {
      const res = await axios.post(
        Cypress.env('AUTH_DOMAIN') + `/api/v2/users`,
        payload,
        getAuthHeaders(token),
      );
      return res.data;
    } catch (err) {
      return wrapError(err);
    }
  };
  
  const getUser = async (token) => {
    try {
      const res = await axios.get(
        Cypress.env('AUTH_DOMAIN') + `/userinfo`,
        getAuthHeaders(token),
      );
      return res.data;
    } catch (err) {
      return wrapError(err);
    }
  };

  module.exports = {
    buildOauthUrl,
    authenticate,
    createUser,
    getUser,
  };
