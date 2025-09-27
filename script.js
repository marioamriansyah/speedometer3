// ====================== ELEMENTS ======================
const speedElement = document.getElementById("speed");
const gaugeBg = document.querySelector(".gauge-bg");
const gauge = document.querySelector(".gauge-progress");
const ticksGroup = document.getElementById("ticks");
const outerTicksGroup = document.getElementById("outerTicks");
const svg = document.querySelector("svg");

// ====================== SETTINGS ======================
const radius = 110;
const centerX = 105;
const centerY = 130;
const startAngle = Math.PI * 0.8;   // 144°
const endAngle = Math.PI * 2.2;     // 396°
const maxSpeed = 160;

let elements = {};
let speedMode = 1;
let indicators = 0;

const onOrOff = state => state ? 'On' : 'Off';

// tick settings
const tickSettings = {
    major: { radiusOffset: 20, length: 10 },
    medium: { radiusOffset: 20, length: 8 },
    small: { radiusOffset: 20, length: 6 }
};

const labelOffset = 40;
const outerTickSettings = { outerRadius: radius - 22, innerRadius: radius - 19 };

// ====================== HELPERS ======================
function polarToCartesian(cx, cy, r, angle) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function describeArc(cx, cy, r, startAngle, endAngle, sweepFlag = 1) {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) <= Math.PI ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

// ====================== SPEEDOMETER ======================
// background & progress path
const arcPath = describeArc(centerX, centerY, radius, startAngle, endAngle);
gaugeBg.setAttribute("d", arcPath);
gauge.setAttribute("d", arcPath);
const length = gauge.getTotalLength();
gauge.style.strokeDasharray = length;
gauge.style.strokeDashoffset = length;

