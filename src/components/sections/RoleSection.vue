<script setup lang="ts">
/**
 * 角色展示区块 — 页面最复杂的部分
 *
 * 动画架构（逆向原站）：
 * - spacer 高度 2000vh，提供极长的滚动驱动空间
 * - 背景视频 currentTime 从 0 同步到 26s
 * - 4 个角色按 scroll progress 区间依次出入场：
 *   · 队长(captain):  dycIn(2.5) → dycOut(4.1)
 *   · 塔菲(tafei):    tafeiIn(8.2) → tafeiOut(9.3)
 *   · 里希(lixi):     lixiIn(15.5) → lixiOut(16.8)
 *   · 赛默(saimo):    saimoIn(22) → saimoOut(23.4)
 * - 每个角色：名字淡入 + 文案从 x 偏移滑入 + 画廊按钮同步
 * - 退场：全部 fadeOut，缓动 power2.in
 *
 * 低性能模式：使用静态背景图代替视频，spacer 缩短为 400vh
 */
import { ref, onMounted, computed } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/stores/app'
import { cdnUrl } from '@/utils'
import { ROLE_VIDEO } from '@/utils/videos'
import TafeiDialog from '@/components/animation/TafeiDialog.vue'

gsap.registerPlugin(ScrollTrigger)

const emit = defineEmits<{
  /** 点击画廊按钮时向父组件传递角色名 */
  openGallery: [roleName: string]
}>()

const appStore = useAppStore()
const isLow = computed(() => appStore.isLowPerformance)

/** DOM 引用 */
const roleSectionRef = ref<HTMLElement>()
const fixedCntRef = ref<HTMLElement>()
const spacerRef = ref<HTMLElement>()
const videoRef = ref<HTMLVideoElement>()

/** 主时间线引用（供子组件注入动画） */
let mainTimeline: gsap.core.Timeline | null = null

/** 控制 TafeiDialog 渲染时机 — 必须在 mainTimeline 创建后才渲染 */
const initDialog = ref(false)

/** 视频加载超时（ms），超时后不等视频直接初始化动画 */
const VIDEO_LOAD_TIMEOUT = 5000

/** 队长静态图作为视频 poster 兜底 */
const videoPoster = cdnUrl('assets/role-captain_c7ae1344.jpg')

/** 角色配置数据 */
const roles = [
  {
    id: 'captain',
    nameEn: 'captain',
    nameCn: '队长',
    nameClass: 'role-name-dcy',
    msgClass: 'msg-dcy',
    galleryClass: 'gallery-btn-dcy',
    namePosition: 'right' as const,
    msgPosition: 'left' as const,
    quote: '我不堵车，\n我用飞的。',
    desc: '倒霉的混厄对策局特遣队队长，来自……等等，先打住，不聊我了，既然到了这儿，就一起放松点，找找有什么好玩的吧。如果计划赶不上变化，那就把变化踹进你的计划。',
    textBg: cdnUrl('assets/dcytext_c0f51eca.png'),
    textSmallBg: cdnUrl('assets/dcytext-s_2bce561c.png'),
    staticBg: cdnUrl('assets/role-captain_c7ae1344.jpg'),
  },
  {
    id: 'tafei',
    nameEn: 'TAFFY',
    nameCn: '塔菲',
    nameClass: 'role-name-tafei',
    msgClass: 'msg-tafei',
    galleryClass: 'gallery-btn-tafei',
    namePosition: 'left' as const,
    msgPosition: 'right' as const,
    quote: '这工作这么难，\n当初就不该给我。',
    desc: '都说找工作要钱多事少离家近，本以为加入对策局就能翻个身躺平，再不用大热天骑着摩托送些怪货。但到头来，还是一场空。',
    textBg: cdnUrl('assets/tafeitext_89eff38a.png'),
    textSmallBg: cdnUrl('assets/tafeitext-s_b4a5bb9d.png'),
    staticBg: cdnUrl('assets/role-tafei_0ed12004.jpg'),
    hasDialog: true,
  },
  {
    id: 'lixi',
    nameEn: 'richie',
    nameCn: '里希',
    nameClass: 'role-name-lixi',
    msgClass: 'msg-lixi',
    galleryClass: 'gallery-btn-lixi',
    namePosition: 'left' as const,
    msgPosition: 'right' as const,
    quote: '我的直觉告诉我，\n它也是瞎蒙的。',
    desc: '上班抓小偷，下班打小工，常常让人分不清究竟是游刃有余，还是放空了大脑。最后提醒一句，被逮捕时就乖乖跟她走吧。',
    textBg: cdnUrl('assets/lixitext_a72d37d4.png'),
    textSmallBg: cdnUrl('assets/lixitext-s_80646f11.png'),
    staticBg: cdnUrl('assets/role-lixi_a69544ea.jpg'),
  },
  {
    id: 'saimo',
    nameEn: 'seymour',
    nameCn: '赛默',
    nameClass: 'role-name-saimo',
    msgClass: 'msg-saimo',
    galleryClass: 'gallery-btn-saimo',
    namePosition: 'left' as const,
    msgPosition: 'right' as const,
    quote: '太自以为是了，\n我可没有在偷偷\n看你。',
    desc: '只要有信号，就没有他找不到的人，当然，必须是让他感兴趣的家伙。因为总被人问面具哪买的，所以大多数时候都在自己的房车里待着。',
    textBg: cdnUrl('assets/saimotext_d1ca598a.png'),
    textSmallBg: cdnUrl('assets/saimotext-s_039b9f4e.png'),
    staticBg: cdnUrl('assets/role-saimo_d1a180a7.jpg'),
  },
]

