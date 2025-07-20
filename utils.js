/* --------------------------------------------------
   utils.js – Konstanten, Textur‑Loader, Hilfsfunktionen
-------------------------------------------------- */
import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js?module';

/* Kosmische Konstanten */
export const AU         = 75;                // 1 Astronomische Einheit in Szenen‑Units
export const INC_SCALE  = 10;                // Y‑Streckung für Bahnneigung
export const DEG        = Math.PI / 180;     // Grad → Radiant

/* Textur‑Loader ------------------------------------------------------------ */
const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

/* Fallback‑Textur (neutral) */
export const neutralTexture = loader.load('./textures/neutral.png');

/* Bild laden oder neutral zurückgeben */
export function tex(file){
  if (!file) return neutralTexture;
  return loader.load('./textures/planets/' + file);
}

/* Material‑Kugel */
export function sphere(radius, textureFile=null, color){
  const params = {
    color : (color === undefined || color === null) ? 0xffffff : color,
    emissive: 0x111111,
    emissiveIntensity: 0.6,
  };
  const t = tex(textureFile);
  if (t) params.map = t;

  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 32),
    new THREE.MeshLambertMaterial(params),
  );
}

/* Kepler‑Solver (Newton‑Iteration) ---------------------------------------- */
export function kepler(a, e, i, Ω, ω, M0){
  let E = M0;
  for (let k = 0; k < 6; k++){
    E = M0 + e * Math.sin(E);
  }
  const ν   = 2 * Math.atan2(
                Math.sqrt(1 + e) * Math.sin(E / 2),
                Math.sqrt(1 - e) * Math.cos(E / 2),
              );
  const r   = a * (1 - e * Math.cos(E));

  const cosΩ = Math.cos(Ω), sinΩ = Math.sin(Ω);
  const cosi = Math.cos(i),  sini = Math.sin(i);
  const coswν = Math.cos(ω + ν), sinwν = Math.sin(ω + ν);

  const x = r * (cosΩ * coswν - sinΩ * sinwν * cosi);
  const y = r * (sinwν * sini) * INC_SCALE;
  const z = r * (sinΩ * coswν + cosΩ * sinwν * cosi);

  return new THREE.Vector3(x, y, z);
}
