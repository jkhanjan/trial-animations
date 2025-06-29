import { useGLTF, useAnimations, Edges } from '@react-three/drei'
import * as THREE from 'three'
import React, { useEffect, useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

export default function Scene({ scrollProgress, ...props }) {
  const group = useRef()
  const meshRefs = useRef({})
  const { camera } = useThree()
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [hoveredMesh, setHoveredMesh] = useState(null)
  const smoothMouse = useRef({ x: 0, y: 0 })
  const hoverScales = useRef({})
  
  const { nodes, materials, animations } = useGLTF('/pixel saff.glb')
  const { actions } = useAnimations(animations, group)

  const glowingCircleMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('11b9e8'),
    roughness: 0,
    transmission: 1,
    thickness: 0.1,
    ior: 1.5,
    reflectivity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0,
    side: THREE.DoubleSide,
  }), [])

  // Get all mesh nodes for animation
  const meshNodes = useMemo(() => {
    return Object.entries(nodes).filter(([name, node]) => node.type === 'Mesh')
  }, [nodes])

  // Initialize hover scales
  useEffect(() => {
    meshNodes.forEach(([name]) => {
      hoverScales.current[name] = 1
    })
  }, [meshNodes])

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      setMouse({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state, delta) => {
    if (!group.current) return
    smoothMouse.current.x += (mouse.x - smoothMouse.current.x) * 0.05
    smoothMouse.current.y += (mouse.y - smoothMouse.current.y) * 0.05

    // Update hover scales with smooth animation
    meshNodes.forEach(([name]) => {
      const targetScale = hoveredMesh === name ? 1.2 : 1.0
      hoverScales.current[name] += (targetScale - hoverScales.current[name]) * 0.1
    })

    // Mouse interaction - tilt based on mouse position
    const mouseInfluence = 0.15
    const baseTiltX = smoothMouse.current.y * mouseInfluence
    const baseTiltY = smoothMouse.current.x * mouseInfluence

    // Scale animation
    if (scrollProgress > 0.1 && scrollProgress < 0.35) {
      const t = (scrollProgress - 0.1) / 0.25
      const targetScale = 0.01 + t * (0.4 - 0.01)
      
      meshNodes.forEach(([name, node], index) => {
        const meshRef = meshRefs.current[name]
        if (meshRef) {
          const staggerDelay = (index / meshNodes.length) * 0.1
          const staggeredT = Math.max(0, Math.min(1, (t - staggerDelay) / (1 - staggerDelay)))
          const baseScale = 0.01 + staggeredT * (1.15 - 0.01)
          const finalScale = baseScale * hoverScales.current[name]
          meshRef.scale.set(finalScale, finalScale, finalScale)
        }
      })
    } else if (scrollProgress <= 0.1) {
      meshNodes.forEach(([name, node]) => {
        const meshRef = meshRefs.current[name]
        if (meshRef) {
          const finalScale = 0.01 * hoverScales.current[name]
          meshRef.scale.set(finalScale, finalScale, finalScale)
        }
      })
    } else if (scrollProgress >= 0.35 && scrollProgress < 0.5) {
      meshNodes.forEach(([name, node]) => {
        const meshRef = meshRefs.current[name]
        if (meshRef) {
          const finalScale = 1.15 * hoverScales.current[name]
          meshRef.scale.set(finalScale, finalScale, finalScale)
        }
      })
    }

    // Position and rotation animation with mouse interaction
    if (scrollProgress > 0.35 && scrollProgress < 0.65) {
      const t = (scrollProgress - 0.35) / 0.3
      group.current.position.x = t * 2.6
      group.current.position.y = -t * 1
      group.current.rotation.x = t * Math.PI * 1 + baseTiltX
      group.current.rotation.y = t * Math.PI * 0.7 + baseTiltY
    } else if (scrollProgress <= 0.35) {
      group.current.position.x = 0
      group.current.position.y = 0
      group.current.rotation.x = baseTiltX
      group.current.rotation.y = baseTiltY
    } else if (scrollProgress >= 0.65) {
      group.current.position.x = 2.6
      group.current.position.y = -1
      group.current.rotation.x = Math.PI * 1 + baseTiltX
      group.current.rotation.y = Math.PI * 0.7 + baseTiltY
    }

    if (scrollProgress >= 0.65) {
      const t = (scrollProgress - 0.65) / 0.2
      group.current.position.x = 2.6 + t * (-1.4 - 1.4)
      group.current.position.y = -1 + t * (0 - (-0.9))
      group.current.rotation.x = Math.PI * 1 + t * Math.PI * 0.0 + baseTiltX
      group.current.rotation.y = Math.PI * 0.7 + t * Math.PI * 0.45 + baseTiltY
    }

    // Camera look-at animation
    if (group.current) {
      const targetPosition = new THREE.Vector3()
      group.current.getWorldPosition(targetPosition)
      
      // Smooth camera look-at with interpolation
      const currentTarget = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-10).add(camera.position)
      const newTarget = currentTarget.lerp(targetPosition, 0.03)
    }
  })

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene" position={[-1.0, -1.0, -0.1]} scale={0.4}>
        {Object.entries(nodes).map(([name, node]) => {
          if (node.type === 'Mesh') {
            return (
              <mesh
                key={name}
                ref={(ref) => (meshRefs.current[name] = ref)}
                geometry={node.geometry}
                position={node.position}
                castShadow
                receiveShadow
                scale={[0.01, 0.01, 0.01]}
                onPointerEnter={() => setHoveredMesh(name)}
                onPointerLeave={() => setHoveredMesh(null)}
                onPointerOver={() => setHoveredMesh(name)}
              >
                <primitive object={glowingCircleMaterial} attach="material" />
                <Edges scale={1.01} threshold={0.1} color="#7DF9FF" />
              </mesh>
            )
          }
        })}
      </group>
    </group>
  )
}

