(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const canvas = $('#game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const GROUND = 445;

  const ui = {
    menu: $('#menu'),
    story: $('#story'),
    ending: $('#ending'),
    paused: $('#paused'),
    storyNumber: $('#storyNumber'),
    storyTitle: $('#storyTitle'),
    storyText: $('#storyText'),
  };

  const input = {
    left: false,
    right: false,
    jump: false,
    action: false,
    dash: false,
  };

  const LEVELS = [
    {
      name: 'Vila de Taipa',
      subtitle: 'EASY - Caminho do Mandacaru',
      story: 'Ravi parte por uma vila sertaneja de casas de taipa e telhados de barro. Recolha cajus, tome um cafezinho e encontre a primeira nota da Sanfona Dourada.',
      difficulty: 'EASY',
      theme: 'village',
      width: 3500,
      sky: '#66cbd9',
      ground: '#c97836',
      platforms: [
        [330, 365, 150], [610, 310, 135], [875, 360, 175], [1190, 295, 145],
        [1480, 350, 170], [1770, 275, 145], [2070, 350, 180], [2400, 300, 150],
        [2700, 355, 180], [3010, 285, 165],
      ],
      movingPlatforms: [[1010, 250, 110, 100, 45], [2290, 235, 105, 0, 70]],
      coins: [[395,325],[675,270],[945,320],[1255,255],[1550,310],[1835,235],[2150,310],[2470,260],[2780,315],[3090,245],[3280,395]],
      coffees: [[800,395],[1960,395],[2915,395]],
      enemies: [[520,415,470,810],[1080,415,1050,1390],[1640,415,1610,1970],[2260,415,2250,2580],[2890,415,2880,3250]],
      pits: [[830,95],[2010,105],[2810,90]],
      hazards: [[1380,50],[2570,55]],
    },
    {
      name: 'Feira do Cordel',
      subtitle: 'MEDIUM - Bandeiras e Ritmo',
      story: 'A segunda nota cruzou a feira. Passe por barracas de frutas, folhetos de cordel, sanfonas e panelas de barro. Os toldos lançam Ravi para o alto.',
      difficulty: 'MEDIUM',
      theme: 'market',
      width: 3700,
      sky: '#71d3dc',
      ground: '#bd6f35',
      platforms: [
        [290,365,165,'bounce'],[570,300,145],[830,235,140],[1110,345,185,'bounce'],
        [1430,275,150],[1700,355,180],[2000,285,155,'bounce'],[2300,220,145],
        [2600,340,180],[2920,265,160,'bounce'],[3260,330,170],
      ],
      movingPlatforms: [[970,205,110,120,0],[1850,220,110,0,80],[2760,205,110,110,0]],
      coins: [[365,325],[640,260],[900,195],[1195,305],[1500,235],[1780,315],[2075,245],[2370,180],[2680,300],[3000,225],[3340,290],[3520,395]],
      coffees: [[760,395],[2180,395],[3170,395]],
      enemies: [[470,415,440,750],[1010,415,980,1360],[1530,415,1510,1880],[2190,415,2160,2490],[2770,415,2730,3110],[3370,415,3340,3600]],
      pits: [[790,120],[1880,110],[2510,100],[3220,90]],
      hazards: [[1360,55],[3120,60]],
    },
    {
      name: 'Chapada Diamantina',
      subtitle: 'HARD - Paredões do Vento',
      story: 'A terceira nota está entre paredões, grutas e quedas d’água inspiradas na Chapada Diamantina. Use dash, café e plataformas móveis para vencer o vento forte.',
      difficulty: 'HARD',
      theme: 'chapada',
      width: 3900,
      sky: '#5ebbd3',
      ground: '#99573a',
      wind: true,
      platforms: [
        [300,370,140],[570,295,130],[835,220,125],[1090,345,155],[1360,260,145],
        [1650,180,140],[1970,300,160],[2260,225,145],[2570,350,175],
        [2860,270,145],[3160,195,145],[3480,310,170],
      ],
      movingPlatforms: [[720,330,100,0,110],[1220,195,105,125,0],[1810,245,105,0,95],[2730,210,105,120,0],[3330,245,100,0,85]],
      coins: [[365,330],[635,255],[895,180],[1160,305],[1430,220],[1720,140],[2045,260],[2330,185],[2650,310],[2930,230],[3230,155],[3560,270],[3730,395]],
      coffees: [[1020,395],[2460,395],[3400,395]],
      enemies: [[450,415,420,760],[990,415,960,1280],[1510,415,1480,1840],[2130,415,2100,2430],[2790,415,2770,3070],[3360,415,3330,3700]],
      pits: [[770,125],[1850,125],[2490,115],[3090,120]],
      hazards: [[1300,65],[1900,55],[2710,65],[3710,55]],
    },
    {
      name: 'Cozinha do Arraiá',
      subtitle: 'BOSS - Cuscuz Paulista Encantado',
      story: 'Na cozinha do arraiá, um Cuscuz Paulista visitante da Festa das Receitas foi encantado pelo redemoinho. Enfrente azeitonas saltitantes, ondas de milho e liberte a última nota com o seu graveto.',
      difficulty: 'BOSS',
      theme: 'kitchen',
      width: 2200,
      sky: '#72547f',
      ground: '#85503a',
      boss: true,
      platforms: [[260,355,150],[530,290,140],[805,360,150],[1080,280,145],[1390,350,170],[1740,290,150]],
      movingPlatforms: [[680,220,105,100,0],[1240,220,105,0,75]],
      coins: [[330,315],[600,250],[875,320],[1150,240],[1470,310],[1810,250]],
      coffees: [[950,395],[1650,395]],
      enemies: [[410,415,380,690],[1170,415,1130,1430]],
      pits: [[720,90]],
      hazards: [[1500,55]],
    },
  ];

  let mode = 'menu';
  let levelIndex = 0;
  let level = null;
  let cameraX = 0;
  let elapsed = 0;
  let score = 0;
  let collected = 0;
  let coffeeCount = 0;
  let lives = 3;
  let notes = 0;
  let soundOn = true;
  let audioContext = null;
  let lastTime = performance.now();
  let shake = 0;

  let platforms = [];
  let coins = [];
  let coffees = [];
  let enemies = [];
  let hazards = [];
  let pits = [];
  let particles = [];
  let enemyProjectiles = [];
  let boss = null;

  const player = {
    x: 75, y: 350, w: 34, h: 54,
    vx: 0, vy: 0, facing: 1,
    grounded: false, invincible: 0,
    attackTimer: 0, attackCooldown: 0, attackHit: false,
    dashTimer: 0, dashCooldown: 0,
    coffeeTimer: 0,
  };

  function tone(frequency, duration = 0.07, type = 'square') {
    if (!soundOn) return;
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.045, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function showOverlay(target) {
    [ui.menu, ui.story, ui.ending].forEach((element) => element.classList.remove('show'));
    target?.classList.add('show');
  }

  function presentLevel(index) {
    levelIndex = index;
    level = LEVELS[index];
    mode = 'story';
    ui.storyNumber.textContent = `FASE ${index + 1} • ${level.subtitle}`;
    ui.storyTitle.textContent = level.name;
    ui.storyText.textContent = level.story;
    showOverlay(ui.story);
  }

  function loadLevel() {
    platforms = [
      ...level.platforms.map(([x, y, w, kind]) => ({ x, y, baseX: x, baseY: y, w, h: 22, kind, moving: false })),
      ...level.movingPlatforms.map(([x, y, w, rangeX, rangeY], index) => ({
        x, y, baseX: x, baseY: y, w, h: 20,
        rangeX, rangeY, phase: index * 1.7, moving: true,
      })),
    ];
    coins = level.coins.map(([x, y], index) => ({ x, y, got: false, phase: index * 0.6 }));
    coffees = level.coffees.map(([x, y], index) => ({ x, y, got: false, phase: index * 1.1 }));
    const speed = level.difficulty === 'EASY' ? 0.95 : level.difficulty === 'MEDIUM' ? 1.2 : 1.5;
    enemies = level.enemies.map(([x, y, min, max], index) => ({
      x, y, min, max, w: 38, h: 30,
      vx: (index % 2 ? 72 : -72) * speed,
      alive: true,
    }));
    hazards = level.hazards.map(([x, w]) => ({ x, y: GROUND - 18, w, h: 18 }));
    pits = level.pits.map(([x, w]) => ({ x, w }));
    particles = [];
    enemyProjectiles = [];
    boss = level.boss ? {
      x: 1770, y: GROUND - 108, w: 128, h: 108,
      vx: -115, vy: 0, grounded: true,
      hp: 16, maxHp: 16, flash: 0,
      throwCooldown: 1.4, jumpCooldown: 2.5,
      attackPhase: 0, active: false,
    } : null;

    Object.assign(player, {
      x: 75, y: 340, vx: 0, vy: 0, facing: 1,
      grounded: false, invincible: 0,
      attackTimer: 0, attackCooldown: 0, attackHit: false,
      dashTimer: 0, dashCooldown: 0, coffeeTimer: 0,
    });
    cameraX = 0;
    elapsed = 0;
    mode = 'playing';
    showOverlay(null);
    canvas.focus();
    tone(330);
    setTimeout(() => tone(494, 0.1), 80);
  }

  function restartJourney() {
    score = 0;
    collected = 0;
    coffeeCount = 0;
    lives = 3;
    notes = 0;
    presentLevel(0);
  }

  function completeLevel() {
    if (level.boss) {
      notes = 4;
      mode = 'ending';
      $('#endingText').textContent = `Ravi libertou o Cuscuz Paulista Encantado, recuperou as quatro notas e levou a música de volta ao arraiá. Pontuação final: ${score}.`;
      showOverlay(ui.ending);
      tone(659, 0.35);
      return;
    }
    notes++;
    score += 600;
    burst(player.x, player.y, '#ffc43b', 22);
    tone(659, 0.18);
    setTimeout(() => tone(784, 0.2), 150);
    presentLevel(levelIndex + 1);
  }

  function burst(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 240,
        vy: -Math.random() * 230 - 35,
        life: 0.65 + Math.random() * 0.55,
        color,
        size: 3 + Math.random() * 4,
      });
    }
  }

  function isOverPit(x, width = 1) {
    return pits.some((pit) => x + width > pit.x && x < pit.x + pit.w);
  }

  function hurt(fell = false) {
    if (player.invincible > 0 || mode !== 'playing') return;
    lives--;
    shake = 0.35;
    tone(130, 0.18, 'sawtooth');
    if (lives <= 0) {
      lives = 3;
      score = Math.max(0, score - 500);
      loadLevel();
      return;
    }
    player.x = Math.max(60, player.x - (fell ? 330 : 115));
    while (isOverPit(player.x, player.w)) player.x -= 60;
    player.y = 310;
    player.vx = 0;
    player.vy = -300;
    player.invincible = 1.5;
  }

  function startAttack() {
    if (player.attackCooldown > 0) return;
    player.attackTimer = 0.22;
    player.attackCooldown = 0.32;
    player.attackHit = false;
    tone(520, 0.07);
  }

  function startDash() {
    if (player.dashCooldown > 0) return;
    player.dashTimer = 0.19;
    player.dashCooldown = player.coffeeTimer > 0 ? 0.42 : 0.7;
    player.invincible = Math.max(player.invincible, 0.23);
    player.vx = player.facing * (player.coffeeTimer > 0 ? 680 : 590);
    player.vy = Math.min(player.vy, 20);
    burst(player.x + player.w / 2, player.y + player.h, '#74cde0', 13);
    tone(205, 0.07, 'sawtooth');
  }

  function attackBox() {
    return {
      x: player.facing > 0 ? player.x + player.w - 3 : player.x - 56,
      y: player.y + 7,
      w: 59,
      h: 42,
    };
  }

  function updateMovingPlatforms() {
    for (const platform of platforms) {
      if (!platform.moving) continue;
      const previousX = platform.x;
      const previousY = platform.y;
      platform.x = platform.baseX + Math.sin(elapsed * 1.25 + platform.phase) * platform.rangeX;
      platform.y = platform.baseY + Math.sin(elapsed * 1.4 + platform.phase) * platform.rangeY;
      platform.dx = platform.x - previousX;
      platform.dy = platform.y - previousY;
    }
  }

  function groundSurfaces() {
    const surfaces = [];
    let cursor = 0;
    const ordered = [...pits].sort((a, b) => a.x - b.x);
    for (const pit of ordered) {
      if (pit.x > cursor) surfaces.push({ x: cursor, y: GROUND, w: pit.x - cursor, h: H - GROUND });
      cursor = pit.x + pit.w;
    }
    if (cursor < level.width) surfaces.push({ x: cursor, y: GROUND, w: level.width - cursor, h: H - GROUND });
    return surfaces;
  }

  function updatePlayer(dt) {
    player.invincible = Math.max(0, player.invincible - dt);
    player.attackTimer = Math.max(0, player.attackTimer - dt);
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    player.dashTimer = Math.max(0, player.dashTimer - dt);
    player.dashCooldown = Math.max(0, player.dashCooldown - dt);
    player.coffeeTimer = Math.max(0, player.coffeeTimer - dt);

    if (input.dash) startDash();
    if (input.action) startAttack();
    input.dash = false;
    input.action = false;

    const dashing = player.dashTimer > 0;
    const boosted = player.coffeeTimer > 0;
    const maxSpeed = boosted ? 350 : 275;
    const acceleration = boosted ? 1750 : 1450;

    if (input.left && !dashing) { player.vx -= acceleration * dt; player.facing = -1; }
    if (input.right && !dashing) { player.vx += acceleration * dt; player.facing = 1; }
    if (!input.left && !input.right && !dashing) player.vx *= Math.pow(0.001, dt);
    if (!dashing) player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));

    if (input.jump && player.grounded && !dashing) {
      player.vy = boosted ? -690 : -625;
      player.grounded = false;
      tone(420);
    }
    input.jump = false;

    if (level.wind && !dashing) {
      const gust = Math.sin(elapsed * 1.8) > 0.32 ? 120 : -28;
      player.vx += gust * dt;
    }

    player.vy += (dashing ? 760 : 1580) * dt;
    player.x += player.vx * dt;
    player.x = Math.max(4, Math.min(level.width - player.w, player.x));
    const oldBottom = player.y + player.h;
    player.y += player.vy * dt;
    player.grounded = false;

    const surfaces = [...groundSurfaces(), ...platforms];
    for (const surface of surfaces) {
      if (
        player.vy >= 0 && oldBottom <= surface.y + 10 &&
        player.y + player.h >= surface.y &&
        player.x + player.w > surface.x && player.x < surface.x + surface.w
      ) {
        player.y = surface.y - player.h;
        if (surface.kind === 'bounce') {
          player.vy = boosted ? -820 : -760;
          tone(590, 0.07);
        } else {
          player.vy = 0;
          player.grounded = true;
          if (surface.moving) {
            player.x += surface.dx || 0;
            player.y += surface.dy || 0;
          }
        }
      }
    }

    if (player.y > H + 70) hurt(true);
    for (const hazard of hazards) if (overlaps(player, hazard)) hurt();

    if (player.grounded && Math.abs(player.vx) > 95 && Math.random() < 0.17) {
      particles.push({ x: player.x + player.w / 2, y: player.y + player.h - 2, vx: -player.facing * 35, vy: -32, life: 0.35, color: '#efb86b', size: 5 });
    }
  }

  function updateCollectibles() {
    for (const coin of coins) {
      if (!coin.got && overlaps(player, { x: coin.x - 11, y: coin.y - 13, w: 22, h: 26 })) {
        coin.got = true;
        collected++;
        score += 100;
        tone(790, 0.055);
        burst(coin.x, coin.y, '#ffc43b');
      }
    }
    for (const coffee of coffees) {
      if (!coffee.got && overlaps(player, { x: coffee.x - 13, y: coffee.y - 16, w: 28, h: 30 })) {
        coffee.got = true;
        coffeeCount++;
        player.coffeeTimer = 7;
        score += 180;
        tone(630, 0.08);
        setTimeout(() => tone(820, 0.09), 80);
        burst(coffee.x, coffee.y, '#f4dfb1', 16);
      }
    }
  }

  function defeatEnemy(enemy) {
    enemy.alive = false;
    score += 190;
    tone(180, 0.08);
    burst(enemy.x, enemy.y, '#e66031', 13);
  }

  function updateEnemies(dt) {
    const strike = player.attackTimer > 0 ? attackBox() : null;
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      enemy.x += enemy.vx * dt;
      if (enemy.x < enemy.min || enemy.x + enemy.w > enemy.max) enemy.vx *= -1;
      if (strike && !player.attackHit && overlaps(strike, enemy)) {
        player.attackHit = true;
        defeatEnemy(enemy);
      } else if (overlaps(player, enemy)) {
        if (player.dashTimer > 0 || (player.vy > 120 && player.y + player.h < enemy.y + 20)) {
          if (player.dashTimer <= 0) player.vy = -390;
          defeatEnemy(enemy);
        } else {
          hurt();
        }
      }
    }
  }

  function updateBoss(dt) {
    if (!boss) return;
    if (!boss.active) {
      if (player.x < 1240) return;
      boss.active = true;
      shake = 0.22;
      tone(145, 0.18, 'sawtooth');
    }
    boss.flash = Math.max(0, boss.flash - dt);
    boss.attackPhase = 1 - boss.hp / boss.maxHp;
    boss.throwCooldown -= dt;
    boss.jumpCooldown -= dt;

    if (boss.grounded) {
      boss.x += boss.vx * dt * (1 + boss.attackPhase * 0.55);
      if (boss.x < 1350 || boss.x + boss.w > 2110) boss.vx *= -1;
      if (boss.jumpCooldown <= 0) {
        boss.vy = -560 - boss.attackPhase * 110;
        boss.grounded = false;
        boss.jumpCooldown = Math.max(1.45, 2.6 - boss.attackPhase);
      }
    } else {
      boss.x += boss.vx * 0.55 * dt;
      boss.vy += 1250 * dt;
      boss.y += boss.vy * dt;
      if (boss.y + boss.h >= GROUND) {
        boss.y = GROUND - boss.h;
        boss.vy = 0;
        boss.grounded = true;
        shake = 0.28;
        for (const direction of [-1, 1]) {
          enemyProjectiles.push({ x: boss.x + boss.w / 2, y: GROUND - 20, w: 28, h: 16, vx: direction * (250 + boss.attackPhase * 110), vy: 0, life: 3, kind: 'corn' });
        }
      }
    }

    if (boss.throwCooldown <= 0) {
      boss.throwCooldown = Math.max(0.55, 1.35 - boss.attackPhase * 0.65);
      const dx = player.x - boss.x;
      const dy = player.y - boss.y;
      const length = Math.hypot(dx, dy) || 1;
      enemyProjectiles.push({
        x: boss.x + boss.w / 2, y: boss.y + 35,
        w: 20, h: 20,
        vx: dx / length * (275 + boss.attackPhase * 80),
        vy: dy / length * (275 + boss.attackPhase * 80),
        life: 4, kind: 'olive',
      });
    }

    if (player.attackTimer > 0 && !player.attackHit && overlaps(attackBox(), boss)) {
      player.attackHit = true;
      boss.hp--;
      boss.flash = 0.18;
      score += 260;
      shake = 0.16;
      tone(220, 0.08);
      burst(boss.x + boss.w / 2, boss.y + 40, '#ffd24d', 15);
      if (boss.hp <= 0) {
        score += 1800;
        boss = null;
        enemyProjectiles = [];
        setTimeout(completeLevel, 750);
        return;
      }
    }

    if (overlaps(player, boss) && player.dashTimer <= 0) hurt();
  }

  function updateProjectiles(dt) {
    for (const projectile of enemyProjectiles) {
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.life -= dt;
      if (overlaps(player, projectile)) {
        projectile.life = 0;
        if (player.dashTimer <= 0) hurt();
      }
    }
    enemyProjectiles = enemyProjectiles.filter((p) => p.life > 0 && p.x > -100 && p.x < level.width + 100);
  }

  function updateParticles(dt) {
    for (const particle of particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 500 * dt;
      particle.life -= dt;
    }
    particles = particles.filter((particle) => particle.life > 0);
  }

  function update(dt) {
    if (mode !== 'playing') return;
    elapsed += dt;
    shake = Math.max(0, shake - dt);
    updateMovingPlatforms();
    updatePlayer(dt);
    updateCollectibles();
    updateEnemies(dt);
    updateBoss(dt);
    updateProjectiles(dt);
    updateParticles(dt);

    if (!level.boss && player.x > level.width - 145) completeLevel();
    cameraX += (player.x - W * 0.38 - cameraX) * Math.min(1, dt * 5);
    cameraX = Math.max(0, Math.min(level.width - W, cameraX));
  }

  function drawCloud(x, y, scale = 1) {
    rect(x, y + 16 * scale, 108 * scale, 23 * scale, '#fff1d1');
    rect(x + 18 * scale, y, 40 * scale, 26 * scale, '#fff1d1');
    rect(x + 58 * scale, y + 7 * scale, 35 * scale, 23 * scale, '#fff1d1');
  }

  function drawCactus(x, y) {
    rect(x + 12, y - 70, 18, 70, '#347c46');
    rect(x + 6, y - 78, 30, 13, '#479b53');
    rect(x - 8, y - 49, 21, 13, '#347c46');
    rect(x - 11, y - 63, 13, 28, '#347c46');
    rect(x + 29, y - 37, 22, 13, '#347c46');
    rect(x + 40, y - 51, 13, 27, '#347c46');
    rect(x + 16, y - 89, 10, 13, '#df4f69');
  }

  function drawTaipaHouse(x, y, color, roof) {
    rect(x, y, 128, GROUND - y, color);
    rect(x + 16, y + 30, 27, GROUND - y - 30, '#2f7186');
    rect(x + 78, y + 38, 31, GROUND - y - 38, '#7b402f');
    ctx.fillStyle = roof;
    ctx.beginPath();
    ctx.moveTo(x - 17, y + 4);
    ctx.lineTo(x + 63, y - 50);
    ctx.lineTo(x + 145, y + 4);
    ctx.fill();
    for (let tile = x - 6; tile < x + 130; tile += 22) rect(tile, y - 2, 18, 7, '#8b402e');
  }

  function drawCordelLine(offset, y) {
    rect(0, y, W, 3, '#543527');
    const colors = ['#e75c35', '#f4c23e', '#3e9a91', '#73538c'];
    for (let x = offset; x < W + 40; x += 48) {
      const color = colors[Math.abs(Math.floor((x + cameraX) / 48)) % colors.length];
      rect(x, y + 3, 31, 34, color);
      rect(x + 7, y + 11, 17, 3, '#fff0ce');
      rect(x + 10, y + 19, 11, 9, '#20384b');
    }
  }

  function drawMarketStall(x, y, color) {
    rect(x, y, 150, GROUND - y, '#d99b50');
    rect(x - 8, y - 18, 166, 23, color);
    for (let i = 0; i < 5; i++) rect(x - 8 + i * 33, y - 18, 16, 23, '#fff0d0');
    rect(x + 16, y + 25, 118, 10, '#75402d');
    for (let i = 0; i < 4; i++) rect(x + 25 + i * 28, y + 12, 14, 12, ['#d84e32','#f4bf3d','#4c944c'][i % 3]);
  }

  function drawChapadaRock(x, y, w, h) {
    rect(x, y - h, w, h, '#9b5b3e');
    rect(x + 9, y - h - 11, w - 18, 13, '#cf834b');
    rect(x + 16, y - h + 25, 15, h - 35, '#754334');
    rect(x + w - 30, y - h + 50, 12, h - 60, '#b97145');
  }

  function drawKitchenDecor() {
    for (let x = -(cameraX * 0.28 % 96); x < W; x += 96) {
      rect(x, 255, 94, 190, '#e9c277');
      rect(x + 46, 255, 3, 190, '#b0523d');
      for (let y = 270; y < 430; y += 48) rect(x, y, 94, 3, '#b0523d');
      rect(x + 17, 280, 16, 16, '#4b8c86');
      rect(x + 63, 328, 16, 16, '#d7523a');
    }
    rect(0, 405, W, 40, '#70412f');
  }

  function drawBackground() {
    rect(0, 0, W, H, level.sky);
    const sunset = level.theme === 'kitchen' ? '#ffd377' : '#ffd14b';
    rect(735 - cameraX * 0.04, 54, 74, 74, sunset);
    for (let i = 0; i < 7; i++) drawCloud(i * 390 - (cameraX * 0.16 % 2730) - 80, 72 + (i % 3) * 37, 0.9);

    for (let i = 0; i < 10; i++) {
      const x = i * 370 - (cameraX * 0.38 % 3700) - 110;
      ctx.fillStyle = level.theme === 'chapada' ? '#735e43' : level.theme === 'kitchen' ? '#4b486c' : '#568a49';
      ctx.beginPath();
      ctx.moveTo(x, GROUND);
      ctx.lineTo(x + 180, 230 + (i % 2) * 36);
      ctx.lineTo(x + 370, GROUND);
      ctx.fill();
    }

    if (level.theme === 'kitchen') drawKitchenDecor();
    drawLevelDecor();
    drawGround();
  }

  function drawLevelDecor() {
    if (level.theme === 'village') {
      for (let x = 170; x < level.width; x += 690) {
        drawTaipaHouse(x - cameraX, 342, x % 3 ? '#efb454' : '#7eb4a3', x % 2 ? '#c64f32' : '#d98535');
        drawCactus(x - cameraX + 155, GROUND);
        rect(x - cameraX + 250, GROUND - 42, 29, 42, '#a45d37');
        rect(x - cameraX + 244, GROUND - 47, 41, 9, '#d7934f');
      }
    } else if (level.theme === 'market') {
      drawCordelLine(-(cameraX * 0.08 % 48), 82);
      drawCordelLine(22 - (cameraX * 0.12 % 48), 137);
      const colors = ['#d95438','#edba3b','#438e91','#775287'];
      for (let x = 120; x < level.width; x += 410) drawMarketStall(x - cameraX, 352, colors[Math.floor(x / 410) % colors.length]);
    } else if (level.theme === 'chapada') {
      for (let x = 160; x < level.width; x += 520) {
        drawChapadaRock(x - cameraX, GROUND, 150, 120 + (Math.floor(x / 520) % 2) * 55);
        if (Math.floor(x / 520) % 3 === 1) {
          rect(x - cameraX + 150, 210, 18, 235, '#5ec7df');
          rect(x - cameraX + 168, 210, 7, 235, '#c4eff4');
        }
      }
    }
  }

  function drawGround() {
    rect(0, GROUND, W, H - GROUND, level.ground);
    rect(0, GROUND, W, 13, level.theme === 'kitchen' ? '#d19b58' : '#568d47');
    for (const pit of pits) {
      const x = pit.x - cameraX;
      rect(x, GROUND - 2, pit.w, H - GROUND + 2, '#263347');
      rect(x + 7, GROUND + 13, Math.max(0, pit.w - 14), 8, '#141e2d');
    }
    for (let x = -(cameraX % 52); x < W; x += 52) {
      rect(x, GROUND + 30, 18, 7, 'rgba(82,44,33,.28)');
      rect(x + 27, GROUND + 63, 13, 6, 'rgba(255,194,87,.26)');
    }
  }

  function drawPlatforms() {
    for (const platform of platforms) {
      const x = platform.x - cameraX;
      if (x > W || x + platform.w < 0) continue;
      const color = platform.kind === 'bounce' ? '#d74f3e' : platform.moving ? '#418b91' : '#855033';
      rect(x, platform.y, platform.w, platform.h, color);
      rect(x, platform.y, platform.w, 7, platform.kind === 'bounce' ? '#ffd248' : '#efb34c');
      for (let mark = x + 9; mark < x + platform.w; mark += 29) rect(mark, platform.y + 11, 11, 5, 'rgba(61,34,28,.45)');
      if (platform.moving) {
        rect(x + 8, platform.y + platform.h, 4, 12, '#4e392c');
        rect(x + platform.w - 12, platform.y + platform.h, 4, 12, '#4e392c');
      }
    }
  }

  function drawCoin(coin) {
    const x = coin.x - cameraX;
    const y = coin.y + Math.sin(elapsed * 5 + coin.phase) * 4;
    rect(x - 8, y - 12, 16, 24, '#df592d');
    rect(x - 12, y - 8, 24, 16, '#df592d');
    rect(x - 4, y - 9, 8, 18, '#ffc83d');
    rect(x + 1, y - 16, 4, 6, '#347b45');
    rect(x + 5, y - 17, 9, 4, '#52a051');
  }

  function drawCoffee(coffee) {
    const x = coffee.x - cameraX;
    const y = coffee.y + Math.sin(elapsed * 4 + coffee.phase) * 3;
    rect(x - 11, y - 17, 24, 24, '#fff0d0');
    rect(x - 8, y - 13, 18, 16, '#77422e');
    rect(x + 13, y - 12, 7, 12, '#fff0d0');
    rect(x + 15, y - 9, 5, 6, '#77422e');
    rect(x - 13, y + 7, 32, 5, '#d99a45');
    const steam = Math.sin(elapsed * 5 + coffee.phase) * 2;
    rect(x - 5 + steam, y - 28, 3, 8, 'rgba(255,245,218,.8)');
    rect(x + 5 - steam, y - 32, 3, 10, 'rgba(255,245,218,.65)');
  }

  function drawEnemy(enemy) {
    const x = enemy.x - cameraX;
    const y = enemy.y;
    rect(x + 5, y + 3, 28, 24, '#a95431');
    rect(x, y + 10, 38, 14, '#a95431');
    rect(x + 7, y, 9, 7, '#ee9941');
    rect(x + 23, y, 9, 7, '#ee9941');
    rect(x + 10, y + 9, 5, 5, '#fff3d0');
    rect(x + 25, y + 9, 5, 5, '#fff3d0');
    rect(x + 12, y + 11, 3, 3, '#142d49');
    rect(x + 25, y + 11, 3, 3, '#142d49');
    rect(x + 7, y + 26, 10, 4, '#63392b');
    rect(x + 23, y + 26, 10, 4, '#63392b');
  }

  function drawHazards() {
    for (const hazard of hazards) {
      const x = hazard.x - cameraX;
      for (let spike = 0; spike < hazard.w; spike += 14) {
        ctx.fillStyle = '#7a5a31';
        ctx.beginPath();
        ctx.moveTo(x + spike, GROUND);
        ctx.lineTo(x + spike + 7, GROUND - 18);
        ctx.lineTo(x + spike + 14, GROUND);
        ctx.fill();
      }
    }
  }

  function drawPlayer() {
    if (player.invincible > 0 && Math.floor(player.invincible * 12) % 2 === 0) return;
    const idle = player.grounded && Math.abs(player.vx) < 7 && player.dashTimer <= 0;
    const bob = 0;
    const hatLift = idle ? Math.round(Math.sin(elapsed * 3.2)) : 0;
    const x = player.x - cameraX;
    const y = player.y + bob;
    ctx.save();
    if (player.facing < 0) { ctx.translate(x + player.w, 0); ctx.scale(-1, 1); } else ctx.translate(x, 0);
    if (player.dashTimer > 0) {
      rect(-20, y + 16, 27, 6, 'rgba(105,207,225,.65)');
      rect(-32, y + 29, 38, 5, 'rgba(255,228,146,.48)');
    }
    if (idle) {
      rect(0, y + 39, 4, 4, 'rgba(255,243,208,.7)');
      rect(35, y + 31, 3, 3, 'rgba(255,207,74,.9)');
    }
    // Chapéu de palha.
    rect(3, y + hatLift, 27, 7, '#bd8439');
    rect(9, y - 7 + hatLift, 16, 9, '#dfa54e');
    rect(11, y - 1 + hatLift, 14, 3, '#8a4b2f');
    // Rosto e cabelo.
    rect(7, y + 7, 22, 19, '#9b593c');
    rect(24, y + 12, 7, 9, '#37261f');
    rect(12, y + 14, 4, 4, '#fff3d0');
    rect(14, y + 15, 3, 3, '#142d49');
    // Camisa de algodão, lenço e mochila.
    rect(4, y + 25, 27, 18, '#efe3bd');
    rect(3, y + 28, 6, 17, '#9b593c');
    rect(30, y + 29, 6, 14, '#9b593c');
    rect(4, y + 25, 27, 5, '#dc5732');
    rect(28, y + 25, 10, 18, '#7d9a49');
    rect(1, y + 31, 5, 5, '#f1b93d');
    // Calça azul e sandálias de couro alinhadas ao chão.
    rect(8, y + 43, 9, 8, '#25517c');
    rect(21, y + 43, 9, 8, '#25517c');
    rect(5, y + 49, 13, 5, '#66392d');
    rect(20, y + 49, 13, 5, '#66392d');
    // Graveto.
    if (player.attackTimer > 0) {
      const swing = 1 - player.attackTimer / 0.22;
      ctx.save();
      ctx.translate(31, y + 30);
      ctx.rotate(-1.15 + swing * 2.1);
      rect(0, -3, 53, 6, '#70422b');
      rect(46, -5, 9, 10, '#4f8e46');
      ctx.restore();
    } else {
      rect(32, y + 18, 4, 30, '#70422b');
      rect(29, y + 43, 10, 4, '#4f8e46');
    }
    ctx.restore();
  }

  function drawBoss() {
    if (!boss) return;
    const x = boss.x - cameraX;
    const y = boss.y;
    ctx.save();
    if (boss.flash > 0) ctx.globalAlpha = 0.45;
    // Prato e corpo amarelo do cuscuz paulista encantado.
    rect(x - 8, y + 91, 144, 15, '#e8e1c4');
    rect(x + 5, y + 35, 118, 62, '#edbd3d');
    rect(x + 14, y + 18, 100, 24, '#f5cf53');
    rect(x + 27, y + 7, 74, 17, '#f8da67');
    // Tomate, ervilha, ovo e azeitonas como detalhes visuais.
    rect(x + 17, y + 30, 23, 10, '#d84d34');
    rect(x + 82, y + 25, 25, 11, '#d84d34');
    rect(x + 50, y + 19, 20, 14, '#fff1ca');
    rect(x + 57, y + 22, 8, 8, '#f0b73d');
    rect(x + 33, y + 53, 10, 10, '#42834a');
    rect(x + 88, y + 60, 10, 10, '#42834a');
    // Rosto simpático de chefe encantado.
    rect(x + 42, y + 49, 11, 11, '#453026');
    rect(x + 77, y + 49, 11, 11, '#453026');
    rect(x + 45, y + 51, 4, 4, '#fff3d0');
    rect(x + 80, y + 51, 4, 4, '#fff3d0');
    rect(x + 54, y + 72, 25, 7, '#9c4b30');
    rect(x + 13, y + 94, 25, 11, '#70412e');
    rect(x + 93, y + 94, 25, 11, '#70412e');
    ctx.restore();

    rect(W / 2 - 190, 18, 380, 23, '#142d49');
    rect(W / 2 - 183, 25, 366 * (boss.hp / boss.maxHp), 10, '#e75c34');
    ctx.fillStyle = '#fff3d0';
    ctx.font = '900 12px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('CUSCUZ PAULISTA ENCANTADO', W / 2, 58);
    ctx.textAlign = 'left';
  }

  function drawEnemyProjectiles() {
    for (const projectile of enemyProjectiles) {
      const x = projectile.x - cameraX;
      if (projectile.kind === 'olive') {
        rect(x, projectile.y, 20, 20, '#3c4f2f');
        rect(x + 6, projectile.y + 5, 8, 8, '#8f9a49');
      } else {
        rect(x, projectile.y + 5, projectile.w, 11, '#f1c445');
        rect(x + 6, projectile.y, projectile.w - 12, 5, '#ffde68');
      }
    }
  }

  function drawExit() {
    if (level.boss) return;
    const x = level.width - 115 - cameraX;
    rect(x, 300, 9, 145, '#68402d');
    rect(x - 8, 290, 25, 15, '#efbb3c');
    rect(x + 12, 316, 40, 61, '#cb742d');
    rect(x + 18, 307, 20, 77, '#f1b83d');
    rect(x + 37, 321, 26, 50, '#d14d31');
    for (let i = 0; i < 4; i++) rect(x + 20, 317 + i * 15, 13, 4, '#663a2a');
  }

  function drawHud() {
    rect(16, 16, 365, 65, 'rgba(20,45,73,.94)');
    ctx.fillStyle = '#fff3d0';
    ctx.font = '900 12px Courier New';
    ctx.fillText(`CAJUS ${String(collected).padStart(2, '0')}  CAFÉS ${coffeeCount}  VIDAS ${lives}`, 31, 42);
    ctx.fillText(`${level.difficulty}  NOTAS ${notes}/4  FASE ${levelIndex + 1}/4`, 31, 66);
    rect(W - 204, 16, 188, 65, 'rgba(20,45,73,.94)');
    ctx.fillText(player.dashCooldown > 0 ? 'DASH REC.' : 'DASH PRONTO', W - 190, 41);
    if (player.coffeeTimer > 0) {
      ctx.fillStyle = '#ffc84a';
      ctx.fillText('CAFÉ TURBO', W - 190, 64);
      rect(W - 89, 54, 60 * (player.coffeeTimer / 7), 9, '#ffc84a');
    } else {
      ctx.fillStyle = '#fff3d0';
      ctx.fillText(`${String(Math.ceil(elapsed)).padStart(3, '0')}s`, W - 62, 64);
    }
  }

  function draw() {
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9);
    drawBackground();
    drawPlatforms();
    drawHazards();
    drawExit();
    coins.filter((coin) => !coin.got).forEach(drawCoin);
    coffees.filter((coffee) => !coffee.got).forEach(drawCoffee);
    enemies.filter((enemy) => enemy.alive).forEach(drawEnemy);
    drawEnemyProjectiles();
    drawBoss();
    drawPlayer();
    for (const particle of particles) rect(particle.x - cameraX, particle.y, particle.size, particle.size, particle.color);
    drawHud();
    ctx.restore();
  }

  function loop(now) {
    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    if (level) draw();
    else rect(0, 0, W, H, '#66cbd9');
    requestAnimationFrame(loop);
  }

  const keyMap = {
    ArrowLeft: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right',
    ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump',
    x: 'action', X: 'action',
    Shift: 'dash', z: 'dash', Z: 'dash',
  };

  addEventListener('keydown', (event) => {
    if (keyMap[event.key]) {
      event.preventDefault();
      input[keyMap[event.key]] = true;
    }
    if (event.key === 'Escape' && mode === 'playing') {
      mode = 'paused';
      ui.paused.classList.add('show');
    } else if (event.key === 'Escape' && mode === 'paused') {
      mode = 'playing';
      ui.paused.classList.remove('show');
    }
  });

  addEventListener('keyup', (event) => {
    if (keyMap[event.key]) input[keyMap[event.key]] = false;
  });

  addEventListener('blur', () => {
    Object.keys(input).forEach((key) => { input[key] = false; });
  });

  document.querySelectorAll('[data-key]').forEach((button) => {
    const control = button.dataset.key;
    const press = (event) => {
      event.preventDefault();
      input[control] = true;
      button.classList.add('down');
    };
    const release = (event) => {
      event.preventDefault();
      input[control] = false;
      button.classList.remove('down');
    };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  });

  $('#start').addEventListener('click', restartJourney);
  $('#continue').addEventListener('click', loadLevel);
  $('#again').addEventListener('click', restartJourney);
  $('#sound').addEventListener('click', () => {
    soundOn = !soundOn;
    $('#sound').textContent = `SOM: ${soundOn ? 'ON' : 'OFF'}`;
    if (soundOn) tone(440);
  });
  $('#pause').addEventListener('click', () => {
    if (mode === 'playing') {
      mode = 'paused';
      ui.paused.classList.add('show');
    } else if (mode === 'paused') {
      mode = 'playing';
      ui.paused.classList.remove('show');
    }
  });

  requestAnimationFrame(loop);
})();
