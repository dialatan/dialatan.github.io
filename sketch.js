let startTime;
let moonState = "slide";
let moon = { x: 790, y: 300, rotation: 0, sx: 1, sy: 1 };
let swing = { angle: 0, velocity: 0 };
let stars = [];
let impactAge = -1;
let moonPath;
let draggingSwing = false;
let dragStartY = 0;
let dragStartAngle = 0;
let previousDragAngle = 0;
let dragAngularVelocity = 0;
let chimeVoices = [];
let chimeVoiceIndex = 0;
let soundReady = false;
let lastGlobalChime = 0;

const GOLD = [220, 179, 76];
const INK = [28, 27, 25];
const PAPER = [246, 243, 236];
const LEFT_ANCHOR = { x: 232, y: 406 };
const RIGHT_ANCHOR = { x: 350, y: 414 };
const ROPE_LENGTH = 690;
// Original pendant lengths. The closed outline sits just below these.
const PENDANT_ROOM = 1208;
// First entry is the far-right star, clear of the swing. Later works fill later slots.
const WORK_STAR_SLOTS = [0, 11, 10, 2, 4, 6, 8, 9, 1, 3, 5, 7];

let reduceMotion = false;
let workLinks = [];
let moonLink = null;
let hotWork = -1;
let hotMoon = false;

function setup() {
  reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = createCanvas(1000, 1250);
  canvas.parent("canvas-container");
  canvas.elt.style.background = "transparent";
  pixelDensity(2);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  setupChimes();
  resetAnimation();
  buildSkyLinks();
}

function resetAnimation() {
  startTime = millis();
  moonState = "slide";
  moon = { x: 790, y: 300, rotation: -0.2, sx: 1, sy: 1 };
  swing.angle = 0;
  swing.velocity = 0;
  impactAge = -1;
  draggingSwing = false;
  dragAngularVelocity = 0;
  // A fresh, continuous route on every replay. The endpoint is fixed so the
  // moon always lands precisely on the initial seat.
  moonPath = {
    a: { x: 790, y: 300 },
    b: { x: random(690, 900), y: random(390, 560) },
    c: { x: random(260, 570), y: random(680, 900) },
    d: { x: 395, y: 1047 }
  };
  stars = [];

  // Cover both sides of the swing, while still revealing from right to left.
  const xs = [820, 760, 704, 650, 594, 540, 488, 438, 382, 326, 270, 214];
  const lengths = [650, 735, 680, 785, 695, 755, 645, 780, 690, 748, 635, 710];
  for (let i = 0; i < xs.length; i++) {
    const nodeCount = 9 + (i % 3);
    const nodes = [];
    const top = branchY(xs[i]) + 8;
    for (let n = 0; n < nodeCount; n++) {
      nodes.push({ x: xs[i], y: top, px: xs[i], py: top });
    }
    stars.push({
      x: xs[i],
      top,
      target: min(lengths[i], PENDANT_ROOM - top),
      length: 0,
      speed: 0,
      delay: 0.25 + i * 0.16,
      phase: random(TWO_PI),
      lastChime: 0,
      swingContact: false,
      nodes
    });
  }
  if (reduceMotion) settleStill();
}

function settleStill() {
  moonState = "ride";
  impactAge = 99;
  swing.angle = 0;
  swing.velocity = 0;
  for (const s of stars) {
    s.length = s.target;
    s.speed = 0;
    const count = s.nodes.length;
    const seg = s.target / (count - 1);
    for (let n = 0; n < count; n++) {
      const y = s.top + seg * n;
      s.nodes[n].x = s.x;
      s.nodes[n].y = y;
      s.nodes[n].px = s.x;
      s.nodes[n].py = y;
    }
  }
}

function draw() {
  clear();
  const t = (millis() - startTime) / 1000;
  const dt = min(deltaTime / 1000, 0.033);

  updateAnimation(t, dt);
  drawCliff();
  drawStarCurtain(t, dt);
  drawDeer();
  drawSwing();
  drawMoon();
  drawImpact();
  syncSkyControls();
}

function updateAnimation(t, dt) {
  if (reduceMotion) {
    moonState = "ride";
    if (!draggingSwing) swing.velocity = 0;
    return;
  }

  const flightDuration = 2.45;
  if (t < flightDuration) {
    moonState = "slide";
    const u = smootherStep(constrain(t / flightDuration, 0, 1));
    const p = cubicPoint(moonPath.a, moonPath.b, moonPath.c, moonPath.d, u);
    const p2 = cubicPoint(
      moonPath.a, moonPath.b, moonPath.c, moonPath.d, min(1, u + 0.008)
    );
    moon.x = p.x;
    moon.y = p.y;
    moon.rotation = atan2(p2.y - p.y, p2.x - p.x) - HALF_PI * 0.12;
    moon.sx = 1;
    moon.sy = 1;
  } else {
    if (moonState !== "ride") {
      moonState = "ride";
      // First travel away from the viewer, then return and come closer.
      swing.velocity = 1.02;
      impactAge = 0;
    }

    if (!draggingSwing) {
      // damped physical pendulum: theta'' = -(g/L)sin(theta) - damping*theta'
      const gravity = 1250;
      const damping = 0.23;
      const acceleration = -(gravity / ROPE_LENGTH) * sin(swing.angle)
        - damping * swing.velocity;
      swing.velocity += acceleration * dt;
      swing.angle += swing.velocity * dt;
    }

    if (abs(swing.velocity) < 0.00035 && abs(swing.angle) < 0.00035) {
      swing.velocity = 0;
      swing.angle = 0;
    }
    impactAge += dt;
  }
}

