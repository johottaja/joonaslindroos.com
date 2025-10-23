const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

function cubicBezier(t, p0, p1, p2, p3) {
    return {
        x: (1 - t)**3*p0.x + 3*(1 - t)**2*t*p1.x + 3*(1 - t)*t**2*p2.x + t**3*p3.x,
        y: (1 - t)**3*p0.y+ 3*(1 - t)**2*t*p1.y + 3*(1 - t)*t**2*p2.y + t**3*p3.y,
    }
}

function approximateCubicBezierLength(p0, p1, p2, p3) {
    let t = 0;
    let l = 0;
    while (t < 1) {
        let b1 = cubicBezier(t, p0, p2, p3, p1);
        let b2 = cubicBezier(t + 0.2, p0, p2, p3, p1);
        l += Math.sqrt((b1.x - b2.x)**2 + (b1.y - b2.y)**2);
        t += 0.2;
    }
    return l;
}

function getPointsFromText(font, fontSize, text, x, y) {
    let points = [];

    let factor = 10;

    const path = font.getPath(text, x, y, fontSize);
    path.fill = "white";
    let lastPoint = {x: 0, y: 0};
    let letterStartPoint = {x: 0, y: 0};
    for (let i = 0; i < path.commands.length; i++) {
        let command = path.commands[i];
        if (command.type === "M") {
            points.push({x: command.x, y: command.y});
            lastPoint = {x: command.x, y: command.y};
            letterStartPoint = {x: command.x, y: command.y};
        } else if (command.type === "L") {
            let d = Math.sqrt((command.x - lastPoint.x)**2 + (command.y - lastPoint.y)**2);
            let norm = {x: -(command.x - lastPoint.x) / d, y: -(command.y - lastPoint.y) / d};
            let n = Math.round(d / factor);
            let j = d / n;
            for (let i = 0; i < n; i++) {
                points.push({x: command.x + i * norm.x * j, y: command.y + i * norm.y * j});
            }
            lastPoint = {x: command.x, y: command.y};
        } else if (command.type === "C") {
            let p0 = lastPoint;
            let p3 = {x: command.x, y: command.y}
            let p1 = {x: command.x1, y: command.y1}
            let p2 = {x: command.x2, y: command.y2}
            let d = approximateCubicBezierLength(p0, p1, p2, p3);
            let increment = 1 / (d / factor);
            let t = 0;
            while (t <= 1) {
                let p = cubicBezier(t, p0, p1, p2, p3);
                points.push(p);
                t += increment;
            }
            lastPoint = {x: command.x, y: command.y};
        } else if (command.type === "Z") {
            if (!(lastPoint.x === letterStartPoint.x && lastPoint.y === letterStartPoint.y)) {
                let d = Math.sqrt((letterStartPoint.x - lastPoint.x)**2 + (letterStartPoint.y - lastPoint.y)**2);
                let norm = {x: -(letterStartPoint.x - lastPoint.x) / d, y: -(letterStartPoint.y - lastPoint.y) / d};
                let n = Math.floor(d / factor);
                let j = d / n;
                for (let i = 1; i < n; i++) {
                    points.push({x: letterStartPoint.x + i * norm.x * j, y: letterStartPoint.y + i * norm.y * j});
                }
            }
        }
    }
    return points;
}