const maxNumberOfPawns = 12;

const turnEle = document.getElementById("turn");
turnEle.innerHTML = " ";
const diceValueEle = document.getElementById("dice");
diceValueEle.innerHTML = "";
const playBtnEle = document.getElementById("play");
playBtnEle.style.backgroundColor = "#fcc";
playBtnEle.style.color = "#000";

const userName = prompt("enter your name");
const pawnValue =
  prompt("enter number 0: blue, 1:yellow, 2:red, 3: green") || 0;

const totalPawnImageEleList = [];
for (let i = 0; i < maxNumberOfPawns; i++) {
  const imageElement = new Image(`img${i}`);
  imageElement.src = `./pawns/${i}.png`;
  totalPawnImageEleList.push(imageElement);
}
const pawnEle = totalPawnImageEleList[pawnValue];
let pawnImageEleList = totalPawnImageEleList.filter((e) => e !== pawnEle);

const cClients = {};
const lastClientsPos = {};

const assignColor = (clients) => {
  console.log(clients);
  clients.forEach((e) => {
    if (pawnImageEleList.length === 0) {
      console.log("all pawn image has selected");
      return;
    }
    if (!cClients[e.socketId]) {
      const selectedPawnImg =
        pawnImageEleList[Math.floor(Math.random() * pawnImageEleList.length)];
      cClients[e.socketId] = selectedPawnImg;
      pawnImageEleList = pawnImageEleList.filter((e) => e !== selectedPawnImg);
    }
  });
};

const socket = io();

socket.on("info", (msg) => {
  console.log(msg);
  console.log(`Name: ${userName}, ID: ${socket.id} `);
});
socket.on("game", async ({ diceValue, clients, turn }) => {
  playBtnEle.disabled = false;
  // console.log(clients, turn, socket.id)
  assignColor(clients);
  // record postion of any new player
  clients.forEach((e) => {
    if (!lastClientsPos[e.socketId]) {
      lastClientsPos[e.socketId] = e.position;
    }
  });

  if (turn === socket.id) {
    turnEle.innerHTML = "Your Turn";
  } else {
    const c = clients.filter((e) => e.socketId == turn);
    turnEle.innerHTML = `Turn: ${c[0].name} `;
  }
  diceValueEle.innerHTML = diceValue ? diceValue : "";
  await drawAnimation(clients);
});

socket.on("game_over", (winnerList) => {
  console.log(winnerList);
  playBtnEle.disabled = true;
  turnEle.innerHTML = "Winner is: ";

  winnerList.forEach((e, i) => {
    turnEle.innerHTML += ` ${i + 1}. ${e.name} `;
  });
});

socket.emit("info", userName);

const path = {
  1: { x: 0, y: 9 },
  2: { x: 1, y: 9 },
  3: { x: 2, y: 9 },
  4: { x: 3, y: 9 },
  5: { x: 4, y: 9 },
  6: { x: 5, y: 9 },
  7: { x: 6, y: 9 },
  8: { x: 7, y: 9 },
  9: { x: 8, y: 9 },
  10: { x: 9, y: 9 },
  11: { x: 9, y: 8 },
  12: { x: 8, y: 8 },
  13: { x: 7, y: 8 },
  14: { x: 6, y: 8 },
  15: { x: 5, y: 8 },
  16: { x: 4, y: 8 },
  17: { x: 3, y: 8 },
  18: { x: 2, y: 8 },
  19: { x: 1, y: 8 },
  20: { x: 0, y: 8 },
  21: { x: 0, y: 7 },
  22: { x: 1, y: 7 },
  23: { x: 2, y: 7 },
  24: { x: 3, y: 7 },
  25: { x: 4, y: 7 },
  26: { x: 5, y: 7 },
  27: { x: 6, y: 7 },
  28: { x: 7, y: 7 },
  29: { x: 8, y: 7 },
  30: { x: 9, y: 7 },
  31: { x: 9, y: 6 },
  32: { x: 8, y: 6 },
  33: { x: 7, y: 6 },
  34: { x: 6, y: 6 },
  35: { x: 5, y: 6 },
  36: { x: 4, y: 6 },
  37: { x: 3, y: 6 },
  38: { x: 2, y: 6 },
  39: { x: 1, y: 6 },
  40: { x: 0, y: 6 },
  41: { x: 0, y: 5 },
  42: { x: 1, y: 5 },
  43: { x: 2, y: 5 },
  44: { x: 3, y: 5 },
  45: { x: 4, y: 5 },
  46: { x: 5, y: 5 },
  47: { x: 6, y: 5 },
  48: { x: 7, y: 5 },
  49: { x: 8, y: 5 },
  50: { x: 9, y: 5 },
  51: { x: 9, y: 4 },
  52: { x: 8, y: 4 },
  53: { x: 7, y: 4 },
  54: { x: 6, y: 4 },
  55: { x: 5, y: 4 },
  56: { x: 4, y: 4 },
  57: { x: 3, y: 4 },
  58: { x: 2, y: 4 },
  59: { x: 1, y: 4 },
  60: { x: 0, y: 4 },
  61: { x: 0, y: 3 },
  62: { x: 1, y: 3 },
  63: { x: 2, y: 3 },
  64: { x: 3, y: 3 },
  65: { x: 4, y: 3 },
  66: { x: 5, y: 3 },
  67: { x: 6, y: 3 },
  68: { x: 7, y: 3 },
  69: { x: 8, y: 3 },
  70: { x: 9, y: 3 },
  71: { x: 9, y: 2 },
  72: { x: 8, y: 2 },
  73: { x: 7, y: 2 },
  74: { x: 6, y: 2 },
  75: { x: 5, y: 2 },
  76: { x: 4, y: 2 },
  77: { x: 3, y: 2 },
  78: { x: 2, y: 2 },
  79: { x: 1, y: 2 },
  80: { x: 0, y: 2 },
  81: { x: 0, y: 1 },
  82: { x: 1, y: 1 },
  83: { x: 2, y: 1 },
  84: { x: 3, y: 1 },
  85: { x: 4, y: 1 },
  86: { x: 5, y: 1 },
  87: { x: 6, y: 1 },
  88: { x: 7, y: 1 },
  89: { x: 8, y: 1 },
  90: { x: 9, y: 1 },
  91: { x: 9, y: 0 },
  92: { x: 8, y: 0 },
  93: { x: 7, y: 0 },
  94: { x: 6, y: 0 },
  95: { x: 5, y: 0 },
  96: { x: 4, y: 0 },
  97: { x: 3, y: 0 },
  98: { x: 2, y: 0 },
  99: { x: 1, y: 0 },
  100: { x: 0, y: 0 },
};

