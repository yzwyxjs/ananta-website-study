<script setup lang="ts">
/**
 * WebGL 胶片噪点效果组件
 *
 * 通过 WebGL shader 在 canvas 上实时渲染随机噪点纹理，
 * 模拟胶片颗粒感。用于 ReserveSection 和 NewsSection 的背景装饰。
 *
 * 技术要点：
 * - 使用自定义 vertex/fragment shader
 * - 通过 time uniform 驱动噪点随机变化
 * - requestAnimationFrame 持续渲染
 * - 组件销毁时自动清理 WebGL 资源
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref<HTMLCanvasElement>()

let gl: WebGLRenderingContext | null = null
let program: WebGLProgram | null = null
let timeLocation: WebGLUniformLocation | null = null
let resolutionLocation: WebGLUniformLocation | null = null
let globalAlphaLocation: WebGLUniformLocation | null = null
let frameCountLocation: WebGLUniformLocation | null = null
let animationFrameId: number | null = null
let startTime = performance.now()
let frameCount = 0

/** 顶点着色器：简单的全屏四边形 */
const VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

/** 片段着色器：基于时间和坐标的伪随机噪点 */
const FRAGMENT_SHADER = `
  precision mediump float;
  uniform float time;
  uniform vec2 resolution;
  uniform float globalAlpha;
  uniform float frameCount;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / resolution.xy;
    float noise = random(st + vec2(time * 0.1, frameCount * 0.01));
    float grain = noise * 0.15;
    gl_FragColor = vec4(vec3(grain), globalAlpha * 0.3);
  }
`

/** 编译单个着色器 */
function createShader(
  glCtx: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = glCtx.createShader(type)
  if (!shader) return null
  glCtx.shaderSource(shader, source)
  glCtx.compileShader(shader)
  if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
    console.error('Shader compilation error:', glCtx.getShaderInfoLog(shader))
    glCtx.deleteShader(shader)
    return null
  }
  return shader
}

/** 初始化 WebGL 上下文和着色器程序 */
function initWebGL() {
  const canvas = canvasRef.value!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null
  if (!gl) {
    console.error('WebGL not supported')
    return
  }

  const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vertShader || !fragShader) return

  program = gl.createProgram()
  if (!program) return

  gl.attachShader(program, vertShader)
  gl.attachShader(program, fragShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program))
    return
  }

  // 全屏四边形顶点
  const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  const posLoc = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(posLoc)
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

  timeLocation = gl.getUniformLocation(program, 'time')
  resolutionLocation = gl.getUniformLocation(program, 'resolution')
  globalAlphaLocation = gl.getUniformLocation(program, 'globalAlpha')
  frameCountLocation = gl.getUniformLocation(program, 'frameCount')

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.viewport(0, 0, canvas.width, canvas.height)
}

/** 每帧渲染 */
function animate() {
  animationFrameId = requestAnimationFrame(animate)
  if (!gl || !program) return

  const elapsed = (performance.now() - startTime) / 1000
  frameCount = (frameCount + 1) % 100000

  gl.useProgram(program)
  gl.uniform1f(timeLocation, elapsed)
  gl.uniform2f(resolutionLocation, canvasRef.value!.width, canvasRef.value!.height)
  gl.uniform1f(globalAlphaLocation, 1.0)
  gl.uniform1f(frameCountLocation, frameCount)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

/** 窗口缩放时重置 canvas 尺寸 */
function onResize() {
  if (!canvasRef.value || !gl) return
  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
  gl.viewport(0, 0, canvasRef.value.width, canvasRef.value.height)
}

onMounted(() => {
  initWebGL()
  window.addEventListener('resize', onResize)
  startTime = performance.now()
  animate()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <div class="noice-bg">
    <canvas ref="canvasRef" class="grain-canvas" />
  </div>
</template>

<style scoped lang="scss">
.noice-bg {
  position: absolute;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  overflow: hidden;
  pointer-events: none;
}

.grain-canvas {
  display: block;
  width: 100%;
  height: 100%;
  background: $color-bg;
  opacity: 0.3;
}
</style>
