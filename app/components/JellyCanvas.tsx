"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Component,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ErrorInfo,
  type ReactNode,
} from "react";
import * as THREE from "three";

export type JellyInteraction = {
  velocity: number;
  direction: number;
  stretch: number;
  transition: number;
  accent: string;
  pointerX: number;
  pointerY: number;
  pointerStrength: number;
};

type JellyCanvasProps = {
  interactionRef: React.MutableRefObject<JellyInteraction>;
  className?: string;
  reducedMotion?: boolean;
  loader?: boolean;
  loaderProgress?: number;
};

const vertexShader = `
  uniform float uTime;
  uniform float uDirection;
  uniform float uStretch;
  uniform float uVelocity;
  uniform float uTransition;
  uniform float uLoaderMotion;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  varying vec3 vNormalW;
  varying vec3 vPosition;
  varying float vBulge;

  float organic(vec3 p, float t) {
    float lobes = sin(atan(p.y, p.x) * 7.0 + t * 0.34) * 0.034;
    lobes += sin(atan(p.z, p.x) * 5.0 - t * 0.27) * 0.022;
    lobes += sin((p.x * 2.1 + p.y * 1.7 + p.z * 1.2) * 3.0 + t * 0.45) * 0.015;
    return lobes;
  }

  float loaderSurface(vec3 p, float t) {
    float lowFrequency = sin(atan(p.y, p.x) * 2.2 + t * 2.05) * 0.062;
    lowFrequency += sin(dot(p, normalize(vec3(0.82, 1.18, -0.6))) * 2.35 - t * 1.62) * 0.041;

    float mediumFrequency = sin(atan(p.z, p.x) * 4.4 - t * 3.55 + p.y * 1.8) * 0.034;
    mediumFrequency += sin(dot(p, normalize(vec3(-0.5, 0.92, 0.74))) * 5.0 + t * 4.1) * 0.024;

    float microFrequency = sin(p.x * 6.5 - p.y * 4.2 + p.z * 3.6 + t * 5.5) * 0.008;
    return (lowFrequency + mediumFrequency + microFrequency) * uLoaderMotion;
  }

  void main() {
    vec3 n = normalize(position);
    float idle = organic(n, uTime) + loaderSurface(n, uTime);
    float directionalFace = pow(max(0.0, dot(n, vec3(uDirection, 0.0, 0.0))), 2.25);
    float releaseFace = pow(max(0.0, dot(n, vec3(-uDirection, 0.0, 0.0))), 3.0);
    float membrane = directionalFace * uStretch * 0.34;
    membrane -= releaseFace * uTransition * 0.075;
    float wobble = sin(uTime * 3.0 + n.y * 4.0) * uTransition * 0.026;
    float loaderSqueeze = sin(uTime * 2.05) * uLoaderMotion;
    vec3 pointerDirection = normalize(vec3(uPointer.x, uPointer.y * 0.86, 0.72));
    float pointerFace = pow(max(0.0, dot(n, pointerDirection)), 3.2);
    float pointerSurface = pointerFace * uPointerStrength;

    vec3 displaced = position + n * (idle + membrane + wobble + pointerSurface);
    displaced += pointerDirection * pointerSurface * 0.06;
    displaced.x *= 1.0 + uStretch * 0.08 + loaderSqueeze * 0.045;
    displaced.x += uDirection * uStretch * (0.09 + directionalFace * 0.08);
    displaced.y *= 0.94 + sin(uTime * 0.45) * 0.008 - loaderSqueeze * 0.035;
    displaced.z *= 0.91;

    vBulge = membrane + idle + pointerSurface;
    vPosition = displaced;
    vNormalW = normalize(normalMatrix * n);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec3 uAccentColor;
  uniform float uTransition;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  varying vec3 vNormalW;
  varying vec3 vPosition;
  varying float vBulge;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(normalize(vNormalW), viewDir)), 2.25);
    float upperLight = smoothstep(-0.75, 0.85, vNormalW.y);
    float leftPearl = pow(max(0.0, dot(normalize(vNormalW), normalize(vec3(-0.7, 0.8, 0.9)))), 12.0);
    float pinkPearl = pow(max(0.0, dot(normalize(vNormalW), normalize(vec3(0.8, -0.15, 0.7)))), 8.0);
    vec3 pointerDirection = normalize(vec3(uPointer.x, uPointer.y * 0.86, 0.72));
    float pointerPearl = pow(max(0.0, dot(normalize(vNormalW), pointerDirection)), 11.0) * uPointerStrength;
    float inner = 0.5 + 0.5 * sin(vPosition.y * 3.0 - vPosition.x * 2.2 + uTime * 0.17);

    vec3 lavender = vec3(0.658, 0.451, 1.0);
    vec3 lilac = vec3(0.847, 0.718, 1.0);
    vec3 blue = vec3(0.725, 0.867, 1.0);
    vec3 pink = vec3(1.0, 0.714, 0.875);
    vec3 color = mix(lavender, lilac, upperLight * 0.54);
    color = mix(color, blue, fresnel * 0.20);
    color = mix(color, pink, pinkPearl * 0.22);
    color = mix(color, uAccentColor, (0.055 + uTransition * 0.05) * inner);
    color += vec3(1.0) * leftPearl * 0.55;
    color += vec3(0.88, 0.78, 1.0) * pointerPearl * 1.15;
    color += vec3(0.17, 0.06, 0.28) * max(0.0, vBulge) * 0.5;

    float alpha = 0.60 + fresnel * 0.27 + leftPearl * 0.08 + pointerPearl * 0.08;
    gl_FragColor = vec4(color, alpha);
  }
`;

