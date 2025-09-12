import express from 'express';
const sessionRouter = express.Router();
import { addPlayer, createSession, listSession } from './controller.mjs';
import { authentication} from '../auth.mjs'



sessionRouter.use( authentication)

sessionRouter
.post('/', createSession)
.post('/', addPlayer)
.get('/:game_id', listSession)

export default sessionRouter