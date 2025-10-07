import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "node:path";
import { fileURLToPath } from "node:url";

// console.log(process.argv)

const PORT = process.argv[2] || 80;

// Define __dirname for use with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let turn = "";

let clients = [
  // {
  //   name: "apple",
  //   socketId: "5wPtBoGlK0v-7FLfAAAF",
  //   position: 5
  // },
  // {
  //   name: "apple",
  //   socketId: "sHAHujgtGHV-7FLfAAAF"
  //   position: 10
  // }
];

const snake = [
  // { h: 18, t: 1 },
  // { h: 8, t: 4 },
  // { h: 26, t: 10 },
  // { h: 39, t: 5 },
  // { h: 51, t: 6 },
  // { h: 54, t: 36 },
  // { h: 56, t: 1 },
  // { h: 60, t: 23 },
  // { h: 75, t: 28 },
  // { h: 83, t: 45 },
  // { h: 85, t: 59 },
  // { h: 90, t: 48 },
  // { h: 92, t: 25 },
  // { h: 97, t: 87 },
  // { h: 99, t: 63 },
];

const ladder = [
  { from: 3, to: 20 },
  { from: 6, to: 14 },
  { from: 11, to: 28 },
  { from: 15, to: 34 },
  { from: 17, to: 74 },
  { from: 22, to: 37 },
  { from: 38, to: 59 },
  { from: 49, to: 67 },
  { from: 57, to: 76 },
  { from: 61, to: 78 },
  { from: 73, to: 86 },
  { from: 81, to: 98 },
  { from: 88, to: 91 },
];

let winnerList = [];

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("info", (name) => {
    console.log(name);
    if (!name) {
      name = "dfgbjh";
    }
    if (!name) {
      return;
    }
    if (turn === "") {
      turn = socket.id;
    }
    socket.emit("info", "hello from server");
    clients.push({ name, socketId: socket.id, position: 1 });
    io.emit("game", { clients, turn });
    console.log(clients);
  });
  socket.on("play", playGame(socket));
  // socket.on('game', () => {
  //   io.emit('game', { clients, turn })
  // })
  socket.on("disconnect", (msg) => {
    console.log(msg, socket.id);
    clients = clients.filter((e) => e.socketId != socket.id);
    if (clients.length === 0) {
      turn = "";
    } else if (clients.length === 1) {
      turn = clients[0].socketId;
    } else {
      // TODO: solve turn issue
    }
  });
});

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

httpServer.listen(PORT, (e) => {
  if (e) {
    return console.log(e);
  }
  console.log(`server started on ${PORT}`);
});

const filterClient = (socketId) => {
  let inx = -1;
  const clientArr = clients.filter((e, i) => {
    const match = e.socketId === socketId;
    if (match) {
      inx = i;
      return true;
    }
  });
  if (clientArr.length === 0) {
    return { client: [], inx };
  }
  const client = clientArr[0];
  return { client, inx };
};

const rollDice = () => {
  const diceValue = Math.ceil(Math.random() * 6);
  console.log(`Dice value : ${diceValue}`);
  return diceValue;
};

const isLadderPositionMatch = (position) => {
  let ladderMatch = false;
  let to = -1;
  ladder.forEach((e, i) => {
    if (e.from === position) {
      ladderMatch = true;
      to = e.to;
      return;
    }
  });
  return { ladderMatch, to };
};

const isSnakePositionMatch = (position) => {
  let snakeMatch = false;
  let t = -1;
  snake.forEach((e, i) => {
    if (e.h === position) {
      snakeMatch = true;
      t = e.t;
      return;
    }
  });
  return { snakeMatch, t };
};

const updatePosition = (position, diceValue) => {
  const newPos = position + diceValue;
  if (newPos <= 100) {
    position = newPos;
  }

  let { snakeMatch, t } = isSnakePositionMatch(position);
  let { ladderMatch, to } = isLadderPositionMatch(position);
  while (snakeMatch || ladderMatch) {
    if (snakeMatch) {
      position = t;
    }
    if (ladderMatch) {
      position = to;
    }
    const s = isSnakePositionMatch(position);
    snakeMatch = s.snakeMatch;
    t = s.t;
    const l = isLadderPositionMatch(position);
    ladderMatch = l.ladderMatch;
    to = l.to;
  }

  if (position > 100) {
    position = 100;
  }
  return position;
};

const updateTurn = (index, diceValue) => {
  if (diceValue !== 6) {
    for (let i = 0; i < clients.length; i++) {
      index = (index + 1) % clients.length;
      turn = clients[index].socketId;
      if (clients[index].position >= 100) {
        // check for position if user has completed the game
        index = (index + 1) % clients.length;
        turn = clients[index].socketId;
      } else {
        break;
      }
    }
  }
  console.log(`Next turn is : ${clients[index].name}, ${turn}`);
  return turn;
};

const isTurn = (client) => {
  return turn == client.socketId;
};

const checkWinner = () => {
  clients.forEach((c) => {
    if (c.position >= 100) {
      let isAdded = false;
      winnerList.forEach((w) => {
        if (w.socketId === c.socketId) {
          isAdded = true;
        }
      });
      if (!isAdded) {
        winnerList.push({ socketId: c.socketId, name: c.name });
      }
    }
  });
  console.log(winnerList);
};

const playGame = (socket) => {
  return () => {
    const { client, inx } = filterClient(socket.id);
    if (isTurn(client)) {
      const diceValue = rollDice();
      client.position = updatePosition(client.position, diceValue);
      turn = updateTurn(inx, diceValue);
      checkWinner();
      io.emit("game", { diceValue, clients, turn });

      // check for no of players having position less than 100
      if (clients.length > 1) {
        const nop = clients.filter((c) => c.position < 100);
        if (nop.length < 2) {
          console.log("game over triggered");
          io.emit("game_over", winnerList);

          setTimeout(() => {
            clients.forEach((e, i) => {
              clients[i].position = 1;
            });
            winnerList = [];
            io.emit("game", { clients, turn });
          }, 5000);
        }
      }
    } else {
      console.log(`Not your turn ${client.name} : ${client.socketId}`);
    }
  };
};
