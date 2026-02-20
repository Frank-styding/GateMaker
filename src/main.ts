import { App } from "./editor/App";

import "./style.css";

const $app = document.getElementById("app");
const engine = new App();

const button = document.createElement("button");
button.className = "button";
button.innerHTML = "TEST";
button.addEventListener("click", () => {});

$app!.appendChild(engine.getCanvas());
engine.start();
