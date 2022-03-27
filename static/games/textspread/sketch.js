const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");

let font;
let animatedText;

const MAXFONTSIZE = 180;
const MINFONTSIZE = 30;

let lastTime = 0;

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
    console.log(fontSize);

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

window.addEventListener("keydown", e => {
    if (e.code === "ArrowUp") {
        updateLoop();
    }
});