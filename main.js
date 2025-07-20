/* Simplified main.js focusing on sun scaling and basic HUD */
import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js?module';
import { OrbitControls } from 'https://unpkg.com/three@0.164.0/examples/jsm/controls/OrbitControls.js?module';
import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three@0.164.0/examples/jsm/renderers/CSS2DRenderer.js?module';
import { AU, DEG, INC_SCALE, sphere, kepler, tex } from './utils.js';
import { planets } from './planets.js';

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.1,20000);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth,innerHeight);
document.body.appendChild(renderer.domElement);

const labels=new CSS2DRenderer();
labels.setSize(innerWidth,innerHeight);
labels.domElement.style.position='absolute';
labels.domElement.style.top=0;
labels.domElement.style.pointerEvents='none';
document.body.appendChild(labels.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
camera.position.set(0,0,1800);

scene.add(new THREE.AmbientLight(0xffffff,0.25));

/* Sonne */
const SUN_RADIUS=15;
const sunCore=new THREE.Mesh(
  new THREE.SphereGeometry(SUN_RADIUS,128,64),
  new THREE.MeshBasicMaterial({color:0xffcc55})
);
scene.add(sunCore);
sunCore.add(new CSS2DObject(Object.assign(document.createElement('div'),{className:'label',textContent:'Sonne'})));

const corona=new THREE.Mesh(
  new THREE.SphereGeometry(SUN_RADIUS*1.25,32,16),
  new THREE.MeshBasicMaterial({color:0xffe28a,transparent:true,opacity:0.35,blending:THREE.AdditiveBlending,side:THREE.BackSide})
);
scene.add(corona);

/* Planeten */
const SIZE_SCALE=3;
const bodies=[];
planets.forEach(p=>{
  const group=new THREE.Object3D();
  scene.add(group);
  const mesh=sphere(p.size*SIZE_SCALE,p.tex,p.col);
  mesh.rotation.z=p.tilt*DEG;
  mesh.userData.bodyId=p.n;
  mesh.add(new CSS2DObject(Object.assign(document.createElement('div'),{className:'label',textContent:p.n})));
  group.add(mesh);
  const moons=[];
  (p.m||[]).forEach(m=>{
    const mMesh=sphere(m.size*SIZE_SCALE,m.tex,m.col);
    mMesh.userData.bodyId=`${p.n}|${m.n}`;
    group.add(mMesh);
    moons.push({...m,mesh:mMesh});
  });
  bodies.push({p,group,mesh,moons});
});

/* HUD setup */
const sel=document.getElementById('target');
const speedSlider=document.getElementById('speed');
const speedValue=document.getElementById('speedValue');
const lightSlider=document.getElementById('light');
const lightValue=document.getElementById('lightValue');

bodies.forEach(b=>{
  sel.add(new Option(b.p.n,b.p.n));
  b.moons.forEach(m=>sel.add(new Option(`  ${m.n}`,`${b.p.n}|${m.n}`)));
});
sel.selectedIndex=2;

let simSpeed=+speedSlider.value;
speedSlider.oninput=()=>{simSpeed=+speedSlider.value;speedValue.textContent=`${simSpeed} d/s`;};
speedSlider.oninput();

let sunIntensity=+lightSlider.value;
lightValue.textContent=sunIntensity;
lightSlider.oninput=()=>{sunIntensity=+lightSlider.value;lightValue.textContent=sunIntensity;};

const raycaster=new THREE.Raycaster();
const pointer=new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown',e=>{
  pointer.x=(e.clientX/innerWidth)*2-1;
  pointer.y=-(e.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObjects(scene.children,true).find(i=>i.object.userData.bodyId);
  if(hit) sel.value=hit.object.userData.bodyId;
});

sel.onchange=()=>{ /* fly logic can be implemented */ };

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt=clock.getDelta();
  controls.update();
  renderer.render(scene,camera);
  labels.render(scene,camera);
}
animate();