import express from 'express';
const userRouter = express.Router();
import { forgotPassword, getMe, login, resetPassword, signup } from './controller.mjs';
import {authentication} from '../auth.mjs'

userRouter
  .post('/signup', signup)
  .post('/login', login)
  .patch('/forgotPassword', forgotPassword)
  .patch('/resetPassword', resetPassword)
  .get('/profile', authentication, getMe)

export default userRouter