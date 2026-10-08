(function(global){'use strict';
function compare(spec,canonical){
 const checks=[];
 const pairs=[
  ['overallLengthMm',spec?.body?.length,canonical?.body?.overallLengthMm],
  ['overallWidthMm',spec?.body?.width,canonical?.body?.overallWidthMm],
  ['overallHeightMm',spec?.body?.height,canonical?.body?.overallHeightMm],
  ['wheelbaseMm',spec?.body?.wheelbase,canonical?.body?.wheelbaseMm],
  ['groundClearanceMm',spec?.body?.ground_clearance,canonical?.body?.groundClearanceMm],
  ['gvwKg',spec?.body?.gvw_kg,canonical?.ratings?.gvwKg]
 ];
 pairs.forEach(([field,legacy,now])=>{
  checks.push({field,legacy,canonical:now,status:legacy===now?'PASS':'FAIL'});
 });
 const estimated=Object.keys(canonical?.estimated||{}).filter(k=>canonical.estimated[k]!=null);
 checks.push({field:'estimatedGeometry',count:estimated.length,status:estimated.length?'VERIFICATION_REQUIRED':'PASS'});
 return {status:checks.some(c=>c.status==='FAIL')?'FAIL':checks.some(c=>c.status==='VERIFICATION_REQUIRED')?'VERIFICATION_REQUIRED':'PASS',checks};
}
global.ObjectWeaveGeometryParity={compare};
})(window);
