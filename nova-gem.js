/* ════════════════════════════════════════════════════════════════
   nova-gem.js — Nova as a living 3D gem (vanilla three.js, ES module).

   Mounts into any <canvas data-nova-gem> and gives Nova a glass-icosahedron
   body whose MOOD is driven by real data (not random): happy + a spark when
   you've hit a PR, sleepy & dim when recovery is low, a calm "thinking"
   breath on demand, idle otherwise. Nova's real dark eyes + catch-light are
   painted on a steady front plane so the gem spins behind a familiar face.

   Premium finish: transparency-safe glow (emissive + additive halo + the
   host's CSS aura), NOT post-processing bloom — bloom fights the alpha canvas
   and would black-box the page. Pauses when the tab is hidden and disposes
   itself when its canvas leaves the DOM (frees the WebGL context).

   API:  window.NovaGem.scan()            mount any unmounted gem canvases
         window.NovaGem.setMood(name)     drive every live gem ('idle'|
                                          'happy'|'sleepy'|'thinking')
         window.NovaGem.restingMood()     {mood,label} from on-device data
   ════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';

const MOODS = {
  idle:     { spin: 0.28, glow: 0.55, wob: 0.9,  scale: 1.00, hue: 0x3FE0B0, wire: 0.60 },
  happy:    { spin: 0.80, glow: 1.10, wob: 1.4,  scale: 1.05, hue: 0x63F2C8, wire: 0.82 },
  sleepy:   { spin: 0.09, glow: 0.22, wob: 0.35, scale: 0.975, hue: 0x2BB392, wire: 0.28 },
  thinking: { spin: 0.40, glow: 0.72, wob: 0.6,  scale: 1.00, hue: 0x3FE0B0, wire: 0.64 },
};

const handles = [];   // every live gem, so setMood can drive them all
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function dk(off){ const d = new Date(); d.setDate(d.getDate() + (off || 0)); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function ls(k){ try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }

/* Resting mood from real data on this device. */
function restingMood(){
  let rec = null, pr = false;
  const s = ls('sleep:logs'); if (Array.isArray(s)) { const r = s.filter(e => e && e.recovery != null); if (r.length) rec = +r[r.length-1].recovery; }
  const w = ls('po_workouts'); if (Array.isArray(w)) { const cut = dk(-2); pr = w.some(x => x && x.prs && x.prs.length && x.date >= cut); }
  if (pr) return { mood: 'happy', label: 'you hit a PR' };
  if (rec != null && rec < 55) return { mood: 'sleepy', label: 'recovery ' + Math.round(rec) };
  return { mood: 'idle', label: '' };
}

function revealFallback(canvas){
  try {
    canvas.style.display = 'none';
    const fb = canvas.parentNode && canvas.parentNode.querySelector('.nv-gem-fallback');
    if (fb) fb.style.display = 'flex';
  } catch (e) {}
}

