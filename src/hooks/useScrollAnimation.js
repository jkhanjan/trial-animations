// animations.js
export const useScrollAnimations = (scrollProgress, group, meshRefs, meshNodes) => {
  // Scale Animation (0.1 - 0.35)
  if (scrollProgress > 0.1 && scrollProgress < 0.35) {
    const t = (scrollProgress - 0.1) / 0.25
    
    meshNodes.forEach(([name, node], index) => {
      const meshRef = meshRefs.current[name]
      if (meshRef) {
        const staggerDelay = (index / meshNodes.length) * 0.1
        const staggeredT = Math.max(0, Math.min(1, (t - staggerDelay) / (1 - staggerDelay)))
        const scale = 0.01 + staggeredT * (1.15 - 0.01)
        meshRef.scale.set(scale, scale, scale)
      }
    })
  } 
  // Initial state
  else if (scrollProgress <= 0.1) {
    meshNodes.forEach(([name, node]) => {
      const meshRef = meshRefs.current[name]
      if (meshRef) {
        meshRef.scale.set(0.01, 0.01, 0.01)
      }
    })
  } 
  // Hold scale
  else if (scrollProgress >= 0.35 && scrollProgress < 0.5) {
    meshNodes.forEach(([name, node]) => {
      const meshRef = meshRefs.current[name]
      if (meshRef) {
        meshRef.scale.set(1.15, 1.15, 1.15)
      }
    })
  }

  // Position and Rotation Animation (0.35 - 0.65)
  if (scrollProgress > 0.35 && scrollProgress < 0.65) {
    const t = (scrollProgress - 0.35) / 0.3
    group.current.position.x = t * 2.6
    group.current.position.y = -t * 1
    group.current.rotation.x = t * Math.PI * 1
    group.current.rotation.y = t * Math.PI * 0.7
  } 
  // Initial position
  else if (scrollProgress <= 0.35) {
    group.current.position.set(0, 0, 0)
    group.current.rotation.set(0, 0, 0)
  } 
  // Hold position
  else if (scrollProgress >= 0.65) {
    group.current.position.x = 2.6
    group.current.position.y = -1
    group.current.rotation.x = Math.PI * 1
    group.current.rotation.y = Math.PI * 0.7
  }

  // Final Animation (0.65+)
  if (scrollProgress >= 0.65) {
    const t = (scrollProgress - 0.65) / 0.2
    group.current.position.x = 2.6 + t * (-4.0) // From 2.6 to -1.4
    group.current.position.y = -1 + t * (0.1) // From -1 to -0.9
    group.current.rotation.x = Math.PI * 1 + t * Math.PI * 0.0
    group.current.rotation.y = Math.PI * 0.7 + t * Math.PI * 0.47
  }
}