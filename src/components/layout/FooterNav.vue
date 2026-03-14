<script setup lang="ts">
/**
 * 底部页脚导航组件
 * 工作室 Logo + 游戏平台图标 + 学习声明 + 外部链接
 */
import { cdnUrl } from '@/utils'

const GITHUB_URL = 'https://github.com/yzwyxjs/ananta-website-study'
const OFFICIAL_URL = 'https://ananta.163.com/'

const studioLogoSrc = cdnUrl('assets/icon-studio_68622482.svg')

const platformIcons = [
  { src: cdnUrl('assets/icon-ps5_f831b75b.svg'), alt: 'PS5' },
  { src: cdnUrl('assets/icon-pc_444ebb0b.svg'), alt: 'PC' },
  { src: cdnUrl('assets/icon-apple_f3c9614f.svg'), alt: 'Apple' },
  { src: cdnUrl('assets/icon-android_0c60eeac.svg'), alt: 'Android' },
  { src: cdnUrl('assets/icon-cloud_255f3efa.svg'), alt: 'Cloud' },
]
</script>

<template>
  <div class="footer-nav">
    <!-- 上半部分：工作室 Logo + 平台图标 -->
    <div class="footer-main">
      <div class="footer-left">
        <div class="studio-logo">
          <img :src="studioLogoSrc" alt="Naked Rain" />
        </div>
      </div>

      <div class="footer-right">
        <div class="game-icons">
          <span v-for="icon in platformIcons" :key="icon.alt" class="game-icon">
            <img :src="icon.src" :alt="icon.alt" />
          </span>
          <span class="game-more">and more...</span>
        </div>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="footer-divider" />

    <!-- 下半部分：学习声明 + 链接 -->
    <div class="footer-disclaimer">
      <p class="disclaimer-text">
        本项目仅供学习、研究网页效果使用，并非《无限大》官方网站
      </p>
      <div class="disclaimer-links">
        <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" class="disclaimer-link">
          <svg class="link-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          GitHub 仓库
        </a>
        <span class="link-sep">·</span>
        <a :href="OFFICIAL_URL" target="_blank" rel="noopener noreferrer" class="disclaimer-link">
          《无限大》官方网站
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.footer-nav {
  position: relative;
  z-index: 10;
  padding: 0 1rem;
  margin-top: 2rem;
  padding-bottom: 0.6rem;
}

.footer-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.studio-logo img {
  height: 0.6rem;
  opacity: 0.6;
}

.game-icons {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.game-icon img {
  height: 0.24rem;
  opacity: 0.5;
  transition: opacity $transition-fast;
  &:hover { opacity: 0.8; }
}

.game-more {
  color: rgba($color-text, 0.4);
  font-size: 0.14rem;
  font-style: italic;
}

.footer-divider {
  height: 1px;
  background: rgba($color-text, 0.1);
  margin: 0.4rem 0 0.32rem;
}

.footer-disclaimer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.14rem;
}

.disclaimer-text {
  color: rgba($color-text, 0.35);
  font-size: 0.13rem;
  letter-spacing: 0.02rem;
  text-align: center;
}

.disclaimer-links {
  display: flex;
  align-items: center;
  gap: 0.12rem;
}

.link-sep {
  color: rgba($color-text, 0.2);
  font-size: 0.14rem;
  user-select: none;
}

.disclaimer-link {
  display: inline-flex;
  align-items: center;
  gap: 0.05rem;
  color: rgba($color-text, 0.4);
  font-size: 0.12rem;
  letter-spacing: 0.01rem;
  transition: color 0.25s;

  &:hover {
    color: $color-primary;
  }
}

.link-icon {
  width: 0.14rem;
  height: 0.14rem;
  flex-shrink: 0;
}
</style>
