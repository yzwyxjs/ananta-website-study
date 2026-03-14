/**
 * 工具函数集合
 */

/** 资源 CDN 基础路径 */
const CDN_BASE = 'https://ananta.res.netease.com/pc/gw/20250901145208'

/**
 * 获取 CDN 资源完整 URL
 * @param path - 资源路径，如 'assets/logo-black_c8d68f2f.png'
 */
export function cdnUrl(path: string): string {
  return `${CDN_BASE}/${path}`
}

/**
 * 设置 rem 基准值
 * 原站方案：设计稿宽度 1920px，1rem = 100px
 * 公式：html font-size = 视口宽度 / 19.2
 * 这样 0.16rem = 16px, 0.74rem = 74px, 1.04rem = 104px
 */
export function setRemBase(): void {
  const docEl = document.documentElement
  const DESIGN_WIDTH = 19.2 // 1920 / 100 = 19.2
  const recalc = () => {
    const clientWidth = docEl.clientWidth || window.innerWidth
    docEl.style.fontSize = `${clientWidth / DESIGN_WIDTH}px`
  }
  recalc()
  window.addEventListener('resize', recalc)
  window.addEventListener('orientationchange', recalc)
}

/**
 * 格式化预约数字：每三位加逗号
 * @param num - 原始数字
 * @returns 格式化后的字符串，如 "12,345,678"
 */
export function formatNumber(num: number): string {
  return Math.floor(num)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

/**
 * 限制值在 [min, max] 范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
