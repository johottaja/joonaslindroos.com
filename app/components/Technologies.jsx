'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import * as THREE from 'three'

const Technologies = forwardRef(({ scene, camera }, ref) => {
  const techSpritesRef = useRef([])
  const clockRef = useRef(new THREE.Clock())

  useImperativeHandle(ref, () => ({
    animate: () => {
      if (!camera) return
      
      // Animate all floating technology sprites in a circular orbit
      techSpritesRef.current.forEach((sprite) => {
        const time = clockRef.current.getElapsedTime()
        const spinSpeed = 0.2
        const orbitSpeed = spinSpeed
        const orbitRadius = 1
        const verticalOffset = Math.sin(time * spinSpeed + sprite.userData.initialAngle + Math.PI/2) * 0.3 + 0.2 // Gentle vertical float with phase offset
        
        // Rotate around the model maintaining their relative positions
        const currentAngle = sprite.userData.initialAngle + time * orbitSpeed
        sprite.position.x = Math.cos(currentAngle) * orbitRadius
        sprite.position.z = Math.sin(currentAngle) * orbitRadius
        sprite.position.y = verticalOffset
        
        // Make sprite always face the camera
        sprite.lookAt(camera.position)
      })
    }
  }))

  useEffect(() => {
    if (!scene || !camera) return

    // Load and create floating technology sprites
    const textureLoader = new THREE.TextureLoader()
    const techImages = [
      'React.webp',
      'TypeScript.webp',
      'Python.webp',
      'CPlusPlus.webp',
      'Django.webp',
      'Docker.webp',
      'MySQL.webp',
      'Nodejs.webp',
      'PostgresSQL.webp',
      'PyTorch.webp',
      'TailwindCSS.webp'
    ]
    
    const orbitRadius = 1
    const totalImages = techImages.length
    const angleStep = (Math.PI * 2) / totalImages
    
    // Function to convert texture to bronze tint
    // intensity: 0-1, where 1 is full bronze tint and lower values blend more with original
    const convertToBronze = (texture, intensity = 1.0) => {
      const image = texture.image
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      // Bronze color values (even darker brown)
      const bronzeR = 50 / 255
      const bronzeG = 25 / 255
      const bronzeB = 10 / 255
      
      // Convert to grayscale and apply bronze tint
      for (let i = 0; i < data.length; i += 4) {
        const originalR = data[i]
        const originalG = data[i + 1]
        const originalB = data[i + 2]
        
        const gray = originalR * 0.299 + originalG * 0.587 + originalB * 0.114
        // Normalize gray to 0-1 range and multiply by bronze color
        const grayNorm = gray / 255
        const bronzeTintedR = grayNorm * bronzeR * 255
        const bronzeTintedG = grayNorm * bronzeG * 255
        const bronzeTintedB = grayNorm * bronzeB * 255
        
        // Blend between original and bronze tinted based on intensity
        data[i] = originalR * (1 - intensity) + bronzeTintedR * intensity     // R
        data[i + 1] = originalG * (1 - intensity) + bronzeTintedG * intensity // G
        data[i + 2] = originalB * (1 - intensity) + bronzeTintedB * intensity // B
        // Alpha channel (data[i + 3]) remains unchanged
      }
      
      ctx.putImageData(imageData, 0, 0)
      
      const bronzeTexture = new THREE.CanvasTexture(canvas)
      bronzeTexture.needsUpdate = true
      return bronzeTexture
    }

    techImages.forEach((imageName, index) => {
      textureLoader.load(`/images/technologies/${imageName}`, (texture) => {
        const finalTexture = convertToBronze(texture, 1.0)
        
        // Increase brightness for Django and MySQL since they're naturally darker
        const isDarkerImage = imageName === 'Django.webp' || imageName === 'MySQL.webp'
        const spriteMaterial = new THREE.SpriteMaterial({ 
          map: finalTexture,
          transparent: true,
          alphaTest: 0.1,
          color: isDarkerImage ? new THREE.Color(4.5, 4.5, 4.5) : new THREE.Color(1, 1, 1) // Brighten darker images
        })
        const sprite = new THREE.Sprite(spriteMaterial)
        
        // Scale the sprite
        sprite.scale.set(0.1, 0.1, 0.1)
        
        // Position each sprite evenly around the circle
        const angle = index * angleStep
        sprite.position.set(
          Math.cos(angle) * orbitRadius,
          0,
          Math.sin(angle) * orbitRadius
        )
        
        // Store initial angle for animation
        sprite.userData.initialAngle = angle
        
        scene.add(sprite)
        techSpritesRef.current.push(sprite)
      }, undefined, (error) => {
        console.error(`Error loading technology texture ${imageName}:`, error)
      })
    })

    // Cleanup
    return () => {
      techSpritesRef.current.forEach((sprite) => {
        if (sprite && sprite.parent) {
          sprite.parent.remove(sprite)
          sprite.material.map?.dispose()
          sprite.material.dispose()
        }
      })
      techSpritesRef.current = []
    }
  }, [scene, camera])

  return null
})

Technologies.displayName = 'Technologies'

export default Technologies