/** scroll progress → 角色位置映射 */
const positionRanges = [
  { range: [0, 0.2], position: 'captain' as const },
  { range: [0.2, 0.44], position: 'tafei' as const },
  { range: [0.44, 0.7], position: 'lixi' as const },
  { range: [0.7, 1], position: 'saimo' as const },
]

/** 根据 scroll progress 更新当前角色位置 */
function checkPosition(progress: number) {
  const found = positionRanges.find(
    item => progress >= item.range[0] && progress < item.range[1],
  )
  appStore.setCurrentPosition(found?.position ?? 'erasure')
}

/**
 * 立即隐藏所有角色元素（不依赖视频加载）
 * 必须在 onMounted 最早阶段调用，防止 fixed 元素默认可见导致堆叠重叠
 */
function hideAllRoleElements() {
  gsap.set('.role-name', { autoAlpha: 0 })
  gsap.set('.role-msg', { autoAlpha: 0 })
  gsap.set('.gallery-btn .btn', { autoAlpha: 0 })
  if (roleSectionRef.value) {
    gsap.set(roleSectionRef.value, { autoAlpha: 0 })
  }
}

/** 初始化高性能模式动画（视频 + 滚动驱动） */
function initAnimation() {
  // 外层时间线：控制整个区块的显隐 + pin
  gsap.timeline({
    defaults: { ease: 'none', duration: 27 },
    scrollTrigger: {
      trigger: spacerRef.value!,
      start: 'top top',
      end: 'bottom top',
      pin: fixedCntRef.value!,
      scrub: 0,
      onUpdate(self) {
        if (self.progress < 1 && self.progress > 0) {
          fixedCntRef.value!.style.zIndex = '9'
        } else {
          fixedCntRef.value!.style.zIndex = '0'
        }
        checkPosition(self.progress)
      },
    },
  })
    .fromTo(roleSectionRef.value!, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 })
    .to(roleSectionRef.value!, { autoAlpha: 1, duration: 26.5 })

  // 主时间线：驱动视频进度 + 角色出入场
  const tl = mainTimeline = gsap.timeline({
    defaults: { ease: 'none', duration: 27 },
    scrollTrigger: {
      trigger: spacerRef.value!,
      start: 'top top',
      end: 'bottom top',
      scrub: 0,
    },
  })

  // 时间标签（与原站完全一致的时间点）
  tl.addLabel('start')
    .addLabel('dycIn', 'start+=2.5')
    .addLabel('dycOut', 'start+=4.1')
    .addLabel('tafeiIn', 'start+=8.2')
    .addLabel('tafeiOut', 'start+=9.3')
    .addLabel('lixiIn', 'start+=15.5')
    .addLabel('lixiOut', 'start+=16.8')
    .addLabel('saimoIn', 'start+=22')
    .addLabel('saimoOut', 'start+=23.4')

  // 视频 currentTime 同步滚动
  // 注意：GSAP 直接操作 video.currentTime，无需 play()
  if (videoRef.value) {
    const video = videoRef.value
    video.pause()
    tl.fromTo(video, { currentTime: 0 }, {
      currentTime: 26,
      duration: 26,
      ease: 'linear',
    }, 'start')
  }

  // ====== 队长 ======
  tl.fromTo('.role-name-dcy', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22 }, 'dycIn')
    .fromTo('.msg-dcy', { autoAlpha: 0, x: -54 }, { autoAlpha: 1, x: 0, duration: 0.3 }, 'dycIn')
    .fromTo('.gallery-btn-dcy .btn', { autoAlpha: 0, x: -54 }, { autoAlpha: 1, x: 0, duration: 0.3 }, 'dycIn')
    .to('.role-name-dcy', { autoAlpha: 0, duration: 1, ease: 'power2.in' }, 'dycOut')
    .to('.msg-dcy', { autoAlpha: 0, duration: 1, ease: 'power2.in' }, 'dycOut')
    .to('.gallery-btn-dcy .btn', { autoAlpha: 0, duration: 1, ease: 'power2.in' }, 'dycOut')

  // ====== 塔菲 ======
  tl.fromTo('.role-name-tafei', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22 }, 'tafeiIn')
    .fromTo('.msg-tafei', { autoAlpha: 0, x: 54 }, { autoAlpha: 1, x: 0, duration: 0.3 }, 'tafeiIn')
    .fromTo('.gallery-btn-tafei .btn', { autoAlpha: 0, x: 54 }, { autoAlpha: 1, x: 0, duration: 0.3 }, 'tafeiIn')
    .to('.role-name-tafei', { autoAlpha: 0, duration: 1, ease: 'power2.in' }, 'tafeiOut')
    .to('.msg-tafei', { autoAlpha: 0, duration: 1, ease: 'power2.in' }, 'tafeiOut')
    .to('.gallery-btn-tafei .btn', { autoAlpha: 0, duration: 1, ease: 'power2.in' }, 'tafeiOut')

  // ====== 里希 ======
  tl.fromTo('.role-name-lixi', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22 }, 'lixiIn')
    .fromTo('.msg-lixi', { autoAlpha: 0, x: 54 }, { autoAlpha: 1, x: 0, duration: 0.3 }, 'lixiIn')
    .fromTo('.gallery-btn-lixi .btn', { autoAlpha: 0, x: 54 }, { autoAlpha: 1, x: 0, duration: 0.3 }, 'lixiIn')
    .to('.role-name-lixi', { autoAlpha: 0, duration: 1, ease: 'power2.in' }, 'lixiOut')
    .to('.msg-lixi', { autoAlpha: 0, duration: 1, ease: 'power2.in' }, 'lixiOut')
    .to('.gallery-btn-lixi .btn', { autoAlpha: 0, duration: 1, ease: 'power2.in' }, 'lixiOut')

  // ====== 赛默 ======
  tl.fromTo('.role-name-saimo', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22 }, 'saimoIn')
    .fromTo('.msg-saimo', { autoAlpha: 0, x: 54 }, { autoAlpha: 1, x: 0, duration: 0.3 }, 'saimoIn')
    .fromTo('.gallery-btn-saimo .btn', { autoAlpha: 0, x: 54 }, { autoAlpha: 1, x: 0, duration: 0.3 }, 'saimoIn')
    .to('.role-name-saimo', { autoAlpha: 0, duration: 1, ease: 'power2.in' }, 'saimoOut')
    .to('.msg-saimo', { autoAlpha: 0, duration: 1, ease: 'power2.in' }, 'saimoOut')
    .to('.gallery-btn-saimo .btn', { autoAlpha: 0, duration: 1, ease: 'power2.in' }, 'saimoOut')

  // mainTimeline 就绪后再渲染 TafeiDialog，保证其 emit 的子时间线能注入
  initDialog.value = true
}

