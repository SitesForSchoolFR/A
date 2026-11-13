/* ============================================================
   BOREAL-7 — O SINAL APRENDE
   Jogo de terror psicológico em primeira pessoa · Three.js
   ------------------------------------------------------------
   Estrutura:
   0. Dados narrativos
   1. Utilitários e DOM
   2. Áudio procedural (WebAudio)
   3. Texturas e materiais procedurais
   4. Construção do mundo (estação, props, registros)
   5. Entidade "O Sinal" e navegação
   6. Jogador, interação e interface
   7. Loop principal
   ============================================================ */

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

/* ============================================================
   0. DADOS NARRATIVOS
   ============================================================ */

const RECORDS = [
  {
    id: 1,
    kind: 'FITA',
    label: 'FITA 01',
    title: 'O primeiro pulso',
    author: 'Dra. Helena Vasques · meteorologista',
    date: '12 AGO 1987 · 03:41',
    room: 'Sala de Controle',
    digit: '4',
    meshType: 'tape',
    pos: [-12.2, 0.95, -5.2],
    body:
`A estação está silenciosa demais. O gerador três caiu às 02:10 e ninguém veio me avisar. Quando fui ao corredor, as luzes de emergência estavam acesas e todas as portas dos dormitórios continuavam trancadas por dentro.

O receptor de ondas curtas captou um pulso às 03:33. Não é ruído atmosférico: são batidas. Trinta e três por minuto. Sempre trinta e três. A antena norte está desligada há seis horas — não sei de onde vem o sinal.

O termômetro do corredor marcou 4 graus. Positivo. Quatro graus com o aquecimento morto, como se alguém tivesse aberto uma janela para a neve. Não existe janela neste subsolo.

Se você está lendo isto, chegou depois. O protocolo dividiu o código da porta entre nós quatro. O primeiro dígito é 4. Procure os outros registros. Não responda ao rádio: ele aprende a sua voz.

— Registro 1 de 4. Dígito: 4.`
  },
  {
    id: 2,
    kind: 'DIÁRIO',
    label: 'DIÁRIO 02',
    title: 'Trinta e três batidas',
    author: 'Téc. Rafael Nunes · operador de rádio',
    date: '13 AGO 1987 · 02:58',
    room: 'Sala de Rádio',
    digit: '7',
    meshType: 'diary',
    pos: [-0.5, 0.95, -6.5],
    body:
`Rafael Nunes, operador de rádio. Se encontrou este diário, não sintonize a faixa 3.3.

Na noite passada o padrão se repetiu 7 vezes. Sete sequências idênticas, trinta e três pulsos cada. Gravei tudo em fita. A voz dentro do pulso fala o meu nome antes de eu ligar o microfone. Ela atrasa um pouco, como quem repete uma frase através de uma parede.

Hoje contei nove pessoas no refeitório. Nós somos nove na equipe. Quando contei de novo, havia dez. A décima estava de costas, sentada, com o casaco da Helena. A Helena não tem casaco.

O código: o segundo dígito é o número de repetições que eu contei antes de o sinal começar a responder às minhas perguntas. Sete.

Se o rádio ligar sozinho, saia da sala sem olhar para o painel.

— Registro 2 de 4. Dígito: 7.`
  },
  {
    id: 3,
    kind: 'FITA',
    label: 'FITA 03',
    title: 'Não é um sinal. É uma resposta.',
    author: 'Dr. Anselmo Kray · chefe de expedição',
    date: '15 AGO 1987 · 04:12',
    room: 'Dormitório',
    digit: '2',
    meshType: 'tape',
    pos: [13.8, 0.95, -9.2],
    body:
`Não é um sinal. É uma resposta.

Passamos três dias achando que estudávamos o pulso. Hoje entendi que era ele que estudava a gente. O sinal copia o que vê: primeiro as vozes, depois os rostos, agora os passos. Ontem o corredor devolveu os meus passos com quatro segundos de atraso.

Éramos nove. Agora restam dois. O sinal entra nos quartos à noite e fica de pé ao lado da cama, imóvel, até alguém acender a lanterna. Ele não gosta de luz. Mas a luz também não gosta da gente: cada vez que aponto os fachos para ele, sinto a bateria e a cabeça esvaziarem juntas.

Guarde o terceiro dígito: 2, o número dos que sobraram.

Não durma. Se ouvir sua própria respiração atrás de você, não se vire. Corra para a saída.

— A. Kray, chefe de expedição. Registro 3 de 4.`
  },
  {
    id: 4,
    kind: 'DIÁRIO',
    label: 'DIÁRIO 04',
    title: 'Nove riscos na parede',
    author: 'Lia Moreira · enfermeira',
    date: '16 AGO 1987 · 06:03',
    room: 'Depósito',
    digit: '9',
    meshType: 'diary',
    pos: [-12.2, 0.95, 7.6],
    body:
`Nove riscos na parede. Um para cada um de nós. Fiz o último hoje, para mim, porque já não sei se é a minha respiração que eu escuto.

O sinal não pode sair da estação. Ele precisa da gente para aprender a ser gente. Por isso trancamos a porta de emergência por dentro: se ele conseguir um rosto, que fique com a neve.

Deixei pilhas novas no depósito, ao lado desta caixa. A luz afasta o sinal, mas ele aprende o cheiro de quem tem medo. Não corra sem olhar para trás. Não olhe por tempo demais.

O quarto dígito é o número de riscos na parede. Nove.

Se conseguir sair, não responda ao rádio do resgate. A voz do outro lado vai usar a minha.

— Lia Moreira, enfermeira. Registro 4 de 4.`
  }
];

const CODE = RECORDS.map((r) => r.digit).join('');
const TAPE_WHISPERS = [
  'Você não está sozinho no corredor.',
  'Não se vire.',
  'Ele aprendeu o seu passo.',
  'Trinta e três batidas por minuto.',
  'A luz está acabando.',
  'O corredor está menor do que antes.',
  'Ele está usando a sua voz.'
];

/* ============================================================
   1. UTILITÁRIOS E DOM
   ============================================================ */

const $ = (id) => document.getElementById(id);

function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
function formatTime(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function angleLerp(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

const dom = {
  canvas: $('scene'),
  hud: $('hud'),
  hudHelp: $('hud-help'),
  recordsCount: $('records-count'),
  recordPips: $('record-pips'),
  flashlightState: $('flashlight-state'),
  batteryFill: $('battery-fill'),
  batteryPct: $('battery-pct'),
  crosshair: $('crosshair'),
  prompt: $('reticle-prompt'),
  promptText: $('prompt-text'),
  subtitle: $('subtitle'),

  reader: $('reader'),
  readerKicker: $('reader-kicker'),
  readerTitle: $('reader-title'),
  readerAuthor: $('reader-author'),
  readerDate: $('reader-date'),
  readerBody: $('reader-body'),
  readerDigit: $('reader-digit'),
  readerClose: $('reader-close'),
  readerSkip: $('reader-skip'),

  keypad: $('keypad'),
  keypadDisplay: $('keypad-display'),
  keypadHint: $('keypad-hint'),
  keypadGrid: $('keypad-grid'),
  keypadStatus: $('keypad-status'),
  keypadClose: $('keypad-close'),

  archive: $('archive'),
  archiveCount: $('archive-count'),
  archiveList: $('archive-list'),
  archiveCode: $('archive-code'),
  archiveClose: $('archive-close'),

  startScreen: $('start-screen'),
  startBtn: $('start-btn'),

  pauseScreen: $('pause-screen'),
  resumeBtn: $('resume-btn'),
  pauseArchiveBtn: $('pause-archive-btn'),
  pauseRestartBtn: $('pause-restart-btn'),
  pauseMenuBtn: $('pause-menu-btn'),

  gameoverScreen: $('gameover-screen'),
  gameoverRecords: $('gameover-records'),
  gameoverCode: $('gameover-code'),
  gameoverTime: $('gameover-time'),
  retryBtn: $('retry-btn'),
  gameoverMenuBtn: $('gameover-menu-btn'),

  endingScreen: $('ending-screen'),
  endingCode: $('ending-code'),
  endingRecords: $('ending-records'),
  endingTime: $('ending-time'),
  endingRetryBtn: $('ending-retry-btn'),
  endingMenuBtn: $('ending-menu-btn'),

  bootLoading: $('boot-loading'),
  bootError: $('boot-error'),
  fade: $('fade'),
  damage: $('damage'),
  staticFx: $('static-fx')
};

const state = {
  phase: 'menu',
  recordsFound: 0,
  battery: 100,
  flashlightOn: true,
  entry: '',
  entityActive: false,
  entitySeen: false,
  entityLit: false,
  entityDistance: 999,
  entityPath: [],
  entityGoal: null,
  pathTimer: 0,
  visionTimer: 0,
  graceTimer: 0,
  heartTimer: 0,
  whisperTimer: 24,
  ambientTimer: 16,
  staticLevel: 0,
  staticPulse: 0,
  powerFlicker: 0,
  bobPhase: 0,
  stepTimer: 0,
  runStart: 0,
  endTime: 0,
  deathTimer: 0,
  deathBase: new THREE.Vector3(),
  pausedAt: 0,
  doorAnim: 0,
  dyingLook: new THREE.Vector3(),
  target: null,
  archiveFrom: 'playing',
  fallbackLook: false,
  codeAttempts: 0,
  introDone: false,
  lastPrompt: null,
  tensionClock: 0,
  entityScreamTimer: 0,
  uiClock: 0
};

const keys = { w: false, a: false, s: false, d: false, shift: false };
const scheduledTimers = new Set();
const cameraVel = new THREE.Vector3();
const clock = new THREE.Clock();

function schedule(fn, delay) {
  const id = window.setTimeout(() => {
    scheduledTimers.delete(id);
    fn();
  }, delay);
  scheduledTimers.add(id);
  return id;
}
function clearScheduled() {
  scheduledTimers.forEach((id) => window.clearTimeout(id));
  scheduledTimers.clear();
}

/* ============================================================
   2. ÁUDIO PROCEDURAL
   ============================================================ */

const AudioEngine = {
  ctx: null,
  master: null,
  noiseBuffer: null,
  ambienceGain: null,
  staticGain: null,
  droneFilter: null,
  ready: false,
  muted: false,

  init() {
    if (this.ready) {
      this.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      this.ctx = new Ctx();
    } catch {
      return;
    }
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.85;
    this.master.connect(this.ctx.destination);

    const len = Math.floor(this.ctx.sampleRate * 2);
    this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    this.buildAmbience();
    this.ready = true;
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  },

  buildAmbience() {
    const ctx = this.ctx;
    this.ambienceGain = ctx.createGain();
    this.ambienceGain.gain.value = 1;
    this.ambienceGain.connect(this.master);

    // Drone grave, com batimento lento entre duas frequências
    this.droneFilter = ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = 190;
    this.droneFilter.Q.value = 2.2;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.11;
    this.droneFilter.connect(droneGain).connect(this.ambienceGain);

    [41.5, 42.7, 83.2].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 2 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = i === 2 ? 0.09 : 0.24;
      osc.connect(g).connect(this.droneFilter);
      osc.start();
    });

    // LFO respirando o filtro
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 55;
    lfo.connect(lfoGain).connect(this.droneFilter.frequency);
    lfo.start();

    // Zumbido elétrico
    const humGain = ctx.createGain();
    humGain.gain.value = 0.012;
    humGain.connect(this.ambienceGain);
    [100, 150].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;
      osc.connect(filter).connect(humGain);
      osc.start();
    });

    // Ar / ventilação
    const air = this.noiseSource();
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = 'lowpass';
    airFilter.frequency.value = 320;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.055;
    air.connect(airFilter).connect(airGain).connect(this.ambienceGain);
    air.start();

    // Camada de estática controlada pela tensão
    const staticSrc = this.noiseSource();
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 850;
    this.staticGain = ctx.createGain();
    this.staticGain.gain.value = 0;
    staticSrc.connect(hp).connect(this.staticGain).connect(this.master);
    staticSrc.start();
  },

  noiseSource() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    return src;
  },

  now() { return this.ctx ? this.ctx.currentTime : 0; },

  setPaused(paused) {
    if (!this.ready || !this.master) return;
    this.master.gain.setTargetAtTime(paused ? 0.3 : 0.85, this.now(), 0.35);
  },

  setTension(level) {
    if (!this.ready || !this.staticGain) return;
    const t = clamp(level, 0, 1);
    this.staticGain.gain.setTargetAtTime(t * 0.14, this.now(), 0.3);
    if (this.droneFilter) {
      this.droneFilter.frequency.setTargetAtTime(190 + t * 240, this.now(), 0.6);
    }
  },

  blip(freq = 620, dur = 0.07, gain = 0.06, type = 'square') {
    if (!this.ready) return;
    const t = this.now();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  },

  click() {
    this.blip(880, 0.05, 0.035, 'square');
  },

  footstep(running) {
    if (!this.ready) return;
    const t = this.now();
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = rand(0.75, 1.05);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = rand(320, 520);
    filter.Q.value = 1.1;
    const g = this.ctx.createGain();
    const peak = running ? 0.17 : 0.1;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (running ? 0.15 : 0.19));
    src.connect(filter).connect(g).connect(this.master);
    src.start(t, rand(0, 1.2), 0.24);
    src.stop(t + 0.26);
  },

  tape() {
    if (!this.ready) return;
    const t = this.now();
    // clique mecânico
    this.blip(240, 0.05, 0.06, 'square');
    // chiado
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2400;
    bp.Q.value = 0.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    src.connect(bp).connect(g).connect(this.master);
    src.start(t, 0, 1);
    src.stop(t + 1);
    // bipes de fita
    [660, 880].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const og = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      og.gain.setValueAtTime(0.0001, t + 0.25 + i * 0.16);
      og.gain.exponentialRampToValueAtTime(0.035, t + 0.27 + i * 0.16);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.34 + i * 0.16);
      osc.connect(og).connect(this.master);
      osc.start(t + 0.25 + i * 0.16);
      osc.stop(t + 0.4 + i * 0.16);
    });
  },

  sting() {
    if (!this.ready) return;
    const t = this.now();
    // impacto grave
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(34, t + 1.1);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 1.4);

    // rajada de estática
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(3200, t);
    bp.frequency.exponentialRampToValueAtTime(400, t + 0.8);
    bp.Q.value = 1.4;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.16, t + 0.03);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 1);
    src.connect(bp).connect(ng).connect(this.master);
    src.start(t, 0, 1);
    src.stop(t + 1.05);
  },

  heartbeat(intensity) {
    if (!this.ready) return;
    const t = this.now();
    const thump = (offset, gain) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      const g = this.ctx.createGain();
      osc.frequency.setValueAtTime(78, t + offset);
      osc.frequency.exponentialRampToValueAtTime(42, t + offset + 0.16);
      g.gain.setValueAtTime(0.0001, t + offset);
      g.gain.exponentialRampToValueAtTime(gain, t + offset + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.22);
      osc.connect(g).connect(this.master);
      osc.start(t + offset);
      osc.stop(t + offset + 0.25);
    };
    const v = 0.03 + clamp(intensity, 0, 1) * 0.12;
    thump(0, v);
    thump(0.24, v * 0.65);
  },

  whisper() {
    if (!this.ready) return;
    const t = this.now();
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 7;
    bp.frequency.setValueAtTime(1400, t);
    bp.frequency.exponentialRampToValueAtTime(520, t + 1.4);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    src.connect(bp).connect(g).connect(this.master);
    src.start(t, 0, 1.6);
    src.stop(t + 1.7);
  },

  thud() {
    if (!this.ready) return;
    const t = this.now();
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(70, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.5);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.65);
    // metal distante
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 280;
    bp.Q.value = 4;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.045, t + 0.03);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    src.connect(bp).connect(ng).connect(this.master);
    src.start(t, 0, 0.9);
    src.stop(t + 0.95);
  },

  error() {
    if (!this.ready) return;
    [170, 140, 110].forEach((f, i) => {
      const t = this.now() + i * 0.09;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.045, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      osc.connect(g).connect(this.master);
      osc.start(t);
      osc.stop(t + 0.16);
    });
  },

  success() {
    if (!this.ready) return;
    const t = this.now();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.06, t + i * 0.18 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.18 + 1.8);
      osc.connect(g).connect(this.master);
      osc.start(t + i * 0.18);
      osc.stop(t + i * 0.18 + 1.9);
    });
    // vento de saída
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 5);
    src.connect(lp).connect(g).connect(this.master);
    src.start(t, 0, 5);
    src.stop(t + 5.1);
  },

  death() {
    if (!this.ready) return;
    const t = this.now();
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(210, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 1.8);
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'lowpass';
    bp.frequency.setValueAtTime(2400, t);
    bp.frequency.exponentialRampToValueAtTime(150, t + 1.8);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    osc.connect(bp).connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 2.3);

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const ng = this.ctx.createGain();
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 500;
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    src.connect(hp).connect(ng).connect(this.master);
    src.start(t, 0, 1.4);
    src.stop(t + 1.5);
  },

  powerDown() {
    if (!this.ready) return;
    const t = this.now();
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.5);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.04, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.6);
  }
};

