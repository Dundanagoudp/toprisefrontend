// utils/auth.ts
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

type TokenPayload = {

  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

export function getTokenPayload(): TokenPayload | null {
  const token = Cookies.get('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
