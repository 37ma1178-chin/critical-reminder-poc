(function(global){
'use strict';
const finite=v=>Number.isFinite(v)&&v>=0;
const f=(code,severity,message,refs=[])=>({code,severity,message,refs});
function calculate(m){
 const findings=[]; if(!m)return{status:'FAIL',findings:[f('THERMAL_MODEL_MISSING','FAIL','Thermal model is missing.')],results:null};
 const s=m.scenario||{};
 if(!Number.isFinite(s.outdoorDryBulbC)||!Number.isFinite(s.targetIndoorC))findings.push(f('TEMPERATURE_SCENARIO_UNKNOWN','VERIFICATION_REQUIRED','Outdoor and target indoor temperatures are required.'));
 if(!finite(s.outdoorRelativeHumidity)||s.outdoorRelativeHumidity>1)findings.push(f('OUTDOOR_HUMIDITY_UNKNOWN','VERIFICATION_REQUIRED','Outdoor relative humidity is unknown/invalid.'));
 if(!finite(s.targetRelativeHumidity)||s.targetRelativeHumidity>1)findings.push(f('TARGET_HUMIDITY_UNKNOWN','VERIFICATION_REQUIRED','Target relative humidity is unknown/invalid.'));
 if(s.solarScenario==='UNKNOWN'||!s.solarScenario)findings.push(f('SOLAR_SCENARIO_UNKNOWN','VERIFICATION_REQUIRED','Solar exposure scenario is required.'));
 const dT=Number.isFinite(s.outdoorDryBulbC)&&Number.isFinite(s.targetIndoorC)?Math.max(0,s.outdoorDryBulbC-s.targetIndoorC):null;
 let conductive=0,solar=0;
 (m.envelopeLoads||[]).forEach(e=>{
  if(!finite(e.areaM2)||!finite(e.uValueWm2K)||!finite(e.solarGainW))findings.push(f('ENVELOPE_DATA_UNKNOWN','VERIFICATION_REQUIRED','Envelope area/U-value/solar gain is incomplete.',[e.id]));
  if(dT!==null&&finite(e.areaM2)&&finite(e.uValueWm2K))conductive+=e.areaM2*e.uValueWm2K*dT;
  if(finite(e.solarGainW))solar+=e.solarGainW;
 });
 let sensible=0,latent=0;
 (m.internalLoads||[]).forEach(l=>{if(!finite(l.sensibleW)||!finite(l.latentW))findings.push(f('INTERNAL_LOAD_UNKNOWN','VERIFICATION_REQUIRED','Internal sensible/latent load is incomplete.',[l.id])); else{sensible+=l.sensibleW;latent+=l.latentW;}});
 const v=m.ventilation||{};
 if(!finite(v.outsideAirM3h)||!finite(v.requiredOutsideAirM3h))findings.push(f('VENTILATION_RATE_UNKNOWN','VERIFICATION_REQUIRED','Outside-air ventilation requirement is incomplete.'));
 else if(v.outsideAirM3h<v.requiredOutsideAirM3h)findings.push(f('VENTILATION_INSUFFICIENT','FAIL','Provided outside-air ventilation is below requirement.'));
 if(!finite(v.infiltrationM3h))findings.push(f('INFILTRATION_UNKNOWN','VERIFICATION_REQUIRED','Infiltration rate is unknown.'));
 // Sensible ventilation approximation: 0.33 W per (m3/h*K); humidity/latent ventilation requires psychrometric model and is not claimed here.
 const ventilation=dT!==null&&finite(v.outsideAirM3h)&&finite(v.infiltrationM3h)?0.33*(v.outsideAirM3h+v.infiltrationM3h)*dT:null;
 const total=ventilation!==null?conductive+solar+sensible+latent+ventilation:null;
 let installed=0;
 (m.equipment||[]).forEach(u=>{
  if(!finite(u.coolingCapacityW)||!finite(u.inputPowerW)||!finite(u.airflowM3h))findings.push(f('HVAC_UNIT_DATA_UNKNOWN','VERIFICATION_REQUIRED','HVAC unit capacity/power/airflow is incomplete.',[u.unitId]));
  else installed+=u.coolingCapacityW;
  if(!u.condensateDrainRouteId)findings.push(f('CONDENSATE_ROUTE_REQUIRED','VERIFICATION_REQUIRED','HVAC condensate drain route is missing.',[u.unitId]));
  if(u.serviceAccess!==true)findings.push(f('HVAC_SERVICE_ACCESS_REQUIRED','VERIFICATION_REQUIRED','HVAC service access is not verified.',[u.unitId]));
  if(u.ventilationClearanceVerified!==true)findings.push(f('HVAC_CLEARANCE_REQUIRED','VERIFICATION_REQUIRED','HVAC ventilation/thermal clearance is not verified.',[u.unitId]));
 });
 if(total!==null&&installed<total)findings.push(f('COOLING_CAPACITY_INSUFFICIENT','FAIL','Installed cooling capacity is below calculated foundation cooling load.'));
 const status=findings.some(x=>x.severity==='FAIL')?'FAIL':findings.some(x=>x.severity==='VERIFICATION_REQUIRED')?'VERIFICATION_REQUIRED':findings.some(x=>x.severity==='WARNING')?'WARNING':'PASS';
 return{status,findings,results:{conductiveLoadW:conductive,solarLoadW:solar,internalSensibleW:sensible,internalLatentW:latent,ventilationLoadW:ventilation,totalCoolingLoadW:total,installedCoolingCapacityW:installed}};
}
global.ObjectWeaveThermalLoadValidator={calculate};
})(typeof window!=='undefined'?window:globalThis);