function drawStarCurtain(t, dt) {
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const local = t - s.delay;
    if (local <= 0 && !reduceMotion) continue;

    if (reduceMotion) {
      s.length = s.target;
      s.speed = 0;
    } else {
      // Spring growth creates drop and rebound.
      const force = (s.target - s.length) * 24;
      s.speed += force * dt;
      s.speed *= pow(0.055, dt);
      s.length += s.speed * dt;
      s.length = max(2, s.length);
    }

    const seat = seatCenter();
    simulateFlexibleStrand(s, seat, dt, i);

    const breathe = reduceMotion ? 1 : 0.82 + 0.18 * sin(frameCount * 0.025 + s.phase);
    stroke(INK[0], INK[1], INK[2], 150);
    strokeWeight(1.15);
    noFill();
    beginShape();
    const first = lean(s, s.nodes[0].x, s.nodes[0].y);
    curveVertex(first.x, first.y);
    curveVertex(first.x, first.y);
    let pendant = first;
    for (const node of s.nodes) {
      pendant = lean(s, node.x, node.y);
      curveVertex(pendant.x, pendant.y);
    }
    curveVertex(pendant.x, pendant.y);
    curveVertex(pendant.x, pendant.y);
    endShape();
    s.drawX = pendant.x;
    s.drawY = pendant.y;

    // One larger pendant star at the end of each vertical hanging line.
    const size = 9.0 + (i % 3) * 1.5;
    const nearMoon = constrain(1 - dist(pendant.x, pendant.y, seat.x,
      seat.y - 45 * seat.scale) / 190, 0, 1);
    drawTinyStar(pendant.x, pendant.y, size,
      breathe * (1 + nearMoon * 0.32), starIsHot(i));
  }
}

// A few degrees of lean, drawn on top of the simulated string.
// The verlet nodes themselves stay on the original physics.
function idleStringAngle(s) {
  if (reduceMotion) return 0;
  return 0.012 * sin(millis() * 0.00045 + s.phase);
}

function lean(s, x, y) {
  const angle = idleStringAngle(s);
  if (angle === 0) return { x, y };
  const dx = x - s.x;
  const dy = y - s.top;
  const c = cos(angle);
  const sn = sin(angle);
  return {
    x: s.x + dx * c - dy * sn,
    y: s.top + dx * sn + dy * c
  };
}

