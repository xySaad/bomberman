import { SelfUser } from "../app/state/user";

export function HandleKeys(e) {
    let input = null
    switch (e.key) {
        case "ArrowUp":
            input = "up"
            break;
        case "ArrowDown":
            input = "down"
            break;
        case "ArrowRight":
            input = "right"
            break;
        case "ArrowLeft":
            input = "left"
            break;
        case " ":
            input = "Space"
            break;
        default:
            break;
    }
console.log(input);

    SelfUser.send({
        type: "player_input",
        input: input
    });
}

