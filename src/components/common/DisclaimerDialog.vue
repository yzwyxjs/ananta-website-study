<script setup lang="ts">
/**
 * 学习声明弹窗组件
 * 精美毛玻璃弹窗，点击新闻/预约按钮时弹出
 */
import { ref, watch, nextTick } from 'vue'
import { gsap } from 'gsap'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const overlayRef = ref<HTMLElement>()
const cardRef = ref<HTMLElement>()

watch(() => props.visible, async (val) => {
  if (val) {
    await nextTick()
    gsap.fromTo(overlayRef.value!, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
    gsap.fromTo(cardRef.value!, { scale: 0.85, y: 30 }, { scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' })
  }
})

function handleClose() {
  gsap.to(cardRef.value!, { scale: 0.9, autoAlpha: 0, duration: 0.2, ease: 'power2.in' })
  gsap.to(overlayRef.value!, {
    autoAlpha: 0,
    duration: 0.25,
    delay: 0.1,
    onComplete() { emit('close') },
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" ref="overlayRef" class="disclaimer-overlay" @click.self="handleClose">
      <div ref="cardRef" class="disclaimer-card">
        <div class="card-glow" />
        <div class="card-content">
          <div class="card-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#D62032" stroke-width="1.5" />
              <path d="M12 8v5" stroke="#D62032" stroke-width="1.5" stroke-linecap="round" />
              <circle cx="12" cy="16" r="0.8" fill="#D62032" />
            </svg>
          </div>
          <p class="card-text">本项目仅供学习、研究网页效果使用，感谢支持</p>
          <button class="card-btn" @click="handleClose">我知道了</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use 'sass:color';
.disclaimer-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.disclaimer-card {
  position: relative;
  width: 6rem;
  border-radius: 0.12rem;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(30, 30, 30, 0.95), rgba(20, 20, 20, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 0.25rem 0.6rem rgba(0, 0, 0, 0.5),
    0 0 0.8rem rgba(214, 32, 50, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.card-glow {
  position: absolute;
  top: -1px;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(214, 32, 50, 0.6), transparent);
}

.card-content {
  padding: 0.5rem 0.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.card-icon {
  margin-bottom: 0.24rem;
  opacity: 0.9;
}

.card-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.2rem;
  font-weight: 400;
  line-height: 1.7;
  margin-bottom: 0.4rem;
  letter-spacing: 0.01rem;
}

.card-btn {
  width: 100%;
  height: 0.52rem;
  border: none;
  border-radius: 0.06rem;
  background: linear-gradient(135deg, $color-primary, color.adjust($color-primary, $lightness: -8%));
  color: #fff;
  font-size: 0.18rem;
  font-weight: 450;
  cursor: pointer;
  transition: all 0.25s;
  letter-spacing: 0.02rem;
  box-shadow: 0 0.04rem 0.16rem rgba(214, 32, 50, 0.3);

  &:hover {
    background: linear-gradient(135deg, color.adjust($color-primary, $lightness: 4%), $color-primary);
    transform: translateY(-1px);
    box-shadow: 0 0.06rem 0.2rem rgba(214, 32, 50, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