/** 低性能模式：静态图片 + 简短滚动 */
function initAnimationStatic() {
  gsap.set('.role-info-static', { autoAlpha: 0 })
  gsap.set(roleSectionRef.value!, { autoAlpha: 0 })

  gsap.timeline({
    defaults: { ease: 'none', duration: 1 },
    scrollTrigger: {
      trigger: spacerRef.value!,
      start: 'top top',
      end: 'bottom top',
      pin: fixedCntRef.value!,
      scrub: 0,
      onUpdate(self) {
        if (self.progress < 1 && self.progress > 0) {
          fixedCntRef.value!.style.zIndex = '9'
        } else {
          fixedCntRef.value!.style.zIndex = '0'
        }
      },
    },
  })
}

/** 点击画廊按钮 → 向父组件传递角色名 */
function handleGalleryClick(roleId: string) {
  emit('openGallery', roleId)
}

/** 塔菲对话气泡子时间线注入主时间线 */
function onTafeiTimelineCreated(timelines: gsap.core.Timeline[]) {
  if (mainTimeline && timelines.length > 0) {
    mainTimeline.add(timelines[0], 'dycOut+=1.2')
  }
}

onMounted(() => {
  if (isLow.value) {
    initAnimationStatic()
    return
  }

  // 先立即隐藏所有角色元素，防止视频加载期间文字堆叠可见
  hideAllRoleElements()

  const video = videoRef.value
  if (!video) {
    initAnimation()
    return
  }

  let initialized = false
  const startInit = () => {
    if (initialized) return
    initialized = true
    video.pause()
    video.currentTime = 0
    initAnimation()
  }

  // 视频 metadata 已就绪则直接初始化
  if (video.readyState >= 1) {
    startInit()
    return
  }

  // 否则等 metadata 事件
  video.addEventListener('loadedmetadata', startInit, { once: true })

  // 超时兜底：5 秒后如果视频还没就绪，也要初始化动画（角色出入场正常工作，仅视频不动）
  setTimeout(startInit, VIDEO_LOAD_TIMEOUT)
})
</script>

