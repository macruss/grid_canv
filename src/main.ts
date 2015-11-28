var toRelativeUnit = (n: number, ratio: number): number => {
    return Math.floor(n / ratio);
}
var toPixel = (n: number, ratio: number): number => {
    return n * ratio;
}

class Point {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    toRelativeUnit(ratio) {
        return {
            x: Math.floor(this.x / ratio),
            y: Math.floor(this.y / ratio)
        };
    }
    add(p) {
        this.x = this.x + p.x;
        this.y = this.y + p.y;
    }
}

class Cell {
    private x     : number;
    private y     : number;
    private color : string;
    private grid  : Grid;

    constructor(x: number, y: number, color: string, grid: Grid) {
        this.x     = x;
        this.y     = y;
        this.color = color;
        this.grid  = grid;

        this.draw();
    }
    public draw(): void {
        var ctx  = this.grid.ctx,
            size = this.grid.cellSize,
            x    = toPixel(this.x, size) + 1,
            y    = toPixel(this.y, size) + 1;

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
    private wCells    : number;
    private hCells    : number;
    private cells     : Array<any>;
    private canvas    : HTMLCanvasElement;
    private scale     : number;
    private scaleOpt  : any;
    private zp        : { x: number, y: number };
    private moveStart : any;
    private events    : any;
    public ctx        : any;
    public cellSize   : number;
    public mode       : string;

    constructor(conf: GridConfig) {
        this.canvas   = conf.canvas;
        this.ctx      = conf.canvas.getContext('2d');
        this.scale    = conf.scale;
        this.scaleOpt = {};
        this.cellSize = Math.round(this.scale * 5);
        this.wCells   = conf.ratio[0];
        this.hCells   = conf.ratio[1];
        this.zp       = new Point(0, 0);   // zero point - begin of ctx
        this.mode     = 'draw';
        this.cells    = new Array(this.wCells * this.hCells);
        this.events   = {
            mouseup    : (e) => this.handleMouseUp(e),
            mousedown  : (e) => this.handleMouseDown(e),
            mousemove  : (e) => this.handleMouseMove(e),
            touchstart : (e) => this.handleTouchStart(e),
            touchend   : (e) => this.handleTouchEnd(e),
            touchmove  : (e) => this.handleTouchMove(e),
            mousewheel : (e) => this.handleZoom(e),
            wheel      : (e) => this.handleZoom(e),
            scroll     : (e) => this.handleZoom(e),
        }

        this.draw();

        // setup events
        for (let e in this.events) {
            this.canvas.addEventListener(e, this.events[e]);
        }
    }
    private draw(): void {
        let size       = this.cellSize,
            gridWidth  = toPixel(this.wCells, size),
            gridHeight = toPixel(this.hCells, size),
            zp         = this.zp,
            ctx        = this.ctx,
            begin      = new Point(
                Math.max(0, zp.x % size - zp.x - size),
                Math.max(0, zp.y % size - zp.y - size)
            ),
            end        = new Point(
                Math.min(this.canvas.width - zp.x, gridWidth),
                Math.min(this.canvas.height - zp.y, gridHeight)
            ),
            _begin     = begin.toRelativeUnit(size),
            _end       = end.toRelativeUnit(size);

        ctx.beginPath();

        for (let x = begin.x + 0.5; x <= end.x + 1; x += size) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, end.y);
        }

        for (let y = begin.y + 0.5; y <= end.y + 1; y += size) {
            ctx.moveTo(0, y);
            ctx.lineTo(end.x, y);
        }

        ctx.strokeStyle = 'lightgray';
        ctx.stroke();

