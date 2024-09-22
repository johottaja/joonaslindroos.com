function createCornerBuffer(Config) {
    const temp = document.createElement("canvas");
    temp.width = Config.tileSize;
    temp.height = Config.tileSize;
    const ctx = temp.getContext("2d");
    ctx.fillStyle = Config.snakeColor;
    ctx.beginPath();
    const middlePoint = Config.tileSize - Config.snakeGap
    ctx.arc(middlePoint, middlePoint, middlePoint - Config.snakeGap, Math.PI, Math.PI * 1.5);
    ctx.lineTo(middlePoint, middlePoint);
    ctx.lineTo(0, middlePoint);
    ctx.fillRect(middlePoint, Config.snakeGap, Config.snakeGap, middlePoint - Config.snakeGap);
    ctx.fillRect(Config.snakeGap, middlePoint, middlePoint - Config.snakeGap, Config.snakeGap);
    ctx.fill();
    return temp;
}

function createRotatedContext(reference, times = 1) {
    const temp = document.createElement("canvas");
    temp.width = reference.width;
    temp.height = reference.height;
    const ctx = temp.getContext("2d");
    ctx.save();
    for (let i = 0; i < times; i++) {
        ctx.translate(reference.width, 0);
        ctx.rotate(90 * Math.PI / 180);
    }
    ctx.drawImage(reference, 0, 0);
    ctx.restore();
    return temp;
}

function createTextures(Config) {
    const verticalStraight = document.createElement("canvas");
    verticalStraight.width = Config.tileSize;
    verticalStraight.height = Config.tileSize;
    let ctx = verticalStraight.getContext("2d");
    ctx.fillStyle = Config.snakeColor;
    ctx.fillRect(Config.snakeGap, 0, Config.tileSize - 2 * Config.snakeGap, Config.tileSize);

    const horizontalStraight = document.createElement("canvas");
    horizontalStraight.width = Config.tileSize;
    horizontalStraight.height = Config.tileSize;
    ctx = horizontalStraight.getContext("2d");
    ctx.fillStyle = Config.snakeColor;
    ctx.fillRect(0, Config.snakeGap, Config.tileSize, Config.tileSize - 2 * Config.snakeGap);

    const errorSquare = document.createElement("canvas");
    errorSquare.width = Config.tileSize;
    errorSquare.height = Config.tileSize;
    ctx = errorSquare.getContext("2d");
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(0, 0, Config.tileSize, Config.tileSize);

    const corner = createCornerBuffer(Config);
    const tailTextures = [
        corner,
        createRotatedContext(corner, 1),
        createRotatedContext(corner, 2),
        createRotatedContext(corner, 3),
        verticalStraight,
        horizontalStraight,
        errorSquare
    ];

    const head = document.createElement("canvas");
    head.width = Config.tileSize;
    head.height = Config.tileSize;
    ctx = head.getContext("2d");
    ctx.fillStyle = Config.snakeColor;
    ctx.fillRect(
        Config.snakeGap,
        Config.tileSize / 2,
        Config.tileSize - Config.snakeGap * 2,
        Config.tileSize / 2
    );
    ctx.beginPath();
    ctx.arc(
        Config.tileSize / 2,
        Config.tileSize / 2,
        (Config.tileSize - Config.snakeGap * 2) / 2,
        Math.PI, 0
    );
    ctx.fill();

    const headTextures = [
        head,
        createRotatedContext(head, 1),
        createRotatedContext(head, 2),
        createRotatedContext(head, 3),
        errorSquare
    ];

    const backgroundTexture = document.createElement("canvas");
    backgroundTexture.width = Config.tileSize * Config.tileCount;
    backgroundTexture.height = Config.tileSize * Config.tileCount;
    ctx = backgroundTexture.getContext("2d");
    let color = Config.bgColor1;
    for (let i = 0; i < Config.tileCount; i++) {
        if (Config.tileCount % 2 === 0) {
            color = color === Config.bgColor1 ? Config.bgColor2 : Config.bgColor1;
        }
        for (let j = 0; j < Config.tileCount; j++) {
            color = color === Config.bgColor1 ? Config.bgColor2 : Config.bgColor1;
            ctx.fillStyle = color;
            ctx.fillRect(
                i * Config.tileSize,
                j * Config.tileSize,
                Config.tileSize,
                Config.tileSize
            );
        }
    }

    const appleTexture = document.createElement("canvas");
    appleTexture.width = Config.tileSize;
    appleTexture.height = Config.tileSize;
    ctx = appleTexture.getContext("2d");
    ctx.fillStyle = "#DB8979";
    ctx.beginPath();
    ctx.arc(
        Config.tileSize / 2,
        Config.tileSize / 2,
        Config.tileSize / 2 - Config.snakeGap / 2,
        0, Math.PI * 2
    )
    ctx.fill();

    return {
        Config: Config,
        verticalStraight: verticalStraight,
        horizontalStraight: horizontalStraight,
        tailTextures: tailTextures,
        headTextures: headTextures,
        appleTexture: appleTexture,
        backgroundTexture: backgroundTexture,
        setContext: function(ctx) {
            this.context = ctx;
        },
        drawBackground: function() {
            this.context.drawImage(backgroundTexture, 0, 0);
        },
        drawApple(apple) {
            this.context.drawImage(
                this.appleTexture,
                apple.x * this.Config.tileSize,
                apple.y * this.Config.tileSize
            );
        },
        drawSnake(snake) {
            let headTexture = 4;
            if (snake.vel.y === -1) {
                headTexture = 0;
            } else if (snake.vel.x === 1) {
                headTexture = 1;
            } else if (snake.vel.y === 1) {
                headTexture = 2;
            } else if (snake.vel.x === -1) {
                headTexture = 3;
            } else if (snake.vel.x === 0 && snake.vel.y === 0) {
                headTexture = 0;
            }

            this.context.drawImage(
                this.headTextures[headTexture],
                snake.pos.x * Config.tileSize,
                snake.pos.y * Config.tileSize
            );

            snake.tail.forEach(tailPiece => {
                this.context.drawImage(
                    this.tailTextures[tailPiece.textureID],
                    tailPiece.x * Config.tileSize,
                    tailPiece.y * Config.tileSize
                );
            });
        }
    }
}