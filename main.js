
/* --------------------------------------------------
   Sonnensystem – realistische Sonne mit Shader, Korona,
   Lensflare und Partikel-Flares. Buttons/Checkboxen entfernt.
-------------------------------------------------- */
import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js?module';
import { OrbitControls }  from 'https://unpkg.com/three@0.164.0/examples/jsm/controls/OrbitControls.js?module';
import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three@0.164.0/examples/jsm/renderers/CSS2DRenderer.js?module';
import { Lensflare, LensflareElement } from 'https://unpkg.com/three@0.164.0/examples/jsm/objects/Lensflare.js?module';
import { gsap } from 'https://cdn.skypack.dev/gsap@3';

import { AU, DEG, INC_SCALE, sphere, kepler, tex } from './utils.js';
import { planets } from './planets.js';

/* --------------------------------------------------
   Grund-Setup
-------------------------------------------------- */
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 20_000);
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

/* 2D-Labels */
const labels = new CSS2DRenderer();
labels.setSize(innerWidth, innerHeight);
labels.domElement.style.position = 'absolute';
labels.domElement.style.top      = 0;
labels.domElement.style.pointerEvents = 'none';
document.body.appendChild(labels.domElement);

/* Kamera */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping=true;
controls.minDistance=50;
controls.maxDistance=6000;
camera.position.set(0,0,1800);
controls.target.set(0,0,0);

/* Lichtquellen */
scene.add(new THREE.AmbientLight(0xffffff,0.25));
const sunLight = new THREE.PointLight(0xffffff,3000,4000);
sunLight.decay=2;
scene.add(sunLight);

/* Sternhimmel (Instanced) */
(()=>{
  const g=new THREE.SphereGeometry(0.4,4,2);
  const m=new THREE.MeshBasicMaterial({color:0xffffff});
  const inst=new THREE.InstancedMesh(g,m,5000);
  const mx=new THREE.Matrix4();
  for(let i=0;i<5000;i++){
    mx.makeTranslation((Math.random()-0.5)*3500,(Math.random()-0.5)*3500,(Math.random()-0.5)*3500);
    inst.setMatrixAt(i,mx);
  }
  scene.add(inst);
})();

/* --------------------------------------------------
   Sonne – Shader-Kern, Korona, Lensflare, Partikel
-------------------------------------------------- */