<template>
  <section ref="roleSectionRef" class="role-section" :class="{ low: isLow }">
    <div ref="fixedCntRef" class="fixed-cnt">
      <!-- 高性能：视频背景 -->
      <template v-if="!isLow">
        <div class="video-section">
          <video
            ref="videoRef"
            muted
            playsinline
            preload="auto"
            :src="ROLE_VIDEO"
            :poster="videoPoster"
          />
        </div>

        <!-- 顶部渐变遮罩 -->
        <div class="front-mask" />

        <!-- 角色信息层 -->
        <div v-for="role in roles" :key="role.id" class="role-info">
          <!-- 角色名 -->
          <div class="role-name" :class="role.nameClass">
            <span class="s1">{{ role.nameEn }}</span>
            <span class="s2">{{ role.nameCn }}</span>
          </div>

          <!-- 角色文案 -->
          <div class="role-msg" :class="role.msgClass">
            <div
              class="p1"
              :style="{
                backgroundImage: `url(${role.textBg})`,
              }"
            >
              {{ role.quote }}
            </div>
            <div
              class="p2"
              :style="{
                backgroundImage: `url(${role.textSmallBg})`,
              }"
            >
              {{ role.desc }}
            </div>
          </div>

          <!-- 画廊按钮 -->
          <div class="gallery-btn" :class="role.galleryClass">
            <div class="btn" @click="handleGalleryClick(role.id)" />
          </div>

          <!-- 塔菲对话气泡：必须在 mainTimeline 就绪后再渲染 -->
          <TafeiDialog
            v-if="role.hasDialog && initDialog"
            @timeline-created="onTafeiTimelineCreated"
          />
        </div>
      </template>

      <!-- 低性能：静态背景图 -->
      <template v-else>
        <div
          v-for="role in roles"
          :key="role.id"
          class="role-info-static"
          :class="`role-info-${role.id}`"
          :style="{ backgroundImage: `url(${role.staticBg})` }"
        />
      </template>
    </div>

    <!-- 滚动占位 -->
    <div ref="spacerRef" class="spacer" />
  </section>
</template>

<style scoped lang="scss">
.role-section {
  position: relative;
}

.fixed-cnt {
  width: 100%;
  height: 100vh;
  position: absolute;
}

