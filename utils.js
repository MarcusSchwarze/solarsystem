/* Hilfsfunktionen & Konstanten */
import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js?module';

/* Kosmische Einheiten */
export const AU        = 75;              // Astronomische Einheit in Szenen-Units
export const INC_SCALE = 10;              // Y-Skalierung für Bahnneigung
export const DEG       = Math.PI / 180;

/* Textur-Loader (CORS-freundlich) */
const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');
const base = 'https://threejs.org/examples/textures/planets/';
export function tex(file){ return loader.load(base + file); }

/* Kugel mit optionaler Textur & Grundhelligkeit */
export function sphere(r, tfile, color){
  const mat = new THREE.MeshLambertMaterial({
    color,
    emissive: 0x111111,
    emissiveIntensity: 0.6
  });
  if(tfile) mat.map = tex(tfile);
  return new THREE.Mesh(new THREE.SphereGeometry(r, 64, 32), mat);
}

/* Keplersche Bahnberechnung (vgl. Meeus) */
export function kepler(a, e, i, Ω, ω, M){
  // Näherungslösung für die Exzentrische Anomalie E
  let E = M;
  for(let k=0; k<6; k++) E = M + e * Math.sin(E);
  const ν  = 2 * Math.atan2(
              Math.sqrt(1+e) * Math.sin(E/2),
              Math.sqrt(1-e) * Math.cos(E/2));
  const r  = a * (1 - e * Math.cos(E));

  /* Drehmatrix in ekliptische Koordinaten */
  const cosΩ = Math.cos(Ω), sinΩ = Math.sin(Ω);
  const cosi = Math.cos(i), sini = Math.sin(i);
  const cosw = Math.cos(ω + ν), sinw = Math.sin(ω + ν);

  return new THREE.Vector3(
    r * (cosΩ * cosw - sinΩ * sinw * cosi),
    r * (sinw * sini) * INC_SCALE,
    r * (sinΩ * cosw + cosΩ * sinw * cosi)
  );
}
