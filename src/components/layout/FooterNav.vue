<script setup lang="ts">
/**
 * 底部页脚导航组件
 * 工作室 Logo + 游戏平台图标（移除了商业合作/人才招聘/隐私链接）
 */
import { cdnUrl } from '@/utils'

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
</template>

<style scoped lang="scss">
.footer-nav {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 1rem;
  margin-top: 2rem;
  padding-bottom: 0.88rem;
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
</style>
