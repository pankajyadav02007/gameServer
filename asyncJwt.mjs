import jwt from "jsonwebtoken"
const asyncJwtSign = (payload, secret) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, (err, token) => {
      if (err) {
        return reject(err)
      }
      resolve(token)
    })
  })
}

export { asyncJwtSign }