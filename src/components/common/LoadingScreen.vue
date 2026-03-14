<script setup lang="ts">
/**
 * 加载屏幕组件
 * 展示 logo 的 clip-path 擦除动画和加载百分比
 * 加载完成后淡出并触发主内容展示
 */
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { cdnUrl } from '@/utils'

const emit = defineEmits<{
  /** 加载完成，通知父组件开始展示内容 */
  complete: []
}>()

/** 加载百分比（0~100） */
const percent = ref(0)

/** 容器引用 */
const loadingRef = ref<HTMLElement>()

/** logo 黑色底图（始终可见） */
const logoBlackSrc = cdnUrl('assets/logo-black_c8d68f2f.png')
/** logo 白色版（clip-path 动画擦除显示） */
const logoWhiteSrc = cdnUrl('assets/logo-white_08ada2b5.png')

onMounted(() => {
  // 模拟加载进度（实际项目中应对接真实资源加载）
  gsap.to(percent, {
    value: 100,
    duration: 2.5,
    ease: 'power2.out',
    onUpdate() {
      percent.value = Math.floor(percent.value)
    },
    onComplete() {
      // 加载完成后淡出整个 loading 层
      gsap.to(loadingRef.value!, {
        autoAlpha: 0,
        duration: 0.6,
        delay: 0.3,
        ease: 'power2.inOut',
        onComplete() {
          emit('complete')
        },
      })
    },
  })
})
</script>

<template>
  <div ref="loadingRef" class="loading">
    <!-- Logo 容器：黑色底图 + 白色动画层叠加 -->
    <div class="loading-logo">
      <img :src="logoBlackSrc" alt="Logo" class="logo-black" />
      <img :src="logoWhiteSrc" alt="Logo" class="logo-white" />
    </div>
    <!-- 加载百分比 -->
    <div class="percent">{{ percent }}%</div>

    <!-- 学习声明 -->
    <div class="disclaimer">
      本项目仅供学习、研究网页效果使用，并非《无限大》官方网站
    </div>
  </div>
</template>

<style scoped lang="scss">
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: $color-bg;
  z-index: $z-loading;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-logo {
  width: 2rem;
  height: 2rem;
  position: relative;
}

.logo-black,
.logo-white {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  height: 50%;
  object-fit: contain;
  transform: translate(-50%, -50%);
}

/* 黑色 logo 始终可见作为底层 */
.logo-black {
  z-index: 1;
}

/* 白色 logo 通过 clip-path 循环擦除显示 */
.logo-white {
  z-index: 2;
  clip-path: inset(0 100% 0 0);
  animation: loadingClip 2s ease-in-out infinite, loadingFade 2s infinite;
}

@keyframes loadingClip {
  0%   { clip-path: inset(0 100% 0 0); }
  60%  { clip-path: inset(0 0% 0 0); }
  90%  { clip-path: inset(0 0% 0 0); }
  100% { clip-path: inset(0 100% 0 0); }
}

@keyframes loadingFade {
  0%   { opacity: 0; }
  15%  { opacity: 1; }
  98%  { opacity: 1; }
  99%  { opacity: 0; }
  100% { opacity: 0; }
}

.percent {
  position: absolute;
  top: 50%;
  transform: translateY(0.3rem);
  color: #fff;
  font-size: 0.14rem;
  font-weight: 450;
}

.disclaimer {
  position: absolute;
  bottom: 0.4rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.13rem;
  font-weight: 330;
  white-space: nowrap;
  letter-spacing: 0.01rem;
}
</style>
