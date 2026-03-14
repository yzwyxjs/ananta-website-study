<script setup lang="ts">
/**
 * 图片画廊弹窗组件
 *
 * 原站两态交互：
 * 1. 缩略图视图（默认）：散布式缩略图 + 鼠标视差 + 右上角"返回官网"
 * 2. 放大视图（点击某图后）：全屏大图 + X关闭 + 左右切换
 *
 * 鼠标视差参数（原站逆向）：
 * - container 反向偏移：maxMoveX=2, maxMoveY=2, sensitivity=1, duration=1
 * - 图片距离缩放：minScale=0.7, maxScale=1, scaleRadius=1000
 * - 光标跟随：gsap.to duration=0.08
 */
import { ref, watch, computed, nextTick, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { useLenis } from '@/composables/useLenis'

interface Props {
  visible: boolean
  roleName?: string
}

const CDN = 'https://ananta.res.netease.com/pc/gw/20250901145208/assets'

/** 每个角色的画廊图片（thumb + full），与原站 ROLE_IMG 配置完全一致 */
const ROLE_IMAGES: Record<string, { thumb: string; full: string }[]> = {
  captain: [
    { thumb: `${CDN}/thumb_0001_fad1e7eb.jpg`, full: `${CDN}/full_0001_5ae9cd9d.jpg` },
    { thumb: `${CDN}/thumb_0002_df86c9f3.jpg`, full: `${CDN}/full_0002_3275bf6d.jpg` },
    { thumb: `${CDN}/thumb_0003_6a93e8c7.jpg`, full: `${CDN}/full_0003_7eaad32b.jpg` },
    { thumb: `${CDN}/thumb_0004_6c9a4c4c.jpg`, full: `${CDN}/full_0004_e8e02ecf.jpg` },
    { thumb: `${CDN}/thumb_0005_edf90d8f.jpg`, full: `${CDN}/full_0005_519ea938.jpg` },
    { thumb: `${CDN}/full_0006_73e81db3.jpg`, full: `${CDN}/full_0006_73e81db3.jpg` },
  ],
  tafei: [
    { thumb: `${CDN}/thumb_0001_afa21b94.jpg`, full: `${CDN}/full_0001_8e0bb7e9.jpg` },
    { thumb: `${CDN}/thumb_0002_a14435e8.jpg`, full: `${CDN}/full_0002_a5981ddf.jpg` },
    { thumb: `${CDN}/thumb_0003_66478c66.jpg`, full: `${CDN}/full_0003_c2439a90.jpg` },
    { thumb: `${CDN}/thumb_0004_e73bf95e.jpg`, full: `${CDN}/full_0004_23545b31.jpg` },
    { thumb: `${CDN}/thumb_0005_4ce30f2a.jpg`, full: `${CDN}/full_0005_a7aeb922.jpg` },
    { thumb: `${CDN}/full_0006_60cfe51e.jpg`, full: `${CDN}/full_0006_60cfe51e.jpg` },
  ],
  lixi: [
    { thumb: `${CDN}/thumb_0001_44e95e48.jpg`, full: `${CDN}/full_0001_43cb3a0c.jpg` },
    { thumb: `${CDN}/thumb_0002_6744f394.jpg`, full: `${CDN}/full_0002_9aa7de6f.jpg` },
    { thumb: `${CDN}/thumb_0003_cd667a10.jpg`, full: `${CDN}/full_0003_0a581dbe.jpg` },
    { thumb: `${CDN}/thumb_0004_c7de48c9.jpg`, full: `${CDN}/full_0004_5bb106cc.jpg` },
    { thumb: `${CDN}/thumb_0005_ea1e7d98.jpg`, full: `${CDN}/full_0005_690c6eac.jpg` },
    { thumb: `${CDN}/full_0006_27de4370.jpg`, full: `${CDN}/full_0006_27de4370.jpg` },
  ],
  saimo: [
    { thumb: `${CDN}/thumb_0001_4dea3bca.jpg`, full: `${CDN}/full_0001_8ded2659.jpg` },
    { thumb: `${CDN}/thumb_0002_0c57bbff.jpg`, full: `${CDN}/full_0002_1fef6bc5.jpg` },
    { thumb: `${CDN}/thumb_0003_8d4e726c.jpg`, full: `${CDN}/full_0003_1e65c92e.jpg` },
    { thumb: `${CDN}/thumb_0004_c87ff2a9.jpg`, full: `${CDN}/full_0004_9e282942.jpg` },
    { thumb: `${CDN}/thumb_0005_e4600d3a.jpg`, full: `${CDN}/full_0005_9f09aaa9.jpg` },
    { thumb: `${CDN}/full_0006_50878b56.jpg`, full: `${CDN}/full_0006_50878b56.jpg` },
  ],
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const { stop: stopScroll, start: startScroll } = useLenis()

const cursorRef = ref<HTMLElement>()
const containerRef = ref<HTMLElement>()
const maskRef = ref<HTMLElement>()
const bigImgViewRef = ref<HTMLElement>()
const bigImgElRef = ref<HTMLImageElement>()

const cursorActive = ref(false)
const showBigImg = ref(false)
const showControls = ref(false)
const currentImageIndex = ref<number>(0)

let mouseMoveHandler: ((e: MouseEvent) => void) | null = null
let parallaxPaused = false

const PARALLAX = {
  maxMoveX: 2, maxMoveY: 2, sensitivity: 1, duration: 1,
  scale: { min: 0.7, max: 1, radius: 1000 },
}

/** 当前角色的图片列表 */
const imgList = computed(() => {
  const name = (props.roleName || '').toLowerCase()
  return ROLE_IMAGES[name] || ROLE_IMAGES.captain
})

/* ====== 光标跟随（GSAP 直接操作 DOM，不经 Vue 响应式） ====== */
function updateCursor(e: MouseEvent) {
  const c = cursorRef.value
  if (!c) return
  gsap.to(c, {
    x: e.clientX - c.offsetWidth / 2,
    y: e.clientY - c.offsetHeight / 2,
    duration: 0.08,
    ease: 'power2.out',
  })
}

/* ====== 鼠标视差：container 反向偏移 + 图片距离缩放 ====== */
function updateParallax(e: MouseEvent) {
  if (parallaxPaused) return
  const ct = containerRef.value
  if (!ct) return
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const mx = -((e.clientX - cx) / cx) * PARALLAX.maxMoveX * PARALLAX.sensitivity
  const my = -((e.clientY - cy) / cy) * PARALLAX.maxMoveY * PARALLAX.sensitivity
  gsap.to(ct, { x: `${mx}rem`, y: `${my}rem`, duration: PARALLAX.duration, ease: 'power2.out', overwrite: 'auto' })

  const { min, max, radius } = PARALLAX.scale
  ct.querySelectorAll('.img-cnt').forEach(el => {
    const r = el.getBoundingClientRect()
    const d = Math.sqrt((r.left + r.width / 2 - cx) ** 2 + (r.top + r.height / 2 - cy) ** 2)
    gsap.to(el, { scale: max - (max - min) * Math.min(d / radius, 1), duration: PARALLAX.duration, ease: 'power2.out', overwrite: 'auto' })
  })
}

function imgFadeIn() {
  if (maskRef.value) gsap.fromTo(maskRef.value, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' })
  containerRef.value?.querySelectorAll('.img-cnt').forEach((el, i) => {
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.5 + 0.02 * i, ease: 'power2.out' })
  })
}

function bindEvents() {
  mouseMoveHandler = (e: MouseEvent) => { updateCursor(e); updateParallax(e) }
  window.addEventListener('mousemove', mouseMoveHandler)
}
function unbindEvents() {
  if (mouseMoveHandler) { window.removeEventListener('mousemove', mouseMoveHandler); mouseMoveHandler = null }
}

/* ====== 放大视图 ====== */
function showImg(index: number) {
  currentImageIndex.value = index
  showBigImg.value = true
  parallaxPaused = true
  showControls.value = false

  nextTick(() => {
    const view = bigImgViewRef.value
    const img = bigImgElRef.value
    if (!view || !img) return
    img.src = imgList.value[index].full
    gsap.set(view, { display: 'flex' })
    gsap.fromTo(view, { autoAlpha: 0 }, {
      autoAlpha: 1, duration: 0.4,
      onComplete() { showControls.value = true },
    })
  })
}

function closeBigImg() {
  const view = bigImgViewRef.value
  if (view) {
    gsap.to(view, { autoAlpha: 0, duration: 0.3, onComplete() { gsap.set(view, { display: 'none' }) } })
  }
  showBigImg.value = false
  showControls.value = false
  parallaxPaused = false
}

function switchImg(delta: number) {
  const len = imgList.value.length
  if (!len) return
  let next = (currentImageIndex.value + delta + len) % len
  currentImageIndex.value = next
  const img = bigImgElRef.value
  if (img) {
    gsap.to(img, {
      autoAlpha: 0, duration: 0.15,
      onComplete() {
        img.src = imgList.value[next].full
        gsap.to(img, { autoAlpha: 1, duration: 0.15 })
      },
    })
  }
}

function handleClose() {
  if (showBigImg.value) { closeBigImg(); return }
  unbindEvents()
  emit('close')
}

watch(() => props.visible, async (val) => {
  if (val) {
    stopScroll()
    showBigImg.value = false
    showControls.value = false
    parallaxPaused = false
    await nextTick()
    imgFadeIn()
    bindEvents()
  } else {
    unbindEvents()
    startScroll()
  }
})

onBeforeUnmount(() => unbindEvents())
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="gallery-pop">
      <div ref="maskRef" class="mask" />
      <div ref="cursorRef" class="custom-cursor" :class="{ active: cursorActive }" />

      <!-- 缩略图视图 -->
      <div ref="containerRef" class="container">
        <div
          v-for="(img, i) in imgList"
          :key="i"
          class="img-cnt"
          @click="showImg(i)"
          @mouseenter="cursorActive = true"
          @mouseleave="cursorActive = false"
        >
          <img :src="img.thumb" alt="" />
          <div class="img-mask" />
        </div>
      </div>

      <!-- "返回官网" 按钮（缩略图视图） -->
      <div v-show="!showBigImg" class="close-btn" @click="handleClose">
        <span>返回官网</span>
        <span class="sub">Back</span>
      </div>

      <!-- 放大视图 -->
      <div ref="bigImgViewRef" class="big-img-view">
        <img ref="bigImgElRef" class="big-img-el" src="" alt="" />
        <template v-if="showControls">
          <div class="close-btn-x" @click="closeBigImg"><span /><span /></div>
          <div class="prev-btn" @click="switchImg(-1)">
            <svg viewBox="0 0 26 46"><path d="M24 44L2 23L24 2" stroke="#F2F2F2" stroke-width="3" fill="none" /></svg>
          </div>
          <div class="next-btn" @click="switchImg(1)">
            <svg viewBox="0 0 26 46"><path d="M2 2L24 23L2 44" stroke="#F2F2F2" stroke-width="3" fill="none" /></svg>
          </div>
        </template>
      </div>

      <!-- 背景角色名装饰文字 -->
      <div class="font-bg"><span>{{ roleName }}</span></div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.gallery-pop {
  position: fixed;
  inset: 0;
  z-index: $z-gallery;
  overflow: hidden;
  cursor: none;
}

.mask {
  position: absolute;
  inset: 0;
  background: #000;
  pointer-events: none;
  z-index: 1;
}

.custom-cursor {
  position: fixed;
  left: 0;
  top: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  pointer-events: none;
  z-index: 99999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  will-change: transform;
  transition: width 0.2s, height 0.2s, opacity 0.2s;

  &.active {
    width: 40px;
    height: 40px;
    opacity: 0.6;
  }
}

.container {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  will-change: transform;
}

/* "返回官网" */
.close-btn {
  position: absolute;
  top: 0.32rem;
  right: 0.4rem;
  z-index: 3;
  text-align: right;
  color: #E1E1E1;
  font-size: 0.36rem;
  font-weight: 330;
  cursor: none;
  transition: color 0.2s;

  .sub {
    display: block;
    color: $color-text;
    font-size: 0.2rem;
    font-weight: 330;
    text-transform: uppercase;
    margin-top: -0.05rem;
  }

  &:hover { color: $color-primary; .sub { color: $color-primary; } }
}

/* 缩略图散布布局 */
.img-cnt {
  position: absolute;
  cursor: none;
  will-change: transform;
  opacity: 0;

  img { display: block; width: 100%; height: 100%; object-fit: cover; }

  .img-mask {
    position: absolute;
    inset: 0;
    background: #111;
    opacity: 0.45;
    pointer-events: none;
    transition: opacity 0.3s;
  }

  &:hover .img-mask { opacity: 0; }

  &:nth-child(1) { left: -1.2rem; top: 0.73rem; width: 4.86rem; height: 2.73rem; }
  &:nth-child(2) { left: 12.32rem; top: -0.7rem; width: 5.62rem; height: 3.16rem; }
  &:nth-child(3) { left: 50%; top: 50%; width: 8.16rem; height: 4.6rem; margin-top: -2.28rem; margin-left: -4.08rem; }
  &:nth-child(4) { left: -1.36rem; bottom: 0; width: 5.93rem; height: 3.33rem; }
  &:nth-child(5) { left: 15.48rem; bottom: 0.66rem; width: 5.5rem; height: 3.1rem; }
  &:nth-child(6) { left: 5.9rem; bottom: -0.4rem; width: 4.6rem; height: 2.6rem; }
}

/* 放大视图 — 全屏 */
.big-img-view {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: none;
  align-items: center;
  justify-content: center;
  background: #000;
}

.big-img-el {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  z-index: 1;
}

.close-btn-x {
  position: absolute;
  z-index: 3;
  width: 0.8rem;
  height: 0.8rem;
  top: 0.22rem;
  right: 0.22rem;
  transition: transform 0.5s;
  cursor: none;

  &:hover { transform: rotate(180deg); }

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

.prev-btn, .next-btn {
  position: absolute;
  top: 50%;
  width: 0.26rem;
  height: 0.46rem;
  transform: translateY(-50%);
  cursor: none;
  z-index: 3;
  &:hover svg path { stroke: $color-primary; }
  svg { width: 100%; height: 100%; }
}
.prev-btn { left: 0.46rem; }
.next-btn { right: 0.46rem; }

.font-bg {
  position: fixed;
  inset: 0;
  font-size: 3.04rem;
  font-weight: bold;
  z-index: 1;
  text-transform: uppercase;
  pointer-events: none;
  span { position: absolute; display: block; color: #fff; top: 1rem; opacity: 0.04; }
}
</style>
