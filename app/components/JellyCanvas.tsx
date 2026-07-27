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

export type JellyPhase =
  | "entering"
  | "settling"
  | "idle"
  | "exiting"
  | "release";

export type JellyInteraction = {
  phase: JellyPhase;
  velocity: number;
  direction: number;
  stretch: number;
  transition: number;
  enterDirection: number;
  exitDirection: number;
  enterStrength: number;
  exitStrength: number;
  releaseDirection: number;
  releaseStrength: number;
  springResponse: number;
  settleAmplitude: number;
  settlePhase: number;
  idleStrength: number;
  fastForwarding: boolean;
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
  uniform float uHeroMode;
  uniform float uMotionScale;
  uniform float uEnterDirection;
  uniform float uExitDirection;
  uniform float uEnterStrength;
  uniform float uExitStrength;
  uniform float uReleaseDirection;
  uniform float uReleaseStrength;
  uniform float uSpringResponse;
  uniform float uSettleAmplitude;
  uniform float uSettlePhase;
  uniform float uIdleStrength;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  varying vec3 vNormalW;
  varying vec3 vPosition;
  varying vec3 vLocalPosition;
  varying float vReaction;

  float heroSurface(vec3 p, float t) {
    float angle = atan(p.y, p.x);
    float primaryCurve = sin(angle * 2.0 + t * 0.43) * 0.050;
    float secondaryCurve = sin(angle * 3.0 - t * 0.42 + p.y * 0.7) * 0.024;
    float verticalDrift = sin(p.y * 1.45 + t * 0.47 + p.x * 0.35) * 0.014;
    return (primaryCurve + secondaryCurve + verticalDrift) * uIdleStrength;
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
    float heroBreath = sin(uTime * 0.43) * 0.012;
    heroBreath += sin(uTime * 0.29 + 1.15) * 0.004;
    float idle = mix(loaderSurface(n, uTime), heroSurface(n, uTime), uHeroMode);
    float directionalFace = pow(max(0.0, dot(n, vec3(uDirection, 0.0, 0.0))), 2.25);
    float releaseFace = pow(max(0.0, dot(n, vec3(-uDirection, 0.0, 0.0))), 3.0);
    float legacyMembrane = directionalFace * uStretch * 0.34;
    legacyMembrane -= releaseFace * uTransition * 0.075;
    float enterFace = pow(max(0.0, dot(n, vec3(uEnterDirection, 0.0, 0.0))), 1.7);
    float exitFace = pow(max(0.0, dot(n, vec3(uExitDirection, 0.0, 0.0))), 1.7);
    float reaction = clamp(max(
      max(uEnterStrength, uExitStrength),
      max(uReleaseStrength, abs(uSpringResponse) * 3.0)
    ) * uMotionScale, 0.0, 1.0);
    float directionalMembrane = (
      enterFace * uEnterStrength * 0.030 +
      exitFace * uExitStrength * 0.034 -
      reaction * 0.012
    ) * uMotionScale;
    float releaseSurface = (enterFace - exitFace) * uReleaseStrength * 0.012 * uMotionScale;
    float settleSurface = uSpringResponse * (0.10 + n.y * 0.018) * uMotionScale;
    float membrane = mix(
      legacyMembrane,
      directionalMembrane + releaseSurface + settleSurface,
      uHeroMode
    );
    float wobble = sin(uTime * 3.0 + n.y * 4.0) * uTransition * 0.018 * (1.0 - uHeroMode);
    float loaderSqueeze = sin(uTime * 2.05) * uLoaderMotion;
    vec3 pointerDirection = normalize(vec3(uPointer.x, uPointer.y * 0.86, 0.72));
    float pointerFace = pow(max(0.0, dot(n, pointerDirection)), 3.2);
    float pointerSurface = pointerFace * uPointerStrength * mix(1.0, 0.18, uHeroMode);

    vec3 displaced = position + n * (
      idle + membrane + wobble + pointerSurface + heroBreath * uHeroMode
    );
    displaced += pointerDirection * pointerSurface * mix(0.06, 0.018, uHeroMode);
    displaced.x *= 1.0 + mix(
      uStretch * 0.08,
      (uEnterStrength + uExitStrength) * 0.010 * uMotionScale,
      uHeroMode
    ) + loaderSqueeze * 0.045;
    float legacyShift = uDirection * uStretch * (0.09 + directionalFace * 0.08);
    float directionalShift = (
      uEnterDirection * enterFace * uEnterStrength * 0.018 +
      uExitDirection * exitFace * uExitStrength * 0.020 +
      uReleaseDirection * uReleaseStrength * 0.012
    ) * uMotionScale;
    displaced.x += mix(legacyShift, directionalShift, uHeroMode);
    float loaderBreath = sin(uTime * 0.45) * 0.008;
    displaced.y *= mix(0.94 + loaderBreath - loaderSqueeze * 0.035, 0.955, uHeroMode);
    displaced.z *= mix(0.91, 0.935, uHeroMode);

    vReaction = reaction;
    vLocalPosition = displaced;
    vPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;
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
  varying vec3 vLocalPosition;
  varying float vReaction;

  void main() {
    vec3 normal = normalize(vNormalW);
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.35);

    vec2 highlightDrift = vec2(
      cos(uTime * 0.41) * 0.055,
      sin(uTime * 0.44) * 0.045
    );
    vec2 highlightCenter = vec2(-0.34, 0.42) + highlightDrift;
    float highlightDistance = length(
      vec2(vLocalPosition.x * 0.82, vLocalPosition.y) - highlightCenter
    );
    float diffusedHighlight = 1.0 - smoothstep(0.16, 0.95, highlightDistance);
    diffusedHighlight *= smoothstep(-0.25, 0.92, normal.z);

    vec2 shadowDrift = vec2(
      sin(uTime * 0.40 - 0.75) * 0.035,
      cos(uTime * 0.43 - 0.75) * 0.025
    );
    float bottomShadow = 1.0 - smoothstep(
      0.20,
      1.08,
      length(vec2(vLocalPosition.x * 0.86, vLocalPosition.y) - vec2(0.34, -0.52) - shadowDrift)
    );

    float gradientAngle = uTime * 0.45;
    vec2 gradientDirection = vec2(cos(gradientAngle), sin(gradientAngle));
    float gradientDrift = dot(vLocalPosition.xy, gradientDirection) * 0.5 + 0.5;
    float innerLight = 1.0 - smoothstep(
      0.12,
      1.05,
      length(vLocalPosition.xy - vec2(-0.10, 0.06 + sin(uTime * 0.42) * 0.05))
    );
    float upperLeftWash = clamp(
      0.52 + vLocalPosition.y * 0.22 - vLocalPosition.x * 0.16,
      0.0,
      1.0
    );
    float softKeyLight = smoothstep(
      -0.62,
      0.88,
      dot(normal, normalize(vec3(-0.56, 0.72, 0.42)))
    );
    float softLowerShade = smoothstep(
      -0.45,
      0.86,
      dot(normal, normalize(vec3(0.48, -0.68, 0.34)))
    );

    vec3 pointerDirection = normalize(vec3(uPointer.x, uPointer.y * 0.86, 0.72));
    float pointerLight = pow(max(0.0, dot(normal, pointerDirection)), 7.0);
    pointerLight *= uPointerStrength * 0.22;

    vec3 baseDeep = vec3(0.42, 0.20, 0.75);
    vec3 baseLavender = vec3(0.72, 0.49, 0.98);
    vec3 innerLavender = vec3(0.88, 0.76, 1.0);
    vec3 edgeLavender = vec3(0.84, 0.70, 1.0);
    vec3 color = mix(baseDeep, baseLavender, 0.46 + gradientDrift * 0.34);
    color = mix(color, innerLavender, innerLight * 0.28);
    color = mix(color, innerLavender, upperLeftWash * 0.18);
    color = mix(color, vec3(0.94, 0.84, 1.0), softKeyLight * 0.28);
    color = mix(color, vec3(0.98, 0.96, 1.0), diffusedHighlight * 0.42);
    color = mix(color, vec3(0.29, 0.13, 0.49), bottomShadow * 0.18);
    color = mix(color, baseDeep, softLowerShade * 0.10);
    color = mix(color, edgeLavender, fresnel * 0.12);
    color = mix(color, uAccentColor, (0.025 + vReaction * 0.018) * innerLight);
    color += vec3(0.88, 0.80, 1.0) * pointerLight;

    float alpha = 0.44;
    alpha += innerLight * 0.045;
    alpha += fresnel * 0.17;
    alpha += bottomShadow * 0.025;
    alpha -= diffusedHighlight * 0.025;
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
      uHeroMode: { value: loader ? 0 : 1 },
      uMotionScale: { value: detail === 4 ? 0.8 : 1 },
      uEnterDirection: { value: 1 },
      uExitDirection: { value: -1 },
      uEnterStrength: { value: 0 },
      uExitStrength: { value: 0 },
      uReleaseDirection: { value: 1 },
      uReleaseStrength: { value: 0 },
      uSpringResponse: { value: 0 },
      uSettleAmplitude: { value: 0 },
      uSettlePhase: { value: 0 },
      uIdleStrength: { value: 1 },
      uAccentColor: { value: new THREE.Color("#ff5559") },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: 0 },
    }),
    [detail, loader],
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
    material.uniforms.uEnterDirection.value = THREE.MathUtils.lerp(
      material.uniforms.uEnterDirection.value,
      data.enterDirection || 1,
      0.22,
    );
    material.uniforms.uExitDirection.value = THREE.MathUtils.lerp(
      material.uniforms.uExitDirection.value,
      data.exitDirection || -1,
      0.22,
    );
    const reducedForce = reducedMotion ? 0.24 : 1;
    material.uniforms.uEnterStrength.value = THREE.MathUtils.lerp(
      material.uniforms.uEnterStrength.value,
      data.enterStrength * reducedForce,
      0.24,
    );
    material.uniforms.uExitStrength.value = THREE.MathUtils.lerp(
      material.uniforms.uExitStrength.value,
      data.exitStrength * reducedForce,
      0.24,
    );
    material.uniforms.uReleaseDirection.value = THREE.MathUtils.lerp(
      material.uniforms.uReleaseDirection.value,
      data.releaseDirection || 1,
      0.22,
    );
    material.uniforms.uReleaseStrength.value = THREE.MathUtils.lerp(
      material.uniforms.uReleaseStrength.value,
      data.releaseStrength * reducedForce,
      data.phase === "release" ? 0.32 : 0.16,
    );
    material.uniforms.uSpringResponse.value = THREE.MathUtils.lerp(
      material.uniforms.uSpringResponse.value,
      data.springResponse,
      data.phase === "settling" ? 0.32 : 0.2,
    );
    material.uniforms.uSettleAmplitude.value = THREE.MathUtils.lerp(
      material.uniforms.uSettleAmplitude.value,
      data.settleAmplitude,
      data.phase === "settling" ? 0.28 : 0.14,
    );
    material.uniforms.uSettlePhase.value = data.settlePhase;
    material.uniforms.uIdleStrength.value = THREE.MathUtils.lerp(
      material.uniforms.uIdleStrength.value,
      data.idleStrength,
      0.08,
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

    const springResponse = loader
      ? 0
      : material.uniforms.uSpringResponse.value * (detail === 4 ? 0.75 : 1);
    if (loader) {
      meshRef.current.scale.set(
        finalScale *
          (1 +
            largeWave * motionAmplitude +
            preparationWidth +
            springResponse * 0.42),
        finalScale *
          (1 -
            largeWave * motionAmplitude * 0.84 +
            secondaryWave * motionAmplitude * 0.34 -
            preparationWidth * 0.48 -
            springResponse * 0.32) *
          (detail === 4 ? 0.9 : 1),
        finalScale *
          (1 +
            secondaryWave * motionAmplitude * 0.42 +
            springResponse * 0.16),
      );
    } else {
      const heroBreath = reducedMotion
        ? 0
        : Math.sin(material.uniforms.uTime.value * 0.43) * 0.009 +
          Math.sin(material.uniforms.uTime.value * 0.47 + 1.1) * 0.003;
      const transitionCompression = reducedMotion
        ? 0
        : material.uniforms.uTransition.value * 0.026 +
          Math.abs(material.uniforms.uSpringResponse.value) * 0.08;
      meshRef.current.scale.set(
        1 + heroBreath - transitionCompression,
        1 + heroBreath * 0.72 + transitionCompression * 0.34,
        1 + heroBreath * 0.46 + transitionCompression * 0.18,
      );
    }
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
      : Math.sin(material.uniforms.uTime.value * 0.41) *
        (reducedMotion ? 0 : 0.008);
    state.gl.setClearColor(0x000000, 0);
  });

  return (
    <mesh ref={meshRef} scale={loader ? 0.5 : 1}>
      {loader ? (
        <icosahedronGeometry args={[1, detail]} />
      ) : (
        <sphereGeometry
          args={[1, detail === 4 ? 64 : 80, detail === 4 ? 48 : 56]}
        />
      )}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={loader ? THREE.DoubleSide : THREE.FrontSide}
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
    <div
      className={`jelly-fallback${loader ? " is-loader-fallback" : ""} ${className}`}
      aria-hidden="true"
    >
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