//1st attempt

// import { useGLTF, useAnimations, Edges } from '@react-three/drei'
// import * as THREE from 'three'
// import React, { useRef, useMemo, useState, useEffect } from 'react'
// import { useFrame } from '@react-three/fiber'

// export default function Scene(props) {
//   const group = useRef()
//   const [dispersalProgress, setDispersalProgress] = useState(0)
//   const [isDispersing, setIsDispersing] = useState(false)
  
//   // Better dispersal targets - more varied and interesting positions
//   const dispersalTargets = useMemo(() => [
//   new THREE.Vector3( 5.0,  4.2,  0.5),
//   new THREE.Vector3(-4.8,  5.1,  4.0),
//   new THREE.Vector3( 4.3, -5.5,  5.2),
//   new THREE.Vector3(-5.6, -4.1,  4.8),
//   new THREE.Vector3( 5.7,  9.4, -5.0),
//   new THREE.Vector3(-4.5,  4.6, -5.2),
//   new THREE.Vector3( 4.9, -5.8, -4.6),
//   new THREE.Vector3(-5.3, -5.0, -5.5),
//   new THREE.Vector3( 0.8,  6.0,  1.2),
//   new THREE.Vector3(-1.2, -6.1, -1.0),
//   new THREE.Vector3( 6.0,  0.5, -1.1),
//   new THREE.Vector3(-6.2, -0.6,  1.5),
//   new THREE.Vector3( 3.0,  5.8,  5.9),
//   new THREE.Vector3(-3.5,  6.0, -2.5),
//   new THREE.Vector3( 5.8, -1.3,  4.6),
//   new THREE.Vector3(-0.7, -5.5,  5.2),
// ], []);


//   const { nodes, materials, animations } = useGLTF('/pixel saff.glb')
//   const { actions } = useAnimations(animations, group)

//   // Auto-trigger dispersal effect
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsDispersing(true)
//     }, 5000) // Start dispersing after 1 second

//     return () => clearTimeout(timer)
//   }, [])

//   // Create custom shader material with the glowing circle
//   const glowingCircleMaterial = useMemo(() => {
//     const material = new THREE.ShaderMaterial({
//       uniforms: {
//         iTime: { value: 0 },
//         iResolution: { value: new THREE.Vector2(512, 512) },
//         opacity: { value: 0.8 },
//         glowColor: { value: new THREE.Color(0.2, 0.6, 1.0) },
//         backgroundColor: { value: new THREE.Color(0.05, 0.1, 0.2) }
//       },
//       vertexShader: `
//         varying vec2 vUv;
//         varying vec3 vPosition;
        
//         void main() {
//           vUv = uv;
//           vPosition = position;
//           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         }
//       `,
//       fragmentShader: `
//         uniform float iTime;
//         uniform vec2 iResolution;
//         uniform float opacity;
//         uniform vec3 glowColor;
//         uniform vec3 backgroundColor;
        
//         varying vec2 vUv;
//         varying vec3 vPosition;
        
//         void main() {
//           // Convert UV to normalized coordinates (-1 to 1)
//           vec2 uv = vUv * 2.0 - 1.0;
          
