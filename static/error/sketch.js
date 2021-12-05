const colors = ["#9D44B5", "#B5446E", "#525252", "#BADEFC", "#0AFFED"];

let particleSystem;

p5.disableFriendlyErrors = true

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.canvas.id = "canvas";
    canvas.position(0, 0);
    canvas.style("z-index", "-1");

    pixelDensity(1);

    const config = {
        particleAmount: 200,
        radiuses: [2, 3, 4, 5],
        speeds: [1, 1.5, 2],
        colors: colors,
        fill: true,
    }

    particleSystem = new BackgroundParticleSystem(config);
    particleSystem.init();
    particleSystem.activate();

    frameRate(60);
}

function draw() {
    background(255);

    particleSystem.update();
    particleSystem.draw();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}