/**
 * Lenis 平滑滚动 composable
 * 负责初始化 Lenis 实例并与 GSAP ScrollTrigger 联动
 *
 * 联动原理：
 * 1. Lenis 接管浏览器原生滚动，提供 lerp 插值平滑效果
 * 2. 每帧滚动时通过 on("scroll") 通知 ScrollTrigger 更新
 * 3. GSAP ticker 驱动 Lenis 的 raf 循环，保证帧同步
 */

import { ref, onUnmounted } from 'vue'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** 全局 Lenis 单例 */
let lenisInstance: Lenis | null = null

/** GSAP ticker 回调引用（用于清理） */
let tickerCallback: ((time: number) => void) | null = null

export function useLenis() {
  const isReady = ref(false)

  /**
   * 初始化 Lenis 并建立 GSAP 联动
   * 配置参数与原站保持一致
   */
  function init() {
    if (lenisInstance) {
      isReady.value = true
      return lenisInstance
    }

    lenisInstance = new Lenis({
      autoResize: true,
      lerp: 0.1,
      easing: (t: number) => t * (2 - t), // easeOutQuad
      smoothWheel: true,
    })

    // Lenis 每帧滚动时同步更新 ScrollTrigger
    lenisInstance.on('scroll', ScrollTrigger.update)

    // 用 GSAP ticker 驱动 Lenis 的帧循环
    tickerCallback = (time: number) => {
      lenisInstance?.raf(time * 1000)
    }
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    isReady.value = true
    return lenisInstance
  }

  /** 滚动到指定位置 */
  function scrollTo(target: number | string | HTMLElement, options?: { immediate?: boolean }) {
    if (lenisInstance) {
      lenisInstance.scrollTo(target, options)
    } else {
      window.scrollTo(0, typeof target === 'number' ? target : 0)
    }
  }

  /** 停止滚动（如打开弹窗时） */
  function stop() {
    lenisInstance?.stop()
  }

  /** 恢复滚动 */
  function start() {
    lenisInstance?.start()
  }

  /** 销毁实例并清理监听 */
  function destroy() {
    if (tickerCallback) {
      gsap.ticker.remove(tickerCallback)
      tickerCallback = null
    }
    lenisInstance?.destroy()
    lenisInstance = null
    isReady.value = false
  }

  /** 获取当前 Lenis 实例 */
  function getInstance() {
    return lenisInstance
  }

  onUnmounted(() => {
    // 组件卸载时不销毁全局实例，仅在 App 卸载时销毁
  })

  return {
    isReady,
    init,
    scrollTo,
    stop,
    start,
    destroy,
    getInstance,
  }
}
