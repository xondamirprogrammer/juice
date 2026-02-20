"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { SwimCarousel } from "./swim-carousel"
import { MacroCamera } from "./macro-camera"
import { SynesthesiaBg } from "./synesthesia-bg"
import { CellularParticles } from "./cellular-particles"
import { useStore } from "@/store/use-store"

const GREEN_TINT = new THREE.Color("#0a2a0a")
const WARM_ORANGE = new THREE.Color("#ff6600")
const COOL_AMBIENT = new THREE.Color("#111811")
const WARM_AMBIENT = new THREE.Color("#331a0a")
const POINT_COLD = new THREE.Color("#0a150a")
const POINT_WARM = new THREE.Color("#ff4400")

export function StashScene() {
  const carouselRef = useRef<THREE.Group>(null)
  const dirColorRef = useRef(new THREE.Color("#1a3a1a"))
  const pointColorRef = useRef(new THREE.Color("#222211"))
  const ambientRef = useRef(new THREE.Color("#111811"))
  const dirLightRef = useRef<THREE.DirectionalLight>(null!)
  const pointLightRef = useRef<THREE.PointLight>(null!)
  const ambientRefObj = useRef<THREE.AmbientLight>(null!)

  useFrame(() => {
    const v = useStore.getState().vibe
    dirColorRef.current.lerpColors(GREEN_TINT, WARM_ORANGE, v)
    pointColorRef.current.lerpColors(POINT_COLD, POINT_WARM, v)
    ambientRef.current.lerpColors(COOL_AMBIENT, WARM_AMBIENT, v)
    if (dirLightRef.current) dirLightRef.current.color.copy(dirColorRef.current)
    if (pointLightRef.current) pointLightRef.current.color.copy(pointColorRef.current)
    if (ambientRefObj.current) ambientRefObj.current.color.copy(ambientRef.current)
  })

  return (
    <group>
      <ambientLight ref={ambientRefObj} color="#111811" intensity={0.4} />
      <directionalLight
        ref={dirLightRef}
        position={[0, 8, 4]}
        intensity={1.2}
        color="#1a3a1a"
        castShadow
      />
      <pointLight
        ref={pointLightRef}
        position={[0, -3, 2]}
        intensity={0.8}
        color="#222211"
        distance={15}
      />
      <SwimCarousel carouselRef={carouselRef} />
      <MacroCamera carouselRef={carouselRef} />
      <SynesthesiaBg />
      <CellularParticles carouselRef={carouselRef} />
    </group>
  )
}