function simulateFlexibleStrand(s, seat, dt, strandIndex) {
  const nodes = s.nodes;
  const segmentLength = s.length / (nodes.length - 1);
  const pointerVX = mouseX - pmouseX;
  const pointerVY = mouseY - pmouseY;
  const pointerInside = mouseX >= 0 && mouseX <= width
    && mouseY >= 0 && mouseY <= height;

  // Verlet integration: previous position stores velocity implicitly.
  for (let n = 1; n < nodes.length; n++) {
    const p = nodes[n];
    const vx = (p.x - p.px) * 0.985;
    const vy = (p.y - p.py) * 0.985;
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy + 520 * dt * dt;

    // Strong, local mouse brushing; lower nodes receive slightly more motion.
    if (pointerInside) {
      const d = dist(mouseX, mouseY, p.x, p.y);
      const influence = constrain(1 - d / 155, 0, 1);
      if (influence > 0) {
        const weight = 0.65 + n / nodes.length;
        p.x += pointerVX * influence * weight * 1.12;
        // Upward brushing is deliberately restrained so the chain cannot
        // fold over itself or shoot above its anchor.
        const limitedPointerY = constrain(pointerVY, -3.2, 9);
        p.y += limitedPointerY * influence * weight * 0.16;

        const pointerSpeed = sqrt(
          pointerVX * pointerVX + pointerVY * pointerVY
        );
        if (influence > 0.35 && pointerSpeed > 4
            && millis() - s.lastChime > 140) {
          const strength = constrain(
            map(pointerSpeed, 4, 45, 0.025, 0.11),
            0.025,
            0.11
          );
          playChime(strandIndex, strength);
          s.lastChime = millis();
        }
      }
    }

    // Soft collision against the projected moon and swing seat.
    const collisionY = seat.y - 20 * seat.scale;
    const dx = p.x - seat.x;
    const dy = p.y - collisionY;
    const radiusX = 145 * seat.scale;
    const radiusY = 78 * seat.scale;
    const ellipseDistance = sqrt(
      (dx * dx) / (radiusX * radiusX) +
      (dy * dy) / (radiusY * radiusY)
    );
    if (ellipseDistance < 1) {
      const push = (1 - ellipseDistance) * (18 + abs(swing.velocity) * 42);
      const direction = dx === 0 ? (s.x < seat.x ? -1 : 1) : Math.sign(dx);
      p.x += direction * push;
      p.y -= push * 0.12;

    }

    // Vertical rest-pose spring: strong enough to hang straight at rest,
    // gentle enough to keep a visible flexible bend during interaction.
    const depthRatio = n / (nodes.length - 1);
    p.x += (s.x - p.x) * (0.010 - depthRatio * 0.003);
  }

  // More constraint passes reduce excessive softness.
  for (let iteration = 0; iteration < 11; iteration++) {
    nodes[0].x = s.x;
    nodes[0].y = s.top;
    for (let n = 1; n < nodes.length; n++) {
      const a = nodes[n - 1];
      const b = nodes[n];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distanceNow = max(0.0001, sqrt(dx * dx + dy * dy));
      const correction = (distanceNow - segmentLength) / distanceNow;
      if (n === 1) {
        b.x -= dx * correction;
        b.y -= dy * correction;
      } else {
        a.x += dx * correction * 0.5;
        a.y += dy * correction * 0.5;
        b.x -= dx * correction * 0.5;
        b.y -= dy * correction * 0.5;
      }
    }

    // Weak two-segment constraints provide moderate bending resistance.
    for (let n = 2; n < nodes.length; n++) {
      const a = nodes[n - 2];
      const b = nodes[n];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distanceNow = max(0.0001, sqrt(dx * dx + dy * dy));
      const targetDistance = segmentLength * 1.975;
      const correction = (distanceNow - targetDistance) / distanceNow * 0.19;
      if (n === 2) {
        b.x -= dx * correction;
        b.y -= dy * correction;
      } else {
        a.x += dx * correction * 0.5;
        a.y += dy * correction * 0.5;
        b.x -= dx * correction * 0.5;
        b.y -= dy * correction * 0.5;
      }
    }
  }

  // Prevent upward folding: every node must remain below its predecessor.
  for (let n = 1; n < nodes.length; n++) {
    const minimumY = nodes[n - 1].y + segmentLength * 0.48;
    if (nodes[n].y < minimumY) {
      nodes[n].y = minimumY;
      nodes[n].py = min(nodes[n].py, nodes[n].y);
    }
  }

  nodes[0].x = s.x;
  nodes[0].y = s.top;
  nodes[0].px = s.x;
  nodes[0].py = s.top;

  // Collision-entry latch: one sound per encounter. It cannot retrigger
  // until the swing has moved clearly away from this pendant star.
  const pendant = nodes[nodes.length - 1];
  const soundCenterY = seat.y - 20 * seat.scale;
  const soundRadiusX = 145 * seat.scale;
  const soundRadiusY = 78 * seat.scale;
  const soundDx = pendant.x - seat.x;
  const soundDy = pendant.y - soundCenterY;
  const pendantDistance = sqrt(
    (soundDx * soundDx) / (soundRadiusX * soundRadiusX) +
    (soundDy * soundDy) / (soundRadiusY * soundRadiusY)
  );

  if (pendantDistance < 1 && !s.swingContact
      && abs(swing.velocity) > 0.1
      && millis() - s.lastChime > 650) {
    const strength = map(
      constrain(abs(swing.velocity), 0.1, 1.7),
      0.1,
      1.7,
      0.025,
      0.09
    );
    playChime(strandIndex, strength);
    s.lastChime = millis();
    s.swingContact = true;
  } else if (pendantDistance > 1.35) {
    // Hysteresis prevents boundary jitter from counting as a new collision.
    s.swingContact = false;
  }
}

function drawTinyStar(x, y, r, breathe, hot) {
  push();
  translate(x, y);
  rotate(-PI / 2);
  noStroke();
  const glow = hot ? 1 : 0;
  fill(GOLD[0], GOLD[1], GOLD[2], (22 + glow * 55) * breathe);
  circle(0, 0, r * (5.4 + glow * 2.6));
  fill(GOLD[0], GOLD[1], GOLD[2], (58 + glow * 80) * breathe);
  circle(0, 0, r * (2.8 + glow * 1.1));
  stroke(INK[0], INK[1], INK[2], hot ? 230 : 170);
  strokeWeight(hot ? 1.2 : 0.9);
  fill(GOLD[0], GOLD[1], GOLD[2], hot ? 255 : 235);
  beginShape();
  for (let k = 0; k < 10; k++) {
    const a = k * PI / 5;
    const rr = k % 2 === 0 ? r : r * 0.42;
    vertex(cos(a) * rr, sin(a) * rr);
  }
  endShape(CLOSE);
  pop();
}

function drawSwing() {
  const g = drawnSwingGeometry();
  const left = g.left;
  const right = g.right;
  stroke(INK[0], INK[1], INK[2]);
  noFill();
  strokeWeight(2.7);
  const flex = constrain(-swing.velocity * 17, -22, 22);
  const breath = reduceMotion ? 0 : sin(frameCount * 0.035) * 2.2;
  drawSoftRope(LEFT_ANCHOR, left, flex + breath);
  drawSoftRope(RIGHT_ANCHOR, right, flex * 0.82 - breath);

  const c = g.center;
  push();
  translate(c.x, c.y);
  scale(g.scale);
  strokeWeight(2.2);
  fill(PAPER[0], PAPER[1], PAPER[2]);
  beginShape();
  vertex(-112, -9); vertex(108, -9); vertex(126, 3); vertex(-92, 28);
  endShape(CLOSE);
  beginShape();
  vertex(-92, 28); vertex(126, 3); vertex(119, 13); vertex(-88, 38); vertex(-112, 2);
  endShape(CLOSE);
  pop();
}

