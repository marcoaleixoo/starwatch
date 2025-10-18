import { ShipBuilderCanvas } from "./fps/ShipBuilderCanvas";

export default function App() {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#05060a",
        color: "#f1f5f9",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      <ShipBuilderCanvas />
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          padding: "12px 16px",
          background: "rgba(15, 23, 42, 0.72)",
          border: "1px solid rgba(148, 163, 184, 0.32)",
          borderRadius: 8,
          maxWidth: 360,
          backdropFilter: "blur(10px)",
        }}
      >
        <h1 style={{ fontSize: 18, margin: "0 0 8px" }}>Ship Builder MVP</h1>
        <p style={{ margin: "6px 0", fontSize: 13, lineHeight: 1.4 }}>
          Explore the hangar in first-person and experiment with dropping walls
          inside the rectangular hull. This pass focuses on grid snapping and
          quick prototyping of construction flow.
        </p>
        <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 13 }}>
          <li>WASD — move</li>
          <li>Mouse — look (click canvas to lock)</li>
          <li>Left click — place wall</li>
          <li>Right click — remove wall</li>
          <li>R — rotate placement (90° steps)</li>
          <li>Shift — sprint</li>
          <li>Esc — release cursor lock</li>
        </ul>
      </div>
    </div>
  );
}
