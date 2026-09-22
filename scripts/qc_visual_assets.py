#!/usr/bin/env python3
"""QC existing Athletico WebP production assets. No inference; safe for CI."""
import argparse,json,sys
from pathlib import Path
from PIL import Image,ImageStat

def check(path, expected=(1024,1024), min_bytes=10*1024):
    if not path.exists(): return False,"MISSING"
    if path.stat().st_size<min_bytes:return False,f"TOO_SMALL:{path.stat().st_size}"
    try:
        with Image.open(path) as im: im.verify()
        with Image.open(path) as im:
            im.load()
            if im.format!="WEBP":return False,f"FORMAT:{im.format}"
            if expected and im.size!=expected:return False,f"RESOLUTION:{im.size[0]}x{im.size[1]}"
            rgb=im.convert("RGB")
            stat=ImageStat.Stat(rgb)
            # catches effectively blank/flat frames without pretending to assess biomechanics
            if max(stat.var)<2.0:return False,"NEAR_BLANK"
    except Exception as e:return False,f"CORRUPT:{type(e).__name__}:{e}"
    return True,"PASSED"

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--manifest",default="src/visuals/exercise-visual-manifest.json")
    ap.add_argument("--root",default="public")
    ap.add_argument("--width",type=int,default=1024);ap.add_argument("--height",type=int,default=1024)
    ap.add_argument("--allow-missing",action="store_true")
    ap.add_argument("--report",default="outputs/visual-qc-report.json")
    a=ap.parse_args()
    data=json.loads(Path(a.manifest).read_text(encoding="utf-8"))
    rows=[];missing=failed=passed=0
    for exid,ex in data.get("exercises",{}).items():
        for phase in ("start","execution","return"):
            frame=ex.get("frames",{}).get(phase,{})
            asset=str(frame.get("asset",""))
            rel=asset.lstrip("/")
            if rel.startswith("public/"): rel=rel[7:]
            p=Path(a.root)/rel
            ok,msg=check(p,(a.width,a.height))
            rows.append({"exercise_id":exid,"phase":phase,"asset":asset,"ok":ok,"status":msg})
            if ok:passed+=1
            elif msg=="MISSING":missing+=1
            else:failed+=1
    report={"summary":{"passed":passed,"missing":missing,"failed":failed,"total":len(rows)},"frames":rows}
    rp=Path(a.report);rp.parent.mkdir(parents=True,exist_ok=True);rp.write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
    print(json.dumps(report["summary"]))
    if failed or (missing and not a.allow_missing):return 1
    return 0
if __name__=="__main__":sys.exit(main())
