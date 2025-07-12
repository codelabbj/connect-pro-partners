// Token helpers
function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}
function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}
function setTokens({ access, refresh }: { access: string, refresh: string }) {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}
function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
  localStorage.removeItem('theme'); // Clear theme preference on logout
}

// Export helpers for use in login/logout flows
export { getAccessToken, getRefreshToken, setTokens, clearTokens }; 