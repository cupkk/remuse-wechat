import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Work } from "../app/types";

interface VanillaSphereGalleryProps {
  works: Work[];
  onWorkClick: (item: Work) => void;
}

export function VanillaSphereGallery({ works, onWorkClick }: VanillaSphereGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 10.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const count = 24;
    const phi = Math.PI * (3 - Math.sqrt(5));
    const meshes: THREE.Mesh[] = [];
    const fallbackColors = ["#39ff14", "#1b5e20", "#1e3a8a", "#0d9488", "#312e81", "#059669", "#2563eb", "#10b981"];
    const textureLoader = new THREE.TextureLoader();
    const textures: THREE.Texture[] = [];

    for (let i = 0; i < count; i += 1) {
      const y = 1 - (i / Math.max(count - 1, 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const workItem = works[i] ?? createEmptySlot(i);

      const geometry = new THREE.PlaneGeometry(0.92, 1.18);
      const material = createCardMaterial(workItem, fallbackColors[i % fallbackColors.length], textureLoader, textures);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x * 3.55, y * 3.55 - 0.24, z * 3.55);
      mesh.lookAt(0, 0, 0);
      mesh.userData = {
        item: workItem,
        floatOffset: Math.random() * Math.PI * 2,
        basePosition: mesh.position.clone()
      };

      group.add(mesh);
      meshes.push(mesh);
    }

    let isDragging = false;
    let startMousePosition = { clientX: 0, clientY: 0 };
    let previousMousePosition = { clientX: 0, clientY: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const updateMousePosition = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = (clientX: number, clientY: number) => {
      updateMousePosition(clientX, clientY);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(group.children);
      if (intersects.length > 0) {
        onWorkClick(intersects[0].object.userData.item as Work);
        return;
      }

      const firstRealWork = works.find((work) => !work.isPlaceholder);
      if (firstRealWork) {
        onWorkClick(firstRealWork);
      }
    };

    const getPointer = (event: MouseEvent | TouchEvent) => {
      if ("touches" in event) {
        return { clientX: event.touches[0].clientX, clientY: event.touches[0].clientY };
      }
      return { clientX: event.clientX, clientY: event.clientY };
    };

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      isDragging = true;
      const pointer = getPointer(event);
      startMousePosition = pointer;
      previousMousePosition = pointer;
    };

    const onPointerMove = (event: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const pointer = getPointer(event);
      const deltaX = pointer.clientX - previousMousePosition.clientX;
      const deltaY = pointer.clientY - previousMousePosition.clientY;
      group.rotation.y += deltaX * 0.005;
      group.rotation.x += deltaY * 0.005;
      previousMousePosition = pointer;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onClickEvent = (event: MouseEvent) => {
      const dist = Math.hypot(event.clientX - startMousePosition.clientX, event.clientY - startMousePosition.clientY);
      if (dist < 5) handleClick(event.clientX, event.clientY);
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        const dist = Math.hypot(touch.clientX - startMousePosition.clientX, touch.clientY - startMousePosition.clientY);
        if (dist < 5) handleClick(touch.clientX, touch.clientY);
      }
      isDragging = false;
    };

    container.addEventListener("mousedown", onPointerDown);
    container.addEventListener("mousemove", onPointerMove);
    container.addEventListener("mouseup", onPointerUp);
    container.addEventListener("mouseleave", onPointerUp);
    container.addEventListener("click", onClickEvent);
    container.addEventListener("touchstart", onPointerDown, { passive: true });
    container.addEventListener("touchmove", onPointerMove, { passive: true });
    container.addEventListener("touchend", onTouchEnd);

    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (!isDragging) {
        group.rotation.y += 0.002;
        group.rotation.x += 0.0005;
      }

      meshes.forEach((mesh) => {
        const basePosition = mesh.userData.basePosition as THREE.Vector3;
        const floatOffset = mesh.userData.floatOffset as number;
        mesh.position.y = basePosition.y + Math.sin(time * 2 + floatOffset) * 0.1;
        mesh.position.x = basePosition.x + Math.cos(time * 1.5 + floatOffset) * 0.1;
        mesh.lookAt(0, 0, 0);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onPointerDown);
      container.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("mouseup", onPointerUp);
      container.removeEventListener("mouseleave", onPointerUp);
      container.removeEventListener("click", onClickEvent);
      container.removeEventListener("touchstart", onPointerDown);
      container.removeEventListener("touchmove", onPointerMove);
      container.removeEventListener("touchend", onTouchEnd);
      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => material.dispose());
        } else {
          mesh.material.dispose();
        }
      });
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [works, onWorkClick]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

function createCardMaterial(
  workItem: Work,
  fallbackColor: string,
  textureLoader: THREE.TextureLoader,
  textures: THREE.Texture[]
) {
  const baseOptions = {
    transparent: true,
    opacity: workItem.isPlaceholder ? 0.46 : 0.9,
    side: THREE.DoubleSide
  };

  if (!workItem.isPlaceholder && workItem.imageUrl) {
    const texture = textureLoader.load(workItem.imageUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    textures.push(texture);
    return new THREE.MeshBasicMaterial({
      ...baseOptions,
      map: texture,
      color: new THREE.Color("#ffffff")
    });
  }

  return new THREE.MeshBasicMaterial({
    ...baseOptions,
    color: new THREE.Color(workItem.colorHex ? `#${workItem.colorHex}` : fallbackColor)
  });
}

function createEmptySlot(index: number): Work {
  return {
    id: `empty-slot-${index}`,
    title: "空展位",
    date: "",
    description: "",
    moodText: "",
    colorHex: ["16271f", "1d3428", "26371f", "12302c"][index % 4],
    imageUrl: null,
    isPlaceholder: true
  };
}
