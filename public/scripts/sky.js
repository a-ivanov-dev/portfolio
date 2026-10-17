/* Night-sky starfield for the home page hero. Ported 1:1 from the single-file site;
   only the hash router was removed (writeups are real pages now). */
(function () {
  var root = document.documentElement;
  /* the theme toggle lives in theme.js; it fires this event so the stars recolour */
  document.addEventListener('themechange', function () { readColors(); draw(); });

  var cv = document.getElementById('sky');
  if (!cv) return;               /* only the home page has a sky */
  var ctx = cv.getContext('2d');
  var labelEls = Array.prototype.slice.call(document.querySelectorAll('.lab'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COUNT = 130;
  var LINK = 0.60;            /* 3D proximity threshold, model units */
  var stars = [];            /* {x,y,z} in the unit ball */
  var edges = [];            /* [i, j, strength] — static in model space */
  var lnodes = [];           /* section labels as 3D nodes {x,y,z,el,near[]} */
  var proj = [];             /* per-frame projected stars */
  var W = 0, H = 0, cx = 0, cy = 0, spread = 0;
  var focal = 2.7;
  var ink = '255,255,255';
  var accentRGB = '88,166,255';
  var autoYaw = 0, offAy = 0, offAx = 0, tAy = 0, tAx = 0;
  var hovered = -1;

  /* device + interaction config — declared before draw()/resize() read them */
  var mqMobile = window.matchMedia('(max-width: 760px)');
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var heroVisible = true;
  var dragging = false, dragSX = 0, dragSY = 0, dragAy = 0, dragAx = 0;
  function animating() { return !reduce; }   /* static only for reduced-motion */

  function readColors() {
    var s = getComputedStyle(root);
    ink = (s.getPropertyValue('--hero-ink').trim()) || '255,255,255';
    accentRGB = (s.getPropertyValue('--accent-rgb').trim()) || '88,166,255';
  }
  readColors();

  /* stars distributed through a unit ball — gives real volume */
  for (var i = 0; i < COUNT; i++) {
    var x, y, z;
    do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1; }
    while (x * x + y * y + z * z > 1);
    stars.push({ x: x, y: y, z: z, t: Math.random() });   /* t = when it pops in (0..1 of reveal) */
  }

  /* load-in clock: stars fade in one-by-one from nowhere */
  var startTime = (window.performance && performance.now) ? performance.now() : 0;
  var REVEAL = 1800, FADE = 480;   /* ms: total scatter-in span, per-star fade */

  /* labels evenly spread on a sphere (fibonacci) so they sit around the cloud */
  (function () {
    var n = labelEls.length;
    var gold = Math.PI * (3 - Math.sqrt(5));
    for (var k = 0; k < n; k++) {
      var yy = (n === 1) ? 0 : 1 - (k / (n - 1)) * 2;
      var rr = Math.sqrt(Math.max(0, 1 - yy * yy));
      var th = gold * k;
      lnodes.push({
        x: Math.cos(th) * rr * 0.9,
        y: yy * 0.9,
        z: Math.sin(th) * rr * 0.9,
        el: labelEls[k],
        near: []
      });
    }
  })();

  /* 3D proximity edges — distances are rotation-invariant, so build once */
  for (var a = 0; a < COUNT; a++) {
    for (var b = a + 1; b < COUNT; b++) {
      var dx = stars[a].x - stars[b].x, dy = stars[a].y - stars[b].y, dz = stars[a].z - stars[b].z;
      var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < LINK) edges.push([a, b, 1 - d / LINK]);
    }
  }

  /* nearest stars to each label — the constellation drawn on hover */
  lnodes.forEach(function (ln) {
    var ds = [];
    for (var s = 0; s < COUNT; s++) {
      var ex = ln.x - stars[s].x, ey = ln.y - stars[s].y, ez = ln.z - stars[s].z;
      ds.push([s, ex * ex + ey * ey + ez * ez]);
    }
    ds.sort(function (p, q) { return p[1] - q[1]; });
    ln.near = ds.slice(0, 5).map(function (p) { return p[0]; });
  });

  /* mobile: the primary nav labels ride real, evenly-spread stars in the cluster */
  var navLabels = lnodes.filter(function (ln) { return !ln.el.classList.contains('lab--s'); });
  lnodes.forEach(function (ln) { ln.navIndex = -1; });
  navLabels.forEach(function (ln, i) { ln.navIndex = i; });
  var navAnchors = (function (K) {
    var gold = Math.PI * (3 - Math.sqrt(5)), out = [], used = {};
    for (var i = 0; i < K; i++) {
      var yy = (K === 1) ? 0 : 1 - (i / (K - 1)) * 2;
      var rr = Math.sqrt(Math.max(0, 1 - yy * yy)), th = gold * i;
      var tx = Math.cos(th) * rr, ty = yy, tz = Math.sin(th) * rr;
      var best = -1, bd = 1e9;
      for (var s = 0; s < COUNT; s++) {
        if (used[s]) continue;
        var dx = stars[s].x - tx, dy = stars[s].y - ty, dz = stars[s].z - tz;
        var d = dx * dx + dy * dy + dz * dz;
        if (d < bd) { bd = d; best = s; }
      }
      used[best] = true; out.push(best);
    }
    return out;
  })(navLabels.length);

  /* nearest stars to each anchor — the little constellation shown on press */
  var anchorNear = navAnchors.map(function (ai) {
    var ds = [];
    for (var s = 0; s < COUNT; s++) {
      if (s === ai) continue;
      var dx = stars[s].x - stars[ai].x, dy = stars[s].y - stars[ai].y, dz = stars[s].z - stars[ai].z;
      ds.push([s, dx * dx + dy * dy + dz * dz]);
    }
    ds.sort(function (p, q) { return p[1] - q[1]; });
    return ds.slice(0, 5).map(function (p) { return p[0]; });
  });
  var pressNav = -1;   /* which nav label is currently pressed (touch) */

  function project(p) {
    var ay = autoYaw + offAy, axx = offAx;
    var cY = Math.cos(ay), sY = Math.sin(ay);
    var x1 = p.x * cY - p.z * sY;
    var z1 = p.x * sY + p.z * cY;
    var cX = Math.cos(axx), sX = Math.sin(axx);
    var y1 = p.y * cX - z1 * sX;
    var z2 = p.y * sX + z1 * cX;
    var s = focal / (focal - z2);
    return { X: cx + x1 * s * spread, Y: cy + y1 * s * spread, s: s, z: z2 };
  }

  function resize() {
    var r = cv.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return;
    var dpr = window.devicePixelRatio || 1;
    W = r.width; H = r.height; cx = W / 2; cy = H / 2;
    /* pull the cloud in on phones so the floating labels stay on-screen */
    spread = Math.min(W, H) * (mqMobile.matches ? 0.32 : 0.46);
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    if (!W || !ctx) return;
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < COUNT; i++) proj[i] = project(stars[i]);

    /* load-in reveal: stars scatter in first, then mesh + labels follow */
    var now = (window.performance && performance.now) ? performance.now() : 0;
    var elapsed = now - startTime;
    var gRev = reduce ? 1 : Math.max(0, Math.min(1, (elapsed - REVEAL * 0.5) / 700));

    /* mesh — faint, depth-faded */
    ctx.strokeStyle = 'rgb(' + ink + ')';
    ctx.lineWidth = 1;
    for (var e = 0; e < edges.length; e++) {
      var A = proj[edges[e][0]], B = proj[edges[e][1]], t = edges[e][2];
      var df = (((A.z + B.z) / 2) + 1) / 2;
      ctx.globalAlpha = 0.10 * t * (0.35 + df * 0.85) * gRev;
      ctx.beginPath(); ctx.moveTo(A.X, A.Y); ctx.lineTo(B.X, B.Y); ctx.stroke();
    }

    /* stars — nearer ones bigger + brighter; each fades in on its own beat */
    ctx.fillStyle = 'rgb(' + ink + ')';
    for (var s2 = 0; s2 < COUNT; s2++) {
      var p = proj[s2], d2 = (p.z + 1) / 2;
      var rv = reduce ? 1 : Math.max(0, Math.min(1, (elapsed - stars[s2].t * REVEAL) / FADE));
      if (rv <= 0) continue;
      ctx.globalAlpha = (0.13 + d2 * 0.55) * rv;
      ctx.beginPath(); ctx.arc(p.X, p.Y, (0.4 + d2 * 1.4) * p.s * (0.55 + 0.45 * rv), 0, Math.PI * 2); ctx.fill();
    }

    /* hover: light up the constellation (desktop-wide cursor only — labels there sit on their 3D points) */
    if (hovered >= 0 && canHover && !mqMobile.matches) {
      var ln = lnodes[hovered], lp = project(ln);
      ctx.lineWidth = 1;
      for (var k = 0; k < ln.near.length; k++) {
        var sp = proj[ln.near[k]];
        ctx.strokeStyle = 'rgba(' + accentRGB + ',0.5)';
        ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.moveTo(lp.X, lp.Y); ctx.lineTo(sp.X, sp.Y); ctx.stroke();
        ctx.fillStyle = 'rgba(' + accentRGB + ',0.85)';
        ctx.beginPath(); ctx.arc(sp.X, sp.Y, 1.7 * sp.s, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(' + accentRGB + ',0.95)';
      ctx.beginPath(); ctx.arc(lp.X, lp.Y, 3.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    var mobile = mqMobile.matches;

    if (mobile) {
      /* pressed (touch) or hovered (small-screen mouse) → light up that label's stars */
      var activeNav = (!canHover) ? pressNav
        : (hovered >= 0 && lnodes[hovered] ? lnodes[hovered].navIndex : -1);
      if (activeNav >= 0 && activeNav < navLabels.length) {
        var alp = proj[navAnchors[activeNav]];
        ctx.lineWidth = 1; ctx.globalAlpha = 1;
        for (var ak = 0; ak < anchorNear[activeNav].length; ak++) {
          var asp = proj[anchorNear[activeNav][ak]];
          ctx.strokeStyle = 'rgba(' + accentRGB + ',0.55)';
          ctx.beginPath(); ctx.moveTo(alp.X, alp.Y); ctx.lineTo(asp.X, asp.Y); ctx.stroke();
          ctx.fillStyle = 'rgba(' + accentRGB + ',0.85)';
          ctx.beginPath(); ctx.arc(asp.X, asp.Y, 1.9, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = 'rgba(' + accentRGB + ',0.95)';
        ctx.beginPath(); ctx.arc(alp.X, alp.Y, 3, 0, Math.PI * 2); ctx.fill();
      }

      /* each label pinned to its anchor star — moves with the drifting cluster */
      ctx.fillStyle = 'rgb(' + ink + ')';
      for (var m = 0; m < navLabels.length; m++) {
        var ap = proj[navAnchors[m]];
        var an = (ap.z + 1) / 2;                       /* 0 far .. 1 near */
        ctx.globalAlpha = (0.5 + an * 0.5) * gRev;
        ctx.beginPath(); ctx.arc(ap.X, ap.Y, 1.6 + an * 1.5, 0, Math.PI * 2); ctx.fill();
        var em = navLabels[m].el;
        em.style.left = ap.X + 'px';
        em.style.top = ap.Y + 'px';
        em.style.transform = 'translate(-50%,-50%) scale(' + (0.85 + an * 0.35).toFixed(3) + ')';
        em.style.opacity = (Math.max(0.45, Math.min(1, 0.55 + an * 0.5)) * gRev).toFixed(3);
        em.style.zIndex = Math.round(ap.s * 100);
      }
      ctx.globalAlpha = 1;
    } else {
      /* desktop: labels ride the rotating 3D cloud, scaled by depth */
      for (var l = 0; l < lnodes.length; l++) {
        var lp2 = project(lnodes[l]), el = lnodes[l].el;
        var norm = (lp2.s - 0.72) / (1.63 - 0.72);   /* 0 far .. 1 near */
        el.style.left = lp2.X + 'px';
        el.style.top = lp2.Y + 'px';
        el.style.transform = 'translate(-50%,-50%) scale(' + (0.78 + norm * 0.6).toFixed(3) + ')';
        el.style.opacity = (Math.max(0.18, Math.min(1, 0.34 + norm * 0.62)) * gRev).toFixed(3);
        el.style.zIndex = Math.round(lp2.s * 100);
      }
    }
  }

  /* desktop: hover tilts the cloud toward the cursor */
  function onMove(ev) {
    if (!canHover || !animating()) return;
    var r = cv.getBoundingClientRect();
    var nx = (ev.clientX - r.left) / r.width;
    var ny = (ev.clientY - r.top) / r.height;
    tAy = (nx - 0.5) * 0.9;      /* look left/right */
    tAx = (ny - 0.5) * -0.7;     /* tilt up/down */
  }

  /* touch (and mouse-drag): drag to spin the cluster */
  var hero = document.querySelector('.hero');
  hero.addEventListener('pointerdown', function (ev) {
    if (canHover) return;         /* desktop uses hover, not drag */
    dragging = true;
    dragSX = ev.clientX; dragSY = ev.clientY; dragAy = offAy; dragAx = offAx;
  });
  /* drag-spin on touch (the cursor spotlight lives in theme.js) */
  window.addEventListener('pointermove', function (ev) {
    if (!dragging || !animating()) return;
    var dx = (ev.clientX - dragSX) / Math.max(1, W);
    var dy = (ev.clientY - dragSY) / Math.max(1, H);
    tAy = dragAy + dx * 3.6;      /* horizontal drag → spin (more sensitive) */
    tAx = dragAx - dy * 2.6;      /* vertical drag → tilt */
  });
  function endDrag() { dragging = false; pressNav = -1; }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  lnodes.forEach(function (ln, idx) {
    function on() { if (canHover) hovered = idx; }   /* cursor devices only */
    function off2() { hovered = -1; }
    ln.el.addEventListener('mouseenter', on);
    ln.el.addEventListener('mouseleave', off2);
    ln.el.addEventListener('focus', on);
    ln.el.addEventListener('blur', off2);
    /* touch: while pressed, light up this label's stars; released → gone */
    if (ln.navIndex >= 0) {
      ln.el.addEventListener('pointerdown', function () { if (!canHover) pressNav = ln.navIndex; });
    }
  });

  var running = false;
  function loop() {
    if (!animating() || !heroVisible) { running = false; return; }
    if (!dragging) autoYaw += mqMobile.matches ? 0.0009 : 0.0016;   /* drift; pause while dragging */
    offAy += (tAy - offAy) * (dragging ? 0.18 : 0.05);
    offAx += (tAx - offAx) * (dragging ? 0.18 : 0.05);
    draw();
    requestAnimationFrame(loop);
  }
  function ensureEngine() {
    if (animating() && heroVisible) {
      if (!running) { running = true; requestAnimationFrame(loop); }
    } else {
      running = false;
      draw();                    /* one calm static frame */
    }
  }

  /* pause the animation whenever the sky is scrolled out of view — saves battery */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      ensureEngine();
    }, { threshold: 0 });
    io.observe(document.querySelector('.hero'));
  }

  window.addEventListener('resize', function () { resize(); ensureEngine(); });
  if (mqMobile.addEventListener) {
    mqMobile.addEventListener('change', function () { resize(); ensureEngine(); });
  }
  document.querySelector('.hero').addEventListener('pointermove', onMove);
  resize();
  ensureEngine();
})();
