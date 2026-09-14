import React from 'react';
import Exercise3DViewer from './Exercise3DViewer';

function ImageSequencePreview({exercise,compact=false}){
  const media=exercise?.media||{};
  const frames=media.imageUrls||[];
  const [frame,setFrame]=React.useState(0);

  React.useEffect(()=>{
    if(!media.enabled||frames.length<2)return;
    const timer=window.setInterval(()=>setFrame(v=>(v+1)%frames.length),850);
    return()=>window.clearInterval(timer);
  },[media.enabled,frames.join('|')]);

  if(!media.enabled||!frames.length)return <DigitalFallback exercise={exercise} compact={compact}/>;

  return <div className={`demo remote-sequence-demo ${compact?'demo-compact':''}`}>
    <img src={frames[frame]} alt={`${exercise?.name||'Exercise'} preview`} loading="lazy" referrerPolicy="no-referrer"/>
    <div className="mediaAttribution">{media.badge||'EXERCISE'}</div>
    {!compact&&<div className="demoLabel"><span>{media.label||'EXERCISE PREVIEW'}</span><strong>{exercise?.gr}</strong><small>{media.credit||''}</small></div>}
  </div>;
}

function DigitalFallback({exercise,compact=false}){
  return <div className={`demo anatomical-fallback ${compact?'demo-compact':''}`} aria-label={`Exercise preview: ${exercise?.gr||exercise?.name||''}`}>
    <svg viewBox="0 0 240 180" role="img" aria-label="Exercise placeholder">
      <defs><linearGradient id="bodyModel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f0f3f6"/><stop offset=".55" stopColor="#9ca7b3"/><stop offset="1" stopColor="#4b5663"/></linearGradient></defs>
      <ellipse cx="120" cy="158" rx="62" ry="7" fill="#000" opacity=".28"/>
      <circle cx="120" cy="38" r="14" fill="url(#bodyModel)"/>
      <path d="M106 55 Q120 48 134 55 L142 102 Q120 112 98 102Z" fill="url(#bodyModel)"/>
      <path d="M98 65 L70 100" stroke="url(#bodyModel)" strokeWidth="13" strokeLinecap="round"/>
      <path d="M142 65 L170 100" stroke="url(#bodyModel)" strokeWidth="13" strokeLinecap="round"/>
      <path d="M108 101 L91 150" stroke="url(#bodyModel)" strokeWidth="16" strokeLinecap="round"/>
      <path d="M132 101 L149 150" stroke="url(#bodyModel)" strokeWidth="16" strokeLinecap="round"/>
    </svg>
    {!compact&&<div className="demoLabel"><span>3D ASSET PENDING</span><strong>{exercise?.gr||exercise?.name}</strong></div>}
  </div>;
}

export default function ExerciseAnimation({exercise,compact=false}){
  if(exercise?.media3d?.type==='glb'){
    const media=exercise.media3d;
    return <Exercise3DViewer
      modelUrl={media.modelUrl}
      animationName={media.animationName}
      compact={compact}
      cameraPosition={media.camera?.position||[2.8,1.7,4.2]}
      cameraTarget={media.camera?.target||[0,1,0]}
      scale={media.model?.scale||1}
      modelPosition={media.model?.position||[0,0,0]}
      modelRotation={media.model?.rotation||[0,0,0]}
    />;
  }
  if(exercise?.media?.type==='remote-image-sequence')return <ImageSequencePreview exercise={exercise} compact={compact}/>;
  return <DigitalFallback exercise={exercise} compact={compact}/>;
}
