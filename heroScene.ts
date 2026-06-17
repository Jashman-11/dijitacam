import * as THREE from "three";
import { buildCameraModel } from "./cameraModel";
import type { Camera } from "../data/types";

interface FloatingItem {
  group: THREE.Group;
  basePosition: THREE.Vector3;
  floatSeed: number;
  /** user-applied rotation from drag, persists between frames */
  dragRotation: THREE.Euler;
  /** spin velocity left over after a drag "flick" */
  spinVelocity: THREE.Vector2;
}

export class HeroScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private items: FloatingItem[] = [];
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private dragging: FloatingItem | null = null;
  private lastPointer = new THREE.Vector2();
  private clock = new THREE.Clock();
  private mountEl: HTMLElement;
  private destroyed = false;
  private pointerLight: THREE.PointLight;
  private resizeObserver: ResizeObserver;
  private prefersReducedMotion: boolean;

  constructor(mountEl: HTMLElement, cameras: Camera[]) {
    this.mountEl = mountEl;
    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    mountEl.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.set(0, 0, 11);

    this.setupLights();
    this.pointerLight = new THREE.PointLight("#5ee6d9", 12, 14, 2);
    this.pointerLight.position.set(0, 0, 6);
    this.scene.add(this.pointerLight);

    this.layoutCameras(cameras.slice(0, 5));

    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(mountEl);

    this.bindPointerEvents();
    this.tick();
  }

  private setupLights() {
    const key = new THREE.DirectionalLight("#eee9fb", 2.4);
    key.position.set(4, 6, 8);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight("#ff6fa8", 1.4);
    rim.position.set(-6, -2, -4);
    this.scene.add(rim);

    const fill = new THREE.AmbientLight("#1a2240", 1.1);
    this.scene.add(fill);
  }

  private layoutCameras(cameras: Camera[]) {
    const positions: [number, number, number][] = [
      [-3.4, 1.1, 0],
      [3.1, 1.6, -1.4],
      [-1.6, -1.7, 1.2],
      [2.4, -1.4, 0.6],
      [0, 2.6, -2.2],
    ];

    cameras.forEach((cam, i) => {
      const group = buildCameraModel(cam);
      const pos = positions[i % positions.length];
      const basePosition = new THREE.Vector3(...pos);
      group.position.copy(basePosition);
      group.scale.setScalar(0.92);
      group.rotation.set(-0.15, 0.5 + i * 0.3, 0.08);
      group.userData.cameraId = cam.id;
      this.scene.add(group);

      this.items.push({
        group,
        basePosition,
        floatSeed: Math.random() * Math.PI * 2,
        dragRotation: new THREE.Euler().copy(group.rotation),
        spinVelocity: new THREE.Vector2(0, 0),
      });
    });
  }

  private bindPointerEvents() {
    const el = this.renderer.domElement;
    el.style.touchAction = "none";

    el.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    window.addEventListener("pointermove", (e) => this.onPointerMove(e));
    window.addEventListener("pointerup", () => this.onPointerUp());
  }

  private toNDC(e: PointerEvent): THREE.Vector2 {
    const rect = this.mountEl.getBoundingClientRect();
    return new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
  }

  private onPointerDown(e: PointerEvent) {
    this.pointer.copy(this.toNDC(e));
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(
      this.items.map((i) => i.group),
      true,
    )[0];
    if (!hit) return;

    let root = hit.object;
    while (root.parent && root.parent !== this.scene) root = root.parent;
    const item = this.items.find((i) => i.group === root);
    if (item) {
      this.dragging = item;
      this.lastPointer.set(e.clientX, e.clientY);
      this.mountEl.style.cursor = "grabbing";
    }
  }

  private onPointerMove(e: PointerEvent) {
    this.pointer.copy(this.toNDC(e));

    if (this.dragging) {
      const dx = e.clientX - this.lastPointer.x;
      const dy = e.clientY - this.lastPointer.y;
      const item = this.dragging;
      item.dragRotation.y += dx * 0.012;
      item.dragRotation.x += dy * 0.012;
      item.spinVelocity.set(dx * 0.0006, dy * 0.0006);
      this.lastPointer.set(e.clientX, e.clientY);
    } else {
      // hover affordance
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hit = this.raycaster.intersectObjects(
        this.items.map((i) => i.group),
        true,
      )[0];
      this.mountEl.style.cursor = hit ? "grab" : "default";
    }

    // pointer light follows cursor in world space (subtle)
    const vector = new THREE.Vector3(this.pointer.x, this.pointer.y, 0.5);
    vector.unproject(this.camera);
    this.pointerLight.position.lerp(
      vector.multiplyScalar(0.6).add(new THREE.Vector3(0, 0, 6)),
      0.15,
    );
  }

  private onPointerUp() {
    this.dragging = null;
    this.mountEl.style.cursor = "default";
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.mountEl;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Call from scroll handler: 0 = hero fully visible, 1 = scrolled past it. */
  setScrollProgress(t: number) {
    this.camera.position.z = 11 - t * 2.4;
    this.camera.position.y = t * -1.1;
    this.scene.rotation.y = t * 0.25;
  }

  private tick = () => {
    if (this.destroyed) return;
    const elapsed = this.clock.getElapsedTime();

    if (!this.prefersReducedMotion) {
      for (const item of this.items) {
        const { group, basePosition, floatSeed, dragRotation, spinVelocity } = item;

        // ambient float
        group.position.y =
          basePosition.y + Math.sin(elapsed * 0.6 + floatSeed) * 0.18;
        group.position.x =
          basePosition.x + Math.cos(elapsed * 0.4 + floatSeed) * 0.08;

        // decay spin velocity from a drag flick into continued rotation
        if (this.dragging !== item) {
          dragRotation.y += spinVelocity.x;
          dragRotation.x += spinVelocity.y;
          spinVelocity.multiplyScalar(0.94);

          // gentle idle rotation when not interacted with
          dragRotation.y += 0.0016;
        }

        group.rotation.x = dragRotation.x;
        group.rotation.y = dragRotation.y;
        group.rotation.z = Math.sin(elapsed * 0.3 + floatSeed) * 0.04;
      }
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.tick);
  };

  destroy() {
    this.destroyed = true;
    this.resizeObserver.disconnect();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
