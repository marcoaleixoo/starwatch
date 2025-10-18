import { useEffect, useRef, useState } from "react";
import { createSceneContext } from "./core/sceneContext";
import { createGhostSet } from "./placement/ghosts";
import { createPlacementController } from "./placement/placementController";
import type { PlacementController } from "./placement/placementController";
import { createShadowNetwork } from "./lighting/shadowNetwork";
import type { PlacementMode, PlacementState } from "./types";

export function ShipBuilderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<PlacementController | null>(null);
  const [placementState, setPlacementState] = useState<PlacementState>({
    mode: "wall",
    rotation: 0,
    lampColorIndex: 0,
  });

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
    const staticMeshes = [sceneContext.floor, ...sceneContext.staticMeshes];
    sceneContext.structuralLamps.forEach((lamp) => {
      shadowNetwork.registerDynamic(lamp.mesh);
      shadowNetwork.attachLamp(lamp);
    });
    shadowNetwork.registerStatic(staticMeshes);

    const placementController = createPlacementController({
      scene: sceneContext.scene,
      canvas,
      camera: sceneContext.camera,
      ghostSet,
      shadowNetwork,
      initialLamps: sceneContext.structuralLamps,
    });
    controllerRef.current = placementController;
    const unsubscribePlacement = placementController.subscribe(setPlacementState);

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
      unsubscribePlacement();
      placementController.dispose();
      controllerRef.current = null;
      ghostSet.dispose();
      shadowNetwork.dispose();
      sceneContext.dispose();
      cancelAnimationFrame(statsHandle);
    };
  }, []);

  const handleModeClick = (mode: PlacementMode) => () => {
    controllerRef.current?.setMode(mode);
  };

  const toolbarItems: Array<{ mode: PlacementMode; label: string; hint: string; icon: string }> = [
    { mode: "wall", label: "Parede", hint: "1", icon: "▭" },
    { mode: "lamp", label: "Lâmpada", hint: "2", icon: "◎" },
    { mode: "delete", label: "Remover", hint: "3", icon: "✖" },
  ];

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
        style={{
          position: "absolute",
          left: "50%",
          bottom: 24,
          transform: "translateX(-50%)",
          display: "flex",
          gap: 12,
          padding: "10px 16px",
          borderRadius: 18,
          background: "rgba(8, 10, 16, 0.76)",
          border: "1px solid rgba(88, 126, 168, 0.45)",
          boxShadow: "0 10px 32px rgba(0, 0, 0, 0.44)",
          backdropFilter: "blur(9px)",
        }}
      >
        {toolbarItems.map((item) => {
          const isActive = placementState.mode === item.mode;
          return (
            <button
              key={item.mode}
              type="button"
              onClick={handleModeClick(item.mode)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 76,
                padding: "10px 14px 8px",
                borderRadius: 12,
                border: isActive
                  ? "1px solid rgba(160, 210, 255, 0.8)"
                  : "1px solid rgba(120, 168, 220, 0.35)",
                background: isActive ? "rgba(56, 120, 200, 0.45)" : "rgba(22, 28, 40, 0.68)",
                color: isActive ? "#e8f6ff" : "#9db6d4",
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "13px",
                letterSpacing: "0.02em",
                cursor: "pointer",
                transition: "background 120ms ease, transform 120ms ease, border-color 120ms ease",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  marginBottom: 6,
                }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
              <span
                style={{
                  fontSize: "11px",
                  marginTop: 4,
                  opacity: 0.72,
                }}
              >
                [{item.hint}]
              </span>
            </button>
          );
        })}
      </div>
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
