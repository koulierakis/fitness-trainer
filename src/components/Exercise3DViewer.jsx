import React,{Suspense,useEffect,useMemo,useRef,useState} from 'react';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Html,OrbitControls,useAnimations,useGLTF} from '@react-three/drei';
import './Exercise3DViewer.css';

function Loader(){
  return <Html center><div className="exercise3d-loader">Φόρτωση 3D άσκησης…</div></Html>;
}

class ViewerErrorBoundary extends React.Component{
  constructor(props){super(props);this.state={failed:false};}
  static getDerivedStateFromError(){return {failed:true};}
  componentDidUpdate(prev){
    if(prev.resetKey!==this.props.resetKey&&this.state.failed)this.setState({failed:false});
  }
  componentDidCatch(error){console.error('Exercise3DViewer failed:',error);}
  render(){
    if(this.state.failed){
      return <div className="exercise3d-error" style={{height:this.props.height}}>
        <strong>Το 3D δεν φορτώθηκε.</strong>
        <span>Η άσκηση παραμένει διαθέσιμη. Δοκίμασε ξανά σε λίγο.</span>
      </div>;
    }
    return this.props.children;
  }
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

function useCompactVisibility(enabled){
  const ref=useRef(null);
  const[visible,setVisible]=useState(!enabled);
  useEffect(()=>{
    if(!enabled){setVisible(true);return;}
    const node=ref.current;
    if(!node||!('IntersectionObserver' in window)){setVisible(true);return;}
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:'260px 0px'});
    observer.observe(node);
    return()=>observer.disconnect();
  },[enabled]);
  return {ref,visible};
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
  const {ref,visible}=useCompactVisibility(compact);

  if(!modelUrl){
    return <div className="exercise3d-empty" style={{height:viewerHeight}}>Δεν υπάρχει 3D μοντέλο.</div>;
  }

  return <div ref={ref} className={`exercise3d-viewer ${compact?'exercise3d-compact':''}`} style={{height:viewerHeight,background}}>
    {!visible&&compact?<div className="exercise3d-card-placeholder" aria-hidden="true"/>:
      <ViewerErrorBoundary resetKey={modelUrl} height={viewerHeight}>
        <Canvas
          dpr={[1,1.7]}
          camera={{position:compactCamera,fov:compact?34:36,near:.1,far:100}}
          gl={{antialias:true,powerPreference:'high-performance'}}
        >
          <color attach="background" args={[background]}/>
          <ambientLight intensity={1.05}/>
          <hemisphereLight args={['#dce8ff','#111820',1.2]}/>
          <directionalLight position={[4,7,5]} intensity={2.3}/>
          <directionalLight position={[-4,3,-3]} intensity={1.1}/>

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
      </ViewerErrorBoundary>
    }

    {!compact&&<div className="exercise3d-hint">Σύρε με το δάχτυλο για 360°</div>}
    {!compact&&<div className="exercise3d-badge">3D · GLB · SKELETAL</div>}
  </div>;
}
