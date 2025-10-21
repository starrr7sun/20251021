// by SamuelYAN
// more works //
// https://twitter.com/SamuelAnn0924
// https://www.instagram.com/samuel_yan_1990/

let seed;
let mySize, margin;
let num;
let myGraphic;
let palette, color_bg;
let str_wei;
let angle_c;
let branch;

let unit_x, unit_y;
let count;
let t;
let mods = [];
let a, b, c;

// 新增：目前使用的配色與背景變數
let currentScheme, currentBg;
let activeColors; 
let activeColorSets = []; 

// 新增：選單 DOM 元素變數
let menuContainer;
let menuItems = [];
let menuWidth = 100; // 選單固定寬度 100px
let slideDistance = menuWidth; // 滑出距離等於選單寬度

// 🌟 新增：Iframe 相關變數
let iframeContainer;
let iframeCloseButton;
const IFRAME_SCALE = 0.8; // Iframe 寬高為全螢幕的 80%

function setup() {
    a = TAU / TAU;
    b = a + a;
    c = a - a;
    seed = Math.random() * sq(sq(sq(int(TAU))));
    randomSeed(seed);

    mySize = min(windowWidth, windowHeight) * 0.9;
    createCanvas(windowWidth, windowHeight, WEBGL);

    // 🌟 建立新的左側滑動選單
    createSlidingMenu(); 
    
    // 🌟 建立 Iframe 容器
    createIframeViewer();

    perspective(0.5, width / height, 5, 20000);

    // --- 顏色初始化 (如果未定義 colorScheme/bgcolor 則使用預設值) ---
    if (typeof colorScheme !== 'undefined' && typeof bgcolor !== 'undefined') {
        currentScheme = random(colorScheme);
        palette = currentScheme.colors.concat();
        currentBg = random(bgcolor);
        color_bg = currentBg;
    } else {
         // 預設顏色，避免錯誤
         currentScheme = { colors: ['#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9'] };
         palette = currentScheme.colors.concat();
         currentBg = '#121212';
         color_bg = currentBg;
    }

    // 產生 5 組擴充後的顏色池，並合併成 activeColors
    activeColorSets = generateActiveColorSets(5, 24);
    activeColors = [].concat(...activeColorSets);
    shuffle(activeColors, true);

    background(color_bg);
    frameRate(50);
    t = rez = c = n = c;
    angle_c = 0;
    branch = 30;
}

function draw() {
    randomSeed(seed);
    
    // 🌟 處理選單的滑出與收回邏輯 (不需檢查 Iframe 狀態，選單應始終能滑出)
    handleMenuSlide();

    // 如果 Iframe 顯示中，則不繪製背景以避免閃爍
    if (iframeContainer && iframeContainer.style('display') === 'none') {
        colors = activeColors || currentScheme.colors;
        background(currentBg);

        translate(0, 0, -mySize * 3 - t * 10000);

        for (let i = 0; i < 3; i++) {
            circleForm(0, 0, mySize * 0.8 * (i + 1) / 2);
        }

        angle_c += TAU / 360 / 10;

        push();
        rotateX(PI / 2 + t * 10);
        rotateY(random([-1, 1]) * frameCount / random(100, 200));

        // 🌟 花瓶形状參數
        let layers = int(random(4, 10)) * 8;
        let rings = 4 * int(random(4, 10));

        for (let yIdx = 0; yIdx < layers; yIdx++) {
            let yNorm = map(yIdx, 0, layers - 1, -1, 1);
            let radius = vaseProfile(yNorm);
            let y = yNorm * mySize * random(0.9, 1.5);

            for (let r = 0; r < rings; r++) {
                let angle = map(r, 0, rings, 0, TWO_PI);
                let x = radius * cos(angle);
                let z = radius * sin(angle);

                push();
                translate(x, y, z);
                rotateY(yNorm * PI + frameCount / 120);

                stroke(random(colors));
                strokeWeight(2 * random(1, 2));
                point(0, 0, 0);

                pop();
            }
        }

        pop();

        t += 0.1 / random(10, 1) / random(3, 7) / 10;
        rez += 0.1 / random(10, 1) / random(3, 7) / 10;
    }
}

function circleForm(x, y, d) {
    let ang = TAU / branch;
    let angles = [];
    for (let i = 0; i < branch; i++) {
        angles.push(ang * (i + iteration(0.1, 0.25)));
    }
    push();
    rotateX(PI / 2 + t * 10);
    rotateZ(PI / 2)
    for (let i = 0; i < branch; i++) {
        let ang1 = angles[i];
        let ang2 = angles[(i + int(random(1, 100))) % angles.length];
        let dd = d * iteration(0.1, 1);

        noFill();
        stroke(random(colors));
        strokeWeight(random(10));
        beginShape();
        for (let j = ang1; j < ang2; j += 0.1) {
            let x1 = dd * cos(i);
            let y1 = dd * sin(j);
            let z1 = dd * cos(j);

            vertex(x1, y1, z1);
        }
        endShape();
    }
    pop();

}

function iteration(s, e) {
    let t = random(10, 100);
    let v = random(0.001, 0.01);
    return map(cos(t + frameCount * v), -1, 1, s, e);
}

