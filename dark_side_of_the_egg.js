import Two from "https://esm.sh/two.js";
import * as flubber from "https://esm.sh/flubber";

const two = new Two({ fullscreen: true }).appendTo(document.body);

const centerX = two.width / 2;
const centerY = two.height / 2;

const { egg, eggShape, eggInterpolator } = (() => {
  const eggRy = two.height * 0.4;
  const eggShape = new Two.Ellipse(centerX, centerY, eggRy * 0.7, eggRy, 128);
  const tw = (eggRy * 2) / Math.sqrt(3);
  const triangle = [
    [0, -eggRy],
    [-tw, eggRy],
    [tw, eggRy]
  ];
  const interpolate = flubber.interpolate(
    triangle,
    eggShape.vertices.map((v) => [v.x, v.y]),
    {
      string: false
    }
  );
  const eggInterpolator = (i) =>
    interpolate(i).map((c) => new Two.Anchor(c[0], c[1]));

  const egg = new Two.Path(eggInterpolator(0));
  egg.position = eggShape.position;
  egg.closed = true;
  egg.fill = "black";
  egg.stroke = "white";
  egg.opacity = 0;
  egg.linewidth = 3;

  return { egg, eggShape, eggInterpolator };
})();

const { rayGradiant, rayEx, rayEy } = (() => {
  const ip = eggShape.getPointAt(0.55);
  const rayEx = centerX + ip.x;
  const rayEy = centerY + ip.y;
  const raySy = rayEy + 0.2 * rayEx;
  const ray = two.makeLine(0, raySy, rayEx, rayEy);
  ray.linewidth = 3;

  const rayGradiant = two.makeRadialGradient(
    0,
    1,
    0,
    new Two.Stop(0, "white"),
    new Two.Stop(1, "white", 0)
  );
  ray.stroke = rayGradiant;

  return { rayGradiant, rayEx, rayEy };
})();

const colorGradiants = (() => {
  const dm = 0.01;
  let m = 0.12;
  let t = 0.91;
  const colorGradiants = [];

  for (const color of ["red", "orange", "yellow", "green", "blue", "indigo"]) {
    const p1 = eggShape.getPointAt(t);
    const p1x = centerX + p1.x;
    const p1y = centerY + p1.y;

    if (color === "indigo") {
      t = 0;
    } else {
      t += 0.0165;
    }

    const p2 = eggShape.getPointAt(t);
    const p2x = centerX + p2.x;
    const p2y = centerY + p2.y;

    let y1 = p1y + m * p1x;
    m += dm;
    let y2 = p2y + m * p2x;

    const r = two.makePath(
      p1x,
      p1y,
      two.width - 1,
      y1,
      two.width - 1,
      y2,
      p2x,
      p2y
    );
    r.noStroke();

    const gradiant = two.makeRadialGradient(
      0,
      0,
      0,
      new Two.Stop(0, color),
      new Two.Stop(1, color, 0)
    );
    r.fill = gradiant;
    colorGradiants.push(gradiant);
  }

  return colorGradiants;
})();

two.add(egg);

const insideGradiant = (() => {
  const op1 = eggShape.getPointAt(0.91);
  const op2 = eggShape.getPointAt(0);
  const op1x = centerX + op1.x;
  const op1y = centerY + op1.y;
  const op2x = centerX + op2.x;
  const op2y = centerY + op2.y;
  const inside = two.makePath(rayEx, rayEy, op1x, op1y, op2x, op2y);
  inside.noStroke();

  const insideGradiant = two.makeRadialGradient(
    0,
    0.5,
    0,
    new Two.Stop(0, "white"),
    new Two.Stop(1, "white", 0)
  );
  inside.fill = insideGradiant;

  return insideGradiant;
})();

let eggI = 0;

two.bind("update", () => {
  if (egg.opacity < 0.5) {
    egg.opacity += 0.0025;
  } else if (egg.opacity < 1) {
    egg.opacity += 0.01;
  } else if (eggI < 1) {
    eggI += 0.005;
    egg.vertices = eggInterpolator(eggI);
  } else if (rayGradiant.radius < 1.7) {
    rayGradiant.radius += 0.005;
  } else if (insideGradiant.radius < 1) {
    insideGradiant.radius += 0.005;
    rayGradiant.radius += 0.035;
  } else {
    for (const gradiant of colorGradiants) {
      if (gradiant.radius < 2) {
        gradiant.radius += 0.005;
      }
    }
  }
});

two.renderer.domElement.onclick = () => {
  egg.opacity = 0;
  eggI = 0;
  egg.vertices = eggInterpolator(0);
  rayGradiant.radius = 0;
  insideGradiant.radius = 0;
  for (const gradiant of colorGradiants) {
    gradiant.radius = 0;
  }
};

two.play();
