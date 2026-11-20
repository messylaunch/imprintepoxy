"use client";
// 3D "finished product" preview: the customer's design on a real table / panel / helmet,
// lit with an environment map so the epoxy topcoat reflects like the real thing.
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DesignConfig, FRAMES, getSize } from "@/lib/design";
import { loadImage, renderPrintTexture } from "@/lib/render";
import { Loader2, Move3d } from "lucide-react";

const FT = 1 / 12; // scene units are feet

function finish(topcoat: string) {
  if (topcoat === "gloss") return { roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.03 };
  if (topcoat === "satin") return { roughness: 0.4, clearcoat: 0.55, clearcoatRoughness: 0.28 };
  if (topcoat === "matte") return { roughness: 0.85, clearcoat: 0, clearcoatRoughness: 1 };
  return { roughness: 0.75, clearcoat: 0, clearcoatRoughness: 1 }; // nothing picked yet
}

function frameMaterial(id: string) {
  const f = FRAMES.find((x) => x.id === id) ?? FRAMES[0];
  const metal = id === "chrome" || id === "gold";
  return new THREE.MeshPhysicalMaterial({ color: new THREE.Color(f.color), metalness: metal ? 1 : 0.1, roughness: metal ? 0.22 : 0.35, clearcoat: metal ? 0 : 0.6 });
}

// Same silhouette as the 2D renderer (normalized 0..1 box, y down).
function helmetShape(W: number, H: number) {
  const X = (v: number) => v * W, Y = (v: number) => (1 - v) * H;
  const s = new THREE.Shape();
  s.moveTo(X(0.1), Y(0.8));
  s.bezierCurveTo(X(-0.01), Y(0.55), X(0.04), Y(0.12), X(0.4), Y(0.045));
  s.bezierCurveTo(X(0.66), Y(-0.01), X(0.86), Y(0.14), X(0.875), Y(0.4));
  s.lineTo(X(0.79), Y(0.43));
  s.bezierCurveTo(X(0.75), Y(0.5), X(0.735), Y(0.61), X(0.755), Y(0.71));
  s.lineTo(X(0.66), Y(0.85));
  s.bezierCurveTo(X(0.5), Y(0.9), X(0.32), Y(0.865), X(0.24), Y(0.82));
  s.bezierCurveTo(X(0.18), Y(0.845), X(0.13), Y(0.845), X(0.1), Y(0.8));
  return s;
}

function buildScene(cfg: DesignConfig, tex: THREE.Texture) {
  const g = new THREE.Group();
  const size = getSize(cfg);
  const fin = finish(cfg.topcoat);
  const print = new THREE.MeshPhysicalMaterial({ map: tex, ...fin, metalness: 0 });
  const frame = frameMaterial(cfg.frame || "black");
  let wallMount = false;
  let target = new THREE.Vector3();

  if (cfg.product === "table") {
    const t = 0.13;
    const legH = size.id === "dining" ? 2.35 : size.id === "end" ? 1.65 : 1.35;
    if (size.shape === "round") {
      const r = (size.w * FT) / 2;
      const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r, t, 128), [frame, print, frame]);
      top.position.y = legH + t / 2;
      top.rotation.y = Math.PI / 2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, legH, 32), frame);
      post.position.y = legH / 2;
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.6, 0.06, 64), frame);
      foot.position.y = 0.03;
      g.add(top, post, foot);
    } else {
      const w = size.w * FT, d = size.h * FT;
      // BoxGeometry faces: +x, -x, +y (top), -y, +z, -z
      const top = new THREE.Mesh(new THREE.BoxGeometry(w, t, d), [frame, frame, print, frame, frame, frame]);
      top.position.y = legH + t / 2;
      g.add(top);
      const leg = new THREE.BoxGeometry(0.16, legH, 0.16);
      const ix = w / 2 - 0.18, iz = d / 2 - 0.18;
      for (const [x, z] of [[ix, iz], [-ix, iz], [ix, -iz], [-ix, -iz]]) {
        const l = new THREE.Mesh(leg, frame);
        l.position.set(x, legH / 2, z);
        g.add(l);
      }
      const apron = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, 0.18, d - 0.2), frame);
      apron.position.y = legH - 0.09;
      g.add(apron);
    }
    target = new THREE.Vector3(0, legH * 0.75, 0);
  } else if (cfg.product === "wall") {
    wallMount = true;
    const portrait = cfg.orientation === "portrait";
    const w = (portrait ? size.h : size.w) * FT, h = (portrait ? size.w : size.h) * FT;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.07), [frame, frame, frame, frame, print, frame]);
    panel.position.set(0, 4.6, 0.06);
    g.add(panel);
    target = new THREE.Vector3(0, 4.6, 0);
  } else {
    wallMount = true;
    const W = size.w * FT, H = W / 1.16;
    const geo = new THREE.ExtrudeGeometry(helmetShape(W, H), { depth: 0.06, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 3, curveSegments: 48 });
    tex.repeat.set(1 / W, 1 / H);
    const shell = new THREE.Mesh(geo, [print, new THREE.MeshPhysicalMaterial({ color: "#151517", roughness: 0.4 })]);
    shell.position.set(-W / 2, 4.6 - H / 2, 0.02);
    g.add(shell);
    // facemask bars (same curves as 2D)
    const bars: number[][] = [
      [0.78, 0.45, 0.93, 0.44, 0.99, 0.56], [0.99, 0.56, 1.0, 0.75, 0.95, 0.93], [0.95, 0.93, 0.82, 0.95, 0.66, 0.86],
      [0.75, 0.64, 0.88, 0.62, 0.995, 0.7], [0.885, 0.49, 0.9, 0.7, 0.86, 0.93],
    ];
    const P = (x: number, y: number, z: number) => new THREE.Vector3(-W / 2 + x * W, 4.6 - H / 2 + (1 - y) * H, z);
    const mask = frameMaterial(cfg.frame || "chrome");
    for (const [a, b, c, d, e, f] of bars) {
      const curve = new THREE.QuadraticBezierCurve3(P(a, b, 0.12), P(c, d, 0.2), P(e, f, 0.14));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.035, 12, false), mask));
    }
    target = new THREE.Vector3(0, 4.6, 0);
  }
  return { group: g, wallMount, target };
}

