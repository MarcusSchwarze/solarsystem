export const planets = [
  { n:'Merkur', a:0.387098, e:0.2056, i:7.004, Ω:48.331, ω:29.124,
    M0:174.796, P:87.969, rot:58.65,
    size:1.6, tex:'mercury.jpg', col:0xd0d0d0, tilt:0.03, m:[] },

  { n:'Venus', a:0.723332, e:0.0067, i:3.394, Ω:76.680, ω:54.884,
    M0:50.115, P:224.701, rot:-243,
    size:3.2, tex:'venus_surface.jpg', col:0xd4c29e, tilt:177, m:[] },

  { n:'Erde', a:1, e:0.0167, i:0, Ω:0, ω:102.937,
    M0:357.517, P:365.256, rot:1,
    size:3, tex:'earth_daymap.jpg', col:0xffffff, tilt:23.4,
    m:[{ n:'Mond', a:10, P:27.321, size:0.8, tex:'moon_1024.jpg', col:0xbfbfbf, inc:5.14 }] },

  { n:'Mars', a:1.523679, e:0.0934, i:1.85, Ω:49.558, ω:286.502,
    M0:19.373, P:686.98, rot:1.03,
    size:2.5, tex:'mars_1k_color.jpg', col:0xc1440e, tilt:25,
    m:[
      { n:'Phobos', a:6, P:0.319, size:0.45, tex:'phobos.jpg', col:0xaaaaaa, inc:1.093 },
      { n:'Deimos', a:9, P:1.263, size:0.35, tex:'deimos.jpg', col:0x999999, inc:0.93 } ] },

  { n:'Jupiter', a:5.20260, e:0.0489, i:1.304, Ω:100.464, ω:273.867,
    M0:20.02, P:4332.589, rot:0.41,
    size:7, tex:'jupiter.jpg', col:0xd2b48c, tilt:3,
    m:[] }
];
