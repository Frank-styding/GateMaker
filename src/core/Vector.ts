export class Vector2D {
  public x: number = 0;
  public y: number = 0;
  constructor(a: { x: number; y: number } | number = 0, b: number = 0) {
    if (typeof a == "object") {
      this.x = a.x;
      this.y = a.y;
    } else {
      this.x = a;
      this.y = b!;
    }
  }

  // --------- Métodos básicos ---------

  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v: Vector2D): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  // --------- Operaciones matemáticas ---------

  add(v: Vector2D): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v: Vector2D): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  multiply(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar: number): this {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
    }
    return this;
  }

  // ===============================
  // 🔥 MÉTODOS DE ÁNGULO
  // ===============================

  /**
   * Ángulo del vector respecto al eje X (en radianes)
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Ángulo entre este vector y otro (en radianes)
   */
  angleBetween(v: Vector2D): number {
    const dot = this.dot(v);
    const magProduct = this.magnitude() * v.magnitude();

    if (magProduct === 0) return 0;

    return Math.acos(dot / magProduct);
  }

  /**
   * Rota el vector un ángulo (en radianes)
   */
  rotate(angle: number): this {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;

    this.x = x;
    this.y = y;

    return this;
  }

  /**
   * Convierte radianes a grados
   */
  static toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Convierte grados a radianes
   */
  static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // --------- Magnitud y normalización ---------

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): this {
    const mag = this.magnitude();
    if (mag !== 0) {
      this.divide(mag);
    }
    return this;
  }

  distance(v: Vector2D): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // --------- Producto punto ---------

  dot(v: Vector2D): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vector2D): number {
    return this.x * v.y - this.y * v.x;
  }

  // --------- Utilidades ---------

  equals(v: Vector2D): boolean {
    return this.x === v.x && this.y === v.y;
  }

  toString(): string {
    return `Vector2D(${this.x}, ${this.y})`;
  }
  // ===============================
  // 🔥 NORMAL
  // ===============================

  /**
   * Devuelve la normal izquierda (perpendicular)
   * No modifica el vector original
   */
  normal(): Vector2D {
    return new Vector2D(-this.y, this.x);
  }

  /**
   * Devuelve la normal derecha
   */
  normalRight(): Vector2D {
    return new Vector2D(this.y, -this.x);
  }

  /**
   * Normal unitaria (perpendicular normalizada)
   */
  unitNormal(): Vector2D {
    return this.normal().normalize();
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  abs(): Vector2D {
    return new Vector2D(Math.abs(this.x), Math.abs(this.y));
  }

  // --------- Métodos estáticos ---------

  static add(v1: Vector2D, v2: Vector2D): Vector2D {
    return new Vector2D(v1.x + v2.x, v1.y + v2.y);
  }

  static subtract(v1: Vector2D, v2: Vector2D): Vector2D {
    return new Vector2D(v1.x - v2.x, v1.y - v2.y);
  }

  static zero(): Vector2D {
    return new Vector2D(0, 0);
  }
}
