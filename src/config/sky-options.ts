/**
 * Configurações globais do firmamento, responsáveis pelo fundo escuro e estrelas.
 */
export const SKY_CLEAR_COLOR: [number, number, number, number] = [0.003, 0.006, 0.03, 1];

/**
 * Raio da esfera que envolve a câmera para renderizar o starfield (em metros).
 * Deve ser bem maior que o horizonte para evitar clipping com chunks.
 */
export const STARFIELD_RADIUS_METERS = 6_500;

/**
 * Controla a densidade de estrelas no shader. Valores mais altos = mais pontos brilhantes.
 */
export const STARFIELD_DENSITY = 420;

/**
 * Fator global aplicado ao brilho das estrelas.
 */
export const STARFIELD_INTENSITY = 5.5;

/**
 * Intervalo base de cintilação (segundos) usado pelo shader. O valor é combinado
 * com seeds randômicas para gerar variação entre estrelas.
 */
export const STARFIELD_TWINKLE_BASE_SPEED = 1.05;

/**
 * Paleta de cores para as estrelas (interpoladas no shader).
 */
export const STARFIELD_COLOR_A: [number, number, number] = [0.72, 0.82, 1];
export const STARFIELD_COLOR_B: [number, number, number] = [0.94, 0.97, 1];

/**
 * Janela de valores usada para determinar quais amostras viram estrelas.
 * Reduza para ver mais pontos brilhantes.
 */
export const STARFIELD_THRESHOLD_LOW = 0.68;
export const STARFIELD_THRESHOLD_HIGH = 0.97;