// GLSL Simplex noise (Ashima)
const snoise = `
vec3 mod289(vec3 x){ return x - floor(x/289.0)*289.0; }
vec4 mod289(vec4 x){ return x - floor(x/289.0)*289.0; }
vec4 perm(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = perm( perm( perm(
            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  vec3 ns = 0.142857142857 * vec3(D.w,D.y,D.z) - 0.5;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const sunUniforms = {
  time: { value: 0 },
  color: { value: new THREE.Color(0xffcc55) },
};

const sunMat = new THREE.ShaderMaterial({
  uniforms: sunUniforms,
  vertexShader: `
    varying vec2 vUv;
    uniform float time;
    ${snoise}
    void main(){
      vUv = uv;
      vec3 p = position + normal * 0.4 * snoise(vec3(uv*6.0, time*0.5));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
    }`,
  fragmentShader: `
    varying vec2 vUv;
    uniform float time;
    uniform vec3 color;
    ${snoise}
    void main(){
      float n = snoise(vec3(vUv*6.0, time*0.5));
      float glow = smoothstep(0.2,1.0,n);
      gl_FragColor = vec4(color*glow,1.0);
    }`,
});

const sunCore = new THREE.Mesh(
  new THREE.SphereGeometry(15,128,64),
  sunMat
);
scene.add(sunCore);

/* Korona */
const corona = new THREE.Mesh(
  new THREE.SphereGeometry(18,32,16),
  new THREE.MeshBasicMaterial({
    color:0xffdd88,
    transparent:true,
    opacity:0.35,
    blending:THREE.AdditiveBlending,
    side:THREE.BackSide
  })
);
scene.add(corona);

/* Lensflare */
const flareTex = new THREE.TextureLoader().load('./textures/flare.png');
const lensflare = new Lensflare();
lensflare.addElement(new LensflareElement(flareTex,700,0));
lensflare.addElement(new LensflareElement(flareTex,250,0.2));
lensflare.addElement(new LensflareElement(flareTex,120,0.6));
sunCore.add(lensflare);

/* Partikel-Flares */
const flareGeo = new THREE.PlaneGeometry(4,4);
const flareMatBase = new THREE.MeshBasicMaterial({
  map:flareTex,
  transparent:true,
  blending:THREE.AdditiveBlending,
  depthWrite:false
});
function spawnFlare(){
  const sprite = new THREE.Mesh(flareGeo, flareMatBase.clone());
  const dir = new THREE.Vector3().randomDirection();
  sprite.position.copy(dir.multiplyScalar(18));
  sprite.lookAt(sunCore.position);
  scene.add(sprite);
  gsap.fromTo(sprite.scale,{x:0.1,y:0.1},{x:2,y:2,duration:1.2});
  gsap.to(sprite.material,{opacity:0,duration:1.2,onComplete:()=>scene.remove(sprite)});
}
setInterval(()=>spawnFlare(),3000+Math.random()*2000);

/* --------------------------------------------------
   Planeten & Monde (wie bisher)
-------------------------------------------------- */
const SIZE_SCALE=3;
const bodies=[];
const bodyIndex=new Map();

planets.forEach(p=>{
  const group=new THREE.Object3D();
  scene.add(group);
  const pMesh=sphere(p.size*SIZE_SCALE,p.tex,p.col);
  pMesh.rotation.z=p.tilt*DEG;
  pMesh.userData.bodyId=p.n;
  pMesh.add(new CSS2DObject(Object.assign(
    document.createElement('div'),
    {className:'label',textContent:p.n},
  )));
  group.add(pMesh);
  if(p.rings){
    const rGeo=new THREE.RingGeometry(
      p.rings.inner*SIZE_SCALE,
      p.rings.outer*SIZE_SCALE,
      128);
    const rMat=new THREE.MeshBasicMaterial({
      map:tex(p.rings.color),
      alphaMap:tex(p.rings.alpha),
      side:THREE.DoubleSide,
      transparent:true});
    const ring=new THREE.Mesh(rGeo,rMat);
    ring.rotation.x=-Math.PI/2;
    ring.rotation.z=p.tilt*DEG;
    group.add(ring);
  }
  const moons=[];
  p.m.forEach(m=>{
    const mMesh=sphere(m.size*SIZE_SCALE,m.tex,m.col);
    mMesh.userData.bodyId=`${p.n}|${m.n}`;
    mMesh.add(new CSS2DObject(Object.assign(
      document.createElement('div'),
      {className:'label',textContent:m.n,style:'font-size:10px'},
    )));
    group.add(mMesh);
    moons.push({...m,mesh:mMesh});
  });
  bodies.push({p,group,mesh:pMesh,moons});
  bodyIndex.set(p.n,{group,mesh:pMesh,planet:p,moons});
  moons.forEach(m=>bodyIndex.set(`${p.n}|${m.n}`,{moon:m,planet:p,group}));
});

/* HUD */
const sel=document.getElementById('target');
const speedSlider=document.getElementById('speed');
const speedVal=document.getElementById('speedValue');
const lightSlider=document.getElementById('light');
const lightVal=document.getElementById('lightValue');

bodies.forEach(b=>{
  sel.add(new Option(b.p.n,b.p.n));
  b.moons.forEach(m=>sel.add(new Option(`  ${m.n}`,`${b.p.n}|${m.n}`)));
});
sel.selectedIndex=2;

let speed=+speedSlider.value;
speedSlider.oninput=()=>{speed=+speedSlider.value; speedVal.textContent=`${speed} d/s`;};
speedSlider.oninput();

sunLight.intensity=+lightSlider.value;
lightVal.textContent=lightSlider.value;
lightSlider.oninput=()=>{sunLight.intensity=+lightSlider.value; lightVal.textContent=lightSlider.value;};

/* Flug-Logik */
let fly=false,align=false,follow=false;
let tFlyStart,camStart,followRadius=50,followAngle=0;
let followTarget,desiredOffset;
const ALIGN_SPEED=0.5;

function flyTo(bodyId){
  const info=bodyIndex.get(bodyId); if(!info) return;
  let dest,r;
  if(info.moon){
    dest=info.group.position.clone().add(info.moon.mesh.position);
    r=info.moon.size*SIZE_SCALE;
    followTarget=info.moon.mesh;
  }else{
    dest=info.group.position.clone();
    r=info.planet.size*SIZE_SCALE;
    followTarget=info.group;
  }
  followRadius=r*6;
  camStart=camera.position.clone();
  const dir=camera.position.clone().sub(dest).normalize();
  const camEnd=dest.clone().add(dir.multiplyScalar(followRadius));
  tFlyStart=performance.now(); fly=true; align=false; follow=true; followAngle=0; desiredOffset=null;
  sel.value=bodyId;
  (function step(){ if(!fly) return;
    const t=Math.min(1,(performance.now()-tFlyStart)/4000);
    camera.position.lerpVectors(camStart,camEnd,t);
    controls.target.lerpVectors(controls.target,dest,t);
    controls.update();
    if(t<1) requestAnimationFrame(step); else {fly=false; align=true;} })();
}

sel.onchange=()=>flyTo(sel.value);

/* Klick */
const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown',e=>{
  pointer.x=(e.clientX/innerWidth)*2-1; pointer.y=-(e.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObjects(scene.children,true).find(i=>i.object.userData.bodyId);
  if(hit) flyTo(hit.object.userData.bodyId);
});

/* Follow zoom */
addEventListener('wheel',e=>{if(follow){followRadius*=1+Math.sign(e.deltaY)*0.1; followRadius=Math.max(5,Math.min(2000,followRadius));}}, {passive:true});
addEventListener('keydown',e=>{if(e.key==='Escape'){follow=false; align=false;}});

/* Simulation loop */
const J2000=Date.UTC(2000,0,1,12);
const MSDAY=86_400_000;
const clock=new THREE.Clock();
let simTime=0;
const dateBox=document.getElementById('dateBox');

function animate(){
  requestAnimationFrame(animate);
  const dt=clock.getDelta();
  sunUniforms.time.value+=dt;
  corona.rotation.y+=0.002;
  simTime+=dt*speed;
  bodies.forEach(({p,group,mesh,moons})=>{
    const M=(p.M0*DEG)+simTime*2*Math.PI/p.P;
    group.position.copy(kepler(p.a*AU,p.e,p.i*DEG,p.Ω*DEG,p.ω*DEG,M));
    mesh.rotation.y=simTime/p.rot*2*Math.PI;
    moons.forEach(m=>{
      const ang=simTime*2*Math.PI/m.P;
      const inc=(m.inc||0)*DEG;
      m.mesh.position.set(m.a*Math.cos(ang),
        m.a*Math.sin(ang)*Math.sin(inc)*INC_SCALE,
        m.a*Math.sin(ang)*Math.cos(inc));
    });
  });
  const tgt=followTarget?followTarget.getWorldPosition(new THREE.Vector3()):null;
  if(align&&tgt){
    const sunDir=tgt.clone().sub(sunCore.position).normalize();
    const targetOffset=sunDir.clone().negate().multiplyScalar(followRadius);
    if(!desiredOffset) desiredOffset=camera.position.clone().sub(tgt).setLength(followRadius);
    desiredOffset.lerp(targetOffset,ALIGN_SPEED*dt);
    camera.position.copy(tgt.clone().add(desiredOffset));
    if(desiredOffset.angleTo(targetOffset)<0.02) align=false;
    controls.target.copy(tgt); controls.update();
  }else if(follow&&tgt){
    const sunDir=tgt.clone().sub(sunCore.position).normalize();
    const offset=sunDir.clone().negate().multiplyScalar(followRadius).applyAxisAngle(sunDir,followAngle);
    followAngle+=0.05*DEG*dt*speed/400;
    camera.position.copy(tgt.clone().add(offset));
    controls.target.copy(tgt); controls.update();
  }else if(!fly){controls.update();}
  dateBox.textContent=new Date(J2000+simTime*MSDAY).toISOString().replace('T',' ').substring(0,19)+' UTC';
  renderer.render(scene,camera); labels.render(scene,camera);
}
animate();

/* Resize */
addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  labels.setSize(innerWidth,innerHeight);
});
