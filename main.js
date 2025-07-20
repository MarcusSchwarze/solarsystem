/* --------------------------------------------------
   Sonnensystem‑Demo (modular)
   Szene aufbauen, Animation steuern
-------------------------------------------------- */
import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js?module';
import { OrbitControls }  from 'https://unpkg.com/three@0.164.0/examples/jsm/controls/OrbitControls.js?module';
import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three@0.164.0/examples/jsm/renderers/CSS2DRenderer.js?module';

import { AU, DEG, INC_SCALE, sphere, kepler, tex } from './utils.js';
import { planets } from './planets.js';

/* --------------------------------------------------
   Grund‑Setup
-------------------------------------------------- */
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 20_000);
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

/* 2D‑Labels */
const labels = new CSS2DRenderer();
labels.setSize(innerWidth, innerHeight);
labels.domElement.style.position = 'absolute';
labels.domElement.style.top      = 0;
labels.domElement.style.pointerEvents = 'none';
document.body.appendChild(labels.domElement);

/* Kamera‑Steuerung */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping       = true;
controls.screenSpacePanning  = true;
controls.minDistance         = 50;
controls.maxDistance         = 6000;
camera.position.set(0, 0, 1800);
controls.target.set(0, 0, 0);

/* Lichtquellen */
scene.add(new THREE.AmbientLight(0xffffff, 0.25));
const sunLight = new THREE.PointLight(0xffffff, 3000, 4000);
sunLight.decay = 2;
scene.add(sunLight);

/* Sternhimmel */
(function(){
  const g   = new THREE.SphereGeometry(0.4, 4, 2);
  const m   = new THREE.MeshBasicMaterial({ color:0xffffff });
  const inst = new THREE.InstancedMesh(g, m, 5000);
  const mx   = new THREE.Matrix4();
  for(let i = 0; i < 5000; i++){
    mx.makeTranslation(
      (Math.random() - 0.5) * 3500,
      (Math.random() - 0.5) * 3500,
      (Math.random() - 0.5) * 3500,
    );
    inst.setMatrixAt(i, mx);
  }
  scene.add(inst);
})();

/* Sonne */
const sun = sphere(15, null, 0xffdd66);
sun.material = new THREE.MeshBasicMaterial({ color:0xffdd66 });
scene.add(sun);
sun.add(new CSS2DObject(Object.assign(
  document.createElement('div'),
  { className:'label', textContent:'Sonne' },
)));

/* --------------------------------------------------
   Planeten & Monde erzeugen
-------------------------------------------------- */
const SIZE_SCALE = 3;        // Planetenradius‑Faktor (Demo Mode)

const bodies = [];           // Planetengruppen + Monde

planets.forEach(p => {
  const group = new THREE.Object3D();
  scene.add(group);

  /* Planetenkugel */
  const pMesh = sphere(p.size * SIZE_SCALE, p.tex, p.col);
  pMesh.rotation.z = p.tilt * DEG;
  pMesh.add(new CSS2DObject(Object.assign(
    document.createElement('div'),
    { className:'label', textContent:p.n },
  )));
  group.add(pMesh);

  /* Saturn‑Ringe */
  if (p.rings){
    const rGeo = new THREE.RingGeometry(
      p.rings.inner * SIZE_SCALE,
      p.rings.outer * SIZE_SCALE,
      128,
    );
    const rMat = new THREE.MeshBasicMaterial({
      map:       tex(p.rings.color),
      alphaMap:  tex(p.rings.alpha),
      side:      THREE.DoubleSide,
      transparent:true,
    });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.rotation.x = -Math.PI / 2;
    ring.rotation.z = p.tilt * DEG;
    group.add(ring);
  }

  /* Monde */
  const moons = [];
  p.m.forEach(m => {
    const mMesh = sphere(m.size * SIZE_SCALE, m.tex, m.col);
    mMesh.add(new CSS2DObject(Object.assign(
      document.createElement('div'),
      { className:'label', textContent:m.n, style:'font-size:10px' },
    )));
    group.add(mMesh);
    moons.push({ ...m, mesh:mMesh });
  });

  bodies.push({ p, group, mesh:pMesh, moons });
});

/* --------------------------------------------------
   HUD initialisieren
-------------------------------------------------- */
const sel        = document.getElementById('target');
const speedSlider= document.getElementById('speed');
const speedVal   = document.getElementById('speedValue');
const lightSlider= document.getElementById('light');
const lightVal   = document.getElementById('lightValue');
const realismBox = document.getElementById('realism');

bodies.forEach(b => {
  sel.add(new Option(b.p.n, b.p.n));
  b.moons.forEach(m => sel.add(new Option(`  ${m.n}`, `${b.p.n}|${m.n}`)));
});
sel.selectedIndex = 2;

/* Geschwindigkeits‑Slider */
let speed = +speedSlider.value;
speedSlider.oninput = () => {
  speed = +speedSlider.value;
  speedVal.textContent = `${speed} d/s`;
};
speedSlider.oninput();

/* Lichtregler */
sunLight.intensity = +lightSlider.value;
lightVal.textContent = lightSlider.value;
lightSlider.oninput = () => {
  sunLight.intensity = +lightSlider.value;
  lightVal.textContent = lightSlider.value;
};

