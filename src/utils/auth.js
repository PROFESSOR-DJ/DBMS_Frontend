// auth utilities manage client-side authentication session storage.
const TOKEN_KEY = 'token';
const USER_EMAIL_KEY = 'userEmail';
const USER_DATA_KEY = 'authUser';

const getStorage = () => window.sessionStorage;

const parseUser = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const migrateLegacyAuthStorage = () => {
  const session = getStorage();
  const sessionToken = session.getItem(TOKEN_KEY);
  const legacyToken = window.localStorage.getItem(TOKEN_KEY);
  const legacyEmail = window.localStorage.getItem(USER_EMAIL_KEY);

  if (!sessionToken && legacyToken) {
    session.setItem(TOKEN_KEY, legacyToken);
    if (legacyEmail) session.setItem(USER_EMAIL_KEY, legacyEmail);
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_EMAIL_KEY);
  window.localStorage.removeItem(USER_DATA_KEY);
};

export const isAuthenticated = () => Boolean(getAuthToken());

export const getAuthToken = () => getStorage().getItem(TOKEN_KEY);

export const getAuthUser = () => parseUser(getStorage().getItem(USER_DATA_KEY));

export const setAuthSession = ({ token, email, user }) => {
  const storage = getStorage();
  storage.setItem(TOKEN_KEY, token);
  if (email) storage.setItem(USER_EMAIL_KEY, email);

  const nextUser = user || (email ? { email } : null);
  if (nextUser) storage.setItem(USER_DATA_KEY, JSON.stringify(nextUser));
};

export const updateStoredAuthUser = (user) => {
  const storage = getStorage();
  if (!user) {
    storage.removeItem(USER_DATA_KEY);
    return;
  }

  storage.setItem(USER_DATA_KEY, JSON.stringify(user));
  if (user.email) storage.setItem(USER_EMAIL_KEY, user.email);
};

export const clearAuthSession = () => {
  const storage = getStorage();
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_EMAIL_KEY);
  storage.removeItem(USER_DATA_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_EMAIL_KEY);
  window.localStorage.removeItem(USER_DATA_KEY);
};

export const getUserEmail = () => getStorage().getItem(USER_EMAIL_KEY);
