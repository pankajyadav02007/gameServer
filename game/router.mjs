import express from "express";
const gameRouter = express.Router();
import {
  addGame,
  listGame,
  requestGame,
  getMyGameSession,
} from "./controller.mjs";
import { authentication, authorization } from "../auth.mjs";

gameRouter.use(authentication);

gameRouter
  .post("/", authorization("ADMIN"), addGame)
  .get("/", listGame)
  .post("/request", requestGame)
  .get("/session/:sessionId", getMyGameSession);

export default gameRouter;
