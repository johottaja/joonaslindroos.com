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
    font = loadFont('../res/AvenirNextLTPro-Demi.otf');
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

    let spreadpoints = SpreadPoints[document.getElementById("spreadpoints").value];
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
    let particlePhysics = Styles[document.getElementById("style").value];

    const config = {
        font: font,
        fontSize: fontsize,
        text: text,
        colors: colors,
        spreadPoints: spreadpoints,
        particles: {
            maxspeed: particlePhysics.maxspeed,
            maxforce: particlePhysics.maxforce,
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

document.getElementById("startbutton").addEventListener("click", e => {
    e.preventDefault();
    runAnim();
})

const SpreadPoints = {
    "Four Corners": [
    { x: 0, y: 0 },
    { x: 0, y: window.innerHeight },
    { x: window.innerWidth, y: 0 },
    { x: window.innerWidth, y: window.innerHeight },
    ],

    "Left Top": [
    { x: 0, y: 0 }
    ],

    "Right Top": [
    { x: window.innerWidth, y: 0 }
    ],

    "Middle": [
    { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    ]
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
    "Normal": { maxspeed: 15, maxforce: 0.5 },
    "Wavey": { maxspeed: 15, maxforce: 0.2 },
    "Straight": { maxspeed: 15, maxforce: 2 },
}

const Styless = {
    "Normal": { maxspeed: 10, maxforce: 0.2 },
    "Wavey": { maxspeed: 10, maxforce: 0.1 },
    "Straight": { maxspeed: 5, maxforce: 1 },
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

document.querySelector("#gotoOptions").onclick = function() {
    document.getElementById('options').scrollIntoView(true);
}