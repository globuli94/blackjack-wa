<template>
  <div v-if="show" class="lottie-overlay" :class="{ 'fading-out': isFadingOut }">
    <div class="lottie-container">
      <div ref="lottieContainer" class="lottie-animation"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import lottie from 'lottie-web'
import JSZip from 'jszip'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    required: true
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  loop: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['complete', 'loaded'])

const lottieContainer = ref(null)
const isFadingOut = ref(false)
let animationInstance = null
let stopTimeout = null
let fadeTimeout = null

const loadAnimation = async () => {
  if (!lottieContainer.value || !props.show) return

  try {
    let animationData

    // Check if it's a .lottie file (ZIP archive)
    if (props.url.endsWith('.lottie')) {
      // Fetch the .lottie file (which is a ZIP)
      const response = await fetch(props.url)
      const blob = await response.blob()
      
      // Use JSZip to extract the JSON file from the ZIP
      const zip = await JSZip.loadAsync(blob)
      
      // Find the JSON file in the animations folder
      const jsonFile = zip.file(/animations\/.*\.json/)[0]
      if (!jsonFile) {
        throw new Error('No animation JSON file found in .lottie archive')
      }
      
      animationData = JSON.parse(await jsonFile.async('string'))
    } else {
      // Regular JSON URL
      const response = await fetch(props.url)
      animationData = await response.json()
    }

    // Clean up existing animation if any
    if (animationInstance) {
      animationInstance.destroy()
      animationInstance = null
    }

    // Create new animation instance
    animationInstance = lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: 'svg',
      loop: props.loop,
      autoplay: props.autoplay,
      animationData: animationData
    })

    // Calculate duration and set up early stop
    const totalFrames = animationInstance.totalFrames
    const frameRate = animationData.fr || 60
    const totalDuration = totalFrames / frameRate
    const stopDuration = Math.max(0.1, totalDuration - 1) // Stop 1 second before the end, min 0.1s
    const stopFrame = Math.max(0, Math.floor(stopDuration * frameRate))

    // Helper function to start fade out
    const startFadeOut = () => {
      isFadingOut.value = true
      // Wait for fade animation to complete before emitting complete
      if (fadeTimeout) {
        clearTimeout(fadeTimeout)
      }
      fadeTimeout = setTimeout(() => {
        emit('complete')
      }, 300) // Match CSS transition duration
    }

    // Use enterFrame listener to stop at the exact frame
    const onEnterFrame = () => {
      try {
        // Use currentFrame directly, or calculate from currentTime if available
        const currentFrame = animationInstance.currentFrame || Math.floor((animationInstance.currentTime || 0) * frameRate)
        if (currentFrame >= stopFrame) {
          animationInstance.removeEventListener('enterFrame', onEnterFrame)
          animationInstance.pause()
          animationInstance.goToAndStop(stopFrame, true)
          startFadeOut()
        }
      } catch (error) {
        console.error('Error in enterFrame handler:', error)
      }
    }

    animationInstance.addEventListener('enterFrame', onEnterFrame)

    // Backup timeout
    if (stopTimeout) {
      clearTimeout(stopTimeout)
      stopTimeout = null
    }

    if (stopDuration > 0) {
      stopTimeout = setTimeout(() => {
        if (animationInstance) {
          try {
            animationInstance.removeEventListener('enterFrame', onEnterFrame)
            animationInstance.pause()
            animationInstance.goToAndStop(stopFrame, true)
            if (stopTimeout) {
              clearTimeout(stopTimeout)
              stopTimeout = null
            }
            startFadeOut()
          } catch (error) {
            console.error('Error in timeout handler:', error)
            startFadeOut()
          }
        }
      }, stopDuration * 1000)
    }

    // Listen for complete event as fallback
    const onComplete = () => {
      try {
        animationInstance.removeEventListener('enterFrame', onEnterFrame)
        if (stopTimeout) {
          clearTimeout(stopTimeout)
          stopTimeout = null
        }
        startFadeOut()
      } catch (error) {
        console.error('Error in complete handler:', error)
        startFadeOut()
      }
    }

    animationInstance.addEventListener('complete', onComplete)

    emit('loaded')
  } catch (error) {
    console.error('Error loading Lottie animation:', error)
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    // Reset fade state
    isFadingOut.value = false
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      loadAnimation()
    }, 100)
  } else {
    // Clean up animation when hidden
    if (fadeTimeout) {
      clearTimeout(fadeTimeout)
      fadeTimeout = null
    }
    if (stopTimeout) {
      clearTimeout(stopTimeout)
      stopTimeout = null
    }
    if (animationInstance) {
      animationInstance.destroy()
      animationInstance = null
    }
    isFadingOut.value = false
  }
})

onMounted(() => {
  if (props.show) {
    loadAnimation()
  }
})

onBeforeUnmount(() => {
  if (fadeTimeout) {
    clearTimeout(fadeTimeout)
    fadeTimeout = null
  }
  if (stopTimeout) {
    clearTimeout(stopTimeout)
    stopTimeout = null
  }
  if (animationInstance) {
    animationInstance.destroy()
    animationInstance = null
  }
})
</script>

<style scoped>
.lottie-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 800px;
  height: 100%;
  max-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.3s ease-out;
}

.lottie-overlay.fading-out {
  opacity: 0;
}

.lottie-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lottie-animation {
  width: 100%;
  height: 100%;
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .lottie-overlay {
    max-width: 90vw;
    max-height: 50vh;
  }
}
</style>