        for (let x = _begin.x; x <= _end.x; x++) {
            for (let y = _begin.y; y <= _end.y; y++) {
                let cell = this.cells[x + this.wCells * y];

                if (cell) cell.draw();
            }
        }
    }

    private setCell(pt, color) {
        let i = pt.x + this.wCells * pt.y;

        if (!this.cells[i]) {
            this.cells[i] = new Cell(pt.x, pt.y, color, this);
        } else {
            this.cells[i].setColor(color)
        }
    }

    private getCell(x, y) {
        return this.cells[x + this.wCells * y];
    }

    public zoom(focus, factor: number) {
        let oldSize   = this.cellSize;

        this.scale    = +Math.max(1, this.scale * factor).toFixed(2);
        this.cellSize = Math.round(this.scale * 5);

        if (this.scale >= 1) {
            let k = 1 - this.cellSize / oldSize;

            this.moveTo(
                Math.round((focus.x - this.zp.x) * k),
                Math.round((focus.y - this.zp.y) * k)
            );
        }

        // $config[2].value = this.scale;
    }
    public moveTo(x, y) {
        this.zp.x += x;
        this.zp.y += y;
        this.ctx.translate(x, y);
        this.redraw();
    }
    public getScale() {
        return this.scale;
    }
    private clearGrid() {
        let begin = new Point(0 - this.zp.x, 0 - this.zp.y),
            end   = new Point(this.canvas.width, this.canvas.height);

        this.ctx.clearRect(begin.x, begin.y, end.x, end.y);
    }
    public redraw() {
        this.clearGrid();
        this.draw();
    }
    private inGrid(pt): boolean {
        return pt.x >= 0 &&
               pt.x < this.wCells &&
               pt.y >= 0 &&
               pt.y < this.hCells
    }

    public resize(width, height) {
        this.ctx.translate(-this.zp.x, -this.zp.y);
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.translate(this.zp.x, this.zp.y);

        this.redraw();
    }
    public update(conf) {
        this.scale    = conf.scale || this.scale;
        this.ctx      = this.canvas.getContext('2d');
        this.cellSize = Math.round(this.scale * 5);
        this.wCells   = conf.ratio[0];
        this.hCells   = conf.ratio[1];
        this.cells    = new Array(this.wCells * this.hCells);

        this.clearGrid();
        this.ctx.translate(-this.zp.x, -this.zp.y);
        this.zp.x = 0;
        this.zp.y = 0;
        this.redraw();
    }
    public destroy() {
        this.clearGrid();
        this.cells.length = 0;
        this.ctx.translate(-this.zp.x, -this.zp.y);

        for (let e in this.events) {
            this.canvas.removeEventListener(e, this.events[e]);
        }
    }
    // event hendlers
    private handleMouseUp(e) {
        e.preventDefault();
        if (this.mode === 'draw') {
            let pt = new Point(
                e.clientX - this.zp.x,
                e.clientY - this.zp.y
            ).toRelativeUnit(this.cellSize);

            if (this.inGrid(pt)) {
                this.setCell(pt, $colorpicker && $colorpicker.value || 'black');
            }
        }
        this.moveStart = null;
    }
    private handleMouseDown(e) {
        e.preventDefault();
        this.moveStart = { x: e.clientX, y: e.clientY };

        let moveEnd    = { x: e.clientX, y: e.clientY },
            move       = () => {
            if (this.moveStart) {
                let deltaX = this.moveStart.x - moveEnd.x,
                    deltaY = this.moveStart.y - moveEnd.y;

                if ( deltaX || deltaY ) this.moveTo( deltaX, deltaY );

                moveEnd = { x: this.moveStart.x, y: this.moveStart.y };
                requestAnimationFrame(move);
            }
        }
        move();
    }
    private handleMouseMove(e) {
        e.preventDefault();
        if (this.moveStart) {
            let pt = new Point(
                e.clientX - this.zp.x,
                e.clientY - this.zp.y
            ).toRelativeUnit(this.cellSize);

            if (this.mode === 'draw' && this.inGrid(pt)) {
                this.setCell(pt, $colorpicker && $colorpicker.value || 'black');
            } else if (this.mode === 'move') {
                this.moveStart = { x: e.clientX, y: e.clientY };
            }
        }
    }
    private handleTouchStart(e) {
        let touch = e.touches && e.touches.length <= 2 ?
            e.touches[0] : null;
            
        if (touch) {
            let touchPoint = new Point(touch.clientX, touch.clientY);

            this.moveStart = touchPoint;

            if (this.inGrid(touchPoint)) {
                this.setCell(touchPoint, $colorpicker && $colorpicker.value || 'black');
            }
        }
        if (this.mode === 'move') {
            let moveEnd = { x: touch.clientX, y: touch.clientY },
                newDist;

            if (e.touches.length == 2) {
                let t1 = new Point(e.touches[0].clientX, e.touches[0].clientY),
                    t2 = new Point(e.touches[1].clientX, e.touches[1].clientY);

                this.scaleOpt.dist = newDist = Grid.getDistance(t1, t2);
            }
            let move = () => {
                if (this.moveStart) {
                    let deltaX = this.moveStart.x - moveEnd.x,
                        deltaY = this.moveStart.y - moveEnd.y;

                    if (deltaX || deltaY) this.moveTo(deltaX, deltaY);

                    moveEnd = { x: this.moveStart.x, y: this.moveStart.y };
    
                    if (newDist) {
                        let factor = +(this.scaleOpt.dist / newDist).toFixed(2);

                        this.zoom(this.scaleOpt.focus, factor);
                        newDist = this.scaleOpt.dist;
                    }
                    requestAnimationFrame(move);
                }
            }
            move();
        }
    }
    private handleTouchEnd(e) {
        this.moveStart = null;
    }
    private handleTouchMove(e) {
        e.preventDefault();
        let touch = e.touches && e.touches.length <= 2 ?
            e.touches[0] : null;

        if (touch) {
            let pt = new Point(
                touch.clientX - this.zp.x,
                touch.clientY - this.zp.y
            ).toRelativeUnit(this.cellSize);

            if (this.mode === 'draw' && this.inGrid(pt)) {
                this.setCell(pt, $colorpicker && $colorpicker.value || 'black');
            } else if (this.mode === 'move' && this.moveStart) {
                this.moveStart = { x: touch.clientX, y: touch.clientY };
            }
        }

        if (e.touches.length == 2) {
            let t1 = new Point(e.touches[0].clientX, e.touches[0].clientY),
                t2 = new Point(e.touches[1].clientX, e.touches[1].clientY);

            this.scaleOpt = {
                dist  : Grid.getDistance(t1, t2),
                focus : Grid.getMidpoint(t1, t2)
            }


        }

    }
    private handleZoom(e) {
        let factor = e.deltaY < 0 ? 1.25 : .8,
            pt = {
                x: e.clientX,
                y: e.clientY,
            };

        this.zoom(pt, factor);
    }
    static getDistance(p1, p2) {
        return +Math.sqrt(
            Math.pow(p1.x - p2.x, 2) +
            Math.pow(p1.y - p2.y, 2)
        ).toFixed();
    }
    static getMidpoint(p1, p2) {
        return new Point(
            Math.min(p1.x, p2.x) + Math.abs(p1.x - p2.x) / 2,
            Math.min(p1.y, p2.y) + Math.abs(p1.y - p2.y) / 2
        );
    }
}


