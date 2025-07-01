import { decodeJwt } from "jose";

interface TokenValidationResult {
  isTokenValid: boolean;
  isExpired: boolean;
  isAuthenticated: boolean;
}

export function useTokenValidation(token: string): TokenValidationResult {
  if (!token) {
    return {
      isTokenValid: false,
      isExpired: true,
      isAuthenticated: false,
    };
  }

  try {
    const { exp, "http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata": userData } =
      decodeJwt(token);

    const now = Math.floor(Date.now() / 1000);
    const isExpired = exp ? now >= exp : false;

    let isAuthenticated = false;
    if (userData && typeof userData === "string") {
      const parsedUserData = JSON.parse(userData);
      isAuthenticated = parsedUserData.Authenticated || false;
      console.log('parsedUserData', parsedUserData)
    }

    return {
      isTokenValid: !isExpired,
      isExpired,
      isAuthenticated,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return {
      isTokenValid: false,
      isExpired: true,
      isAuthenticated: false,
    };
  }
}