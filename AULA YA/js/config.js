// Set AULA_API_BASE_URL here when the API is deployed on a separate host.
window.AULA_API_BASE_URL = window.AULA_API_BASE_URL || (
  ["localhost", "127.0.0.1"].includes(location.hostname)
    ? "http://127.0.0.1:8001"
    : location.origin
);
