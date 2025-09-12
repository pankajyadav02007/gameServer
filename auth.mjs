import { jwt } from "zod"
import { ServerError } from "./error.mjs"

const authentication = async (req, res, next) => {
  // 1. check for token is available
  if(!req.header.authorization){
    res.statusCode = 400
    return res.json({ error: "token is not send"})
  }
  // 2. validate token
try{
  jwt.verify(token, process.env.TOKEN_SECRET)
}catch (e) {
  res.statusCode = 400
  return res.json({ error:e.message})
}

req.user = jwt.decode(token)
  // 3. extract playload of token
  // 4. attach to request for further use
  next()
}

export { authentication }