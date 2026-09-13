import React from 'react';

function AnatomicalPushup({exercise, compact=false}){
  const dur='2.8s';
  return <div className={`demo anatomical-demo anatomical-pushup-v2 ${compact?'demo-compact':''}`} aria-label={`3D anatomical animation: ${exercise?.gr||''}`}>
    <svg viewBox="0 0 430 235" role="img" aria-label="Τρισδιάστατο ανατομικό animation κάμψεων σε πλάγια τρία τέταρτα προβολή">
      <defs>
        <linearGradient id="skinMuscle" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff9862"/><stop offset=".48" stopColor="#d45138"/><stop offset="1" stopColor="#74261f"/></linearGradient>
        <linearGradient id="activeMuscle" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd19a"/><stop offset=".42" stopColor="#ff7148"/><stop offset="1" stopColor="#c33127"/></linearGradient>
        <linearGradient id="bone3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff7dc"/><stop offset=".55" stopColor="#d8d2bc"/><stop offset="1" stopColor="#8c918f"/></linearGradient>
        <radialGradient id="bodyShade"><stop offset="0" stopColor="#ff9a68"/><stop offset=".6" stopColor="#bc4434"/><stop offset="1" stopColor="#57211f"/></radialGradient>
        <filter id="glow3d" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="shadow3d" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
      </defs>
      <ellipse cx="226" cy="204" rx="177" ry="13" fill="#000" opacity=".55" filter="url(#shadow3d)"/>
      <line x1="24" y1="197" x2="408" y2="197" stroke="#4a5661" strokeWidth="2"/>
      <g opacity=".48">
        <line x1="151" y1="96" x2="128" y2="142" stroke="url(#skinMuscle)" strokeWidth="19" strokeLinecap="round"><animate attributeName="y1" values="96;137;96" dur={dur} repeatCount="indefinite"/><animate attributeName="y2" values="142;160;142" dur={dur} repeatCount="indefinite"/></line>
        <line x1="128" y1="142" x2="113" y2="192" stroke="url(#skinMuscle)" strokeWidth="14" strokeLinecap="round"><animate attributeName="y1" values="142;160;142" dur={dur} repeatCount="indefinite"/></line>
        <line x1="287" y1="111" x2="338" y2="151" stroke="url(#skinMuscle)" strokeWidth="21" strokeLinecap="round"><animate attributeName="y1" values="111;151;111" dur={dur} repeatCount="indefinite"/></line>
        <line x1="338" y1="151" x2="386" y2="191" stroke="url(#skinMuscle)" strokeWidth="16" strokeLinecap="round"><animate attributeName="y1" values="151;171;151" dur={dur} repeatCount="indefinite"/></line>
      </g>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 40;0 0" keyTimes="0;.5;1" dur={dur} repeatCount="indefinite"/>
        <path d="M139 86 C174 70 228 76 284 105 C277 124 257 135 226 132 C190 128 160 116 132 103 Z" fill="url(#bodyShade)" stroke="#ef8a63" strokeWidth="1.4"/>
        <path d="M142 84 C158 77 177 79 187 91 C180 108 160 113 139 103 C133 96 135 89 142 84Z" fill="url(#activeMuscle)" filter="url(#glow3d)"/>
        <ellipse cx="139" cy="96" rx="17" ry="15" fill="url(#activeMuscle)" filter="url(#glow3d)"/>
        <path d="M182 87 C204 82 226 88 242 100 C229 112 206 116 184 107 Z" fill="#a83b31" opacity=".85"/>
        <path d="M161 89 Q185 104 210 96 M158 96 Q184 112 215 103 M161 104 Q186 118 216 111" fill="none" stroke="url(#bone3d)" strokeWidth="2.2" opacity=".72"/>
        <path d="M185 86 C207 95 234 105 269 116" fill="none" stroke="url(#bone3d)" strokeWidth="4" opacity=".82"/>
        <path d="M270 105 Q292 108 303 119 Q290 133 267 128Z" fill="url(#skinMuscle)"/>
        <path d="M274 111 Q288 108 297 119 Q287 126 274 124Z" fill="none" stroke="url(#bone3d)" strokeWidth="3" opacity=".8"/>
        <path d="M137 88 L119 77" stroke="url(#skinMuscle)" strokeWidth="13" strokeLinecap="round"/>
        <ellipse cx="103" cy="69" rx="17" ry="19" fill="url(#skinMuscle)" transform="rotate(-18 103 69)"/>
        <path d="M94 61 Q105 54 115 64 M96 70 Q104 75 113 70" fill="none" stroke="url(#bone3d)" strokeWidth="2" opacity=".7"/>
      </g>
      <g>
        <line x1="145" y1="98" x2="133" y2="145" stroke="url(#activeMuscle)" strokeWidth="23" strokeLinecap="round" filter="url(#glow3d)"><animate attributeName="y1" values="98;138;98" dur={dur} repeatCount="indefinite"/><animate attributeName="y2" values="145;163;145" dur={dur} repeatCount="indefinite"/></line>
        <line x1="133" y1="145" x2="119" y2="192" stroke="url(#skinMuscle)" strokeWidth="17" strokeLinecap="round"><animate attributeName="y1" values="145;163;145" dur={dur} repeatCount="indefinite"/></line>
        <line x1="145" y1="98" x2="133" y2="145" stroke="url(#bone3d)" strokeWidth="4.5" strokeLinecap="round" opacity=".8"><animate attributeName="y1" values="98;138;98" dur={dur} repeatCount="indefinite"/><animate attributeName="y2" values="145;163;145" dur={dur} repeatCount="indefinite"/></line>
        <line x1="133" y1="145" x2="119" y2="192" stroke="url(#bone3d)" strokeWidth="4" strokeLinecap="round" opacity=".8"><animate attributeName="y1" values="145;163;145" dur={dur} repeatCount="indefinite"/></line>
        <ellipse cx="116" cy="194" rx="19" ry="6" fill="#d85a3d"/>
      </g>
      <g>
        <line x1="292" y1="116" x2="342" y2="153" stroke="url(#skinMuscle)" strokeWidth="25" strokeLinecap="round"><animate attributeName="y1" values="116;156;116" dur={dur} repeatCount="indefinite"/><animate attributeName="y2" values="153;173;153" dur={dur} repeatCount="indefinite"/></line>
        <line x1="342" y1="153" x2="389" y2="190" stroke="url(#skinMuscle)" strokeWidth="18" strokeLinecap="round"><animate attributeName="y1" values="153;173;153" dur={dur} repeatCount="indefinite"/></line>
        <line x1="292" y1="116" x2="342" y2="153" stroke="url(#bone3d)" strokeWidth="4.5" opacity=".72"><animate attributeName="y1" values="116;156;116" dur={dur} repeatCount="indefinite"/><animate attributeName="y2" values="153;173;153" dur={dur} repeatCount="indefinite"/></line>
        <line x1="342" y1="153" x2="389" y2="190" stroke="url(#bone3d)" strokeWidth="4" opacity=".72"><animate attributeName="y1" values="153;173;153" dur={dur} repeatCount="indefinite"/></line>
        <ellipse cx="393" cy="193" rx="19" ry="6" fill="#a43c32"/>
      </g>
      {!compact && <g className="an-labels"><circle cx="26" cy="23" r="5" className="active-dot"/><text x="39" y="27">3D ANATOMICAL • CHEST • TRICEPS • SHOULDERS • CORE</text></g>}
    </svg>
    {!compact && <div className="demoLabel anatomical-label"><span>ANATOMICAL MOTION • 3/4 VIEW</span><strong>{exercise?.gr}</strong><small>Αρχική θέση → ελεγχόμενη κάθοδος → πλήρης άνοδος</small></div>}
  </div>
}
function ImageSequencePreview({exercise,compact=false}){
  const media=exercise?.media||{}, frames=media.imageUrls||[];
  const [frame,setFrame]=React.useState(0);
  React.useEffect(()=>{if(!media.enabled||frames.length<2)return;const timer=window.setInterval(()=>setFrame(v=>(v+1)%frames.length),700);return()=>window.clearInterval(timer)},[media.enabled,frames.join('|')]);
  if(!media.enabled)return <div className={`demo remote-media-gate ${compact?'demo-compact':''}`}><div className="mediaGateBadge">MEDIA OFF</div><strong>{exercise?.gr}</strong><small>Exercise media is disabled by configuration.</small></div>;
  if(!frames.length)return <div className={`demo remote-media-gate ${compact?'demo-compact':''}`}><div className="mediaGateBadge">NO MEDIA</div><strong>{exercise?.gr}</strong><small>No preview image is available for this exercise.</small></div>;
  return <div className={`demo remote-sequence-demo ${compact?'demo-compact':''}`}><img key={frames[frame]} src={frames[frame]} alt={`${exercise?.name||'Exercise'} preview`} loading="lazy" referrerPolicy="no-referrer"/><div className="mediaAttribution">PUBLIC DOMAIN</div>{!compact&&<div className="demoLabel"><span>OPEN EXERCISE PREVIEW</span><strong>{exercise?.gr}</strong><small>free-exercise-db · Unlicense / Public Domain</small></div>}</div>
}
export default function ExerciseAnimation({exercise,compact=false}){
  if(exercise?.media?.type==='remote-image-sequence')return <ImageSequencePreview exercise={exercise} compact={compact}/>;
  if(exercise?.name==='Push-up')return <AnatomicalPushup exercise={exercise} compact={compact}/>;
  const motion=exercise?.media?.motion||'stand';
  return <div className={`demo demo-${motion} ${compact?'demo-compact':''}`} aria-label={`Animation: ${exercise?.gr||''}`}><svg viewBox="0 0 240 180" role="img"><line className="floor" x1="22" y1="157" x2="218" y2="157"/>{motion==='ropes'&&<><path className="rope r1" d="M122 116 C150 90 170 145 216 118"/><path className="rope r2" d="M118 121 C150 150 175 90 216 126"/></>}<g className="figure"><circle className="head" cx="112" cy="44" r="12"/><line className="body" x1="112" y1="57" x2="112" y2="103"/><line className="limb arm-left" x1="112" y1="68" x2="82" y2="92"/><line className="limb arm-right" x1="112" y1="68" x2="142" y2="92"/><line className="limb leg-left" x1="112" y1="103" x2="88" y2="148"/><line className="limb leg-right" x1="112" y1="103" x2="138" y2="148"/>{(exercise?.equipment==='Αλτήρες'||exercise?.equipment==='Kettlebell')&&<><rect className="weight w1" x="75" y="88" width="14" height="8" rx="2"/><rect className="weight w2" x="139" y="88" width="14" height="8" rx="2"/></>}{exercise?.equipment==='Λάστιχα'&&<path className="band" d="M82 92 Q112 118 142 92"/>}{exercise?.equipment==='TRX'&&<><line className="trx" x1="74" y1="8" x2="82" y2="92"/><line className="trx" x1="150" y1="8" x2="142" y2="92"/></>}</g></svg>{!compact&&<div className="demoLabel"><span>LIVE MOVEMENT SKETCH</span><strong>{exercise?.gr}</strong></div>}</div>
}
