/* --------------------------------------------------
   utils.js  –  Konstanten, Textur‑Lader, Hilfsfunktionen
-------------------------------------------------- */
import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js?module';

/* Kosmische Konstanten */
export const AU        = 75;                // 1 Astronomische Einheit in Szenen‑Units
export const INC_SCALE = 10;                // Y‑Streckung für Bahnneigung
export const DEG       = Math.PI / 180;     // Grad → Radiant

/* Lokaler Texturpfad -------------------------------------------------------- */
const base = './textures/planets/';         // <‑‑ hier liegen Ihre JPG/GIF‑Dateien

/* Drei‑Loader mit CORS‑Freigabe (falls später extern genutzt) */
const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

export function tex(file){
  return loader.load(base + file);
}

/* Kugel mit Basis‑Material + optionaler Textur */
export function sphere(radius, textureFile, color){
  const mat = new THREE.MeshLambertMaterial({
    color,
    emissive: 0x111111,
    emissiveIntensity: 0.6
  });
  if(textureFile) mat.map = tex(textureFile);
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 32), mat);
}

/* Keplersche Bahn­berechnung (einfache numerische Näherung) */
export function kepler(a, e, i, Ω, ω, M){
  let E = M;                                    // Exzentrische Anomalie
  for(let k = 0; k < 6; k++)                    // Newton‑Iteration
    E = M + e * Math.sin(E);

  const ν  = 2 * Math.atan2(
               Math.sqrt(1 + e) * Math.sin(E / 2),
               Math.sqrt(1 - e) * Math.cos(E / 2)
             );
  const r  = a * (1 - e * Math.cos(E));

  const cosΩ = Math.cos(Ω), sinΩ = Math.sin(Ω);
  const cosi = Math.cos(i), sini = Math.sin(i);
  const cosw = Math.cos(ω + ν), sinw = Math.sin(ω + ν);

  return new THREE.Vector3(
    r * (cosΩ * cosw - sinΩ * sinw * cosi),
    r * (sinw * sini) * INC_SCALE,
    r * (sinΩ * cosw + cosΩ * sinw * cosi)
  );
}
