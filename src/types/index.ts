/**
 * 全局类型定义
 */

/** 页面区块位置标识 */
export type SectionPosition =
  | 'home'
  | 'captain'
  | 'tafei'
  | 'lixi'
  | 'saimo'
  | 'erasure'
  | 'reserve'
  | 'news'

/** 性能模式信息 */
export interface PerformanceMode {
  /** 是否启用低性能模式 */
  isLowPerformance: boolean
  /** 检测来源：auto=自动检测, manual=手动切换 */
  source: 'auto' | 'manual' | 'default'
}

/** 角色信息 */
export interface RoleInfo {
  /** 角色英文标识 */
  id: string
  /** 角色英文名（大写） */
  nameEn: string
  /** 角色中文名 */
  nameCn: string
  /** 角色台词标题 */
  quoteTitle: string
  /** 角色描述 */
  description: string
  /** 角色名位置：left 或 right */
  namePosition: 'left' | 'right'
  /** 角色文本位置：left 或 right */
  msgPosition: 'left' | 'right'
  /** 文本纹理背景图 URL */
  textBgUrl: string
  /** 小标题纹理背景图 URL */
  textSmallBgUrl: string
}

/** 新闻条目 */
export interface NewsItem {
  shortTitle: string
  title: string
  href: string
}

/** 预告视频条目 */
export interface PreviewItem {
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  duration: string
  href: string
}
