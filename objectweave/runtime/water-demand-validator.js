(function(global){
'use strict';
const finite=v=>Number.isFinite(v)&&v>=0;
const f=(code,severity,message,refs=[])=>({code,severity,message,refs});
function calculate(model){
 const findings=[];
 if(!model)return{status:'FAIL',findings:[f('WATER_MODEL_MISSING','FAIL','Water demand model is missing.')],results:null};
 const s=model.scenario||{};
 if(!Number.isInteger(s.occupants)||s.occupants<1)findings.push(f('OCCUPANTS_UNKNOWN','VERIFICATION_REQUIRED','Occupant count is required.'));
 if(!finite(s.autonomyDays))findings.push(f('WATER_AUTONOMY_UNKNOWN','VERIFICATION_REQUIRED','Water autonomy days are required.'));
 if(!finite(s.reserveFraction)||s.reserveFraction>1)findings.push(f('WATER_RESERVE_UNKNOWN','VERIFICATION_REQUIRED','Reserve fraction must be known between 0 and 1.'));
 let dailyFresh=0,dailyGrey=0,dailyBlack=0;
 (model.uses||[]).forEach(u=>{
  if(!finite(u.litresPerUse))findings.push(f('USE_VOLUME_UNKNOWN','VERIFICATION_REQUIRED','Water volume per use is unknown.',[u.id]));
  if(!finite(u.usesPerPersonPerDay))findings.push(f('USE_FREQUENCY_UNKNOWN','VERIFICATION_REQUIRED','Use frequency is unknown.',[u.id]));
  if(!finite(u.greyFraction)||u.greyFraction>1)findings.push(f('GREY_FRACTION_UNKNOWN','VERIFICATION_REQUIRED','Grey-water fraction is unknown/invalid.',[u.id]));
  if(!finite(u.blackFraction)||u.blackFraction>1)findings.push(f('BLACK_FRACTION_UNKNOWN','VERIFICATION_REQUIRED','Black-water fraction is unknown/invalid.',[u.id]));
  if(finite(u.greyFraction)&&finite(u.blackFraction)&&u.greyFraction+u.blackFraction>1)findings.push(f('WASTE_FRACTION_INVALID','FAIL','Grey plus black fraction exceeds 1.',[u.id]));
  if(Number.isInteger(s.occupants)&&s.occupants>0&&finite(u.litresPerUse)&&finite(u.usesPerPersonPerDay)){
   const v=u.litresPerUse*u.usesPerPersonPerDay*s.occupants; dailyFresh+=v;
   if(finite(u.greyFraction))dailyGrey+=v*u.greyFraction;
   if(finite(u.blackFraction))dailyBlack+=v*u.blackFraction;
  }
 });
 const days=finite(s.autonomyDays)?s.autonomyDays:null, reserve=finite(s.reserveFraction)&&s.reserveFraction<=1?s.reserveFraction:null;
 const factor=days!==null&&reserve!==null?days*(1+reserve):null;
 const reqFresh=factor!==null?dailyFresh*factor:null, reqGrey=factor!==null?dailyGrey*factor:null, reqBlack=factor!==null?dailyBlack*factor:null;
 const tanks=(model.tanks||{});
 [['fresh',reqFresh],['grey',reqGrey],['black',reqBlack]].forEach(([k,req])=>{
  const t=tanks[k]||{};
  if(!finite(t.capacityL))findings.push(f(k.toUpperCase()+'_TANK_CAPACITY_UNKNOWN','VERIFICATION_REQUIRED',k+' tank capacity is unknown.'));
  if(!finite(t.usableFraction)||t.usableFraction<=0||t.usableFraction>1)findings.push(f(k.toUpperCase()+'_TANK_USABLE_UNKNOWN','VERIFICATION_REQUIRED',k+' tank usable fraction is unknown/invalid.'));
  if(req!==null&&finite(t.capacityL)&&finite(t.usableFraction)&&t.usableFraction>0&&t.capacityL*t.usableFraction<req)findings.push(f(k.toUpperCase()+'_TANK_INSUFFICIENT','FAIL',k+' tank usable capacity is below scenario requirement.'));
  if(t.serviceAccess!==true)findings.push(f(k.toUpperCase()+'_TANK_ACCESS_REQUIRED','VERIFICATION_REQUIRED',k+' tank service access is not verified.'));
 });
 if((tanks.black||{}).vented!==true)findings.push(f('BLACK_TANK_VENT_REQUIRED','VERIFICATION_REQUIRED','Black tank venting is not verified.'));
 (model.routes||[]).forEach(r=>{
  if(!finite(r.diameterMm)||r.diameterMm===0)findings.push(f('ROUTE_DIAMETER_UNKNOWN','VERIFICATION_REQUIRED','Route diameter is unknown.',[r.id]));
  if(['GREY_DRAIN','BLACK_DRAIN'].includes(r.kind)){
   if(!Number.isFinite(r.startZmm)||!Number.isFinite(r.endZmm)||!finite(r.lengthMm)||r.lengthMm===0)findings.push(f('DRAIN_GEOMETRY_UNKNOWN','VERIFICATION_REQUIRED','Drain geometry is incomplete.',[r.id]));
   else if(finite(r.minimumSlopePercent)){const actual=(r.startZmm-r.endZmm)/r.lengthMm*100;if(actual<r.minimumSlopePercent)findings.push(f('DRAIN_SLOPE_INSUFFICIENT','FAIL','Drain route is below required slope.',[r.id]));}
   else findings.push(f('DRAIN_SLOPE_REQUIREMENT_UNKNOWN','VERIFICATION_REQUIRED','Minimum drain slope is unknown.',[r.id]));
  }
  if(r.serviceAccess!==true)findings.push(f('ROUTE_ACCESS_REQUIRED','VERIFICATION_REQUIRED','Route service access is not verified.',[r.id]));
 });
 const p=model.pump||{}; if(!finite(p.flowLpm)||!finite(p.pressureBar))findings.push(f('PUMP_REQUIREMENT_UNKNOWN','VERIFICATION_REQUIRED','Pump flow/pressure requirement is incomplete.'));
 const status=findings.some(x=>x.severity==='FAIL')?'FAIL':findings.some(x=>x.severity==='VERIFICATION_REQUIRED')?'VERIFICATION_REQUIRED':findings.some(x=>x.severity==='WARNING')?'WARNING':'PASS';
 // Engineering approximation: water-based fluid mass uses 1 kg/L until fluid-specific density is modelled.
 return{status,findings,results:{dailyFreshDemandL:dailyFresh,requiredFreshCapacityL:reqFresh,dailyGreyGenerationL:dailyGrey,requiredGreyCapacityL:reqGrey,dailyBlackGenerationL:dailyBlack,requiredBlackCapacityL:reqBlack,freshFullMassKg:finite((tanks.fresh||{}).capacityL)?tanks.fresh.capacityL:null,greyFullMassKg:finite((tanks.grey||{}).capacityL)?tanks.grey.capacityL:null,blackFullMassKg:finite((tanks.black||{}).capacityL)?tanks.black.capacityL:null}};
}
global.ObjectWeaveWaterDemandValidator={calculate};
})(typeof window!=='undefined'?window:globalThis);
