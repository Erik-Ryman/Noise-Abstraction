"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var simplex_noise_1 = require("simplex-noise");
var alea_1 = require("alea");
var dat = require("dat.gui");
window.requestAnimationFrame = (function () {
    return (window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        });
})();
// Configs
var Configs = {
    backgroundColor: "#eee9e9",
    particleNum: 1000,
    step: 5,
    base: 1000,
    zInc: 0.001,
};
// Vars
var canvas;
var context;
var screenWidth;
var screenHeight;
var centerX;
var centerY;
var particles = [];
var hueBase = 0;
var simplexNoise = (0, simplex_noise_1.createNoise3D)((0, alea_1.default)("seed"));
var zoff = 0;
var gui;
// Initialize
function init() {
    canvas = document.getElementById("c");
    window.addEventListener("resize", onWindowResize, false);
    onWindowResize(null);
    for (var i = 0, len = Configs.particleNum; i < len; i++) {
        initParticle((particles[i] = new Particle()));
    }
    simplexNoise = (0, simplex_noise_1.createNoise3D)((0, alea_1.default)("seed"));
    canvas.addEventListener("click", onCanvasClick, false);
    gui = new dat.GUI();
    gui.add(Configs, "step", 1, 10);
    gui.add(Configs, "base", 500, 3000);
    gui.add(Configs, "zInc", 0.0001, 0.01);
    gui.close();
    update();
}
// Event listeners
function onWindowResize(e) {
    screenWidth = canvas.width = window.innerWidth;
    screenHeight = canvas.height = window.innerHeight;
    centerX = screenWidth / 2;
    centerY = screenHeight / 2;
    context = canvas.getContext("2d");
    if (context) {
        context.lineWidth = 0.3;
        context.lineCap = context.lineJoin = "round";
    }
}
function onCanvasClick(e) {
    if (!context)
        return;
    context.save();
    context.globalAlpha = 0.8;
    context.fillStyle = Configs.backgroundColor;
    context.fillRect(0, 0, screenWidth, screenHeight);
    context.restore();
    simplexNoise = (0, simplex_noise_1.createNoise3D)((0, alea_1.default)("seed"));
}
// Functions
function getNoise(x, y, z) {
    var octaves = 4, fallout = 0.5, amp = 1, f = 1, sum = 0;
    for (var i = 0; i < octaves; ++i) {
        amp *= fallout;
        sum += amp * (simplexNoise(x * f, y * f, z * f) + 1) * 0.5;
        f *= 2;
    }
    return sum;
}
function initParticle(p) {
    p.x = p.pastX = screenWidth * Math.random();
    p.y = p.pastY = screenHeight * Math.random();
    p.color.h =
        hueBase + (Math.atan2(centerY - p.y, centerX - p.x) * 180) / Math.PI;
    p.color.s = 1;
    p.color.l = 0.5;
    p.color.a = 0;
}
// Update
function update() {
    var step = Configs.step, base = Configs.base;
    for (var i = 0, len = particles.length; i < len; i++) {
        var p = particles[i];
        p.pastX = p.x;
        p.pastY = p.y;
        var angle = Math.PI * 6 * getNoise((p.x / base) * 1.75, (p.y / base) * 1.75, zoff);
        p.x += Math.cos(angle) * step;
        p.y += Math.sin(angle) * step;
        if (p.color.a < 1)
            p.color.a += 0.003;
        if (!context)
            return;
        context.beginPath();
        context.strokeStyle = p.color.toString();
        context.moveTo(p.pastX, p.pastY);
        context.lineTo(p.x, p.y);
        context.stroke();
        if (p.x < 0 || p.x > screenWidth || p.y < 0 || p.y > screenHeight) {
            initParticle(p);
        }
    }
    hueBase += 0.1;
    zoff += Configs.zInc;
    requestAnimationFrame(update);
}
// HSLA
var HSLA = /** @class */ (function () {
    function HSLA(h, s, l, a) {
        if (h === void 0) { h = 0; }
        if (s === void 0) { s = 0; }
        if (l === void 0) { l = 0; }
        if (a === void 0) { a = 0; }
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }
    HSLA.prototype.toString = function () {
        return ("hsla(" +
            this.h +
            "," +
            this.s * 100 +
            "%," +
            this.l * 100 +
            "%," +
            this.a +
            ")");
    };
    return HSLA;
}());
// Particle
var Particle = /** @class */ (function () {
    function Particle(x, y, color) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (color === void 0) { color = new HSLA(); }
        this.x = x;
        this.y = y;
        this.color = color;
        this.pastX = this.x;
        this.pastY = this.y;
    }
    return Particle;
}());
// Run
init();
