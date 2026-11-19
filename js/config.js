const CONFIG = {
  // Empty base => requests go to the same origin as the page.
  // server.js proxies /api/* to the gateway and /upload/* to the uploader,
  // so the browser never makes a cross-origin (preflighted) request.
  API_BASE_URL: '',
  UPLOADER_BASE_URL: '',
};

export default CONFIG;