function vaseProfile(yNorm) {
    // yNorm: from -1 (bottom) to 1 (top)
    // 模擬古代器皿鼓腹、束頸、收底等形狀
    return (
        mySize * random(0.5, 0.9) * sin(PI * (yNorm + 10) / 2) + // 主體鼓起
        mySize * random(0.1, 0.25) * cos(3 * PI * yNorm) + // 微細節變化
        mySize * random(0, 0.8) // 基礎厚度
    );
}

function heart(x, y, size) {
    beginShape();
    vertex(x, y);
    bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
    bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
    endShape(CLOSE);
}

// 新增：產生更多變化的顏色陣列
function expandPalette(baseColors, targetCount = 24) {
    let out = [];
    for (let s of baseColors) {
        out.push(color(s));
    }
    let iterations = max(6, targetCount - baseColors.length);
    for (let i = 0; i < iterations; i++) {
        let aIdx = floor(random(baseColors.length));
        let bIdx = floor(random(baseColors.length));
        let ca = color(baseColors[aIdx]);
        let cb = color(baseColors[bIdx]);

        let amt = random(0.05, 0.6);
        let mixed = lerpColor(ca, cb, amt);

        colorMode(HSB);
        let h = hue(mixed);
        let s = saturation(mixed);
        let bval = brightness(mixed);

        h = (h + random(-10, 10) + 360) % 360;
        s = constrain(s * random(0.8, 1.2), 10, 100);
        bval = constrain(bval * random(0.7, 1.2), 5, 100);

        let tuned = color(h, s, bval);
        colorMode(RGB);

        out.push(tuned);
        let alphaVal = random(80, 255);
        let cWithAlpha = color(red(tuned), green(tuned), blue(tuned), alphaVal);
        out.push(cWithAlpha);
    }

    while (out.length < targetCount) {
        let c = out[floor(random(out.length))];
        let aVal = random(100, 255);
        out.push(color(red(c), green(c), blue(c), aVal));
    }

    shuffle(out, true);
    return out;
}

// 切換配色方案
function pickNewScheme() {
    activeColorSets = generateActiveColorSets(5, 32); 
    activeColors = [].concat(...activeColorSets);
    shuffle(activeColors, true);

    if (typeof colorScheme !== 'undefined' && typeof bgcolor !== 'undefined') {
        let newScheme = currentScheme;
        let tries = 0;
        while (newScheme === currentScheme && tries < 10) {
            newScheme = random(colorScheme);
            tries++;
        }
        currentScheme = newScheme || currentScheme;
        palette = currentScheme.colors.concat();

        let newBg = currentBg;
        tries = 0;
        while (newBg === currentBg && tries < 10) {
            newBg = random(bgcolor);
            tries++;
        }
        currentBg = newBg || currentBg;
        color_bg = currentBg;

        console.log('已切換配色（5組集合） 背景：', currentBg);
    } else {
        console.log('無法切換配色：colorScheme 或 bgcolor 未定義，使用預設值。');
    }
}

// 生成多組擴充色盤
function generateActiveColorSets(setCount = 5, perSetCount = 24) {
    let sets = [];
    for (let i = 0; i < setCount; i++) {
        let scheme = (typeof colorScheme !== 'undefined') ? random(colorScheme) : currentScheme;
        let set = expandPalette(scheme.colors, perSetCount);
        sets.push(set);
    }
    return sets;
}

// -----------------------------------------------------
// 🌟 Iframe 載入及顯示功能
// -----------------------------------------------------

function createIframeViewer() {
    // Iframe 容器 (用於包含 Iframe 和關閉按鈕)
    iframeContainer = createDiv();
    iframeContainer.style('position', 'fixed');
    iframeContainer.style('width', `${IFRAME_SCALE * 100}%`);
    iframeContainer.style('height', `${IFRAME_SCALE * 100}%`);
    iframeContainer.style('left', `${(1 - IFRAME_SCALE) / 2 * 100}%`);
    iframeContainer.style('top', `${(1 - IFRAME_SCALE) / 2 * 100}%`);
    iframeContainer.style('z-index', '2000'); // 確保在選單上方
    iframeContainer.style('display', 'none'); // 初始隱藏
    iframeContainer.style('background', 'rgba(0, 0, 0, 0.8)'); // 輕微遮罩背景
    iframeContainer.style('border-radius', '10px');
    iframeContainer.style('box-shadow', '0 10px 30px rgba(0,0,0,0.5)');
    
    // Iframe 元素本身
    let iframe = createElement('iframe');
    iframe.id('work-iframe');
    iframe.attribute('frameborder', '0');
    iframe.style('width', '100%');
    iframe.style('height', '100%');
    iframe.style('border', 'none');
    iframe.parent(iframeContainer);
    
    // 關閉按鈕
    iframeCloseButton = createButton('X');
    iframeCloseButton.style('position', 'absolute');
    iframeCloseButton.style('top', '-20px');
    iframeCloseButton.style('right', '-20px');
    iframeCloseButton.style('padding', '5px 10px');
    iframeCloseButton.style('font-size', '16px');
    iframeCloseButton.style('cursor', 'pointer');
    iframeCloseButton.style('background', '#fff');
    iframeCloseButton.style('border', '1px solid #ccc');
    iframeCloseButton.style('border-radius', '50%');
    iframeCloseButton.parent(iframeContainer);
    iframeCloseButton.mousePressed(closeIframe);
}