/* ============================================================
   3. TEXTURAS E MATERIAIS PROCEDURAIS
   ============================================================ */

function createCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function finishTexture(canvas, repeatX = 1, repeatY = 1) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 4;
  return tex;
}

function addGrain(ctx, w, h, amount) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

function makeConcreteTexture(base = '#73756f', repeatX = 4, repeatY = 1.5) {
  const s = 512;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, s, s);
  addGrain(ctx, s, s, 34);

  for (let i = 0; i < 55; i++) {
    const x = Math.random() * s;
    const y = Math.random() * s;
    const r = rand(18, 120);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dark = Math.random() < 0.7;
    g.addColorStop(0, dark ? 'rgba(24,26,23,0.17)' : 'rgba(190,188,175,0.05)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(26,28,25,0.35)';
  for (let i = 0; i < 9; i++) {
    ctx.lineWidth = rand(0.5, 1.6);
    let x = Math.random() * s;
    let y = Math.random() * s;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let j = 0; j < 7; j++) {
      x += rand(-28, 28);
      y += rand(-28, 28);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(22,24,22,0.25)';
  ctx.lineWidth = 2;
  for (let y = 128; y < s; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(s, y);
    ctx.stroke();
  }

  return finishTexture(c, repeatX, repeatY);
}

function makeFloorTexture() {
  const s = 512;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#4d504e';
  ctx.fillRect(0, 0, s, s);
  addGrain(ctx, s, s, 26);
  const tiles = 4;
  const size = s / tiles;
  for (let ty = 0; ty < tiles; ty++) {
    for (let tx = 0; tx < tiles; tx++) {
      const shade = randInt(-14, 14);
      ctx.fillStyle = `rgba(${88 + shade},${92 + shade},${90 + shade},0.55)`;
      ctx.fillRect(tx * size + 3, ty * size + 3, size - 6, size - 6);
      // manchas por tile
      for (let k = 0; k < 3; k++) {
        const gx = tx * size + Math.random() * size;
        const gy = ty * size + Math.random() * size;
        const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, rand(10, 55));
        gr.addColorStop(0, 'rgba(25,28,26,0.16)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(gx, gy, 55, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.strokeStyle = 'rgba(20,22,21,0.75)';
  ctx.lineWidth = 5;
  for (let i = 0; i <= tiles; i++) {
    ctx.beginPath();
    ctx.moveTo(i * size, 0);
    ctx.lineTo(i * size, s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * size);
    ctx.lineTo(s, i * size);
    ctx.stroke();
  }
  return finishTexture(c, 9, 6.5);
}

function makeMetalTexture() {
  const s = 512;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#5d6164';
  ctx.fillRect(0, 0, s, s);
  addGrain(ctx, s, s, 18);
  for (let i = 0; i < 900; i++) {
    ctx.strokeStyle = `rgba(200,205,205,${rand(0.01, 0.06)})`;
    ctx.lineWidth = 1;
    const x = Math.random() * s;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + rand(-6, 6), s);
    ctx.stroke();
  }
  // ferrugem
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * s;
    const y = Math.random() * s;
    const r = rand(8, 55);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${randInt(90, 130)},${randInt(50, 70)},${randInt(25, 40)},0.4)`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // parafusos
  ctx.fillStyle = 'rgba(30,32,33,0.85)';
  for (let x = 24; x < s; x += 96) {
    for (let y = 24; y < s; y += 96) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return finishTexture(c, 2, 2);
}

function makeWoodTexture() {
  const s = 512;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#5c4529';
  ctx.fillRect(0, 0, s, s);
  addGrain(ctx, s, s, 22);
  for (let i = 0; i < 9; i++) {
    const y = (i / 9) * s;
    ctx.fillStyle = 'rgba(30,20,10,0.32)';
    ctx.fillRect(0, y, s, 3);
    ctx.fillStyle = 'rgba(160,125,80,0.05)';
    ctx.fillRect(0, y + 4, s, 12);
  }
  for (let i = 0; i < 70; i++) {
    ctx.strokeStyle = `rgba(${randInt(30, 70)},${randInt(20, 45)},${randInt(10, 25)},${rand(0.08, 0.3)})`;
    ctx.lineWidth = rand(0.5, 2);
    const y = Math.random() * s;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(s * 0.3, y + rand(-14, 14), s * 0.7, y + rand(-14, 14), s, y + rand(-10, 10));
    ctx.stroke();
  }
  return finishTexture(c, 1, 1);
}

function makeHazardTexture() {
  const s = 256;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#b8932c';
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = '#17140d';
  for (let i = -s; i < s * 2; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 32, 0);
    ctx.lineTo(i + 32 - s, s);
    ctx.lineTo(i - s, s);
    ctx.closePath();
    ctx.fill();
  }
  addGrain(ctx, s, s, 30);
  return finishTexture(c, 2, 2);
}

function drawSpacedText(ctx, text, cx, y, spacing) {
  const chars = Array.from(text);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, spacing) - spacing;
  let x = cx - total / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x + widths[i] / 2, y);
    x += widths[i] + spacing;
  }
}

function makeSignTexture(text, opts = {}) {
  const w = 1024;
  const h = 192;
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.fillStyle = opts.bg || '#191c18';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = opts.line || 'rgba(198,190,150,0.4)';
  ctx.lineWidth = 5;
  ctx.strokeRect(12, 12, w - 24, h - 24);
  ctx.fillStyle = opts.color || '#d8d2b7';
  ctx.font = `600 ${opts.size || 82}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawSpacedText(ctx, text, w / 2, h / 2 + 4, opts.spacing !== undefined ? opts.spacing : 8);
  // sujeira
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = `rgba(0,0,0,${rand(0.03, 0.12)})`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, rand(4, 30), 0, Math.PI * 2);
    ctx.fill();
  }
  return finishTexture(c, 1, 1);
}

function makeScreenTexture(variant = 0) {
  const w = 256;
  const h = 160;
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.fillStyle = variant === 2 ? '#120b04' : '#02110a';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(70,255,150,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const green = variant === 2 ? '#f0b060' : '#6dffb0';
  ctx.fillStyle = green;
  ctx.font = '10px "Courier New", monospace';
  ctx.textAlign = 'left';
  const sets = [
    [
      'BOREAL-7 // METEO',
      'SINAL: 33.0 P/M',
      'ANTENA N: OFFLINE',
      'TEMP EXT: -41.2 C',
      'TEMP INT: 04.0 C',
      'PROTOCOLO: EVAC',
      'AGUARDANDO ORDEM...'
    ],
    [
      'RX 3.30 MHz',
      'PULSOS: 33',
      'REPETICOES: 07',
      'TRANSMISSOR: OFF',
      'FONTE: DESCONHECIDA',
      'CHIADO: 61%',
      'ERR: SINAL RECORRENTE'
    ],
    [
      'SAT-LINK / BOREAL-7',
      'GERADOR 1: FALHA',
      'GERADOR 2: FALHA',
      'GERADOR 3: FALHA',
      'LUZ EMERG: 12%',
      'PORTA: TRANCADA',
      '> SEM SINAL DE VIDA'
    ]
  ];
  const lines = sets[variant % sets.length];
  lines.forEach((line, i) => {
    ctx.globalAlpha = rand(0.55, 1);
    ctx.fillText(line, 14, 20 + i * 18);
  });
  ctx.globalAlpha = 1;

  // ruído e scanlines
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(${variant === 2 ? '255,210,120' : '140,255,190'},${rand(0.02, 0.18)})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, rand(1, 3), 1);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);

  return finishTexture(c, 1, 1);
}

function makeMapTexture() {
  const w = 1024;
  const h = 640;
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2b2a23';
  ctx.fillRect(0, 0, w, h);
  addGrain(ctx, w, h, 20);

  ctx.strokeStyle = 'rgba(160,170,140,0.18)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // contornos do terreno
  ctx.strokeStyle = 'rgba(190,200,170,0.4)';
  for (let i = 0; i < 9; i++) {
    ctx.lineWidth = rand(0.7, 1.6);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 24) {
      const y = h * 0.72 + Math.sin(x * 0.012 + i) * 40 + Math.cos(x * 0.03 + i * 2) * 16 - i * 8;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // planta da estação
  ctx.strokeStyle = '#d8cfa8';
  ctx.lineWidth = 4;
  ctx.strokeRect(300, 120, 330, 200);
  ctx.strokeRect(300, 120, 170, 90);
  ctx.strokeRect(470, 120, 160, 90);
  ctx.strokeRect(300, 230, 170, 90);
  ctx.strokeRect(470, 230, 160, 90);
  ctx.beginPath();
  ctx.moveTo(300, 320);
  ctx.lineTo(300, 420);
  ctx.lineTo(470, 420);
  ctx.lineTo(470, 320);
  ctx.stroke();

  ctx.fillStyle = 'rgba(216,207,168,0.9)';
  ctx.font = '16px "Courier New", monospace';
  ctx.fillText('CONTROLE', 312, 145);
  ctx.fillText('RADIO', 484, 145);
  ctx.fillText('DORM.', 312, 255);
  ctx.fillText('DEPOSITO', 484, 255);
  ctx.fillText('CORREDOR -2', 320, 345);

  // anotações em vermelho
  ctx.strokeStyle = 'rgba(220,70,55,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(610, 92, 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(586, 68);
  ctx.lineTo(634, 116);
  ctx.moveTo(634, 68);
  ctx.lineTo(586, 116);
  ctx.stroke();

  ctx.fillStyle = 'rgba(230,90,70,0.95)';
  ctx.font = '600 20px "Courier New", monospace';
  ctx.fillText('ANTENA N. — NAO ESCUTE', 590, 60);
  ctx.font = '18px "Courier New", monospace';
  ctx.fillText('33 P/M — SEMPRE 33', 320, 500);
  ctx.fillText('9 PESSOAS / 12 RISCOS', 320, 532);
  ctx.strokeStyle = 'rgba(230,90,70,0.7)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.moveTo(700 + i * 22, 470);
    ctx.lineTo(700 + i * 22, 510);
    ctx.stroke();
  }

  // moldura
  ctx.strokeStyle = 'rgba(30,30,24,0.9)';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, w - 16, h - 16);

  return finishTexture(c, 1, 1);
}

function makeProtocolTexture() {
  const w = 512;
  const h = 720;
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#cfc6ae';
  ctx.fillRect(0, 0, w, h);
  addGrain(ctx, w, h, 22);

  ctx.fillStyle = '#7c2a22';
  ctx.fillRect(0, 0, w, 90);
  ctx.fillStyle = '#efe8d4';
  ctx.font = '600 27px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PROTOCOLO DE EVACUAÇÃO', w / 2, 55);

  ctx.fillStyle = '#2b261d';
  ctx.textAlign = 'left';
  ctx.font = '16px "Courier New", monospace';
  const lines = [
    'ESTAÇÃO BOREAL-7 · SUBSOLO',
    'CÓDIGO DE 4 DÍGITOS · USO RESTRITO',
    '',
    '1. Recupere os 4 registros da equipe.',
    '2. Cada registro contém um dígito.',
    '3. A ordem dos dígitos é a ordem do',
    '   registro (1 a 4).',
    '4. Insira o código no painel ao lado',
    '   da porta de emergência.',
    '',
    'AVISO: não abra a porta sem o código',
    'completo. Não responda a vozes no',
    'rádio. Não olhe para o corredor por',
    'mais de 33 segundos.',
    '',
    'REGISTROS:',
    '  01 · CONTROLE      [  ]',
    '  02 · RÁDIO         [  ]',
    '  03 · DORMITÓRIO    [  ]',
    '  04 · DEPÓSITO      [  ]',
    '',
    'BOA SORTE. — COMANDO BOREAL'
  ];
  lines.forEach((line, i) => {
    ctx.fillText(line, 44, 140 + i * 24);
  });

  ctx.strokeStyle = 'rgba(80,60,35,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 108, w - 56, 430);

  ctx.fillStyle = 'rgba(124,42,34,0.9)';
  ctx.font = '600 18px "Courier New", monospace';
  ctx.fillText('SE A PORTA NÃO ABRIR, VOLTE AO DEPÓSITO.', 44, 600);
  ctx.font = '14px "Courier New", monospace';
  ctx.fillText('(alguém escreveu isso à mão, depois de rasurar o resto)', 44, 626);

  addGrain(ctx, w, h, 14);
  return finishTexture(c, 1, 1);
}

function makeTallyTexture() {
  const s = 512;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, s, s);
  // nove riscos de unha, irregulares
  for (let i = 0; i < 9; i++) {
    const x = 96 + i * 38 + rand(-6, 6);
    const top = 150 + rand(-24, 24);
    const bottom = 360 + rand(-20, 20);
    ctx.strokeStyle = `rgba(226, 222, 205, ${rand(0.32, 0.6)})`;
    ctx.lineWidth = rand(3, 6);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.bezierCurveTo(x + rand(-8, 8), top + 70, x + rand(-8, 8), bottom - 70, x + rand(-6, 6), bottom);
    ctx.stroke();
  }
  // mancha escura embaixo do último risco
  const g = ctx.createRadialGradient(430, 365, 2, 430, 365, 42);
  g.addColorStop(0, 'rgba(95, 12, 8, 0.7)');
  g.addColorStop(1, 'rgba(60, 8, 5, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(430, 365, 42, 0, Math.PI * 2);
  ctx.fill();
  // letra tremida
  ctx.fillStyle = 'rgba(180, 60, 45, 0.5)';
  ctx.font = '600 54px "Courier New", monospace';
  ctx.save();
  ctx.translate(404, 430);
  ctx.rotate(-0.07);
  ctx.fillText('NÃO DURMA', -240, 0);
  ctx.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeGlowTexture() {
  const s = 128;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,245,225,0.95)');
  g.addColorStop(0.3, 'rgba(255,225,180,0.32)');
  g.addColorStop(1, 'rgba(255,210,150,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const M = {};

function buildMaterials() {
  const wallTex = makeConcreteTexture('#73756f', 4, 1.6);
  const floorTex = makeFloorTexture();
  const metalTex = makeMetalTexture();
  const woodTex = makeWoodTexture();
  const hazardTex = makeHazardTexture();

  M.wall = new THREE.MeshStandardMaterial({ map: wallTex, color: 0xc7cac3, roughness: 0.96, metalness: 0.03 });
  M.ceiling = new THREE.MeshStandardMaterial({ map: wallTex, color: 0x6f736f, roughness: 1, metalness: 0.02 });
  M.floor = new THREE.MeshStandardMaterial({ map: floorTex, color: 0xbfc2bc, roughness: 0.82, metalness: 0.14 });
  M.metal = new THREE.MeshStandardMaterial({ map: metalTex, color: 0xafb4b5, roughness: 0.52, metalness: 0.6 });
  M.darkMetal = new THREE.MeshStandardMaterial({ map: metalTex, color: 0x5a6164, roughness: 0.68, metalness: 0.55 });
  M.door = new THREE.MeshStandardMaterial({ map: metalTex, color: 0x99a1a0, roughness: 0.58, metalness: 0.5 });
  M.trim = new THREE.MeshStandardMaterial({ color: 0x2f3536, roughness: 0.82, metalness: 0.4 });
  M.wood = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xc0a47e, roughness: 0.9, metalness: 0.02 });
  M.rubber = new THREE.MeshStandardMaterial({ color: 0x14171a, roughness: 0.95, metalness: 0.05 });
  M.paper = new THREE.MeshStandardMaterial({ color: 0xd8d2bf, roughness: 0.95, side: THREE.DoubleSide });
  M.hazard = new THREE.MeshStandardMaterial({ map: hazardTex, roughness: 0.9, metalness: 0.1 });
  M.glass = new THREE.MeshStandardMaterial({ color: 0x1b2b2e, roughness: 0.15, metalness: 0.7, transparent: true, opacity: 0.65 });
  M.screenA = new THREE.MeshBasicMaterial({ map: makeScreenTexture(0), toneMapped: false });
  M.screenB = new THREE.MeshBasicMaterial({ map: makeScreenTexture(1), toneMapped: false });
  M.screenC = new THREE.MeshBasicMaterial({ map: makeScreenTexture(2), toneMapped: false });
  M.glow = makeGlowTexture();
  M.map = new THREE.MeshStandardMaterial({
    map: makeMapTexture(),
    roughness: 0.9,
    emissive: 0x1c221c,
    emissiveMap: null,
    emissiveIntensity: 0.12
  });
  M.protocol = new THREE.MeshStandardMaterial({ map: makeProtocolTexture(), roughness: 0.95 });
  M.puddle = new THREE.MeshStandardMaterial({ color: 0x05080a, roughness: 0.08, metalness: 0.8 });
}

