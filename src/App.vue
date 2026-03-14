<script setup lang="ts">
/**
 * 根组件
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useLenis } from '@/composables/useLenis'
import { usePerformance } from '@/composables/usePerformance'
import { useAppStore } from '@/stores/app'
import { PV_VIDEO } from '@/utils/videos'

import LoadingScreen from '@/components/common/LoadingScreen.vue'
import VideoPopup from '@/components/common/VideoPopup.vue'
import DisclaimerDialog from '@/components/common/DisclaimerDialog.vue'
import TopBar from '@/components/layout/TopBar.vue'
import SideNav from '@/components/layout/SideNav.vue'
import FooterNav from '@/components/layout/FooterNav.vue'
import HomeSection from '@/components/sections/HomeSection.vue'
import RoleSection from '@/components/sections/RoleSection.vue'
import ErasureSection from '@/components/sections/ErasureSection.vue'
import ReserveSection from '@/components/sections/ReserveSection.vue'
import NewsSection from '@/components/sections/NewsSection.vue'
import GalleryPop from '@/components/gallery/GalleryPop.vue'

const appStore = useAppStore()
const { init: initLenis, scrollTo, destroy: destroyLenis } = useLenis()
const { detectPerformanceLevel } = usePerformance()

const isLoaded = ref(false)
const sideNavOpen = ref(false)
const galleryVisible = ref(false)
const galleryRoleName = ref('')
const pvVisible = ref(false)
const disclaimerVisible = ref(false)

const showSideNavToggle = computed(() => appStore.currentPosition !== 'home')

function onLoadingComplete() {
  isLoaded.value = true
  appStore.setLoadingComplete(true)
  initLenis()
}

function handleScrollToSection(section: string) {
  if (section === 'news') {
    const newsEl = document.querySelector('.news-section') as HTMLElement | null
    if (newsEl) {
      const target = newsEl.offsetTop + newsEl.offsetHeight - window.innerHeight
      scrollTo(target, { immediate: true })
    }
    return
  }
  if (section === 'role') {
    const spacer = document.querySelector('.role-section .spacer') as HTMLElement | null
    if (spacer) {
      const roleOffset = spacer.offsetTop + spacer.offsetHeight * (4.1 / 26) - window.innerHeight / 2
      scrollTo(Math.max(0, roleOffset), { immediate: true })
    }
    return
  }
  const el = document.querySelector(`.${section}-section`) as HTMLElement | null
  if (el) scrollTo(el.offsetTop, { immediate: true })
}

function toggleSideNav() { sideNavOpen.value = !sideNavOpen.value }
function openGallery(roleName: string) { galleryRoleName.value = roleName; galleryVisible.value = true }
function closeGallery() { galleryVisible.value = false }
function openPV() { pvVisible.value = true }
function closePV() { pvVisible.value = false }
function showDisclaimer() { disclaimerVisible.value = true }
function hideDisclaimer() { disclaimerVisible.value = false }

onMounted(() => {
  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
  const perfMode = detectPerformanceLevel()
  if (appStore.performanceMode.source === 'default') appStore.setPerformanceMode(perfMode)
})

onBeforeUnmount(() => { destroyLenis() })
</script>

<template>
  <div id="ananta-app">
    <LoadingScreen @complete="onLoadingComplete" />

    <template v-if="isLoaded">
      <TopBar @scroll-to-section="handleScrollToSection" />

      <SideNav
        :is-open="sideNavOpen"
        :show-toggle="showSideNavToggle"
        @toggle="toggleSideNav"
        @close="sideNavOpen = false"
        @scroll-to-section="handleScrollToSection"
      />

      <HomeSection @play-video="openPV" @show-disclaimer="showDisclaimer" />
      <RoleSection @open-gallery="openGallery" />
      <ErasureSection />
      <ReserveSection />
      <NewsSection @show-disclaimer="showDisclaimer" />
      <FooterNav />

      <GalleryPop :visible="galleryVisible" :role-name="galleryRoleName" @close="closeGallery" />
      <VideoPopup :visible="pvVisible" :src="PV_VIDEO" @close="closePV" />
      <DisclaimerDialog :visible="disclaimerVisible" @close="hideDisclaimer" />
    </template>
  </div>
</template>

<style lang="scss">
#ananta-app {
  position: relative;
  width: 100%;
  min-height: 100vh;
}
</style>