var $canvas      = <HTMLCanvasElement>document.querySelector("#canvas");
var $colorpicker = <HTMLInputElement>document.querySelector("#colorpicker");
var $btns        = <any>document.querySelectorAll(".actions button");
var $config      = <any>document.querySelectorAll(".config input");
// var $resetBtn = <any>document.querySelector("#reset");


$canvas.width = window.innerWidth;
$canvas.height = window.innerHeight;

var grid = new Grid({
    canvas: $canvas,
    ratio: [ 500, 500 ],
    scale: 3,
});

Array.prototype.forEach.call($btns, el => {
    el.addEventListener('click', handleClickActionsBtn)
});

// $resetBtn.addEventListener('click', (e) => {
//     grid.update({
//         ratio: [
//             +$config[0].value,
//             +$config[1].value
//         ],
//         scale: +$config[2].value
//     })
// })



document.addEventListener('keyup', (e) => {
    e.preventDefault();
    // console.log(e.which);
    if (e.which === 17) {
        grid.mode = 'draw';
        $canvas.style.cursor = 'default';
        $btns[0].classList.add('selected');
        $btns[1].classList.remove('selected');
    }
    if (e.altKey && e.ctrlKey) {
        if (e.which === 68 || e.which === 17) {
            grid.mode = 'draw';
            $canvas.style.cursor = 'default';
            $btns[0].classList.add('selected');
            $btns[1].classList.remove('selected');
        }
        if (e.which === 77) {
            grid.mode = 'move';
            $canvas.style.cursor = 'move';
            $btns[1].classList.add('selected');
            $btns[0].classList.remove('selected');
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
        grid.mode = 'move';
        $canvas.style.cursor = 'move';
        $btns[1].classList.add('selected');
        $btns[0].classList.remove('selected');
    }
});

var resizedFinished;
window.addEventListener('resize', (e) => {
    clearTimeout(resizedFinished);
    resizedFinished = setTimeout(function() {
        grid.resize(window.innerWidth, window.innerHeight);
    }, 250);
})

function handleClickActionsBtn(e) {
    grid.mode = e.currentTarget.id;
    if (!hasClass(e.currentTarget, 'selected')) {
        grid.mode = e.currentTarget.id;
        toggleClass($btns, 'selected');
    }
}

function toggleClass(elements: Array<HTMLElement>, cls: string) {
    Array.prototype.forEach.call(elements, (el) => {
        if (hasClass(el, cls)) {
            el.classList.remove(cls);
        } else {
            el.classList.add(cls);
        }
    });
}

function hasClass(el: HTMLElement, cls: string): boolean {
    return Array.prototype.indexOf.call(el.classList, cls) > -1
}
