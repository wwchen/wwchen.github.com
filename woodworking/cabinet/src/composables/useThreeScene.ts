import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function useThreeScene(containerRef: Ref<HTMLElement | null>) {
  const scene = ref<THREE.Scene | null>(null)
  const camera = ref<THREE.PerspectiveCamera | null>(null)
  const renderer = ref<THREE.WebGLRenderer | null>(null)
  const controls = ref<OrbitControls | null>(null)
  const animationFrameId = ref<number | null>(null)

  function initScene(): void {
    if (!containerRef.value) return

    // Create scene
    scene.value = new THREE.Scene()
    scene.value.background = new THREE.Color(0xf0f0f0)

    // Create camera
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
    camera.value = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.value.position.set(40, 40, 40)
    camera.value.lookAt(0, 0, 0)

    // Create renderer
    renderer.value = new THREE.WebGLRenderer({ antialias: true })
    renderer.value.setSize(width, height)
    renderer.value.setPixelRatio(window.devicePixelRatio)
    containerRef.value.appendChild(renderer.value.domElement)

    // Create controls
    controls.value = new OrbitControls(camera.value, renderer.value.domElement)
    controls.value.enableDamping = true
    controls.value.dampingFactor = 0.05
    controls.value.screenSpacePanning = false
    controls.value.minDistance = 10
    controls.value.maxDistance = 200

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.value.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    scene.value.add(directionalLight)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
    directionalLight2.position.set(-10, 10, -10)
    scene.value.add(directionalLight2)

    // Add grid
    const gridHelper = new THREE.GridHelper(100, 100, 0xcccccc, 0xeeeeee)
    scene.value.add(gridHelper)

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(20)
    scene.value.add(axesHelper)

    // Start animation loop
    animate()
  }

  function animate(): void {
    if (!renderer.value || !scene.value || !camera.value || !controls.value) return

    animationFrameId.value = requestAnimationFrame(animate)
    controls.value.update()
    renderer.value.render(scene.value, camera.value)
  }

  function handleResize(): void {
    if (!containerRef.value || !camera.value || !renderer.value) return

    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight

    camera.value.aspect = width / height
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(width, height)
  }

  function dispose(): void {
    // Cancel animation frame
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }

    // Dispose controls
    if (controls.value) {
      controls.value.dispose()
      controls.value = null
    }

    // Dispose renderer
    if (renderer.value) {
      renderer.value.dispose()
      if (containerRef.value && renderer.value.domElement.parentNode === containerRef.value) {
        containerRef.value.removeChild(renderer.value.domElement)
      }
      renderer.value = null
    }

    // Clean up scene
    if (scene.value) {
      scene.value.clear()
      scene.value = null
    }

    camera.value = null
  }

  onMounted(() => {
    initScene()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    dispose()
  })

  return {
    scene,
    camera,
    renderer,
    controls,
  }
}
