class Pixel {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private color: string;

  constructor(x: number, y: number, grid: Grid) {
    this.width = this.height = grid.resolution;
    this.color = 'white';
  }
}


interface GridConfig {
  canvas: HTMLCanvasElement,
  resolution?: number
}
class Grid {
  private ctx: any;
  private width: number;
  private height: number;
  private pixels: [Pixel];
  private canvas: HTMLCanvasElement;
  public resolution: number;

  constructor(conf: GridConfig) {
    this.canvas = conf.canvas;
    this.ctx = conf.canvas.getContext('2d');
    this.width = conf.canvas.width;
    this.height = conf.canvas.height;
    this.resolution = conf.resolution || 10;

    // events
    this.canvas.onclick = (e) => this.canvasClick(e)
  }

  public draw(): void {
    for (var x: number = 0.5; x < this.width; x += this.resolution) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }

    for (var y: number = 0.5; y < this.height; y += this.resolution) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }
    this.ctx.strokeStyle = 'gray';
    this.ctx.stroke();
  }

  private fillPixels(){
    for (var x: number = 0.5; x < this.width; x += this.resolution) {
      for (var y: number = 0.5; y < this.height; y += this.resolution) {
        this.pixels.push(new Pixel(x, y, this))
      }
    }
  }

  private findPixel(x, y) {
    
  }

  private canvasClick(e) {
    console.log(e);
  }

}


var canvas = <HTMLCanvasElement>document.querySelector("#canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var grid = new Grid({
  canvas: canvas,
  resolution: 10,
});

grid.draw();