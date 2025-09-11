const speedElement = document.getElementById("speed");
const gaugeBg = document.querySelector(".gauge-bg");
const gauge = document.querySelector(".gauge-progress");
const ticksGroup = document.getElementById("ticks");

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
    major: { radiusOffset: 20, length: 12 },
    medium: { radiusOffset: 20, length: 8 },
    small: { radiusOffset: 20, length: 6 }
};

// pengaturan jarak label tick mayor dari radius tick
const labelOffset = 30; // semakin besar, label semakin jauh dari pusat

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

    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tick.setAttribute("x1", outer.x);
    tick.setAttribute("y1", outer.y);
    tick.setAttribute("x2", inner.x);
    tick.setAttribute("y2", inner.y);
    tick.setAttribute("class", tickClass);
    tick.dataset.speed = s;
    ticksGroup.appendChild(tick);

    // label hanya tick mayor
    if (type === 'major') {
        const labelRadius = tickRadius - labelOffset;
        const labelPoint = polarToCartesian(centerX, centerY, labelRadius, angle);
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", labelPoint.x);
        label.setAttribute("y", labelPoint.y - 5);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("class", "tick-label");
        label.textContent = s;
        ticksGroup.appendChild(label);
    }
}

function setSpeed(speed) {
    if (speed > maxSpeed) speed = maxSpeed;
    speedElement.textContent = speed;

    const percent = speed / maxSpeed;
    const offset = length - percent * length;
    gauge.style.strokeDashoffset = offset;

    // update warna tick: tick yang sudah dilewati menjadi hitam
    document.querySelectorAll("#ticks line").forEach(tick => {
        const tickSpeed = parseInt(tick.dataset.speed);
        if (tickSpeed <= speed) tick.classList.add("tick-passed");
        else tick.classList.remove("tick-passed");
    });
}

// inisialisasi
setSpeed(0);

// simulasi
let speed = 0;
setInterval(() => {
    speed = (speed + 3) % 200;
    setSpeed(speed);
}, 200);