/* ============================================================
   4. CONSTRUÇÃO DO MUNDO
   ============================================================ */

let renderer;
let scene;
let camera;
let controls;
let flashlight;
let flashlightTarget;
let torchLensMat;
let torchGroup;
let entity = null;
let entityParts = null;
let exitDoorMesh = null;
let exitDoorGlow = null;
let exitLightMat = null;

const world = new THREE.Group();
const colliders = [];
const wallMeshes = [];
const interactables = [];
const emergencyLights = [];
const screenEntries = [];
const recordObjects = [];
const navNodes = [];
const dustGroup = new THREE.Group();

const WALL_H = 3.2;
const EYE_HEIGHT = 1.62;
const PLAYER_RADIUS = 0.34;
const FLASHLIGHT_INTENSITY = 3.25;

function boxMesh(w, h, d, material, x, y, z, parent = world) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addCollider(x, z, w, d) {
  colliders.push({
    minX: x - w / 2,
    maxX: x + w / 2,
    minZ: z - d / 2,
    maxZ: z + d / 2
  });
}

function addWall(x1, z1, x2, z2) {
  const horizontal = Math.abs(x2 - x1) >= Math.abs(z2 - z1);
  const w = horizontal ? Math.abs(x2 - x1) : 0.22;
  const d = horizontal ? 0.22 : Math.abs(z2 - z1);
  if (w < 0.01 || d < 0.01) return null;
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;
  const mesh = boxMesh(w, WALL_H, d, M.wall, cx, WALL_H / 2, cz);
  wallMeshes.push(mesh);
  addCollider(cx, cz, w, d);
  return mesh;
}

function addWallX(z, x1, x2, gaps = []) {
  const start = Math.min(x1, x2);
  const end = Math.max(x1, x2);
  const cuts = [...gaps].sort((a, b) => a[0] - b[0]);
  let cursor = start;
  for (const [g1, g2] of cuts) {
    if (g1 > cursor) addWall(cursor, z, g1, z);
    cursor = Math.max(cursor, g2);
  }
  if (cursor < end) addWall(cursor, z, end, z);
}

function addWallZ(x, z1, z2, gaps = []) {
  const start = Math.min(z1, z2);
  const end = Math.max(z1, z2);
  const cuts = [...gaps].sort((a, b) => a[0] - b[0]);
  let cursor = start;
  for (const [g1, g2] of cuts) {
    if (g1 > cursor) addWall(x, cursor, x, g1);
    cursor = Math.max(cursor, g2);
  }
  if (cursor < end) addWall(x, cursor, x, end);
}

function addDoorFrame(x, z, axis, width) {
  const postH = 2.35;
  const postW = 0.12;
  if (axis === 'x') {
    boxMesh(postW, postH, 0.32, M.trim, x - width / 2, postH / 2, z);
    boxMesh(postW, postH, 0.32, M.trim, x + width / 2, postH / 2, z);
    boxMesh(width + 0.24, WALL_H - postH, 0.3, M.wall, x, (WALL_H + postH) / 2, z);
    boxMesh(width + 0.1, 0.07, 0.34, M.trim, x, postH, z);
  } else {
    boxMesh(0.32, postH, postW, M.trim, x, postH / 2, z - width / 2);
    boxMesh(0.32, postH, postW, M.trim, x, postH / 2, z + width / 2);
    boxMesh(0.3, WALL_H - postH, width + 0.24, M.wall, x, (WALL_H + postH) / 2, z);
    boxMesh(0.34, 0.07, width + 0.1, M.trim, x, postH, z);
  }
}

function addDoorLeaves(x, z, axis, width, side) {
  // duas folhas abertas contra a parede do ambiente
  if (axis !== 'x') return;
  const leafW = width * 0.47;
  const angles = [side < 0 ? 1.92 : -1.92, side < 0 ? -1.92 : 1.92];
  [-1, 1].forEach((dir, i) => {
    const group = new THREE.Group();
    group.position.set(x + (dir * width) / 2, 0, z);
    const leaf = boxMesh(leafW, 2.16, 0.05, M.door, (-dir * leafW) / 2, 1.08, 0, group);
    leaf.castShadow = true;
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 6), M.darkMetal);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(-dir * (leafW - 0.14), 1.02, 0.05);
    group.add(handle);
    group.rotation.y = angles[i];
    world.add(group);
  });
}

function addSign(x, y, z, text, width, height, rotY = 0, opts = {}) {
  const map = makeSignTexture(text, opts);
  const mat = new THREE.MeshStandardMaterial({
    map,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: map,
    emissiveIntensity: opts.emissive !== undefined ? opts.emissive : 0.12,
    roughness: 0.85,
    metalness: 0.05
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  world.add(mesh);
  return mesh;
}

function addWallPanel(x, y, z, w, h, rotY, material) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  mesh.receiveShadow = true;
  world.add(mesh);
  return mesh;
}

function addEmergencyLight(x, z, phase = 0, base = 1.55, color = 0xff2f18, y = 2.82) {
  const housing = boxMesh(0.16, 0.12, 0.16, M.darkMetal, x, y + 0.18, z);
  housing.castShadow = false;
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 5), M.rubber);
  wire.position.set(x, y + 0.08, z);
  world.add(wire);

  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0x2a0603,
    emissive: color,
    emissiveIntensity: 1.6,
    roughness: 0.35
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), bulbMat);
  bulb.position.set(x, y, z);
  world.add(bulb);

  const glowMat = new THREE.SpriteMaterial({
    map: M.glow,
    color,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const glow = new THREE.Sprite(glowMat);
  glow.position.set(x, y, z);
  glow.scale.setScalar(0.85);
  world.add(glow);

  const light = new THREE.PointLight(color, base, 9, 1.7);
  light.position.set(x, y - 0.05, z);
  world.add(light);

  emergencyLights.push({ light, bulbMat, glowMat, base, phase, x, z });
}

function addDust() {
  const count = 900;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = rand(-16, 16);
    positions[i * 3 + 1] = rand(0.2, 3);
    positions[i * 3 + 2] = rand(-11, 9.5);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xc9d4cf,
    size: 0.018,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    sizeAttenuation: true
  });
  const points = new THREE.Points(geo, mat);
  dustGroup.add(points);
  world.add(dustGroup);
}

/* ---------- props ---------- */

function makeDesk(x, z, w = 1.8, d = 0.85, rotY = 0, drawerSide = 1) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  const top = boxMesh(w, 0.08, d, M.metal, 0, 0.9, 0, g);
  top.receiveShadow = true;
  // estrutura
  const legT = 0.055;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    boxMesh(legT, 0.86, legT, M.darkMetal, (sx * (w / 2 - 0.06)), 0.43, sz * (d / 2 - 0.06), g);
  });
  // gaveteiro
  const dw = Math.min(0.55, w * 0.4);
  boxMesh(dw, 0.66, d * 0.86, M.darkMetal, (w / 2 - dw / 2 - 0.06) * drawerSide, 0.56, 0, g);
  for (let i = 0; i < 3; i++) {
    boxMesh(dw * 0.85, 0.015, 0.012, M.trim, (w / 2 - dw / 2 - 0.06) * drawerSide, 0.34 + i * 0.2, d * 0.44, g);
    boxMesh(0.14, 0.02, 0.03, M.metal, (w / 2 - dw / 2 - 0.06) * drawerSide, 0.36 + i * 0.2, d * 0.44 + 0.01, g);
  }
  world.add(g);
  addCollider(x, z, w, d);
  return g;
}

function makeChair(x, z, rotY = 0, tipped = false) {
  const g = new THREE.Group();
  g.position.set(x, tipped ? 0.28 : 0, z);
  g.rotation.y = rotY;
  if (tipped) {
    g.rotation.z = Math.PI / 2.2;
    g.rotation.x = 0.2;
  }
  boxMesh(0.46, 0.06, 0.46, M.rubber, 0, 0.48, 0, g);
  boxMesh(0.44, 0.48, 0.05, M.rubber, 0, 0.74, -0.21, g);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    boxMesh(0.035, 0.48, 0.035, M.darkMetal, sx * 0.19, 0.24, sz * 0.19, g);
  });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.24, 8), M.darkMetal);
  pole.position.y = 0.14;
  g.add(pole);
  world.add(g);
  if (!tipped) addCollider(x, z, 0.48, 0.48);
  return g;
}

function makeMonitor(x, y, z, rotY = 0, variant = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  boxMesh(0.62, 0.46, 0.42, M.darkMetal, 0, 0.23, 0, g);
  boxMesh(0.5, 0.36, 0.03, M.trim, 0, 0.26, 0.215, g);
  const mat = [M.screenA, M.screenB, M.screenC][variant % 3].clone();
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.31), mat);
  screen.position.set(0, 0.26, 0.235);
  g.add(screen);
  // base
  boxMesh(0.3, 0.05, 0.26, M.darkMetal, 0, 0.03, 0, g);
  world.add(g);
  screenEntries.push({ mat, phase: rand(0, 20), base: rand(0.72, 1) });
  return g;
}

function makeRack(x, z, rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  boxMesh(1.0, 1.86, 0.55, M.darkMetal, 0, 0.93, 0, g);
  boxMesh(0.9, 1.66, 0.02, M.trim, 0, 0.96, 0.285, g);
  for (let i = 0; i < 5; i++) {
    boxMesh(0.82, 0.1, 0.03, M.metal, 0, 0.28 + i * 0.3, 0.3, g);
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.04, 8), M.metal);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(-0.24, 0.33 + i * 0.3, 0.33);
    g.add(knob);
    for (let k = 0; k < 4; k++) {
      boxMesh(0.02, 0.02, 0.02, M.screenA, 0.1 + k * 0.07, 0.34 + i * 0.3, 0.315, g);
    }
  }
  const dot = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.1), M.screenB);
  dot.position.set(0.24, 1.55, 0.3);
  g.add(dot);
  // antena
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.9, 6), M.metal);
  ant.position.set(0.34, 2.2, 0);
  g.add(ant);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), M.screenA);
  tip.position.set(0.34, 2.66, 0);
  g.add(tip);
  world.add(g);
  addCollider(x, z, 1.0, 0.55);
  return g;
}

function makeLocker(x, z, rotY = 0, count = 1) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  const unitW = 0.5;
  const totalW = unitW * count;
  boxMesh(totalW, 1.92, 0.48, M.darkMetal, 0, 0.96, 0, g);
  for (let i = 0; i < count; i++) {
    const cx = -totalW / 2 + unitW / 2 + i * unitW;
    boxMesh(unitW - 0.04, 1.8, 0.02, M.metal, cx, 0.97, 0.25, g);
    for (let v = 0; v < 4; v++) {
      for (let k = 0; k < 3; k++) {
        boxMesh(0.12, 0.02, 0.01, M.trim, cx, 1.5 + v * 0.08, 0.265, g);
        boxMesh(0.12, 0.02, 0.01, M.trim, cx, 1.5 + v * 0.08, 0.265, g);
      }
    }
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 6), M.metal);
    handle.position.set(cx + unitW / 2 - 0.09, 0.98, 0.28);
    g.add(handle);
  }
  world.add(g);
  addCollider(x, z, count === 1 ? 0.5 : totalW, 0.48);
  return g;
}

function makeShelf(x, z, rotY = 0, width = 2.2) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  boxMesh(0.05, 1.9, 0.55, M.darkMetal, -width / 2, 0.95, 0, g);
  boxMesh(0.05, 1.9, 0.55, M.darkMetal, width / 2, 0.95, 0, g);
  boxMesh(width, 1.9, 0.04, M.darkMetal, 0, 0.95, -0.26, g);
  for (let i = 0; i < 4; i++) {
    boxMesh(width, 0.05, 0.55, M.metal, 0, 0.28 + i * 0.46, 0, g);
    for (let k = 0; k < 3; k++) {
      if (Math.random() < 0.55) {
        const bw = rand(0.18, 0.36);
        boxMesh(bw, rand(0.14, 0.26), rand(0.18, 0.32), M.wood, rand(-width / 2 + 0.25, width / 2 - 0.25), 0.34 + i * 0.46, rand(-0.1, 0.1), g);
      }
    }
  }
  world.add(g);
  addCollider(x, z, width, 0.55);
  return g;
}

function makeCrate(x, z, size = 0.9, y = 0, rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  boxMesh(size, size * 0.82, size, M.wood, 0, size * 0.41, 0, g);
  // cantoneiras
  const t = 0.045;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    boxMesh(t, size * 0.82 + 0.01, t, M.darkMetal, sx * (size / 2 - t / 2), size * 0.41, sz * (size / 2 - t / 2), g);
  });
  boxMesh(size + 0.01, t, t, M.darkMetal, 0, size * 0.82 - 0.03, size / 2 - t / 2, g);
  boxMesh(size + 0.01, t, t, M.darkMetal, 0, size * 0.15, size / 2 - t / 2, g);
  world.add(g);
  addCollider(x, z, size, size);
  return g;
}

function makeBunk(x, z, rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  const w = 2.0;
  const d = 0.95;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    boxMesh(0.06, 1.7, 0.06, M.darkMetal, sx * (w / 2 - 0.04), 0.85, sz * (d / 2 - 0.04), g);
  });
  boxMesh(w, 0.07, d, M.darkMetal, 0, 0.42, 0, g);
  boxMesh(w, 0.07, d, M.darkMetal, 0, 1.5, 0, g);
  boxMesh(w - 0.1, 0.16, d - 0.1, M.rubber, 0, 0.7, 0, g);
  boxMesh(w - 0.1, 0.16, d - 0.1, M.rubber, 0, 1.72, 0, g);
  boxMesh(w - 0.25, 0.03, d - 0.25, M.paper, 0, 0.79, 0.01, g);
  boxMesh(w - 0.25, 0.03, d - 0.25, M.paper, 0, 1.81, 0.01, g);
  // escada
  boxMesh(0.06, 1.5, 0.06, M.metal, w / 2 - 0.02, 0.75, d / 2 + 0.18, g);
  boxMesh(0.06, 1.5, 0.06, M.metal, w / 2 - 0.02, 0.75, d / 2 + 0.02, g);
  for (let i = 0; i < 3; i++) {
    boxMesh(0.06, 0.04, 0.2, M.metal, w / 2 - 0.02, 0.5 + i * 0.42, d / 2 + 0.1, g);
  }
  world.add(g);
  addCollider(x, z, w, d);
  return g;
}

