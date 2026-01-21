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
  const modelRef = useRef(null)
  const lightRef = useRef(null)
  const technologiesRef = useRef(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

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
    renderer.setPixelRatio(window.devicePixelRatio)
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
      const scale = 2 / maxDim
      gltf.scene.scale.multiplyScalar(scale)
      
      // Adjust camera to fit model
      const fov = camera.fov * (Math.PI / 180)
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
      cameraZ *= 1.2 // Add some padding
      camera.position.z = cameraZ
    }, undefined, (error) => {
      console.error('Error loading model:', error)
    })

    // Animation loop
    const clock = new THREE.Clock()
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      // Rotate the light around the model at eye level (not from top)
      // and make it always point towards the model center
      if (lightRef.current) {
        const time = clock.getElapsedTime()
        const radius = 35
        const height = 15// Keep light at model's level, not above
        lightRef.current.position.x = Math.cos(time * 0.2) * radius
        lightRef.current.position.z = Math.sin(time * 0.2) * radius
        lightRef.current.position.y = height
        // Make the light always point at the model center (0, 0, 0)
        lightRef.current.lookAt(0, 0, 0)
      }
      
      // Animate technologies
      if (technologiesRef.current) {
        technologiesRef.current.animate()
      }
      
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
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
