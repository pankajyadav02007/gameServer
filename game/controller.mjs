import { DB_ERR_CODES, prisma, Prisma } from "../prisma/db.mjs";
import { ServerError } from "../error.mjs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateSecureRandomString } from "../utils.mjs";
import { asyncJwtSign } from "../asyncJwt.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const addGame = async (req, res, next) => {
  // TODO: add validation

  const game = await prisma.game.create({
    data: {
      name: req.body.name,
      minPlayer: req.body.minPlayer,
      maxPlayer: req.body.maxPlayer,
    },
  });

  res.json({ msg: "successful", game });
};
const listGame = async (req, res, next) => {
  const games = await prisma.game.findMany();
  res.json({ msg: "successful", games });
};

const requestGame = async (req, res, next) => {
  if (!req.body.gameID) {
    throw new ServerError(400, "game id must be supplied");
  }

  const tokenSecret = generateSecureRandomString(32);
  let gameSession = await prisma.gameSession.findFirst({
    where: {
      gameId: req.body.gameID,
      Status: "WAITING",
    },
  });
  if (!gameSession) {
    gameSession = await prisma.gameSession.create({
      data: {
        gameId: req.body.gameID,
        TokenSecret: tokenSecret,
      },
    });
  }
  let gameSessionPlayer;
  try {
    gameSessionPlayer = await prisma.gameSessionPlayer.create({
      data: {
        sessionId: gameSession.id,
        playerId: req.user.id,
      },
    });
  } catch (err) {
    if (err.code === DB_ERR_CODES.UNIQUE_ERR) {
      throw new ServerError(
        400,
        "player is already added in this game session"
      );
    }
    throw err;
  }

  const game = await prisma.game.findUnique({
    where: {
      id: req.body.gameID,
    },
  });
  // find total number of players in this game session
  const data = await prisma.gameSessionPlayer.aggregate({
    where: {
      sessionId: gameSession.id,
    },
    _count: {
      playerId: true,
    },
  });

  if (game.maxPlayer > data._count.playerId) {
    return res.json({
      msg: "successful, Wait for other players to join",
      gameId: req.body.gameId,
      gameSession,
      gameSessionPlayer,
      data,
    });
  }

  const { pid, port } = await startGame(game, tokenSecret);
  const token = await asyncJwtSign(req.user, tokenSecret);
  const gameURL = `${req.protocol}://localhost:${port}?token=${token}`;
  // console.log(gameURL);

  gameSession = await prisma.gameSession.updateManyAndReturn({
    where: {
      id: gameSession.id,
    },
    data: {
      GameUrl: gameURL,
      ProcessID: pid,
      Status: "PLAYING",
      StartedAt: new Date(),
    },
  });

  res.json({
    msg: "successful",
    gameId: req.body.gameId,
    gameSession,
    gameSessionPlayer,
    data,
    pid,
    url: gameURL,
  });
};

const startGame = async (game, tokenSecret) => {
  const port = Math.ceil(Math.random() * 62000) + 3000; // random number from 3000-65000
  // start game
  const gameInstance = spawn(
    "node",
    [
      path.resolve(__dirname, `../allGames/${game.name}/index.mjs`),
      port,
      tokenSecret,
    ],
    {
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    }
  );
  // gameInstance.unref();

  gameInstance.stdout.on("data", (data) => {
    console.log(`[${game.name}] stdout: ${data}`);
  });

  gameInstance.stderr.on("data", (data) => {
    console.error(`[${game.name}] stderr: ${data}`);
  });

  gameInstance.on("close", (code) => {
    console.log(`${game.name} exited with code ${code}`);
  });
  // console.log(gameInstance);
  return { pid: gameInstance.pid, port };
};

const getMyGameSession = async (req, res, next) => {
  const gameSessionId = req.params.sessionId * 1;
  if (!gameSessionId) {
    throw new ServerError(400, "must supply game session ID");
  }

  const sessionPlayers = await prisma.gameSessionPlayer.findMany({
    where: {
      sessionId: gameSessionId,
    },
    select: {
      id: true,
      sessionId: true,
      playerId: true,
      player: {
        select: {
          name: true,
          profilePhoto: true,
        },
      },
    },
  });

  let isMySession = false;

  sessionPlayers.forEach((sp) => {
    if (sp.playerId == req.user.id) {
      isMySession = true;
    }
  });

  if (!isMySession) {
    throw new ServerError(401, "this is not your game session");
  }

  const gameSession = await prisma.gameSession.findUnique({
    where: {
      id: gameSessionId,
    },
  });

  res.json({ msg: "success", gameSession, sessionPlayers });
};

export { addGame, listGame, requestGame, getMyGameSession };
