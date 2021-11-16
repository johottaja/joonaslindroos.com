function createCornerBuffer(config) {
    const temp = document.createElement("canvas");
    temp.width = config.tileSize;
    temp.height = config.tileSize;
    const ctx = temp.getContext("2d");
    ctx.fillStyle = config.snakeColor;
    ctx.beginPath();
    const middlePoint = config.tileSize - config.snakeGap
    ctx.arc(middlePoint, middlePoint, middlePoint - config.snakeGap, Math.PI, Math.PI * 1.5);
    ctx.lineTo(middlePoint, middlePoint);
    ctx.lineTo(0, middlePoint);
    ctx.fillRect(middlePoint, config.snakeGap, config.snakeGap, middlePoint - config.snakeGap);
    ctx.fillRect(config.snakeGap, middlePoint, middlePoint - config.snakeGap, config.snakeGap);
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

function createTextures(config) {
    const verticalStraight = document.createElement("canvas");
    verticalStraight.width = config.tileSize;
    verticalStraight.height = config.tileSize;
    let ctx = verticalStraight.getContext("2d");
    ctx.fillStyle = config.snakeColor;
    ctx.fillRect(config.snakeGap, 0, config.tileSize - 2 * config.snakeGap, config.tileSize);

    const horizontalStraight = document.createElement("canvas");
    horizontalStraight.width = config.tileSize;
    horizontalStraight.height = config.tileSize;
    ctx = horizontalStraight.getContext("2d");
    ctx.fillStyle = config.snakeColor;
    ctx.fillRect(0, config.snakeGap, config.tileSize, config.tileSize - 2 * config.snakeGap);

    const errorSquare = document.createElement("canvas");
    errorSquare.width = config.tileSize;
    errorSquare.height = config.tileSize;
    ctx = errorSquare.getContext("2d");
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(0, 0, config.tileSize, config.tileSize);

    const corner = createCornerBuffer(config);
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
    head.width = config.tileSize;
    head.height = config.tileSize;
    ctx = head.getContext("2d");
    ctx.fillStyle = config.snakeColor;
    ctx.fillRect(
        config.snakeGap,
        config.tileSize / 2,
        config.tileSize - config.snakeGap * 2,
        config.tileSize / 2
    );
    ctx.beginPath();
    ctx.arc(
        config.tileSize / 2,
        config.tileSize / 2,
        (config.tileSize - config.snakeGap * 2) / 2,
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
    backgroundTexture.width = config.tileSize * config.tileCount;
    backgroundTexture.height = config.tileSize * config.tileCount;
    ctx = backgroundTexture.getContext("2d");
    let color = config.bgColor1;
    for (let i = 0; i < config.tileCount; i++) {
        if (config.tileCount % 2 === 0) {
            color = color === config.bgColor1 ? config.bgColor2 : config.bgColor1;
        }
        for (let j = 0; j < config.tileCount; j++) {
            color = color === config.bgColor1 ? config.bgColor2 : config.bgColor1;
            ctx.fillStyle = color;
            ctx.fillRect(
                i * config.tileSize,
                j * config.tileSize,
                config.tileSize,
                config.tileSize
            );
        }
    }

    const appleTexture = document.createElement("canvas");
    appleTexture.width = config.tileSize;
    appleTexture.height = config.tileSize;
    ctx = appleTexture.getContext("2d");
    ctx.fillStyle = "#DB8979";
    ctx.beginPath();
    ctx.arc(
        config.tileSize / 2,
        config.tileSize / 2,
        config.tileSize / 2 - config.snakeGap / 2,
        0, Math.PI * 2
    )
    ctx.fill();

    return {
        config: config,
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
                apple.x * this.config.tileSize,
                apple.y * this.config.tileSize
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