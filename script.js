const bootMessages = ["Initializing core...", "Establishing SOC link...", "Loading Neural Engine...", "SYSTEM READY."];
let msgIndex = 0;

function runBoot() {
    const logContainer = document.getElementById('boot-log');
    if (msgIndex < bootMessages.length) {
        const p = document.createElement('div');
        p.innerText = `> ${bootMessages[msgIndex]}`;
        logContainer.appendChild(p);
        msgIndex++;
        setTimeout(runBoot, 400);
    } else { 
        document.getElementById('start-btn').style.display = 'block'; 
    }
}

window.onload = runBoot;

function startSystem() {
    document.getElementById('boot-screen').style.display = 'none';
    document.getElementById('main-ui').style.visibility = 'visible';
    initMainLogic();
}

let totalLogs = 0;
let threatStats = { TOTAL: 0, BRUTEFORCE: 0, SQLI: 0, DDOS: 0, SCAN: 0 };
const countries = ["USA", "Russia", "China", "Brazil", "Germany", "Japan", "UK"];

const canvas = document.getElementById('load-chart');
const ctx = canvas.getContext('2d');
let loadData = new Array(30).fill(0);

function initMainLogic() {
    setInterval(() => { generateNormalTraffic() }, 100);
    setInterval(() => { updateGraph() }, 1000);
    setInterval(() => { 
        document.getElementById('clock').innerText = new Date().toLocaleTimeString();
    }, 1000);
    drawGraph();
}

function addLog(msg, isAtk = false) {
    totalLogs++;
    const stream = document.getElementById('log-stream');
    const div = document.createElement('div');
    div.className = isAtk ? 'l-atk' : '';
    div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    stream.appendChild(div);
    if(stream.childNodes.length > 100) stream.removeChild(stream.firstChild);
    stream.scrollTop = stream.scrollHeight;
}

function generateNormalTraffic() {
    const ips = ["192.168.1.1", "10.0.0.42", "172.16.0.5"];
    addLog(`INBOUND: GET /status from ${ips[Math.floor(Math.random()*ips.length)]} - 200 OK`);
}

function inject(type) {
    const country = countries[Math.floor(Math.random()*countries.length)];
    const ip = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.10.5`;
    
    threatStats.TOTAL++;
    threatStats[type]++;
    document.getElementById(`st-${type}`).innerText = threatStats[type];
    document.getElementById('st-TOTAL').innerText = threatStats.TOTAL;

    const feed = document.getElementById('attack-feed');
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `<span>${new Date().toLocaleTimeString()}</span> <span>${country}</span> <span>${type}</span>`;
    feed.prepend(item);
    if(feed.childNodes.length > 10) feed.removeChild(feed.lastChild);

    document.getElementById('rp-type').innerText = type;
    document.getElementById('rp-ip').innerText = ip;
    document.getElementById('rp-loc').innerText = country;
    document.getElementById('rp-score').innerText = Math.floor(Math.random()*40) + 60;

    addLog(`!!! ALERT: ${type} attack from ${ip} (${country})`, true);
    const ev = document.getElementById('event-log');
    const d = document.createElement('div');
    d.innerText = `> [${new Date().toLocaleTimeString()}] Firewall: Blocked ${ip}`;
    ev.prepend(d);
    if(ev.childNodes.length > 20) ev.removeChild(ev.lastChild);
}

function updateGraph() {
    loadData.push(Math.floor(Math.random() * 80) + 20);
    loadData.shift();
    drawGraph();
}

function drawGraph() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.strokeStyle = '#00f2ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const step = canvas.width / (loadData.length - 1);
    loadData.forEach((val, i) => {
        const x = i * step;
        const y = canvas.height - (val / 100 * canvas.height);
        if(i === 0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
    });
    ctx.stroke();
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fillStyle = "rgba(0, 242, 255, 0.1)";
    ctx.fill();
}

function toggleAuto() {
    if(document.getElementById('auto-pilot').checked) {
        const loop = () => {
            if(!document.getElementById('auto-pilot').checked) return;
            inject(['BRUTEFORCE','SQLI','DDOS','SCAN'][Math.floor(Math.random()*4)]);
            setTimeout(loop, Math.random() * 6000 + 4000);
        };
        loop();
    }
}