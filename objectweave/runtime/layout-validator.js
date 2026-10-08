(function(global){
  "use strict";
  function box(p){
    var c=(p.transform&&p.transform.positionMm)||[0,0,0],e=p.envelope||{xMm:0,yMm:0,zMm:0};
    return {x:[c[0]-e.xMm/2,c[0]+e.xMm/2],y:[c[1]-e.yMm/2,c[1]+e.yMm/2],z:[c[2]-e.zMm/2,c[2]+e.zMm/2]};
  }
  function overlap(a,b){return a[0]<b[1]&&a[1]>b[0];}
  function intersects(a,b){return overlap(a.x,b.x)&&overlap(a.y,b.y)&&overlap(a.z,b.z);}
  function validate(candidate,vehicleEnvelope,protectedZones){
    var f=[],p=candidate.placements||[];
    if(!candidate.requirements||!candidate.requirements.useIntent)
      f.push({code:"LAYOUT-REQ-001",severity:"BLOCKER",status:"VERIFICATION_REQUIRED",message:"Use intent is required before layout selection."});
    if(!candidate.requirements||candidate.requirements.budget.totalInr===null)
      f.push({code:"LAYOUT-BUDGET-001",severity:"BLOCKER",status:"VERIFICATION_REQUIRED",message:"Budget is required before layout selection."});
    if(vehicleEnvelope){
      p.forEach(function(x){if(intersects(box(x),box({transform:{positionMm:vehicleEnvelope.center},envelope:vehicleEnvelope})))
        f.push({code:"LAYOUT-BODY-001",severity:"ERROR",status:"FAIL",message:x.id+" is outside or collides with the supplied body envelope."});});
    }
    for(var i=0;i<p.length;i++)for(var j=i+1;j<p.length;j++){
      if(intersects(box(p[i]),box(p[j]))){
        f.push({code:"LAYOUT-COLLISION-001",severity:"BLOCKER",status:"FAIL",message:p[i].id+" collides with "+p[j].id});
      }
    }
    (protectedZones||[]).forEach(function(z){p.forEach(function(x){
      if(intersects(box(x),box(z))) f.push({code:"LAYOUT-STRUCTURE-001",severity:"BLOCKER",status:"FAIL",message:x.id+" intersects protected zone "+z.id});
    });});
    p.forEach(function(x){
      if(x.fixedGeometry!==true) f.push({code:"LAYOUT-GEOMETRY-001",severity:"WARNING",status:"VERIFICATION_REQUIRED",message:x.id+" is not marked fixedGeometry."});
      if(x.serviceEnvelope===null) f.push({code:"LAYOUT-SERVICE-001",severity:"WARNING",status:"VERIFICATION_REQUIRED",message:x.id+" has no service envelope."});
    });
    return {status:f.some(function(x){return x.status==="FAIL";})?"FAIL":(f.length?"VERIFICATION_REQUIRED":"PASS"),findings:f};
  }
  global.ObjectWeaveLayoutValidator={validate:validate};
})(typeof window!=="undefined"?window:this);