function JellyMesh({
  interactionRef,
  reducedMotion,
  loader,
  loaderProgress = 0,
  detail,
}: Omit<JellyCanvasProps, "className"> & { detail: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const loaderGrowthRef = useRef(0.5);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDirection: { value: 1 },
      uStretch: { value: 0 },
      uVelocity: { value: 0 },
      uTransition: { value: 0 },
      uLoaderMotion: { value: 0 },
      uAccentColor: { value: new THREE.Color("#ff5559") },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: 0 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (document.hidden || !meshRef.current || !material) return;
    const data = interactionRef.current;
    const timeScale = reducedMotion ? 0.08 : 1;
    material.uniforms.uTime.value += Math.min(delta, 0.04) * timeScale;
    material.uniforms.uDirection.value = THREE.MathUtils.lerp(
      material.uniforms.uDirection.value,
      data.direction || 1,
      0.16,
    );
    material.uniforms.uStretch.value = THREE.MathUtils.lerp(
      material.uniforms.uStretch.value,
      reducedMotion ? Math.min(data.stretch, 0.08) : data.stretch,
      0.12,
    );
    material.uniforms.uVelocity.value = data.velocity;
    material.uniforms.uTransition.value = THREE.MathUtils.lerp(
      material.uniforms.uTransition.value,
      data.transition,
      0.1,
    );
    const normalizedProgress = THREE.MathUtils.clamp(loaderProgress, 0, 1);
    const loaderMotionIntensity = loader
      ? (0.7 + normalizedProgress * 0.48) * (reducedMotion ? 0.12 : 1)
      : 0;
    material.uniforms.uLoaderMotion.value = THREE.MathUtils.lerp(
      material.uniforms.uLoaderMotion.value,
      loaderMotionIntensity,
      0.08,
    );
    material.uniforms.uAccentColor.value.lerp(
      new THREE.Color(data.accent),
      0.06,
    );
    const pointerFollow = reducedMotion ? 0.08 : 0.22;
    material.uniforms.uPointer.value.x = THREE.MathUtils.lerp(
      material.uniforms.uPointer.value.x,
      data.pointerX,
      pointerFollow,
    );
    material.uniforms.uPointer.value.y = THREE.MathUtils.lerp(
      material.uniforms.uPointer.value.y,
      data.pointerY,
      pointerFollow,
    );
    material.uniforms.uPointerStrength.value = THREE.MathUtils.lerp(
      material.uniforms.uPointerStrength.value,
      reducedMotion ? 0 : data.pointerStrength,
      0.2,
    );

    const smoothedProgress =
      normalizedProgress * normalizedProgress * (3 - 2 * normalizedProgress);
    const loaderMinScale = 0.5;
    const loaderMaxScale = detail === 4 ? 1.02 : 1.18;
    const loaderTargetScale = THREE.MathUtils.lerp(
      loaderMinScale,
      loaderMaxScale,
      smoothedProgress,
    );
    loaderGrowthRef.current = loader
      ? THREE.MathUtils.damp(
          loaderGrowthRef.current,
          loaderTargetScale,
          reducedMotion ? 22 : 11,
          Math.min(delta, 0.04),
        )
      : 1;

    const breathingVariation = reducedMotion
      ? 0
      : Math.sin(
          material.uniforms.uTime.value * (loader ? 0.73 : 0.7),
        ) * (loader ? 0.006 : 0.008);
    const finalScale = loader
      ? loaderGrowthRef.current + breathingVariation
      : 1 + breathingVariation;
    const motionAmplitude = loader
      ? THREE.MathUtils.lerp(0.075, 0.115, normalizedProgress) *
        (reducedMotion ? 0.12 : 1)
      : 0;
    const largeWave = Math.sin(material.uniforms.uTime.value * 1.55);
    const secondaryWave = Math.sin(
      material.uniforms.uTime.value * 2.2 + 1.35,
    );
    const preparation = THREE.MathUtils.smoothstep(
      normalizedProgress,
      0.9,
      0.97,
    );
    const finalPhase = THREE.MathUtils.clamp(
      (normalizedProgress - 0.97) / 0.03,
      0,
      1,
    );
    const settlePulse = -Math.sin(finalPhase * Math.PI) * 0.024;
    const preparationWidth = loader ? preparation * 0.04 + settlePulse : 0;

    meshRef.current.scale.set(
      finalScale * (1 + largeWave * motionAmplitude + preparationWidth),
      finalScale *
        (1 -
          largeWave * motionAmplitude * 0.84 +
          secondaryWave * motionAmplitude * 0.34 -
          preparationWidth * 0.48) *
        (loader && detail === 4 ? 0.9 : 1),
      finalScale * (1 + secondaryWave * motionAmplitude * 0.42),
    );
    meshRef.current.position.set(
      loader
        ? (Math.sin(material.uniforms.uTime.value * 0.68 + 0.55) * 0.026 +
            Math.sin(material.uniforms.uTime.value * 1.9) * 0.008) *
            (reducedMotion ? 0.12 : 1)
        : 0,
      loader
        ? Math.sin(material.uniforms.uTime.value * 0.92 - 0.8) *
            0.018 *
            (reducedMotion ? 0.12 : 1)
        : 0,
      0,
    );
    meshRef.current.rotation.y = loader
      ? Math.sin(material.uniforms.uTime.value * 0.55) *
        THREE.MathUtils.degToRad(reducedMotion ? 0.7 : 4.5)
      : 0;
    meshRef.current.rotation.z = loader
      ? Math.sin(material.uniforms.uTime.value * 0.42 + 0.8) *
        THREE.MathUtils.degToRad(reducedMotion ? 0.5 : 3)
      : Math.sin(material.uniforms.uTime.value * 0.23) * 0.025;
    state.gl.setClearColor(0x000000, 0);
  });

  return (
    <mesh ref={meshRef} scale={loader ? 0.5 : 1}>
      <icosahedronGeometry args={[1, detail]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function JellyFallback({
  className = "",
  loader = false,
  loaderProgress = 0,
  mobile = false,
}: {
  className?: string;
  loader?: boolean;
  loaderProgress?: number;
  mobile?: boolean;
}) {
  const normalizedProgress = THREE.MathUtils.clamp(loaderProgress, 0, 1);
  const smoothedProgress =
    normalizedProgress * normalizedProgress * (3 - 2 * normalizedProgress);
  const fallbackScale = loader
    ? THREE.MathUtils.lerp(
        0.5,
        mobile ? 1.02 : 1.18,
        smoothedProgress,
      )
    : 1;

  return (
    <div className={`jelly-fallback ${className}`} aria-hidden="true">
      <span
        style={
          {
            "--fallback-loader-scale": fallbackScale,
          } as CSSProperties
        }
      />
    </div>
  );
}

class JellyBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void error;
    void info;
    // The DOM carousel remains functional when the WebGL layer fails.
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function JellyCanvas({
  interactionRef,
  className = "",
  reducedMotion = false,
  loader = false,
  loaderProgress = 0,
}: JellyCanvasProps) {
  const [webglAvailable] = useState(() => {
    if (typeof document === "undefined") return true;
    try {
      const probe = document.createElement("canvas");
      return Boolean(
        probe.getContext("webgl2") ||
          probe.getContext("webgl") ||
          probe.getContext("experimental-webgl"),
      );
    } catch {
      return false;
    }
  });
  const [geometryDetail] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768
      ? 4
      : loader
        ? 6
        : 5,
  );

  if (!webglAvailable) {
    return (
      <JellyFallback
        className={className}
        loader={loader}
        loaderProgress={loaderProgress}
        mobile={geometryDetail === 4}
      />
    );
  }

  return (
    <div className={`jelly-canvas ${className}`} aria-hidden="true">
      <JellyBoundary
        fallback={
          <JellyFallback
            loader={loader}
            loaderProgress={loaderProgress}
            mobile={geometryDetail === 4}
          />
        }
      >
        <Canvas
          camera={{
            position: [0, 0, loader ? (geometryDetail === 4 ? 2.9 : 3.55) : 3.1],
            fov: 43,
          }}
          dpr={[1, geometryDetail === 4 ? 1.35 : 1.65]}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
            premultipliedAlpha: false,
          }}
          fallback={<JellyFallback />}
        >
          <JellyMesh
            interactionRef={interactionRef}
            reducedMotion={reducedMotion}
            loader={loader}
            loaderProgress={loaderProgress}
            detail={geometryDetail}
          />
        </Canvas>
      </JellyBoundary>
    </div>
  );
}
