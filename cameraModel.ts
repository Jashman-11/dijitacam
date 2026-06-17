import * as THREE from "three";
import type { Camera } from "../data/types";

/**
 * Builds a stylized point-and-shoot camera as a Three.js group.
 * Not a literal photo-realistic recreation — a deliberately simplified
 * "toy" form so it reads instantly at small scale and stays lightweight
 * (no external model/texture downloads required).
 */
export function buildCameraModel(cam: Camera): THREE.Group {
  const group = new THREE.Group();
  group.name = `camera-${cam.id}`;

  const bodyColor = new THREE.Color(cam.color);
  const isLight = bodyColor.getHSL({ h: 0, s: 0, l: 0 }).l > 0.7;
  const accent = new THREE.Color(isLight ? "#020612" : "#e5ddf9");

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: bodyColor,
    metalness: 0.35,
    roughness: 0.28,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    reflectivity: 0.5,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: accent,
    metalness: 0.6,
    roughness: 0.35,
  });

  // --- main body ---
  const bodyGeo = roundedBoxGeometry(2.6, 1.5, 0.62, 0.16, 6);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // --- lens barrel housing (raised ring on the front face) ---
  const housing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.18, 32),
    bodyMat,
  );
  housing.rotation.x = Math.PI / 2;
  housing.position.set(0.35, 0.05, 0.4);
  group.add(housing);

  // --- outer chrome ring ---
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.05, 16, 40),
    trimMat,
  );
  ring.position.set(0.35, 0.05, 0.5);
  group.add(ring);

  // --- lens glass (dark glossy disc with a teal coating glint) ---
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: "#04060a",
    metalness: 0.2,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    iridescence: 0.6,
    iridescenceIOR: 1.3,
  });
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.06, 32),
    lensMat,
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0.35, 0.05, 0.56);
  group.add(lens);

  // inner lens glint ring
  const glint = new THREE.Mesh(
    new THREE.RingGeometry(0.18, 0.22, 32),
    new THREE.MeshBasicMaterial({ color: "#5ee6d9", transparent: true, opacity: 0.7 }),
  );
  glint.position.set(0.35, 0.05, 0.6);
  group.add(glint);

  // --- viewfinder bump (top left) ---
  const vf = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.14, 0.3),
    bodyMat,
  );
  vf.position.set(-0.95, 0.78, 0.05);
  group.add(vf);

  // --- flash (small square, top right-ish) ---
  const flash = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.16, 0.08),
    new THREE.MeshStandardMaterial({ color: "#f4c84b", emissive: "#f4c84b", emissiveIntensity: 0.15, metalness: 0.1, roughness: 0.4 }),
  );
  flash.position.set(0.95, 0.6, 0.32);
  group.add(flash);

  // --- shutter button ---
  const shutter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.06, 20),
    trimMat,
  );
  shutter.position.set(1.1, 0.65, 0);
  group.add(shutter);

  // --- thin trim strip across the front (brand bar look) ---
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.08, 0.05),
    trimMat,
  );
  strip.position.set(0, -0.62, 0.34);
  group.add(strip);

  // --- strap lugs ---
  [-1.25, 1.25].forEach((x) => {
    const lug = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.025, 8, 16), trimMat);
    lug.position.set(x, 0.55, 0);
    lug.rotation.y = Math.PI / 2;
    group.add(lug);
  });

  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return group;
}

/** Rounded box via extruded shape — avoids extra geometry deps. */
function roundedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number,
  segments: number,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const w = width / 2 - radius;
  const h = height / 2 - radius;

  shape.moveTo(-w, -h - radius);
  shape.lineTo(w, -h - radius);
  shape.quadraticCurveTo(w + radius, -h - radius, w + radius, -h);
  shape.lineTo(w + radius, h);
  shape.quadraticCurveTo(w + radius, h + radius, w, h + radius);
  shape.lineTo(-w, h + radius);
  shape.quadraticCurveTo(-w - radius, h + radius, -w - radius, h);
  shape.lineTo(-w - radius, -h);
  shape.quadraticCurveTo(-w - radius, -h - radius, -w, -h - radius);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: segments,
    curveSegments: segments,
  });
  geo.center();
  return geo;
}