function drawSoftRope(anchor, end, bend) {
  const dy = end.y - anchor.y;
  noFill();
  beginShape();
  vertex(anchor.x, anchor.y);
  bezierVertex(
    anchor.x + bend * 0.25, anchor.y + dy * 0.30,
    end.x - bend * 0.75, anchor.y + dy * 0.72,
    end.x, end.y
  );
  endShape();
}

function seatCenter() {
  const g = swingGeometry();
  return { x: g.center.x, y: g.center.y, scale: g.scale };
}

// Perspective projection of a pendulum swinging toward/away from the viewer.
// Positive angle is farther/smaller; negative angle is nearer/larger.
function swingGeometry() {
  return swingGeometryAt(swing.angle);
}

// Drawn a hair off the simulated angle once the landing swing has died,
// so the seat keeps a slow pendulum without changing the physics.
function drawnSwingGeometry() {
  return swingGeometryAt(swing.angle + idleSwingOffset());
}

function idleSwingOffset() {
  if (reduceMotion || draggingSwing || moonState !== "ride") return 0;
  if (impactAge < 4.5) return 0;
  if (abs(swing.velocity) > 0.04 || abs(swing.angle) > 0.04) return 0;
  return 0.02 * sin(millis() * 0.0004);
}

function swingGeometryAt(angle) {
  const horizonX = (LEFT_ANCHOR.x + RIGHT_ANCHOR.x) / 2;
  const horizonY = (LEFT_ANCHOR.y + RIGHT_ANCHOR.y) / 2;
  const depth = sin(angle) * ROPE_LENGTH;
  const focal = 900;
  const scale = constrain(focal / (focal + depth * 0.72), 0.68, 1.42);
  const baseX = 395;
  const center = {
    x: horizonX + (baseX - horizonX) * scale,
    // The arc rises at both extremes; perspective changes size without
    // pushing the near seat out of the bottom of the canvas.
    y: horizonY + cos(angle) * ROPE_LENGTH * (0.88 + 0.12 * scale)
  };
  return {
    scale,
    center,
    left: { x: center.x - 75 * scale, y: center.y - 7 * scale },
    right: { x: center.x + 75 * scale, y: center.y - 7 * scale }
  };
}

function drawMoon() {
  let x = moon.x, y = moon.y, rot = moon.rotation;
  let sx = moon.sx, sy = moon.sy;

  if (moonState === "ride") {
    const c = drawnSwingGeometry();
    const bounce = (!reduceMotion && impactAge >= 0 && impactAge < 0.55)
      ? exp(-impactAge * 6) * sin(impactAge * 28)
      : 0;
    x = c.center.x;
    y = c.center.y - 53 * c.scale;
    rot = 0;
    sx = c.scale * (1 + bounce * 0.14);
    sy = c.scale * (1 - bounce * 0.18);
  }

  push();
  translate(x, y);
  rotate(rot);
  scale(sx, sy);
  noStroke();
  fill(GOLD[0], GOLD[1], GOLD[2], hotMoon ? 55 : 20);
  circle(0, 0, hotMoon ? 156 : 120);
  fill(GOLD[0], GOLD[1], GOLD[2], hotMoon ? 78 : 32);
  circle(0, 0, hotMoon ? 112 : 88);
  stroke(INK[0], INK[1], INK[2]);
  strokeWeight(2.2);
  fill(GOLD[0], GOLD[1], GOLD[2]);
  beginShape();
  vertex(-8, -55);
  bezierVertex(35, -52, 55, -20, 50, 15);
  bezierVertex(46, 45, 16, 64, -18, 52);
  bezierVertex(-36, 46, -48, 34, -56, 20);
  bezierVertex(-29, 34, -5, 27, 5, 8);
  bezierVertex(18, -15, 9, -40, -8, -55);
  endShape(CLOSE);
  pop();
}

function drawImpact() {
  if (impactAge < 0 || impactAge > 1.1) return;
  const c = seatCenter();
  const u = impactAge / 1.1;
  noFill();
  stroke(GOLD[0], GOLD[1], GOLD[2], 100 * (1 - u));
  strokeWeight(3 * (1 - u) + 0.5);
  ellipse(c.x, c.y - 25, 35 + u * 210, 18 + u * 85);
}

