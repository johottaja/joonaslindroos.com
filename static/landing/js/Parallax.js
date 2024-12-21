class Parallax {
    constructor(element, scrollLength, parallaxAmount, offset, units) {
        this.element = element;
        this.scrollLength = scrollLength;
        this.parallaxAmount = parallaxAmount;
        this.offset = offset;
        this.units = units;
    }
    
    update(mousePos) {
        let yParallax = 0;
        if (window.scrollY < scrollAnimLen) {
            yParallax = this.parallaxAmount.y - window.scrollY / scrollAnimLen * this.parallaxAmount.y;
        }
        let xParallax = (mousePos.x - window.innerWidth / 2) / (window.innerWidth / 2) * this.parallaxAmount.x;

        const y = this.offset.y + yParallax + this.units
        const x = this.offset.x + xParallax + this.units
        const final = `translate(${x}, ${y})`
        this.element.style.transform = final;
    }
    
    updateScrollLength(newScrollLength) {
        this.scrollLength = newScrollLength
    }
}