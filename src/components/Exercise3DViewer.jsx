import React,{Suspense,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {Canvas,useThree} from '@react-three/fiber';
import {ContactShadows,Html,OrbitControls,useAnimations,useGLTF} from '@react-three/drei';
import './Exercise3DViewer.css';

// Dedupe GLB downloads between library cards, detail page and workout player.
THREE.Cache.enabled=true;

const DEFAULT_DIRECTION=[.55,.42,.72];
const RIG_CLIP=/\.rig$/i; // matches the mocap bone layer clip of OpenGym3D assets

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
      if(typeof this.props.fallback==='function')return this.props.fallback();
      if(this.props.fallback)return this.props.fallback;
      return <div className="exercise3d-error" style={{height:this.props.height}}>
        <strong>Το 3D δεν φορτώθηκε.</strong>
        <span>Η άσκηση παραμένει διαθέσιμη. Δοκίμασε ξανά σε λίγο.</span>
      </div>;
    }
    return this.props.children;
  }
}

// Verified OpenGym3D assets ship layered clips:
//  "Human.rig"  → 489 bone channels (the real skeletal motion),
//  "Human"      → single-channel root/retarget layer,
//  "Barbell" | "Kettlebell" | "Dumbbell.L" → prop layers.
// The layers target different nodes and are authored to run together, so when no
// explicit animationName is requested we co-play every clip of the file.
function selectClips(actions,names,animationName,modelUrl){
  if(!actions||!names?.length)return [];
  const requested=String(animationName||'').trim().toLowerCase();
  if(requested){
    const exact=names.find(n=>n.toLowerCase()===requested);
    const fuzzy=names.find(n=>n.toLowerCase().includes(requested));
    const picked=exact||fuzzy;
    if(picked)return [actions[picked]].filter(Boolean);
    console.warn(`Exercise3DViewer: clip "${animationName}" not found in ${modelUrl}. Available: ${names.join(', ')}`);
  }
  const playable=names.filter(n=>!RIG_CLIP.test(n)||((actions[n]?.getClip()?.tracks.length)||0)>4);
  const source=playable.length?playable:names;
  return source.map(n=>actions[n]).filter(Boolean);
}