export function Mockup3D({ config, className = "" }: { config: DesignConfig; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrap.current!;
    let disposed = false;
    let raf = 0;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    const key = new THREE.DirectionalLight("#ffffff", 1.6);
    key.position.set(4, 8, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 6;
    scene.add(key, new THREE.HemisphereLight("#ffffff", "#2a2a2e", 0.35));

    (async () => {
      const img = config.imageUrl ? await loadImage(config.imageUrl).catch(() => null) : null;
      if (disposed) return;
      const tex = new THREE.CanvasTexture(renderPrintTexture(config, img, 1600));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const { group, wallMount, target } = buildScene(config, tex);
      group.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true;
      });
      scene.add(group);

      if (wallMount) {
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), new THREE.MeshStandardMaterial({ color: "#2b2b2f", roughness: 0.95 }));
        wall.position.set(0, 4, -0.02);
        wall.receiveShadow = true;
        scene.add(wall);
        key.position.set(3, 9, 7);
        controls.minAzimuthAngle = -0.6;
        controls.maxAzimuthAngle = 0.6;
        controls.minPolarAngle = Math.PI / 2 - 0.35;
        controls.maxPolarAngle = Math.PI / 2 + 0.2;
      } else {
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.45 }));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.7;
        controls.maxPolarAngle = Math.PI / 2 - 0.08;
      }

      const box = new THREE.Box3().setFromObject(group);
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const dist = (sphere.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))) * (wallMount ? 1.18 : 1.4);
      controls.target.copy(target);
      const dir = wallMount ? new THREE.Vector3(0.18, 0.05, 1).normalize() : new THREE.Vector3(0.75, 0.62, 0.9).normalize();
      camera.position.copy(target).add(dir.multiplyScalar(dist));
      controls.minDistance = dist * 0.55;
      controls.maxDistance = dist * 1.6;
      controls.update();
      setReady(true);
    })();

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const stopSpin = () => (controls.autoRotate = false);
    renderer.domElement.addEventListener("pointerdown", stopSpin);

    const loop = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", stopSpin);
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((x) => {
          (x as THREE.MeshStandardMaterial).map?.dispose();
          x.dispose();
        });
      });
      pmrem.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [config]);

  return (
    <div ref={wrap} className={className.includes("absolute") ? className : `relative ${className}`}>
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-sm text-muted">
          <Loader2 className="animate-spin" size={20} />
        </div>
      )}
      {ready && (
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] text-fg/75 backdrop-blur">
          <Move3d size={12} /> Drag to look around
        </div>
      )}
    </div>
  );
}
