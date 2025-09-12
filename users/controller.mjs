import { ServerError } from "../error.mjs"
import bcrypt from "bcrypt"
import prisma from "../prisma/db.mjs"
import { errorPritify, UserSignupModel,UserLoginModel } from "./validator.mjs"
import emailQueue from "../queue/email.queue.mjs"
import { asyncJwtSign } from "../asyncJwt.mjs"
import Randomstring from "randomstring"
import dayjs from "dayjs"
import sendEmail from "../email.mjs"

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
  // console.log(newUser)
 // 1. Add 2 columns in User table in DB. 
  // 1.1 Add resetToken(string), resetTokenExpiry(timestampz) in User prisma model
  // 1.2 Run migration to acctually add column
  // 2. generate a 32 keyword random string
  // 3. update this string in DB with future 15min expiry time
  // 4. make link example https://localhost:5000/resetPassword/fgvjkdsuhvgyahfvajdsfahvdsjvbd
  // 5. add this above link email replacing http://google.com
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
  // console.log(user)
  if (!user) {
    throw new ServerError(404, "user do not exist")
  }

  // check is account verified
if(!user.accountVerified){
  throw new ServerError(404, "verify your account first")
}

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
  // 1. find User via email from req.body
  // 1. generate a 32 keyword random string
  // 3. update this string in DB with future 15min expiry time
  // 4. make link example https://localhost:5000/resetPassword/fgvjkdsuhvgyahfvajdsfahvdsjvbd
  // 5. send this link via email
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
const msg = `<html><body>Click this link<a href="http://localhost:5000/reset_password/${token}">Click Here</a></body></html>`

await sendEmail(req.body.email,"Forgot Password", msg)

  res.json({ msg: "email send check your email" })
}

// resetPassword
const resetPassword = async(req, res, next) => {
  // 1. find User via email from req.body
  // 1. generate a 32 keyword random string
  // 3. update this string in DB with future 15min expiry time
  // 4. make link example https://localhost:5000/resetPassword/fgvjkdsuhvgyahfvajdsfahvdsjvbd
  // 5. send this link via email

const users = await prisma.user.findUnique({
  where: {
    resetToken: req.params.token
  }
})

if(!users.length){
  throw new ServerError (400,"Invalid Reset Token")
}

const user = users[0]

const subTime = dayjs().subtract(process.env.RESET_LINK_EXPIRY_TIME_IN_MINUTES,'minute')
if(dayjs(subTime).isAfter(dayjs(user.resetTokenExpiry))){
  throw new ServerError (400, "link is expired!!! try forgot password again")
}

const hasedPassword = await bcrypt.hash(req.body.password, 10)
await prisma.user.update({
  where: {
    id: user.id
  },
  date: {
    resetToken: null,
    password: hasedPassword
  }
})
  res.json({ msg: "reset password" })
}

const getMe = async(req,res,next) =>{
  // 1. Extract user from request
  // 2. find user in DB by ID or Email
  // 3. Send user details without password
res.json({msg:"This is me"})
}

export { signup, login, forgotPassword, resetPassword, getMe}