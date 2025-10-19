import { PointerEventTypes } from "babylonjs";
import { INPUT_KEYS } from "../../constants";
import type { PlacementToolDefinition, ToolRuntimeContext } from "../placementTypes";

const TOOL_ID = "delete";

const pickRemovable = (context: ToolRuntimeContext) =>
  context.scene.pick(
    context.scene.pointerX,
    context.scene.pointerY,
    (mesh) => {
      const metadata = mesh?.metadata as { toolId?: unknown } | undefined;
      return typeof metadata?.toolId === "string";
    },
  );

export const deleteToolDefinition: PlacementToolDefinition = {
  id: TOOL_ID,
  label: "Remover",
  icon: "✖",
  hotkey: INPUT_KEYS.deleteMode,
  create: (context: ToolRuntimeContext) => {
    const clear = () => {
      context.highlight(null);
      context.ghost.hide();
    };

    return {
      id: TOOL_ID,
      onActivate: () => {
        clear();
      },
      onDeactivate: () => {
        clear();
      },
      onPointerLockChange: (isLocked: boolean) => {
        if (!isLocked) {
          clear();
        }
      },
      onPointerMove: (pointerInfo) => {
        if (pointerInfo.type !== PointerEventTypes.POINTERMOVE) {
          return;
        }

        const pick = pickRemovable(context);
        if (!context.withinRange(pick?.pickedPoint)) {
          clear();
          return;
        }

        const mesh = pick?.pickedMesh;
        if (!mesh) {
          context.highlight(null);
          return;
        }

        context.highlight(mesh);
        context.ghost.hide();
      },
      onPointerDown: (pointerInfo) => {
        if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) {
          return;
        }
        if (pointerInfo.event.button !== 0) {
          return;
        }

        const pick = pickRemovable(context);
        if (!context.withinRange(pick?.pickedPoint)) {
          return;
        }

        if (context.removeMesh(pick?.pickedMesh ?? null)) {
          context.highlight(null);
        }
      },
      dispose: () => {
        clear();
      },
    };
  },
};
