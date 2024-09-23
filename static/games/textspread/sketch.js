const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");

let font;
let animatedText;

const MAXFONTSIZE = 180;
const MINFONTSIZE = 30;

let lastTime = 0;

let mouseDown = false;

window.onload = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    opentype.load("../res/fonts/Avenir.otf", function(err, f) {
        if (err) {
            console.log("error");
        } else {
            font = f;
            initializeAnimation();
            lastTime = performance.now();
            updateLoop();
        }
    });
}

function initializeAnimation() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let spreadFunction = SpreadFunctions[document.getElementById("spreadfunction").value];
    let colors = ColorSchemes[document.getElementById("colorscheme").value];

    let text = document.getElementById("textinput").value;
    text = text !== "" ? text : "TEXT HERE";
    let fontSize = MAXFONTSIZE;

    let textWidth = font.getAdvanceWidth(text, fontSize);

    while(textWidth > window.innerWidth - window.innerHeight / 8 && fontSize > MINFONTSIZE) {
        fontSize -= 5;
        textWidth = font.getAdvanceWidth(text, fontSize);
    }

    let radius = map(fontSize, MINFONTSIZE, MAXFONTSIZE, 2, 6);
    let style = Styles[document.getElementById("style").value];

    const config = {
        font: font,
        fontSize: fontSize,
        text: text,
        colors: colors,
        spreadFunction: spreadFunction(),
        randomize: style.randomized,
        particles: {
            maxspeed: style.maxspeed,
            maxforce: style.maxforce,
            radius: radius,
        },
    };

    animatedText = new PointSpreadParticleText(config);

    let x = window.innerWidth / 2 - textWidth / 2;
    let y = window.innerHeight / 2;

    animatedText.init(x, y);
    animatedText.activate();
}

let accumulatedTime = 0;
let frameTime = 1000 / 60;
function updateLoop(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    accumulatedTime += deltaTime;
    if (accumulatedTime >= frameTime) {
        while (accumulatedTime >= frameTime) {
            animatedText.update(frameTime);
            accumulatedTime -= frameTime;
        }
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        animatedText.draw();
    }

    window.requestAnimationFrame(updateLoop);
}

// LOGIC
//---------------------------------------------
// OTHER CRAP

document.querySelector("#startbutton").addEventListener("click", e => {
    e.preventDefault();
    lastTime = performance.now();
    initializeAnimation();
    lastTime = performance.now();
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
    "Normal": { maxspeed: 15, maxforce: 0.4, randomized: true },
    "Straight": { maxspeed: 15, maxforce: 2, randomized: true },
    "Wavey": { maxspeed: 15, maxforce: 0.25, randomized: true },
    "Orderly": { maxspeed: 15, maxforce: 2, randomized: false },
    "Smooth": { maxspeed: 15, maxforce: 0.4, randomized: false },
    "Smooth Waves": { maxspeed: 15, maxforce: 0.25, randomized: false },
}

window.addEventListener("keydown", e => {
    if (e.code === "Space") {

        if (document.activeElement === document.getElementById("textinput")) {
            return;
        }

        e.preventDefault();
        lastTime = performance.now();
        initializeAnimation();
        lastTime = performance.now();
    }
})

document.querySelector("#gotoOptions").onclick = function() {
    document.getElementById('options').scrollIntoView(true);
}

window.addEventListener("keydown", e => {
    if (e.code === "ArrowUp") {
        updateLoop();
    }
});

canvas.addEventListener("mousedown", e => {
    e.preventDefault();
    animatedText.updateMouseDown(true);
    animatedText.updateMousePos(e.clientX, e.clientY);
});

canvas.addEventListener("mouseup", e => {
    e.preventDefault();
    animatedText.updateMouseDown(false);
});

canvas.addEventListener("mousemove", e => {
    e.preventDefault();
    animatedText.updateMousePos(e.clientX, e.clientY);
});

canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    animatedText.updateMouseDown(true);
    animatedText.updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
});

canvas.addEventListener("touchend", e => {
    e.preventDefault();
    animatedText.updateMouseDown(false);
});

canvas.addEventListener("touchmove", e => {
    e.preventDefault();
    animatedText.updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
});