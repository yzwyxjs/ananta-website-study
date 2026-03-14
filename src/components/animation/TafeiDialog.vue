<script setup lang="ts">
/**
 * 塔菲对话气泡动画组件
 *
 * 原站完整动画（从 JS 逆向）：
 *
 * z_kong_5_000（外层容器）：
 *   阶段1 (0→1.783s): x 261→261, y -23.75→-36, scale 1.1585→1.2
 *   阶段2 (1.783→2.583s): x 261→0, y -36→0, scale 1.2→1.42
 *   淡出 (4.2→5.0s): opacity 1→0
 *
 * z_kong_15_000（内层容器）：
 *   (0.1→0.483s): y 69.72→41.71
 *   (0.483→0.617s): y 保持 41.71
 *   (0.617→1.033s): y 41.71→0
 *
 * 4个气泡各自: scale 0.3→1.1→1.0 (弹性回弹) + opacity 0→1
 *
 * 原站使用 CustomEase 插件（SVG path），这里用标准 GSAP ease 近似
 */
import { onMounted, computed } from 'vue'
import { gsap } from 'gsap'
import { useAppStore } from '@/stores/app'
import { cdnUrl } from '@/utils'

const emit = defineEmits<{
  timelineCreated: [timelines: gsap.core.Timeline[]]
}>()

const appStore = useAppStore()
const isLow = computed(() => appStore.isLowPerformance)

const msgBgs = {
  msg1: cdnUrl('assets/msg-1_c629f44d.svg'),
  msg2: cdnUrl('assets/msg-2_2c3e16ab.svg'),
  msg3: cdnUrl('assets/msg-3_da76a705.svg'),
  msg4: cdnUrl('assets/msg-4_9d5f72cf.svg'),
}

function createAnimation() {
  const tl = gsap.timeline()

  /* ====== 外层容器 z_kong_5_000：位移 + 缩放 两段运动 ====== */

  // 阶段1: 从右侧偏移位置向下微移 (0 → 1.783s)
  tl.to('#z_kong_5_000', {
    duration: 1.783,
    ease: 'power2.out',
    x: 261, y: -36,
    startAt: { x: 261, y: -23.75 },
  }, 0)

  // 阶段2: 回到原点 (1.783 → 2.583s)
  tl.to('#z_kong_5_000', {
    duration: 0.8,
    ease: 'power2.inOut',
    x: 0, y: 0,
    startAt: { x: 261, y: -36 },
  }, 1.783)

  // 缩放阶段1: 微放大 (0 → 1.783s)
  tl.to('#z_kong_5_000', {
    duration: 1.783,
    ease: 'power1.inOut',
    scaleX: 1.2, scaleY: 1.2,
    startAt: { scaleX: 1.1585, scaleY: 1.1585 },
  }, 0)

  // 缩放阶段2: 继续放大 (1.783 → 2.583s)
  tl.to('#z_kong_5_000', {
    duration: 0.8,
    ease: 'power2.out',
    scaleX: 1.42, scaleY: 1.42,
    startAt: { scaleX: 1.2, scaleY: 1.2 },
  }, 1.783)

  /* ====== 内层容器 z_kong_15_000：y 方向弹跳 ====== */

  // 从下方弹起 (0.1 → 0.483s)
  tl.to('#z_kong_15_000', {
    duration: 0.383,
    ease: 'power2.out',
    x: 0, y: 41.71,
    startAt: { x: 0, y: 69.72 },
  }, 0.1)

  // 短暂停顿 (0.483 → 0.617s)
  tl.to('#z_kong_15_000', {
    duration: 0.133,
    ease: 'none',
    x: 0, y: 41.71,
    startAt: { x: 0, y: 41.71 },
  }, 0.483)

  // 回到原位 (0.617 → 1.033s)
  tl.to('#z_kong_15_000', {
    duration: 0.417,
    ease: 'power2.inOut',
    x: 0, y: 0,
    startAt: { x: 0, y: 41.71 },
  }, 0.617)

  /* ====== 气泡4（右上）: "老板，我工钱呢？" ====== */
  tl.to('#z_Frame_1467_000', {
    duration: 0.167, ease: 'power2.out',
    scaleX: 1.1, scaleY: 1.1,
    startAt: { scaleX: 0.3, scaleY: 0.3 },
  }, 0)
  tl.to('#z_Frame_1467_000', {
    duration: 0.117, ease: 'back.out(3)',
    scaleX: 1, scaleY: 1,
    startAt: { scaleX: 1.1, scaleY: 1.1 },
  }, 0.167)
  tl.to('#z_Frame_1467_000', {
    duration: 0.167, ease: 'power0',
    opacity: 1, startAt: { opacity: 0 },
  }, 0.05)

  /* ====== 气泡3（右下）: "怎么还没到账？" ====== */
  tl.to('#z_Frame_1468_000', {
    duration: 0.15, ease: 'power2.out',
    scaleX: 1.1, scaleY: 1.1,
    startAt: { scaleX: 0.3, scaleY: 0.3 },
  }, 0.2)
  tl.to('#z_Frame_1468_000', {
    duration: 0.117, ease: 'back.out(3)',
    scaleX: 1, scaleY: 1,
    startAt: { scaleX: 1.1, scaleY: 1.1 },
  }, 0.35)
  tl.to('#z_Frame_1468_000', {
    duration: 0.167, ease: 'power0',
    opacity: 1, startAt: { opacity: 0 },
  }, 0.25)

  /* ====== 气泡1（左上）: "三箱货撞烂两箱半" ====== */
  tl.to('#z_Frame_1466_000', {
    duration: 0.15, ease: 'power2.out',
    scaleX: 1.1, scaleY: 1.1,
    startAt: { scaleX: 0.3, scaleY: 0.3 },
  }, 0.617)
  tl.to('#z_Frame_1466_000', {
    duration: 0.117, ease: 'back.out(3)',
    scaleX: 1, scaleY: 1,
    startAt: { scaleX: 1.1, scaleY: 1.1 },
  }, 0.767)
  tl.to('#z_Frame_1466_000', {
    duration: 0.167, ease: 'power0',
    opacity: 1, startAt: { opacity: 0 },
  }, 0.667)

  /* ====== 气泡2（左下）: "你还倒欠五百，怎么支付？" ====== */
  tl.to('#z_Frame_1465_000', {
    duration: 0.15, ease: 'power2.out',
    scaleX: 1.1, scaleY: 1.1,
    startAt: { scaleX: 0.3, scaleY: 0.3 },
  }, 0.767)
  tl.to('#z_Frame_1465_000', {
    duration: 0.117, ease: 'back.out(3)',
    scaleX: 1, scaleY: 1,
    startAt: { scaleX: 1.1, scaleY: 1.1 },
  }, 0.917)
  tl.to('#z_Frame_1465_000', {
    duration: 0.167, ease: 'power0',
    opacity: 1, startAt: { opacity: 0 },
  }, 0.817)

  /* ====== 整体淡出 ====== */
  tl.to('#z_kong_5_000', {
    duration: 0.8, ease: 'power0',
    opacity: 0, startAt: { opacity: 1 },
  }, 4.2)

  const fadeOutTimeline = gsap.timeline()
  emit('timelineCreated', [tl, fadeOutTimeline])
}

