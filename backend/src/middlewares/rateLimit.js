import rateLimit from "express-rate-limit";
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    mensaje:
      "Demasiados intentos de inicio de sesión. Inténtalo nuevamente más tarde.",
  },
});
