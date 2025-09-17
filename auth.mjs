import jwt from "jsonwebtoken";
import { ServerError } from "./error.mjs";

const authentication = async (req, res, next) => {
  // 1. check for token is available
  if (!req.headers.authorization) {
    throw new ServerError(400, "token is not send");
  }

  const [bearer, token] = req.headers.authorization.split(" ");
  if (!bearer || !token) {
    throw new ServerError(401, "Bearer token not supplied");
  }
  if (bearer !== "Bearer") {
    throw new ServerError(401, "Bearer token not supplied!");
  }
  // 2. validate token
  try {
    jwt.verify(token, process.env.TOKEN_SECRET);
  } catch (e) {
    throw new ServerError(400, e.message);
  }

  req.user = jwt.decode(token);
  // 3. extract playload of token
  // 4. attach to request for further use
  next();
};

export { authentication };