function mount(canvas){
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) { revealFallback(canvas); return null; }

  // WebGL is live → show the gem, retire the flat fallback.
  canvas.style.display = 'block';
  const fb = canvas.parentNode && canvas.parentNode.querySelector('.nv-gem-fallback');
  if (fb) fb.style.display = 'none';

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.05, 4.7); camera.lookAt(0, 0, 0);

  /* Procedural emerald environment (so glass has something to refract). */
  const envCanvas = document.createElement('canvas'); envCanvas.width = 1024; envCanvas.height = 512;
  const ex = envCanvas.getContext('2d');
  ex.fillStyle = '#08170f'; ex.fillRect(0, 0, 1024, 512);
  const g1 = ex.createRadialGradient(300, 170, 0, 300, 170, 520);
  g1.addColorStop(0, 'rgba(180,255,220,1)'); g1.addColorStop(0.4, 'rgba(63,224,176,0.5)'); g1.addColorStop(1, 'rgba(63,224,176,0)');
  ex.fillStyle = g1; ex.fillRect(0, 0, 1024, 512);
  const g2 = ex.createRadialGradient(760, 210, 0, 760, 210, 480);
  g2.addColorStop(0, 'rgba(255,240,210,0.95)'); g2.addColorStop(0.4, 'rgba(255,225,180,0.4)'); g2.addColorStop(1, 'rgba(255,225,180,0)');
  ex.fillStyle = g2; ex.fillRect(0, 0, 1024, 512);
  const g3 = ex.createRadialGradient(520, 470, 0, 520, 470, 380);
  g3.addColorStop(0, 'rgba(150,135,255,0.55)'); g3.addColorStop(1, 'rgba(150,135,255,0)'); // violet underglow = Nova identity
  ex.fillStyle = g3; ex.fillRect(0, 0, 1024, 512);
  const envSrc = new THREE.CanvasTexture(envCanvas);
  envSrc.mapping = THREE.EquirectangularReflectionMapping; envSrc.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(envSrc).texture;
  envSrc.dispose();

  const geo = new THREE.IcosahedronGeometry(1, 0);
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#EAFFF6'),
    transmission: 0.86, thickness: 1.7, ior: 1.55, roughness: 0.07, metalness: 0,
    attenuationColor: new THREE.Color('#3FE0B0'), attenuationDistance: 1.1,
    clearcoat: 0.7, clearcoatRoughness: 0.05, envMapIntensity: 2.7,
    transparent: true, side: THREE.DoubleSide,
    emissive: new THREE.Color('#0d4a36'), emissiveIntensity: 0.55,
  });
  const gem = new THREE.Mesh(geo, mat); scene.add(gem);

  const wireMat = new THREE.LineBasicMaterial({ color: 0xa7f3d0, transparent: true, opacity: 0.6, depthTest: false });
  const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), wireMat);
  wire.renderOrder = 2; wire.scale.setScalar(1.002); gem.add(wire);

  /* Soft additive halo behind the gem — the transparency-safe "bloom". */
  const haloCanvas = document.createElement('canvas'); haloCanvas.width = haloCanvas.height = 256;
  const hx = haloCanvas.getContext('2d');
  const hg = hx.createRadialGradient(128, 128, 0, 128, 128, 128);
  hg.addColorStop(0, 'rgba(110,231,183,0.55)'); hg.addColorStop(0.4, 'rgba(63,224,176,0.28)'); hg.addColorStop(1, 'rgba(63,224,176,0)');
  hx.fillStyle = hg; hx.fillRect(0, 0, 256, 256);
  const haloTex = new THREE.CanvasTexture(haloCanvas); haloTex.colorSpace = THREE.SRGBColorSpace;
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2),
    new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, opacity: 0.5 }));
  halo.position.set(0, 0, -0.4); scene.add(halo);

  /* Nova's real face — dark eyes + white catch-light on a steady front plane. */
  const faceCanvas = document.createElement('canvas'); faceCanvas.width = faceCanvas.height = 256;
  const fx = faceCanvas.getContext('2d');
  const faceTex = new THREE.CanvasTexture(faceCanvas); faceTex.colorSpace = THREE.SRGBColorSpace;
  const faceMat = new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false, depthTest: false });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), faceMat);
  face.position.set(0, 0, 1.02); face.renderOrder = 3; scene.add(face);

  const DARK = '#04130D';
  const EYE_L = 103, EYE_R = 153, EYE_Y = 120;
  function eyeCircle(x, y, r){ fx.beginPath(); fx.arc(x, y, r, 0, Math.PI*2); fx.fill();
    fx.save(); fx.fillStyle = 'rgba(255,255,255,.9)'; fx.beginPath(); fx.arc(x - r*0.28, y - r*0.34, r*0.28, 0, Math.PI*2); fx.fill(); fx.restore(); }
  function drawFace(name, t){
    fx.clearRect(0, 0, 256, 256);
    fx.fillStyle = DARK; fx.strokeStyle = DARK; fx.lineWidth = 8; fx.lineCap = 'round'; fx.lineJoin = 'round';
    const blink = (Math.sin(t * 0.8) > 0.986) ? 0.12 : 1;
    if (name === 'happy'){
      fx.beginPath(); fx.arc(EYE_L, EYE_Y + 5, 14, Math.PI*1.12, Math.PI*1.88); fx.stroke();
      fx.beginPath(); fx.arc(EYE_R, EYE_Y + 5, 14, Math.PI*1.12, Math.PI*1.88); fx.stroke();
      fx.beginPath(); fx.arc(128, EYE_Y + 40, 24, Math.PI*0.18, Math.PI*0.82); fx.stroke();       // smile
    } else if (name === 'sleepy'){
      fx.beginPath(); fx.moveTo(EYE_L-13, EYE_Y); fx.lineTo(EYE_L+13, EYE_Y); fx.stroke();
      fx.beginPath(); fx.moveTo(EYE_R-13, EYE_Y); fx.lineTo(EYE_R+13, EYE_Y); fx.stroke();
      const zy = 78 - ((t * 9) % 22); fx.save(); fx.globalAlpha = 0.75; fx.lineWidth = 6;
      fx.beginPath(); fx.moveTo(176, zy); fx.lineTo(192, zy); fx.lineTo(176, zy+13); fx.lineTo(192, zy+13); fx.stroke(); fx.restore();
    } else {
      const r = 10.5, sy = blink;
      fx.save(); fx.translate(EYE_L, EYE_Y); fx.scale(1, sy); eyeCircle(0, 0, r); fx.restore();
      fx.save(); fx.translate(EYE_R, EYE_Y); fx.scale(1, sy); eyeCircle(0, 0, r); fx.restore();
      if (name === 'thinking'){
        for (let i = 0; i < 3; i++){ const on = (Math.floor(t * 3) % 3) === i; fx.save(); fx.globalAlpha = on ? 1 : 0.3;
          fx.beginPath(); fx.arc(106 + i*22, EYE_Y + 46, on ? 5 : 3.5, 0, Math.PI*2); fx.fill(); fx.restore(); }
      }
    }
    faceTex.needsUpdate = true;
  }

  /* Happy spark burst. */
  const P = 60, pPos = new Float32Array(P*3), pVel = new Float32Array(P*3); let pLife = 0;
  const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x9BF3D0, size: 0.05, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  const points = new THREE.Points(pGeo, pMat); scene.add(points);
  function burst(){
    for (let i = 0; i < P; i++){ pPos[i*3]=pPos[i*3+1]=pPos[i*3+2]=0;
      const th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1), sp = 1.5 + Math.random()*1.8;
      pVel[i*3]=Math.sin(ph)*Math.cos(th)*sp; pVel[i*3+1]=Math.cos(ph)*sp; pVel[i*3+2]=Math.sin(ph)*Math.sin(th)*sp; }
    pLife = 1;
  }

  scene.add(new THREE.AmbientLight(0x1a3a2c, 0.18));
  const key = new THREE.DirectionalLight(0xFFE9C6, 3.8); key.position.set(2.6, 1.9, 2.2); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9B8CFF, 2.2); rim.position.set(-2.8, 1.2, -2.0); scene.add(rim);
  const fill = new THREE.DirectionalLight(0x88c4b0, 0.6); fill.position.set(0, -2.5, 1); scene.add(fill);

  function resize(){
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);

  const tilt = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  const onMove = e => { const x = e.touches ? (e.touches[0] && e.touches[0].clientX) : e.clientX, y = e.touches ? (e.touches[0] && e.touches[0].clientY) : e.clientY;
    if (x == null) return; tilt.x = ((y / window.innerHeight) * 2 - 1) * 0.18; tilt.y = ((x / window.innerWidth) * 2 - 1) * 0.18; };
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });

  /* Tap the gem → a quick happy react (pop + spark), then back to resting. */
  let poke = 0;
  const onTap = () => { poke = 1; if (!reduce) burst(); const prev = handle.mood; handle.setMood('happy'); setTimeout(() => { if (handle.alive) handle.setMood(prev === 'happy' ? 'idle' : prev); }, 1500); };
  canvas.addEventListener('click', onTap);

  const rest = restingMood();
  let moodName = rest.mood;
  let m = Object.assign({}, MOODS[moodName]);
  let burstPending = (moodName === 'happy');
  const _c = new THREE.Color();
  const clock = new THREE.Clock();
  let raf = 0, lastFace = -1;

  function frame(){
    // self-dispose when the canvas leaves the DOM (e.g. intro replaced by chat)
    if (!canvas.isConnected){ destroy(); return; }
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    const tgt = MOODS[moodName];
    const k = 1 - Math.pow(0.001, dt);
    m.spin += (tgt.spin-m.spin)*k; m.glow += (tgt.glow-m.glow)*k; m.wob += (tgt.wob-m.wob)*k;
    m.scale += (tgt.scale-m.scale)*k; m.wire += (tgt.wire-m.wire)*k;
    _c.setHex(tgt.hue); mat.attenuationColor.lerp(_c, k);

    if (!reduce){
      gem.rotation.y += m.spin * dt;
      gem.rotation.x = Math.sin(t * 0.6) * 0.10 * m.wob;
      cur.x += (tilt.x - cur.x) * 0.06; cur.y += (tilt.y - cur.y) * 0.06;
      gem.rotation.x += cur.x; gem.rotation.z = cur.y * 0.4;
    }
    // always-alive: slow emissive shimmer + thinking breath + tap pop
    poke *= 0.92;
    const breath = (moodName === 'thinking' && !reduce) ? Math.sin(t*3.0)*0.03 : 0;
    gem.scale.setScalar(m.scale + breath + poke*0.06);
    const shimmer = reduce ? 0 : Math.sin(t*1.3)*0.06;
    mat.emissiveIntensity = m.glow + shimmer + (moodName==='thinking'?Math.sin(t*3.0)*0.16:0) + poke*0.5;
    wireMat.opacity = m.wire; halo.material.opacity = 0.42 + m.glow*0.18 + poke*0.3;

    if (burstPending){ burstPending = false; if (!reduce) burst(); }
    if (pLife > 0){ pLife -= dt/1.3;
      for (let i=0;i<P;i++){ pPos[i*3]+=pVel[i*3]*dt; pPos[i*3+1]+=(pVel[i*3+1]-1.4*(1-pLife))*dt; pPos[i*3+2]+=pVel[i*3+2]*dt; }
      pGeo.attributes.position.needsUpdate = true; pMat.opacity = Math.max(0, pLife);
    } else pMat.opacity = 0;

    if (t - lastFace > 0.12){ lastFace = t; drawFace(moodName, t); }
    renderer.render(scene, camera);
  }

  function start(){ if (!raf && document.visibilityState !== 'hidden'){ clock.getDelta(); frame(); } }
  function stop(){ if (raf){ cancelAnimationFrame(raf); raf = 0; } }
  const onVis = () => { if (document.visibilityState === 'hidden') stop(); else start(); };
  document.addEventListener('visibilitychange', onVis);

  let disposed = false;
  function destroy(){
    if (disposed) return; disposed = true; handle.alive = false; stop();
    try { ro.disconnect(); } catch(e){}
    window.removeEventListener('mousemove', onMove); window.removeEventListener('touchmove', onMove);
    document.removeEventListener('visibilitychange', onVis);
    const i = handles.indexOf(handle); if (i >= 0) handles.splice(i, 1);
    try {
      geo.dispose(); mat.dispose(); wire.geometry.dispose(); wireMat.dispose();
      faceTex.dispose(); faceMat.dispose(); haloTex.dispose(); halo.material.dispose(); halo.geometry.dispose();
      pGeo.dispose(); pMat.dispose(); face.geometry.dispose();
      if (scene.environment) scene.environment.dispose(); pmrem.dispose();
      renderer.dispose(); renderer.forceContextLoss();
    } catch (e) {}
  }

  const handle = {
    alive: true, get mood(){ return moodName; },
    setMood(name){ if (!MOODS[name] || name === moodName) return; if (name === 'happy') burstPending = true; moodName = name; },
    destroy
  };
  handles.push(handle);
  drawFace(moodName, 0);
  start();
  return handle;
}

function scan(){
  const list = document.querySelectorAll('canvas[data-nova-gem]:not([data-nova-mounted])');
  list.forEach(c => { c.setAttribute('data-nova-mounted', '1'); try { mount(c); } catch (e) { revealFallback(c); } });
}

window.NovaGem = {
  scan,
  mount,
  restingMood,
  setMood(name){ handles.forEach(h => { try { h.setMood(name); } catch (e) {} }); }
};

// self-mount anything already in the DOM
scan();
