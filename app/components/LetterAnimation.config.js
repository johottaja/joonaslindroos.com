// Animation configuration
export const animationConfig = {
  // Words to cycle through
  words: [
    "MACHINE LEARNING", 
    "ARTIFICIAL INTELLIGENCE", 
    "WEIGHTLIFTING", 
    "FULL STACK",
    "MATHEMATICS",
    "PARTYING",
  ],
  
  // Display duration for each word before transitioning (milliseconds)
  displayDuration: 1000,
  
  // Morphing animation duration (milliseconds)
  morphDuration: 2000,
  
  // Scale factor for letters
  scale: 1.0,
  
  // Spacing between letters
  spacing: 10,
  
  // Default letter width fallback (for unknown characters)
  defaultLetterWidth: 50,
  
  // Canvas context translate offset (for crisp rendering)
  canvasTranslateOffset: 0.5,
  
  // Delta time conversion (milliseconds to seconds)
  deltaTimeMultiplier: 1000,
  
  // Canvas context properties (not CSS)
  canvas: {
    fillStyle: '#0a0a0a',
    strokeStyle: '#fff',
    lineCap: 'square',
    lineWidth: 5
  },
  
  // Physics parameters for morphing
  physics: {
    // Maximum speed multiplier (pixels per second * scale)
    maxSpeedMultiplier: 800,
    // Maximum force multiplier (pixels per second^2 * scale)
    maxForceMultiplier: 30,
    // Distance threshold for slowing down (pixels)
    slowDownDistance: 100,
    // Distance threshold squared (for performance)
    slowDownDistanceSquared: 10000
  },
  
  // Transition parameters
  transition: {
    // Midpoint for type transitions (0.5 = halfway)
    typeTransitionMidpoint: 0.5,
    // Progress multiplier for transition halves
    transitionProgressMultiplier: 2
  }
}
