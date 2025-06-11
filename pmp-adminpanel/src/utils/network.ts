import axios from 'axios';
import { BASE_URL, BASE_SYSTEM_URL } from '@/utils/constants';
import { getItem, setItem } from '@/utils/storage';
import { store } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';

const token = () => getItem<{ token: string }>('USER')?.token;
const refreshToken = () => getItem<{ token: string }>('USER')?.token;

const networkInstance = axios.create();
const refreshInstance = axios.create();

const pendingRequests = new Map(); // Map to store pending requests (URL as key, AbortController as value)
// const axiosInstance = axios.create({
//   // ... other Axios configuration options
// });
// Request interceptor to cancel duplicate requests

const setLogout = () => {
  store.dispatch(logout());
};

function isDuplicateRequest(newData: unknown, oldData: unknown) {
  // Implement your logic to compare request data objects for equality (e.g., deep comparison)
  // This example assumes simple data types:
  if (newData === oldData) {
    return true;
  }
  return false;
}

networkInstance.interceptors.request.use(
  (config) => {
    setItem('LAST_ACTIVITY', Date.now());
    const url = config.url; // Extract the URL from the request config
    if (pendingRequests.has(url)) {
      const previousController = pendingRequests.get(url); // Get the AbortController for the pending request
      // Check if the request data is also identical (if applicable)
      if (isDuplicateRequest(config.data, previousController.data)) {
        // Replace `isDuplicateRequest` with your custom logic
        previousController.abort(); // Cancel the previous request
      }
    }
    const controller = new AbortController(); // Create a new AbortController for the current request
    config.signal = controller.signal; // Attach the signal to the request config
    pendingRequests.set(url, controller); // Store the AbortController for the current request

    return config;
  },
  (error) => {
    console.log('error :>> ', error);
    // Handle errors during request configuration
    return Promise.reject(error);
  }
);

networkInstance.interceptors.response.use(
  function onResponse(response) {
    return response;
  },
  function onError(error) {
    if (error.config.signal.aborted) {
      return Promise.reject(new Error('Aborted'));
    }
    const originalRequest = { ...error.config };
    if (error.response.status === 401) {
      return refreshInstance
        .get(`${BASE_URL}backofficeUser/refresh/token`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: refreshToken(),
          },
        })
        .then(
          (response) => {
            if (response.data.success) {
              setItem('AUTH_TOKEN', response.data.data.accessToken);
              setItem('REFRESH_TOKEN', response.data.data.refreshToken);
              const newRequest = {
                ...originalRequest,
                headers: {
                  ...originalRequest.headers,
                  Authorization: response.data.data.accessToken,
                  RETRY: 'TRUE',
                },
              };
              return networkInstance(newRequest);
            }
            setLogout();
            return Promise.reject(new Error(response.data.message));
          },
          (err) => {
            setLogout();
            return Promise.reject(err);
          }
        );
    }
    if (error.response.status === 403) {
      setLogout();
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // setLogout();
    return Promise.reject(error);
  }
);

const post = <T = unknown>(endPoint: string, data: T) => {
  return networkInstance.post(`${BASE_URL}${endPoint}`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token(),
    },
  });
};

const patch = <T = unknown>(endPoint: string, data: T) => {
  return networkInstance.patch(`${BASE_URL}${endPoint}`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token(),
    },
  });
};

const get = (endPoint: string, body?: unknown, type?: any) => {
  // console.log('token', token());

  let baseUrl = BASE_URL;
  if (type === 'system') {
    baseUrl = BASE_SYSTEM_URL;
  }
  return networkInstance.get(`${baseUrl}${endPoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token(),
    },
    params: body,
  });
};

const postMultipart = <T = unknown>(endPoint: string, data: T) => {
  return networkInstance.post(`${BASE_URL}${endPoint}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: token(),
    },
  });
};

export default {
  post,
  patch,
  get,
  postMultipart,
};
