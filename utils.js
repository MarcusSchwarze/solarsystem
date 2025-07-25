import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js?module';

export const AU = 75;
export const INC_SCALE = 10;
export const DEG = Math.PI / 180;

const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

export function tex(file){
  if (!file) return null;
  return loader.load('./textures/planets/' + file);
}

export function sphere(radius, textureFile = null, color = 0xffffff){
  const params = {
    color,
    emissive:0x111111,
    emissiveIntensity:0.6,
  };
  const t = tex(textureFile);
  if (t) params.map = t;
  const mat = new THREE.MeshLambertMaterial(params);
  return new THREE.Mesh(new THREE.SphereGeometry(radius,64,32), mat);
}

export function kepler(a,e,i,Ω,ω,M0){
  let E=M0;
  for(let k=0;k<6;k++){E=M0+e*Math.sin(E);}
  const ν=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2));
  const r=a*(1-e*Math.cos(E));
  const cosΩ=Math.cos(Ω),sinΩ=Math.sin(Ω);
  const cosi=Math.cos(i),sini=Math.sin(i);
  const cosw=Math.cos(ω+ν),sinw=Math.sin(ω+ν);
  const x=r*(cosΩ*cosw-sinΩ*sinw*cosi);
  const y=r*(sinw*sini)*INC_SCALE;
  const z=r*(sinΩ*cosw+cosΩ*sinw*cosi);
  return new THREE.Vector3(x,y,z);
}