function drawCliff() {
  stroke(INK[0], INK[1], INK[2]); strokeWeight(4.5); noFill();
  beginShape();
  vertex(232, 406);
  bezierVertex(280,397,311,402,344,417);
  bezierVertex(373,430,393,413,425,404);
  bezierVertex(463,393,505,409,525,438);
  bezierVertex(534,452,539,469,546,467);
  bezierVertex(553,464,552,452,561,449);
  bezierVertex(570,446,575,459,587,457);
  bezierVertex(596,454,596,443,608,435);
  bezierVertex(650,417,735,428,790,405);
  bezierVertex(817,393,830,407,847,430);
  bezierVertex(860,448,871,461,876,450);
  bezierVertex(881,439,861,402,847,390);
  bezierVertex(883,414,905,454,972,485);
  endShape();
  strokeWeight(2.1);
  beginShape(); vertex(866,407); bezierVertex(894,434,923,460,972,485); endShape();
  strokeWeight(4.8);
  beginShape();
  vertex(232,406);
  bezierVertex(175,415,128,448,99,500);
  bezierVertex(68,556,73,638,82,713);
  bezierVertex(91,794,104,889,121,979);
  bezierVertex(138,1072,150,1148,183,1172);
  bezierVertex(214,1212,262,1222,302,1213);
  bezierVertex(324,1208,339,1205,359,1213);
  bezierVertex(383,1223,405,1224,427,1210);
  bezierVertex(455,1193,478,1181,507,1180);
  bezierVertex(540,1200,574,1204,611,1204);
  bezierVertex(684,1204,756,1210,824,1177);
  bezierVertex(892,1142,938,1044,958,936);
  bezierVertex(978,834,994,726,982,624);
  bezierVertex(972,546,966,500,972,485);
  endShape();
}

function drawDeer() {
  noFill(); stroke(INK[0], INK[1], INK[2]); strokeWeight(3.2);
  beginShape();
  vertex(228,280); bezierVertex(260,271,303,272,324,287);
  bezierVertex(340,298,345,322,350,351);
  bezierVertex(390,294,424,293,468,312);
  bezierVertex(502,327,521,350,550,359);
  bezierVertex(575,367,595,358,603,342);
  bezierVertex(615,321,589,278,599,218);
  bezierVertex(605,184,618,176,623,183);
  bezierVertex(629,192,611,224,611,272);
  bezierVertex(611,312,621,329,638,314);
  bezierVertex(655,298,681,293,684,300);
  bezierVertex(688,308,656,329,627,340);
  bezierVertex(606,349,591,366,596,375);
  bezierVertex(605,390,653,382,691,370);
  bezierVertex(738,354,773,331,805,302);
  bezierVertex(783,330,767,350,756,372);
  bezierVertex(750,383,758,378,771,374);
  bezierVertex(803,364,824,377,843,395);
  endShape();
  beginShape();
  vertex(228,280); bezierVertex(264,291,313,282,359,299);
  bezierVertex(408,316,452,352,501,359);
  bezierVertex(535,364,567,350,579,327);
  bezierVertex(592,304,586,276,590,247);
  bezierVertex(594,210,603,179,616,179); endShape();
  beginShape();
  vertex(627,340); bezierVertex(642,326,663,322,684,307);
  bezierVertex(699,296,692,294,682,297);
  bezierVertex(670,302,650,317,635,308);
  bezierVertex(619,298,616,274,617,251); endShape();
  beginShape();
  vertex(691,370); bezierVertex(744,349,790,318,815,278);
  bezierVertex(838,242,829,205,815,164);
  bezierVertex(803,129,776,63,798,44);
  bezierVertex(807,36,819,41,812,61);
  bezierVertex(797,105,817,158,832,207);
  bezierVertex(835,219,836,233,843,229);
  bezierVertex(865,211,882,179,914,169);
  bezierVertex(929,164,944,165,952,170);
  bezierVertex(928,172,907,181,893,200);
  bezierVertex(871,228,863,265,842,294);
  bezierVertex(824,320,803,342,771,374); endShape();
  beginShape(); vertex(832,207); bezierVertex(819,167,790,91,786,62); bezierVertex(782,37,793,29,802,33); endShape();
  beginShape(); vertex(617,251); bezierVertex(610,231,613,202,623,184); bezierVertex(628,174,630,180,626,194); endShape();
}

// ============================================================
// Personal IP: seated figure and gray cat
// ============================================================

function drawIPScene() {
  // Static spectators in the lower-right corner.
  drawSeatedPerson(820, 1128, 0.58);
  drawGrayCat(918, 1172, 0.52);
}

