import { createNoise3D } from "simplex-noise";
import alea from "alea";
import * as dat from "dat.gui";

(window as any).requestAnimationFrame = (() => {
  return (
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    (window as any).mozRequestAnimationFrame ||
    (window as any).oRequestAnimationFrame ||
    (window as any).msRequestAnimationFrame ||
    function (callback: FrameRequestCallback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

// Configs
const Configs = {
  backgroundColor: "#eee9e9",
  particleNum: 1000,
  step: 5,
  base: 1000,
  zInc: 0.001,
};

// Vars
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D | null;
let screenWidth: number;
let screenHeight: number;
let centerX: number;
let centerY: number;
let particles: Particle[] = [];
let hueBase = 0;
let simplexNoise = createNoise3D(alea("seed"));
let zoff = 0;
let gui: dat.GUI;

// Initialize
function init() {
  canvas = document.getElementById("c") as HTMLCanvasElement;

  window.addEventListener("resize", onWindowResize, false);
  onWindowResize(null);

  for (let i = 0, len = Configs.particleNum; i < len; i++) {
    initParticle((particles[i] = new Particle()));
  }

  simplexNoise = createNoise3D(alea("seed"));

  canvas.addEventListener("click", onCanvasClick, false);

  gui = new dat.GUI();
  gui.add(Configs, "step", 1, 10);
  gui.add(Configs, "base", 500, 3000);
  gui.add(Configs, "zInc", 0.0001, 0.01);
  gui.close();

  update();
}

// Event listeners
function onWindowResize(e: Event | null) {
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

function onCanvasClick(e: MouseEvent) {
  if (!context) return;
  context.save();
  context.globalAlpha = 0.8;
  context.fillStyle = Configs.backgroundColor;
  context.fillRect(0, 0, screenWidth, screenHeight);
  context.restore();

  simplexNoise = createNoise3D(alea("seed"));
}

// Functions
function getNoise(x: number, y: number, z: number) {
  let octaves = 4,
    fallout = 0.5,
    amp = 1,
    f = 1,
    sum = 0;

  for (let i = 0; i < octaves; ++i) {
    amp *= fallout;
    sum += amp * (simplexNoise(x * f, y * f, z * f) + 1) * 0.5;
    f *= 2;
  }

  return sum;
}

function initParticle(p: Particle) {
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
  let step = Configs.step,
    base = Configs.base;

  for (let i = 0, len = particles.length; i < len; i++) {
    let p = particles[i];

    p.pastX = p.x;
    p.pastY = p.y;

    let angle =
      Math.PI * 6 * getNoise((p.x / base) * 1.75, (p.y / base) * 1.75, zoff);
    p.x += Math.cos(angle) * step;
    p.y += Math.sin(angle) * step;

    if (p.color.a < 1) p.color.a += 0.003;

    if (!context) return;
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
class HSLA {
  h: number;
  s: number;
  l: number;
  a: number;

  constructor(h = 0, s = 0, l = 0, a = 0) {
    this.h = h;
    this.s = s;
    this.l = l;
    this.a = a;
  }

  toString() {
    return (
      "hsla(" +
      this.h +
      "," +
      this.s * 100 +
      "%," +
      this.l * 100 +
      "%," +
      this.a +
      ")"
    );
  }
}

// Particle
class Particle {
  x: number;
  y: number;
  color: HSLA;
  pastX: number;
  pastY: number;

  constructor(x = 0, y = 0, color = new HSLA()) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.pastX = this.x;
    this.pastY = this.y;
  }
}

// Run
init();
