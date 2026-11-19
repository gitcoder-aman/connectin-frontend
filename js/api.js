import CONFIG from './config.js';

const API_BASE = CONFIG.API_BASE_URL;
const UPLOADER_BASE = CONFIG.UPLOADER_BASE_URL;

// Token management
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');
export const getUserId = () => {
  const id = localStorage.getItem('userId');
  if (id) return parseInt(id);
  return null;
};
export const setUserId = (id) => localStorage.setItem('userId', id ? String(id) : '');
export const removeUserId = () => localStorage.removeItem('userId');
export const getUserEmail = () => localStorage.getItem('userEmail');
export const setUserEmail = (email) => localStorage.setItem('userEmail', email || '');
export const removeUserEmail = () => localStorage.removeItem('userEmail');
export const getUserName = () => localStorage.getItem('userName');
export const setUserName = (name) => localStorage.setItem('userName', name || '');
export const removeUserName = () => localStorage.removeItem('userName');

// Parse JWT to extract userId (sub) if not stored
export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// Build headers with auth
const getAuthHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Downstream services (post-service, connection-service) read the user id
  // from the X-User-Id header. The gateway only sets it as a request attribute,
  // which is not forwarded, so the frontend sends it based on the JWT subject.
  const userId = getUserId();
  if (userId) {
    headers['X-User-Id'] = String(userId);
  }
  return headers;
};

// Generic API request
async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  // Remove Content-Type if FormData is used
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);
    if (response.status === 204) {
      return { success: true, data: null };
    }

    const contentType = response.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
    } else {
      try {
        const text = await response.text();
        data = text || null;
      } catch (e) {
        data = null;
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: extractErrorMessage(data, response.status),
        status: response.status,
      };
    }

    return { success: true, data };
  } catch (error) {
    // fetch() rejects on network failure, CORS block, or offline
    return {
      success: false,
      error:
        'Cannot reach the server. Make sure the backend services are running and you opened this page via http:// (not file://).',
      status: 0,
      isNetworkError: true,
    };
  }
}

// Turn an error response into a readable message
function extractErrorMessage(data, status) {
  // PdfError / ApiError shape: { error, httpStatus, timeStamp }
  if (data && typeof data === 'object') {
    if (data.error) return data.error;
    if (data.message) return data.message;
    if (data.httpStatus) return `Request failed: ${data.httpStatus}`;
  }
  // Plain text body (e.g. gateway auth errors)
  if (typeof data === 'string' && data.trim()) {
    if (data.length > 200 || data.trim().startsWith('<')) {
      return statusMessage(status);
    }
    return data.trim();
  }
  return statusMessage(status);
}

// Friendly message per HTTP status code
function statusMessage(status) {
  switch (status) {
    case 0:
      return 'Network error. The server could not be reached.';
    case 400:
      return 'Bad request. Please check the information you entered.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested item was not found.';
    case 409:
      return 'This action conflicts with existing data.';
    case 500:
      return 'The server encountered an error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'The server is temporarily unavailable. Please try again shortly.';
    default:
      return `Request failed (status ${status}).`;
  }
}

// Auth APIs
export const signup = (name, email, password) => {
  return request('/api/v1/users/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
};

export const login = (email, password) => {
  return request('/api/v1/users/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

// Post APIs
export const createPost = (content, file) => {
  const formData = new FormData();
  formData.append('post', new Blob([JSON.stringify({ content })], { type: 'application/json' }));
  if (file) {
    formData.append('file', file);
  }
  return request('/api/v1/posts/core', {
    method: 'POST',
    body: formData,
  });
};

export const getPost = (postId) => {
  return request(`/api/v1/posts/core/${postId}`);
};

export const getAllPostsByUser = (userId) => {
  return request(`/api/v1/posts/core/users/${userId}/all-posts`);
};

// Post likes APIs
export const likePost = (postId) => {
  return request(`/api/v1/posts/likes/${postId}`, {
    method: 'POST',
  });
};

export const unlikePost = (postId) => {
  return request(`/api/v1/posts/likes/${postId}`, {
    method: 'DELETE',
  });
};

// Connections APIs
export const getFirstDegreeConnections = (userId) => {
  return request(`/api/v1/connections/core/${userId}/first-degree`);
};

export const getAllPersons = () => {
  return request('/api/v1/connections/core/all');
};

export const getSentRequests = () => {
  return request('/api/v1/connections/core/requests/sent');
};

// Build a { userId: name } map for the whole network. Used to display real
// names instead of numeric user IDs across pages.
export const getUserNameMap = async () => {
  const map = {};
  const me = getUserId();
  const myName = localStorage.getItem('userName');
  if (me && myName) map[Number(me)] = myName;
  const res = await getAllPersons();
  if (res.success && Array.isArray(res.data)) {
    res.data.forEach((p) => {
      map[Number(p.userId)] = p.name || `User ${p.userId}`;
    });
  }
  return map;
};

export const getReceivedRequests = () => {
  return request('/api/v1/connections/core/requests/received');
};

export const sendConnectionRequest = (receiverUserId) => {
  return request(`/api/v1/connections/core/request/${receiverUserId}`, {
    method: 'POST',
  });
};

export const acceptConnectionRequest = (senderUserId) => {
  return request(`/api/v1/connections/core/accept/${senderUserId}`, {
    method: 'POST',
  });
};

export const rejectConnectionRequest = (senderUserId) => {
  return request(`/api/v1/connections/core/reject/${senderUserId}`, {
    method: 'POST',
  });
};

export const removeConnection = (userId) => {
  return request(`/api/v1/connections/core/remove/${userId}`, {
    method: 'DELETE',
  });
};

// Uploader API (direct to uploader service, returns text URL)
export const uploadFileDirect = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const url = `${UPLOADER_BASE}/upload/file`;
  const token = getToken(); // not needed but just in case
  return fetch(url, {
    method: 'POST',
    body: formData,
  })
    .then(async (response) => {
      const text = await response.text();
      if (!response.ok) {
        return { success: false, error: text || `Error ${response.status}` };
      }
      return { success: true, data: text.trim() };
    })
    .catch((error) => ({ success: false, error: error.message }));
};

// Helper to decode and store user info from token
export const storeAuthData = (token, userEmail, userIdFromResponse, userName) => {
  setToken(token);
  if (userEmail) setUserEmail(userEmail);
  if (userName) setUserName(userName);
  const payload = parseJwt(token);
  if (payload && payload.sub) {
    setUserId(parseInt(payload.sub));
  } else if (userIdFromResponse) {
    setUserId(userIdFromResponse);
  }
};

export const clearAuthData = () => {
  removeToken();
  removeUserId();
  removeUserEmail();
  removeUserName();
};