function Model({modelUrl,animationName,frameSize=1.85,userScale=1,modelPosition=[0,0,0],modelRotation=[0,0,0],cameraDirection,fov=36,playbackSpeed=1,onNoAnimation}){
  const group=useRef();
  const gltf=useGLTF(modelUrl);
  const scene=useMemo(()=>SkeletonUtils.clone(gltf.scene),[gltf.scene]);
  const {actions,names}=useAnimations(gltf.animations,group);
  const camera=useThree(s=>s.camera);
  const controls=useThree(s=>s.controls);
  const noAnimRef=useRef(onNoAnimation);
  noAnimRef.current=onNoAnimation;
  const positionKey=modelPosition.join(','),rotationKey=modelRotation.join(','),directionKey=cameraDirection.join(',');

  // Normalize, ground and frame the model: verified assets are ~1.7-1.96m tall but
  // are not guaranteed to sit on the origin, so we derive transform, camera and
  // OrbitControls target from the actual bounding box instead of hardcoded values.
  useLayoutEffect(()=>{
    const node=group.current;
    if(!node)return;
    const box=new THREE.Box3().setFromObject(node);
    if(box.isEmpty())return;
    const size=box.getSize(new THREE.Vector3());
    const center=box.getCenter(new THREE.Vector3());
    const maxDim=Math.max(size.x,size.y,size.z);
    if(!isFinite(maxDim)||maxDim<=0)return;
    const s=(frameSize/maxDim)*userScale;
    const position=modelPosition.map(Number),rotation=modelRotation.map(Number);
    node.scale.setScalar(s);
    node.rotation.set(rotation[0],rotation[1],rotation[2]);
    node.position.set(position[0]-center.x*s,position[1]-box.min.y*s,position[2]-center.z*s);

    const target=new THREE.Vector3(position[0],position[1]+(box.max.y-box.min.y)*s/2,position[2]);
    const dir=new THREE.Vector3(...(cameraDirection||DEFAULT_DIRECTION)).normalize();
    const dist=((frameSize*Math.max(userScale,1))/2)/Math.tan(THREE.MathUtils.degToRad(fov)/2)*1.18;
    let retries=0;
    const frame=()=>{
      camera.position.copy(target).addScaledVector(dir,dist);
      camera.lookAt(target);
      camera.near=Math.max(.05,dist/40);
      camera.far=dist*40;
      camera.updateProjectionMatrix();
      if(controls){controls.target.copy(target);controls.update();return true;}
      return false;
    };
    if(!frame()){
      const retry=()=>{if(frame())return;if(++retries<60)requestAnimationFrame(retry);};
      requestAnimationFrame(retry);
    }
  },[scene,frameSize,userScale,positionKey,rotationKey,directionKey,fov,camera,controls]);

  useEffect(()=>{
    const queue=selectClips(actions,names,animationName,modelUrl);
    if(!queue.length){
      console.warn(`Exercise3DViewer: no animation clips resolved for ${modelUrl}`);
      noAnimRef.current?.();
      return;
    }
    console.info(`Exercise3DViewer: playing ${modelUrl} → [${queue.map(a=>a.getClip().name||'(unnamed)').join(', ')}]`);
    for(const action of queue){
      action.reset();
      action.enabled=true;
      action.clampWhenFinished=false;
      action.setLoop(THREE.LoopRepeat,Infinity);
      action.setEffectiveTimeScale(playbackSpeed);
      action.setEffectiveWeight(1);
      action.fadeIn(.2).play();
    }
    return()=>{for(const action of queue){action.fadeOut(.15);action.stop();}};
  },[actions,names,animationName,playbackSpeed,modelUrl]);

  return <group ref={group} dispose={null}>
    <primitive object={scene} dispose={null}/>
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
  playbackSpeed=1,
  background='#080d12',
  fallback,
  onNoAnimation
}){
  const viewerHeight=height||(compact?190:390);
  const fov=compact?34:36;
  const frameSize=compact?1.7:1.85;
  const {ref,visible}=useCompactVisibility(compact);

  if(!modelUrl){
    return <div className="exercise3d-empty" style={{height:viewerHeight}}>Δεν υπάρχει 3D μοντέλο.</div>;
  }

  return <div ref={ref} className={`exercise3d-viewer ${compact?'exercise3d-compact':''}`} style={{height:viewerHeight,background}}>
    {!visible&&compact?<div className="exercise3d-card-placeholder" aria-hidden="true"/>:
      <ViewerErrorBoundary resetKey={modelUrl} height={viewerHeight} fallback={fallback}>
        <Canvas
          dpr={[1,1.7]}
          camera={{position:cameraPosition,fov,near:.1,far:100}}
          gl={{antialias:true,powerPreference:'high-performance'}}
        >
          <color attach="background" args={[background]}/>
          <ambientLight intensity={1.05}/>
          <hemisphereLight args={['#dce8ff','#111820',1.2]}/>
          <directionalLight position={[4,7,5]} intensity={2.3}/>
          <directionalLight position={[-4,3,-3]} intensity={1.1}/>

          <Suspense fallback={<Loader/>}>
            <Model
              key={modelUrl}
              modelUrl={modelUrl}
              animationName={animationName}
              frameSize={frameSize}
              userScale={scale}
              modelPosition={modelPosition}
              modelRotation={modelRotation}
              cameraDirection={cameraPosition}
              fov={fov}
              playbackSpeed={playbackSpeed}
              onNoAnimation={onNoAnimation}
            />
            {!compact&&<ContactShadows position={[0,-.01,0]} opacity={.42} scale={7} blur={2.5} far={4}/>}
          </Suspense>

          <OrbitControls
            makeDefault
            enableRotate
            enableZoom={false}
            enablePan={false}
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


