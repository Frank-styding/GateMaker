import { App } from "./App";
/* import { Engine } from "./core/Engine";
import { Vector2D } from "./core/Vector";
import { $$Square } from "./Entities/Square"; */
import "./style.css";

const $app = document.getElementById("app");
const engine = new App();

/* const a = new $$Square(100, 100);
const b = new $$Square(100, 100);
b.pos.add(new Vector2D(300, 300));
b.markDirty();

const root = engine.getRoot();
root.addChild(a).addChild(b);
root.markDirty();
 */
$app!.appendChild(engine.getCanvas());
engine.start();