//           // Time and center
//           float time = iTime;
//           vec2 center = vec2(0.0, 0.0);
          
//           // Glowing circle
//           float radius = 0.3;
//           float dist = length(uv - center);
//           float glow = smoothstep(radius + 0.02, radius, dist);
          
//           // Pulsating glow
//           float pulse = 0.3 + 0.1 * sin(iTime * 2.0);
//           glow += 0.4 / (abs(dist - radius) + 0.01 + pulse);
          
//           // Orbiting point (optional - creates a small moving dot)
//           float angle = time * 1.5;
//           float orbitRadius = radius;
//           vec2 orbit = center + vec2(cos(angle), sin(angle)) * orbitRadius;
//           float lineWidth = 0.03;
//           float orbitGlow = 0.2 / (length(uv - orbit) + 0.01);
          
//           // Combine effects
//           vec3 col = backgroundColor;
//           col += glow * glowColor;
//           col += orbitGlow * glowColor * 0.5;
          
//           // Add some edge glow for the cube faces
//           float edgeGlow = 1.0 - smoothstep(0.0, 0.1, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
//           col += edgeGlow * glowColor * 0.3;
          
//           gl_FragColor = vec4(col, opacity);
//         }
//       `,
//       transparent: true,
//       side: THREE.DoubleSide,
//       blending: THREE.AdditiveBlending,
//     })
    
//     return material
//   }, [])

//   // Smooth easing function for dispersal animation
//   const easeOutCubic = (t) => {
//     return 1 - Math.pow(1 - t, 3)
//   }

//   useFrame((state, delta) => {
//     // Update shader time
//     if (glowingCircleMaterial.uniforms) {
//       glowingCircleMaterial.uniforms.iTime.value = state.clock.elapsedTime
//     }

//     // Update dispersal animation
//     if (isDispersing && dispersalProgress < 1) {
//       setDispersalProgress(prev => Math.min(prev + delta * 0.8, 1)) // 0.8 controls speed
//     }
//   })

//   return (
//     <group ref={group} {...props} dispose={null}>
//       <group name="Scene" position={[-1.0, -1.0, -0.1]} scale={0.4}>
//         {Object.entries(nodes).map(([name, node], index) => {
//           if (node.type === 'Mesh') {
//             const targetPosition = dispersalTargets[index % dispersalTargets.length]
          
//             const easedProgress = easeOutCubic(dispersalProgress)
//             const currentPosition = node.position.clone().lerp(
//               node.position.clone().add(targetPosition), 
//               easedProgress
//             )

//             // Add some rotation during dispersal for extra effect
//             const rotationMultiplier = easedProgress * Math.PI * 2 * (index % 2 === 0 ? 1 : -1)
            
//             return (
//               <mesh
//                 key={name}
//                 geometry={node.geometry}
//                 position={currentPosition}
//                 rotation={[
//                   rotationMultiplier * 0.3,
//                   rotationMultiplier * 0.5,
//                   rotationMultiplier * 0.2
//                 ]}
//                 castShadow
//                 receiveShadow
//               >
//                 {/* Use the glowing circle shader material */}
//                 <primitive object={glowingCircleMaterial} attach="material" />
                
//                 {/* Optional: Keep edges for better definition */}
//                 <Edges scale={1.01} threshold={1} color="purple" />
//               </mesh>
//             )
//           }
//           return null
//         })}
//       </group>
//     </group>
//   )
// }


//2nd attempt

// import { useGLTF, useAnimations, Edges } from '@react-three/drei'
// import * as THREE from 'three'
// import React, { useRef, useMemo } from 'react'
// import { useFrame } from '@react-three/fiber'

// export default function Scene(props) {
//   const group = useRef()
//   const { nodes, materials, animations } = useGLTF('/pixel saff.glb')
//   const { actions } = useAnimations(animations, group)

//   // Create custom shader material with the glowing circle
//   const glowingCircleMaterial = useMemo(() => {
//     const material = new THREE.ShaderMaterial({
//       uniforms: {
//         iTime: { value: 0 },
//         iResolution: { value: new THREE.Vector2(512, 512) },
//         opacity: { value: 1.0 },
//         glowColor: { value: new THREE.Color(0.3, 0.8, 1.0) },
//         backgroundColor: { value: new THREE.Color(0.0, 0.0, 0.0) }
//       },
//       vertexShader: `
//         varying vec2 vUv;
//         varying vec3 vPosition;
        
