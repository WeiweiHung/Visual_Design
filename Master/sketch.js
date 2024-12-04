let maxDepth = 10; // 最大遞迴深度
let branches = []; // 儲存所有蛇的分支
let waveAmplitude = 3;  // 波動幅度
let waveFrequency = 3;  // 每段分支內的波動次數
let lineWeight = 2;     // 線條粗細
let scale = 0.9;        // 縮小比例

function setup() {
    // 自動設置畫布為視窗大小，並置中齊底
    createCanvas(windowWidth, windowHeight);
    positionCanvas();
    background(0); // 初次繪製背景

    frameRate(30); // 設定更新速率
    branches.push(new Branch(width / 2, height, 100, 0, -PI / 2, color(255, 215, 0))); // 從畫布中間往上長的第一條分支
}

function draw() {
    // 更新並繪製所有分支
    for (let i = branches.length - 1; i >= 0; i--) {
        let b = branches[i];
        b.update();
        b.display();

        // 如果分支完全生長且未達最大深度，則分裂
        if (b.isFullyGrown() && b.depth < maxDepth) {
            let endX = b.endX();
            let endY = b.endY();

            let rightColor = lerpColor(b.color, color(255, 0, 0), 0.2); // 右邊逐漸增加紅色
            let leftColor = lerpColor(b.color, color(0, 0, 255), 0.2);  // 左邊逐漸增加藍色

            branches.push(new Branch(endX, endY, b.len * scale, b.depth + 1, b.angle + PI / 6, rightColor)); // 右分支
            branches.push(new Branch(endX, endY, b.len * scale, b.depth + 1, b.angle - PI / 6, leftColor));  // 左分支

            branches.splice(i, 1); // 移除已完成分裂的分支
        }
    }
}

function positionCanvas() {
    // 畫布置中並對齊底部
    let canvas = document.getElementById('defaultCanvas0');
    canvas.style.position = 'absolute';
    canvas.style.left = `${(windowWidth - width) / 2}px`;
    canvas.style.top = `${windowHeight - height}px`;
}

function windowResized() {
    // 在視窗大小改變時重新調整畫布大小並更新位置
    resizeCanvas(windowWidth, windowHeight);
    positionCanvas();
    background(0); // 重新填充背景，避免殘影
}

class Branch {
    constructor(x, y, len, depth, angle, colorValue) {
        this.startX = x;
        this.startY = y;
        this.len = len;
        this.depth = depth;
        this.growth = 0; // 當前的生長進度
        this.angle = angle;
        this.color = colorValue;
        this.fullyGrown = false;
    }

    update() {
        if (this.growth < this.len) {
            this.growth += 1;
        } else {
            this.fullyGrown = true;
        }
    }

    isFullyGrown() {
        return this.fullyGrown;
    }

    endX() {
        return this.startX + cos(this.angle) * this.len;
    }

    endY() {
        return this.startY + sin(this.angle) * this.len;
    }

    display() {
        stroke(this.color);
        strokeWeight(lineWeight);
        noFill();

        beginShape();
        let fixedWaveLength = this.len / waveFrequency;

        for (let i = 0; i <= this.growth; i++) {
            let wavePhase = (TWO_PI * i) / fixedWaveLength;
            let wave = sin(wavePhase) * waveAmplitude;
            let x = this.startX + cos(this.angle) * i + sin(this.angle) * wave;
            let y = this.startY + sin(this.angle) * i - cos(this.angle) * wave;
            vertex(x, y);
        }
        endShape();
    }
}





/* let maxDepth = 5; // 最大遞迴深度
let branches = []; // 儲存所有蛇的分支
let waveAmplitude = 3;  // 波動幅度
let waveFrequency = 3;  // 每段分支內的波動次數 (固定)
let lineWeight = 2;     // 線條固定粗細

function setup() {
    let canvas = createCanvas(1748, 2480); // 固定 A5 大小的畫布
    canvas.style('display', 'block');
    canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    background(0); // 黑色背景

    frameRate(30); // 設定更新速率
    branches.push(new Branch(width / 2, 0, 100, 0, PI / 2, color(255, 215, 0))); // 初始化第一條蛇

    console.log("Setup 完成，初始化分支。");
}

function draw() {
    background(0); // 每次繪圖先清除畫布，避免殘影

    for (let i = branches.length - 1; i >= 0; i--) {
        let b = branches[i];
        b.update();
        b.display();

        if (b.isFullyGrown() && b.depth < maxDepth) {
            let endX = b.endX();
            let endY = b.endY();

            let rightColor = lerpColor(b.color, color(255, 0, 0), 0.2); // 右邊逐漸增加紅色
            let leftColor = lerpColor(b.color, color(0, -215, 255), 0.2);  // 左邊逐漸增加藍色

            branches.push(new Branch(endX, endY, b.len, b.depth + 1, b.angle + PI / 6, rightColor)); // 右分支
            branches.push(new Branch(endX, endY, b.len, b.depth + 1, b.angle - PI / 6, leftColor));  // 左分支

            branches.splice(i, 1); // 移除已完成分裂的分支
        }
    }

    console.log("目前分支數量：", branches.length);
}

function windowResized() {
    let canvas = document.querySelector('canvas');
    canvas.style.left = `${(windowWidth - width) / 2}px`;
    canvas.style.top = `${(windowHeight - height) / 2}px`;
}

class Branch {
    constructor(x, y, len, depth, angle, colorValue) {
        this.startX = x;
        this.startY = y;
        this.len = len;
        this.depth = depth;
        this.growth = 0;
        this.angle = angle;
        this.color = colorValue;
        this.fullyGrown = false;
    }

    update() {
        if (this.growth < this.len) {
            this.growth += 1; 
        } else {
            this.fullyGrown = true;
        }
    }

    isFullyGrown() {
        return this.fullyGrown;
    }

    endX() {
        return this.startX + cos(this.angle) * this.len;
    }

    endY() {
        return this.startY + sin(this.angle) * this.len;
    }

    display() {
        stroke(this.color);
        strokeWeight(lineWeight);
        noFill();

        // 加入靜態測試線條
        line(this.startX, this.startY, this.endX(), this.endY());

        beginShape();
        let fixedWaveLength = this.len / waveFrequency;

        for (let i = 0; i <= this.growth; i++) {
            let wavePhase = (TWO_PI * i) / fixedWaveLength;
            let wave = sin(wavePhase) * waveAmplitude;
            let x = this.startX + cos(this.angle) * i + sin(this.angle) * wave;
            let y = this.startY + sin(this.angle) * i - cos(this.angle) * wave;
            vertex(x, y);
        }
        endShape();
    }
} */

/*
let yoff = 0.0;

function setup() {
  // A5 賀卡大小，300 DPI 對應像素值
  createCanvas(1748, 2480); // 寬 1748 像素，高 2480 像素
  background(0);//black
  stroke(255, 0, 0); // 紅色曲線
  strokeWeight(3);
  noFill();
}

function draw() {
  background(0, 0, 0, 20); // 加淡化效果

  beginShape();
  let xoff = 0;
  for (let x = 0; x < width; x++) {
    let y = map(noise(xoff, yoff), 0, 1, 200, 400);
    vertex(x, y);
    xoff += 0.05;
  }
  endShape();

  yoff += 0.01;
}
*/