function drawSeatedPerson(x, y, sc) {
  push();
  translate(x, y);
  scale(sc);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // Back leg and wide beige trousers.
  stroke(157, 125, 88);
  strokeWeight(3.2);
  fill(249, 244, 233);
  beginShape();
  vertex(-18, 25);
  bezierVertex(-36, 47, -53, 58, -75, 65);
  bezierVertex(-52, 72, -27, 72, -2, 63);
  bezierVertex(15, 57, 28, 48, 37, 36);
  vertex(16, 20);
  endShape(CLOSE);

  beginShape();
  vertex(8, 24);
  bezierVertex(26, 43, 49, 55, 74, 61);
  bezierVertex(56, 70, 34, 70, 12, 62);
  bezierVertex(-4, 55, -13, 43, -18, 31);
  endShape(CLOSE);

  // Shoes.
  stroke(10);
  fill(12);
  beginShape();
  vertex(-77, 61); bezierVertex(-91, 64, -96, 74, -84, 79);
  bezierVertex(-69, 83, -51, 78, -43, 70); endShape(CLOSE);
  beginShape();
  vertex(70, 58); bezierVertex(84, 60, 95, 68, 91, 75);
  bezierVertex(78, 82, 58, 78, 47, 68); endShape(CLOSE);

  // Long cobalt-blue coat.
  stroke(40, 83, 157);
  strokeWeight(4);
  fill(250, 250, 246);
  beginShape();
  vertex(-30, -79);
  bezierVertex(-50, -70, -61, -43, -62, -6);
  bezierVertex(-64, 18, -55, 37, -42, 49);
  bezierVertex(-26, 43, -14, 32, -6, 17);
  vertex(4, 43);
  bezierVertex(23, 49, 44, 45, 55, 31);
  bezierVertex(50, 9, 48, -25, 39, -54);
  bezierVertex(28, -72, 8, -82, -30, -79);
  endShape(CLOSE);

  // Coat folds and lapels.
  noFill();
  strokeWeight(2.4);
  line(-30, -67, -8, -42);
  line(25, -68, 5, -42);
  bezier(-38, -45, -45, -12, -40, 27, -30, 40);
  bezier(31, -45, 38, -12, 36, 20, 27, 39);
  fill(30);
  noStroke();
  circle(-29, -20, 7);
  circle(-25, 8, 7);

  // Blue-gray inner shirt and dark scarf.
  stroke(35, 75, 112);
  strokeWeight(2.4);
  fill(164, 184, 194);
  beginShape();
  vertex(-18, -61); vertex(17, -61); vertex(20, 8); vertex(-17, 8);
  endShape(CLOSE);
  fill(27, 42, 47);
  beginShape();
  vertex(-17, -65); vertex(17, -65); vertex(8, -31); vertex(-2, -20); vertex(-12, -34);
  endShape(CLOSE);

  // Neck and head.
  stroke(75, 57, 43);
  strokeWeight(3);
  fill(253, 250, 242);
  rect(-9, -91, 18, 20, 7);
  ellipse(0, -123, 72, 78);

  // Short brown hair.
  fill(91, 69, 51);
  stroke(78, 58, 43);
  beginShape();
  vertex(-38, -128);
  bezierVertex(-42, -164, -12, -179, 22, -166);
  bezierVertex(45, -157, 48, -129, 35, -108);
  bezierVertex(28, -120, 30, -139, 17, -148);
  bezierVertex(5, -137, -10, -130, -33, -129);
  bezierVertex(-27, -117, -26, -105, -18, -96);
  bezierVertex(-39, -102, -44, -114, -38, -128);
  endShape(CLOSE);

  // Hair texture.
  noFill();
  stroke(123, 94, 67, 180);
  strokeWeight(1.8);
  bezier(-31,-143,-14,-164,7,-163,28,-150);
  bezier(-28,-135,-9,-153,10,-154,32,-139);
  bezier(-21,-128,-3,-143,15,-144,34,-129);

  // Friendly face looking toward the cat.
  stroke(35);
  strokeWeight(2.5);
  arc(-13, -122, 13, 11, 0, PI);
  arc(14, -119, 13, 11, 0, PI);
  arc(2, -103, 22, 15, 0.08, PI - 0.08);
  noStroke();
  fill(238, 156, 158, 85);
  ellipse(-23, -108, 13, 8);
  ellipse(25, -106, 13, 8);

  // Arm reaching toward the cat.
  stroke(40, 83, 157);
  strokeWeight(4);
  noFill();
  bezier(37, -47, 59, -29, 66, -8, 68, 7);
  stroke(75, 57, 43);
  strokeWeight(2.5);
  fill(253, 250, 242);
  ellipse(68, 11, 17, 14);
  pop();
}

function drawGrayCat(x, y, sc) {
  push();
  translate(x, y);
  scale(sc);
  stroke(25);
  strokeWeight(3.2);
  strokeJoin(ROUND);
  fill(158, 161, 164);

  // Tail behind the body.
  noFill();
  strokeWeight(10);
  bezier(36, 8, 71, -14, 72, 27, 47, 36);
  stroke(25);
  strokeWeight(3.2);
  bezier(36, 8, 71, -14, 72, 27, 47, 36);

  // Body and feet.
  fill(158, 161, 164);
  ellipse(5, 22, 76, 62);
  ellipse(-17, 48, 24, 15);
  ellipse(25, 48, 24, 15);

  // Head with triangular ears.
  beginShape();
  vertex(-40, -27); vertex(-31, -61); vertex(-10, -43);
  bezierVertex(4, -49, 18, -47, 29, -39);
  vertex(47, -58); vertex(49, -20);
  bezierVertex(48, 6, 30, 20, 4, 19);
  bezierVertex(-25, 20, -43, 4, -40, -27);
  endShape(CLOSE);

  // White ear centers and paws.
  noStroke();
  fill(249);
  triangle(-30,-51,-27,-38,-18,-43);
  triangle(39,-49,35,-36,27,-42);
  ellipse(-31, 14, 20, 17);
  ellipse(39, 5, 20, 17);

  // Face.
  fill(25);
  circle(-13, -18, 5);
  circle(17, -18, 5);
  triangle(0,-9,-5,-4,5,-4);
  stroke(25);
  strokeWeight(2);
  noFill();
  arc(-5, -3, 12, 9, 0, PI * 0.85);
  arc(6, -3, 12, 9, PI * 0.15, PI);
  line(-26,-8,-47,-12); line(-26,-2,-49,1);
  line(28,-8,49,-13); line(28,-2,51,2);

  // Pink heart cheeks.
  noStroke();
  fill(238, 157, 196, 175);
  drawHeart(-23, -8, 5);
  drawHeart(25, -8, 5);

  // Raised paw reaches the first flexible star curtain.
  stroke(25);
  strokeWeight(3);
  fill(249);
  ellipse(28, -47, 17, 20);
  line(29, -38, 31, -24);
  pop();
}