//         void main() {
//           vUv = uv;
//           vPosition = position;
//           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         }
//       `,
//       fragmentShader: `
//         uniform float iTime;
//         uniform vec2 iResolution;
//         uniform float opacity;
//         uniform vec3 glowColor;
//         uniform vec3 backgroundColor;
        
//         varying vec2 vUv;
//         varying vec3 vPosition;
        
//         void main() {
//           // Convert UV to normalized coordinates (-1 to 1)
//           vec2 uv = vUv * 2.0 - 0.4;
          
//           // Time and center
//           float time = iTime;
//           vec2 center = vec2(0.0, 0.0);
          
//           // Glowing circle - much more visible
//           float radius = 0.4;
//           float dist = length(uv - center);
          
//           // Main circle glow (solid inner part)
//           float innerGlow = 1.0 - smoothstep(0.0, radius * 0.8, dist);
          
//           // Outer glow ring
//           float outerGlow = smoothstep(radius + 0.1, radius - 0.05, dist);
          
//           // Pulsating glow effect
//           float pulse = 0.5 + 0.3 * sin(iTime * 2.0);
//           float pulsatingGlow = pulse / (abs(dist - radius) + 0.02);
          
//           // Orbiting point
//           float angle = time * 1.5;
//           float orbitRadius = radius * 0.9;
//           vec2 orbit = center + vec2(cos(angle), sin(angle)) * orbitRadius;
//           float orbitGlow = 0.8 / (length(uv - orbit) + 0.03);
          
//           float totalGlow = innerGlow * 0.6 + outerGlow * 0.8 + pulsatingGlow * 0.4 + orbitGlow * 0.1;
          
//           // Base color with strong glow
//           vec3 col = backgroundColor * 0.2; // Darker background
//           col += totalGlow * glowColor * 2.0; // Brighter glow
          
//           // Ensure minimum visibility
//           col = max(col, totalGlow * 0.5);
          
//           gl_FragColor = vec4(col, opacity);
//         }
//       `,
//       transparent: true,
//       side: THREE.DoubleSide,
//       blending: THREE.NormalBlending,
//     })
    
//     return material
//   }, [])

//   // Alternative glass material (you can switch between them)
//   const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
//     color: new THREE.Color('#10b9e8'),
//     roughness: 0,
//     transmission: 1,
//     thickness: 0.4,
//     ior: 1.5,
//     reflectivity: 1,
//     clearcoat: 1,
//     clearcoatRoughness: 0,
//     transparent: true,
//     side: THREE.DoubleSide,
//   }), [])

//   // Update shader time uniform
//   useFrame((state) => {
//     if (glowingCircleMaterial.uniforms) {
//       glowingCircleMaterial.uniforms.iTime.value = state.clock.elapsedTime
//     }
//   })

//   return (
//     <group ref={group} {...props} dispose={null}>
//       <group name="Scene" position={[-1.0, -1.0, -0.1]} scale={0.4}>
//         {Object.entries(nodes).map(([name, node]) => {
//           if (node.type === 'Mesh') {
//             return (
//               <mesh
//                 key={name}
//                 geometry={node.geometry}
//                 position={node.position}
//                 castShadow
//                 receiveShadow
//               >
//                 {/* Use the glowing circle shader material */}
//                 <primitive object={glowingCircleMaterial} attach="material" />
                
//                 {/* Optional: Keep edges for better definition */}
//                 {/* <Edges scale={1.01} threshold={1} color="cyan" /> */}
//               </mesh>
//             )
//           }
//           return null
//         })}
//       </group>
//     </group>
//   )
// }


//3rd attempt
// import { useGLTF, useAnimations } from '@react-three/drei'
// import * as THREE from 'three'
// import React, { useRef, useMemo } from 'react'
// import { useFrame } from '@react-three/fiber'

// export default function Scene(props) {
//   const group = useRef()
//   const { nodes, animations } = useGLTF('/pixel saff.glb')
//   useAnimations(animations, group)

//   // Stronger, more persistent glowing material
//   const glowingFaceMaterial = useMemo(() => {
//     return new THREE.ShaderMaterial({
//       uniforms: {
//         iTime: { value: 0 },
//         opacity: { value: 1.0 },
//         glowColor: { value: new THREE.Color(0.4, 1.0, 1.0) }, // Brighter color
//         backgroundColor: { value: new THREE.Color(0.0, 0.0, 0.0) }
//       },
//       vertexShader: `
//         varying vec2 vUv;
//         void main() {
//           vUv = uv;
//           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         }
//       `,
//       fragmentShader: `
//         uniform float iTime;
//         uniform float opacity;
//         uniform vec3 glowColor;
//         uniform vec3 backgroundColor;
//         varying vec2 vUv;
//         void main() {
//           vec2 uv = vUv * 2.0 - 1.0;
//           float dist = length(uv);

