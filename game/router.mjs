import express from "express";
const gameRouter = express.Router();
import {
  addGame,
  listGame,
  requestGame,
  getMyGameSession,
} from "./controller.mjs";
import { authentication } from "../auth.mjs";

gameRouter.use(authentication);

gameRouter
  .post("/", addGame)
  .get("/", listGame)
  .post("/request", requestGame)
  .get("/session/:sessionID", getMyGameSession);

export default gameRouter;
