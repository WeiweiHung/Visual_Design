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