import express from 'express';
const userRouter = express.Router();
import { forgotPassword, getMe, login, resetPassword, signup, updateProfileImage } from './controller.mjs';
import {authentication} from '../auth.mjs'

userRouter
  .post('/signup', signup)
  .post('/login', login)
  .patch('/forgotPassword', forgotPassword)
  .patch('/resetPassword', resetPassword)
  .get('/profile', authentication, getMe)
  .patch('/profile/image',authentication,updateProfileImage)

export default userRouter