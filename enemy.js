import { Bomb } from "./bomb.js";
import { CELL_SIZE } from "./script.js";

export class Enemy {
  constructor() {
    const div = document.createElement("div");
    const style = div.style;
    this.style = style;
    style.backgroundImage = "url('ressources/enemy.png')";
    style.backgroundSize = "360px";
    style.width = "40px";
    style.height = "45px";
    style.position = "absolute";
    div.classList.add("enemy");

    const floors = [...document.querySelectorAll(".floor")];
    const randomIndex = Math.floor(Math.random() * floors.length - 1);
    const choosedFloor = floors[randomIndex];

    choosedFloor.onload = () => {
      style.left = `${choosedFloor.offsetLeft}px`;
      style.top = `${choosedFloor.offsetTop}px`;
    };

    const floorX = choosedFloor.getAttribute("data-x");
    const floorY = choosedFloor.getAttribute("data-y");
    this.x = Number(floorX);
    this.y = Number(floorY);

    this.frameX = 0;
    this.directionY = 0;
    this.waitingForBomb = false;

    setTimeout(() => {
      requestAnimationFrame(() => this.moveRandomly());
      requestAnimationFrame((timestamp) => this.animateSprite(timestamp));
    }, 1000);
    return div;
  }

  async moveRandomly() {    
    const nextPoint = {
      x: this.x,
      y: this.y,
    };

    const randomSign = Math.random() > 0.5 ? -1 : 1;
    const randomDirection = Math.random() > 0.5 ? "x" : "y";
    nextPoint[randomDirection] += 1 * randomSign;

    const nextBlock = document.querySelector(
      `.floor[data-x="${nextPoint.x}"][data-y="${nextPoint.y}"]`
    );

    if (nextBlock) {
      await this.step(randomSign, randomDirection);
    }
    requestAnimationFrame(() => this.moveRandomly());
  }
  async goToPlayer(entity, forcedDirection) {
    const distanceX = entity.x - this.x;
    const distanceY = entity.y - this.y;

    const direction = forcedDirection || (distanceX !== 0 ? "x" : "y");
    let newForcedDirection;
    const distance = direction === "x" ? distanceX : distanceY;
    const sign = getSign(distance);
    const newX = direction === "x" ? this.x + 1 * sign : this.x;
    const newY = direction === "y" ? this.y + 1 * sign : this.y;

    if (
      (Math.abs(distanceX) <= 1 && Math.abs(distanceY) === 0) ||
      (Math.abs(distanceX) === 0 && Math.abs(distanceY) <= 1)
    ) {
      await this.throwBomb(sign, direction);
    }

    const nextBlock = document.querySelector(
      `[data-x="${newX}"][data-y="${newY}"]`
    );

    if (nextBlock.classList.contains("floor")) {
      await this.step(sign, direction);
    } else if (nextBlock.classList.contains("breakable")) {
      await this.throwBomb(sign, direction);
    } else {
      newForcedDirection = direction === "x" ? "y" : "x";
    }

    this.goToPlayer(entity, newForcedDirection);
  }

  step(distanceSign, direction) {
    const style = direction === "x" ? "top" : "left";

    const duration = 600;
    const startValue = parseInt(this.style[style]) || 0;
    const startTime = performance.now();
    const distance = distanceSign * CELL_SIZE;
    this[direction] += 1 * distanceSign;

    return new Promise((resolve) => {
      const animate = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = elapsed / duration;
        const currentValue = startValue + distance * progress;
        this.style[style] = `${currentValue}px`;

        if (direction === "x") {
          if (distance > 0) {
            this.directionY = 0;
          } else {
            this.directionY = -138;
          }
        } else if (direction === "y") {
          if (distance > 0) {
            this.directionY = -CELL_SIZE;
          } else {
            this.directionY = -92;
          }
        }

        this.style.backgroundPositionY = `${this.directionY}px`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  animateSprite = (timestamp) => {
    if (!this.lastFrameTime) this.lastFrameTime = timestamp;
    const elapsed = timestamp - this.lastFrameTime;

    if (elapsed >= 200) {
      if (this.waitingForBomb) {
        this.frameX = 0;
        this.style.backgroundPositionX = 0;
      } else {
        this.frameX = (this.frameX + 1) % 3;
        this.style.backgroundPositionX = `-${this.frameX * CELL_SIZE}px`;
      }
      this.lastFrameTime = timestamp;
    }

    requestAnimationFrame((timestamp) => this.animateSprite(timestamp));
  };
  async throwBomb(sign, direction) {
    const otherDirection = direction === "x" ? "y" : "x";
    new Bomb(this.x, this.y);

    const getNextBlock = (a, b) =>
      document.querySelector(
        `.floor[data-${direction}="${a}"][data-${otherDirection}="${b}"]`
      );

    if (getNextBlock(this[direction] + 1 * -sign, this[otherDirection])) {
      await this.step(-sign, direction);
    } else {
      await this.step(-sign, otherDirection);
    }

    if (getNextBlock(this[direction] + 1 * -sign, this[otherDirection])) {
      await this.step(-sign, direction);
    } else if (
      getNextBlock(this[direction], this[otherDirection] + 1 * -sign)
    ) {
      await this.step(-sign, otherDirection);
    } else {
      await this.step(sign, otherDirection);
    }

    this.waitingForBomb = true;
    await new Promise((res) => setTimeout(res, 2400));
    this.waitingForBomb = false;
  }
}

const getSign = (a) => (a < 0 ? -1 : 1);
