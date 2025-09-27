const speedElement = document.getElementById("speed");
const gaugeBg = document.querySelector(".gauge-bg");
const gauge = document.querySelector(".gauge-progress");
const ticksGroup = document.getElementById("ticks");
const outerTicksGroup = document.getElementById("outerTicks");

// pengaturan ukuran
const radius = 110;
const centerX = 105;
const centerY = 130;

// pengaturan arc
const startAngle = Math.PI * 0.8;   // 144°
const endAngle = Math.PI * 2.2;     // 396°
const maxSpeed = 160;

// pengaturan radius tick fleksibel
const tickSettings = {
    major: { radiusOffset: 20, length: 10 },
    medium: { radiusOffset: 20, length: 8 },
    small: { radiusOffset: 20, length: 6 }
};

// pengaturan jarak label tick mayor dari radius progress
const labelOffset = 40; // semakin besar, label semakin jauh ke dalam

// pengaturan outer tick kecil
const outerTickSettings = {
    outerRadius: radius - 22,
    innerRadius: radius - 19
};

function polarToCartesian(cx, cy, r, angle) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

// buat jalur background dan progress sama
const arcPath = describeArc(centerX, centerY, radius, startAngle, endAngle);
gaugeBg.setAttribute("d", arcPath);
gauge.setAttribute("d", arcPath);

// panjang path
const length = gauge.getTotalLength();
gauge.style.strokeDasharray = length;
gauge.style.strokeDashoffset = length;

// generate ticks
for (let s = 0; s <= maxSpeed; s += 2) {
    const percent = s / maxSpeed;
    const angle = startAngle + percent * (endAngle - startAngle);

    // tentukan tipe tick
    let type;
    if (s % 20 === 0) type = 'major';
    else if (s % 10 === 0) type = 'medium';
    else type = 'small';

    const tickRadius = radius + tickSettings[type].radiusOffset;
    const tickLength = tickSettings[type].length;
    const tickClass = `tick tick-${type}`;

    const outer = polarToCartesian(centerX, centerY, tickRadius, angle);
    const inner = polarToCartesian(centerX, centerY, tickRadius - tickLength, angle);

    // skip tick major di awal (0) dan akhir (maxSpeed), tapi tetap render tick lain
    if (!(type === 'major' && (s === 0 || s === maxSpeed))) {
        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", outer.x);
        tick.setAttribute("y1", outer.y);
        tick.setAttribute("x2", inner.x);
        tick.setAttribute("y2", inner.y);
        tick.setAttribute("class", tickClass);
        tick.dataset.speed = s;
        ticksGroup.appendChild(tick);
    }

    // label hanya untuk tick mayor
    if (type === 'major') {
        let labelRadius = radius - labelOffset + 35;
        let offsetY = 0;

        // khusus label 0 dan maxSpeed → sedikit digeser biar rapi
        if (s === 0 || s === maxSpeed) {
            offsetY = -10;       // geser naik
            labelRadius *= 1.08; // makin jauh keluar
        }

        const labelPoint = polarToCartesian(centerX, centerY, labelRadius, angle);
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", labelPoint.x);
        label.setAttribute("y", labelPoint.y + offsetY);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("dominant-baseline", "middle");
        label.setAttribute("class", "tick-label");
        label.textContent = s;

        ticksGroup.appendChild(label);
    }
}


// tick baru (outer-tick kecil)
for (let s = 1; s <= maxSpeed; s += 2) {
    const percent = s / maxSpeed;
    const angle = startAngle + percent * (endAngle - startAngle);

    const outer = polarToCartesian(centerX, centerY, outerTickSettings.outerRadius, angle);
    const inner = polarToCartesian(centerX, centerY, outerTickSettings.innerRadius, angle);

    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tick.setAttribute("x1", outer.x);
    tick.setAttribute("y1", outer.y);
    tick.setAttribute("x2", inner.x);
    tick.setAttribute("y2", inner.y);
    tick.setAttribute("class", "outer-tick");
    outerTicksGroup.appendChild(tick);
}

// ====================== HEALTH CIRCLE ======================
const svg = document.querySelector("svg");
const healthRadius = 75;

// background circle
const healthBg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
healthBg.setAttribute("cx", centerX);
healthBg.setAttribute("cy", centerY);
healthBg.setAttribute("r", healthRadius);
healthBg.setAttribute("stroke", "rgba(16, 232, 185, 0.39)");
healthBg.setAttribute("stroke-width", "3");
healthBg.setAttribute("fill", "none");
healthBg.setAttribute("transform", `rotate(90 ${centerX} ${centerY})`);
svg.appendChild(healthBg);

// progress circle
const healthCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
healthCircle.setAttribute("cx", centerX);
healthCircle.setAttribute("cy", centerY);
healthCircle.setAttribute("r", healthRadius);
healthCircle.setAttribute("stroke", "lime");
healthCircle.setAttribute("stroke-width", "3");
healthCircle.setAttribute("fill", "none");
healthCircle.setAttribute("class", "health-circle");
healthCircle.setAttribute("transform", `rotate(90 ${centerX} ${centerY})`);
svg.appendChild(healthCircle);

const healthLength = 2 * Math.PI * healthRadius;
healthCircle.style.strokeDasharray = healthLength;
healthCircle.style.strokeDashoffset = 0;

function setHealth(percent) {
    percent = Math.max(0, Math.min(100, percent));
    const offset = healthLength - (percent / 100) * healthLength;
    healthCircle.style.strokeDashoffset = offset;
}