function makeGenerator(x, z, rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  boxMesh(1.9, 0.32, 1.2, M.darkMetal, 0, 0.16, 0, g);
  boxMesh(1.75, 1.0, 1.0, M.metal, 0, 0.82, 0, g);
  boxMesh(1.85, 0.14, 1.1, M.darkMetal, 0, 1.32, 0, g);
  // cilindro / tanque
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.2, 14), M.metal);
  tank.rotation.z = Math.PI / 2;
  tank.position.set(0, 1.53, -0.1);
  tank.castShadow = true;
  g.add(tank);
  // ventoinha
  const fan = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 6, 18), M.darkMetal);
  fan.position.set(-0.55, 0.82, 0.505);
  g.add(fan);
  for (let i = 0; i < 4; i++) {
    const blade = boxMesh(0.5, 0.03, 0.09, M.darkMetal, -0.55, 0.82, 0.52, g);
    blade.rotation.z = (i * Math.PI) / 4;
  }
  // painel e luzes
  boxMesh(0.4, 0.25, 0.05, M.trim, 0.45, 0.98, 0.51, g);
  for (let i = 0; i < 4; i++) {
    const led = boxMesh(0.05, 0.05, 0.02, i === 0 ? M.screenC : M.screenB, 0.3 + i * 0.1, 0.98, 0.54, g);
    led.castShadow = false;
  }
  // cano
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.2, 10), M.metal);
  pipe.position.set(0.55, 2.0, -0.2);
  g.add(pipe);
  world.add(g);
  addCollider(x, z, 1.9, 1.2);
  return g;
}

function makeBarrel(x, z) {
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 14), M.metal);
  barrel.position.set(x, 0.45, z);
  barrel.castShadow = true;
  barrel.receiveShadow = true;
  world.add(barrel);
  [0.2, 0.7].forEach((y) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.02, 5, 16), M.darkMetal);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, y, z);
    world.add(ring);
  });
  addCollider(x, z, 0.6, 0.6);
  return barrel;
}

function makePapers(x, z, count = 5, radius = 1.2) {
  for (let i = 0; i < count; i++) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(rand(0.16, 0.24), rand(0.2, 0.3)), M.paper);
    p.rotation.x = -Math.PI / 2;
    p.rotation.z = rand(0, Math.PI * 2);
    p.position.set(x + rand(-radius, radius), 0.012, z + rand(-radius, radius));
    p.receiveShadow = true;
    world.add(p);
  }
}

function makeFloorPuddle(x, z, radius = 0.8) {
  const p = new THREE.Mesh(new THREE.CircleGeometry(radius, 20), M.puddle);
  p.rotation.x = -Math.PI / 2;
  p.position.set(x, 0.011, z);
  world.add(p);
}

function makeKeypad(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = Math.PI;
  boxMesh(0.36, 0.52, 0.1, M.darkMetal, 0, 0, 0, g);
  boxMesh(0.3, 0.14, 0.02, M.screenA, 0, 0.13, 0.06, g);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      boxMesh(0.06, 0.035, 0.02, M.metal, -0.09 + col * 0.09, 0.02 - row * 0.075, 0.06, g);
    }
  }
  const led = boxMesh(0.03, 0.03, 0.02, M.screenC, 0.13, 0.2, 0.06, g);
  led.castShadow = false;
  world.add(g);
  return g;
}

function makeExitDoor() {
  addDoorFrame(2, 10, 'x', 1.8);
  const door = boxMesh(1.76, 2.28, 0.12, M.door, 2, 1.14, 10);
  exitDoorMesh = door;
  boxMesh(1.7, 0.1, 0.14, M.darkMetal, 2, 1.82, 10.02);
  boxMesh(1.7, 0.1, 0.14, M.darkMetal, 2, 0.46, 10.02);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 20), M.metal);
  wheel.position.set(2.42, 1.15, 9.92);
  world.add(wheel);
  const wheelSpoke1 = boxMesh(0.34, 0.025, 0.025, M.metal, 2.42, 1.15, 9.92);
  const wheelSpoke2 = boxMesh(0.025, 0.34, 0.025, M.metal, 2.42, 1.15, 9.92);
  wheelSpoke1.castShadow = false;
  wheelSpoke2.castShadow = false;

  // claridade do lado de fora, revelada quando a porta abre no final
  const outsideGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.76, 2.28),
    new THREE.MeshBasicMaterial({ color: 0xe6f4ff, toneMapped: false })
  );
  outsideGlow.position.set(2, 1.14, 10.26);
  outsideGlow.rotation.y = Math.PI;
  outsideGlow.visible = false;
  world.add(outsideGlow);
  exitDoorGlow = outsideGlow;

  // luz de estado acima da porta
  exitLightMat = new THREE.MeshStandardMaterial({
    color: 0x2a0603,
    emissive: 0xff2a14,
    emissiveIntensity: 2.2,
    roughness: 0.4
  });
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), exitLightMat);
  lamp.position.set(3.35, 2.58, 9.84);
  world.add(lamp);
  const lampHousing = boxMesh(0.2, 0.2, 0.12, M.darkMetal, 3.35, 2.58, 9.9);
  lampHousing.castShadow = false;

  addSign(2, 2.6, 9.78, 'SAÍDA DE EMERGÊNCIA', 2.4, 0.44, Math.PI, {
    bg: '#1c0f0d',
    line: 'rgba(240,110,90,0.45)',
    color: '#f6c4b8',
    size: 68,
    emissive: 0.35
  });

  const hazard = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.15), M.hazard);
  hazard.rotation.x = -Math.PI / 2;
  hazard.position.set(2, 0.013, 9.05);
  world.add(hazard);

  makeKeypad(3.5, 1.45, 9.84);
  addCollider(2, 10, 1.8, 0.25);

  interactables.push({
    kind: 'door',
    label: 'Examinar saída de emergência',
    position: new THREE.Vector3(2, 1.2, 9.6),
    range: 2.5
  });
  interactables.push({
    kind: 'keypad',
    label: 'Usar painel de evacuação',
    position: new THREE.Vector3(3.5, 1.45, 9.7),
    range: 2.3
  });
}

/* ---------- registros ---------- */

function makeTapeMesh() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.045, 0.14), M.rubber);
  body.position.y = 0.023;
  body.castShadow = true;
  g.add(body);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.07), M.paper);
  label.rotation.x = -Math.PI / 2;
  label.position.set(-0.02, 0.047, 0);
  g.add(label);
  [-0.045, 0.055].forEach((x) => {
    const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 12), M.paper);
    reel.position.set(x, 0.05, 0);
    g.add(reel);
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.014, 8), M.rubber);
    hole.position.set(x, 0.052, 0);
    g.add(hole);
  });
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xff4a32 });
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 6), ledMat);
  led.position.set(0.09, 0.05, 0.05);
  g.add(led);
  g.userData.ledMat = ledMat;
  return g;
}

function makeDiaryMesh() {
  const g = new THREE.Group();
  const cover = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.3), M.darkMetal);
  cover.position.y = 0.016;
  cover.castShadow = true;
  g.add(cover);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.026, 0.28), M.paper);
  pages.position.y = 0.036;
  g.add(pages);
  const band = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.29), M.rubber);
  band.rotation.x = -Math.PI / 2;
  band.position.set(0.02, 0.05, 0);
  g.add(band);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xffc36a });
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 6), ledMat);
  led.position.set(0.08, 0.055, 0.11);
  g.add(led);
  g.userData.ledMat = ledMat;
  return g;
}

function addRecordObject(def) {
  const runtime = {
    def,
    collected: false,
    group: null,
    glow: null,
    pulse: rand(0, 10)
  };
  const group = def.meshType === 'tape' ? makeTapeMesh() : makeDiaryMesh();
  group.position.set(def.pos[0], def.pos[1], def.pos[2]);
  group.rotation.y = rand(-0.6, 0.6);
  world.add(group);

  const glowMat = new THREE.SpriteMaterial({
    map: M.glow,
    color: 0xffd6a0,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.setScalar(0.55);
  glow.position.set(def.pos[0], def.pos[1] + 0.06, def.pos[2]);
  world.add(glow);

  runtime.group = group;
  runtime.glow = glow;
  runtime.ledMat = group.userData.ledMat;
  recordObjects.push(runtime);

  interactables.push({
    kind: 'record',
    label: `Ler ${def.label}`,
    position: new THREE.Vector3(def.pos[0], def.pos[1] + 0.14, def.pos[2]),
    range: 2.7,
    record: runtime
  });
}

function addFlavor(x, y, z, label, text, range = 2.4) {
  interactables.push({
    kind: 'flavor',
    label,
    text,
    position: new THREE.Vector3(x, y, z),
    range
  });
}

/* ---------- navegação da entidade ---------- */

function navNode(x, z) {
  const n = { x, z, edges: [], id: navNodes.length };
  navNodes.push(n);
  return n;
}

function navLink(a, b) {
  if (!a || !b || a === b) return;
  if (!a.edges.includes(b)) a.edges.push(b);
  if (!b.edges.includes(a)) b.edges.push(a);
}

function buildNav() {
  const corr = [-14, -11, -8, -5, -2, 0, 2, 4, 7, 10, 12, 14].map((x) => navNode(x, 0));
  for (let i = 1; i < corr.length; i++) navLink(corr[i - 1], corr[i]);
  const nearestCorridor = (x) => corr.reduce((best, n) => (Math.abs(n.x - x) < Math.abs(best.x - x) ? n : best), corr[0]);

  // Controle
  const cA = navNode(-11, -1.1);
  const cB = navNode(-11, -3.2);
  navLink(cA, cB);
  navLink(cA, nearestCorridor(-11));
  const c1 = navNode(-11, -6.0);
  const c2 = navNode(-11, -9.4);
  const c3 = navNode(-13.2, -8.2);
  navLink(cB, c1);
  navLink(c1, c2);
  navLink(c1, c3);

  // Rádio
  const rA = navNode(-2, -1.1);
  const rB = navNode(-2, -3.2);
  navLink(rA, rB);
  navLink(rA, nearestCorridor(-2));
  const r1 = navNode(-2, -6.2);
  const r2 = navNode(-2, -9.3);
  const r3 = navNode(0.4, -8.2);
  navLink(rB, r1);
  navLink(r1, r2);
  navLink(r1, r3);

  // Dormitório
  const dA = navNode(12, -1.1);
  const dB = navNode(12, -3.2);
  navLink(dA, dB);
  navLink(dA, nearestCorridor(12));
  const d1 = navNode(12, -6.2);
  const d2 = navNode(12, -9.0);
  const d3 = navNode(9.2, -7.6);
  navLink(dB, d1);
  navLink(d1, d2);
  navLink(d1, d3);

  // Depósito
  const pA = navNode(-9, 1.1);
  const pB = navNode(-9, 3.2);
  navLink(pA, pB);
  navLink(pA, nearestCorridor(-9));
  const p1 = navNode(-9, 6.4);
  const p2 = navNode(-7.2, 8.2);
  navLink(pB, p1);
  navLink(p1, p2);

  // Sala de emergência (spawn)
  const sA = navNode(2, 1.1);
  const sB = navNode(2, 3.2);
  navLink(sA, sB);
  navLink(sA, nearestCorridor(2));
  const s1 = navNode(2, 6.4);
  const s2 = navNode(4.4, 6.4);
  navLink(sB, s1);
  navLink(s1, s2);

  // Geradores
  const gA = navNode(12, 1.1);
  const gB = navNode(12, 3.2);
  navLink(gA, gB);
  navLink(gA, nearestCorridor(12));
  const g1 = navNode(12, 6.2);
  const g2 = navNode(10.0, 5.2);
  navLink(gB, g1);
  navLink(g1, g2);
}

function nearestNode(x, z) {
  let best = navNodes[0];
  let bestD = Infinity;
  for (const n of navNodes) {
    const dx = n.x - x;
    const dz = n.z - z;
    const d = dx * dx + dz * dz;
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best;
}

function findPath(start, goal) {
  if (!start || !goal || start === goal) return [];
  const came = new Map();
  came.set(start, null);
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === goal) break;
    for (const nb of cur.edges) {
      if (!came.has(nb)) {
        came.set(nb, cur);
        queue.push(nb);
      }
    }
  }
  if (!came.has(goal)) return [];
  const path = [];
  let node = goal;
  while (node && node !== start) {
    path.push(node);
    node = came.get(node);
  }
  return path.reverse();
}

/* ---------- estrutura ---------- */

function buildStructure() {
  const floor = new THREE.Mesh(new THREE.BoxGeometry(36, 0.2, 26), M.floor);
  floor.position.set(0, -0.1, -1);
  floor.receiveShadow = true;
  world.add(floor);

  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(36, 0.2, 26), M.ceiling);
  ceiling.position.set(0, 3.3, -1);
  ceiling.receiveShadow = true;
  world.add(ceiling);

  // corredor principal
  addWallX(-2, -16, 16, [[-12.1, -9.9], [-3.1, -0.9], [10.9, 13.1]]);
  addWallX(2, -16, 16, [[-10.1, -7.9], [0.9, 3.1], [10.9, 13.1]]);
  addWallZ(-16, -2, 2);
  addWallZ(16, -2, 2);

  // Controle
  addWallX(-12, -16, -6);
  addWallZ(-16, -12, -2);
  addWallZ(-6, -12, -2);

  // Rádio
  addWallX(-12, -6, 2);
  addWallZ(2, -12, -2);

  // Dormitório
  addWallX(-12, 2, 16);
  addWallZ(16, -12, -2);

  // Depósito
  addWallX(10, -14, -4);
  addWallZ(-14, 2, 10);
  addWallZ(-4, 2, 10);

  // Sala de emergência
  addWallX(10, -2, 6, [[1.1, 2.9]]);
  addWallZ(-2, 2, 10);
  addWallZ(6, 2, 10);

  // Geradores
  addWallX(10, 8, 16);
  addWallZ(8, 2, 10);
  addWallZ(16, 2, 10);

  // portas internas
  addDoorFrame(-11, -2, 'x', 2.2);
  addDoorLeaves(-11, -2, 'x', 2.2, -1);
  addDoorFrame(-2, -2, 'x', 2.2);
  addDoorLeaves(-2, -2, 'x', 2.2, -1);
  addDoorFrame(12, -2, 'x', 2.2);
  addDoorLeaves(12, -2, 'x', 2.2, -1);
  addDoorFrame(-9, 2, 'x', 2.2);
  addDoorLeaves(-9, 2, 'x', 2.2, 1);
  addDoorFrame(2, 2, 'x', 2.2);
  addDoorLeaves(2, 2, 'x', 2.2, 1);
  addDoorFrame(12, 2, 'x', 2.2);
  addDoorLeaves(12, 2, 'x', 2.2, 1);

  makeExitDoor();

  // rodapés e faixa industrial no corredor
  boxMesh(31.6, 0.13, 0.05, M.trim, 0, 0.065, -1.87);
  boxMesh(31.6, 0.13, 0.05, M.trim, 0, 0.065, 1.87);
  boxMesh(31.6, 0.07, 0.03, M.rubber, 0, 1.1, -1.87);
  boxMesh(31.6, 0.07, 0.03, M.rubber, 0, 1.1, 1.87);

  // vigas no teto
  for (let x = -14; x <= 14; x += 4) {
    boxMesh(0.16, 0.22, 4.0, M.darkMetal, x, 3.02, 0);
  }

  // tubulações do corredor
  [-1.55, 1.55].forEach((z, idx) => {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 31.4, 10), M.metal);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, 2.86 - idx * 0.12, z);
    pipe.castShadow = true;
    world.add(pipe);
    for (let x = -15; x <= 15; x += 3) {
      const joint = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.08, 10), M.darkMetal);
      joint.rotation.z = Math.PI / 2;
      joint.position.set(x, 2.86 - idx * 0.12, z);
      world.add(joint);
    }
  });

  // cabos soltos no teto
  for (let i = 0; i < 5; i++) {
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 31, 6), M.rubber);
    cable.rotation.z = Math.PI / 2;
    cable.position.set(0, 2.98 - i * 0.03, -1.75 + i * 0.06);
    world.add(cable);
  }

  // poças e detritos
  makeFloorPuddle(-5.2, 0.6, 0.9);
  makeFloorPuddle(6.4, -0.9, 0.65);
  makeFloorPuddle(-12.6, 4.2, 0.55);
  makePapers(-4, 0.5, 7, 1.6);
  makePapers(8.6, -1.0, 5, 1.2);

  // placas sobre as portas
  addSign(-11, 2.62, -1.78, 'CONTROLE METEOROLÓGICO', 2.6, 0.38, 0);
  addSign(-2, 2.62, -1.78, 'RÁDIO · TRANSMISSÕES', 2.4, 0.38, 0);
  addSign(12, 2.62, -1.78, 'DORMITÓRIO', 2.0, 0.38, 0);
  addSign(-9, 2.62, 1.78, 'DEPÓSITO', 1.9, 0.38, Math.PI);
  addSign(12, 2.62, 1.78, 'GERADORES', 2.0, 0.38, Math.PI);
  addSign(2, 2.62, 1.78, 'SALA DE EMERGÊNCIA', 2.3, 0.38, Math.PI, { size: 60 });
}

