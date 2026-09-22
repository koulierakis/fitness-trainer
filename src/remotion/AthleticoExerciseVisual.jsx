import React from 'react';
import {AbsoluteFill,Img,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';

const ORDER=['start','execution','return','execution','start'];

export function AthleticoExerciseVisual({exerciseId,manifest}){
  const frame=useCurrentFrame();
  const {durationInFrames}=useVideoConfig();
  const exercise=manifest.exercises[exerciseId];
  if(!exercise)throw new Error(`Unknown Athletico visual exercise: ${exerciseId}`);
  const segment=Math.max(1,Math.floor(durationInFrames/ORDER.length));
  const index=Math.min(ORDER.length-1,Math.floor(frame/segment));
  const next=Math.min(ORDER.length-1,index+1);
  const local=frame-index*segment;
  const fade=interpolate(local,[segment*.68,segment*.98],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const src=key=>staticFile(exercise.frames[ORDER[key]].asset.replace(/^\//,''));
  return <AbsoluteFill style={{backgroundColor:'#11161c',overflow:'hidden'}}>
    <Img src={src(index)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain',opacity:1-fade}}/>
    <Img src={src(next)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain',opacity:fade}}/>
  </AbsoluteFill>;
}
