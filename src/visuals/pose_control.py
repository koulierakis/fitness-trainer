"""Deterministic OpenPose-style control-map generation for the 30-frame pilot.

These are generated structural controls, not photographs and not RepDB-derived.
Coordinates are normalized to the requested canvas. The map is supplied directly
to ControlNet as a PNG data URI, so no paid OpenPose preprocessing is required.
"""
import base64
from io import BytesIO
from PIL import Image, ImageDraw

EDGES=(("neck","r_shoulder"),("r_shoulder","r_elbow"),("r_elbow","r_wrist"),
       ("neck","l_shoulder"),("l_shoulder","l_elbow"),("l_elbow","l_wrist"),
       ("neck","r_hip"),("r_hip","r_knee"),("r_knee","r_ankle"),
       ("neck","l_hip"),("l_hip","l_knee"),("l_knee","l_ankle"),("neck","nose"))

POSES={
"standing_front":{"nose":(.50,.13),"neck":(.50,.22),"l_shoulder":(.44,.25),"r_shoulder":(.56,.25),"l_elbow":(.42,.37),"r_elbow":(.58,.37),"l_wrist":(.47,.43),"r_wrist":(.53,.43),"l_hip":(.46,.50),"r_hip":(.54,.50),"l_knee":(.46,.70),"r_knee":(.54,.70),"l_ankle":(.44,.91),"r_ankle":(.56,.91)},
"single_leg_rdl":{"nose":(.43,.18),"neck":(.46,.25),"l_shoulder":(.42,.27),"r_shoulder":(.49,.28),"l_elbow":(.49,.40),"r_elbow":(.54,.41),"l_wrist":(.55,.55),"r_wrist":(.59,.55),"l_hip":(.53,.49),"r_hip":(.56,.50),"l_knee":(.55,.69),"r_knee":(.35,.60),"l_ankle":(.55,.91),"r_ankle":(.19,.66)},
"supine":{"nose":(.23,.66),"neck":(.29,.68),"l_shoulder":(.32,.64),"r_shoulder":(.32,.72),"l_elbow":(.43,.61),"r_elbow":(.43,.75),"l_wrist":(.53,.59),"r_wrist":(.53,.77),"l_hip":(.52,.68),"r_hip":(.53,.72),"l_knee":(.68,.60),"r_knee":(.67,.78),"l_ankle":(.83,.62),"r_ankle":(.83,.80)},
"half_kneeling":{"nose":(.50,.14),"neck":(.50,.23),"l_shoulder":(.44,.26),"r_shoulder":(.56,.26),"l_elbow":(.43,.38),"r_elbow":(.57,.38),"l_wrist":(.45,.49),"r_wrist":(.55,.49),"l_hip":(.47,.51),"r_hip":(.53,.51),"l_knee":(.38,.68),"r_knee":(.62,.72),"l_ankle":(.31,.88),"r_ankle":(.78,.72)},
"hinge_bar_floor":{"nose":(.45,.19),"neck":(.47,.27),"l_shoulder":(.43,.29),"r_shoulder":(.51,.29),"l_elbow":(.48,.43),"r_elbow":(.54,.43),"l_wrist":(.49,.60),"r_wrist":(.55,.60),"l_hip":(.52,.48),"r_hip":(.56,.49),"l_knee":(.48,.68),"r_knee":(.59,.68),"l_ankle":(.45,.90),"r_ankle":(.62,.90)},
"split_jerk_overhead":{"nose":(.50,.13),"neck":(.50,.22),"l_shoulder":(.44,.25),"r_shoulder":(.56,.25),"l_elbow":(.43,.14),"r_elbow":(.57,.14),"l_wrist":(.42,.05),"r_wrist":(.58,.05),"l_hip":(.47,.49),"r_hip":(.53,.49),"l_knee":(.38,.67),"r_knee":(.64,.66),"l_ankle":(.27,.88),"r_ankle":(.76,.87)},
"standing_overhead":{"nose":(.50,.13),"neck":(.50,.22),"l_shoulder":(.44,.25),"r_shoulder":(.56,.25),"l_elbow":(.43,.14),"r_elbow":(.57,.14),"l_wrist":(.42,.05),"r_wrist":(.58,.05),"l_hip":(.46,.50),"r_hip":(.54,.50),"l_knee":(.46,.70),"r_knee":(.54,.70),"l_ankle":(.44,.91),"r_ankle":(.56,.91)},
"overhead_squat":{"nose":(.50,.22),"neck":(.50,.30),"l_shoulder":(.43,.32),"r_shoulder":(.57,.32),"l_elbow":(.40,.20),"r_elbow":(.60,.20),"l_wrist":(.38,.08),"r_wrist":(.62,.08),"l_hip":(.43,.55),"r_hip":(.57,.55),"l_knee":(.36,.70),"r_knee":(.64,.70),"l_ankle":(.39,.91),"r_ankle":(.61,.91)},
"plank":{"nose":(.77,.39),"neck":(.70,.43),"l_shoulder":(.67,.39),"r_shoulder":(.67,.47),"l_elbow":(.58,.55),"r_elbow":(.59,.58),"l_wrist":(.50,.68),"r_wrist":(.52,.70),"l_hip":(.48,.51),"r_hip":(.48,.55),"l_knee":(.34,.58),"r_knee":(.34,.61),"l_ankle":(.20,.66),"r_ankle":(.20,.69)},
"renegade_row":{"nose":(.77,.38),"neck":(.70,.42),"l_shoulder":(.66,.38),"r_shoulder":(.67,.47),"l_elbow":(.57,.54),"r_elbow":(.60,.34),"l_wrist":(.49,.68),"r_wrist":(.55,.43),"l_hip":(.48,.51),"r_hip":(.48,.55),"l_knee":(.34,.58),"r_knee":(.34,.61),"l_ankle":(.20,.66),"r_ankle":(.20,.69)},
"pike":{"nose":(.54,.44),"neck":(.51,.49),"l_shoulder":(.47,.48),"r_shoulder":(.52,.52),"l_elbow":(.42,.59),"r_elbow":(.46,.62),"l_wrist":(.36,.70),"r_wrist":(.40,.72),"l_hip":(.57,.28),"r_hip":(.61,.30),"l_knee":(.70,.48),"r_knee":(.73,.50),"l_ankle":(.80,.68),"r_ankle":(.83,.70)},
"windmill":{"nose":(.48,.18),"neck":(.49,.26),"l_shoulder":(.43,.28),"r_shoulder":(.55,.24),"l_elbow":(.40,.42),"r_elbow":(.57,.13),"l_wrist":(.38,.58),"r_wrist":(.59,.05),"l_hip":(.49,.50),"r_hip":(.56,.48),"l_knee":(.45,.70),"r_knee":(.58,.69),"l_ankle":(.42,.91),"r_ankle":(.61,.91)},
"hollow_hold":{"nose":(.27,.60),"neck":(.33,.64),"l_shoulder":(.36,.61),"r_shoulder":(.36,.67),"l_elbow":(.25,.52),"r_elbow":(.25,.56),"l_wrist":(.15,.43),"r_wrist":(.15,.47),"l_hip":(.52,.69),"r_hip":(.53,.73),"l_knee":(.66,.62),"r_knee":(.67,.66),"l_ankle":(.82,.54),"r_ankle":(.83,.58)}
}

def pose_data_uri(name,width=1344,height=768):
    if name not in POSES:raise ValueError("unknown pose template: "+str(name))
    img=Image.new("RGB",(width,height),(0,0,0));d=ImageDraw.Draw(img)
    pts={k:(int(x*width),int(y*height)) for k,(x,y) in POSES[name].items()}
    palette=[(255,80,80),(255,180,70),(255,240,80),(100,220,120),(80,200,255),(110,120,255),(210,100,255)]
    for i,(a,b) in enumerate(EDGES):
        if a in pts and b in pts:d.line([pts[a],pts[b]],fill=palette[i%len(palette)],width=max(5,width//180))
    r=max(5,width//220)
    for p in pts.values():d.ellipse((p[0]-r,p[1]-r,p[0]+r,p[1]+r),fill=(255,255,255))
    out=BytesIO();img.save(out,"PNG",optimize=True)
    return "data:image/png;base64,"+base64.b64encode(out.getvalue()).decode("ascii")