function drawHeart(x, y, size) {
  push();
  translate(x, y);
  beginShape();
  vertex(0, size);
  bezierVertex(-size * 1.5, 0, -size, -size, 0, -size * 0.2);
  bezierVertex(size, -size, size * 1.5, 0, 0, size);
  endShape(CLOSE);
  pop();
}

function starIsHot(starIndex) {
  return hotWork >= 0 && WORK_STAR_SLOTS[hotWork] === starIndex;
}

function moonAnchor() {
  if (moonState === "ride") {
    const c = drawnSwingGeometry();
    return { x: c.center.x, y: c.center.y - 53 * c.scale };
  }
  return { x: moon.x, y: moon.y };
}

function makeSkyLink(url, tip, kind) {
  const link = document.createElement("a");
  link.className = "sky-hit";
  link.href = url;
  link.setAttribute("data-nightfall", "");
  link.setAttribute("data-sky", kind);
  link.setAttribute("data-tip", tip);
  link.setAttribute("aria-label", tip);
  return link;
}

function buildSkyLinks() {
  const nav = document.getElementById("sky-links");
  if (!nav) return;
  nav.replaceChildren();
  workLinks = [];
  hotWork = -1;
  hotMoon = false;
  const works = (typeof WORKS !== "undefined" && Array.isArray(WORKS))
    ? WORKS.filter(function (work) { return work.sky; })
    : [];
  for (let i = 0; i < works.length && i < WORK_STAR_SLOTS.length; i++) {
    const work = works[i];
    const tip = work.title_zh + " / " + work.title_en;
    const link = makeSkyLink(work.url, tip, "work");
    const index = i;
    link.hidden = true;
    link.addEventListener("pointerenter", () => { hotWork = index; });
    link.addEventListener("pointerleave", () => { if (hotWork === index) hotWork = -1; });
    link.addEventListener("focus", () => { hotWork = index; });
    link.addEventListener("blur", () => { if (hotWork === index) hotWork = -1; });
    nav.appendChild(link);
    workLinks.push(link);
  }
  moonLink = makeSkyLink("/starmap/", "天黑了 · Nightfall", "moon");
  moonLink.addEventListener("pointerenter", () => { hotMoon = true; });
  moonLink.addEventListener("pointerleave", () => { hotMoon = false; });
  moonLink.addEventListener("focus", () => { hotMoon = true; });
  moonLink.addEventListener("blur", () => { hotMoon = false; });
  nav.appendChild(moonLink);
}

function syncSkyControls() {
  const canvasEl = document.querySelector("#canvas-container canvas");
  const container = document.getElementById("canvas-container");
  if (!canvasEl || !container) return;
  const cr = canvasEl.getBoundingClientRect();
  const pr = container.getBoundingClientRect();
  if (cr.width < 2 || cr.height < 2) return;
  const sx = cr.width / width;
  const sy = cr.height / height;
  const ox = cr.left - pr.left;
  const oy = cr.top - pr.top;

  for (let i = 0; i < workLinks.length; i++) {
    const strand = stars[WORK_STAR_SLOTS[i]];
    const link = workLinks[i];
    const ready = strand
      && strand.nodes.length > 0
      && strand.length >= Math.max(24, strand.target * 0.72);
    if (!ready) {
      link.hidden = true;
      continue;
    }
    const pendant = {
      x: strand.drawX != null ? strand.drawX : strand.nodes[strand.nodes.length - 1].x,
      y: strand.drawY != null ? strand.drawY : strand.nodes[strand.nodes.length - 1].y
    };
    const gap = strandGap(WORK_STAR_SLOTS[i]);
    // As wide as the gap allows, and tall enough to tap. The next star stays outside
    // on a mouse. A finger needs a larger target, so touch uses at least 44px.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let hitW = gap * 0.9;
    let hitH = Math.max(48 / sy, Math.min(170, gap * 2.3));
    if (coarse) {
      hitW = Math.max(hitW, 44 / sx);
      hitH = Math.max(hitH, 44 / sy);
    }
    placeHit(link, pendant.x, pendant.y, ox, oy, sx, sy, hitW, hitH);
    link.style.zIndex = "1";
  }

  if (!moonLink) return;
  const anchored = moonAnchor();
  // The moon is larger than a pendant star and sits clear of the strings.
  // Cover the moon, and leave the lower seat free so it can still be dragged.
  placeHit(moonLink, anchored.x, anchored.y, ox, oy, sx, sy, 100, 100);
  moonLink.style.zIndex = "2";
}

function strandGap(index) {
  const x = stars[index].x;
  let gap = 90;
  for (let i = 0; i < stars.length; i++) {
    if (i === index) continue;
    gap = min(gap, abs(stars[i].x - x));
  }
  return gap;
}

function placeHit(link, x, y, ox, oy, sx, sy, canvasW, canvasH) {
  link.hidden = false;
  link.style.left = (ox + x * sx) + "px";
  link.style.top = (oy + y * sy) + "px";
  link.style.width = (canvasW * sx) + "px";
  link.style.height = (canvasH * sy) + "px";
}

