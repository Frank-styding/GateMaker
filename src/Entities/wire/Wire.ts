// Wire.ts
import { Entity, LineCollider, Vector2D } from "../../core";
import { AppEvents } from "../../editor/Events";
import { GridManager } from "../../editor/GridManager";
import { WireRouter } from "./WireRouter";
import type { NodeEntity } from "../NodeEntity";

export class Wire extends Entity {
  static LINE_HEIGHT: number = 12;

  public startNode!: NodeEntity;
  public endNode!: NodeEntity;
  public startPin!: string;
  public endPin!: string;
  public dirty = true;
  public startPos: Vector2D;
  public endPos: Vector2D;
  public path: Vector2D[];
  public points: Vector2D[];
  _cells: number[] = [];

  completed: boolean;
  constructor() {
    super();
    this.path = [];
    this.points = [];
    this.layerIdx = 0;
    this.startPos = new Vector2D();
    this.endPos = new Vector2D();
    this.completed = false;
  }

  protected init(): void {
    this.collider = new LineCollider(this.path, Wire.LINE_HEIGHT);
  }

  protected updateBounding(): void {
    if (this.path.length == 0) return;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let minY = Infinity;

    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      if (maxX < p.x) maxX = p.x;
      if (maxY < p.y) maxY = p.y;
      if (minX > p.x) minX = p.x;
      if (minY > p.y) minY = p.y;
    }
    const pad = Wire.LINE_HEIGHT / 2;
    this.bounding.width = maxX - minX + pad * 2;
    this.bounding.height = maxY - minY + pad * 2;
    this.bounding.pos.set((maxX + minX) / 2, (maxY + minY) / 2);
  }

  public startWire(node: NodeEntity, name: string, pos: Vector2D) {
    this.startNode = node;
    this.startPin = name;
    this.startPos.set(pos);
    this.endPos.set(pos);
    this.path.push(this.startPos);
    this.points.push(this.startPos);
  }

  public endWire(node: NodeEntity, name: string, pos: Vector2D) {
    this.endNode = node;
    this.endPin = name;
    this.endPos.set(pos);
    this.endNode.setWirePos(this.endPin, this, this.endPos);
    this.startNode.setWirePos(this.startPin, this, this.startPos);
    this.points.push(this.endPos);
    this.path.push(this.endPos);
    this.completed = true;
    this.recalc();
  }

  public addPoint(pos: Vector2D) {
    GridManager.snap(pos);
    pos.x += GridManager.CELL_SIZE / 2;
    pos.y += GridManager.CELL_SIZE / 2;
    this.path.push(pos);
    this.points.push(pos);
  }

  public moveLastPoint(pos: Vector2D) {
    GridManager.snap(pos);
    pos.x += GridManager.CELL_SIZE / 2;
    pos.y += GridManager.CELL_SIZE / 2;
    this.endPos.set(pos);
  }

  protected updateCollider(): void {}
  protected render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = Wire.LINE_HEIGHT;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "blue";

    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      if (i == 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    if (!this.completed) ctx.lineTo(this.endPos.x, this.endPos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = Wire.LINE_HEIGHT - 3;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#FFFFFF";
    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      if (i == 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    if (!this.completed) ctx.lineTo(this.endPos.x, this.endPos.y);

    ctx.stroke();
    ctx.restore();
  }

  static adjustPos(p: Vector2D) {
    const cellSize = GridManager.CELL_SIZE;
    p.y = Math.floor(p.y / cellSize) * cellSize;
    p.x = Math.floor(p.x / cellSize) * cellSize;
    p.x += cellSize / 2;
    p.y += cellSize / 2;
  }

  public delete() {
    this.startNode.deleteWire(this.startPin);
    this.endNode.deleteWire(this.endPin);
    this.parent?.deleteChild(this);
    const grid = AppEvents.get("grid")!;
    grid.unregisterWire(this);
  }

  public getNodes() {
    return [this.startNode, this.endNode];
  }

  /**
   * Ajusta los codos iniciales y finales para mantener ángulos de 90 grados
   * conectando perfectamente la posición libre del nodo con la red ajustada a la grid.
   */
  public refreshPathLayout() {
    const n = this.path.length;
    // Se necesitan al menos 3 puntos (Start -> Codo -> End) para tener geometría ajustable
    if (n < 3) {
      this.updateBounding();
      return;
    }

    // --- AJUSTE DEL INICIO (Start -> P1 -> P2) ---
    const start = this.path[0]; // Nodo (posición libre)
    const p1 = this.path[1]; // Primer codo (debe ser el puente)
    const p2 = this.path[2]; // Siguiente punto (ya alineado a la grid)

    // Determinamos la orientación del segmento "interno" (P1 -> P2)
    // Comparamos distancias para ver si es más vertical u horizontal
    const startSegIsVertical = Math.abs(p1.x - p2.x) < Math.abs(p1.y - p2.y);

    if (startSegIsVertical) {
      // Si el cable baja/sube hacia la grid (Vertical):
      // El tramo Start -> P1 debe ser HORIZONTAL.
      p1.y = start.y; // Altura igual al nodo
      p1.x = p2.x; // X igual al cable de la grid (alineación estricta)
    } else {
      // Si el cable va hacia los lados (Horizontal):
      // El tramo Start -> P1 debe ser VERTICAL.
      p1.x = start.x; // X igual al nodo
      p1.y = p2.y; // Altura igual al cable de la grid (alineación estricta)
    }

    // --- AJUSTE DEL FINAL (Pn-2 -> Pn-1 -> End) ---
    // Solo si hay suficientes puntos para que el inicio y el final no sean el mismo codo
    // o para manejar el recálculo independiente si n=3.
    if (n >= 3) {
      const end = this.path[n - 1]; // Nodo destino (posición libre)
      const pn1 = this.path[n - 2]; // Último codo (puente)
      const pn2 = this.path[n - 3]; // Punto anterior (alineado a la grid)

      const endSegIsVertical =
        Math.abs(pn1.x - pn2.x) < Math.abs(pn1.y - pn2.y);

      if (endSegIsVertical) {
        // Si viene vertical desde la grid:
        // El tramo Pn1 -> End debe ser HORIZONTAL.
        pn1.y = end.y; // Altura igual al nodo final
        pn1.x = pn2.x; // X igual al cable anterior
      } else {
        // Si viene horizontal desde la grid:
        // El tramo Pn1 -> End debe ser VERTICAL.
        pn1.x = end.x; // X igual al nodo final
        pn1.y = pn2.y; // Altura igual al cable anterior
      }
    }

    this.updateBounding();
  }
  public recalc() {
    const grid = AppEvents.get("grid")!;
    grid.unregisterWire(this);

    const userPoints: Vector2D[] = this.points.map((p) => p.clone());
    let fullPath: Vector2D[] = [];

    for (let i = 0; i < userPoints.length - 1; i++) {
      const from = userPoints[i];
      const to = userPoints[i + 1];

      // Dirección inicial solo en el primer tramo
      let startDir: Vector2D | undefined;
      if (i === 0) {
        startDir = new Vector2D(from.x > this.startNode.pos.x ? 1 : -1, 0);
      }

      // Dirección final solo en el último tramo
      let endDir: Vector2D | undefined;
      if (i === userPoints.length - 2) {
        endDir = new Vector2D(to.x < this.endNode.pos.x ? -1 : 1, 0);
      }

      const segment = WireRouter.route(grid, from, to, startDir, endDir, this);

      if (segment.length === 0) continue;

      // Evitar duplicar el punto de unión
      if (i > 0) segment.shift();

      fullPath.push(...segment);
    }

    if (fullPath.length === 0) {
      fullPath = userPoints;
    }
    grid.registerWirePath(this, fullPath);
    const simplified = WireRouter.simplifyPath(fullPath);
    this.path.length = 0;
    this.path.push(this.startPos);
    for (const p of simplified) this.path.push(p);
    this.path.push(this.endPos);
    this.markDirty();
  }
}
