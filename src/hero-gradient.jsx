import React from "react";
import { createRoot } from "react-dom/client";
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";

const mountNode = document.getElementById("hero-gradient-react");

if (mountNode) {
  const root = createRoot(mountNode);

  root.render(
    <ShaderGradientCanvas
      className="hero-gradient-canvas"
      style={{ width: "100%", height: "100%" }}
      pixelDensity={1}
      fov={45}
      pointerEvents="none"
    >
      <ShaderGradient
        animate="on"
        axesHelper="on"
        bgColor1="#000000"
        bgColor2="#000000"
        brightness={1.1}
        cAzimuthAngle={180}
        cDistance={3.9}
        cPolarAngle={115}
        cameraZoom={1}
        color1="#4597FE"
        color2="#4597FE"
        color3="#FFFFFF"
        destination="onCanvas"
        embedMode="off"
        envPreset="city"
        format="gif"
        frameRate={10}
        gizmoHelper="hide"
        grain="off"
        lightType="3d"
        pixelDensity={1}
        positionX={-0.5}
        positionY={0.1}
        positionZ={0}
        range="disabled"
        rangeEnd={40}
        rangeStart={0}
        reflection={0.1}
        rotationX={0}
        rotationY={0}
        rotationZ={235}
        shader="defaults"
        type="waterPlane"
        uAmplitude={0}
        uDensity={1.1}
        uFrequency={5.5}
        uSpeed={0.1}
        uStrength={2.4}
        uTime={0.2}
        wireframe={false}
        zoomOut={false}
      />
    </ShaderGradientCanvas>,
  );
}
