"use client"

import { useRef, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Color, ShaderMaterial } from "three"
import { useStore } from "@/store/use-store"
import { getColor } from "@/store/vibe-derivations"

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uVibe;
  uniform vec3 uColor;

  varying vec2 vUv;

  // Simplex-style noise (2D)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    // Breathing cycle: 4s inhale, 4s exhale (8s total)
    float breath = sin(uTime * 0.7854) * 0.5 + 0.5; // 2*PI / 8 = 0.7854

    // Multi-octave noise for organic fog
    vec2 uv = vUv * 3.0;
    float n = 0.0;
    n += 0.5 * snoise(uv + uTime * 0.05);
    n += 0.25 * snoise(uv * 2.0 - uTime * 0.08);
    n += 0.125 * snoise(uv * 4.0 + uTime * 0.12);
    n = n * 0.5 + 0.5; // remap to [0, 1]

    // Breathing modulates fog intensity
    float fogIntensity = n * (0.03 + breath * 0.04);

    // Extremity: how far from neutral (0.5)
    float extremity = abs(uVibe - 0.5) * 2.0;

    // Fog gets more intense at extremes
    fogIntensity *= (0.5 + extremity * 1.5);

    // Mix the vibe color into the fog
    vec3 fogColor = uColor * fogIntensity;

    // Subtle vignette
    vec2 center = vUv - 0.5;
    float vignette = 1.0 - dot(center, center) * 1.5;
    vignette = clamp(vignette, 0.0, 1.0);

    // Final color: black void with colored fog
    vec3 finalColor = fogColor * vignette;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

export function BreathingBackground() {
  const { viewport } = useThree()
  const matRef = useRef<ShaderMaterial>(null!)
  const colorObj = useRef(new Color("#C0C0C0"))

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uVibe: { value: 0.5 },
      uColor: { value: new Color("#C0C0C0") },
    }),
    []
  )

  useFrame(({ clock }) => {
    if (!matRef.current) return
    const vibe = useStore.getState().vibe
    matRef.current.uniforms.uTime.value = clock.getElapsedTime()
    matRef.current.uniforms.uVibe.value = vibe
    colorObj.current.set(getColor(vibe))
    matRef.current.uniforms.uColor.value.copy(colorObj.current)
  })

  return (
    <mesh position={[0, 0, -3]}>
      <planeGeometry args={[viewport.width * 1.5, viewport.height * 1.5]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  )
}