function loadWork(url) {
    select('#work-iframe').attribute('src', url);
    iframeContainer.style('display', 'block'); // 顯示 Iframe 容器
    // 載入作品時，收回選單
    menuContainer.style('left', `-${menuWidth}px`);
}

function closeIframe() {
    iframeContainer.style('display', 'none'); // 隱藏 Iframe 容器
    select('#work-iframe').attribute('src', 'about:blank'); // 清空 Iframe 內容
}

// -----------------------------------------------------
// 🌟 選單邏輯 (修改點擊事件和文字)
// -----------------------------------------------------

function createSlidingMenu() {
    // 1. 建立選單容器 (menuContainer)
    menuContainer = createDiv();
    menuContainer.id('left-sliding-menu');
    menuContainer.style('position', 'fixed');
    menuContainer.style('left', `-${menuWidth}px`); 
    menuContainer.style('top', '0');
    menuContainer.style('width', `${menuWidth}px`); 
    menuContainer.style('height', '100%'); 
    menuContainer.style('background', 'rgba(255, 255, 255, 0.5)'); 
    menuContainer.style('padding', '20px 0'); 
    menuContainer.style('box-sizing', 'border-box'); 
    menuContainer.style('z-index', '1000');
    menuContainer.style('transition', 'left 0.15s ease-out'); // 0.15 秒滑動速度
    
    // 2. 建立子選單項目 (menuItems)
    const items = [
        { label: '單元一作品', url: 'https://starrr7sun.github.io/20251014_2/' }, // 🌟 文字更新
        { label: '單元一筆記', url: 'https://hackmd.io/@teDfc_ZHRUuqk3jgyybMwA/SyYgtOJhxg' }, // 🌟 文字更新
        { label: '關閉視窗', url: 'close' } 
    ];
    
    items.forEach((item, i) => {
        let itemDiv = createDiv(item.label);
        itemDiv.parent(menuContainer);
        itemDiv.style('padding', '15px 5px'); 
        itemDiv.style('text-align', 'center');
        itemDiv.style('cursor', 'pointer');
        itemDiv.style('color', '#000000'); 
        itemDiv.style('font-size', '16px'); 
        itemDiv.style('font-family', 'Arial, sans-serif');
        itemDiv.style('transition', 'color 0.2s'); 

        itemDiv.mouseOver(() => {
            itemDiv.style('color', '#FFFFFF'); 
        });
        itemDiv.mouseOut(() => {
            itemDiv.style('color', '#000000'); 
        });

        // 🌟 點擊事件
        itemDiv.mousePressed(() => {
            if (item.url === 'close') {
                closeIframe(); // 執行關閉 Iframe 的動作
                console.log('關閉視窗被選取');
            } else if (item.url) {
                loadWork(item.url); // 載入 Iframe
                console.log(`載入作品: ${item.label}`);
            } else {
                pickNewScheme(); // 換色（保留以備將來擴展）
                console.log(item.label + ' 被選取並換色');
            }
            // 🌟 點擊後收回選單 (所有選項都收回)
            menuContainer.style('left', `-${menuWidth}px`); 
        });

        menuItems.push(itemDiv);
    });

    // 3. 調整視窗大小時，選單高度和 Iframe 位置重新適應
    windowResized = function() {
        resizeCanvas(windowWidth, windowHeight);
        menuContainer.style('height', '100%');
        
        // 重新調整 Iframe 位置和大小
        if(iframeContainer) {
            iframeContainer.style('width', `${IFRAME_SCALE * 100}%`);
            iframeContainer.style('height', `${IFRAME_SCALE * 100}%`);
            iframeContainer.style('left', `${(1 - IFRAME_SCALE) / 2 * 100}%`);
            iframeContainer.style('top', `${(1 - IFRAME_SCALE) / 2 * 100}%`);
        }
    }
}

function handleMenuSlide() {
    // 🌟 移除對 Iframe 狀態的檢查：選單始終可以滑出
    if (mouseX < slideDistance && mouseX >= 0) {
        menuContainer.style('left', '0px');
    } else if (mouseX >= menuWidth) {
        menuContainer.style('left', `-${menuWidth}px`);
    } 
}

// 點擊畫布切換配色與背景（需排除選單區域及 Iframe 顯示時）
function mousePressed() {
    if (iframeContainer && iframeContainer.style('display') === 'none') {
        if (mouseX > menuWidth || menuContainer.style('left') === `-${menuWidth}px`) {
            pickNewScheme();
        }
    }
}

// 支援行動裝置連續觸控換色
function touchStarted() {
    if (iframeContainer && iframeContainer.style('display') === 'none') {
        if (mouseX > menuWidth || menuContainer.style('left') === `-${menuWidth}px`) {
            pickNewScheme();
        }
    }
    return false; // 阻止預設以避免與滑動互動衝突
}