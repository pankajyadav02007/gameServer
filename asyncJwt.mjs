import jwt from "jsonwebtoken";
const asyncJwtSign = (payload, secret, options) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        return reject(err);
      }
      resolve(token);
    });
  });
};

const asyncJwtVerify = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, token) => {
      if (err) {
        return reject(err);
      }
      resolve(token);
    });
  });
};

export { asyncJwtSign, asyncJwtVerify };
