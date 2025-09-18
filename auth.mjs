import { ca } from "zod/locales";
import { asyncJwtVerify } from "./asyncjwt.mjs";
import { ServerError } from "./error.mjs";

const authentication = async (req, res, next) => {
  // 1. check for token is available
  if (!req.headers.authorization) {
    throw new ServerError(401, "token not supplied");
  }

  const [bearer, token] = req.headers.authorization.split(" ");
  if (!bearer || !token) {
    throw new ServerError(401, "Bearer token not supplied");
  }
  if (bearer !== "Bearer") {
    throw new ServerError(401, "Bearer token not supplied!");
  }

  try {
    const user = await asyncJwtVerify(token, process.env.TOKEN_SECRET);
    req.user = user;
  } catch (err) {
    throw new ServerError(401, err.message);
  }

  next();
};

export { authentication };
