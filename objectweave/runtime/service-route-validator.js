(function(global){
  "use strict";
  function validate(routes,nodes,zones){
    var byId={}; nodes.forEach(function(n){byId[n.id]=n;});
    var findings=[];
    routes.forEach(function(r){
      if(!byId[r.fromNodeId]||!byId[r.toNodeId])
        findings.push({code:"SERVICE-ENDPOINT-001",severity:"BLOCKER",status:"FAIL",message:r.id+" has an unresolved endpoint"});
      if(!r.pathSegments||!r.pathSegments.length)
        findings.push({code:"SERVICE-PATH-001",severity:"BLOCKER",status:"FAIL",message:r.id+" has no path segments"});
      if(!r.reservedEnvelope||r.reservedEnvelope.xMm<=0||r.reservedEnvelope.yMm<=0||r.reservedEnvelope.zMm<=0)
        findings.push({code:"SERVICE-ENVELOPE-001",severity:"BLOCKER",status:"VERIFICATION_REQUIRED",message:r.id+" has no physical route reservation"});
      if(r.serviceAccessZoneId===null)
        findings.push({code:"SERVICE-ACCESS-001",severity:"WARNING",status:"VERIFICATION_REQUIRED",message:r.id+" has no service access zone"});
      (r.pathSegments||[]).forEach(function(s,idx){
        if(s.bendRadiusMm===null)
          findings.push({code:"SERVICE-BEND-001",severity:"WARNING",status:"VERIFICATION_REQUIRED",message:r.id+" segment "+idx+" has unknown bend radius"});
      });
      (zones||[]).forEach(function(z){
        if(z.kind==="STRUCTURAL"&&z.constraintLevel&&z.constraintLevel!=="UNKNOWN")
          findings.push({code:"SERVICE-STRUCTURE-001",severity:"VERIFICATION_REQUIRED",status:"VERIFICATION_REQUIRED",message:r.id+" requires structural-zone clearance/penetration review"});
      });
    });
    return {status:findings.some(function(f){return f.status==="FAIL";})?"FAIL":"VERIFICATION_REQUIRED",findings:findings};
  }
  global.ObjectWeaveServiceRouteValidator={validate:validate};
})(typeof window!=="undefined"?window:this);
