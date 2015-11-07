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
  private wCells : number;
  private hCells : number;
  private cells  : Array<any>;
  private canvas : HTMLCanvasElement;
  private scale  : number;
  public ctx     : any;
  public cellSize: number;
  public mode    : string;
  private zp     : { x: number, y: number };
  private moveStart: any;


  constructor(conf: GridConfig) {
    this.canvas   = conf.canvas;
    this.ctx      = conf.canvas.getContext('2d');
    this.scale    = conf.scale;
    this.cellSize = Math.round(this.scale * 5);
    this.wCells   = conf.ratio[0];
    this.hCells   = conf.ratio[1];
    this.zp       = {x: 0, y: 0};
    this.mode     = 'draw';

    this.cells    = new Array(this.wCells * this.hCells);

    this.draw();

    // events
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e))
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e))
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e))
    this.canvas.addEventListener('mousewheel', (e) => this.handleScroll(e))
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

    for (x = 0.5; x < width + size; x += size) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }

    for (y = 0.5; y < height + size; y += size) {
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

  public zoom(pt, zoomDirection: boolean) {
    // console.log(zoomDireflfffsdaction);
    let delta = zoomDirection ? 1.25 : .8;

    // console.log(Math.round((pt.x - this.zp.x) * (1 - delta)));
    let oldSize = this.cellSize;

    this.scale = Math.max(1, this.scale * delta);
    this.cellSize = Math.round(this.scale * 5);

    if ( this.scale >= 1 ) {
      this.moveStart = true;
      // console.log(this.cellSize / oldSize);
      this.move(
        Math.round((pt.x - this.zp.x) * (1 - this.cellSize / oldSize)), 
        Math.round((pt.y - this.zp.y) * (1 - this.cellSize / oldSize))
      );
      this.moveStart = null;
    }
    // this.zp.x /= delta;
    // this.zp.y /= delta;

    // this.redraw();
  }

  public move(x, y) {
    if (this.moveStart) {
      this.zp.x += x;
      this.zp.y += y;
      this.clearGrid();
      this.ctx.translate(x, y);
      this.redraw();
    }

  }

  public getScale() {
    return this.scale;
  }

  private clearGrid() {
    this.ctx.clearRect(0 - this.zp.x, 0 - this.zp.y, this.canvas.width, this.canvas.height);
  }

  private redraw() {
    this.clearGrid();
    this.draw();
  }

  private inGrid(x, y): boolean {
    return x >= 0 &&
           x < this.wCells && 
           y >= 0 && 
           y < this.hCells
  }

  // event hendlers
  private handleMouseUp(e) {
    var x, y;

    if (this.mode === 'draw') {
      x = toRelativeUnit(e.offsetX - this.zp.x, this.cellSize);
      y = toRelativeUnit(e.offsetY - this.zp.y, this.cellSize);

      if (this.inGrid(x, y)) {
        this.setCell(x, y, colorpicker.value);
      }
    } else {
        this.moveStart = null;
    }

    return e.preventDefault() && false;
  }

  private handleMouseDown(e) {
    if (this.mode === 'move') {
      this.moveStart = { x: e.offsetX, y: e.offsetY };
    }
  }

  private handleMouseMove(e) {
    if (e.which === 1) {
      if (this.mode === 'draw') {
        this.handleMouseUp(e);
      } else {

        this.move(e.movementX, e.movementY);
      }

    }
  }

  private handleScroll(e) {
    var pt = {
        x: e.offsetX,
        y: e.offsetY,
      };
    this.zoom(pt, e.wheelDelta > 0);
  }

}


var canvas = <HTMLCanvasElement>document.querySelector("#canvas");
var colorpicker = <HTMLInputElement>document.querySelector("#colorpicker");
var $btns = <any>document.querySelectorAll(".actions button");

var grid = new Grid({
  canvas: canvas,
  ratio: [70, 60],
  scale: 2,

});

Array.prototype.forEach.call($btns, (el) => { 
  el.addEventListener('click', handleClickActionsBtn) 
});

document.addEventListener('keyup', function(e) {
    e.preventDefault();
    // console.log(e.which);
    if ( e.which === 17 ) {
        grid.mode = 'draw';
        canvas.style.cursor = 'default';
        $btns[0].classList.add('selected');
        $btns[1].classList.remove('selected');
    }
    if ( e.altKey && e.ctrlKey ) {
        if (e.which === 68 || e.which === 17) {
            grid.mode = 'draw';
            canvas.style.cursor = 'default';
            $btns[0].classList.add('selected');
            $btns[1].classList.remove('selected');
        }
        if ( e.which === 77 ) {
            grid.mode = 'move';
            canvas.style.cursor = 'move';
            $btns[1].classList.add('selected');
            $btns[0].classList.remove('selected');
        }
    }
});

document.addEventListener('keydown', function(e) { 
    if ( e.ctrlKey ) {
        grid.mode = 'move';
        canvas.style.cursor = 'move';
        $btns[1].classList.add('selected');
        $btns[0].classList.remove('selected');
    }
});


function handleClickActionsBtn (e) {
  grid.mode = e.currentTarget.id;
  if (!hasClass(e.currentTarget, 'selected')) {
    grid.mode = e.currentTarget.id;
    // console.log(grid.mode);
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
