<script setup lang="ts">
/**
 * 过渡区块（Erasure Section）
 *
 * 动画行为：
 * - 高性能：整体淡入 → 视频 currentTime 0→1.4 同步滚动 → 整体淡出
 * - 低性能：整体淡入 → 图片从 scale 1.4 缩小到 1.0 → 淡出
 * - spacer 高度 300vh（低性能 200vh）
 */
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/stores/app'
import { cdnUrl } from '@/utils'
import { ERASURE_VIDEO } from '@/utils/videos'

gsap.registerPlugin(ScrollTrigger)

const appStore = useAppStore()
const isLow = computed(() => appStore.isLowPerformance)

const erasureSectionRef = ref<HTMLElement>()
const fixedCntRef = ref<HTMLElement>()
const spacerRef = ref<HTMLElement>()
const videoRef = ref<HTMLVideoElement>()
const imgSectionRef = ref<HTMLElement>()
const imgRef = ref<HTMLElement>()

const staticBgUrl = cdnUrl('assets/bg_8bda2623.jpg')

function initScrollAnimation() {
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: spacerRef.value!,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0,
      pin: fixedCntRef.value!,
    },
  })

  tl.addLabel('start')
  tl.fromTo(erasureSectionRef.value!, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 })

  if (videoRef.value) {
    tl.fromTo(videoRef.value, { currentTime: 0 }, {
      currentTime: 1.4,
      duration: 1.3,
      ease: 'linear',
    }, 'start')
  }

  tl.fromTo(erasureSectionRef.value!, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.01 })
}

function initScrollAnimationStatic() {
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: spacerRef.value!,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0,
      pin: fixedCntRef.value!,
    },
  })

  tl.addLabel('start')
  tl.fromTo(erasureSectionRef.value!, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 })

  if (imgSectionRef.value) {
    tl.fromTo(imgSectionRef.value, { scale: 1.4, autoAlpha: 0 }, { scale: 1, duration: 0.5, autoAlpha: 1 })
    tl.fromTo(imgSectionRef.value, { scale: 1 }, { scale: 1, duration: 1 })
  }

  if (imgRef.value) {
    tl.fromTo(imgRef.value, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.5 })
  }
}

onMounted(() => {
  gsap.set(erasureSectionRef.value!, { autoAlpha: 0 })

  if (isLow.value) {
    initScrollAnimationStatic()
    return
  }

  // 等视频 metadata 加载后再初始化动画
  const video = videoRef.value
  if (video) {
    const startInit = () => {
      video.pause()
      video.currentTime = 0
      initScrollAnimation()
    }
    if (video.readyState >= 1) {
      startInit()
    } else {
      video.addEventListener('loadedmetadata', startInit, { once: true })
    }
  } else {
    initScrollAnimation()
  }
})

onBeforeUnmount(() => {
  ScrollTrigger.getAll().forEach(st => {
    if ((st.vars as Record<string, unknown>).id === 'erasure-section') {
      st.kill()
    }
  })
})
</script>

<template>
  <section ref="erasureSectionRef" class="erasure-section" :class="{ low: isLow }">
    <div ref="fixedCntRef" class="fixed-cnt">
      <!-- 高性能：视频 -->
      <template v-if="!isLow">
        <div class="video-section">
          <video
            ref="videoRef"
            muted
            playsinline
            preload="auto"
            :src="ERASURE_VIDEO"
          />
        </div>
      </template>

      <!-- 低性能：静态图片 -->
      <template v-else>
        <div ref="imgSectionRef" class="img-section">
          <div
            ref="imgRef"
            class="img"
            :style="{ backgroundImage: `url(${staticBgUrl})` }"
          />
        </div>
      </template>
    </div>

    <div ref="spacerRef" class="spacer" />
  </section>
</template>

<style scoped lang="scss">
.erasure-section {
  position: relative;
  width: 100%;
}

.fixed-cnt {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
}

.video-section {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }
}

.spacer {
  height: 300vh;
}

/* 低性能模式 */
.erasure-section.low {
  background-color: $color-bg;

  .spacer {
    height: 200vh;
  }

  .img-section {
    width: 100%;
    height: 100vh;
  }

  .img {
    display: block;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    width: 100%;
    height: 100%;
  }
}
</style>
