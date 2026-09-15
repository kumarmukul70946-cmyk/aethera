/**
 * Configuration options for setting the authentication JWT in an HTTP-only cookie.
 * Ensures cookies are inaccessible to client-side JavaScript, protecting against XSS attacks.
 */
export const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true, // Inaccessible to document.cookie (XSS defense)
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? "strict" : "lax", // Protects against Cross-Site Request Forgery
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
};

/**
 * Configuration options for clearing the authentication cookie upon logout.
 */
export const getClearCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    expires: new Date(0) // Immediately invalidate cookie
  };
};
