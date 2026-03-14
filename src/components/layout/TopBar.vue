<script setup lang="ts">
/**
 * 顶部导航栏组件
 *
 * 原站行为：
 * - TopBar 位于 HomeSection 的 fixed-cnt 内部
 * - 在首屏可见（logo + 导航菜单），无汉堡按钮
 * - 当 HomeSection scroll progress >= 100% 时，TopBar 跟随 HomeSection 一起被遮罩覆盖
 *   实际效果：离开首屏后 TopBar 消失，由 SideNav 的 toggle-btn 接管
 *
 * 简化实现：TopBar 全局 fixed，通过 watch currentPosition 来 fadeIn/fadeOut
 */
import { ref, watch, onMounted } from 'vue'
import { gsap } from 'gsap'
import { cdnUrl } from '@/utils'
import { useAppStore } from '@/stores/app'

const emit = defineEmits<{
  scrollToSection: [section: string]
}>()

const appStore = useAppStore()
const topBarRef = ref<HTMLElement>()
const logoSrc = cdnUrl('assets/logo-white_08ada2b5.png')

const GITHUB_URL = 'https://github.com/yzwyxjs/ananta-website-study'

const navItems = [
  { label: '首页', key: 'home' },
  { label: '角色', key: 'role' },
  { label: '新闻', key: 'news' },
]

function handleNavClick(key: string) {
  emit('scrollToSection', key)
}

/** 监听当前位置，离开首屏时 fadeOut */
watch(() => appStore.currentPosition, (pos) => {
  if (!topBarRef.value) return
  if (pos === 'home') {
    gsap.to(topBarRef.value, { autoAlpha: 1, duration: 0.3 })
  } else {
    gsap.to(topBarRef.value, { autoAlpha: 0, duration: 0.3 })
  }
})

onMounted(() => {
  gsap.from(topBarRef.value!, {
    y: '-0.74rem',
    duration: 1.3,
    ease: 'power3.out',
  })
})
</script>

<template>
  <div ref="topBarRef" class="top-bar">
    <div class="top-bar-left">
      <img :src="logoSrc" alt="ANANTA" class="main-logo" />
      <nav class="nav-menu">
        <a
          v-for="item in navItems"
          :key="item.key"
          class="nav-item"
          href="javascript:void(0)"
          @click="handleNavClick(item.key)"
        >
          {{ item.label }}
        </a>
        <a class="nav-item" :href="GITHUB_URL" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </nav>
    </div>
  </div>
</template>

<style scoped lang="scss">
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 0.74rem;
  background: $color-bg-dark;
  padding: 0 0.94rem 0 1rem;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: $z-top-bar;
}

.top-bar-left {
  display: flex;
  align-items: center;
}

.main-logo {
  height: 0.4rem;
  margin-right: 1.1rem;
  object-fit: contain;
}

.nav-menu {
  display: flex;
  gap: 0.66rem;
}

.nav-item {
  color: $color-text;
  font-size: 0.16rem;
  font-weight: 450;
  line-height: 0.16rem;
  transition: color $transition-fast;

  &:hover,
  &.active {
    color: $color-primary;
  }
}
</style>
