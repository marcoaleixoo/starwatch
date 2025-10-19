import type { PlacementToolDefinition } from "../placementTypes";
import { deleteToolDefinition } from "./deleteTool";
import { lampToolDefinition } from "./lampTool";
import { wallToolDefinition } from "./wallTool";

export const TOOL_DEFINITIONS: PlacementToolDefinition[] = [
  wallToolDefinition,
  lampToolDefinition,
  deleteToolDefinition,
];

export const TOOL_DEFINITION_BY_ID = new Map<string, PlacementToolDefinition>(
  TOOL_DEFINITIONS.map((definition) => [definition.id, definition]),
);
