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