//           // Softer edge, more area glows
//           float edge = smoothstep(0.85, 1.0, dist);
//           float glow = 1.0 - edge;

//           // Animate, but keep a strong minimum
//           float pulse = 0.8 + 0.5 * sin(iTime * 2.0);
//           glow = max(glow * pulse, 0.5); // Never less than 0.5

//           // Stronger color mix
//           vec3 col = mix(backgroundColor, glowColor, glow * 1.2);

//           gl_FragColor = vec4(col, opacity * glow);
//         }
//       `,
//       transparent: true,
//       side: THREE.DoubleSide,
//       blending: THREE.AdditiveBlending,
//     })
//   }, [])

//   useFrame((state) => {
//     if (glowingFaceMaterial.uniforms) {
//       glowingFaceMaterial.uniforms.iTime.value = state.clock.elapsedTime
//     }
//   })

//   return (
//     <group ref={group} {...props} dispose={null}>
//       <group name="Scene" position={[-1.0, -1.0, -0.1]} scale={0.4}>
//         {Object.entries(nodes).map(([name, node]) => {
//           if (node.type === 'Mesh') {
//             return (
//               <mesh
//                 key={name}
//                 geometry={node.geometry}
//                 position={node.position}
//                 castShadow
//                 receiveShadow
//               >
//                 <primitive object={glowingFaceMaterial} attach="material" />
//               </mesh>
//             )
//           }
//           return null
//         })}
//       </group>
//     </group>
//   )
// }



///effect

  //   const glowingCircleMaterial = useMemo(() => {
  //   const material = new THREE.ShaderMaterial({
  //     uniforms: {
  //       iTime: { value: 0 },
  //       iResolution: { value: new THREE.Vector2(512, 512) },
  //       opacity: { value: 0.8 },
  //       glowColor: { value: new THREE.Color(0.2, 0.6, 1.0) },
  //       backgroundColor: { value: new THREE.Color(0.05, 0.1, 0.2) }
  //     },
  //     vertexShader: `
  //       varying vec2 vUv;
  //       varying vec3 vPosition;
        
  //       void main() {
  //         vUv = uv;
  //         vPosition = position;
  //         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //       }
  //     `,
  //     fragmentShader: `
  //       uniform float iTime;
  //       uniform vec2 iResolution;
  //       uniform float opacity;
  //       uniform vec3 glowColor;
  //       uniform vec3 backgroundColor;
        
  //       varying vec2 vUv;
  //       varying vec3 vPosition;
        
  //       void main() {
  //         // Convert UV to normalized coordinates (-1 to 1)
  //         vec2 uv = vUv * 2.0 - 1.0;
          
  //         // Time and center
  //         float time = iTime;
  //         vec2 center = vec2(0.0, 0.0);
          
  //         // Glowing circle
  //         float radius = 0.3;
  //         float dist = length(uv - center);
  //         float glow = smoothstep(radius + 0.02, radius, dist);
          
  //         // Pulsating glow
  //         float pulse = 0.3 + 0.1 * sin(iTime * 2.0);
  //         glow += 0.4 / (abs(dist - radius) + 0.01 + pulse);
          
  //         // Orbiting point (optional - creates a small moving dot)
  //         float angle = time * 1.5;
  //         float orbitRadius = radius;
  //         vec2 orbit = center + vec2(cos(angle), sin(angle)) * orbitRadius;
  //         float lineWidth = 0.03;
  //         float orbitGlow = 0.2 / (length(uv - orbit) + 0.01);
          
  //         // Combine effects
  //         vec3 col = backgroundColor;
  //         col += glow * glowColor;
  //         col += orbitGlow * glowColor * 0.5;
          
  //         // Add some edge glow for the cube faces
  //         float edgeGlow = 1.0 - smoothstep(0.0, 0.1, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
  //         col += edgeGlow * glowColor * 0.3;
          
  //         gl_FragColor = vec4(col, opacity);
  //       }
  //     `,
  //     transparent: true,
  //     side: THREE.DoubleSide,
  //     blending: THREE.AdditiveBlending,
  //   })
    
  //   return material
  // }, [])