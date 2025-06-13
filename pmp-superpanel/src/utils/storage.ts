type Key =
  | 'USER'
  | 'AUTH_TOKEN'
  | 'REFRESH_TOKEN'
  | 'SHOP_TENANT'
  | 'SYSTEM_CONFIG'
  | 'LAST_ACTIVITY';

function addKeyPrefix(key: string) {
  const prefix = 'WEB_ADMIN';
  return `${prefix}_${key}`;
}

export function clear() {
  localStorage.clear();
}

export function getItem<T>(key: Key): T | null {
  const newKey = addKeyPrefix(key);
  try {
    const stringifiedJson = localStorage.getItem(newKey);
    if (stringifiedJson) {
      return JSON.parse(stringifiedJson);
    }
    return null;
  } catch {
    localStorage.removeItem(newKey);
    return null;
  }
}

export function removeItem(key: Key) {
  const newKey = addKeyPrefix(key);
  localStorage.removeItem(newKey);
}

export function setItem<T>(key: Key, value: T) {
  const newKey = addKeyPrefix(key);
  const stringifiedJson = JSON.stringify(value);
  localStorage.setItem(newKey, stringifiedJson);
}
