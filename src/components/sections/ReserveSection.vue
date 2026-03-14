<script setup lang="ts">
/**
 * 预约计数区块
 *
 * 动画行为（逆向原站）：
 * - frontMask 高度从 50% 缩至 0%（进入时渐变遮罩消除）
 * - 预约内容区域从下方 3.38rem 滑入 + 淡入
 * - 人物剪影从右侧 6.22rem 滑入
 * - 数字从 (target - 10000) 滚动计数到 target
 * - 退出时 sectionMask 淡入，bottomMask 增长，噪点背景淡入
 */
import { ref, onMounted, computed } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/stores/app'
import { cdnUrl, formatNumber } from '@/utils'
import FilmGrain from '@/components/animation/FilmGrain.vue'

gsap.registerPlugin(ScrollTrigger)

const appStore = useAppStore()
const isLow = computed(() => appStore.isLowPerformance)

/** DOM 引用 */
const fixedCntRef = ref<HTMLElement>()
const spacerRef = ref<HTMLElement>()
const reserveContentRef = ref<HTMLElement>()
const frontMaskRef = ref<HTMLElement>()
const frontSilhouetteRef = ref<HTMLElement>()
const sectionMaskRef = ref<HTMLElement>()
const bottomMaskRef = ref<HTMLElement>()
const noiceBgRef = ref<InstanceType<typeof FilmGrain>>()

/** 预约目标数（模拟值） */
const targetCount = 25_000_000
/** 当前显示计数 */
const count = ref(targetCount - 10000)

/** 格式化后的数字 */
const displayCount = computed(() => formatNumber(count.value))

/** 背景图 */
const bgUrl = cdnUrl('assets/bg_31b6a795.png')
const reserveTextBg = cdnUrl('assets/reserve_4e643ed1.png')
const silhouetteUrl = cdnUrl('assets/front-silhouette_9c3f5f0b.png')

function initAnimation() {
  // 噪点背景初始隐藏
  const noiceBgEl = noiceBgRef.value?.$el as HTMLElement | undefined
  if (noiceBgEl) {
    gsap.set(noiceBgEl, { autoAlpha: 0 })
  }

  // 进入时：顶部渐变遮罩从 50% 消除到 0%（区块刚露出底部就开始）
  gsap.timeline({
    defaults: { ease: 'none', duration: 1 },
    scrollTrigger: {
      trigger: spacerRef.value!,
      start: 'top 50%',
      end: 'top top',
      scrub: 0.5,
    },
  }).fromTo(frontMaskRef.value!, { height: '50%' }, { height: '0%', duration: 1 })

  // 主 pin 时间线
  gsap.timeline({
    defaults: { ease: 'none', duration: 1 },
    scrollTrigger: {
      trigger: spacerRef.value!,
      start: 'top -10%',
      end: 'bottom bottom',
      pin: fixedCntRef.value!,
      scrub: 0,
      onEnter() { fixedCntRef.value!.style.zIndex = '9' },
      onLeave() { fixedCntRef.value!.style.zIndex = '0' },
      onEnterBack() { fixedCntRef.value!.style.zIndex = '9' },
      onLeaveBack() { fixedCntRef.value!.style.zIndex = '0' },
    },
  })

  // 内容入场动画 — spacer 顶部到达视口中间时就开始（原站行为）
  const contentTl = gsap.timeline({
    defaults: { ease: 'none', duration: 1 },
    scrollTrigger: {
      trigger: spacerRef.value!,
      start: 'top 50%',
      end: 'bottom 50%',
      scrub: 0,
    },
  })

  contentTl.addLabel('start')
  contentTl.addLabel('fadeOut', 'start+=1.2')

  // 预约内容从下方滑入
  contentTl.fromTo(reserveContentRef.value!,
    { y: '3.38rem', autoAlpha: 0 },
    { y: '0rem', autoAlpha: 1, duration: 1 },
    'start',
  )

  // 人物剪影从右侧滑入
  contentTl.fromTo(frontSilhouetteRef.value!,
    { x: '6.22rem' },
    { x: '0rem', duration: 1 },
    'start',
  )

  // 数字计数动画
  contentTl.to(count, { value: targetCount, duration: 0.8 }, 'start')

  // 遮罩淡出
  contentTl.to(sectionMaskRef.value!, { autoAlpha: 0, duration: 0.4 }, 'fadeOut')

  // 噪点背景固定（pin 到底部）
  if (noiceBgEl) {
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: noiceBgEl,
        start: 'top top',
        end: 'max',
        scrub: 0,
        pin: true,
      },
    })
  }

  // 退出时：遮罩淡入 + 噪点背景淡入
  const exitTl = gsap.timeline({
    defaults: { ease: 'none', duration: 1 },
    scrollTrigger: {
      trigger: spacerRef.value!,
      start: 'bottom 40%',
      end: 'bottom 20%',
      scrub: 0,
    },
  })

  exitTl.addLabel('start')
  exitTl.to(sectionMaskRef.value!, { autoAlpha: 1, duration: 1 }, 'start')
  if (noiceBgEl) {
    exitTl.fromTo(noiceBgEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 'start')
  }

  // 底部渐变遮罩增长
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: spacerRef.value!,
      start: 'bottom bottom',
      end: 'bottom 50%',
      scrub: 0.5,
    },
  }).fromTo(bottomMaskRef.value!, { height: '10%' }, { height: '2rem', duration: 1 })
}

