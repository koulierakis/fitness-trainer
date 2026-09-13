import React from 'react';

function ImageSequencePreview({exercise,compact=false}){
  const media=exercise?.media||{};
  const frames=media.imageUrls||[];
  const [frame,setFrame]=React.useState(0);

  React.useEffect(()=>{
    if(!media.enabled||frames.length<2)return;
    const timer=window.setInterval(()=>setFrame(v=>(v+1)%frames.length),850);
    return()=>window.clearInterval(timer);
  },[media.enabled,frames.join('|')]);

  if(!media.enabled){
    return <div className={`demo remote-media-gate ${compact?'demo-compact':''}`}>
      <div className="mediaGateBadge">MEDIA OFF</div>
      <strong>{exercise?.gr}</strong>
      <small>Exercise media is disabled by configuration.</small>
    </div>;
  }

  if(!frames.length){
    return <DigitalMannequin exercise={exercise} compact={compact}/>;
  }

  return <div className={`demo remote-sequence-demo ${compact?'demo-compact':''}`}>
    <img
      key={frames[frame]}
      src={frames[frame]}
      alt={`${exercise?.name||'Exercise'} digital illustration`}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
    <div className="mediaAttribution">{media.badge||'REPDB'}</div>
    {!compact&&<div className="demoLabel">
      <span>{media.label||'DIGITAL EXERCISE MODEL'}</span>
      <strong>{exercise?.gr}</strong>
      <small>{media.credit||'Exercise data by RepDB (repdb.co)'}</small>
    </div>}
  </div>;
}

function DigitalMannequin({exercise,compact=false}){
  return <div className={`demo anatomical-fallback ${compact?'demo-compact':''}`} aria-label={`Digital exercise model: ${exercise?.gr||''}`}>
    <svg viewBox="0 0 240 180" role="img" aria-label="Minimal digital anatomical mannequin">
      <defs>
        <linearGradient id="bodyModel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0f3f6"/>
          <stop offset=".55" stopColor="#9ca7b3"/>
          <stop offset="1" stopColor="#4b5663"/>
        </linearGradient>
        <linearGradient id="muscleGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8c879"/>
          <stop offset="1" stopColor="#b99039"/>
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="158" rx="62" ry="7" fill="#000" opacity=".28"/>
      <g>
        <circle cx="120" cy="38" r="14" fill="url(#bodyModel)"/>
        <path d="M106 55 Q120 48 134 55 L142 102 Q120 112 98 102Z" fill="url(#bodyModel)"/>
        <path d="M108 58 Q120 54 132 58 Q129 72 120 78 Q111 72 108 58Z" fill="url(#muscleGlow)" opacity=".9"/>
        <path d="M98 65 L70 100" stroke="url(#bodyModel)" strokeWidth="13" strokeLinecap="round"/>
        <path d="M142 65 L170 100" stroke="url(#bodyModel)" strokeWidth="13" strokeLinecap="round"/>
        <path d="M108 101 L91 150" stroke="url(#bodyModel)" strokeWidth="16" strokeLinecap="round"/>
        <path d="M132 101 L149 150" stroke="url(#bodyModel)" strokeWidth="16" strokeLinecap="round"/>
        <path d="M111 82 L129 82" stroke="#d8bf77" strokeWidth="4" strokeLinecap="round" opacity=".8"/>
      </g>
    </svg>
    {!compact&&<div className="demoLabel"><span>DIGITAL MANNEQUIN</span><strong>{exercise?.gr}</strong></div>}
  </div>;
}

export default function ExerciseAnimation({exercise,compact=false}){
  if(exercise?.media?.type==='remote-image-sequence'){
    return <ImageSequencePreview exercise={exercise} compact={compact}/>;
  }
  return <DigitalMannequin exercise={exercise} compact={compact}/>;
}
