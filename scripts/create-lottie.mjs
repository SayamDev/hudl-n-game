import fs from "node:fs";
const fixed = (k) => ({ a: 0, k });
const color = (hex) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).concat(1);
const key = (t, s, e) => ({
  t,
  s,
  e,
  i: { x: [0.34], y: [0.94] },
  o: { x: [0.2], y: [0.75] },
});
const shapes = [];
function ellipse(name, x, y, w, h, fill) {
  shapes.push({
    ty: "gr",
    nm: name,
    it: [
      { ty: "el", p: fixed([x, y]), s: fixed([w, h]) },
      { ty: "fl", c: fixed(color(fill)), o: fixed(100), r: 1 },
      {
        ty: "tr",
        p: fixed([0, 0]),
        a: fixed([0, 0]),
        s: fixed([100, 100]),
        r: fixed(0),
        o: fixed(100),
        sk: fixed(0),
        sa: fixed(0),
      },
    ],
  });
}
ellipse("Hudl body", 0, 0, 126, 120, "#FFD60A");
shapes[0].it[0] = {
  ty: "rc",
  p: fixed([0, 0]),
  s: fixed([126, 120]),
  r: fixed(35),
};
shapes[0].it.splice(2, 0, {
  ty: "st",
  c: fixed(color("#1B1033")),
  o: fixed(100),
  w: fixed(4),
  lc: 2,
  lj: 2,
});
ellipse("Left eye", -24, -12, 25, 36, "#fffdf9");
ellipse("Right eye", 24, -12, 25, 36, "#fffdf9");
ellipse("Left pupil", -21, -10, 10, 16, "#1B1033");
ellipse("Right pupil", 27, -10, 10, 16, "#1B1033");
ellipse("Smile", 1, 25, 35, 20, "#1B1033");
shapes[5].it[0] = {
  ty: "sh",
  ks: fixed({
    c: true,
    v: [
      [-19, 18],
      [20, 18],
      [1, 36],
    ],
    i: [
      [0, 0],
      [0, 0],
      [10, 0],
    ],
    o: [
      [0, 0],
      [0, 12],
      [-10, 0],
    ],
  }),
};
ellipse("Cheek left", -45, 17, 15, 9, "#FF3D8B");
ellipse("Cheek right", 45, 17, 15, 9, "#FF3D8B");
const layers = [
  {
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: "Hudl victory pop",
    sr: 1,
    ks: {
      o: fixed(100),
      r: {
        a: 1,
        k: [key(0, [-10], [5]), key(16, [5], [0]), { t: 30, s: [0] }],
      },
      p: fixed([160, 155, 0]),
      a: fixed([0, 0, 0]),
      s: {
        a: 1,
        k: [
          key(0, [65, 65, 100], [108, 108, 100]),
          key(16, [108, 108, 100], [100, 100, 100]),
          { t: 30, s: [100, 100, 100] },
        ],
      },
    },
    ao: 0,
    shapes: shapes.reverse(),
    ip: 0,
    op: 75,
    st: 0,
    bm: 0,
  },
];
["#7C3AED", "#FF3D8B", "#2EE6A6", "#38BDF8", "#FF8A3D", "#FFD60A"].forEach(
  (c, i) => {
    const angle = (i * Math.PI) / 3;
    layers.push({
      ddd: 0,
      ind: i + 2,
      ty: 4,
      nm: `Celebration ${i + 1}`,
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            key(0, [0], [100]),
            key(8, [100], [100]),
            key(45, [100], [0]),
            { t: 60, s: [0] },
          ],
        },
        r: fixed(i * 35),
        p: {
          a: 1,
          k: [
            key(
              0,
              [160, 150, 0],
              [160 + Math.cos(angle) * 115, 150 + Math.sin(angle) * 115, 0],
            ),
            {
              t: 35,
              s: [160 + Math.cos(angle) * 115, 150 + Math.sin(angle) * 115, 0],
            },
          ],
        },
        a: fixed([0, 0, 0]),
        s: fixed([100, 100, 100]),
      },
      ao: 0,
      shapes: [
        { ty: "rc", p: fixed([0, 0]), s: fixed([11, 20]), r: fixed(3) },
        { ty: "fl", c: fixed(color(c)), o: fixed(100), r: 1 },
      ],
      ip: 0,
      op: 75,
      st: 0,
      bm: 0,
    });
  },
);
const scene = {
  v: "5.12.2",
  fr: 60,
  ip: 0,
  op: 75,
  w: 320,
  h: 320,
  nm: "Hudl celebrates a finished round",
  assets: [],
  layers,
};
for (const base of ["public", ".lottie-player/public"]) {
  const path = `${base}/projects/hudl/scene-1`;
  fs.mkdirSync(path, { recursive: true });
  fs.writeFileSync(`${path}/lottie.json`, JSON.stringify(scene));
}
