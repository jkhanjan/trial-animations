import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene from "./components/Scene";
import { Grid } from "@react-three/drei";
import GridLayout from "./components/GridLayout";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const tween = gsap.to(
      {},
      {
        scrollTrigger: {
          trigger: "#main-container",
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => setScrollProgress(self.progress),
        },
      }
    );

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      id="main-container"
      className="relative w-full h-[300vh] overflow-hidden"
    >
        <GridLayout />

      <div className="w-full h-[100vh] fixed top-0 left-0 z-10 flex items-center justify-center">
        <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        className="absolute bottom-0 left-0 w-full h-full"
      >
        <ambientLight intensity={0.8} />
        <Scene scrollProgress={scrollProgress} />
      </Canvas></div>
    </div>
  );
}

export default App;

// function App() {
//   return (
//     <div className="main-container">
//       <Canvas
//         shadows
//         camera={{ position: [0, 0.1, 5], fov: 60 }}
//         gl={{ toneMapping: THREE.ACESFilmicToneMapping, outputEncoding: THREE.sRGBEncoding }}
//       >
//         <color args={['#48cefa']} attach="background" />
//         {/* Lighting */}
//         <directionalLight
//           castShadow
//           position={[10, 10, 10]}
//           intensity={1.5}
//           shadow-mapSize-width={1024}
//           shadow-mapSize-height={1024}
//         />
//         <ambientLight intensity={0.5} />
//         {/* Optional: Add environment for glass reflections */}
//         {/* <Environment preset="studio" /> */}
//         <Suspense fallback={null}>
//           <Scene />
//         </Suspense>
//         <OrbitControls />
//         <EffectComposer multisampling={0}>
//           <SMAA />
//           <Bloom
//             mipmapBlur
//             intensity={0.8}
//             levels={9}
//             opacity={0.4}
//             luminanceSmoothing={0.1}
//             luminanceThreshold={0.7}
//           />
//           <DepthOfField focusDistance={0.0005} focalLength={0.15} bokehScale={16} />
//           <HueSaturation saturation={0.3} hue={0.15} />
//           <Vignette offset={0.15} opacity={0.7} />
//         </EffectComposer>
//       </Canvas>
//     </div>
//   );
// }
