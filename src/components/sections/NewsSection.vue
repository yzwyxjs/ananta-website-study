<script setup lang="ts">
/**
 * 新闻区块
 *
 * 动画行为（逆向原站）：
 * - 固定容器 pin，300vh 滚动空间
 * - 标题、副标题、视频依次淡入
 * - 视频 currentTime 随滚动同步
 * - 新闻条目 stagger 延迟 0.2s 逐一淡入
 */
import { ref, onMounted, computed } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/stores/app'
import { cdnUrl } from '@/utils'
import type { NewsItem } from '@/types'

gsap.registerPlugin(ScrollTrigger)

const emit = defineEmits<{
  showDisclaimer: []
}>()

const appStore = useAppStore()
const isLow = computed(() => appStore.isLowPerformance)

const newsContainerRef = ref<HTMLElement>()
const newsFixedCntRef = ref<HTMLElement>()
const moreLinkRef = ref<HTMLElement>()
const newsVideoRef = ref<HTMLVideoElement>()

const titleBgUrl = cdnUrl('assets/title_bc1e915d.svg')

const newsList = ref<NewsItem[]>([
  { shortTitle: '春节快乐', title: '"以后每次除夕都要在一起过哦。"', href: '#' },
  { shortTitle: '官方吧新年活动', title: '预约送福利好礼！', href: '#' },
  { shortTitle: '2026红包封面', title: '《无限大》2026红包封面！', href: '#' },
  { shortTitle: '元旦快乐', title: '队长，元旦快乐!', href: '#' },
  { shortTitle: '玩法预告', title: '《无限大》玩法预告', href: '#' },
  { shortTitle: '实机演示', title: '《无限大》任务实机演示', href: '#' },
])

function handleNewsClick(e: Event) {
  e.preventDefault()
  emit('showDisclaimer')
}

function initScrollAnimation() {
  gsap.set(moreLinkRef.value!, { autoAlpha: 0 })

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: newsContainerRef.value!,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0,
      pin: newsFixedCntRef.value!,
      onUpdate(self) {
        if (self.progress > 0) {
          gsap.set(moreLinkRef.value!, { autoAlpha: 1 })
        } else {
          gsap.set(moreLinkRef.value!, { autoAlpha: 0 })
        }
        if (self.progress >= 0 && self.progress <= 1) {
          appStore.setCurrentPosition('news')
        }
      },
    },
  })

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: newsContainerRef.value!,
      start: 'top 30%',
      end: 'bottom bottom',
      scrub: 0,
    },
  })

  tl.fromTo(
    newsContainerRef.value!.querySelector('.news-title'),
    { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 'start',
  )
  tl.fromTo(
    newsContainerRef.value!.querySelector('.news-subtitle'),
    { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 'start',
  )

  // 视频淡入 + currentTime 随滚动同步
  const videoEl = newsVideoRef.value
  if (videoEl) {
    tl.fromTo(videoEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 'start+=0.1')
    tl.fromTo(videoEl, { currentTime: 0 }, { currentTime: 1, duration: 1.4 }, 'start+=0.1')
  }

  const newsItems = newsContainerRef.value!.querySelectorAll('.news-item')
  newsItems.forEach((item, index) => {
    tl.fromTo(item, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, `start+=${index * 0.2}`)
  })
}

function initScrollAnimationStatic() {
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: newsContainerRef.value!,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0,
      onUpdate(self) {
        if (self.progress >= 0 && self.progress <= 1) {
          appStore.setCurrentPosition('news')
        }
      },
    },
  })
}

onMounted(() => {
  // 视频需要暂停以便 GSAP 控制 currentTime
  if (newsVideoRef.value) {
    newsVideoRef.value.pause()
  }

  if (isLow.value) {
    initScrollAnimationStatic()
  } else {
    initScrollAnimation()
  }
})
</script>

<template>
  <section class="news-section" :class="{ low: isLow }">
    <a ref="moreLinkRef" class="more" href="#" @click.prevent="emit('showDisclaimer')">更多</a>

    <div ref="newsContainerRef" class="news-container">
      <div ref="newsFixedCntRef" class="news-fixed-cnt">
        <!-- 左侧：标题 + 视频 -->
        <div class="news-left">
          <div class="news-title" :style="{ backgroundImage: `url(${titleBgUrl})` }" />
          <div class="news-subtitle">最新动态</div>
          <div class="box">
            <video
              ref="newsVideoRef"
              class="news-video"
              muted
              playsinline
              preload="auto"
              src="/videos/news.mp4"
            />
          </div>
        </div>

        <!-- 右侧：新闻列表 -->
        <div class="news-right">
          <div class="news-list-inner">
            <a
              v-for="(item, index) in newsList"
              :key="index"
              class="news-item"
              href="#"
              @click="handleNewsClick"
            >
              <div class="news-short">{{ item.shortTitle }}</div>
              <div class="news-item-title">{{ item.title }}</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.news-section {
  position: relative;
}

.news-container {
  height: 300vh;
  width: 100%;
  position: relative;
}

.news-fixed-cnt {
  width: 100%;
  height: 100vh;
  position: relative;
}

.more {
  position: fixed;
  color: $color-text-secondary;
  font-size: 0.22rem;
  font-weight: 450;
  line-height: 0.24rem;
  top: 0.44rem;
  right: 1.58rem;
  z-index: 5;
  &:hover { color: $color-primary; }
}

.news-left {
  position: absolute;
  left: 1.06rem;
  top: 50%;
  transform: translateY(-50%);
}

.news-title {
  position: relative;
  width: 2.87rem;
  height: 0.77rem;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
}

.news-subtitle {
  position: absolute;
  top: 0.76rem;
  left: 0;
  color: $color-text-secondary;
  font-size: 0.3rem;
  font-weight: 380;
  min-width: 1.3rem;
}

.box {
  margin-top: 1rem;
  width: 5.35rem;
}

.news-video {
  width: 5.35rem;
  height: 3rem;
  object-fit: cover;
  display: block;
  border-radius: 0.04rem;
}

.news-right {
  position: absolute;
  top: 50%;
  left: 12.13rem;
  display: flex;
  align-items: center;
  margin-top: 0.24rem;
  transform: translateY(-50%);
}

.news-item {
  display: block;
  margin-bottom: 0.57rem;
  color: $color-text-secondary;
  cursor: pointer;
  position: relative;
  transition: color $transition-fast;
  &:hover { color: $color-primary; }
  &:last-child { margin-bottom: 0.46rem; }
}

.news-short {
  position: absolute;
  left: -0.6rem;
  top: calc(50% - 0.04rem);
  transform: translate(-100%, -50%);
  text-align: right;
  font-size: 0.28rem;
  font-weight: 450;
  line-height: 0.24rem;
}

.news-item-title {
  font-size: 0.18rem;
  font-weight: 250;
  line-height: 0.18rem;
}

.news-section.low {
  .more { position: absolute; }
  .news-container { height: 100vh; }
}
</style>
