let lastTime = 0;
let frames = 0;
let frameCounter = 0;
let fps = 0;
let canvas;
let showHint = true;

let globalSpeed = 1;

let p1;
let particleSystem;

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("cs");
    canvas.canvas.id = "canvas";

    pixelDensity(1);

    createSystem();

    frameRate(60);
}

function createSystem() {
    let colors = ColorSchemes[document.getElementById("colorscheme").value];
    let gravity = Gravities[document.getElementById("gravity").value];
    let origin = Origins[document.getElementById("origin").value];
    let shootInterval = parseInt(Intervals[document.getElementById("shootinterval").value]);
    let styleConfig = Styles[document.getElementById("style").value];
    let explosionAmount = Amounts[document.getElementById("explosionAmount").value];

    let config = {
        shootInterval: shootInterval,
        origin: origin,
        speedRange: styleConfig.speedRange,
        explosionAmount: explosionAmount,
        colors: colors,
        lifetimeRange: styleConfig.lifetimeRange,
        fill: true,
        explosionsRadius: 15,
        gravity: gravity,
        canvas: canvas.canvas,
    };

    particleSystem = new FireworkShooter(config);

    ["mousedown", "touchstart"].forEach(type => {
        canvas.canvas.addEventListener(type, removeHint);
    });
}

function draw() {
    let time = performance.now();
    let deltaTime = time - lastTime;

    background(255, 255, 255);

    particleSystem.update(deltaTime);
    particleSystem.draw();
    
    updateFPS(deltaTime);

    lastTime = time;

    if (showHint) {
        textAlign(CENTER, CENTER);
        fill(100);
        textSize(15);
        text("Click or hold to start", width / 2, height / 2);
    }
}

// LOGIC
//---------------------------------------------
// OTHER CRAP

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function updateFPS(dt) {

    frames++;
    frameCounter += dt;

    textSize(10);
    fill(255);
    textAlign(LEFT, TOP);
    text("FPS: " + fps, 10, 10);

    if (frameCounter > 1000) {
        fps = frames;
        frames = 0;
        frameCounter = 0;
    }
}

document.getElementById("refreshbutton").addEventListener("click", e => {
    e.preventDefault();
    createSystem();
}) ;

const ColorSchemes = {
    "Cartoony": ["#4EB691", "#F2973B", "#B0CC41", "#5955A0", "#E42B30"],
    "Crystal": ["#1D87BA", "#1AB09D", "#F8F2AB", "#F192D9", "#CC84F8"],
    "Rainbow": ["#BF4E4E", "#F79352", "#FFF99C", "#99FFAD", "#89DCE5"],
    "Nature": ["#222D3F", "#4F8C6C", "#335941", "#77A756", "#99BE7F"],
    "Blue Shades": ["#005B7F", "#4CCBFF", "#00B5FF", "#3F6D7F", "#0091CC"],
    "#": ["#", "#", "#", "#", "#"],
};

const Gravities = {
    "Zero": 0,
    "Low": 0.05,
    "Medium": 0.1,
    "High": 0.15,
    "Extreme": 0.2,
}

const Origins = {
    "Bottom": { x: window.innerWidth / 2, y: window.innerHeight },
    "Top": { x: window.innerWidth / 2, y: 0 },
    "Middle": { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    "Left": { x: 0, y: window.innerHeight / 2 },
    "Right": { x: window.innerWidth, y: window.innerHeight / 2 },
}

const Intervals = {
    "Very small": 50,
    "Small": 100,
    "Medium": 150,
    "Big": 200,
    "Very big": 250,
}

const Amounts = {
    "Few": 10,
    "Some": 15,
    "Default": 20,
    "Many": 25,
    "A lot": 35
}

const Styles = {
    "Default": { speedRange: [0.5, 3], lifetimeRange: [100, 150]}
}

function removeHint() {
    ["mousedown", "touchstart"].forEach(type => {
        canvas.canvas.addEventListener(type, removeHint);
    });
    showHint = false;
}

document.querySelector("#gotoOptions").onclick = function() {
    document.getElementById('options').scrollIntoView(true);
}