function initAnimationStatic() {
  gsap.timeline({
    defaults: { ease: 'none', duration: 1 },
    scrollTrigger: {
      trigger: spacerRef.value!,
      start: 'top -10%',
      end: 'bottom bottom',
      pin: fixedCntRef.value!,
      scrub: 0,
      onEnter() { fixedCntRef.value!.style.zIndex = '9' },
      onLeave() { fixedCntRef.value!.style.zIndex = '0' },
      onEnterBack() { fixedCntRef.value!.style.zIndex = '9' },
      onLeaveBack() { fixedCntRef.value!.style.zIndex = '0' },
    },
  })
}

onMounted(() => {
  if (isLow.value) {
    count.value = targetCount
    initAnimationStatic()
  } else {
    initAnimation()
  }
})
</script>

<template>
  <section class="reserve-section" :class="{ low: isLow }">
    <div ref="fixedCntRef" class="fixed-cnt">
      <!-- 背景图 -->
      <div class="bg" :style="{ backgroundImage: `url(${bgUrl})` }" />

      <!-- 预约内容 -->
      <div ref="reserveContentRef" class="reserve-content">
        <div
          class="reserve-title"
          :style="{ backgroundImage: `url(${reserveTextBg})` }"
        >
          全球预约人数
        </div>
        <div
          class="reserve-number"
          :style="{ backgroundImage: `url(${reserveTextBg})` }"
        >
          {{ displayCount }}
        </div>
      </div>

      <!-- 前景人物剪影 -->
      <div
        ref="frontSilhouetteRef"
        class="front-silhouette"
        :style="{ backgroundImage: `url(${silhouetteUrl})` }"
      />

      <!-- 遮罩层 -->
      <div ref="frontMaskRef" class="front-mask" />
      <div ref="sectionMaskRef" class="section-mask" />
      <div ref="bottomMaskRef" class="bottom-mask" />
    </div>

    <div ref="spacerRef" class="spacer" :class="{ low: isLow }" />

    <!-- WebGL 噪点背景（退出时淡入，用于区块间过渡） -->
    <FilmGrain v-if="!isLow" ref="noiceBgRef" />
  </section>
</template>

<style scoped lang="scss">
.reserve-section {
  position: relative;
  width: 100%;
}

.fixed-cnt {
  width: 100%;
  height: 10.8rem;
  position: absolute;
  top: 0;
  left: 0;
}

.bg {
  position: absolute;
  width: 19.2rem;
  height: 10.8rem;
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: cover;
}

.spacer {
  height: 21.6rem;
  width: 100%;

  &.low {
    height: 10.8rem;
  }
}

.reserve-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.reserve-title {
  font-size: 0.32rem;
  font-weight: 450;
  line-height: 0.32rem;
  background-repeat: repeat-y;
  background-position: center center;
  background-size: 100% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: absolute;
  top: 50%;
  margin-top: -3.02rem;
  left: 50%;
  transform: translateX(-50%);
}

.reserve-number {
  font-family: $font-family-en;
  font-size: 3.5rem;
  font-weight: 400;
  line-height: 3.1rem;
  text-align: left;
  letter-spacing: -0.0465rem;
  background-repeat: repeat-y;
  background-position: center center;
  background-size: 100% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: absolute;
  width: 14.6rem;
  top: 50%;
  margin-top: -1.94rem;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  opacity: 0.7;
}

.front-silhouette {
  width: 13.54rem;
  height: 5.24rem;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  position: absolute;
  bottom: 1rem;
  left: 1rem;
}

.front-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(to bottom, $color-bg 0%, rgba(23, 23, 23, 0) 100%);
}

.section-mask {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: $color-bg;
  z-index: 9;
  opacity: 0;
}

.bottom-mask {
  pointer-events: none;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  background: linear-gradient(to top, $color-bg 0%, rgba(23, 23, 23, 0) 100%);
}

.reserve-section.low {
  .bottom-mask { height: 1rem; }
  .front-mask { height: 20%; }
}
</style>
