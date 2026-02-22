'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { MeshoptDecoder } from 'meshoptimizer'
import Technologies from './Technologies.jsx'

export default function ModelViewer() {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const animationFrameRef = useRef(null)
  const animateFnRef = useRef(null)
  const isVisibleRef = useRef(true)
  const modelRef = useRef(null)
  const lightRef = useRef(null)
  const technologiesRef = useRef(null)
  const modelMaxDimRef = useRef(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  // Helper function to calculate and set camera distance based on aspect ratio
  const updateCameraDistance = (camera, maxDim) => {
    if (!containerRef.current) return
    
    const fov = camera.fov * (Math.PI / 180)
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
    
    // Calculate distance needed for vertical fit
    const distanceForVertical = Math.abs(maxDim / 2 / Math.tan(fov / 2))
    
    // Calculate distance needed for horizontal fit
    // Horizontal FOV is derived from vertical FOV and aspect ratio
    const horizontalFov = 2 * Math.atan(Math.tan(fov / 2) * aspect)
    const distanceForHorizontal = Math.abs(maxDim / 2 / Math.tan(horizontalFov / 2))
    
    // Use the larger distance to ensure model fits in both dimensions
    let cameraZ = Math.max(distanceForVertical, distanceForHorizontal)
    cameraZ *= 1.2 // Add some padding
    camera.position.z = cameraZ
  }

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene
    setSceneReady(true)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      25,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0.1, 0.5, 5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera
    setCameraReady(true)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.5
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Load HDR environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()
    
    const rgbeLoader = new RGBELoader()
    rgbeLoader.load('/models/qwantani_dusk_2_puresky_1k.hdr', (texture) => {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture
      // Darken the environment map
      envMap.mapping = THREE.EquirectangularReflectionMapping
      scene.environment = envMap
      scene.environmentIntensity = 0.28 // Reduce environment intensity
      scene.background = new THREE.Color(0x0a0a0a) // Dark gray background
      texture.dispose()
      pmremGenerator.dispose()
    }, undefined, (error) => {
      console.error('Error loading HDR environment map:', error)
    })

    // Soft ambient light to fill shadows
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)
    
    // Softer directional light - reduced intensity and warmer color
    const directionalLight = new THREE.DirectionalLight(0xfff5e1, 0.8) // Reduced intensity for softer look
    directionalLight.position.set(10, 10, 10)
    scene.add(directionalLight)
    lightRef.current = directionalLight

    // Load model
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    loader.load('/models/final_web.glb', (gltf) => {
      scene.add(gltf.scene)
      modelRef.current = gltf.scene
      modelRef.current.rotation.y = 1.10
      
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(gltf.scene)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      // Center the model
      gltf.scene.position.x = -center.x
      gltf.scene.position.y = -center.y
      gltf.scene.position.z = -center.z
      
      // Scale to fit
      const maxDim = Math.max(size.x, size.y, size.z)
      modelMaxDimRef.current = maxDim
      const scale = 2 / maxDim
      gltf.scene.scale.multiplyScalar(scale)
      
      // Adjust camera to fit model
      updateCameraDistance(camera, maxDim)
    }, undefined, (error) => {
      console.error('Error loading model:', error)
    })

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      if (!isVisibleRef.current) return

      animationFrameRef.current = requestAnimationFrame(animate)
      
      if (lightRef.current) {
        const time = clock.getElapsedTime()
        const radius = 35
        const height = 15
        lightRef.current.position.x = Math.cos(time * 0.2) * radius
        lightRef.current.position.z = Math.sin(time * 0.2) * radius
        lightRef.current.position.y = height
        lightRef.current.lookAt(0, 0, 0)
      }
      
      if (technologiesRef.current) {
        technologiesRef.current.animate()
      }
      
      renderer.render(scene, camera)
    }
    animateFnRef.current = animate
    animate()

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisibleRef.current
        isVisibleRef.current = entry.isIntersecting
        if (entry.isIntersecting && !wasVisible) {
          animate()
        }
      },
      { threshold: 0 }
    )
    observer.observe(containerRef.current)

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      
      // Recalculate camera distance for new aspect ratio
      if (modelMaxDimRef.current) {
        updateCameraDistance(camera, modelMaxDimRef.current)
      }
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
      renderer.dispose()
      setSceneReady(false)
      setCameraReady(false)
    }
  }, [])

  return (
    <div className="w-full h-[100vh] relative bg-neutral-950">
      <div ref={containerRef} className="w-full h-full" />
      {sceneReady && cameraReady && (
        <Technologies ref={technologiesRef} scene={sceneRef.current} camera={cameraRef.current} />
      )}
    </div>
  )
}
