/**
 * Configurações globais do firmamento, responsáveis pelo fundo escuro e estrelas.
 */
export const SKY_CLEAR_COLOR: [number, number, number, number] = [0.12, 0.05, 0.2, 1];

/**
 * Raio da esfera que envolve a câmera para renderizar o starfield (em metros).
 * Deve ser bem maior que o horizonte para evitar clipping com chunks.
 */
export const STARFIELD_RADIUS_METERS = 8_000;

/**
 * Controla a densidade de estrelas no shader. Valores mais altos = mais pontos brilhantes.
 */
export const STARFIELD_DENSITY = 100;

/**
 * Fator global aplicado ao brilho das estrelas.
 */
export const STARFIELD_INTENSITY = 1.2;

/**
 * Intervalo base de cintilação (segundos) usado pelo shader. O valor é combinado
 * com seeds randômicas para gerar variação entre estrelas.
 */
export const STARFIELD_TWINKLE_BASE_SPEED = 0.85;

/**
 * Paleta de cores para as estrelas (interpoladas no shader).
 */
export const STARFIELD_COLOR_A: [number, number, number] = [0.46, 0.62, 1];
export const STARFIELD_COLOR_B: [number, number, number] = [1, 0.93, 0.76];

/**
 * Probabilidade base de uma célula gerar estrela (0-1). Ajuste para controlar quantidade.
 */
export const STARFIELD_STAR_PROBABILITY = 0.12;

/**
 * Raio mínimo/máximo (em unidades da célula) para as estrelas renderizadas no shader.
 */
export const STARFIELD_STAR_RADIUS_MIN = 0.08;
export const STARFIELD_STAR_RADIUS_MAX = 0.12;

/**
 * Intensidade base aplicada ao glow de fundo antes das estrelas. Ajuda a evitar céu completamente preto.
 */
export const STARFIELD_BACKGROUND_INTENSITY = 0.015;

/**
 * Intensidade máxima aplicada à textura de nebulosa ao misturar com o fundo procedural.
 */
export const STARFIELD_NEBULA_INTENSITY = 0.65;

/**
 * Exponente aplicado após a amostragem para controlar contraste (gamma-like).
 */
export const STARFIELD_NEBULA_CONTRAST = 1.4;

/**
 * Quantidade de estrelas "próximas" (instâncias finas) que adicionam paralaxe visível.
 * Mantenha o valor baixo o suficiente para evitar perda de performance em mobile.
 */
export const STARFIELD_NEAR_COUNT = 2_400;

/**
 * Raio da esfera relativa ao jogador onde as estrelas próximas orbitam (em metros).
 * Valores altos reduzem o parallax, valores baixos deixam o movimento muito evidente.
 */
export const STARFIELD_NEAR_SPHERE_RADIUS_METERS = 9_500;

/**
 * Faixa de diâmetros (em metros) para as sprites das estrelas próximas.
 */
export const STARFIELD_NEAR_SIZE_MIN = 8;
export const STARFIELD_NEAR_SIZE_MAX = 22;

/**
 * Intensidade mínima/máxima aplicada às estrelas próximas. O shader do material
 * interpola estes limites ao multiplicar pelo brilho individual.
 */
export const STARFIELD_NEAR_INTENSITY_MIN = 0.7;
export const STARFIELD_NEAR_INTENSITY_MAX = 1.5;

/**
 * Amplitude da cintilação (0-1). Controla o quanto o brilho pode variar em torno da intensidade base.
 */
export const STARFIELD_NEAR_TWINKLE_AMPLITUDE = 0.4;

/**
 * Fator global de velocidade da cintilação. Seeds individuais multiplicam essa constante.
 */
export const STARFIELD_NEAR_TWINKLE_SPEED = 1.1;

/**
 * Velocidade de rotação lenta (graus por segundo) aplicada à esfera de estrelas próximas.
 * Ajuda a evitar padrões repetitivos quando o jogador fica parado.
 */
export const STARFIELD_NEAR_ROTATION_SPEED_DEG = 0.018;

/**
 * Fator multiplicador aplicado à posição da câmera para gerar um leve parallax.
 * Valores muito altos criam distorções exageradas.
 */
export const STARFIELD_NEAR_PARALLAX_SCALE = 0.00003;
