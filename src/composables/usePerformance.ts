/**
 * 性能检测 composable
 * 检测设备硬件能力，决定是否启用低性能模式（静态图片替代视频）
 *
 * 检测维度：
 * - WebGL 支持与硬件加速
 * - CPU 核心数
 * - 设备内存
 * - 关键 API 支持（fetch、WebGL）
 */

import type { PerformanceMode } from '@/types'

export function usePerformance() {
  /**
   * 综合检测设备性能等级
   * @returns 'high' | 'low'
   */
  function detectPerformanceLevel(): PerformanceMode {
    try {
      const cores = navigator.hardwareConcurrency || 4
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4
      const hasWebGL = checkWebGLSupport()
      const hasFetch = typeof fetch === 'function'

      // 低性能判定条件：核心数<4 或 内存<4GB 或 不支持 WebGL
      const isLow = cores < 4 || memory < 4 || !hasWebGL || !hasFetch

      return {
        isLowPerformance: isLow,
        source: 'auto',
      }
    } catch {
      return { isLowPerformance: false, source: 'auto' }
    }
  }

  /** 检测 WebGL 是否可用 */
  function checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      return !!gl
    } catch {
      return false
    }
  }

  return {
    detectPerformanceLevel,
    checkWebGLSupport,
  }
}
