/* --------------------------------------------------
   utils.js – Konstanten, Textur‑Loader, Hilfsfunktionen
-------------------------------------------------- */
import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js?module';

/* Kosmische Konstanten */
export const AU         = 75;                // 1 Astronomische Einheit in Szenen‑Units
export const INC_SCALE  = 10;                // Y‑Streckung für Bahnneigung
export const DEG        = Math.PI / 180;     // Grad → Radiant

/* Texturlader -------------------------------------------------------------- */
const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

/* Neutrale Standardtextur (einheitlich) */
export const neutralTexture = loader.load('./textures/neutral.png');

/* Hilfsfunktion: Planetentextur laden oder neutrale zurückgeben */
export function tex(file){
  return file ? loader.load('./textures/planets/' + file) : neutralTexture;
}

/* Kugel mit Basis‑Material + (ggf.) Textur */
export function sphere(radius, textureFile = null, color = 0xffffff){
  const mat = new THREE.MeshLambertMaterial({
    map: tex(textureFile),
    color,
    emissive: 0x111111,
    emissiveIntensity: 0.6,
  });
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 32),
    mat,
  );
}

/* Keplersche Bahn­berechnung (numerische Näherung) */
export function kepler(a, e, i, Ω, ω, M0){
  // Newton‑Iteration (6 Schritte reichen hier aus)
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
  const cosw = Math.cos(ω + ν), sinw = Math.sin(ω + ν);

  const x = r * (cosΩ * cosw - sinΩ * sinw * cosi);
  const y = r * (sinw * sini) * INC_SCALE;
  const z = r * (sinΩ * cosw + cosΩ * sinw * cosi);

  return new THREE.Vector3(x, y, z);
}
