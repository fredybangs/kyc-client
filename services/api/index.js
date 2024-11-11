import apiConfig from './config';
import axios from 'axios';

const exceptionExtractError = exception => {
  if (!exception.Errors) {
    return false;
  }
  const errorKeys = Object.keys(exception.Errors);
  return errorKeys.length > 0
    ? exception.Errors[errorKeys[0]][0].message
    : false;
};

const fetchApi = async (
  endPoint,
  header = {'Content-Type': 'text/html'},
  payload = {},
  method = 'POST',
  timeout = 30000,
) => {
  const serverUrl = apiConfig.url + endPoint;
  console.log("URL", serverUrl, "METHOD", method, "HEADERS", header)

  const createRequestConfig = (method, data) => ({
    method,
    url: serverUrl,
    headers: header,
    timeout,
    data,
    validateStatus: status => true,
  });

  try {
    // console.log('METH)D', method);
    await axios.head(serverUrl);

    let response;
    switch (method) {
      case 'GET':
        response = await axios(createRequestConfig(method));
        break;
      case 'PUT':
      case 'POST':
        response = await axios(createRequestConfig(method, payload));
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return response.data;
  } catch (error) {
    console.log('SERVER NOT REACHABLE...');
    return {error: error.message, connectionError: true};
  }
};

export {exceptionExtractError, fetchApi};