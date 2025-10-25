/** Frequência (Hz) do tick global de energia. */
export const ENERGY_TICK_HZ = 1;
export const ENERGY_TICK_INTERVAL_SEC = 1 / ENERGY_TICK_HZ;

/** Potência nominal de um painel sem sombra. */
export const PANEL_BASE_W = 120;

/** Número máximo de raios usados no sombreamento por painel. */
export const PANEL_RAY_COUNT = 8;

/** Distância máxima percorrida pelos raios (em blocos). */
export const PANEL_MAX_RAY_DISTANCE = 64;

/** Passo (em blocos) ao avançar cada raio. */
export const PANEL_RAY_STEP = 0.5;

/**
 * Offsets em relação ao centro do painel para amostrar sombras.
 * A lista pode ser extendida; o sistema usa os primeiros `PANEL_RAY_COUNT` valores.
 */
export const PANEL_SAMPLE_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-0.25, -0.25],
  [0.25, -0.25],
  [-0.25, 0.25],
  [0.25, 0.25],
  [0, 0],
  [-0.25, 0],
  [0.25, 0],
  [0, 0.25],
];

/** Direção normalizada da luz solar usada no slice (apontando levemente para leste). */
export const SUN_DIRECTION: readonly [number, number, number] = normalize([0.25, 1, 0.15]);

/** Capacidade padrão da bateria pequena (MJ). */
export const BATTERY_SMALL_MJ = 5;

/** Margem para evitar ruído numérico quando acumulando flutuações de energia. */
export const ENERGY_EPSILON = 1e-6;

function normalize(vector: [number, number, number]): [number, number, number] {
  const [x, y, z] = vector;
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len];
}
