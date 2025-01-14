class Parallax {
    constructor(element, scrollLength, parallaxAmount, offset, units) {
        this.element = element;
        this.scrollLength = scrollLength;
        this.mousePos = {x: 0.0, y: 0.0};
        this.parallaxAmount = parallaxAmount;
        this.offset = offset;
        this.units = units;
        this.current = { x: 0, y: 0 };
        this.smoothingFactor = 0.05;
    }
    
    update() {
        let yParallax = 0;
        if (window.scrollY < scrollAnimLen) {
            yParallax = this.parallaxAmount.y - window.scrollY / scrollAnimLen * this.parallaxAmount.y;
        }
        let xParallax = (this.mousePos.x - window.innerWidth / 2) / (window.innerWidth / 2) * this.parallaxAmount.x;

        this.current = { 
            x: this.current.x + (xParallax - this.current.x) * this.smoothingFactor, 
            y: this.current.y + (yParallax - this.current.y) * this.smoothingFactor, 
        };

        const y = this.offset.y + this.current.y + this.units;
        const x = this.offset.x + this.current.x + this.units;
        

        const final = `translate(${x}, ${y})`
        this.element.style.transform = final;
    }
    
    updateScrollLength(newScrollLength) {
        this.scrollLength = newScrollLength
    }

    updateMousePos(newMousePos) {
        this.mousePos = newMousePos
    }
}