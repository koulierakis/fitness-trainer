import React,{Suspense,useEffect,useMemo,useRef} from 'react';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Environment,Html,OrbitControls,useAnimations,useGLTF} from '@react-three/drei';
import './Exercise3DViewer.css';

function Loader(){
  return <Html center><div className="exercise3d-loader">Loading 3D exercise…</div></Html>;
}

function Model({modelUrl,animationName,scale=1,position=[0,0,0],rotation=[0,0,0],playbackSpeed=1}){
  const group=useRef();
  const gltf=useGLTF(modelUrl);
  const scene=useMemo(()=>SkeletonUtils.clone(gltf.scene),[gltf.scene]);
  const {actions,names}=useAnimations(gltf.animations,group);

  useEffect(()=>{
    if(!actions||!names?.length){
      console.warn(`No skeletal animation found in ${modelUrl}`);
      return;
    }
    const requested=String(animationName||'').toLowerCase();
    const exact=names.find(n=>n.toLowerCase()===requested);
    const fuzzy=requested?names.find(n=>n.toLowerCase().includes(requested)):null;
    const selected=exact||fuzzy||names[0];
    const action=actions[selected];
    if(!action)return;

    action.reset();
    action.enabled=true;
    action.clampWhenFinished=false;
    action.setLoop(THREE.LoopRepeat,Infinity);
    action.setEffectiveTimeScale(playbackSpeed);
    action.setEffectiveWeight(1);
    action.fadeIn(.2).play();

    return()=>{
      action.fadeOut(.15);
      action.stop();
    };
  },[actions,names,animationName,playbackSpeed,modelUrl]);

  return <group ref={group} scale={scale} position={position} rotation={rotation} dispose={null}>
    <primitive object={scene}/>
  </group>;
}

export default function Exercise3DViewer({
  modelUrl,
  animationName,
  compact=false,
  height,
  scale=1,
  modelPosition=[0,0,0],
  modelRotation=[0,0,0],
  cameraPosition=[2.8,1.7,4.2],
  cameraTarget=[0,1,0],
  playbackSpeed=1,
  background='#080d12'
}){
  const viewerHeight=height||(compact?210:390);
  const compactCamera=compact?[cameraPosition[0],Math.min(cameraPosition[1],1.25),cameraPosition[2]]:cameraPosition;
  const compactTarget=compact?[cameraTarget[0],Math.min(cameraTarget[1],.55),cameraTarget[2]]:cameraTarget;

  if(!modelUrl){
    return <div className="exercise3d-empty" style={{height:viewerHeight}}>Δεν υπάρχει 3D μοντέλο.</div>;
  }

  return <div className={`exercise3d-viewer ${compact?'exercise3d-compact':''}`} style={{height:viewerHeight,background}}>
    <Canvas
      dpr={[1,1.7]}
      camera={{position:compactCamera,fov:compact?34:36,near:.1,far:100}}
      gl={{antialias:true,powerPreference:'high-performance'}}
    >
      <color attach="background" args={[background]}/>
      <ambientLight intensity={.8}/>
      <directionalLight position={[4,7,5]} intensity={2.2}/>
      <directionalLight position={[-4,3,-3]} intensity={1}/>

      <Suspense fallback={<Loader/>}>
        <Model
          modelUrl={modelUrl}
          animationName={animationName}
          scale={compact?scale*1.08:scale}
          position={modelPosition}
          rotation={modelRotation}
          playbackSpeed={playbackSpeed}
        />
        {!compact&&<ContactShadows position={[0,-.01,0]} opacity={.42} scale={7} blur={2.5} far={4}/>} 
        <Environment preset="studio"/>
      </Suspense>

      <OrbitControls
        makeDefault
        enableRotate
        enableZoom={false}
        enablePan={false}
        target={compactTarget}
        minPolarAngle={Math.PI*.15}
        maxPolarAngle={Math.PI*.78}
        enableDamping
        dampingFactor={.08}
        rotateSpeed={.65}
      />
    </Canvas>

    {!compact&&<div className="exercise3d-hint">Σύρε με το δάχτυλο για 360°</div>}
    {!compact&&<div className="exercise3d-badge">3D · GLB · SKELETAL</div>}
  </div>;
}
