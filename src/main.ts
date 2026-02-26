import { App } from "./editor/App";

import "./style.css";

const $app = document.getElementById("app");
const engine = new App();

const button = document.createElement("button");
button.className = "button";
button.innerHTML = "Play";
button.addEventListener("click", () => {
  engine.test();
});

$app!.appendChild(engine.getCanvas());
$app!.appendChild(engine.getContextMenu());
$app!.appendChild(engine.getNodeCalalog());
$app!.appendChild(button);
engine.start();
