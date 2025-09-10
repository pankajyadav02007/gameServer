import { ServerError } from "../error.mjs"
import bcrypt from "bcrypt"
import prisma from "../prisma/db.mjs"
import { errorPritify, UserSignupModel,UserLoginModel } from "./validator.mjs"
import emailQueue from "../queue/email.queue.mjs"
import { asyncJwtSign } from "../asyncJwt.mjs"

const signup = async (req, res, next) => {
  const result = await UserSignupModel.safeParseAsync(req.body)
  if (!result.success) {
    throw new ServerError(400, errorPritify(result))
  }

  const hasedPassword = await bcrypt.hash(req.body.password, 10)

  const newUser = await prisma.user.create({
    data: {
      email: req.body.email,
      name: req.body.name,
      password: hasedPassword
    },
  });
  console.log(newUser)

  await emailQueue.add("Welcome Email",{
    to: newUser.email,
    subject: "Verfication Email",
    body:`<html>
  <h1>Welcome ${newUser.name}</h1>
  <a href="http://google.com">Click Here to Verify Account</a>
  </html>`
  })
  // send account verification email -> nodemailer
  res.json({ msg: "signup is successful" })
}

// find user login by email from DB
const login = async(req, res, next) => {
 const result = await UserLoginModel.safeParseAsync(req.body)
  if (!result.success) {
    throw new ServerError(401, errorPritify(result))
  }
    // find user in DB
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  })
  console.log(user)
  if (!user) {
    throw new ServerError(404, "user do not exist")
  }

  // TODO: check is account verified
  // TODO: match hased password
  const isOk = await bcrypt.compare(req.body.password, user.password)
  if(!isOk){
    throw new ServerError(401,"password is wrong")
  
  }
  // Generate JWT Token -> json web token
    const token = await asyncJwtSign({ id: user.id, name: user.name, email: user.email}, process.env.TOKEN_SECRET)
      res.json({ token, id: user.id, email: user.email})
  console.log(token)
  res.json({ msg: "login done successfull"})
}  

// forgotPassword
const forgotPassword = async(req, res, next) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  })
if(!user){
  throw new ServerError (404,"user do not exist")
}
const token = Randomstring.generate()
await prisma.user.update({
  where: {email: req.body.email},
  data: {
      resetToken: token,
      resetTokenExpiry: new Date(Date.now())
  },
})
const msg = `<html><body>Click this link<a href="http://localhost:3000/reset_password/${token}">Click Here</a></body></html>`

await sendEmail(req.body.email,"Forgot Password", msg)

  res.json({ msg: "email send check your email" })
}

// resetPassword
const resetPassword = (req, res, next) => {
  res.json({ msg: "reset password" })
}

export { signup, login, forgotPassword, resetPassword }