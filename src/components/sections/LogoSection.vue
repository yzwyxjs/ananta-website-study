<script setup lang="ts">
/**
 * Logo 展示区块
 *
 * 位于 ErasureSection 和 ReserveSection 之间
 * 原站有此区块（CSS 中的 .logo-section），显示 ANANTA 大 Logo
 * spacer 200vh，Logo 固定在视口中央
 */
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cdnUrl } from '@/utils'

gsap.registerPlugin(ScrollTrigger)

const fixedCntRef = ref<HTMLElement>()
const spacerRef = ref<HTMLElement>()
const logoRef = ref<HTMLElement>()

const logoSprite = cdnUrl('assets/sprite-6fc8c4_6fc8c4aa.png')

onMounted(() => {
  gsap.set(logoRef.value!, { autoAlpha: 0 })

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: spacerRef.value!,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0,
      pin: fixedCntRef.value!,
    },
  })
    .fromTo(logoRef.value!, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.4 })
    .to(logoRef.value!, { autoAlpha: 1, duration: 0.4 })
    .to(logoRef.value!, { autoAlpha: 0, duration: 0.2 })
})
</script>

<template>
  <section class="logo-section">
    <div ref="fixedCntRef" class="fixed-cnt">
      <div class="static-cnt">
        <div
          ref="logoRef"
          class="logo"
          :style="{ backgroundImage: `url(${logoSprite})` }"
        />
      </div>
    </div>
    <div ref="spacerRef" class="spacer" />
  </section>
</template>

<style scoped lang="scss">
.logo-section {
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

.spacer {
  height: 200vh;
  width: 100%;
  pointer-events: none;
}

.static-cnt {
  width: 100%;
  height: 100vh;
  position: relative;
  background: $color-bg;
}

.logo {
  position: absolute;
  background-repeat: no-repeat;
  background-size: 4.66rem 3.94rem;
  background-position: 0 0;
  width: 4.62rem;
  height: 2.57rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
