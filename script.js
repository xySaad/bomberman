import { Bomb } from "./bomb.js";
import { Enemy } from "./enemy.js";
const MAX_BOMBS = 1; // should be a property in the character class
export const CELL_SIZE = 46;
const playground = document.getElementById("game-area");

export let gameState = {
  lives: 3,
  score: 0,
  characterX: 1,
  characterY: 1,
  characterElement: null,
  isMoving: false,
  frameIndex: 0,
  moveSpeed: 100, // pixels per second
  animationFrame: null,
  lastFrameTime: performance.now(),
  frameDelay: 100, // milliseconds between sprite frames
  lastMoveTime: 0,
  activeKey: null, // Track which key is currently pressed
  currentDirection: null,
  spriteFrameWidth: 40, // Each frame is 40px wide
  spriteFrameHeight: 52, // Each frame is 52px tall
  directionFrames: {
    ArrowDown: { offset: 0, maxFrames: 3 },
    ArrowRight: { offset: 3, maxFrames: 3 },
    ArrowLeft: { offset: 6, maxFrames: 3 },
    ArrowUp: { offset: 9, maxFrames: 3 },
  },
};

function constructPlayGround() {
  const map = document.createElement("div");

  for (let i = 0; i < 11; i++) {
    let row = document.createElement("div");
    row.className = "game-row";

    for (let j = 0; j < 13; j++) {
      let ground = document.createElement("img");

      if (
        i === 0 ||
        i === 10 ||
        j === 0 ||
        j === 12 ||
        (j % 2 === 0 && i % 2 === 0)
      ) {
        ground.src = "ressources/durable-wall.png";
      } else {
        ground.src = "ressources/floor.png";
        ground.classList.add("floor");
      }

      ground.setAttribute("data-x", i);
      ground.setAttribute("data-y", j);
      row.appendChild(ground);
    }
    map.appendChild(row);
  }
  playground.appendChild(map);
  placeDestructible();
  placeCharacter();
  const enemies = [new Enemy(), new Enemy()];

  playground.append(...enemies);
}

function placeDestructible() {
  let count = 0;
  while (count < 30) {
    const x = Math.floor(Math.random() * 9) + 1;
    const y = Math.floor(Math.random() * 11) + 1;

    let grid = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);

    if (grid && grid.src.includes("floor") && isNotStartPosition(x, y)) {
      grid.classList.remove("floor");
      grid.classList.add("breakable");
      grid.src = "ressources/destructible-wall.png";
      count++;
    }
  }
}

function isNotStartPosition(x, y) {
  return !(
    (x === 1 && y === 1) ||
    (x === 1 && y === 2) ||
    (x === 2 && y === 1)
  );
}
function placeCharacter() {
  let char = document.getElementById("character");
  if (char) document.body.remove(char);
  const gridCell = document.querySelector(`[data-x="1"][data-y="1"]`);
  if (!gridCell) return console.error("Character spawn point not found!");

  const character = document.createElement("div");
  character.className = "character";
  character.id = "character";
  character.style.zIndex = "2";
  // Set initial character sprite
  character.style.width = "40px";
  character.style.height = "52px";
  character.style.backgroundImage = 'url("ressources/spritesheet.png")';
  character.style.backgroundPosition = "0px 0px";
  character.style.position = "absolute";

  let totalWidth = 0;
  let totalHeight = 0;

  gridCell.onload = function () {
    totalWidth = gridCell.width * 11;
    totalHeight = gridCell.height * 9;

    // Set character positioning relative to the grid
    character.style.left = `${gridCell.offsetLeft}px`;
    character.style.top = `${gridCell.offsetTop}px`;
    character.style.backgroundSize = `${totalWidth}px ${totalHeight}px`;
  };

  // Store character reference
  gameState.characterElement = character;
  playground.appendChild(character);
}

function animateMovement(
  element,
  startX,
  startY,
  endX,
  endY,
  direction,
  onComplete
) {
  const distance = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );
  const duration = (distance / gameState.moveSpeed) * 1000;

  let startTime = performance.now();
  let lastFrameTime = startTime;
  const frameData = gameState.directionFrames[direction];
  let frameIndex = 0;

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Update position
    element.style.left = `${startX + (endX - startX) * progress}px`;
    element.style.top = `${startY + (endY - startY) * progress}px`;

    // Update sprite animation
    if (currentTime - lastFrameTime > gameState.frameDelay) {
      frameIndex = (frameIndex + 1) % frameData.maxFrames;
      const frameOffset = frameData.offset + frameIndex;
      element.style.backgroundPosition = `-${frameOffset * 40 + 5}px 0px`;
      lastFrameTime = currentTime;
    }

    if (progress < 1) {
      gameState.animationFrame = requestAnimationFrame(step);
    } else {
      cancelAnimationFrame(gameState.animationFrame);
      onComplete();
    }
  }

  // Initialize first frame immediately
  element.style.backgroundPosition = `-${frameData.offset * 43}px 0px`;
  gameState.animationFrame = requestAnimationFrame(step);
}

// Update the moveCharacter function to pass direction to animateMovement
function moveCharacter(direction) {
  // returns timestamp now with decimal point != Date.now
  const now = performance.now();
  // throttle the movement at 60fps
  if (now - gameState.lastMoveTime < 17) return;

  // Calculate new position
  let newX = gameState.characterX;
  let newY = gameState.characterY;

  switch (direction) {
    case "ArrowDown":
      newX++;
      break;
    case "ArrowUp":
      newX--;
      break;
    case "ArrowLeft":
      newY--;
      break;
    case "ArrowRight":
      newY++;
      break;
    default:
      return;
  }

  // Check if new position is valid
  let newGridCell = document.querySelector(
    `[data-x="${newX}"][data-y="${newY}"]`
  );
  if (
    !newGridCell ||
    newGridCell.src.includes("durable-wall") ||
    newGridCell.src.includes("destructible-wall")
  ) {
    return;
  }

  gameState.isMoving = true;
  gameState.currentDirection = direction;
  gameState.lastMoveTime = now;

  let char = gameState.characterElement;
  let startX = char.offsetLeft;
  let startY = char.offsetTop;
  let endX = newGridCell.offsetLeft;
  let endY = newGridCell.offsetTop;

  if (gameState.animationFrame) {
    cancelAnimationFrame(gameState.animationFrame);
  }

  //change charcter's x and y before  animateMovement to accuratly spawn the bomb
  gameState.characterX = newX;
  gameState.characterY = newY;
  animateMovement(char, startX, startY, endX, endY, direction, () => {
    gameState.isMoving = false;

    if (gameState.activeKey) {
      moveCharacter(gameState.activeKey);
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
    gameState.activeKey = e.key;
    if (!gameState.isMoving) {
      moveCharacter(e.key);
    }
  }

  if (e.code === "Space") {
    const bombCount = document.querySelectorAll(".bomb#player").length;
    if (bombCount === MAX_BOMBS) {
      return;
    }
    const bomb = new Bomb(gameState.characterX, gameState.characterY, "player");
  }
});

document.addEventListener("keyup", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
    // Only clear if this was the active key
    if (e.key === gameState.activeKey) {
      gameState.activeKey = null;
    }
  }
});

constructPlayGround();