/* ---------- props por sala ---------- */

function buildProps() {
  /* ===== SALA DE CONTROLE ===== */
  makeDesk(-13.1, -10.95, 3.4, 0.9, 0, 1);
  makeMonitor(-14.1, 0.95, -10.85, 0, 0);
  makeMonitor(-13.15, 0.95, -10.85, 0.06, 1);
  makeMonitor(-12.2, 0.95, -10.85, -0.05, 2);
  makeDesk(-12.2, -5.2, 1.7, 0.85, 0.03, -1);
  makeChair(-12.2, -6.2, 0.1);
  makeChair(-10.4, -7.4, 2.4, true);
  makeLocker(-6.34, -9.4, -Math.PI / 2, 2);
  makeLocker(-6.34, -6.8, -Math.PI / 2, 1);
  addWallPanel(-15.86, 1.75, -6.6, 2.5, 1.35, Math.PI / 2, M.map);
  makePapers(-11.8, -9.8, 6, 1.4);
  addWallPanel(-15.84, 1.65, -4.0, 0.62, 0.86, Math.PI / 2, M.protocol);
  addEmergencyLight(-14.8, -7.6, 0.4, 1.95);
  addFlavor(-13.1, 1.25, -10.6, 'Examinar mapa da estação',
    'O mapa mostra a Estação Boreal-7 inteira. Alguém riscou a palavra "ANTENA" e escreveu, em vermelho: NÃO ESCUTE.');
  addFlavor(-15.7, 1.6, -6.6, 'Examinar o quadro de mapas',
    'Os contornos do terreno foram refeitos à mão dezenas de vezes. Todas as linhas convergem para a antena norte.');

  /* ===== SALA DE RÁDIO ===== */
  makeRack(-4.7, -11.3, 0);
  makeRack(-2.2, -11.3, 0);
  makeRack(0.3, -11.3, 0);
  makeDesk(-0.5, -6.5, 1.9, 0.85, 0, 1);
  makeChair(-0.5, -7.5, Math.PI + 0.1, false);
  makeLocker(1.62, -4.4, -Math.PI / 2, 2);
  makeDesk(1.3, -9.0, 1.2, 0.8, Math.PI / 2, 1);
  makeMonitor(1.2, 0.95, -9.0, -Math.PI / 2, 1);
  addWallPanel(-5.86, 1.8, -8.2, 2.3, 1.1, Math.PI / 2, M.map);
  // fones sobre a mesa
  const phones = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 14, Math.PI), M.rubber);
  phones.rotation.x = Math.PI / 2;
  phones.position.set(-0.6, 0.99, -6.6);
  world.add(phones);
  makePapers(-1.6, -5.4, 4, 1.0);
  addEmergencyLight(-5.2, -8.0, 1.8, 1.8);
  addFlavor(-2.2, 1.35, -11.0, 'Examinar o rack de transmissão',
    'O painel está quente. O botão de transmissão continua apertado, como se alguém tivesse acabado de falar.');
  addFlavor(-4.7, 1.35, -11.0, 'Examinar o gravador',
    'Uma fita gira sozinha no gravador. O contador marca 03:33 e não se move.');

  /* ===== DORMITÓRIO ===== */
  makeBunk(5.2, -11.15, 0);
  makeBunk(11.0, -11.15, 0);
  makeLocker(2.36, -6.4, Math.PI / 2, 2);
  makeLocker(2.36, -7.6, Math.PI / 2, 1);
  makeLocker(2.36, -8.8, Math.PI / 2, 1);
  makeDesk(13.8, -9.2, 1.5, 0.85, 0.05, 1);
  makeChair(13.6, -8.2, Math.PI - 0.2);
  makeCrate(8.6, -5.0, 0.8);
  makePapers(12.0, -6.2, 5, 1.5);
  addEmergencyLight(14.8, -6.6, 3.1, 1.75);
  addFlavor(6.5, 1.2, -10.6, 'Examinar o beliche',
    'O lençol de cima está puxado para trás, como se alguém tivesse acabado de levantar. Ainda está morno.');
  addFlavor(2.4, 1.2, -7.6, 'Examinar os armários',
    'Os armários estão vazios, menos um. Por dentro da porta, há marcas de dedos — como se alguém tivesse sido trancado ali.');

  /* ===== DEPÓSITO ===== */
  makeShelf(-13.4, 5.2, Math.PI / 2, 2.6);
  makeShelf(-13.4, 8.3, Math.PI / 2, 2.4);
  makeShelf(-6.2, 3.1, Math.PI / 2, 1.8);
  makeCrate(-12.2, 7.6, 1.15, 0, 0.04);
  makeCrate(-10.9, 8.55, 0.8, 0, -0.2);
  makeCrate(-7.3, 8.5, 0.95, 0, 0.3);
  makeCrate(-8.2, 8.3, 0.65, 0.78, 0.1);
  makeBarrel(-5.2, 4.2);
  makePapers(-9.6, 6.0, 6, 1.5);
  addWallPanel(-13.88, 1.5, 8.9, 1.5, 0.9, Math.PI / 2, M.map);
  const tallyMat = new THREE.MeshStandardMaterial({
    map: makeTallyTexture(),
    transparent: true,
    roughness: 0.95,
    metalness: 0,
    depthWrite: false
  });
  const tally = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), tallyMat);
  tally.position.set(-11.0, 1.4, 9.86);
  tally.rotation.y = Math.PI;
  world.add(tally);
  addEmergencyLight(-5.2, 6.2, 4.6, 1.8);
  addFlavor(-11.0, 1.42, 9.62, 'Examinar os riscos na parede',
    'Nove riscos, feitos com a unha. O último ainda tem uma gota de sangue seca embaixo.');
  addFlavor(-4.3, 1.4, 3.2, 'Examinar as prateleiras',
    'Pilhas novas, uma lanterna quebrada e um rádio portátil mudo. Alguém deixou tudo organizado para a próxima pessoa.');

  /* ===== SALA DE EMERGÊNCIA (spawn) ===== */
  // banco
  const bench = new THREE.Group();
  bench.position.set(-1.5, 0, 6.4);
  bench.rotation.y = Math.PI / 2;
  boxMesh(1.8, 0.08, 0.42, M.wood, 0, 0.45, 0, bench);
  boxMesh(0.08, 0.45, 0.38, M.darkMetal, -0.75, 0.22, 0, bench);
  boxMesh(0.08, 0.45, 0.38, M.darkMetal, 0.75, 0.22, 0, bench);
  world.add(bench);
  addCollider(-1.5, 6.4, 0.42, 1.8);

  makeLocker(5.55, 4.2, -Math.PI / 2, 2);
  makeLocker(5.55, 6.6, -Math.PI / 2, 1);
  addWallPanel(-1.86, 1.72, 8.0, 0.68, 0.95, Math.PI / 2, M.protocol);
  makePapers(-0.6, 8.6, 4, 1.0);
  addEmergencyLight(5.2, 3.4, 2.2, 1.9);
  addFlavor(-1.6, 1.5, 8.0, 'Ler o protocolo de evacuação',
    'Recupere os quatro registros da equipe. Cada um guarda um dígito. O código tem quatro números, na ordem dos registros.');
  addFlavor(5.4, 1.25, 5.4, 'Examinar os armários de emergência',
    'Macacões térmicos, todos do mesmo tamanho. Um deles tem o seu nome bordado no peito.');

  /* ===== GERADORES ===== */
  makeGenerator(10.3, 8.55, 0);
  makeGenerator(13.9, 8.55, 0);
  makeBarrel(9.2, 4.4);
  makeBarrel(9.85, 4.75);
  makeCrate(14.6, 3.2, 0.8);
  // painel elétrico
  boxMesh(1.0, 1.2, 0.16, M.darkMetal, 15.82, 1.5, 5.4);
  const breakerDoor = boxMesh(0.9, 1.05, 0.02, M.metal, 15.72, 1.5, 5.4);
  breakerDoor.rotation.y = -Math.PI / 2;
  for (let i = 0; i < 6; i++) {
    boxMesh(0.06, 0.16, 0.04, M.rubber, 15.7, 1.2 + i * 0.13, 5.0 + (i % 2) * 0.25);
  }
  addEmergencyLight(14.6, 4.2, 5.6, 1.9);
  addFlavor(15.5, 1.6, 5.4, 'Examinar o painel elétrico',
    'Todos os disjuntores estão derretidos. Mesmo assim, as luzes vermelhas continuam piscando, vindas de uma fonte que não está ligada.');
  addFlavor(10.3, 1.45, 8.5, 'Examinar o gerador',
    'Os geradores estão frios. Sem combustível, sem bateria. O ponteiro do voltímetro treme no zero.');

  /* ===== CORREDOR ===== */
  makeLocker(-15.6, 0.9, -Math.PI / 2, 2);
  makeLocker(15.6, -0.9, Math.PI / 2, 2);
  makeChair(7.2, 0.9, 2.0, true);
  makeBarrel(4.9, -1.3);
  addEmergencyLight(-8.8, 0, 0.9, 2.15);
  addEmergencyLight(8.8, 0, 2.9, 2.15);
  // extintor
  const ext = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 10), M.metal);
  ext.position.set(-15.8, 1.1, -0.4);
  world.add(ext);
  makePapers(2.4, 1.4, 4, 1.0);
  makeFloorPuddle(11.2, 0.4, 0.7);
}

/* ---------- luzes ---------- */

function buildLights() {
  scene.add(new THREE.AmbientLight(0x2b3944, 0.78));
  scene.add(new THREE.HemisphereLight(0x445665, 0x050607, 0.4));

  flashlight = new THREE.SpotLight(0xfff0d4, FLASHLIGHT_INTENSITY, 32, 0.5, 0.62, 1.1);
  flashlight.position.set(0.26, -0.22, 0.02);
  flashlight.castShadow = true;
  flashlight.shadow.mapSize.set(1024, 1024);
  flashlight.shadow.camera.near = 0.4;
  flashlight.shadow.camera.far = 34;
  flashlight.shadow.bias = -0.0012;
  flashlight.shadow.radius = 2;
  flashlightTarget = new THREE.Object3D();
  flashlightTarget.position.set(0, 0, -1);
  camera.add(flashlight);
  camera.add(flashlightTarget);
  flashlight.target = flashlightTarget;

  // lanterna física (modelo)
  torchGroup = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.26, 12), M.darkMetal);
  body.rotation.x = Math.PI / 2;
  torchGroup.add(body);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.04, 0.08, 12), M.metal);
  head.rotation.x = Math.PI / 2;
  head.position.z = -0.16;
  torchGroup.add(head);
  torchLensMat = new THREE.MeshStandardMaterial({
    color: 0x332a1c,
    emissive: 0xffe6b8,
    emissiveIntensity: 1.2,
    roughness: 0.2
  });
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.045, 14), torchLensMat);
  lens.position.z = -0.201;
  lens.rotation.y = Math.PI;
  torchGroup.add(lens);
  torchGroup.position.set(0.3, -0.28, -0.42);
  torchGroup.rotation.set(0.06, -0.18, 0.1);
  camera.add(torchGroup);

  // lâmpada fluorescente do corredor (fraca, falhando)
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0x1a2220,
    emissive: 0xa8d8cf,
    emissiveIntensity: 0.7,
    roughness: 0.4
  });
  const tube = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.06, 0.16), tubeMat);
  tube.position.set(-4.4, 3.08, 0);
  world.add(tube);
  const tube2 = tube.clone();
  tube2.position.set(6.0, 3.08, 0);
  tube2.material = tubeMat.clone();
  world.add(tube2);
  const fluorescentLight = new THREE.PointLight(0xbcd8d2, 0.55, 9, 1.8);
  fluorescentLight.position.set(-4.4, 2.95, 0);
  world.add(fluorescentLight);
  emergencyLights.push({
    light: fluorescentLight,
    bulbMat: tubeMat,
    glowMat: null,
    base: 0.55,
    phase: 1.2,
    x: -4.4,
    z: 0,
    fluorescent: true
  });
}

/* ---------- montagem final do mundo ---------- */

function buildWorld() {
  buildMaterials();
  buildStructure();
  buildProps();
  RECORDS.forEach(addRecordObject);
  buildNav();
  buildLights();
  addDust();

  // sujeira e sangue seco
  const stainMat = new THREE.MeshStandardMaterial({
    color: 0x1c0806,
    roughness: 0.55,
    metalness: 0.1,
    transparent: true,
    opacity: 0.75
  });
  [[-11.4, -2.9, 0.5], [1.6, 1.5, 0.35], [-8.9, 5.4, 0.4]].forEach(([x, z, r]) => {
    const stain = new THREE.Mesh(new THREE.CircleGeometry(r, 16), stainMat);
    stain.rotation.x = -Math.PI / 2;
    stain.position.set(x, 0.014, z);
    world.add(stain);
  });
}

/* ============================================================
   5. ENTIDADE — O SINAL
   ============================================================ */

