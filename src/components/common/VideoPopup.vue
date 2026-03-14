<script setup lang="ts">
/**
 * PV 视频弹窗组件
 * 点击首屏播放按钮后弹出，全屏遮罩 + 居中视频播放器
 * 原站样式：leihuo-pop-media leihuo-pop-video
 */
import { ref, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import { useLenis } from '@/composables/useLenis'

interface Props {
  visible: boolean
  src: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const { stop: stopScroll, start: startScroll } = useLenis()
const overlayRef = ref<HTMLElement>()
const videoRef = ref<HTMLVideoElement>()

function handleClose() {
  if (videoRef.value) {
    videoRef.value.pause()
  }
  gsap.to(overlayRef.value!, {
    autoAlpha: 0,
    duration: 0.3,
    onComplete() { emit('close') },
  })
}

watch(() => props.visible, async (val) => {
  if (val) {
    stopScroll()
    await nextTick()
    gsap.fromTo(overlayRef.value!, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
    if (videoRef.value) {
      videoRef.value.currentTime = 0
      videoRef.value.play()
    }
  } else {
    startScroll()
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" ref="overlayRef" class="video-popup-overlay" @click.self="handleClose">
      <div class="pop-video-content">
        <video
          ref="videoRef"
          controls
          autoplay
          :src="src"
        />
        <!-- 关闭按钮 -->
        <div class="media-close" @click="handleClose">
          <span /><span />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.video-popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pop-video-content {
  position: relative;
  max-width: 19.2rem;
  width: 70%;

  video {
    max-width: 19.2rem;
    width: 100%;
    height: auto;
    max-height: 10.8rem;
    display: block;
  }
}

.media-close {
  position: absolute;
  z-index: 3;
  width: 0.8rem;
  height: 0.8rem;
  top: -0.2rem;
  right: -0.8rem;
  transition: transform 0.5s;
  cursor: pointer;

  &:hover {
    transform: rotate(180deg);
  }

  span {
    display: block;
    width: 0.4rem;
    height: 0.02rem;
    background: $color-text;
    position: absolute;
    top: 50%;
    left: 50%;

    &:first-child { transform: translate(-50%, -50%) rotate(45deg); }
    &:last-child { transform: translate(-50%, -50%) rotate(-45deg); }
  }
}
</style>
