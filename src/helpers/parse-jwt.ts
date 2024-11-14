import base64 from 'react-native-base64';

export function parseJwt<T extends Record<string, any>>(
  token: string,
): T | null {
  if (!token) {
    return null;
  }

  const base64Url = token.split('.')[1];

  const base64Data = base64
    .decode(base64Url.replace(/-/g, '+').replace(/_/g, '/'))
    .replace(/\0/g, '');

  const jsonPayload = decodeURIComponent(
    base64Data
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );

  return JSON.parse(jsonPayload);
}
