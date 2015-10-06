class Cell {
  private x: number;
  private y: number;
  private size: number;
  private color: string;
  private grid: Grid;

  constructor(x: number, y: number, grid: Grid) {
    this.x = x;
    this.y = y;
    this.size = grid.cellSize;
    this.color = 'black';
    this.grid = grid;

    this.draw();
  }
  public draw(): void {
    var ctx = grid.ctx
      , x = this.x * this.size
      , y = this.y * this.size
      , size = this.size;

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
    this.width = Math.floor( conf.canvas.width / this.cellSize );
    this.height = Math.floor( conf.canvas.height / this.cellSize );
    this.cells = new Array(this.width * this.height);

    this.draw();
    // events
    this.canvas.onclick = (e) => this.canvasClick(e)
  }

  public draw(): void {
    var width = this.width * this.cellSize
      , height = this.height * this.cellSize;

    for (var x = 0.5; x < width; x += this.cellSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }

    for (var y = 0.5; y < height; y += this.cellSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
    }
    this.ctx.strokeStyle = 'gray';
    this.ctx.stroke();
  }

  private setCell(x, y){
    this.cells[x + this.width * y] = new Cell(x, y, this);
  }

  private getCell(x, y) {
    return this.cells[x + this.width * y];
  }

  private canvasClick(e) {
    var [x, y] = Grid.getVector(e.offsetX, e.offsetY, this.cellSize)
    this.setCell(x, y);
  }

  static getVector(x: number, y: number, size: number): Array<number> {
      return [
          Math.floor(x / size),
          Math.floor(y / size)
      ];
  }

}


var canvas = <HTMLCanvasElement>document.querySelector("#canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var grid = new Grid({
  canvas: canvas,
  cellSize: 10,
});

// grid.draw();