function buildEntity() {
  const g = new THREE.Group();
  g.visible = false;
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x06080b,
    roughness: 0.42,
    metalness: 0.18
  });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.72, 4, 10), bodyMat);
  torso.position.set(0, 1.28, 0);
  torso.castShadow = true;
  g.add(torso);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.16, 8), bodyMat);
  neck.position.set(0, 1.82, 0);
  g.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.96, 0.02);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.165, 14, 12), bodyMat);
  head.scale.set(0.92, 1.22, 0.94);
  head.castShadow = true;
  headGroup.add(head);
  // olhos
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xe8f4ff });
  [-0.06, 0.06].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), eyeMat);
    eye.position.set(x, 0.03, 0.155);
    headGroup.add(eye);
  });
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.01), new THREE.MeshBasicMaterial({ color: 0x8b0f0f }));
  mouth.position.set(0, -0.055, 0.156);
  headGroup.add(mouth);
  g.add(headGroup);

  const makeLimb = (x, y, len, radius, offX = 0) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    const limb = new THREE.Mesh(new THREE.CapsuleGeometry(radius, len, 3, 6), bodyMat);
    limb.position.set(offX, -len / 2 - radius * 0.4, 0);
    limb.castShadow = true;
    pivot.add(limb);
    g.add(pivot);
    return pivot;
  };

  const armL = makeLimb(-0.31, 1.6, 0.95, 0.05);
  const armR = makeLimb(0.31, 1.6, 0.95, 0.05);
  const legL = makeLimb(-0.12, 0.95, 0.82, 0.075);
  const legR = makeLimb(0.12, 0.95, 0.82, 0.075);

  armL.rotation.z = 0.09;
  armR.rotation.z = -0.09;

  // aura de estática
  const count = 260;
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = rand(0.25, 0.85);
    const y = rand(0.15, 2.3);
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(a) * r;
    basePositions[i * 3] = positions[i * 3];
    basePositions[i * 3 + 1] = positions[i * 3 + 1];
    basePositions[i * 3 + 2] = positions[i * 3 + 2];
  }
  const auraGeo = new THREE.BufferGeometry();
  auraGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const auraMat = new THREE.PointsMaterial({
    color: 0xbfe0ff,
    size: 0.022,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const aura = new THREE.Points(auraGeo, auraMat);
  g.add(aura);

  g.position.set(0, 0, 0);
  world.add(g);

  entity = g;
  entityParts = { torso, headGroup, armL, armR, legL, legR, aura, auraGeo, basePositions, auraMat };
  entity.userData.walkPhase = 0;
  entity.userData.rot = 0;
}

function farthestNodeFromPlayer() {
  let best = navNodes[0];
  let bestDist = -1;
  for (const n of navNodes) {
    const d = Math.hypot(n.x - camera.position.x, n.z - camera.position.z);
    if (d > bestDist) {
      bestDist = d;
      best = n;
    }
  }
  return best;
}

function placeEntityAtNode(node) {
  entity.position.set(node.x, 0, node.z);
  entity.userData.rot = Math.atan2(camera.position.x - node.x, camera.position.z - node.z);
  entity.rotation.y = entity.userData.rot;
}

function activateEntity() {
  if (state.entityActive) {
    surgeEntity();
    return;
  }
  state.entityActive = true;
  entity.visible = true;
  placeEntityAtNode(farthestNodeFromPlayer());
  state.entityPath = [];
  state.entityGoal = null;
  state.graceTimer = 5.5;
  state.powerFlicker = 1.8;
  state.staticPulse = 0.7;
  AudioEngine.sting();
  showSubtitle('Algo se moveu no fim do corredor.', 4.5, true);
}

function surgeEntity() {
  if (!state.entityActive) {
    activateEntity();
    return;
  }
  const candidates = navNodes.filter((n) => {
    const d = Math.hypot(n.x - camera.position.x, n.z - camera.position.z);
    return d > 7 && d < 17;
  });
  const pool = candidates.length ? candidates : navNodes;
  placeEntityAtNode(pick(pool));
  state.entityPath = [];
  state.entityGoal = null;
  state.graceTimer = Math.max(state.graceTimer, 3.2);
  state.powerFlicker = 2.2;
  state.staticPulse = 1;
  state.whisperTimer = Math.min(state.whisperTimer, 1.5);
  AudioEngine.sting();
}

function entityVision() {
  const dx = entity.position.x - camera.position.x;
  const dz = entity.position.z - camera.position.z;
  const dist = Math.hypot(dx, dz);
  const eye = new THREE.Vector3(0, 0, 0);
  entity.getWorldPosition(eye);
  eye.y = 1.5;

  const dirTo = new THREE.Vector3().subVectors(eye, camera.position);
  const len = dirTo.length();
  if (len < 0.001) return { dist, seen: true, lit: false };
  dirTo.divideScalar(len);

  const camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);
  const alignment = camDir.dot(dirTo);
  const inView = alignment > 0.2;
  const inBeam = alignment > 0.86;

  let seen = false;
  if (inView) {
    const ray = new THREE.Raycaster(camera.position, dirTo, 0.1, Math.max(0.2, len - 0.35));
    const hits = ray.intersectObjects(wallMeshes, false);
    seen = hits.length === 0;
  }
  return { dist, seen, lit: seen && inBeam && dist < 20 };
}

function pickGoalNode() {
  const px = camera.position.x;
  const pz = camera.position.z;
  const inSpawn = px > -2 && px < 6 && pz > 2 && pz < 10;
  if (inSpawn && state.recordsFound < 2) {
    return navNodes.reduce((best, n) => (Math.abs(n.x - 4) + Math.abs(n.z - 0) < Math.abs(best.x - 4) + Math.abs(best.z) ? n : best), navNodes[0]);
  }
  return nearestNode(px, pz);
}

function updateEntity(dt, t) {
  if (!state.entityActive || !entity.visible) return;

  const px = camera.position.x;
  const pz = camera.position.z;

  state.visionTimer -= dt;
  if (state.visionTimer <= 0) {
    state.visionTimer = 0.12;
    const vision = entityVision();
    state.entityDistance = vision.dist;
    state.entitySeen = vision.seen;
    state.entityLit = state.flashlightOn && state.battery > 0 && vision.lit;
    if (state.entityLit && state.entityScreamTimer <= 0 && vision.dist < 8) {
      AudioEngine.sting();
      state.entityScreamTimer = 7;
      state.staticPulse = 0.8;
    }
  }
  state.entityScreamTimer = Math.max(0, state.entityScreamTimer - dt);

  const dist = state.entityDistance;
  state.graceTimer = Math.max(0, state.graceTimer - dt);

  // velocidade conforme comportamento
  let speed = 1.0 + state.recordsFound * 0.3 + state.codeAttempts * 0.08;
  if (state.entityLit) speed *= 0.12;
  else if (state.entitySeen) speed *= 0.48;
  else speed *= 1.42;
  if (!state.flashlightOn || state.battery <= 0) speed *= 1.08;
  if (state.graceTimer > 0) speed *= 0.12;
  if (state.phase === 'playing' && state.graceTimer <= 0 && dist < 1.25) {
    die();
    return;
  }

  // caminho
  state.pathTimer -= dt;
  if (state.pathTimer <= 0 || state.entityPath.length === 0) {
    state.pathTimer = 0.5;
    const goal = pickGoalNode();
    if (state.entityGoal !== goal) {
      state.entityGoal = goal;
      const start = nearestNode(entity.position.x, entity.position.z);
      state.entityPath = findPath(start, goal);
    }
  }

  let moveX = 0;
  let moveZ = 0;
  if (state.entityPath.length > 0) {
    const target = state.entityPath[0];
    const dx = target.x - entity.position.x;
    const dz = target.z - entity.position.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.4) {
      state.entityPath.shift();
    } else {
      moveX = dx / d;
      moveZ = dz / d;
    }
  } else {
    // sem caminho: vai direto, mantendo distância mínima
    const dx = px - entity.position.x;
    const dz = pz - entity.position.z;
    const d = Math.hypot(dx, dz);
    if (d > 1.1) {
      moveX = dx / d;
      moveZ = dz / d;
    }
  }

  if (moveX !== 0 || moveZ !== 0) {
    entity.position.x += moveX * speed * dt;
    entity.position.z += moveZ * speed * dt;
    const desired = Math.atan2(moveX, moveZ);
    entity.userData.rot = angleLerp(entity.userData.rot, desired, 1 - Math.exp(-6 * dt));
    entity.rotation.y = entity.userData.rot;
    entity.userData.walkPhase += dt * (1.6 + speed * 2.6);
  } else {
    entity.userData.walkPhase += dt * 0.7;
  }

  // animação de membros
  const swing = Math.sin(entity.userData.walkPhase) * 0.55;
  entityParts.legL.rotation.x = swing;
  entityParts.legR.rotation.x = -swing;
  entityParts.armL.rotation.x = -swing * 0.7;
  entityParts.armR.rotation.x = swing * 0.7;
  entityParts.torso.position.y = 1.28 + Math.abs(Math.cos(entity.userData.walkPhase)) * 0.02;
  entityParts.headGroup.rotation.z = Math.sin(t * 0.9) * 0.05;

  // aura
  const pos = entityParts.auraGeo.attributes.position;
  const base = entityParts.basePositions;
  const jitter = state.entityLit ? 0.05 : 0.11;
  for (let i = 0; i < pos.count; i++) {
    pos.array[i * 3] = base[i * 3] + rand(-jitter, jitter);
    pos.array[i * 3 + 1] = base[i * 3 + 1] + rand(-jitter, jitter);
    pos.array[i * 3 + 2] = base[i * 3 + 2] + rand(-jitter, jitter);
  }
  pos.needsUpdate = true;
  entityParts.auraMat.opacity = 0.3 + Math.sin(t * 4) * 0.12 + (state.entityLit ? 0.2 : 0);

  // passos da entidade
  state.entityStepTimer = (state.entityStepTimer || 0) - dt;
  if ((moveX !== 0 || moveZ !== 0) && state.entityStepTimer <= 0 && dist < 22) {
    state.entityStepTimer = 0.46;
    AudioEngine.footstep(false);
  }
}

/* ============================================================
   6. JOGADOR, INTERAÇÃO E INTERFACE
   ============================================================ */

function setupControls() {
  controls = new PointerLockControls(camera, dom.canvas);
  controls.pointerSpeed = 0.82;

  document.addEventListener('pointerlockchange', () => {
    const locked = document.pointerLockElement === dom.canvas;
    if (locked) state.fallbackLook = false;
    else if (state.phase === 'playing') pauseRun();
  });
  document.addEventListener('pointerlockerror', () => {
    if (state.phase === 'playing') enableFallbackLook();
  });

  // olhar com o mouse mesmo sem Pointer Lock (pré-visualizações em iframe
  // e navegadores que bloqueiam a captura do cursor)
  document.addEventListener('mousemove', (e) => {
    if (state.phase !== 'playing' || !state.fallbackLook) return;
    if (document.pointerLockElement) return;
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.setFromQuaternion(camera.quaternion);
    euler.y -= (e.movementX || 0) * 0.0024;
    euler.x -= (e.movementY || 0) * 0.0024;
    euler.x = clamp(euler.x, -1.35, 1.35);
    euler.z = 0;
    camera.quaternion.setFromEuler(euler);
  });

  dom.canvas.addEventListener('mousedown', (e) => {
    if (state.phase !== 'playing') return;
    if (!controls.isLocked) {
      if (state.fallbackLook) {
        if (e.button === 0) interact();
      } else {
        lockPointer();
      }
      return;
    }
    if (e.button === 0) interact();
  });
}

function enableFallbackLook() {
  if (state.fallbackLook) return;
  state.fallbackLook = true;
  showSubtitle('Mouse livre ativado. Mova o mouse para olhar; [E] ou clique para interagir.', 7);
  // lembrete depois da introdução, para quem entra por um iframe sem Pointer Lock
  schedule(() => {
    if (state.phase === 'playing' && state.fallbackLook) {
      showSubtitle('Mouse livre ativo: mova o cursor para olhar · [E] ou clique para interagir.', 7);
    }
  }, 9000);
}

function lockPointer() {
  try {
    controls.lock();
  } catch {
    enableFallbackLook();
    return;
  }
  schedule(() => {
    if (state.phase !== 'playing' || controls.isLocked) return;
    // Sem captura do mouse (iframe / política do navegador): jogo continua jogável.
    enableFallbackLook();
  }, 650);
}

function collidesAt(x, z) {
  const r = PLAYER_RADIUS;
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    const cx = clamp(x, c.minX, c.maxX);
    const cz = clamp(z, c.minZ, c.maxZ);
    const dx = x - cx;
    const dz = z - cz;
    if (dx * dx + dz * dz < r * r) return true;
  }
  return false;
}

function updatePlayer(dt) {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  if (forward.lengthSq() < 0.0001) forward.set(0, 0, -1);
  forward.normalize();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

  const wish = new THREE.Vector3();
  if (keys.w) wish.add(forward);
  if (keys.s) wish.sub(forward);
  if (keys.d) wish.add(right);
  if (keys.a) wish.sub(right);
  if (wish.lengthSq() > 0) wish.normalize();

  const speed = keys.shift ? 4.55 : 2.85;
  const targetVel = wish.multiplyScalar(speed);
  const accel = 1 - Math.exp(-12 * dt);
  cameraVel.lerp(targetVel, accel);
  if (cameraVel.lengthSq() < 0.0002) cameraVel.set(0, 0, 0);

  const nextX = camera.position.x + cameraVel.x * dt;
  const nextZ = camera.position.z + cameraVel.z * dt;
  if (!collidesAt(nextX, camera.position.z)) camera.position.x = clamp(nextX, -15.6, 15.6);
  if (!collidesAt(camera.position.x, nextZ)) camera.position.z = clamp(nextZ, -11.6, 9.6);

  const sp = cameraVel.length();
  const bobAmt = clamp(sp / speed, 0, 1);
  state.bobPhase += dt * (7 + sp * 1.4);
  const bobY = Math.sin(state.bobPhase * 2) * 0.024 * bobAmt;
  const sway = Math.sin(state.bobPhase) * 0.02 * bobAmt;
  camera.position.y = EYE_HEIGHT + bobY + Math.sin(clock.elapsedTime * 1.1) * 0.004;
  camera.rotation.z = Math.sin(state.bobPhase) * 0.0055 * bobAmt;

  // balanço da lanterna
  if (torchGroup) {
    torchGroup.position.x = 0.3 + sway;
    torchGroup.position.y = -0.28 + Math.sin(state.bobPhase * 2) * 0.006 * bobAmt;
    torchGroup.rotation.z = 0.1 + sway * 0.4;
  }

  // passos
  state.stepTimer -= dt;
  if (sp > 0.6 && state.stepTimer <= 0) {
    AudioEngine.footstep(keys.shift);
    state.stepTimer = keys.shift ? 0.32 : 0.5;
  }
}

function updateBattery(dt) {
  const on = state.flashlightOn && state.battery > 0;
  if (on) {
    let drain = 0.82;
    if (state.entityLit) drain += 2.2;
    if (keys.shift) drain += 0.12;
    state.battery = Math.max(0, state.battery - drain * dt);
    if (state.battery <= 0) {
      state.flashlightOn = false;
      AudioEngine.powerDown();
      showSubtitle('A lanterna apagou. A escuridão se inclina para você.', 5);
    }
  } else {
    state.battery = Math.min(100, state.battery + 5.4 * dt);
  }
}

function toggleFlashlight() {
  if (state.phase !== 'playing') return;
  if (state.battery <= 0) {
    AudioEngine.click();
    showSubtitle('A bateria está vazia. Deixe a lanterna desligada para recarregar.', 4.5);
    return;
  }
  if (!state.flashlightOn && state.battery < 4) {
    AudioEngine.click();
    showSubtitle('Energia insuficiente. Aguarde alguns segundos.', 3.5);
    return;
  }
  state.flashlightOn = !state.flashlightOn;
  AudioEngine.click();
  updateHUD(true);
}

function findInteractable() {
  const best = { score: -Infinity, item: null };
  const camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);
  for (const item of interactables) {
    if (item.kind === 'record' && item.record.collected) continue;
    const v = item.position.clone().sub(camera.position);
    const dist = v.length();
    if (dist > item.range) continue;
    const dot = v.normalize().dot(camDir);
    if (dist > 1.25 && dot < 0.5) continue;
    const score = dot - dist * 0.08 + (item.kind === 'record' ? 0.22 : 0);
    if (score > best.score) {
      best.score = score;
      best.item = item;
    }
  }
  return best.item;
}

function updateInteraction() {
  const target = findInteractable();
  state.target = target;
  const label = target ? target.label : null;
  if (label !== state.lastPrompt) {
    state.lastPrompt = label;
    if (target) {
      dom.promptText.textContent = label;
      dom.prompt.classList.remove('hidden');
      dom.crosshair.classList.add('active');
    } else {
      dom.prompt.classList.add('hidden');
      dom.crosshair.classList.remove('active');
    }
  }
}

function hideInteractionPrompt() {
  state.target = null;
  state.lastPrompt = null;
  dom.prompt.classList.add('hidden');
  dom.crosshair.classList.remove('active');
}

function stopPlayerInput() {
  keys.w = keys.a = keys.s = keys.d = keys.shift = false;
  cameraVel.set(0, 0, 0);
  if (state.stepTimer > 0) state.stepTimer = 0;
}