.video-section {
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 1;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.spacer {
  height: 2000vh;
  position: relative;
  z-index: 2;
  background: transparent;
  pointer-events: none;
}

/* 顶部渐变遮罩 */
.front-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(to bottom, $color-bg 0%, rgba(23, 23, 23, 0) 100%);
  z-index: 2;
}

/* ====== 角色信息层 ====== */
.role-info {
  color: #fff;
}

/* 角色名称（固定定位） */
.role-name {
  color: #f0f0f0;
  font-size: 1.04rem;
  font-weight: 630;
  line-height: 1.04rem;
  position: fixed;
  z-index: 3;

  span {
    display: block;
  }

  .s1 {
    color: #fff;
    font-size: 0.28rem;
    font-weight: 400;
    line-height: 0.2rem;
    margin-bottom: 0.08rem;
    font-family: $font-family-en;
    margin-left: 0.09rem;

    &::before {
      content: '';
      display: inline-block;
      width: 0.03rem;
      height: 0.22rem;
      background: $color-primary;
      margin-right: 0.05rem;
      vertical-align: middle;
    }
  }
}

/* 各角色名位置 */
.role-name-dcy   { top: 50%; right: 0.82rem; margin-top: 2.54rem; }
.role-name-tafei { top: 50%; left: 1.6rem; margin-top: 2.54rem; }
.role-name-lixi  { top: 50%; left: 1.6rem; margin-top: 2.54rem; }
.role-name-saimo { top: 50%; left: 1.6rem; margin-top: 2.54rem; }

/* 角色文案（固定定位） */
.role-msg {
  color: #f9f9f9;
  font-size: 0.72rem;
  font-weight: 630;
  line-height: 0.72rem;
  z-index: 3;
  position: fixed;
  width: 5.93rem;
}

.role-msg .p1 {
  font-size: 0.72rem;
  font-weight: 630;
  line-height: 0.8rem;
  margin-bottom: 0.35rem;
  white-space: pre-line;
  /* 文字纹理效果 */
  background-repeat: repeat-y;
  background-position: center center;
  background-size: 100% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0.85;
  display: inline-block;
}

.role-msg .p2 {
  font-size: 0.19rem;
  font-weight: 450;
  line-height: 0.3rem;
  margin-left: 0.05rem;
  background-repeat: repeat-y;
  background-position: center center;
  background-size: 100% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0.85;
  width: 5rem;
}

/* 各角色文案位置 */
.msg-dcy   { top: 50%; left: 1.7rem; margin-top: -2.74rem; }
.msg-tafei { top: 50%; left: 50%; margin-top: -2.74rem; margin-left: 2rem; }
.msg-lixi  { top: 50%; right: 1.6rem; margin-top: -2.74rem; }
.msg-saimo { top: 50%; right: 1.6rem; margin-top: -2.74rem; }

/* 画廊按钮（固定定位） */
.gallery-btn {
  position: fixed;
  width: 0;
  height: 0;
  z-index: 20;
  transform-origin: 0.59rem 0.59rem;
  transition: transform 0.4s ease;

  .btn {
    background: linear-gradient(323deg, rgba(255, 255, 255, 0.03) -2.55%, rgba(255, 255, 255, 0.2) 101.18%);
    backdrop-filter: blur(0.05rem);
    border: 0.008rem solid rgba(255, 255, 255, 0.3);
    border-radius: 1.18rem;
    width: 1.18rem;
    height: 1.18rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &::before {
      display: block;
      content: '';
      width: 0.26rem;
      height: 0.44rem;
      background: url('#{$cdn-assets}/sprite-6fc8c4_6fc8c4aa.png') no-repeat;
      background-size: 4.66rem 3.94rem;
      background-position: -1.23rem -3.05rem;
    }
  }

  &:hover {
    transform: scale(1.05);
  }
}

/* 各画廊按钮位置 */
.gallery-btn-tafei,
.gallery-btn-saimo,
.gallery-btn-lixi {
  left: 50%;
  top: 50%;
  margin-top: 2.64rem;
  margin-left: 5.82rem;
}

.gallery-btn-dcy {
  left: 1.74rem;
  top: 50%;
  margin-top: 2.64rem;
}

/* ====== 低性能模式 ====== */
.role-section.low {
  .spacer {
    height: 400vh;
  }

  .role-info-static {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
  }
}
</style>
