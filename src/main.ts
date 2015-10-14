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
  ratio: Array<number>
}
class Grid {
  private wCells  : number;
  private hCells : number;
  private cells  : Array<any>;
  private canvas : HTMLCanvasElement;
  private scale  : number;
  public ctx     : any;
  public cellSize: number;
  public mode    : string;

  constructor(conf: GridConfig) {
    this.canvas   = conf.canvas;
    this.ctx      = conf.canvas.getContext('2d');
    this.scale    = conf.scale;
    this.cellSize = Math.floor(this.scale * 5);
    this.wCells   = conf.ratio[0];
    this.hCells   = conf.ratio[1];
    this.mode     = 'draw';

    this.cells    = new Array(this.wCells * this.hCells);

    this.draw();

    // events
    this.canvas.onmouseup = (e) => this.handleClick(e)
    this.canvas.onmousemove = (e) => this.handleMouseMove(e)
    this.canvas.onmousewheel = (e) => this.handleScroll(e)
  }

  static transformedPoint(x: number, y: number) {
    return {x:x, y:y}
  }

  private draw(): void {
    var width  = toPixel(this.wCells, this.cellSize)
      , height = toPixel(this.hCells, this.cellSize)
      , size   = this.cellSize
      , x, y;

    this.ctx.beginPath();

    for (x = size + 0.5; x < width + size; x += size) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }

    for (y = size + 0.5; y < height + size; y += size) {
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
    if (!this.cells[x + this.wCells * y]) {
      this.cells[x + this.wCells * y] = new Cell(x, y, color, this);
    } else {
        this.cells[x + this.wCells * y].setColor(color)
    }
  this.redraw();

  }

  private getCell(x, y) {
    return this.cells[x + this.wCells * y];
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

  private inGrid(x, y): boolean {
    return x < this.wCells && y < this.hCells
  }

  // event hendlers
  private handleClick(e) {
    var x, y;

    x = toRelativeUnit(e.offsetX, this.cellSize);
    y = toRelativeUnit(e.offsetY, this.cellSize);

    if (this.inGrid(x, y)) {
      this.setCell(x, y, colorpicker.value);
    }
    return e.preventDefault() && false;
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
var $btns = <any>document.querySelectorAll(".actions button");

var grid = new Grid({
  canvas: canvas,
  ratio: [50, 50],
  scale: 1.5,

});

Array.prototype.forEach.call($btns, (el) => { 
  el.addEventListener('click', handleClickActionsBtn) 
});


function handleClickActionsBtn (e) {
  grid.mode = e.currentTarget.id;
  if (!hasClass(e.currentTarget, 'selected')) {
    toggleClass($btns, 'selected');
  }
}

function toggleClass(elements: Array<HTMLElement>, cls: string) {
  Array.prototype.forEach.call(elements, (el) => {
    if ( hasClass(el, cls) ) {
      el.classList.remove(cls);
    } else {
      el.classList.add(cls);
    }
  });
}

function hasClass(el: HTMLElement, cls: string): boolean {
  return  Array.prototype.indexOf.call(el.classList, cls) > -1
}