function interact() {
  if (state.phase !== 'playing') return;
  const target = findInteractable();
  if (!target) return;
  if (target.kind === 'record') {
    readRecord(target.record);
  } else if (target.kind === 'keypad' || target.kind === 'door') {
    openKeypad();
  } else if (target.kind === 'flavor') {
    AudioEngine.click();
    showSubtitle(target.text, 6);
  }
}

/* ---------- HUD ---------- */

const hudCache = { records: -1, battery: -1, flash: null };

function updateHUD(force = false) {
  const pct = clamp(Math.round(state.battery), 0, 100);
  if (force || pct !== hudCache.battery) {
    hudCache.battery = pct;
    dom.batteryFill.style.width = `${pct}%`;
    dom.batteryPct.textContent = `${pct}%`;
    dom.batteryFill.classList.toggle('warn', pct <= 45 && pct > 18);
    dom.batteryFill.classList.toggle('crit', pct <= 18);
  }
  const on = state.flashlightOn && state.battery > 0;
  if (force || on !== hudCache.flash) {
    hudCache.flash = on;
    dom.flashlightState.textContent = on ? 'LIGADA' : 'DESLIGADA';
    dom.flashlightState.style.color = on ? '' : 'var(--red-bright)';
  }
  if (force || state.recordsFound !== hudCache.records) {
    hudCache.records = state.recordsFound;
    dom.recordsCount.textContent = state.recordsFound;
  }
}

function updatePips() {
  const pips = dom.recordPips.querySelectorAll('i');
  pips.forEach((pip) => {
    const idx = Number(pip.dataset.pip);
    const rec = recordObjects.find((r) => r.def.id === idx);
    pip.classList.toggle('found', !!(rec && rec.collected));
  });
}

/* ---------- legendas ---------- */

let subtitleTimer = 0;

function showSubtitle(text, duration = 4.5, whisper = false) {
  dom.subtitle.textContent = text;
  dom.subtitle.classList.toggle('whisper', whisper);
  dom.subtitle.classList.add('visible');
  subtitleTimer = duration;
}

function updateSubtitle(dt) {
  if (subtitleTimer > 0) {
    subtitleTimer -= dt;
    if (subtitleTimer <= 0) dom.subtitle.classList.remove('visible');
  }
}

/* ---------- leitor ---------- */

let typing = false;
let typeTimer = null;
let typeFull = '';
let typeIndex = 0;

function startTypewriter(text) {
  stopTypewriter();
  dom.readerBody.textContent = '';
  dom.readerBody.classList.remove('complete');
  dom.readerSkip.classList.remove('hidden');
  typeFull = text;
  typeIndex = 0;
  typing = true;
  typeTimer = window.setInterval(() => {
    typeIndex = Math.min(typeFull.length, typeIndex + 3);
    dom.readerBody.textContent = typeFull.slice(0, typeIndex);
    if (typeIndex >= typeFull.length) finishTypewriter();
  }, 14);
}

function stopTypewriter() {
  if (typeTimer !== null) {
    window.clearInterval(typeTimer);
    typeTimer = null;
  }
  typing = false;
}

function finishTypewriter() {
  if (!typing) return;
  stopTypewriter();
  dom.readerBody.textContent = typeFull;
  dom.readerBody.classList.add('complete');
  dom.readerSkip.classList.add('hidden');
}

function readRecord(runtime) {
  if (!runtime || runtime.collected || state.phase !== 'playing') return;
  runtime.collected = true;
  state.recordsFound += 1;
  state.currentRecord = runtime;
  runtime.group.visible = false;
  runtime.glow.visible = false;
  hideInteractionPrompt();
  stopPlayerInput();

  state.phase = 'reading';
  controls.unlock();
  AudioEngine.tape();
  AudioEngine.setPaused(true);

  const def = runtime.def;
  dom.readerKicker.textContent = `${def.label} · ESTAÇÃO BOREAL-7 · ${def.room.toUpperCase()}`;
  dom.readerTitle.textContent = def.title;
  dom.readerAuthor.textContent = def.author;
  dom.readerDate.textContent = def.date;
  dom.readerDigit.textContent = def.digit;
  startTypewriter(def.body);

  dom.reader.classList.remove('hidden');
  dom.hud.classList.add('fade-out');
  updateHUD(true);
  updatePips();
}

function closeReader() {
  if (state.phase !== 'reading') return;
  finishTypewriter();
  dom.reader.classList.add('hidden');
  dom.hud.classList.remove('fade-out');
  state.phase = 'playing';
  AudioEngine.setPaused(false);
  lockPointer();
  const rec = state.currentRecord;
  if (rec) {
    showSubtitle(`${rec.def.label} recuperado · dígito ${rec.def.digit} de 4`, 4);
  }
  if (!state.entityActive) {
    activateEntity();
  } else {
    surgeEntity();
  }
  state.graceTimer = Math.max(state.graceTimer, 3.5);
}

/* ---------- keypad ---------- */

function openKeypad() {
  if (state.phase !== 'playing') return;
  state.phase = 'keypad';
  state.entry = '';
  controls.unlock();
  hideInteractionPrompt();
  stopPlayerInput();
  renderKeypad();
  setKeypadStatus('AGUARDANDO ENTRADA', '');
  dom.keypadDisplay.classList.remove('error', 'shake');
  dom.keypad.classList.remove('hidden');
  dom.hud.classList.add('fade-out');
  AudioEngine.setPaused(true);
  AudioEngine.click();
}

function setKeypadStatus(text, cls) {
  dom.keypadStatus.textContent = text;
  dom.keypadStatus.className = 'keypad-status';
  if (cls) dom.keypadStatus.classList.add(cls);
}

function renderKeypad() {
  const slots = dom.keypadDisplay.querySelectorAll('.slot');
  slots.forEach((slot, i) => {
    const ch = state.entry[i];
    slot.textContent = ch || '·';
    slot.classList.toggle('filled', !!ch);
  });
  const frags = recordObjects
    .map((r) => (r.collected ? `${r.def.id} · ${r.def.digit}` : `${r.def.id} · ?`))
    .join('    ');
  dom.keypadHint.textContent = `Fragmentos recuperados: ${frags}`;
}

function pressDigit(digit) {
  if (state.phase !== 'keypad') return;
  if (!/^[0-9]$/.test(digit)) return;
  if (state.entry.length >= CODE.length) return;
  state.entry += digit;
  dom.keypadDisplay.classList.remove('error');
  AudioEngine.click();
  renderKeypad();
}

function clearEntry() {
  if (state.phase !== 'keypad') return;
  state.entry = '';
  dom.keypadDisplay.classList.remove('error');
  setKeypadStatus('ENTRADA APAGADA', '');
  AudioEngine.click();
  renderKeypad();
}

function confirmEntry() {
  if (state.phase !== 'keypad') return;
  if (state.entry.length < CODE.length) {
    setKeypadStatus('DIGITE OS 4 DÍGITOS', 'error');
    AudioEngine.error();
    return;
  }
  if (state.entry === CODE) {
    setKeypadStatus('ACESSO CONCEDIDO · ABRINDO', 'ok');
    AudioEngine.success();
    win();
    return;
  }
  state.codeAttempts += 1;
  state.entry = '';
  dom.keypadDisplay.classList.add('error');
  dom.keypadDisplay.classList.remove('shake');
  void dom.keypadDisplay.offsetWidth;
  dom.keypadDisplay.classList.add('shake');
  setKeypadStatus('CÓDIGO INCORRETO · O SINAL OUVIU', 'error');
  AudioEngine.error();
  renderKeypad();
  schedule(() => {
    if (state.phase === 'keypad') {
      dom.keypadDisplay.classList.remove('error', 'shake');
      setKeypadStatus('AGUARDANDO ENTRADA', '');
    }
  }, 1600);
  // o erro atrai a entidade
  surgeEntity();
}

function closeKeypad() {
  if (state.phase !== 'keypad') return;
  dom.keypad.classList.add('hidden');
  dom.hud.classList.remove('fade-out');
  state.phase = 'playing';
  AudioEngine.setPaused(false);
  lockPointer();
}

/* ---------- arquivo ---------- */

function openArchive(fromPhase) {
  if (!(state.phase === 'playing' || state.phase === 'paused')) return;
  state.archiveFrom = fromPhase;
  state.phase = 'archive';
  stopPlayerInput();
  if (state.archiveFrom === 'playing') controls.unlock();
  dom.pauseScreen.classList.add('hidden');
  dom.endingScreen.classList.add('hidden');
  dom.gameoverScreen.classList.add('hidden');
  dom.hud.classList.add('fade-out');
  renderArchive();
  dom.archive.classList.remove('hidden');
  AudioEngine.setPaused(true);
  AudioEngine.click();
}

function renderArchive() {
  dom.archiveCount.textContent = state.recordsFound;
  dom.archiveList.innerHTML = '';
  if (state.recordsFound === 0) {
    const empty = document.createElement('div');
    empty.className = 'archive-empty';
    empty.textContent =
      'Nenhum registro recuperado. Explore as salas do subsolo — os registros estão sobre mesas, beliches e caixas. Cada um guarda um dígito do código de evacuação.';
    dom.archiveList.appendChild(empty);
  }
  recordObjects.forEach((runtime) => {
    const def = runtime.def;
    const row = document.createElement('div');
    row.className = `archive-item ${runtime.collected ? 'found' : ''}`;
    const num = document.createElement('span');
    num.className = 'arch-num';
    num.textContent = String(def.id).padStart(2, '0');
    const info = document.createElement('div');
    const title = document.createElement('span');
    title.className = 'arch-title';
    title.textContent = runtime.collected ? `${def.kind} · ${def.title}` : 'REGISTRO NÃO RECUPERADO';
    const meta = document.createElement('span');
    meta.className = 'arch-meta';
    meta.textContent = runtime.collected ? `${def.room} · ${def.author}` : `Último local conhecido: ${def.room}`;
    info.appendChild(title);
    info.appendChild(meta);
    const digit = document.createElement('span');
    digit.className = 'arch-digit';
    digit.textContent = runtime.collected ? def.digit : '?';
    row.appendChild(num);
    row.appendChild(info);
    row.appendChild(digit);
    dom.archiveList.appendChild(row);
  });

  const cells = dom.archiveCode.querySelectorAll('i');
  cells.forEach((cell, i) => {
    const runtime = recordObjects[i];
    const known = !!(runtime && runtime.collected);
    cell.textContent = known ? runtime.def.digit : '?';
    cell.classList.toggle('known', known);
  });
}

function closeArchive() {
  if (state.phase !== 'archive') return;
  dom.archive.classList.add('hidden');
  if (state.archiveFrom === 'paused') {
    state.phase = 'paused';
    dom.pauseScreen.classList.remove('hidden');
    return;
  }
  state.phase = 'playing';
  dom.hud.classList.remove('fade-out');
  AudioEngine.setPaused(false);
  lockPointer();
}

/* ---------- pausa ---------- */

function pauseRun() {
  if (state.phase !== 'playing') return;
  state.phase = 'paused';
  state.pausedAt = performance.now();
  hideInteractionPrompt();
  stopPlayerInput();
  dom.pauseScreen.classList.remove('hidden');
  dom.hud.classList.add('fade-out');
  AudioEngine.setPaused(true);
  schedule(() => dom.resumeBtn.focus({ preventScroll: true }), 60);
}

function resumeRun() {
  if (state.phase !== 'paused') return;
  dom.pauseScreen.classList.add('hidden');
  dom.hud.classList.remove('fade-out');
  state.phase = 'playing';
  AudioEngine.setPaused(false);
  lockPointer();
}

/* ---------- morte ---------- */

function die() {
  if (state.phase !== 'playing') return;
  state.phase = 'dying';
  state.deathTimer = 1.7;
  state.deathBase.copy(camera.position);
  state.entityActive = true;
  entity.visible = true;
  hideInteractionPrompt();
  stopPlayerInput();

  // coloca a entidade entre a câmera e o olhar do jogador
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  dir.y = 0;
  if (dir.lengthSq() < 0.01) dir.set(0, 0, -1);
  dir.normalize();
  const target = camera.position.clone().addScaledVector(dir, 1.5);
  entity.position.set(target.x, 0, target.z);
  entity.rotation.y = Math.atan2(-dir.x, -dir.z);

  state.staticPulse = 1;
  dom.staticFx.style.opacity = '0.85';
  dom.damage.style.opacity = '1';
  dom.hud.classList.add('fade-out');
  AudioEngine.death();
  AudioEngine.setTension(1);
  controls.unlock();
}

function updateDying(dt, t) {
  state.deathTimer -= dt;
  const k = clamp(1 - state.deathTimer / 1.7, 0, 1);
  camera.position.set(
    state.deathBase.x + rand(-0.03, 0.03) * (0.4 + k),
    state.deathBase.y + rand(-0.025, 0.025) * (0.4 + k),
    state.deathBase.z + rand(-0.03, 0.03) * (0.4 + k)
  );
  camera.rotation.z = Math.sin(t * 42) * 0.02 * (0.4 + k);
  if (entity) {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    if (dir.lengthSq() > 0.001) dir.normalize();
    const target = camera.position.clone().addScaledVector(dir, 0.95 - k * 0.25);
    entity.position.x = lerp(entity.position.x, target.x, 1 - Math.exp(-4 * dt));
    entity.position.z = lerp(entity.position.z, target.z, 1 - Math.exp(-4 * dt));
    entity.rotation.y = Math.atan2(camera.position.x - entity.position.x, camera.position.z - entity.position.z);
    entity.scale.setScalar(1 + k * 0.18);
  }
  dom.staticFx.style.opacity = String(0.5 + Math.random() * 0.45);
  if (state.deathTimer <= 0) showGameOver();
}

function showGameOver() {
  if (state.phase === 'gameover') return;
  state.phase = 'gameover';
  dom.damage.style.opacity = '0.5';
  dom.staticFx.style.opacity = '0.14';
  dom.hud.classList.add('hidden');
  dom.gameoverRecords.textContent = `${state.recordsFound}/4`;
  dom.gameoverCode.textContent = recordObjects.map((r) => (r.collected ? r.def.digit : '?')).join('');
  dom.gameoverTime.textContent = formatTime(performance.now() - state.runStart);
  dom.gameoverScreen.classList.remove('hidden');
  schedule(() => dom.retryBtn.focus({ preventScroll: true }), 80);
  AudioEngine.setTension(0.16);
  AudioEngine.setPaused(true);
}

/* ---------- final ---------- */

function win() {
  if (state.phase === 'ending' || state.phase === 'gameover') return;
  state.phase = 'ending';
  state.endTime = performance.now();
  controls.unlock();
  hideInteractionPrompt();
  stopPlayerInput();
  dom.keypad.classList.add('hidden');
  dom.hud.classList.add('fade-out');
  AudioEngine.setPaused(false);
  AudioEngine.setTension(0);
  if (exitLightMat) {
    exitLightMat.emissive.setHex(0x35ff8f);
    exitLightMat.color.setHex(0x073b1f);
  }
  if (exitDoorGlow) exitDoorGlow.visible = true;
  state.doorAnim = 0.0001;
  state.staticPulse = 0;
  showSubtitle('A fechadura cede. O ar frio vem de baixo da porta.', 6);
  setFade(1, 2600);
  schedule(() => showEndingScreen(), 2150);
}

function showEndingScreen() {
  dom.endingCode.textContent = CODE;
  if (dom.endingRecords) dom.endingRecords.textContent = `${state.recordsFound}/4`;
  dom.endingTime.textContent = formatTime((state.endTime || performance.now()) - state.runStart);
  dom.endingScreen.classList.remove('hidden');
  schedule(() => dom.endingRetryBtn.focus({ preventScroll: true }), 80);
  dom.hud.classList.add('hidden');
  dom.damage.style.opacity = '0';
  dom.staticFx.style.opacity = '0';
  setFade(0, 900);
}

