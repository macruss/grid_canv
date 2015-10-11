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

  constructor(x:number, y:number, grid: Grid) {
    this.x = x;
    this.y = y;
    this.color = 'black';
    this.grid = grid;
  }
  public draw(): void {
    var ctx = grid.ctx
      , size = grid.cellSize
      , x = toPixel(this.x, size)
      , y = toPixel(this.y, size);

    ctx.fillRect(x, y, size, size);
  };
}


interface GridConfig {
  canvas: HTMLCanvasElement,
  cellSize?: number
}
class Grid {
  private width: number;
  private height: number;
  private cells: Array<any>;
  private canvas: HTMLCanvasElement;
  public ctx: any;
  public cellSize: number;

  constructor(conf: GridConfig) {
    this.canvas = conf.canvas;
    this.ctx = conf.canvas.getContext('2d');
    this.cellSize = conf.cellSize || 10;
    this.width = toRelativeUnit(conf.canvas.width, this.cellSize);
    this.height = toRelativeUnit(conf.canvas.height, this.cellSize);
    this.cells = new Array(this.width * this.height);

    this.draw();
    // events
    this.canvas.onclick = (e) => this.handleClick(e)
    this.canvas.onmousewheel = (e) => this.handleScroll(e)
  }

  private draw(): void {
    var width = this.canvas.width 
      , height = this.canvas.height
      , size = this.cellSize;

    this.ctx.beginPath();

    for (var x = size + 0.5; x < width; x += size) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }

    for (var y = size + 0.5; y < height; y += size) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
    }
    this.ctx.strokeStyle = 'gray';
    this.ctx.stroke();

    this.cells.forEach((cell) => {
      if (cell) cell.draw();
    });
  }

  private setCell(x, y){
    var cell = new Cell(x, y, this);
    this.cells[x + this.width * y] = cell;
    this.redraw();
  }

  private getCell(x, y) {
    return this.cells[x + this.width * y];
  }

  private handleClick(e) {
    var x = toRelativeUnit(e.offsetX, this.cellSize)
    var y = toRelativeUnit(e.offsetY, this.cellSize)
    this.setCell(x, y);
  }

  private handleScroll(e) {
    this.cellSize += e.wheelDelta > 0 ? 5 : -5;
    this.cellSize = Math.max(5, this.cellSize);
    this.redraw();
  }

  private clearGrid() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private redraw() {
    this.clearGrid();
    this.draw();
  }
}


var canvas = <HTMLCanvasElement>document.querySelector("#canvas");

var grid = new Grid({
  canvas: canvas,
  cellSize: 20,
});

// grid.draw();