function branchY(x) {
  if (x < 232) return 415 + (232 - x) * 0.08;
  return 410 + (800 - x) * 0.045;
}

function cubicPoint(a, b, c, d, t) {
  const u = 1 - t;
  return {
    x: u*u*u*a.x + 3*u*u*t*b.x + 3*u*t*t*c.x + t*t*t*d.x,
    y: u*u*u*a.y + 3*u*u*t*b.y + 3*u*t*t*c.y + t*t*t*d.y
  };
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4*t*t*t : 1 - pow(-2*t + 2, 3) / 2;
}

function smootherStep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// ============================================================
// Procedural wind-chime sound (requires p5.sound)
// ============================================================

function setupChimes() {
  for (let i = 0; i < 8; i++) {
    const fundamental = new p5.Oscillator("sine");
    const overtone = new p5.Oscillator("triangle");
    const fundamentalEnv = new p5.Envelope();
    const overtoneEnv = new p5.Envelope();

    fundamentalEnv.setADSR(0.002, 0.12, 0.04, 1.1);
    fundamentalEnv.setRange(0.12, 0);
    overtoneEnv.setADSR(0.001, 0.05, 0.01, 0.48);
    overtoneEnv.setRange(0.035, 0);

    fundamental.start();
    overtone.start();
    fundamental.amp(0);
    overtone.amp(0);

    chimeVoices.push({
      fundamental,
      overtone,
      fundamentalEnv,
      overtoneEnv
    });
  }
}

function playChime(strandIndex, strength) {
  if (!soundReady || chimeVoices.length === 0) return;
  if (millis() - lastGlobalChime < 220) return;
  lastGlobalChime = millis();

  // C-major pentatonic pitches keep overlapping collisions harmonious.
  const notes = [523.25, 587.33, 659.25, 783.99, 880];
  const voice = chimeVoices[chimeVoiceIndex];
  chimeVoiceIndex = (chimeVoiceIndex + 1) % chimeVoices.length;

  const frequency = notes[strandIndex % notes.length]
    * random(0.985, 1.015);
  const volume = constrain(strength, 0.015, 0.11);

  voice.fundamental.freq(frequency);
  voice.overtone.freq(frequency * 2.73);
  voice.fundamentalEnv.setRange(volume, 0);
  voice.overtoneEnv.setRange(volume * 0.32, 0);
  voice.fundamentalEnv.play(voice.fundamental);
  voice.overtoneEnv.play(voice.overtone);
}

function mousePressed() {
  unlockSound();

  if (moonState !== "ride") return false;
  if (pointerOnSwing()) beginSwingDrag();
  return false;
}

function mouseDragged() {
  if (!draggingSwing) return false;
  applySwingDrag();
  return false;
}

function mouseReleased() {
  if (!draggingSwing) return false;
  endSwingDrag();
  return false;
}

// p5 listens for touches on the window. Returning false calls preventDefault
// and stops the page from scrolling, so only a real swing grab should do that.
// Any other swipe — including one that starts on the drawing — must scroll.
function touchStarted(event) {
  unlockSound();
  if (!touchClaimsSwing(event)) return true;
  beginSwingDrag();
  return false;
}

function touchMoved() {
  if (!draggingSwing) return true;
  applySwingDrag();
  return false;
}

function touchEnded() {
  if (!draggingSwing) return true;
  endSwingDrag();
  return false;
}

function unlockSound() {
  if (soundReady) return;
  userStartAudio();
  soundReady = true;
}

function pointerOnSwing() {
  const c = seatCenter();
  const hitRadiusX = 145 * c.scale;
  const hitRadiusY = 95 * c.scale;
  const nx = (mouseX - c.x) / hitRadiusX;
  const ny = (mouseY - (c.y - 25 * c.scale)) / hitRadiusY;
  return nx * nx + ny * ny <= 1;
}

function touchClaimsSwing(event) {
  if (moonState !== "ride") return false;
  const canvas = document.querySelector("#canvas-container canvas");
  if (!canvas || !event || event.target !== canvas) return false;
  return pointerOnSwing();
}

function beginSwingDrag() {
  draggingSwing = true;
  dragStartY = mouseY;
  dragStartAngle = swing.angle;
  previousDragAngle = swing.angle;
  dragAngularVelocity = 0;
  swing.velocity = 0;
}

function applySwingDrag() {
  // Up = farther/smaller; down = nearer/larger.
  const target = constrain(
    dragStartAngle + (dragStartY - mouseY) * 0.0042,
    -0.78,
    0.78
  );
  swing.angle = lerp(swing.angle, target, 0.42);
  const frameDt = max(deltaTime / 1000, 1 / 120);
  const instantVelocity = (swing.angle - previousDragAngle) / frameDt;
  dragAngularVelocity = lerp(dragAngularVelocity, instantVelocity, 0.28);
  previousDragAngle = swing.angle;
}

function endSwingDrag() {
  draggingSwing = false;
  swing.velocity = constrain(dragAngularVelocity, -2.0, 2.0);
}

function keyPressed() {
  if (key === "s" || key === "S") saveCanvas("moon-swing-stars", "png");
  if (key === "r" || key === "R") resetAnimation();
}