const canvasSize = 600;
const blockSize = canvasSize / 10;

const webpImage = new Image();
webpImage.src = "../map.png"; // Replace with your WebP image path
const canvasEle = document.getElementById("canvas");
canvasEle.height = canvasSize;
canvasEle.width = canvasSize;
const ctx = canvasEle.getContext("2d");

webpImage.onload = () => {
  ctx.drawImage(webpImage, 0, 0, canvasSize, canvasSize); // Example with custom position and size
};

playBtnEle.addEventListener("click", () => {
  socket.emit("play", "");
});

const drawLine = (x1, y1, x2, y2) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = 1;
  ctx.stroke();
};

// y axis line draw
for (let i = 1; i < 10; i++) {
  drawLine(blockSize * i, 0, blockSize * i, canvasSize);
}
for (let i = 1; i < 10; i++) {
  drawLine(0, blockSize * i, canvasSize, blockSize * i);
}

const drawAnimation = (clients) => {
  return new Promise(async (resolve, reject) => {
    let isAllPositionUpdated = clients.length;
    // draw pawn
    clients.forEach((e) => {
      if (e.position != lastClientsPos[e.socketId]) {
        let oldX = path[lastClientsPos[e.socketId]].x;
        let oldY = path[lastClientsPos[e.socketId]].y;
        const intervals = setInterval(() => {
          ctx.clearRect(0, 0, canvasSize, canvasSize);
          ctx.drawImage(webpImage, 0, 0, canvasSize, canvasSize); // Example with custom position and size
          const newX = path[e.position].x;
          const newY = path[e.position].y;

          if (oldX > newX) {
            oldX = oldX - 0.1;
          } else if (newX > oldX) {
            oldX = oldX + 0.1;
          }
          if (oldY > newY) {
            oldY = oldY - 0.1;
          } else if (newY > oldY) {
            oldY = oldY + 0.1;
          }
          if (Math.abs(oldX - newX) < 0.09 && Math.abs(oldY - newY) < 0.09) {
            isAllPositionUpdated--;
            clearInterval(intervals);
            lastClientsPos[e.socketId] = e.position;
          }
          if (isAllPositionUpdated === 0) {
            resolve();
          }
          ctx.drawImage(
            cClients[e.socketId],
            blockSize / 6 + blockSize * oldX,
            blockSize / 6 + blockSize * oldY,
            blockSize - blockSize / 3,
            blockSize - blockSize / 3
          );
          if (e.socketId === socket.id) {
            ctx.drawImage(
              pawnEle,
              blockSize / 6 + blockSize * oldX,
              blockSize / 6 + blockSize * oldY,
              blockSize - blockSize / 3,
              blockSize - blockSize / 3
            );
          }
          const tempClients = clients.filter((c) => e != c);
          tempClients.forEach((g) => {
            ctx.drawImage(
              cClients[g.socketId],
              blockSize / 6 + blockSize * path[g.position].x,
              blockSize / 6 + blockSize * path[g.position].y,
              blockSize - blockSize / 3,
              blockSize - blockSize / 3
            );
            if (g.socketId === socket.id) {
              ctx.drawImage(
                pawnEle,
                blockSize / 6 + blockSize * path[g.position].x,
                blockSize / 6 + blockSize * path[g.position].y,
                blockSize - blockSize / 3,
                blockSize - blockSize / 3
              );
            }
          });
        }, 20);
      } else {
        ctx.drawImage(
          cClients[e.socketId],
          blockSize / 6 + blockSize * path[e.position].x,
          blockSize / 6 + blockSize * path[e.position].y,
          blockSize - blockSize / 3,
          blockSize - blockSize / 3
        );
        if (e.socketId === socket.id) {
          ctx.drawImage(
            pawnEle,
            blockSize / 6 + blockSize * path[e.position].x,
            blockSize / 6 + blockSize * path[e.position].y,
            blockSize - blockSize / 3,
            blockSize - blockSize / 3
          );
        }
      }
    });
  });
};
