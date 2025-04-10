import { CELL_SIZE } from "./script.js";


export class Bomb {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    const gridCell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    const playground = document.getElementById("game-area");
    const bomb = document.createElement("div");
    const style = bomb.style;

    bomb.classList.add("bomb");
    bomb.id = id
    style.position = "absolute";
    style.left = `${gridCell.offsetLeft}px`;
    style.top = `${gridCell.offsetTop}px`;
    style.backgroundImage = "url('/ressources/bomb.png')";
    style.width = "40px";
    style.height = "40px";
    style.backgroundSize = "cover";
    style.backgroundPositionX = "1%";
    this.frameDelay = 200;
    playground.append(bomb);
    this.bomb = bomb;
    this.totalFrames = 3;
    this.frame = 1;
    this.frameSize = 38;
    this.lastCall = performance.now();
    this.animate();

    //trigger explosion
    setTimeout(() => this.explode(), 3000);
  }

  animate(time) {
    if (this.isExploded && this.frame === 0) {
      this.bomb.remove();
      return;
    }
    if (time - this.lastCall > this.frameDelay) {
      this.lastCall = time;
      const style = this.bomb.style;

      style.backgroundPositionX = this.frame * this.frameSize + "px";
      this.frame = (this.frame + 1) % this.totalFrames;
    }

    requestAnimationFrame((time) => this.animate(time));
  }
  explode() {
    const EXPLOSION_FRAME_SIZE = CELL_SIZE * 3;
    this.frame = 1;
    this.isExploded = true;
    this.totalFrames = 4;
    const style = this.bomb.style;
    style.backgroundImage = "url('/ressources/explosion.png')";
    style.backgroundSize = this.totalFrames * 100 + "%";
    style.backgroundPositionX = "0";
    style.width = EXPLOSION_FRAME_SIZE + "px";
    style.height = EXPLOSION_FRAME_SIZE + "px";
    style.left = parseInt(style.left) - CELL_SIZE + "px";
    style.top = parseInt(style.top) - CELL_SIZE + "px";
    this.frameSize = EXPLOSION_FRAME_SIZE;
    this.lastCall = performance.now();
    this.frameSize = -this.frameSize; // noidea
    this.animate();
    this.breakSurroundingBlocks();
  }
  breakSurroundingBlocks() {
    const damagedAreas = [
      // [this.x, this.y], // No need ig
      [this.x, this.y + 1],
      [this.x, this.y - 1],
      [this.x + 1, this.y],
      [this.x -1, this.y],
    ];

    damagedAreas.forEach((area) => {
      const x = area[0];
      const y = area[1];

      const floor = document.createElement("img");
      floor.src = "ressources/floor.png";
      floor.classList.add("floor")
      floor.setAttribute("data-x", x);
      floor.setAttribute("data-y", y);

      const brick = document.querySelector(
        `.breakable[data-x="${x}"][data-y="${y}"]`
      );
      brick?.replaceWith(floor);
    });
  }
}
