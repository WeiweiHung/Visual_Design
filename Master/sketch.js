let maxDepth = 9; // 最大遞迴深度
let branches = []; // 儲存所有蛇的分支
let waveAmplitude = 20; // 波動幅度，影響每段波的高度
let waveFrequency = 0.01; // 波動頻率，影響每段波的起伏密度
let lineWeight = 2; // 線條粗細
let scale = 0.9; // 縮小比例
let canvas; // 定義全域 canvas 變數
let changeHueValue = 17; // Hue 變化值
let exportResolution = 2; // 解析度倍數，2 代表輸出解析度為螢幕大小的兩倍
let isExporting = false;

function setup() {
    const canvasWidth = min(windowWidth, windowHeight / 1.414); // 依比例限制最大寬度
    const canvasHeight = canvasWidth * 1.414; // 高度以 A5 比例計算

    canvas = createCanvas(canvasWidth, canvasHeight); // 創建比例正確的畫布
    positionCanvas(); // 自訂函式，確保畫布在視窗中間

    colorMode(HSL, 360, 100, 100); // 設置顏色模式為 HSL
    background(0); // 黑色背景
    frameRate(60); // 設定更新速率

    branches = []; // 清空 branches，防止 windowResized 重新初始化時殘留舊的分支
    
    let initialHue = random(360); // 隨機初始色相
    let textColor = color(initialHue, 80, 100); // 設置高飽和度、高亮度的顏色
    
    let initialAmplitude = 30; // 初始振幅
    branches.push(new Branch(width / 2, height, height / 5, 0, -PI / 2, initialHue, initialAmplitude, lineWeight));

    // 在畫布上顯示文字
    drawText(textColor);
}

function drawText(textColor) {
    textAlign(LEFT, CENTER); // 文字置中
    textSize(width / 10); // 字體大小依據畫布寬度調整
    fill(textColor); // 設置文字顏色
    noStroke();
    //text("蛇意盎然", width / 2, height / 4); // 在畫布的上方 1/4 處顯示文字
}

function draw() {
    for (let i = branches.length - 1; i >= 0; i--) {
        let b = branches[i];
        b.update();
        b.display();

        if (b.isFullyGrown() && b.depth < maxDepth) {
            let endX = b.endX();
            let endY = b.endY();

            let newAmplitude = b.amplitude * 1; // 每次分裂時縮小振幅
            let newLineWeight = b.lineWeight * scale; // 每次遞迴縮小線條粗細

            // 左右分支色相變化
            let leftHue = (b.hue - changeHueValue + 360) % 360;
            let rightHue = (b.hue + changeHueValue) % 360;

            branches.push(new Branch(endX, endY, b.len * scale, b.depth + 1, b.angle + PI / 6, rightHue, newAmplitude, newLineWeight));
            branches.push(new Branch(endX, endY, b.len * scale, b.depth + 1, b.angle - PI / 6, leftHue, newAmplitude, newLineWeight));

            branches.splice(i, 1); // 移除已完成分裂的分支
        }
    }

    // 如果需要導出，停止動態繪製並輸出高解析度畫布
    if (isExporting) {
        exportHighResolution();
        noLoop(); // 停止繪製
    }
}

function positionCanvas() {
    canvas.style('display', 'block');
    canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
}

function windowResized() {
    setup();
}

