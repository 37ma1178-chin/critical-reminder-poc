(function (global) {
  'use strict';

  const known = v => Number.isFinite(v) && v >= 0;

  function finding(code, severity, message, refs) {
    return { code, severity, message, refs: refs || [] };
  }

  function calculate(model) {
    const findings = [];
    if (!model) return { status:'FAIL', findings:[finding('MASS_MODEL_MISSING','FAIL','Mass model is missing.')] };
    const wb = model.wheelbaseMm;
    const base = model.baseVehicle || {};
    const all = [].concat(model.items || [], model.fluids || [], model.occupants || []);

    if (!known(model.ratings && model.ratings.gvwKg)) findings.push(finding('GVW_UNKNOWN','VERIFICATION_REQUIRED','GVW must be verified before mass PASS.'));
    if (!known(base.massKg)) findings.push(finding('BASE_MASS_UNKNOWN','VERIFICATION_REQUIRED','Base/converted starting mass is unknown.'));
    if (!known(wb) || wb === 0) findings.push(finding('WHEELBASE_UNKNOWN','VERIFICATION_REQUIRED','Wheelbase is required for axle-load calculation.'));

    all.forEach(i => {
      if (!known(i.massKg)) findings.push(finding('ITEM_MASS_UNKNOWN','VERIFICATION_REQUIRED','Item mass is unknown.',[i.id]));
      if (!Number.isFinite(i.cgXmm)) findings.push(finding('ITEM_CG_UNKNOWN','VERIFICATION_REQUIRED','Item longitudinal centre of gravity is unknown.',[i.id]));
    });

    if (findings.some(f => f.severity === 'VERIFICATION_REQUIRED')) return { status:'VERIFICATION_REQUIRED', findings, results:null };

    let totalMass = base.massKg;
    let moment = Number.isFinite(base.cgXmm) ? base.massKg * base.cgXmm : null;
    if (moment === null) return { status:'VERIFICATION_REQUIRED', findings:findings.concat(finding('BASE_CG_UNKNOWN','VERIFICATION_REQUIRED','Base vehicle longitudinal centre of gravity is unknown.')), results:null };
    all.forEach(i => { totalMass += i.massKg; moment += i.massKg * i.cgXmm; });
    const cgX = totalMass ? moment / totalMass : 0;

    // Coordinate convention for this solver: x=0 at front axle, x=wheelbase at rear axle.
    const rearAxle = totalMass * cgX / wb;
    const frontAxle = totalMass - rearAxle;
    const gvw = model.ratings.gvwKg;
    const payloadRemaining = gvw - totalMass;
    const frontRating = model.ratings.frontAxleRatingKg;
    const rearRating = model.ratings.rearAxleRatingKg;

    if (totalMass > gvw) findings.push(finding('GVW_EXCEEDED','FAIL','Calculated vehicle mass exceeds GVW.'));
    if (known(frontRating) && frontAxle > frontRating) findings.push(finding('FRONT_AXLE_EXCEEDED','FAIL','Calculated front axle load exceeds rating.'));
    if (known(rearRating) && rearAxle > rearRating) findings.push(finding('REAR_AXLE_EXCEEDED','FAIL','Calculated rear axle load exceeds rating.'));
    if (!known(frontRating)) findings.push(finding('FRONT_AXLE_RATING_UNKNOWN','VERIFICATION_REQUIRED','Front axle rating is unknown.'));
    if (!known(rearRating)) findings.push(finding('REAR_AXLE_RATING_UNKNOWN','VERIFICATION_REQUIRED','Rear axle rating is unknown.'));
    if (cgX < 0 || cgX > wb) findings.push(finding('CG_OUTSIDE_AXLE_SPAN','WARNING','Calculated longitudinal CG lies outside the axle span; verify coordinates and loading.'));

    const status = findings.some(f => f.severity === 'FAIL') ? 'FAIL' : findings.some(f => f.severity === 'VERIFICATION_REQUIRED') ? 'VERIFICATION_REQUIRED' : findings.some(f => f.severity === 'WARNING') ? 'WARNING' : 'PASS';
    return { status, findings, results:{totalMassKg:totalMass,payloadRemainingKg:payloadRemaining,cgXmm:cgX,frontAxleKg:frontAxle,rearAxleKg:rearAxle,frontAxleRemainingKg:known(frontRating)?frontRating-frontAxle:null,rearAxleRemainingKg:known(rearRating)?rearRating-rearAxle:null} };
  }

  function canFreezeLayout(result) {
    return !!result && result.status === 'PASS';
  }

  global.ObjectWeaveMassValidator = { calculate, canFreezeLayout };
})(typeof window !== 'undefined' ? window : globalThis);
