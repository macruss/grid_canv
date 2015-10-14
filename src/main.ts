var toRelativeUnit = (n: number, ratio: number): number => {
    return Math.floor(n / ratio);
}
var toPixel = (n: number, ratio: number): number => {
    return n * ratio;
}

class Cell {
  private x: number;
  private y: number;
  private color: string;
  private grid: Grid;

  constructor(x:number, y:number, color: string, grid: Grid) {
    this.x     = x;
    this.y     = y;
    this.color = color;
    this.grid  = grid;
  }
  public draw(): void {
    var ctx  = grid.ctx
      , size = grid.cellSize
      , x    = toPixel(this.x, size) + 1
      , y    = toPixel(this.y, size) + 1;

    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, size - 1, size - 1);
  }
  public setColor(color: string) {
    this.color = color;
    this.draw();
  }
}


interface GridConfig {
  canvas: HTMLCanvasElement,
  scale?: number
}
class Grid {
  private width  : number;
  private height : number;
  private cells  : Array<any>;
  private canvas : HTMLCanvasElement;
  private scale  : number;
  public ctx     : any;
  public cellSize: number;

  constructor(conf: GridConfig) {
    this.canvas   = conf.canvas;
    this.ctx      = conf.canvas.getContext('2d');
    this.scale    = conf.scale;
    this.cellSize = Math.floor(this.scale * 5);
    this.width    = toRelativeUnit(conf.canvas.width, this.cellSize);
    this.height   = toRelativeUnit(conf.canvas.height, this.cellSize);

    this.cells    = new Array(this.width * this.height);

    this.draw();

    // events
    this.canvas.onmouseup = (e) => this.handleClick(e)
    this.canvas.onmousemove = (e) => this.handleMouseMove(e)
    this.canvas.onmousewheel = (e) => this.handleScroll(e)
  }

  private draw(): void {
    var width  = this.canvas.width 
      , height = this.canvas.height
      , size   = this.cellSize
      , x, y;

    this.ctx.beginPath();

    for (x = size + 0.5; x < width; x += size) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }

    for (y = size + 0.5; y < height; y += size) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
    }
    this.ctx.strokeStyle = 'lightgray';
    this.ctx.stroke();

    this.cells.forEach((cell) => {
      if (cell) cell.draw();
    });
  }

  private setCell(x, y, color) {
    if (!this.cells[x + this.width * y]) {
      this.cells[x + this.width * y] = new Cell(x, y, color, this);
    } else {
        this.cells[x + this.width * y].setColor(color)
    }
  this.redraw();

  }

  private getCell(x, y) {
    return this.cells[x + this.width * y];
  }

  public setScale(scale: number) {
    this.scale = scale;
    this.cellSize = Math.floor(this.scale * 5);
    this.redraw();
  }

  public getScale() {
    return this.scale;
  }

  private clearGrid() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private redraw() {
    this.clearGrid();
    this.draw();
  }

  // event hendlers
  private handleClick(e) {
    var x = toRelativeUnit(e.offsetX, this.cellSize)
      , y = toRelativeUnit(e.offsetY, this.cellSize);
    this.setCell(x, y, colorpicker.value);
  }

  private handleMouseMove(e) {
    if (e.which === 1) {
      this.handleClick(e);
    }
  }

  private handleScroll(e) {
    var scale = this.scale;

    scale += e.wheelDelta > 0 ? 0.25 : -0.25;
    scale = Math.max(1, scale);

    this.setScale(scale);
  }

}


var canvas = <HTMLCanvasElement>document.querySelector("#canvas");
var colorpicker = <HTMLInputElement>document.querySelector("#colorpicker");

var grid = new Grid({
  canvas: canvas,
  scale: 2,
});
