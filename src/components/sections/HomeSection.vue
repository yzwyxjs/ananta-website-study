<script setup lang="ts">
/**
 * 首页 KV 区块
 *
 * 动画行为（基于原站逆向分析）：
 * - 入场：KV 图片从 scale 1.1 缩小到 1.0（power3.out），遮罩从黑色淡出
 * - 播放按钮、预约按钮、滚动提示延迟 0.4s 淡入
 * - 滚动驱动（GSAP ScrollTrigger pin）：
 *   · KV 图片先保持 scale 1.0 → 缩小到 0.793 → 微放到 0.87
 *   · 黑色遮罩同步从透明淡入
 *   · 滚动到 75% 时触发侧导航状态变更
 */
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/stores/app'
import { cdnUrl } from '@/utils'

gsap.registerPlugin(ScrollTrigger)

const emit = defineEmits<{
  playVideo: []
  showDisclaimer: []
}>()

const appStore = useAppStore()

/** DOM 引用 */
const kvRef = ref<HTMLElement>()
const kvImgRef = ref<HTMLImageElement>()
const fixedCntRef = ref<HTMLElement>()
const spacerRef = ref<HTMLElement>()
const sectionMaskRef = ref<HTMLElement>()
const playBtnRef = ref<HTMLElement>()
const reserveBtnCntRef = ref<HTMLElement>()
const scrollTipsRef = ref<HTMLElement>()

/** KV 主视觉图（原站实际使用的全尺寸 KV，非 SEO 缩略图） */
const kvImgSrc = cdnUrl('assets/kv-full_f7467c2a.jpg')

/**
 * 初始化滚动驱动动画
 * 将 fixedCnt 通过 ScrollTrigger pin 固定，
 * 滚动 spacer 时驱动 KV 缩放和遮罩透明度变化
 */
function initScrollAnimation() {
  const tl = gsap.timeline({
    defaults: { ease: 'none', duration: 1 },
    scrollTrigger: {
      trigger: spacerRef.value!,
      start: 'top top',
      end: 'bottom -40%',
      pin: fixedCntRef.value!,
      scrub: 0,
      onUpdate(self) {
        // 滚动到 75% 以上时标记为离开首页区域
        if (self.progress >= 0.75) {
          appStore.setCurrentPosition('captain')
        } else {
          appStore.setCurrentPosition('home')
        }
      },
    },
  })

  tl.addLabel('start')
  // KV 先保持原始大小，然后缩小，最后微微放大
  tl.fromTo(kvImgRef.value!, { scale: 1 }, { scale: 1, duration: 0.5 }, 'start')
  tl.to(kvImgRef.value!, { scale: 0.793, duration: 1 }, 'start+=0.5')
  // 黑色遮罩从透明到不透明
  tl.fromTo(sectionMaskRef.value!, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 'start+=0.5')
  tl.to(kvImgRef.value!, { scale: 0.87, duration: 1 })
}

onMounted(() => {
  initScrollAnimation()

  // 入场动画：KV 整体从 1.1 缩放回 1.0
  gsap.from(kvRef.value!, {
    scale: 1.1,
    duration: 1.3,
    ease: 'power3.out',
  })

  // 入场动画：遮罩从黑色淡出
  gsap.fromTo(sectionMaskRef.value!, { autoAlpha: 1 }, {
    autoAlpha: 0,
    duration: 1.3,
    ease: 'power3.out',
  })

  // 按钮和滚动提示延迟淡入
  gsap.from(
    [playBtnRef.value!, reserveBtnCntRef.value!, scrollTipsRef.value!],
    {
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      delay: 0.4,
    },
  )
})
</script>

<template>
  <section class="home-section">
    <!-- 固定内容层（ScrollTrigger pin） -->
    <div ref="fixedCntRef" class="fixed-cnt">
      <!-- KV 主视觉 -->
      <div ref="kvRef" class="kv">
        <img ref="kvImgRef" :src="kvImgSrc" alt="ANANTA 主视觉" />
      </div>

      <!-- 中央内容：播放按钮 + 预约按钮 -->
      <div class="center-content">
        <button ref="playBtnRef" class="play-btn" @click="emit('playVideo')">
          <span class="icon-play" />
        </button>

        <div ref="reserveBtnCntRef" class="reserve-btn-cnt">
          <div class="blur-bg" />
          <button class="reserve-btn" @click="emit('showDisclaimer')">点击预约</button>
        </div>

        <!-- 滚动提示箭头 -->
        <div ref="scrollTipsRef" class="scroll-tips" />
      </div>

      <!-- 底部渐变遮罩 -->
      <div class="front-mask" />
      <!-- 全屏黑色遮罩（入场淡出 + 滚动淡入） -->
      <div ref="sectionMaskRef" class="section-mask" />
    </div>

    <!-- 滚动占位区域 -->
    <div ref="spacerRef" class="spacer" />
  </section>
</template>

<style scoped lang="scss">
.home-section {
  height: 50vh;
}

.fixed-cnt {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
}

/* KV 主视觉容器 */
.kv {
  width: 100%;
  height: 100%;
  overflow: hidden;
  will-change: transform;

  img {
    width: 115%;
    height: 115%;
    object-fit: cover;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    user-select: none;
  }
}

.spacer {
  height: 100vh;
  width: 100%;
  pointer-events: none;
}

/* 中央内容区域 */
.center-content {
  position: absolute;
  top: calc(1.65rem + 50%);
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 播放按钮（圆形毛玻璃） */
.play-btn {
  width: 0.9rem;
  height: 0.9rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background: linear-gradient(331deg, rgba(255, 255, 255, 0.15) -35.37%, #fff 173.51%);
  backdrop-filter: blur(0.064rem);
  transition: transform 0.4s;

  &:hover {
    transform: scale(1.05);
  }
}

.icon-play {
  display: inline-block;
  width: 0.26rem;
  height: 0.3rem;
  background: url('#{$cdn-assets}/video-btn_83b4c3cb.svg') no-repeat;
  background-size: contain;
  margin-left: 0.08rem;
}

/* 预约按钮区域 */
.reserve-btn-cnt {
  margin-top: 2.6rem;
  width: 3.32rem;
  height: 0.52rem;
  position: relative;
}

.blur-bg {
  position: absolute;
  width: 4.63rem;
  height: 1.38rem;
  border-radius: 4.63rem;
  background: rgba(0, 0, 0, 0.77);
  filter: blur(0.9rem);
  top: -0.24rem;
  left: 50%;
  transform: translateX(-50%);
}

.reserve-btn {
  width: 3.32rem;
  height: 0.52rem;
  border-radius: 0.05rem;
  background: $color-primary;
  color: $color-text;
  font-size: 0.26rem;
  font-weight: 450;
  display: block;
  position: relative;
  z-index: 10;

  &:hover {
    background: $color-primary-hover;
  }
}

/* 滚动提示动画 */
.scroll-tips {
  width: 0.44rem;
  height: 0.16rem;
  background: url('#{$cdn-assets}/scroll-tip_e694d4a7.svg') no-repeat;
  background-size: 100% 100%;
  margin: 0.66rem auto 0;
  animation: scrollTipsFloat 1s infinite ease-in-out;
}

@keyframes scrollTipsFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-0.1rem); }
}

/* 底部渐变遮罩 */
.front-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, $color-bg 0%, rgba(23, 23, 23, 0) 100%);
  height: 0;
}

/* 全屏黑色遮罩 */
.section-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  pointer-events: none;
}
</style>