/* --------------------------------------------------
   Flug‑ und Follow‑Logik
-------------------------------------------------- */
let fly = false, align = false, follow = false;
let tFlyStart, camStart, followRadius = 50, followAngle = 0;
let followTarget, desiredOffset;
const ALIGN_SPEED = 0.5;   // rad/s


const flyBtn = document.getElementById('flyBtn');

/* Eine einzige Funktion übernimmt den Flug zum aktuell gewählten Ziel */
function flyToSelection(){
  const v = sel.value.split('|');
  const b = bodies.find(x => x.p.n === v[0]);

  let dest, r;
  if (v.length === 1){
    dest         = b.group.position.clone();
    r            = b.p.size * SIZE_SCALE;
    followTarget = b.group;
  } else {
    const m      = b.moons.find(mm => mm.n === v[1]);
    dest         = b.group.position.clone().add(m.mesh.position);
    r            = m.size * SIZE_SCALE;
    followTarget = m.mesh;
  }

  followRadius = r * 6;

  camStart = camera.position.clone();
  const dir   = camera.position.clone().sub(dest).normalize();
  const camEnd= dest.clone().add(dir.multiplyScalar(followRadius));

  tFlyStart   = performance.now();
  fly         = true;
  align       = false;
  follow      = true;
  followAngle = 0;
  desiredOffset = null;

  (function step(){
    if (!fly) return;
    const t = Math.min(1, (performance.now() - tFlyStart) / 4000);
    camera.position.lerpVectors(camStart, camEnd, t);
    controls.target.lerpVectors(controls.target, dest, t);
    controls.update();
    if (t < 1) requestAnimationFrame(step);
    else { fly = false; align = true; }
  })();
}

/* Button und Dropdown lösen das gleiche Verhalten aus */
flyBtn.onclick = flyToSelection;
sel.onchange   = flyToSelection;


/* Zoom im Follow‑Modus */
window.addEventListener('wheel', e => {
  if (follow){
    followRadius *= 1 + Math.sign(e.deltaY) * 0.1;
    followRadius  = Math.max(5, Math.min(2000, followRadius));
  }
},{ passive:true });

/* ESC beendet Follow/Align */
window.addEventListener('keydown', e => {
  if (e.key === 'Escape'){
    follow = false;
    align  = false;
  }
});

/* --------------------------------------------------
   Simulation & Render‑Loop
-------------------------------------------------- */
const J2000  = Date.UTC(2000,0,1,12);
const MSDAY  = 86_400_000;
const clock  = new THREE.Clock();
let simTime  = 0;

const dateBox = document.getElementById('dateBox');

function animate(){
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  simTime += dt * speed;

  /* Positionen aktualisieren */
  bodies.forEach(({ p, group, mesh, moons }) => {
    const M = (p.M0 * DEG) + simTime * 2 * Math.PI / p.P;
    group.position.copy(kepler(
      p.a * AU,
      p.e,
      p.i * DEG,
      p.Ω * DEG,
      p.ω * DEG,
      M,
    ));
    mesh.rotation.y = simTime / p.rot * 2 * Math.PI;

    moons.forEach(m => {
      const ang = simTime * 2 * Math.PI / m.P;
      const inc = (m.inc || 0) * DEG;
      m.mesh.position.set(
        m.a * Math.cos(ang),
        m.a * Math.sin(ang) * Math.sin(inc) * INC_SCALE,
        m.a * Math.sin(ang) * Math.cos(inc),
      );
    });
  });

  /* Kamera‑Logik */
  const tgt = followTarget ? followTarget.getWorldPosition(new THREE.Vector3()) : null;

  if (align && tgt){
    /* Nachflugphase: Kamera hinter Planeten zur Sonne ausrichten */
    const sunDir = tgt.clone().sub(sun.position).normalize();
    const targetOffset = sunDir.clone().negate().multiplyScalar(followRadius);
    if (!desiredOffset){
      desiredOffset = camera.position.clone().sub(tgt).setLength(followRadius);
    }
    desiredOffset.lerp(targetOffset, ALIGN_SPEED * dt);
    camera.position.copy(tgt.clone().add(desiredOffset));
    if (desiredOffset.angleTo(targetOffset) < 0.02) align = false;
    controls.target.copy(tgt);
    controls.update();
  } else if (follow && tgt){
    const sunDir  = tgt.clone().sub(sun.position).normalize();
    const offset  = sunDir.clone().negate().multiplyScalar(followRadius)
                               .applyAxisAngle(sunDir, followAngle);
    followAngle += 0.05 * DEG * dt * speed / 400;
    camera.position.copy(tgt.clone().add(offset));
    controls.target.copy(tgt);
    controls.update();
  } else if (!fly){
    controls.update();
  }

  /* Datumsausgabe */
  dateBox.textContent = new Date(J2000 + simTime * MSDAY)
                          .toISOString()
                          .replace('T',' ')
                          .substring(0,19) + ' UTC';

  renderer.render(scene, camera);
  labels.render(scene, camera);
}

animate();

/* Resize Listener */
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  labels.setSize(innerWidth, innerHeight);
});
