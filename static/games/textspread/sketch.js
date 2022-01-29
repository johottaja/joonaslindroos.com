let lastTime = 0;
let frames = 0;
let frameCounter = 0;
let fpsList = [];
let fps = 0;

let font;
let animatedText;

const MAXFONTSIZE = 180;
const MINFONTSIZE = 30;

function preload() {
    font = loadFont('../res/fonts/AvenirNextLTPro-Demi.otf');
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.canvas.id = "canvas";
    canvas.parent("cs");

    pixelDensity(1);

    runAnim();

    frameRate(60);
}

function runAnim() {

    let spreadFunction = SpreadFunctions[document.getElementById("spreadfunction").value];
    let colors = ColorSchemes[document.getElementById("colorscheme").value];

    let text = document.getElementById("textinput").value;
    text = text !== "" ? text : "TEXT HERE";
    let fontsize = MAXFONTSIZE;


    textFont(font);
    textSize(fontsize);

    while(textWidth(text) > windowWidth - windowWidth / 8 && fontsize > MINFONTSIZE) {
        fontsize -= 5;
        textSize(fontsize);
    }

    let radius = map(fontsize, MINFONTSIZE, MAXFONTSIZE, 2, 6);
    let style = Styles[document.getElementById("style").value];

    const config = {
        font: font,
        fontSize: fontsize,
        text: text,
        colors: colors,
        spreadFunction: spreadFunction(),
        randomize: style.randomized,
        particles: {
            maxspeed: style.maxspeed,
            maxforce: style.maxforce,
            radius: radius,
            fill: true
        },
    };

    animatedText = new PointSpreadParticleText(config);

    let x = windowWidth / 2 - animatedText.w / 2;
    let y = windowHeight / 2;

    animatedText.init(x, y);
    animatedText.activate();
}

function draw() {
    let time = performance.now();
    let deltaTime = time - lastTime;

    background(255, 255, 255);

    animatedText.update();
    animatedText.draw();

    updateFPS(deltaTime);

    lastTime = time;
}

// LOGIC
//---------------------------------------------
// OTHER CRAP

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function updateFPS(dt) {

    frameCounter += dt;
    fpsList.push(Math.floor(frameRate()));

    textSize(10);
    fill(255);
    textAlign(LEFT, TOP);
    text("FPS: " + fps, 10, 10);

    if (frameCounter > 1000) {
        frameCounter = 0;
        let sum = fpsList.reduce((a, b) => a + b, 0);
        fps = Math.floor(sum / fpsList.length);
        fpsList = [];
    }
}

document.querySelector("#startbutton").addEventListener("click", e => {
    e.preventDefault();
    runAnim();
    canvas.scrollIntoView(true);
})

const SpreadFunctions = {
    "Sides": sideSpreadFunction,
    "Spiral": spiralSpreadFunction,
    "Double Spiral": doubleSpiralSpreadFunction,
    "Bottom": bottomSpreadFunction,
}

const ColorSchemes = {
    "Cartoony": ["#4EB691", "#F2973B", "#B0CC41", "#5955A0", "#E42B30"],
    "Crystal": ["#1D87BA", "#1AB09D", "#F8F2AB", "#F192D9", "#CC84F8"],
    "Rainbow": ["#BF4E4E", "#F79352", "#FFF99C", "#99FFAD", "#89DCE5"],
    "Nature": ["#222D3F", "#4F8C6C", "#335941", "#77A756", "#99BE7F"],
    "Blue Shades": ["#005B7F", "#4CCBFF", "#00B5FF", "#3F6D7F", "#0091CC"],
    "#": ["#", "#", "#", "#", "#"],
};

const Styles = {
    "Normal": { maxspeed: 15, maxforce: 0.5, randomized: true },
    "Straight": { maxspeed: 15, maxforce: 2, randomized: true },
    "Wavey": { maxspeed: 15, maxforce: 0.2, randomized: true },
    "Orderly": { maxspeed: 15, maxforce: 2, randomized: false },
    "Smooth": { maxspeed: 15, maxforce: 0.5, randomized: false },
    "Smooth Waves": { maxspeed: 15, maxforce: 0.2, randomized: true },
}

window.addEventListener("keydown", e => {
    if (e.code === "Space") {

        if (document.activeElement === document.getElementById("textinput")) {
            return;
        }

        e.preventDefault();
        runAnim();
    }
})

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

document.querySelector("#gotoOptions").onclick = function() {
    document.getElementById('options').scrollIntoView(true);
}