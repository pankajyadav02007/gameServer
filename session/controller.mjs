import { prisma, Prisma } from "../prisma/db.mjs";

const createSession = async (req, res, next) => {
  const session = await prisma.gameSession.create({
    data: {
      gameId: req.body.gameId,
    },
  });
  res.json({ msg: "successfull", session });
};

const addPlayer = async (req, res, next) => {
  // add player to game session
  res.json({ msg: "add player" });
};

const listSession = async (req, res, next) => {
  const gameId = req.params.game_id * 1;
  const sessions = await prisma.gameSession.findMany({
    where: {
      gameId: gameId,
    },
  });
  res.json({ msg: "list session", sessions });
};

export { createSession, addPlayer, listSession };
