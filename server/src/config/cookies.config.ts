import { CookieOptions } from "express";

/**
 * refreshTokenCookieConfig object use for cookies config.
 */
export const refreshTokenCookieConfig: CookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
}