class Branch {
    constructor(x, y, len, depth, angle, hueValue, amplitude, lineWeight) {
        this.startX = x;
        this.startY = y;
        this.len = len;
        this.depth = depth;
        this.growth = 0;
        this.angle = angle;
        this.hue = hueValue;
        this.amplitude = amplitude;
        this.lineWeight = lineWeight;
        this.fullyGrown = false;
        this.perlinOffset = random(1000);

        // 用於記錄最終畫出的點
        this.actualEndX = x;
        this.actualEndY = y;
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

    display() {
        strokeWeight(this.lineWeight);
        noFill();

        let x = this.startX;
        let y = this.startY;

        beginShape();
        vertex(x, y); // 第一個點

        for (let i = 0; i <= this.growth; i++) {
            // 計算當前進度百分比
            let progress = i / this.growth;

            // 計算當前點的色相，確保在範圍內
            let currentHue = (this.hue + changeHueValue * progress) % 360;
            if (currentHue < 0) currentHue += 360;

            // 設置當前筆刷顏色
            stroke(currentHue, 80, 60);

            // 計算平滑的噪聲值
            let noiseValue = noise(this.perlinOffset + i * waveFrequency * 2) * this.amplitude * (1 + Math.min(i * 0.01, 1));

            // 計算當前點的座標
            let interpolatedX = this.startX + cos(this.angle) * i + sin(this.angle) * noiseValue;
            let interpolatedY = this.startY + sin(this.angle) * i - cos(this.angle) * noiseValue;

            // 插值平滑過渡
            let t = 0.5;
            x = lerp(x, interpolatedX, t);
            y = lerp(y, interpolatedY, t);

            vertex(x, y);
        }

        endShape();

        // 記錄最後一個點的位置與色相
        this.actualEndX = x;
        this.actualEndY = y;
        this.actualEndHue = (this.hue + changeHueValue) % 360; // 記錄結尾色相
        if (this.actualEndHue < 0) this.actualEndHue += 360;
    }





    // 回傳最新的終點座標
    endX() {
        return this.actualEndX;
    }

    endY() {
        return this.actualEndY;
    }
}

// 鍵盤按鍵觸發輸出
function keyPressed() {
    if (key === 's' || key === 'S') {
        isExporting = true; // 按下 'S' 開始高解析度輸出
    }
}

function exportHighResolution() {
    saveCanvas();
}



/* let maxDepth = 1;        // 最大遞迴深度設為 1 進行測試
let branches = [];       // 儲存所有分支
let lineWeight = 2;      // 線條粗細
let scale = 0.9;         // 縮小比例
let noiseAmplitude = 10; // 波動幅度控制變數
let yoff = 0;            // Perlin Noise 的垂直位移

function setup() {
    createCanvas(windowWidth, windowHeight); // 自動根據視窗大小
    positionCanvas(); // 將畫布置中並齊底
    background(0);    // 黑色背景
    frameRate(30);    // 設定更新速率

    // 初始化第一條分支
    branches.push(new Branch(width / 2, height, 100, 0, -PI / 2, color(255, 215, 0)));
}

function draw() {
    background(0); // 每次繪製時清除背景，確保只顯示當前的波動層

    // 更新並繪製所有分支
    branches.forEach(branch => {
        branch.update();  // 更新每個分支的波動
        branch.display(); // 繪製每個分支
    });

    // 檢查是否需要新增新的分支
    for (let i = branches.length - 1; i >= 0; i--) {
        let b = branches[i];

        // 當分支生長完成且未達最大深度時，進行分裂
        if (b.isFullyGrown() && b.depth < maxDepth) {
            let endX = b.endX();
            let endY = b.endY();

            let rightColor = lerpColor(b.color, color(255, 0, 0), 0.2); // 右分支顏色逐漸轉為紅色
            let leftColor = lerpColor(b.color, color(0, 0, 255), 0.2);  // 左分支顏色逐漸轉為藍色

            // 新增左右分支
            branches.push(new Branch(endX, endY, b.len * scale, b.depth + 1, b.angle + PI / 6, rightColor));
            branches.push(new Branch(endX, endY, b.len * scale, b.depth + 1, b.angle - PI / 6, leftColor));
        }
    }

    yoff += 0.01; // 更新 Perlin Noise 的垂直偏移
}

function positionCanvas() {
    // 畫布置中並對齊底部
    let canvas = document.getElementById('defaultCanvas0');
    canvas.style.position = 'absolute';
    canvas.style.left = `${(windowWidth - width) / 2}px`;
    canvas.style.top = `${windowHeight - height}px`;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    positionCanvas();
    background(0); // 在視窗調整後重新填充背景
}

class Branch {
    constructor(x, y, len, depth, angle, colorValue) {
        this.startX = x;
        this.startY = y;
        this.len = len;
        this.depth = depth;
        this.growth = 0;  // 生長進度
        this.angle = angle;
        this.color = colorValue;
        this.timeOffset = random(1000); // 每個分支的 Perlin Noise 初始值不同
        this.fullyGrown = false;        // 標記是否已完全生長
    }

    update() {
        // 逐漸生長直到達到最大長度
        if (this.growth < this.len) {
            this.growth += 2; // 控制生長速度
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
        let xoff = this.depth * 0.5; // 每個分支有不同的起始偏移

        for (let i = 0; i <= this.growth; i++) {
            let noiseValue = noise(xoff, this.timeOffset + yoff);
            let wave = map(noiseValue, 0, 1, -noiseAmplitude, noiseAmplitude); // 控制波動範圍
            let x = this.startX + cos(this.angle) * i + wave * sin(this.angle);
            let y = this.startY + sin(this.angle) * i - wave * cos(this.angle);
            vertex(x, y);
            xoff += 0.05; // 平滑地改變波動位置
        }

        endShape();
    }
} */

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