<script setup lang="ts">
/**
 * 侧边导航面板组件
 *
 * 原站行为（逆向确认）：
 * - 汉堡按钮（toggle-btn）是 SideNav 的一部分，默认 display:none
 * - 通过 toggleSideNavActive 事件控制 fadeIn/hide
 * - 打开面板时汉堡两条线 CSS transition 旋转为 X
 * - 面板从右侧滑入，背景毛玻璃
 * - 菜单项：首页、角色、新闻中心
 */
import { ref, watch, computed, onMounted } from 'vue'
import { gsap } from 'gsap'

interface Props {
  /** 面板是否打开 */
  isOpen: boolean
  /** 是否显示汉堡按钮（首屏不显示，滚动到角色区后才 fadeIn） */
  showToggle: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: []
  close: []
  scrollToSection: [section: string]
}>()

const navItems = [
  { label: '首页', key: 'home' },
  { label: '角色', key: 'role' },
  { label: '新闻中心', key: 'news' },
]

const toggleBtnRef = ref<HTMLElement>()

const panelClass = computed(() => ({
  'side-nav': true,
  open: props.isOpen,
}))

function handleNavClick(key: string) {
  emit('scrollToSection', key)
  emit('close')
}

/** 汉堡按钮 fadeIn/fadeOut */
watch(() => props.showToggle, (show) => {
  if (!toggleBtnRef.value) return
  if (show) {
    gsap.to(toggleBtnRef.value, { autoAlpha: 1, duration: 0.3 })
  } else {
    gsap.to(toggleBtnRef.value, { autoAlpha: 0, duration: 0.3 })
  }
})

onMounted(() => {
  if (toggleBtnRef.value) {
    gsap.set(toggleBtnRef.value, { autoAlpha: props.showToggle ? 1 : 0 })
  }
})
</script>

<template>
  <div :class="panelClass">
    <!-- 汉堡/X 按钮（固定右上角，与原站一致） -->
    <div
      ref="toggleBtnRef"
      class="toggle-btn"
      @click="props.isOpen ? emit('close') : emit('toggle')"
    >
      <span class="line" />
      <span class="line" />
    </div>

    <!-- 背景遮罩层 -->
    <div v-if="isOpen" class="mask-bg" @click="emit('close')" />

    <!-- 内容面板 -->
    <div class="cnt">
      <div class="bg" />

      <div class="side-nav-bottom">
        <div class="nav-links">
          <a
            v-for="(item, index) in navItems"
            :key="item.key"
            class="item"
            :style="{ '--item-index': index } as Record<string, unknown>"
            href="javascript:void(0)"
            @click="handleNavClick(item.key)"
          >
            <span class="txt">{{ item.label }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.side-nav {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: $z-side-nav;
  pointer-events: none;
}

/* 面板打开时允许交互 */
.side-nav.open {
  pointer-events: auto;

  .cnt {
    transform: translate(0);
  }

  /* 汉堡 → X 旋转动画 */
  .toggle-btn .line:nth-child(1) {
    transform: translate(-50%, -0.01rem) rotate(45deg);
  }
  .toggle-btn .line:nth-child(2) {
    transform: translate(-50%, -0.01rem) rotate(-45deg);
  }
}

/* 汉堡/X 按钮 — 固定右上角 */
.toggle-btn {
  position: fixed;
  width: 0.33rem;
  height: 0.33rem;
  top: 0.4rem;
  right: 0.7rem;
  cursor: pointer;
  pointer-events: auto;
  z-index: 1;

  .line {
    width: 0.3rem;
    height: 0.02rem;
    background: url('https://ananta.res.netease.com/pc/gw/20250901145208/assets/line_c09169a5.png') repeat center center;
    background-size: 100% auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transition: all 0.3s;

    &:nth-child(1) {
      transform: translate(-50%, -0.08rem);
    }
    &:nth-child(2) {
      transform: translate(-50%, 0.06rem);
    }
  }
}

.mask-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.cnt {
  position: absolute;
  top: 0;
  right: 0;
  width: 9.48rem;
  height: 100%;
  box-sizing: border-box;
  padding: 0.4rem 0 0 0.66rem;
  transform: translate(100%);
  transition: transform 0.3s ease-in-out;
}

.bg {
  position: absolute;
  background: rgba(255, 255, 255, 0.17);
  backdrop-filter: blur(0.4rem);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.side-nav-bottom {
  margin-top: 1.16rem;
  position: relative;
  z-index: 1;
}

.nav-links .item {
  color: #fff;
  font-size: 0.36rem;
  font-weight: 630;
  line-height: 0.36rem;
  margin-bottom: 0.4rem;
  position: relative;
  cursor: pointer;
  width: fit-content;
  display: block;
  letter-spacing: 0.036rem;
  opacity: 0;
  transform: translateY(0.2rem) scale(0.9);
  animation: itemEnter 0.3s ease-out forwards;
  animation-delay: calc(var(--item-index) * 0.1s);

  .txt {
    position: relative;
  }

  &:hover::before,
  &.active::before {
    display: block;
    content: '';
    width: 100%;
    height: 0.1rem;
    background: $color-primary;
    position: absolute;
    bottom: -0.04rem;
  }
}

@keyframes itemEnter {
  0% {
    opacity: 0;
    transform: translateY(0.2rem) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
