import { useEffect, useRef } from "react";
import { createSceneContext } from "./core/sceneContext";
import { createGhostSet } from "./placement/ghosts";
import { createPlacementController } from "./placement/placementController";
import { createShadowNetwork } from "./lighting/shadowNetwork";

export function ShipBuilderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const sceneContext = createSceneContext(canvas);
    const ghostSet = createGhostSet(sceneContext.scene);
    const shadowNetwork = createShadowNetwork(sceneContext.keyShadow);
    shadowNetwork.registerStatic([sceneContext.floor, ...sceneContext.staticMeshes]);

    const placementController = createPlacementController({
      scene: sceneContext.scene,
      canvas,
      camera: sceneContext.camera,
      ghostSet,
      shadowNetwork,
    });

    return () => {
      placementController.dispose();
      ghostSet.dispose();
      shadowNetwork.dispose();
      sceneContext.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}

