/* --------------------------------------------------
   Planetendaten mit Originaltexturen
-------------------------------------------------- */
export const planets = [
  {
    n: 'Merkur',
    a: 0.387098, e: 0.2056, i: 7.004, Ω: 48.331, ω: 29.124,
    M0: 174.796, P: 87.969, rot: 58.65,
    size: 1.6, tex: 'mercury.jpg', col: 0xffffff, tilt: 0.03,
    m: [],
  },
  {
    n: 'Venus',
    a: 0.723332, e: 0.0067, i: 3.394, Ω: 76.680, ω: 54.884,
    M0: 50.115, P: 224.701, rot: -243,
    size: 3.2, tex: 'venus_surface.jpg', col: 0xffffff, tilt: 177,
    m: [],
  },
  {
    n: 'Erde',
    a: 1, e: 0.0167, i: 0, Ω: 0, ω: 102.937,
    M0: 357.517, P: 365.256, rot: 1,
    size: 3, tex: 'earth_daymap.jpg', col: 0xffffff, tilt: 23.4,
    m: [
      { n: 'Mond', a: 10, P: 27.321, size: 0.8, tex: 'moon_1024.jpg', col: 0xffffff, inc: 5.14 },
    ],
  },
  {
    n: 'Mars',
    a: 1.523679, e: 0.0934, i: 1.85, Ω: 49.558, ω: 286.502,
    M0: 19.373, P: 686.98, rot: 1.03,
    size: 2.5, tex: 'mars_1k_color.jpg', col: 0xffffff, tilt: 25,
    m: [
      { n: 'Phobos', a: 6,  P: 0.319, size: 0.45, tex: 'phobos.jpg',  col: 0xffffff, inc: 1.093 },
      { n: 'Deimos', a: 9,  P: 1.263, size: 0.35, tex: 'deimos.jpg', col: 0xffffff, inc: 0.93  },
    ],
  },
  {
    n: 'Jupiter',
    a: 5.20260, e: 0.0489, i: 1.304, Ω: 100.464, ω: 273.867,
    M0: 20.020, P: 4332.589, rot: 0.41,
    size: 7, tex: 'jupiter.jpg', col: 0xffffff, tilt: 3,
    m: [
      { n: 'Io',      a: 16, P: 1.769, size: 1.0, tex: 'io.jpg',      col: 0xffffff, inc: 0.04 },
      { n: 'Europa',  a: 20, P: 3.551, size: 0.9, tex: 'europa.jpg',  col: 0xffffff, inc: 0.47 },
      { n: 'Ganymed', a: 24, P: 7.155, size: 1.2, tex: 'ganymede.jpg',col: 0xffffff, inc: 0.21 },
      { n: 'Kallisto',a: 30, P: 16.689,size: 1.1, tex: 'callisto.jpg',col: 0xffffff, inc: 0.19 },
    ],
  },
  {
    n: 'Saturn',
    a: 9.5549,  e: 0.0565, i: 2.485, Ω: 113.665, ω: 339.392,
    M0: 317.02, P: 10759, rot: 0.44,
    size: 6, tex: 'saturn.jpg', col: 0xffffff, tilt: 26,
    rings: {
      inner: 7.5,
      outer: 12.5,
      color: 'saturnringcolor.jpg',
      alpha: 'saturnringpattern.gif',
    },
    m: [
      { n: 'Titan',      a: 22, P: 15.945, size: 1.4, tex: 'titan.jpg',     col: 0xffffff, inc: 0.3485 },
      { n: 'Enceladus',  a: 14, P: 1.370,  size: 0.6, tex: 'enceladus.jpg', col: 0xffffff, inc: 0.009  },
    ],
  },
  {
    n: 'Uranus',
    a: 19.2184, e: 0.046, i: 0.773, Ω: 74.006, ω: 96.998,
    M0: 142.2386, P: 30687.15, rot: -0.72,
    size: 5, tex: 'uranus.jpg', col: 0xffffff, tilt: 98,
    m: [
      { n: 'Titania', a: 14, P: 8.706,  size: 0.9, tex: 'titania.jpg', col: 0xffffff, inc: 0.34 },
      { n: 'Oberon',  a: 16, P: 13.463, size: 0.9, tex: 'oberon.jpg',  col: 0xffffff, inc: 0.06 },
    ],
  },
  {
    n: 'Neptun',
    a: 30.1104, e: 0.009, i: 1.770, Ω: 131.784, ω: 273.187,
    M0: 256.228, P: 60190, rot: 0.67,
    size: 5, tex: 'neptune.jpg', col: 0xffffff, tilt: 28,
    m: [
      { n: 'Triton', a: 16, P: 5.877, size: 0.8, tex: 'triton.jpg', col: 0xffffff, inc: 156.9 },
    ],
  },
];
