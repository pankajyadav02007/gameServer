import express, { request } from "express";
const gameRouter = express.Router();
import { addGame, listGame, requestGame } from "./controller.mjs";
import { authentication } from "../auth.mjs";

gameRouter.use(authentication);

gameRouter.post("/", addGame).get("/", listGame).post("/request", requestGame);
export default gameRouter;
