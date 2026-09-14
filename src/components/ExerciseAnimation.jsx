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

  if(!media.enabled||!frames.length)return <MotionPreview exercise={exercise} compact={compact}/>;

  return <div className={`demo remote-sequence-demo ${compact?'demo-compact':''}`}>
    <img src={frames[frame]} alt={`${exercise?.name||'Exercise'} preview`} loading="lazy" referrerPolicy="no-referrer"/>
    <div className="mediaAttribution">{media.badge||'EXERCISE'}</div>
    {!compact&&<div className="demoLabel"><span>{media.label||'EXERCISE PREVIEW'}</span><strong>{exercise?.gr}</strong><small>{media.credit||''}</small></div>}
  </div>;
}

const motionKind=exercise=>{
  const m=String(exercise?.movement||'').toLowerCase();
  const n=String(exercise?.name||'').toLowerCase();
  if(n.includes('push-up')||n.includes('plank')||n.includes('mountain climber')||n.includes('bear crawl'))return'horizontal';
  if(m.includes('squat')||m.includes('lunge')||n.includes('squat')||n.includes('lunge'))return'lower';
  if(m.includes('hinge')||n.includes('deadlift')||n.includes('swing'))return'hinge';
  if(m.includes('rotation')||n.includes('woodchop')||n.includes('pallof'))return'rotate';
  if(m.includes('push')||n.includes('press')||n.includes('thruster')||n.includes('jerk')||n.includes('snatch'))return'press';
  if(m.includes('pull')||n.includes('row')||n.includes('high pull'))return'pull';
  if(m.includes('locomotion')||n.includes('carry')||n.includes('crawl')||n.includes('burpee'))return'locomotion';
  return'general';
};

function MotionPreview({exercise,compact=false}){
  const kind=motionKind(exercise);
  const horizontal=kind==='horizontal';
  const label=exercise?.media3d?'3D PREVIEW':'MOTION PREVIEW';
  return <div className={`demo motion-preview motion-${kind} ${compact?'demo-compact':''}`} aria-label={`Motion preview: ${exercise?.gr||exercise?.name||''}`}>
    <style>{`
      .motion-preview{position:relative;overflow:hidden;display:grid;place-items:center;min-height:${compact?'112px':'300px'};background:radial-gradient(circle at 50% 42%,rgba(198,161,91,.13),rgba(255,255,255,.025) 45%,transparent 72%)}
      .motion-preview svg{width:${compact?'86%':'78%'};max-width:420px;height:${compact?'106px':'260px'};overflow:visible}
      .motion-preview .mline{stroke:currentColor;stroke-width:6;stroke-linecap:round;fill:none;vector-effect:non-scaling-stroke}
      .motion-preview .mjoint{fill:currentColor}.motion-preview .ghost{opacity:.18}
      .motion-preview .figure{transform-box:fill-box;transform-origin:center;animation:motion-general 1.8s ease-in-out infinite}
      .motion-lower .figure{animation-name:motion-lower}.motion-hinge .figure{animation-name:motion-hinge}.motion-rotate .figure{animation-name:motion-rotate}.motion-press .arms{transform-box:fill-box;transform-origin:50% 80%;animation:motion-press 1.5s ease-in-out infinite}.motion-pull .arms{transform-box:fill-box;transform-origin:50% 50%;animation:motion-pull 1.5s ease-in-out infinite}.motion-locomotion .figure{animation-name:motion-walk}.motion-horizontal .figure{animation-name:motion-horizontal;transform-origin:center}
      @keyframes motion-general{0%,100%{transform:translateY(-4px)}50%{transform:translateY(7px)}}
      @keyframes motion-lower{0%,100%{transform:translateY(-12px) scaleY(1)}50%{transform:translateY(28px) scaleY(.84)}}
      @keyframes motion-hinge{0%,100%{transform:rotate(0deg) translateY(-3px)}50%{transform:rotate(18deg) translate(10px,14px)}}
      @keyframes motion-rotate{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}}
      @keyframes motion-press{0%,100%{transform:translateY(16px)}50%{transform:translateY(-26px)}}
      @keyframes motion-pull{0%,100%{transform:scaleX(1.18)}50%{transform:scaleX(.72)}}
      @keyframes motion-walk{0%,100%{transform:translateX(-18px)}50%{transform:translateX(18px)}}
      @keyframes motion-horizontal{0%,100%{transform:rotate(88deg) translateY(-5px)}50%{transform:rotate(88deg) translateY(10px)}}
      @media (prefers-reduced-motion:reduce){.motion-preview .figure,.motion-preview .arms{animation:none!important}}
    `}</style>
    <svg viewBox="0 0 220 220" role="img" aria-hidden="true" style={{color:'rgba(240,244,248,.92)'}}>
      <g className="ghost" transform={horizontal?'rotate(88 110 110) translate(0 10)':'translate(0 10)'}>
        <circle className="mjoint" cx="110" cy="42" r="13"/>
        <path className="mline" d="M110 57 L110 116 M110 75 L78 98 M110 75 L144 98 M110 116 L84 170 M110 116 L140 170"/>
      </g>
      <g className="figure">
        <circle className="mjoint" cx="110" cy="42" r="13"/>
        <path className="mline" d="M110 57 L110 116"/>
        <g className="arms"><path className="mline" d="M110 75 L78 98 M110 75 L144 98"/></g>
        <path className="mline" d="M110 116 L84 170 M110 116 L140 170"/>
        <circle className="mjoint" cx="110" cy="75" r="5"/><circle className="mjoint" cx="110" cy="116" r="5"/>
      </g>
      <path d="M47 190 H173" stroke="rgba(198,161,91,.42)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <div style={{position:'absolute',left:compact?10:18,bottom:compact?8:14,fontSize:compact?8:10,letterSpacing:'.14em',opacity:.68}}>{label}</div>
    {!compact&&<div className="demoLabel"><span>ΚΙΝΗΣΗ ΑΣΚΗΣΗΣ</span><strong>{exercise?.gr||exercise?.name}</strong><small>{exercise?.movement||''}</small></div>}
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
  return <MotionPreview exercise={exercise} compact={compact}/>;
}
