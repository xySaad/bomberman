import html from "rbind";

const WIDTH = 15;
const HEIGHT = 15;

// Cell types
// 0: wall, 1: ground, 2: box, 3: unbreakable box
const getClass = {
    0: "cell wall",
    1: "cell ground",
    2: "cell box",
    3: "cell unbreakable",
};

const isCornerSpawnZone = (x, y) => {
    // 3x3 area in each corner
    const inTopLeft = x < 3 && y < 3;
    const inTopRight = x > WIDTH - 4 && y < 3;
    const inBottomLeft = x < 3 && y > HEIGHT - 4;
    const inBottomRight = x > WIDTH - 4 && y > HEIGHT - 4;
    return inTopLeft || inTopRight || inBottomLeft || inBottomRight;
};

const generateMap = () => {
    const map = [];

    for (let y = 0; y < HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < WIDTH; x++) {
            if (x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1) {
                row.push(0); // wall
            } else if (isCornerSpawnZone(x, y)) {
                row.push(1); // ground for player spawn and escape
            } else if (x % 2 === 0 && y % 2 === 0) {
                row.push(3); // unbreakable box
            } else {
                row.push(Math.random() < 0.7 ? 2 : 1); // box or ground
            }
        }
        map.push(row);
    }

    return map;
};

export const PlayGround = () => {
    const map = generateMap();
    console.log(map);

    return html.div({ class: "playground-grid" }).add(...map.flatMap((row) =>
        row.map((type) =>
            html.div({
                class: getClass[type] || "cell unknown",
            })
        )
    ));
   


};
