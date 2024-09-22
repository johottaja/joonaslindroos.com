
function* spiralSpreadFunction() {
    let angle = -0.05;
    while (true) {
        angle += 0.05;
        yield {
            pos: {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            },
            vel: {
                x: Math.cos(angle) * 15,
                y: Math.sin(angle) * 15,
            }
        }

    }
}

function* doubleSpiralSpreadFunction() {
    let angle = -0.05;
    let bit = true;
    while (true) {
        angle += 0.05;
        if (bit) {
            bit = !bit;
            yield {
                pos: {
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2
                },
                vel: {
                    x: Math.cos(angle) * 15,
                    y: Math.sin(angle) * 15,
                }
            }
        } else {
            bit = !bit;
            yield {
                pos: {
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2
                },
                vel: {
                    x: -Math.cos(angle) * 15,
                    y: -Math.sin(angle) * 15,
                }
            }
        }

    }
}

function* sideSpreadFunction() {
    let angle = 0;
    let increment = -0.05;
    let bit = true;
    while (true) {
        angle += increment;
        if (angle >= 0.25*Math.PI){
            angle =  0.25*Math.PI
            increment = -increment;
        } else if (angle <= -0.25*Math.PI) {
            increment = -increment;
            angle = - 0.25*Math.PI
        }
        if (bit) {
            bit = !bit;
            yield {
                pos: {
                    x: 0,
                    y: window.innerHeight / 2,
                },
                vel: {
                    x: Math.cos(angle) * 20,
                    y: Math.sin(angle) * 15,
                }
            }
        } else {
            bit = !bit;
            yield {
                pos: {
                    x: window.innerWidth,
                    y: window.innerHeight / 2,
                },
                vel: {
                    x: -Math.cos(angle) * 20,
                    y: Math.sin(angle) * 15,
                }
            }
        }
    }
}

function* bottomSpreadFunction() {
    let position = 0;
    let increment = window.innerWidth / 100;
    let bit = true;
    while (true) {
        position += increment;
        if (position >= window.innerWidth) {
            position = window.innerWidth;
            increment = - increment;
        } else if (position <= 0) {
            position = 0;
            increment = -increment;
        }
        if (bit) {
            bit = !bit;
            yield {
                pos: {
                    x: position,
                    y: window.innerHeight,
                },
                vel: {
                    x: Math.random() * 20 - 10,
                    y: -10,
                }
            }
        } else {
            bit = !bit
            yield {
                pos: {
                    x: window.innerWidth - position,
                    y: window.innerHeight,
                },
                vel: {
                    x: Math.random() * 20 - 10,
                    y: -10,
                }
            }
        }
    }
}