onMounted(() => {
  if (!isLow.value) {
    createAnimation()
  }
})
</script>

<template>
  <div class="tafei-dialog-anim">
    <div id="z_kong_5_000" class="z_kong_5_000">
      <div id="z_kong_15_000" class="z_kong_15_000">
        <div
          id="z_Frame_1465_000"
          class="z_Frame_1465_000 bubble"
          :style="{ backgroundImage: `url(${msgBgs.msg2})` }"
        >你还倒欠五百，怎么支付？</div>
        <div
          id="z_Frame_1466_000"
          class="z_Frame_1466_000 bubble"
          :style="{ backgroundImage: `url(${msgBgs.msg1})` }"
        >三箱货撞烂两箱半</div>
        <div
          id="z_Frame_1468_000"
          class="z_Frame_1468_000 bubble"
          :style="{ backgroundImage: `url(${msgBgs.msg4})` }"
        >怎么还没到账？</div>
        <div
          id="z_Frame_1467_000"
          class="z_Frame_1467_000 bubble"
          :style="{ backgroundImage: `url(${msgBgs.msg3})` }"
        >老板，我工钱呢？</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tafei-dialog-anim {
  position: absolute;
  width: 19.24rem;
  height: 10.8rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
  font-size: 0.2rem;
  font-weight: 330;
  line-height: normal;
}

.z_kong_5_000 {
  position: absolute;
  left: 6.99rem;
  top: 5.16rem;
  height: 1rem;
  width: 1rem;
  transform-origin: 0% 0%;
  transform: scale(1.1585);
}

.z_kong_15_000 {
  position: absolute;
  left: -0.76rem;
  top: -0.36rem;
  height: 1rem;
  width: 1rem;
  transform-origin: 0% 0%;
  transform: scale(0.7042);
}

.bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  position: absolute;
  opacity: 0;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.z_Frame_1467_000 {
  left: 2.29rem;
  top: -1.69rem;
  width: 1.98rem;
  height: 0.45rem;
  transform-origin: 100% 0%;
  transform: scale(0.3);
  padding-right: 0.07rem;
  color: #F3F3F3;
}

.z_Frame_1468_000 {
  left: 2.49rem;
  top: -0.82rem;
  height: 0.46rem;
  width: 1.78rem;
  transform-origin: 100% 0%;
  transform: scale(0.3);
  padding-right: 0.07rem;
  color: #F3F3F3;
}

.z_Frame_1466_000 {
  left: -4.31rem;
  top: 1.08rem;
  width: 2.09rem;
  height: 0.45rem;
  transform-origin: 0% 0%;
  transform: scale(0.3);
  padding-left: 0.09rem;
  color: #222225;
}

.z_Frame_1465_000 {
  left: -4.32rem;
  top: 1.95rem;
  height: 0.45rem;
  width: 2.8rem;
  transform-origin: 0% 0%;
  transform: scale(0.3);
  padding-left: 0.15rem;
  color: #222225;
}
</style>
