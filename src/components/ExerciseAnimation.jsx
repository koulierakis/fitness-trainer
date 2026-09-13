import React from 'react';

const FLAGSHIP=[
  {key:'pushup',match:n=>/push[ -]?up|κάμψ/.test(n),label:'CHEST · TRICEPS · CORE'},
  {key:'squat',match:n=>/squat|κάθισ/.test(n),label:'QUADS · GLUTES · CORE'},
  {key:'lunge',match:n=>/lunge|προβολ/.test(n),label:'QUADS · GLUTES · HAMSTRINGS'},
  {key:'press',match:n=>/shoulder press|overhead press|military press|πιέσ.*ώμ/.test(n),label:'DELTOIDS · TRICEPS · CORE'},
  {key:'row',match:n=>/\brow\b|κωπηλα/.test(n),label:'LATS · RHOMBOIDS · BICEPS'}
];

function flagshipFor(exercise){
  const n=`${exercise?.name||''} ${exercise?.gr||''}`.toLowerCase();
  return FLAGSHIP.find(x=>x.match(n));
}

function PremiumAnatomical({exercise,compact=false,kind,label}){
  const dur=kind==='row'?'2.2s':'2.5s';
  const common=<>
    <defs>
      <linearGradient id={`muscle-${kind}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb07f"/><stop offset=".45" stopColor="#dc6048"/><stop offset="1" stopColor="#792b27"/></linearGradient>
      <linearGradient id={`active-${kind}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe1a6"/><stop offset=".42" stopColor="#ff7b50"/><stop offset="1" stopColor="#ce392c"/></linearGradient>
      <linearGradient id={`bone-${kind}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff8dc"/><stop offset="1" stopColor="#aeb6b5"/></linearGradient>
      <filter id={`glow-${kind}`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <ellipse cx="210" cy="205" rx="150" ry="11" fill="#000" opacity=".48"/>
    <line x1="38" y1="196" x2="390" y2="196" stroke="#34414d" strokeWidth="2"/>
  </>;

  const head=(cx,cy)=><g><ellipse cx={cx} cy={cy} rx="14" ry="17" fill={`url(#muscle-${kind})`}/><path d={`M${cx-7} ${cy-2} Q${cx} ${cy+3} ${cx+7} ${cy-2}`} fill="none" stroke={`url(#bone-${kind})`} strokeWidth="1.8" opacity=".65"/></g>;

  let body=null;
  if(kind==='pushup') body=<g>
    <animateTransform attributeName="transform" type="translate" values="0 0;0 34;0 0" dur={dur} repeatCount="indefinite"/>
    {head(92,86)}
    <path d="M111 89 C145 76 202 80 267 109 C260 126 244 135 216 132 C181 128 145 115 107 102Z" fill={`url(#muscle-${kind})`} stroke="#e38b68" strokeWidth="1.3"/>
    <path d="M115 87 C134 80 151 83 165 94 C157 110 137 113 116 105Z" fill={`url(#active-${kind})`} filter={`url(#glow-${kind})`}/>
    <path d="M170 91 Q199 103 233 112" stroke={`url(#bone-${kind})`} strokeWidth="3.2" fill="none" opacity=".75"/>
    <line x1="126" y1="99" x2="116" y2="143" stroke={`url(#active-${kind})`} strokeWidth="20" strokeLinecap="round"/>
    <line x1="116" y1="143" x2="104" y2="190" stroke={`url(#muscle-${kind})`} strokeWidth="15" strokeLinecap="round"/>
    <line x1="126" y1="99" x2="116" y2="143" stroke={`url(#bone-${kind})`} strokeWidth="4" opacity=".75"/>
    <line x1="116" y1="143" x2="104" y2="190" stroke={`url(#bone-${kind})`} strokeWidth="3.5" opacity=".75"/>
    <line x1="270" y1="112" x2="325" y2="148" stroke={`url(#muscle-${kind})`} strokeWidth="22" strokeLinecap="round"/>
    <line x1="325" y1="148" x2="378" y2="190" stroke={`url(#muscle-${kind})`} strokeWidth="17" strokeLinecap="round"/>
    <line x1="270" y1="112" x2="325" y2="148" stroke={`url(#bone-${kind})`} strokeWidth="4" opacity=".7"/>
    <line x1="325" y1="148" x2="378" y2="190" stroke={`url(#bone-${kind})`} strokeWidth="3.5" opacity=".7"/>
  </g>;

  if(kind==='squat') body=<g transform="translate(0 2)">
    <animateTransform attributeName="transform" additive="sum" type="translate" values="0 0;0 38;0 0" dur={dur} repeatCount="indefinite"/>
    {head(212,50)}
    <path d="M193 68 Q212 58 231 68 L239 120 Q212 132 185 120Z" fill={`url(#muscle-${kind})`}/>
    <path d="M190 105 Q212 96 234 105 L237 126 Q212 137 187 126Z" fill={`url(#active-${kind})`} filter={`url(#glow-${kind})`}/>
    <path d="M206 74 L218 74 M203 84 L221 84 M202 94 L222 94" stroke={`url(#bone-${kind})`} strokeWidth="2" opacity=".68"/>
    <line x1="191" y1="78" x2="158" y2="98" stroke={`url(#muscle-${kind})`} strokeWidth="15" strokeLinecap="round"/>
    <line x1="233" y1="78" x2="266" y2="98" stroke={`url(#muscle-${kind})`} strokeWidth="15" strokeLinecap="round"/>
    <line x1="198" y1="124" x2="166" y2="158" stroke={`url(#active-${kind})`} strokeWidth="22" strokeLinecap="round" filter={`url(#glow-${kind})`}/>
    <line x1="226" y1="124" x2="258" y2="158" stroke={`url(#active-${kind})`} strokeWidth="22" strokeLinecap="round" filter={`url(#glow-${kind})`}/>
    <line x1="166" y1="158" x2="157" y2="193" stroke={`url(#muscle-${kind})`} strokeWidth="16" strokeLinecap="round"/>
    <line x1="258" y1="158" x2="267" y2="193" stroke={`url(#muscle-${kind})`} strokeWidth="16" strokeLinecap="round"/>
    <line x1="198" y1="124" x2="166" y2="158" stroke={`url(#bone-${kind})`} strokeWidth="4" opacity=".72"/>
    <line x1="226" y1="124" x2="258" y2="158" stroke={`url(#bone-${kind})`} strokeWidth="4" opacity=".72"/>
  </g>;

  if(kind==='lunge') body=<g>
    <animateTransform attributeName="transform" type="translate" values="0 0;0 25;0 0" dur={dur} repeatCount="indefinite"/>
    {head(198,48)}
    <path d="M181 66 Q198 58 215 66 L222 118 Q198 128 174 118Z" fill={`url(#muscle-${kind})`}/>
    <path d="M181 105 Q198 98 216 105 L218 124 Q198 132 178 124Z" fill={`url(#active-${kind})`} filter={`url(#glow-${kind})`}/>
    <line x1="185" y1="119" x2="145" y2="152" stroke={`url(#active-${kind})`} strokeWidth="22" strokeLinecap="round"/>
    <line x1="145" y1="152" x2="122" y2="191" stroke={`url(#muscle-${kind})`} strokeWidth="16" strokeLinecap="round"/>
    <line x1="211" y1="119" x2="248" y2="152" stroke={`url(#active-${kind})`} strokeWidth="22" strokeLinecap="round"/>
    <line x1="248" y1="152" x2="292" y2="190" stroke={`url(#muscle-${kind})`} strokeWidth="16" strokeLinecap="round"/>
    <line x1="185" y1="119" x2="145" y2="152" stroke={`url(#bone-${kind})`} strokeWidth="4" opacity=".7"/>
    <line x1="211" y1="119" x2="248" y2="152" stroke={`url(#bone-${kind})`} strokeWidth="4" opacity=".7"/>
    <line x1="180" y1="76" x2="151" y2="106" stroke={`url(#muscle-${kind})`} strokeWidth="14" strokeLinecap="round"/>
    <line x1="216" y1="76" x2="245" y2="106" stroke={`url(#muscle-${kind})`} strokeWidth="14" strokeLinecap="round"/>
  </g>;

  if(kind==='press') body=<g>
    {head(210,52)}
    <path d="M191 70 Q210 61 229 70 L236 124 Q210 135 184 124Z" fill={`url(#muscle-${kind})`}/>
    <path d="M188 72 Q198 65 207 75 L201 98 Q190 96 183 86Z" fill={`url(#active-${kind})`} filter={`url(#glow-${kind})`}/>
    <path d="M232 72 Q222 65 213 75 L219 98 Q230 96 237 86Z" fill={`url(#active-${kind})`} filter={`url(#glow-${kind})`}/>
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -35;0 0" dur={dur} repeatCount="indefinite"/>
      <line x1="187" y1="82" x2="164" y2="117" stroke={`url(#active-${kind})`} strokeWidth="17" strokeLinecap="round"/>
      <line x1="233" y1="82" x2="256" y2="117" stroke={`url(#active-${kind})`} strokeWidth="17" strokeLinecap="round"/>
      <line x1="164" y1="117" x2="164" y2="148" stroke={`url(#muscle-${kind})`} strokeWidth="13" strokeLinecap="round"/>
      <line x1="256" y1="117" x2="256" y2="148" stroke={`url(#muscle-${kind})`} strokeWidth="13" strokeLinecap="round"/>
      <rect x="151" y="143" width="26" height="10" rx="4" fill="#c8a95e"/>
      <rect x="243" y="143" width="26" height="10" rx="4" fill="#c8a95e"/>
    </g>
    <line x1="198" y1="126" x2="183" y2="190" stroke={`url(#muscle-${kind})`} strokeWidth="17" strokeLinecap="round"/>
    <line x1="222" y1="126" x2="237" y2="190" stroke={`url(#muscle-${kind})`} strokeWidth="17" strokeLinecap="round"/>
  </g>;

  if(kind==='row') body=<g transform="rotate(-10 210 118)">
    {head(154,80)}
    <path d="M171 86 C205 78 240 92 269 116 C256 133 236 139 208 130 C187 123 171 108 162 97Z" fill={`url(#muscle-${kind})`}/>
    <path d="M205 91 Q233 95 257 114 Q244 126 219 120Z" fill={`url(#active-${kind})`} filter={`url(#glow-${kind})`}/>
    <line x1="181" y1="96" x2="151" y2="127" stroke={`url(#muscle-${kind})`} strokeWidth="15" strokeLinecap="round"/>
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0;22 -5;0 0" dur={dur} repeatCount="indefinite"/>
      <line x1="232" y1="104" x2="278" y2="123" stroke={`url(#active-${kind})`} strokeWidth="17" strokeLinecap="round"/>
      <line x1="278" y1="123" x2="314" y2="121" stroke={`url(#muscle-${kind})`} strokeWidth="13" strokeLinecap="round"/>
      <rect x="310" y="113" width="30" height="16" rx="5" fill="#c8a95e"/>
    </g>
    <line x1="220" y1="128" x2="196" y2="189" stroke={`url(#muscle-${kind})`} strokeWidth="18" strokeLinecap="round"/>
    <line x1="250" y1="128" x2="274" y2="189" stroke={`url(#muscle-${kind})`} strokeWidth="18" strokeLinecap="round"/>
  </g>;

  return <div className={`demo premium-anatomical premium-${kind} ${compact?'demo-compact':''}`} aria-label={`Premium anatomical motion: ${exercise?.gr||exercise?.name||''}`}>
    <svg viewBox="0 0 430 230" role="img" aria-label={`${exercise?.name||'Exercise'} anatomical movement`}>{common}{body}{!compact&&<g><circle cx="25" cy="24" r="5" fill="#ff7447"/><text x="38" y="28" fill="#ddc78e" fontSize="9" fontWeight="700">ANATOMICAL MOTION · {label}</text></g>}</svg>
    {!compact&&<div className="demoLabel anatomical-label"><span>FITNESS TRAINER ANATOMICAL MODEL</span><strong>{exercise?.gr||exercise?.name}</strong><small>Seamless movement preview · active muscles highlighted</small></div>}
  </div>;
}

function ImageSequencePreview({exercise,compact=false}){
  const media=exercise?.media||{};
  const frames=media.imageUrls||[];
  const [frame,setFrame]=React.useState(0);

  React.useEffect(()=>{
    if(!media.enabled||frames.length<2)return;
    const timer=window.setInterval(()=>setFrame(v=>(v+1)%frames.length),850);
    return()=>window.clearInterval(timer);
  },[media.enabled,frames.join('|')]);

  if(!media.enabled)return <DigitalMannequin exercise={exercise} compact={compact}/>;
  if(!frames.length)return <DigitalMannequin exercise={exercise} compact={compact}/>;

  return <div className={`demo remote-sequence-demo ${compact?'demo-compact':''}`}>
    <img key={frames[frame]} src={frames[frame]} alt={`${exercise?.name||'Exercise'} digital illustration`} loading="lazy" referrerPolicy="no-referrer"/>
    <div className="mediaAttribution">{media.badge||'REPDB'}</div>
    {!compact&&<div className="demoLabel"><span>{media.label||'DIGITAL EXERCISE MODEL'}</span><strong>{exercise?.gr}</strong><small>{media.credit||'Exercise data by RepDB (repdb.co)'}</small></div>}
  </div>;
}

function DigitalMannequin({exercise,compact=false}){
  return <div className={`demo anatomical-fallback ${compact?'demo-compact':''}`} aria-label={`Digital exercise model: ${exercise?.gr||''}`}>
    <svg viewBox="0 0 240 180" role="img" aria-label="Minimal digital anatomical mannequin">
      <defs><linearGradient id="bodyModel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f0f3f6"/><stop offset=".55" stopColor="#9ca7b3"/><stop offset="1" stopColor="#4b5663"/></linearGradient><linearGradient id="muscleGlow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e8c879"/><stop offset="1" stopColor="#b99039"/></linearGradient></defs>
      <ellipse cx="120" cy="158" rx="62" ry="7" fill="#000" opacity=".28"/>
      <g><circle cx="120" cy="38" r="14" fill="url(#bodyModel)"/><path d="M106 55 Q120 48 134 55 L142 102 Q120 112 98 102Z" fill="url(#bodyModel)"/><path d="M108 58 Q120 54 132 58 Q129 72 120 78 Q111 72 108 58Z" fill="url(#muscleGlow)" opacity=".9"/><path d="M98 65 L70 100" stroke="url(#bodyModel)" strokeWidth="13" strokeLinecap="round"/><path d="M142 65 L170 100" stroke="url(#bodyModel)" strokeWidth="13" strokeLinecap="round"/><path d="M108 101 L91 150" stroke="url(#bodyModel)" strokeWidth="16" strokeLinecap="round"/><path d="M132 101 L149 150" stroke="url(#bodyModel)" strokeWidth="16" strokeLinecap="round"/></g>
    </svg>
    {!compact&&<div className="demoLabel"><span>DIGITAL MANNEQUIN</span><strong>{exercise?.gr}</strong></div>}
  </div>;
}

export default function ExerciseAnimation({exercise,compact=false}){
  const flagship=flagshipFor(exercise);
  if(flagship)return <PremiumAnatomical exercise={exercise} compact={compact} kind={flagship.key} label={flagship.label}/>;
  if(exercise?.media?.type==='remote-image-sequence')return <ImageSequencePreview exercise={exercise} compact={compact}/>;
  return <DigitalMannequin exercise={exercise} compact={compact}/>;
}
