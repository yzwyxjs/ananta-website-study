/**
 * 全局状态管理（Pinia）
 * 管理页面位置、性能模式、BGM 状态等跨组件共享状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SectionPosition, PerformanceMode } from '@/types'

export const useAppStore = defineStore('app', () => {
  /* ====== 页面当前区块位置 ====== */
  const currentPosition = ref<SectionPosition>('home')

  function setCurrentPosition(position: SectionPosition) {
    currentPosition.value = position
  }

  /* ====== 低性能模式 ====== */
  const performanceMode = ref<PerformanceMode>(
    loadPerformanceMode()
  )

  const isLowPerformance = computed(
    () => performanceMode.value.isLowPerformance
  )

  function setPerformanceMode(mode: PerformanceMode) {
    performanceMode.value = mode
    localStorage.setItem('lowPerformanceMode', JSON.stringify(mode))
  }

  /** 从 localStorage 恢复性能模式设置 */
  function loadPerformanceMode(): PerformanceMode {
    try {
      const saved = localStorage.getItem('lowPerformanceMode')
      if (saved) return JSON.parse(saved)
    } catch { /* 解析失败则使用默认值 */ }
    return { isLowPerformance: false, source: 'default' }
  }

  /* ====== BGM 状态 ====== */
  const bgmPaused = ref(true)

  function setBgmPaused(paused: boolean) {
    bgmPaused.value = paused
  }

  /* ====== 加载状态 ====== */
  const loadingComplete = ref(false)

  function setLoadingComplete(complete: boolean) {
    loadingComplete.value = complete
  }

  /* ====== 滚动锁定（画廊弹窗打开时） ====== */
  const scrollLocked = ref(false)

  function setScrollLocked(locked: boolean) {
    scrollLocked.value = locked
  }

  return {
    currentPosition,
    setCurrentPosition,
    performanceMode,
    isLowPerformance,
    setPerformanceMode,
    bgmPaused,
    setBgmPaused,
    loadingComplete,
    setLoadingComplete,
    scrollLocked,
    setScrollLocked,
  }
})
