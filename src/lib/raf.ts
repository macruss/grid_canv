;(() => {
    let lastTime = 0;
    let vendors = ['ms', 'moz', 'webkit', 'o'];

    for(let x = 0; x < vendors.length && !this.requestAnimationFrame; ++x) {
        this.requestAnimationFrame = this[vendors[x]+'RequestAnimationFrame'];
        this.cancelAnimationFrame = this[vendors[x]+'CancelAnimationFrame'] ||
                                    this[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!this.requestAnimationFrame)
        this.requestAnimationFrame = (callback, element) => {
            let currTime = new Date().getTime();
            let timeToCall = Math.max(0, 16 - (currTime - lastTime));
            let id = this.setTimeout(() => callback(currTime + timeToCall), timeToCall);

            lastTime = currTime + timeToCall;
            return id;
        };

    if (!this.cancelAnimationFrame) {
        this.cancelAnimationFrame = id => clearTimeout(id);
    }
})();