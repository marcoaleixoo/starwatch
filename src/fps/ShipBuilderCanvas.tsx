import { useEffect, useRef } from "react";
import { createSceneContext } from "./core/sceneContext";
import { createGhostSet } from "./placement/ghosts";
import { createPlacementController } from "./placement/placementController";
import { createShadowNetwork } from "./lighting/shadowNetwork";

export function ShipBuilderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const sceneContext = createSceneContext(canvas);
    const ghostSet = createGhostSet(sceneContext.scene);
    const shadowNetwork = createShadowNetwork(
      sceneContext.structuralLamps.map((lamp) => lamp.shadow),
    );
    const staticMeshes = [
      sceneContext.floor,
      ...sceneContext.staticMeshes,
      ...sceneContext.structuralLamps.map((lamp) => lamp.mesh),
    ];
    sceneContext.structuralLamps.forEach((lamp) => {
      shadowNetwork.attachLamp(lamp);
    });
    shadowNetwork.registerStatic(staticMeshes);

    const placementController = createPlacementController({
      scene: sceneContext.scene,
      canvas,
      camera: sceneContext.camera,
      ghostSet,
      shadowNetwork,
    });

    let statsHandle = 0;
    let lastSample = 0;
    const updateOverlay = (timestamp: number) => {
      statsHandle = requestAnimationFrame(updateOverlay);
      if (!overlayRef.current) {
        return;
      }
      if (timestamp - lastSample < 250) {
        return;
      }
      lastSample = timestamp;

      const fps = sceneContext.engine.getFps();
      const meshCount = sceneContext.scene.meshes.length;
      const lightCount = sceneContext.scene.lights.length;
      const shadowedLights = sceneContext.scene.lights.filter((light) => light.shadowEnabled).length;
      const camera = sceneContext.camera.position;

      overlayRef.current.textContent = [
        `FPS: ${fps.toFixed(1)}`,
        `Meshes: ${meshCount}`,
        `Lights: ${lightCount} (shadowed: ${shadowedLights})`,
        `Camera: (${camera.x.toFixed(2)}, ${camera.y.toFixed(2)}, ${camera.z.toFixed(2)})`,
      ].join("\n");
    };
    statsHandle = requestAnimationFrame(updateOverlay);

    return () => {
      placementController.dispose();
      ghostSet.dispose();
      shadowNetwork.dispose();
      sceneContext.dispose();
      cancelAnimationFrame(statsHandle);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      <div
        ref={overlayRef}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          padding: "10px 14px",
          background: "rgba(8, 10, 16, 0.82)",
          color: "#d8f1ff",
          fontFamily: "monospace",
          fontSize: "12px",
          lineHeight: "16px",
          whiteSpace: "pre",
          borderRadius: 8,
          border: "1px solid rgba(95, 136, 180, 0.45)",
          pointerEvents: "none",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
          textShadow: "0 0 6px rgba(40, 132, 210, 0.4)",
        }}
      />
    </div>
  );
}
