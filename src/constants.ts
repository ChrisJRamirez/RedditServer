require("dotenv").config();
export const _prod_ = process.env.NODE_ENV !== "production";
export const _password_ = process.env.PASSWORD || "passwords";