// generate ticks & labels
for (let s = 0; s <= maxSpeed; s += 2) {
    const percent = s / maxSpeed;
    const angle = startAngle + percent * (endAngle - startAngle);
    let type = s % 20 === 0 ? 'major' : s % 10 === 0 ? 'medium' : 'small';
    const tickRadius = radius + tickSettings[type].radiusOffset;
    const tickLength = tickSettings[type].length;
    const outer = polarToCartesian(centerX, centerY, tickRadius, angle);
    const inner = polarToCartesian(centerX, centerY, tickRadius - tickLength, angle);

    if (!(type === 'major' && (s === 0 || s === maxSpeed))) {
        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", outer.x);
        tick.setAttribute("y1", outer.y);
        tick.setAttribute("x2", inner.x);
        tick.setAttribute("y2", inner.y);
        tick.setAttribute("class", `tick tick-${type}`);
        tick.dataset.speed = s;
        ticksGroup.appendChild(tick);
    }

    if (type === 'major') {
        let labelRadius = radius - labelOffset + 35;
        let offsetY = 0;
        if (s === 0 || s === maxSpeed) { offsetY = -10; labelRadius *= 1.08; }
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

// outer ticks
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
const healthRadius = 75;
const healthBg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
healthBg.setAttribute("cx", centerX);
healthBg.setAttribute("cy", centerY);
healthBg.setAttribute("r", healthRadius);
healthBg.setAttribute("stroke", "rgba(16,232,185,0.39)");
healthBg.setAttribute("stroke-width", "3");
healthBg.setAttribute("fill", "none");
healthBg.setAttribute("transform", `rotate(90 ${centerX} ${centerY})`);
svg.appendChild(healthBg);

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

/**
 * Updates the vehicle health display as a percentage.
 * @param {number} health - The vehicle health level (0 to 1).
 */
function setHealth(health) {
    elements.health.innerText = `${(health * 100).toFixed(1)}%`;
}

// ====================== FUEL CIRCLE ======================
const fuelRadius = 130;
const fuelStart = Math.PI / 3.8;
const fuelEnd = -Math.PI / 3.8;
const fuelBg = document.createElementNS("http://www.w3.org/2000/svg", "path");
fuelBg.setAttribute("d", describeArc(centerX, centerY, fuelRadius, fuelStart, fuelEnd, 0));
fuelBg.setAttribute("stroke", "#444");
fuelBg.setAttribute("stroke-width", "5");
fuelBg.setAttribute("fill", "none");
fuelBg.setAttribute("stroke-linecap", "round");
fuelBg.setAttribute("transform", `rotate(90 ${centerX} ${centerY})`);
svg.appendChild(fuelBg);

const fuelProgress = document.createElementNS("http://www.w3.org/2000/svg", "path");
fuelProgress.setAttribute("d", describeArc(centerX, centerY, fuelRadius, fuelStart, fuelEnd, 0));
fuelProgress.setAttribute("stroke", "#fff");
fuelProgress.setAttribute("stroke-width", "2");
fuelProgress.setAttribute("fill", "none");
fuelProgress.setAttribute("stroke-linecap", "round");
fuelProgress.setAttribute("transform", `rotate(90 ${centerX} ${centerY})`);
svg.appendChild(fuelProgress);

const fuelLength = fuelProgress.getTotalLength();
fuelProgress.style.strokeDasharray = fuelLength;

const fuelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
fuelText.setAttribute("x", centerX - 9);
fuelText.setAttribute("y", centerY + 105);
fuelText.setAttribute("fill", "#aaa");
fuelText.setAttribute("font-size", "16px");
fuelText.setAttribute("font-weight", "600");
fuelText.textContent = "100%";
svg.appendChild(fuelText);

function setFuel(fuel) {
    elements.fuel.innerText = `${(fuel * 100).toFixed(1)}%`;
}

// ====================== INDICATORS ======================
let leftBlinkInterval = null, rightBlinkInterval = null;
let leftBlinkOn = false, rightBlinkOn = false;

function setLeftIndicator(state) {
    if (leftBlinkInterval) return;
    leftBlinkInterval = setInterval(() => {
        leftBlinkOn = !leftBlinkOn;
        document.getElementById("leftIndicator").style.opacity = leftBlinkOn ? "1" : "0";
    }, 400);
}

function stopLeftIndicator() {
    clearInterval(leftBlinkInterval); leftBlinkInterval = null;
    leftBlinkOn = false; document.getElementById("leftIndicator").style.opacity = "0";
}

function setRightIndicator(state) {
    if (rightBlinkInterval) return;
    rightBlinkInterval = setInterval(() => {
        rightBlinkOn = !rightBlinkOn;
        document.getElementById("rightIndicator").style.opacity = rightBlinkOn ? "1" : "0";
    }, 400);
}

function stopRightIndicator() {
    clearInterval(rightBlinkInterval); rightBlinkInterval = null;
    rightBlinkOn = false; document.getElementById("rightIndicator").style.opacity = "0";
}

// ====================== SPEED UPDATE ======================
/**
 * Updates the speed display based on the current speed mode.
 * @param {number} speed - The speed value in meters per second (m/s).
 * @description Converts the speed value to the current speed mode and updates the display.
 */
function setSpeed(speed) {
    switch(speedMode)
    {
        case 1: speed = elements.speed.innerText = `${Math.round(speed * 2.236936)}`; break; // MPH
        case 2: speed = elements.speed.innerText = `${Math.round(speed * 1.943844)} Knots`; break; // Knots
        default: speed = elements.speed.innerText = `${Math.round(speed * 3.6)} KMH`; // KMH
    }
}


/**
 * Sets the speed display mode and updates the speed unit display.
 * @param {number} mode - The speed mode to set (0: KMH, 1: MPH, 2: Knots).
 */
function setSpeedMode(mode) {
    speedMode = mode;
    switch(mode)
    {
        case 1: elements.speedMode.innerText = 'MPH'; break;
        case 2: elements.speedMode.innerText = 'Knots'; break;
        default: elements.speedMode.innerText = 'KMH';
    }
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    elements = {
        speed: document.getElementById('speed'),
        fuel: document.getElementById('fuel'),
        health: document.getElementById('health'),
        indicators: document.getElementById('indicators'),
    };
});

// // ====================== SIMULATION ======================
// let speed = 0, health = 90, fuel = 100;
// let healthDir = -0.5, fuelDir = -0.3;

// setInterval(() => {
//     // update speed
//     speed = (speed + 1.5) % maxSpeed;
//     setSpeed(Math.round(speed));

//     // update health
//     health += healthDir;
//     if (health <= 0 || health >= 100) healthDir *= -1;
//     setHealth(Math.round(health));

//     // update fuel
//     fuel += fuelDir;
//     if (fuel <= 0 || fuel >= 100) fuelDir *= -1;
//     setFuel(Math.round(fuel));

//     // random indicator blink
//     Math.random() > 0.5 ? startLeftBlinking() : stopLeftBlinking();
//     Math.random() > 0.5 ? startRightBlinking() : stopRightBlinking();
// }, 200);
