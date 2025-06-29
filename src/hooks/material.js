// materials.js
import * as THREE from 'three'
import { useMemo } from 'react'

// Face constants for easy reference
export const CUBE_FACES = {
  FRONT: 0,
  BACK: 1,
  RIGHT: 2,
  LEFT: 3,
  TOP: 4,
  BOTTOM: 5
}

export const useImageShaderMaterial = (imagePath, targetFace = CUBE_FACES.FRONT, options = {}) => {
  const {
    scale = 1.0,           // Scale factor for the image
    aspectCorrection = true, // Maintain aspect ratio
    centerImage = true,     // Center the image on the face
    fitMode = 'contain'     // 'contain', 'cover', or 'fill'
  } = options;

  return useMemo(() => {
    const texture = new THREE.TextureLoader().load(imagePath);
    
    // Set texture wrapping and filtering
    texture.wrapS = THREE.ClampToEdgeWrap;
    texture.wrapT = THREE.ClampToEdgeWrap;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uShowImage: { value: 1.0 },
        uTargetFace: { value: targetFace },
        uGlowColor: { value: new THREE.Color(0.1, 0.4, 0.8) },
        uScale: { value: scale },
        uAspectCorrection: { value: aspectCorrection ? 1.0 : 0.0 },
        uCenterImage: { value: centerImage ? 1.0 : 0.0 },
        uFitMode: { value: fitMode === 'contain' ? 0.0 : fitMode === 'cover' ? 1.0 : 2.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uShowImage;
        uniform float uTargetFace;
        uniform vec3 uGlowColor;
        uniform float uScale;
        uniform float uAspectCorrection;
        uniform float uCenterImage;
        uniform float uFitMode;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        
        bool isFace(vec3 normal, float faceIndex) {
          vec3 faces[6];
          faces[0] = vec3(0.0, 0.0, 1.0);   // Front (+Z)
          faces[1] = vec3(0.0, 0.0, -1.0);  // Back (-Z)
          faces[2] = vec3(1.0, 0.0, 0.0);   // Right (+X)
          faces[3] = vec3(-1.0, 0.0, 0.0);  // Left (-X)
          faces[4] = vec3(0.0, 1.0, 0.0);   // Top (+Y)
          faces[5] = vec3(0.0, -1.0, 0.0);  // Bottom (-Y)
          
          int index = int(faceIndex);
          if (index < 0 || index > 5) return false;
          
          return dot(normal, faces[index]) > 0.8;
        }
        
        vec2 adjustUV(vec2 uv) {
          vec2 adjustedUV = uv;
          
          // Center the UV coordinates around 0.5
          if (uCenterImage > 0.5) {
            adjustedUV = adjustedUV - 0.5;
          }
          
          // Apply scaling
          adjustedUV = adjustedUV / uScale;
          
          // Apply aspect ratio correction (assuming common image ratios)
          if (uAspectCorrection > 0.5) {
            // Assume image is wider than it is tall (common case)
            // You might want to pass actual image dimensions as uniforms for precise correction
            if (uFitMode < 0.5) {
              // Contain mode - scale down to fit
              adjustedUV.x *= 0.75; // Adjust this based on your typical image aspect ratio
            } else if (uFitMode < 1.5) {
              // Cover mode - scale up to fill
              adjustedUV.y *= 1.33; // Adjust this based on your typical image aspect ratio
            }
          }
          
          // Recenter
          if (uCenterImage > 0.5) {
            adjustedUV = adjustedUV + 0.5;
          }
          
          return adjustedUV;
        }
        
        void main() {
          vec3 baseColor = uGlowColor;
          
          if (isFace(vNormal, uTargetFace)) {
            vec2 adjustedUV = adjustUV(vUv);
            
            // Check if UV is within bounds
            if (adjustedUV.x >= 0.0 && adjustedUV.x <= 1.0 && 
                adjustedUV.y >= 0.0 && adjustedUV.y <= 1.0) {
              vec3 imageColor = texture2D(uTexture, adjustedUV).rgb;
              gl_FragColor = vec4(imageColor, 1.0);
            } else {
              gl_FragColor = vec4(baseColor, 1.0);
            }
          } else {
            gl_FragColor = vec4(baseColor, 1.0);
          }
        }
      `,
      side: THREE.DoubleSide,
    })
  }, [imagePath, targetFace, scale, aspectCorrection, centerImage, fitMode])
}

// Alternative: Simple version with just scale control
export const useSimpleImageShaderMaterial = (imagePath, targetFace = CUBE_FACES.FRONT, scale = 0.8) => {
  return useMemo(() => {
    const texture = new THREE.TextureLoader().load(imagePath);
    texture.wrapS = THREE.ClampToEdgeWrap;
    texture.wrapT = THREE.ClampToEdgeWrap;

    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uShowImage: { value: 1.0 },
        uTargetFace: { value: targetFace },
        uGlowColor: { value: new THREE.Color(0.1, 0.4, 0.8) },
        uScale: { value: scale }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uShowImage;
        uniform float uTargetFace;
        uniform vec3 uGlowColor;
        uniform float uScale;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        
        bool isFace(vec3 normal, float faceIndex) {
          vec3 faces[6];
          faces[0] = vec3(0.0, 0.0, 1.0);   // Front (+Z)
          faces[1] = vec3(0.0, 0.0, -1.0);  // Back (-Z)
          faces[2] = vec3(1.0, 0.0, 0.0);   // Right (+X)
          faces[3] = vec3(-1.0, 0.0, 0.0);  // Left (-X)
          faces[4] = vec3(0.0, 1.0, 0.0);   // Top (+Y)
          faces[5] = vec3(0.0, -1.0, 0.0);  // Bottom (-Y)
          
          int index = int(faceIndex);
          if (index < 0 || index > 5) return false;
          
          return dot(normal, faces[index]) > 0.8;
        }
        
        void main() {
          vec3 baseColor = uGlowColor;
          
          if (isFace(vNormal, uTargetFace)) {
            // Scale UV from center
            vec2 centeredUV = vUv - 0.5;
            vec2 scaledUV = (centeredUV / uScale) + 0.5;
            
            // Check if UV is within bounds
            if (scaledUV.x >= 0.0 && scaledUV.x <= 1.0 && 
                scaledUV.y >= 0.0 && scaledUV.y <= 1.0) {
              vec3 imageColor = texture2D(uTexture, scaledUV).rgb;
              gl_FragColor = vec4(imageColor, 1.0);
            } else {
              gl_FragColor = vec4(baseColor, 1.0);
            }
          } else {
            gl_FragColor = vec4(baseColor, 1.0);
          }
        }
      `,
      side: THREE.DoubleSide,
    })
  }, [imagePath, targetFace, scale])
}

export const useGlowingCircleMaterial = () => {
  return useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('11b9e8'),
    roughness: 0,
    transmission: 1,
    thickness: 0.9,
    ior: 10.5,
    reflectivity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0,
    side: THREE.DoubleSide,
  }), [])
}