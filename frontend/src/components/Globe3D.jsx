import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * Globe3D — A rotating 3D Earth-like wireframe globe rendered with Three.js.
 * Pure canvas, no react-three-fiber required.
 */
export default function Globe3D({ size = 320, opacity = 0.7 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const W = size, H = size;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current?.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.z = 2.8;

    // Sphere geometry
    const radius = 1;
    const geo = new THREE.SphereGeometry(radius, 48, 48);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x0f3b6f,
      emissive: 0x0a1f3a,
      transparent: true,
      opacity: opacity * 0.85,
      wireframe: false,
    });
    const sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);

    // Wireframe overlay
    const wireGeo = new THREE.SphereGeometry(radius + 0.01, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);

    // Glowing atmosphere halo
    const haloGeo = new THREE.SphereGeometry(radius + 0.08, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(haloGeo, haloMat));

    // Particle stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 20;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Orbit arc ring
    const ringGeo = new THREE.TorusGeometry(radius + 0.2, 0.003, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    scene.add(ring);

    // Lights
    const ambient = new THREE.AmbientLight(0x334155, 2);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(0x38bdf8, 4, 10);
    pointLight.position.set(3, 2, 3);
    scene.add(pointLight);
    const backLight = new THREE.PointLight(0x1e40af, 2, 10);
    backLight.position.set(-3, -1, -3);
    scene.add(backLight);

    // Animation
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      sphere.rotation.y += 0.003;
      wire.rotation.y += 0.002;
      ring.rotation.z += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [size, opacity]);

  return <div ref={mountRef} style={{ width: size, height: size, flexShrink: 0 }} />;
}
