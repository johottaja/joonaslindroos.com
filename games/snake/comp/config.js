module.exports = Config = {
    tileSize: 32,
    tileCount: 15,
    snakeGap: 5,
    snakeColor: "#CEA4DB",
    bgColor1: "#9ADBC1",
    bgColor2: "#8EDB91",
    FPS: 0,
    frameTime: 0,
    setFPS: function setFPS(fps) {
        this.FPS = fps;
        this.frameTime = 1000/fps;
    }
}