// ========== FUEL CIRCLE ==========
const fuelRadius = 130;
const fuelStart = Math.PI / 3.8;   // 45° (kanan bawah)
const fuelEnd = -Math.PI / 3.8;    // -45° (kiri bawah)

// buat describeArc khusus dengan sweepFlag
function describeArc(cx, cy, r, startAngle, endAngle, sweepFlag = 1) {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) <= Math.PI ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

const fuelBg = document.createElementNS("http://www.w3.org/2000/svg", "path");
const fuelProgress = document.createElementNS("http://www.w3.org/2000/svg", "path");

// background
fuelBg.setAttribute("d", describeArc(centerX, centerY, fuelRadius, fuelStart, fuelEnd, 0)); // sweepFlag=0 untuk kanan ke kiri
fuelBg.setAttribute("stroke", "#444");
fuelBg.setAttribute("stroke-width", "5");
fuelBg.setAttribute("fill", "none");
fuelBg.setAttribute("stroke-linecap", "round");
fuelBg.setAttribute("transform", `rotate(90 ${centerX} ${centerY})`);
svg.appendChild(fuelBg);

// progress
fuelProgress.setAttribute("d", describeArc(centerX, centerY, fuelRadius, fuelStart, fuelEnd, 0));
fuelProgress.setAttribute("stroke", "#fff");
fuelProgress.setAttribute("stroke-width", "2");
fuelProgress.setAttribute("fill", "none");
fuelProgress.setAttribute("stroke-linecap", "round");
fuelProgress.setAttribute("transform", `rotate(90 ${centerX} ${centerY})`);
svg.appendChild(fuelProgress);

// strokeDash untuk progress
const fuelLength = fuelProgress.getTotalLength();
fuelProgress.style.strokeDasharray = fuelLength;
fuelProgress.style.strokeDashoffset = 0; // start penuh kanan

// fungsi update fuel (kanan ke kiri)
function setFuel(percent) {
    percent = Math.max(0, Math.min(100, percent));
    // semakin besar percent, offset makin besar → progress dari kanan ke kiri
    fuelProgress.style.strokeDashoffset = fuelLength * (percent / 100);
}

// ====================== Fuel Text ======================
const fuelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
fuelText.setAttribute("x", centerX + -4);
fuelText.setAttribute("y", centerY + 105); // posisinya di bawah jarum / center
fuelText.setAttribute("fill", "#aaa");
fuelText.setAttribute("font-size", "16px");
fuelText.setAttribute("font-weight", "600");
fuelText.textContent = "100%";
svg.appendChild(fuelText);

// update fungsi setFuel agar text sinkron
function setFuel(percent) {
    percent = Math.max(0, Math.min(100, percent));
    fuelProgress.style.strokeDashoffset = fuelLength * (1 - percent / 100);

    // update text
    fuelText.textContent = `${Math.round(percent)}%`;
}

//indicator
let leftBlinkInterval = null;
let rightBlinkInterval = null;
let leftBlinkOn = false;
let rightBlinkOn = false;

function startLeftBlinking() {
    if (leftBlinkInterval) return;
    leftBlinkInterval = setInterval(() => {
        leftBlinkOn = !leftBlinkOn;
        document.getElementById("leftIndicator").style.opacity = leftBlinkOn ? "1" : "0";
    }, 400);
}

function stopLeftBlinking() {
    clearInterval(leftBlinkInterval);
    leftBlinkInterval = null;
    leftBlinkOn = false;
    document.getElementById("leftIndicator").style.opacity = "0";
}

function startRightBlinking() {
    if (rightBlinkInterval) return;
    rightBlinkInterval = setInterval(() => {
        rightBlinkOn = !rightBlinkOn;
        document.getElementById("rightIndicator").style.opacity = rightBlinkOn ? "1" : "0";
    }, 400);
}

function stopRightBlinking() {
    clearInterval(rightBlinkInterval);
    rightBlinkInterval = null;
    rightBlinkOn = false;
    document.getElementById("rightIndicator").style.opacity = "0";
}



// ====================== SPEEDOMETER ======================
function setSpeed(speed) {
    speed = Math.min(speed, maxSpeed);
    speedElement.textContent = speed;

    const percent = speed / maxSpeed;
    const offset = length - percent * length;
    gauge.style.strokeDashoffset = offset;

    // update warna tick
    document.querySelectorAll("#ticks line").forEach(tick => {
        const tickSpeed = parseInt(tick.dataset.speed);
        if (tickSpeed <= speed) tick.classList.add("tick-passed");
        else tick.classList.remove("tick-passed");
    });
}

// inisialisasi
setSpeed(0);
setHealth(100);
setFuel(100); // fuel tambahan

// simulasi
let speed = 0;
let health = 100;
let healthDir = -1;
let fuel = 100;
let fuelDir = -0.5; // misal fuel berkurang perlahan

setInterval(() => {
    // speedometer
    speed = (speed + 3) % 200;
    setSpeed(speed);

    // health
    health += healthDir;
    if (health <= 0 || health >= 100) healthDir *= -1;
    setHealth(health);

    // fuel
    fuel += fuelDir;
    if (fuel <= 0 || fuel >= 100) fuelDir *= -1;
    setFuel(fuel);

    const randomLeft = Math.random() > 0.5;
    const randomRight = Math.random() > 0.5;

    if (randomLeft) startLeftBlinking();
    else stopLeftBlinking();

    if (randomRight) startRightBlinking();
    else stopRightBlinking();
}, 1000);
