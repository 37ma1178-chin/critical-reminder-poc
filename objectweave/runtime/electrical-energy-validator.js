(function (global) {
  'use strict';
  const finite = v => Number.isFinite(v) && v >= 0;
  const f = (code,severity,message,refs=[]) => ({code,severity,message,refs});

  function calculate(model) {
    const findings=[];
    if (!model) return {status:'FAIL',findings:[f('ENERGY_MODEL_MISSING','FAIL','Electrical energy model is missing.')],results:null};
    const loads=model.loads||[];
    if (!loads.length) findings.push(f('LOAD_LIST_EMPTY','VERIFICATION_REQUIRED','No electrical loads are defined.'));
    let daily=0, continuous=0, surge=0;
    loads.forEach(l=>{
      if (!finite(l.powerW)) findings.push(f('LOAD_POWER_UNKNOWN','VERIFICATION_REQUIRED','Load power is unknown.',[l.id]));
      if (!finite(l.hoursPerDay)) findings.push(f('LOAD_RUNTIME_UNKNOWN','VERIFICATION_REQUIRED','Load runtime is unknown.',[l.id]));
      if (!finite(l.dutyCycle) || l.dutyCycle>1) findings.push(f('LOAD_DUTY_UNKNOWN','VERIFICATION_REQUIRED','Load duty cycle is unknown/invalid.',[l.id]));
      if (!Number.isInteger(l.quantity) || l.quantity<1) findings.push(f('LOAD_QUANTITY_INVALID','FAIL','Load quantity is invalid.',[l.id]));
      if (finite(l.powerW) && finite(l.hoursPerDay) && finite(l.dutyCycle) && l.dutyCycle<=1 && Number.isInteger(l.quantity) && l.quantity>0) {
        daily += l.powerW*l.hoursPerDay*l.dutyCycle*l.quantity;
        continuous += l.powerW*l.quantity;
        surge += (finite(l.surgePowerW)?l.surgePowerW:l.powerW)*l.quantity;
      }
    });
    const scenario=model.scenario||{};
    if (!finite(scenario.autonomyHours)) findings.push(f('AUTONOMY_UNKNOWN','VERIFICATION_REQUIRED','Required autonomy is unknown.'));
    const storage=model.storage||{};
    if (!finite(storage.usableFraction) || storage.usableFraction<=0 || storage.usableFraction>1) findings.push(f('USABLE_FRACTION_UNKNOWN','VERIFICATION_REQUIRED','Battery usable fraction must be known and >0 <=1.'));
    const conv=model.conversion||{};
    if (!finite(conv.inverterEfficiency) || conv.inverterEfficiency<=0 || conv.inverterEfficiency>1) findings.push(f('INVERTER_EFFICIENCY_UNKNOWN','VERIFICATION_REQUIRED','Inverter efficiency must be known.'));

    const blocking=findings.some(x=>x.severity==='FAIL'||x.severity==='VERIFICATION_REQUIRED');
    const autonomyDays=finite(scenario.autonomyHours)?scenario.autonomyHours/24:null;
    const requiredUsable=autonomyDays===null?null:daily*autonomyDays;
    const requiredNominal=requiredUsable!==null && finite(storage.usableFraction) && storage.usableFraction>0 ? requiredUsable/storage.usableFraction : null;

    const solar=(model.sources||{}).solar||{};
    const solarWh=finite(solar.arrayRatedW)&&finite(solar.peakSunHours)&&finite(solar.systemEfficiency)?solar.arrayRatedW*solar.peakSunHours*solar.systemEfficiency:null;
    const alt=(model.sources||{}).alternator||{};
    const altWh=finite(alt.chargePowerW)&&finite(alt.hoursPerDay)?alt.chargePowerW*alt.hoursPerDay:null;
    const generation=(solarWh||0)+(altWh||0);
    const balance=(solarWh!==null||altWh!==null)?generation-daily:null;

    if (finite(conv.inverterContinuousW) && continuous>conv.inverterContinuousW) findings.push(f('INVERTER_CONTINUOUS_EXCEEDED','FAIL','Connected load exceeds inverter continuous rating.'));
    if (finite(conv.inverterSurgeW) && surge>conv.inverterSurgeW) findings.push(f('INVERTER_SURGE_EXCEEDED','FAIL','Calculated surge exceeds inverter surge rating.'));
    if (finite(storage.nominalCapacityWh) && requiredNominal!==null && storage.nominalCapacityWh<requiredNominal) findings.push(f('STORAGE_INSUFFICIENT','FAIL','Installed nominal storage is below scenario requirement.'));
    if (balance!==null && balance<0) findings.push(f('DAILY_ENERGY_DEFICIT','WARNING','Known daily generation is below calculated daily load; shore charging or additional generation/storage strategy is required.'));

    const status=findings.some(x=>x.severity==='FAIL')?'FAIL':findings.some(x=>x.severity==='VERIFICATION_REQUIRED')?'VERIFICATION_REQUIRED':findings.some(x=>x.severity==='WARNING')?'WARNING':blocking?'VERIFICATION_REQUIRED':'PASS';
    return {status,findings,results:{dailyLoadWh:daily,peakContinuousLoadW:continuous,peakSurgeLoadW:surge,requiredUsableStorageWh:requiredUsable,requiredNominalStorageWh:requiredNominal,estimatedSolarWhPerDay:solarWh,estimatedAlternatorWhPerDay:altWh,dailyEnergyBalanceWh:balance}};
  }
  global.ObjectWeaveElectricalEnergyValidator={calculate};
})(typeof window!=='undefined'?window:globalThis);