/* ---------- HUD / fade ---------- */

function setFade(alpha, duration = 700) {
  dom.fade.style.transitionDuration = `${duration}ms`;
  dom.fade.style.opacity = String(alpha);
}

/* ---------- estado do jogo ---------- */

function resetRun() {
  clearScheduled();
  stopTypewriter();
  state.recordsFound = 0;
  state.battery = 100;
  state.flashlightOn = true;
  state.entry = '';
  state.currentRecord = null;
  state.entityActive = false;
  state.entitySeen = false;
  state.entityLit = false;
  state.entityDistance = 999;
  state.entityPath = [];
  state.entityGoal = null;
  state.pathTimer = 0;
  state.visionTimer = 0;
  state.graceTimer = 0;
  state.heartTimer = 0;
  state.whisperTimer = 24;
  state.ambientTimer = 16;
  state.staticLevel = 0;
  state.staticPulse = 0;
  state.powerFlicker = 0;
  state.bobPhase = 0;
  state.stepTimer = 0;
  state.runStart = performance.now();
  state.endTime = 0;
  state.deathTimer = 0;
  state.codeAttempts = 0;
  state.introDone = false;
  state.lastPrompt = null;
  state.tensionClock = 0;
  state.entityScreamTimer = 0;
  state.entityStepTimer = 0;

  camera.position.set(2, EYE_HEIGHT, 6.8);
  camera.rotation.set(0, Math.PI, 0, 'YXZ');
  camera.rotation.z = 0;
  stopPlayerInput();

  if (entity) {
    entity.visible = false;
    entity.scale.setScalar(1);
  }
  recordObjects.forEach((runtime) => {
    runtime.collected = false;
    runtime.group.visible = true;
    runtime.group.scale.setScalar(1);
    runtime.glow.visible = true;
  });
  if (exitLightMat) {
    exitLightMat.emissive.setHex(0xff2a14);
    exitLightMat.color.setHex(0x2a0603);
  }
  if (exitDoorMesh) exitDoorMesh.position.y = 1.14;
  if (exitDoorGlow) exitDoorGlow.visible = false;
  state.doorAnim = 0;

  hudCache.records = -1;
  hudCache.battery = -1;
  hudCache.flash = null;
  updateHUD(true);
  updatePips();

  dom.staticFx.style.opacity = '0';
  dom.damage.style.opacity = '0';
  dom.subtitle.classList.remove('visible', 'whisper');
  dom.crosshair.classList.remove('active');
  dom.prompt.classList.add('hidden');
  dom.keypadDisplay.classList.remove('error', 'shake');
  dom.keypadStatus.className = 'keypad-status';
  dom.keypadStatus.textContent = 'AGUARDANDO ENTRADA';
  dom.hud.classList.remove('fade-out');
  subtitleTimer = 0;
  setFade(0, 0);
}

function startRun() {
  AudioEngine.init();
  AudioEngine.resume();
  resetRun();
  dom.startScreen.classList.add('hidden');
  dom.pauseScreen.classList.add('hidden');
  dom.gameoverScreen.classList.add('hidden');
  dom.endingScreen.classList.add('hidden');
  dom.reader.classList.add('hidden');
  dom.keypad.classList.add('hidden');
  dom.archive.classList.add('hidden');
  dom.bootError.classList.add('hidden');
  dom.hud.classList.remove('hidden');
  dom.hudHelp.classList.remove('fade');
  state.phase = 'playing';
  AudioEngine.setPaused(false);
  setFade(1, 0);
  requestAnimationFrame(() => setFade(0, 1600));
  lockPointer();
  clock.getDelta();
  scheduleIntro();
  schedule(() => dom.hudHelp.classList.add('fade'), 24000);
}

function scheduleIntro() {
  schedule(() => {
    if (state.phase === 'playing') {
      showSubtitle('Você acorda no subsolo da Estação Boreal-7. A porta de emergência está trancada.', 5.5);
    }
  }, 1200);
  schedule(() => {
    if (state.phase === 'playing') {
      showSubtitle('Só a lanterna funciona. [F] apaga e recarrega a bateria — a escuridão não está vazia.', 6);
    }
  }, 7200);
  schedule(() => {
    if (state.phase === 'playing') {
      showSubtitle('Encontre os 4 registros da equipe. Cada um guarda um dígito do código de evacuação.', 6.5);
      state.introDone = true;
    }
  }, 13800);
}

function goToMenu() {
  clearScheduled();
  resetRun();
  state.phase = 'menu';
  dom.startScreen.classList.remove('hidden');
  schedule(() => dom.startBtn.focus({ preventScroll: true }), 80);
  dom.pauseScreen.classList.add('hidden');
  dom.gameoverScreen.classList.add('hidden');
  dom.endingScreen.classList.add('hidden');
  dom.reader.classList.add('hidden');
  dom.keypad.classList.add('hidden');
  dom.archive.classList.add('hidden');
  dom.hud.classList.add('hidden');
  setFade(0, 400);
  AudioEngine.setPaused(true);
  if (document.pointerLockElement) document.exitPointerLock();
}

/* ============================================================
   7. LOOP PRINCIPAL
   ============================================================ */

function updateFlashlight(t) {
  const on = state.flashlightOn && state.battery > 0;
  let flicker = 1;
  if (on) {
    if (state.battery < 22) {
      flicker = 0.5 + Math.random() * 0.5;
    }
    if (state.entityLit) {
      flicker *= Math.sin(t * 47) > 0 ? 1 : 0.4;
    }
    if (state.powerFlicker > 0) {
      flicker *= Math.random() < 0.2 ? 0.25 : 1;
    }
  }
  flashlight.intensity = on ? FLASHLIGHT_INTENSITY * flicker : 0;
  if (torchLensMat) torchLensMat.emissiveIntensity = on ? 0.7 + flicker * 1.1 : 0.02;
}

function updateLights(dt, t) {
  state.powerFlicker = Math.max(0, state.powerFlicker - dt);
  const globalFlicker = state.powerFlicker > 0 ? (Math.random() < 0.25 ? 0.15 : 1) : 1;
  for (const e of emergencyLights) {
    const pulse = 0.55 + 0.45 * Math.sin(t * 1.9 + e.phase);
    let flick = 1;
    const noise = Math.sin(t * 17 + e.phase * 5);
    if (noise > 0.965) flick = 0.15;
    if (e.fluorescent) flick *= Math.random() < 0.06 ? 0.1 : 1;
    const intensity = e.base * pulse * flick * globalFlicker;
    e.light.intensity = intensity;
    if (e.bulbMat) {
      e.bulbMat.emissiveIntensity = 0.6 + pulse * 1.6 * flick * globalFlicker;
    }
    if (e.glowMat) e.glowMat.opacity = 0.1 + pulse * 0.26 * flick;
  }
}

function updateScreens(t, dt) {
  for (const s of screenEntries) {
    const flick = Math.sin(t * 7 + s.phase) > 0.992 ? 0.3 : 1;
    const base = s.base * (0.85 + Math.sin(t * 2.3 + s.phase) * 0.1);
    s.mat.color.setScalar(clamp(base * flick, 0.15, 1));
  }
}

function updateRecords(t) {
  recordObjects.forEach((r) => {
    if (!r.group.visible) return;
    const blink = Math.sin(t * 3 + r.pulse) > 0.5 ? 1 : 0.12;
    if (r.ledMat) r.ledMat.color.setRGB(1, 0.45 * blink, 0.35 * blink);
    if (r.glow) r.glow.material.opacity = 0.14 + blink * 0.14;
  });
}

function updateDust(t) {
  dustGroup.rotation.y += 0.0004;
  dustGroup.position.y = Math.sin(t * 0.11) * 0.035;
}

function updateScreenFX(dt) {
  const active = state.entityActive && entity && entity.visible;
  const near = active ? clamp(1 - state.entityDistance / 16, 0, 1) : 0;
  let target = near * 0.32;
  if (state.entityLit) target += 0.18;
  if (state.entitySeen) target += 0.05;
  target += state.staticPulse * 0.4;
  if (!state.flashlightOn && state.phase === 'playing') target += 0.04;
  target = clamp(target, 0, 0.72);
  state.staticLevel = state.staticPulse > 0.02
    ? target
    : lerp(state.staticLevel, target, 1 - Math.exp(-3.5 * dt));
  state.staticPulse = Math.max(0, state.staticPulse - dt * 1.6);
  dom.staticFx.style.opacity = state.staticLevel.toFixed(3);
  dom.damage.style.opacity = near > 0.75 ? String((near - 0.75) * 0.9) : '0';

  state.tensionClock -= dt;
  if (state.tensionClock <= 0) {
    state.tensionClock = 0.18;
    AudioEngine.setTension(state.staticLevel * 0.9 + near * 0.25);
  }

  if (active && near > 0.25) {
    state.heartTimer -= dt;
    if (state.heartTimer <= 0) {
      AudioEngine.heartbeat(near);
      state.heartTimer = 1.5 - near * 0.95;
    }
    state.whisperTimer -= dt;
    if (state.whisperTimer <= 0) {
      state.whisperTimer = rand(14, 26);
      AudioEngine.whisper();
      if (state.phase === 'playing' && Math.random() < 0.55) {
        showSubtitle(pick(TAPE_WHISPERS), 3.2, true);
      }
    }
  }
}

function updateAmbient(dt) {
  state.ambientTimer -= dt;
  if (state.ambientTimer <= 0) {
    state.ambientTimer = rand(18, 34);
    AudioEngine.thud();
  }
  if (!state.entityActive && performance.now() - state.runStart > 165000) {
    activateEntity();
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  updateFlashlight(t);
  updateLights(dt, t);
  updateScreens(t, dt);
  updateRecords(t);
  updateDust(t);

  if (state.phase === 'playing') {
    updatePlayer(dt);
    updateBattery(dt);
    updateEntity(dt, t);
    updateInteraction();
    updateSubtitle(dt);
    updateScreenFX(dt);
    updateHUD();
    updateAmbient(dt);
  } else if (state.phase === 'dying') {
    updateDying(dt, t);
  } else if (state.phase === 'reading') {
    // congelado
  } else if (state.phase === 'ending') {
    if (state.doorAnim > 0 && exitDoorMesh) {
      state.doorAnim += dt;
      const p = clamp(state.doorAnim / 1.7, 0, 1);
      const ease = p * p * (3 - 2 * p);
      exitDoorMesh.position.y = 1.14 + ease * 2.35;
    }
  }

  if (entity && entity.visible && state.phase !== 'dying') {
    // aura continua viva mesmo com o jogo pausado
    const pos = entityParts.auraGeo.attributes.position;
    const base = entityParts.basePositions;
    for (let i = 0; i < pos.count; i += 3) {
      pos.array[i * 3] = base[i * 3] + Math.sin(t * 9 + i) * 0.05;
      pos.array[i * 3 + 1] = base[i * 3 + 1] + Math.cos(t * 7 + i) * 0.05;
      pos.array[i * 3 + 2] = base[i * 3 + 2] + Math.sin(t * 8 + i * 2) * 0.05;
    }
    pos.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

function onResize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.55));
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function bindUI() {
  dom.startBtn.addEventListener('click', startRun);

  dom.resumeBtn.addEventListener('click', resumeRun);
  dom.pauseArchiveBtn.addEventListener('click', () => openArchive('paused'));
  dom.pauseRestartBtn.addEventListener('click', startRun);
  dom.pauseMenuBtn.addEventListener('click', goToMenu);

  dom.retryBtn.addEventListener('click', startRun);
  dom.gameoverMenuBtn.addEventListener('click', goToMenu);

  dom.endingRetryBtn.addEventListener('click', () => {
    dom.endingScreen.classList.add('hidden');
    startRun();
  });
  dom.endingMenuBtn.addEventListener('click', goToMenu);

  dom.readerClose.addEventListener('click', closeReader);
  dom.reader.addEventListener('click', (e) => {
    if (e.target === dom.reader) closeReader();
    else if (typing) finishTypewriter();
  });

  dom.keypadGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    btn.blur();
    if (btn.dataset.digit !== undefined) pressDigit(btn.dataset.digit);
    else if (btn.dataset.action === 'clear') clearEntry();
    else if (btn.dataset.action === 'confirm') confirmEntry();
  });
  dom.keypadClose.addEventListener('click', closeKeypad);
  dom.archiveClose.addEventListener('click', closeArchive);

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', () => {
    keys.w = keys.a = keys.s = keys.d = keys.shift = false;
  });
  window.addEventListener('resize', onResize);
  window.addEventListener('beforeunload', () => {
    if (controls && controls.isLocked) controls.unlock();
  });
}

function onKeyDown(e) {
  const code = e.code;

  if (code === 'Tab') {
    if (state.phase === 'archive') {
      e.preventDefault();
      closeArchive();
    } else if (state.phase === 'playing') {
      e.preventDefault();
      openArchive('playing');
    }
    // nos menus, Tab continua navegando normalmente entre os botões
    return;
  }

  if (code === 'Escape') {
    if (state.phase === 'reading') {
      if (typing) finishTypewriter();
      else closeReader();
    } else if (state.phase === 'keypad') {
      closeKeypad();
    } else if (state.phase === 'archive') {
      closeArchive();
    } else if (state.phase === 'paused') {
      if (performance.now() - state.pausedAt > 350) resumeRun();
    } else if (state.phase === 'playing' && !controls.isLocked) {
      pauseRun();
    }
    return;
  }

  if (state.phase === 'keypad') {
    if (/^Digit[0-9]$/.test(code)) pressDigit(code.slice(5));
    else if (/^Numpad[0-9]$/.test(code)) pressDigit(code.slice(6));
    else if (code === 'Backspace') {
      e.preventDefault();
      state.entry = state.entry.slice(0, -1);
      AudioEngine.click();
      renderKeypad();
    } else if (code === 'Enter') {
      e.preventDefault();
      confirmEntry();
    }
    return;
  }

  if (state.phase === 'reading') {
    if (code === 'KeyE' || code === 'Space' || code === 'Enter') {
      e.preventDefault();
      if (typing) finishTypewriter();
      else closeReader();
    }
    return;
  }

  if (state.phase === 'playing') {
    if (code === 'KeyW') keys.w = true;
    if (code === 'KeyA') keys.a = true;
    if (code === 'KeyS') keys.s = true;
    if (code === 'KeyD') keys.d = true;
    if (code === 'ShiftLeft' || code === 'ShiftRight') keys.shift = true;
    if (code === 'KeyE') {
      e.preventDefault();
      interact();
    }
    if (code === 'KeyF') {
      e.preventDefault();
      toggleFlashlight();
    }
    if (code === 'Space') e.preventDefault();
  }
}

function onKeyUp(e) {
  const code = e.code;
  if (code === 'KeyW') keys.w = false;
  if (code === 'KeyA') keys.a = false;
  if (code === 'KeyS') keys.s = false;
  if (code === 'KeyD') keys.d = false;
  if (code === 'ShiftLeft' || code === 'ShiftRight') keys.shift = false;
}

function init() {
  setupRenderer();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04060a);
  scene.fog = new THREE.FogExp2(0x05070b, 0.057);
  scene.add(world);

  camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.08, 90);
  camera.rotation.order = 'YXZ';
  camera.position.set(2, EYE_HEIGHT, 6.8);
  camera.rotation.set(0, Math.PI, 0, 'YXZ');
  scene.add(camera);

  buildWorld();
  buildEntity();
  setupControls();
  bindUI();

  dom.bootLoading.classList.add('hidden');
  dom.startScreen.classList.remove('hidden');
  clock.start();
  requestAnimationFrame(animate);

  window.__borealBooted = true;
  console.info('[BOREAL-7] Estação online. Sinal: 33 pulsos/min.');
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({
    canvas: dom.canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.55));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if ('useLegacyLights' in renderer) {
    // mantém as intensidades previsíveis em qualquer versão do three r160
    renderer.useLegacyLights = true;
  }
}

init();
