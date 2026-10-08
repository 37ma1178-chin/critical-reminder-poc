(function (global) {
  'use strict';

  function hasKnownDimensions(c) {
    const d = c && c.dimensionsMm;
    return !!d && [d.length, d.width, d.height].every(v => Number.isFinite(v) && v > 0);
  }

  function truthAllowsEngineeringPass(c) {
    return c && !['UNKNOWN', 'ESTIMATED'].includes(c.truthClass || 'UNKNOWN');
  }

  function featureCategoryMap(features) {
    const map = {
      tv: 'TV', fridge: 'REFRIGERATOR', microwave: 'MICROWAVE', ac: 'AIR_CONDITIONER',
      battery: 'BATTERY', inverter: 'INVERTER', solar: 'SOLAR_PANEL',
      freshWater: 'FRESH_WATER_TANK', greyWater: 'GREY_WATER_TANK', blackWater: 'BLACK_WATER_TANK',
      wc: 'WC', seating: 'SEAT', recliners: 'RECLINER', sofaBed: 'SOFA_BED', bed: 'BED', wetArea: 'WET_AREA'
    };
    return Object.keys(features || {}).filter(k => features[k] === true && map[k]).map(k => map[k]);
  }

  function evaluate(component, context) {
    const reasons = [];
    let status = 'COMPATIBLE';
    if (!component) return { status: 'INCOMPATIBLE', reasons: ['MISSING_COMPONENT'] };

    if (component.type === 'FIXED_SKU') {
      if (!hasKnownDimensions(component)) reasons.push('UNKNOWN_ENGINEERING_DIMENSIONS');
      if (!truthAllowsEngineeringPass(component)) reasons.push('UNVERIFIED_ENGINEERING_FACTS');
    }

    const compat = component.compatibility || {};
    if (compat.donorVehicleIds && compat.donorVehicleIds.length && context.donorVehicleId && !compat.donorVehicleIds.includes(context.donorVehicleId)) reasons.push('DONOR_VEHICLE_NOT_LISTED');
    if (compat.physicalStates && compat.physicalStates.length && context.physicalState && !compat.physicalStates.includes(context.physicalState)) reasons.push('PHYSICAL_STATE_NOT_SUPPORTED');

    const c = compat.constraints || {};
    if (Number.isFinite(c.maxMassKg) && Number.isFinite(component.massKg) && component.massKg > c.maxMassKg) reasons.push('MASS_LIMIT_EXCEEDED');
    if (Number.isFinite(c.voltageV) && component.electrical && Number.isFinite(component.electrical.voltageV) && component.electrical.voltageV !== c.voltageV) reasons.push('VOLTAGE_MISMATCH');
    if (Number.isFinite(c.maxPowerW) && component.electrical && Number.isFinite(component.electrical.powerW) && component.electrical.powerW > c.maxPowerW) reasons.push('POWER_LIMIT_EXCEEDED');
    if (Number.isFinite(context.budgetRemainingInr) && component.priceObservation && Number.isFinite(component.priceObservation.amount) && component.priceObservation.amount > context.budgetRemainingInr) reasons.push('BUDGET_EXCEEDED');

    if (reasons.some(r => ['DONOR_VEHICLE_NOT_LISTED','PHYSICAL_STATE_NOT_SUPPORTED','MASS_LIMIT_EXCEEDED','VOLTAGE_MISMATCH','POWER_LIMIT_EXCEEDED','BUDGET_EXCEEDED'].includes(r))) status = 'INCOMPATIBLE';
    else if (reasons.length) status = 'VERIFICATION_REQUIRED';

    return { status, reasons };
  }

  function select(catalogue, requirementSet, context) {
    const required = new Set(featureCategoryMap((requirementSet || {}).features));
    return (catalogue || []).filter(c => required.has(c.category)).map(c => ({ component: c, evaluation: evaluate(c, context || {}) }));
  }

  function assertFixedGeometry(component, requestedDimensionsMm) {
    if (!component || component.type !== 'FIXED_SKU') return { ok: true };
    if (!hasKnownDimensions(component)) return { ok: false, reason: 'UNKNOWN_ENGINEERING_DIMENSIONS' };
    const d = component.dimensionsMm;
    const same = requestedDimensionsMm && d.length === requestedDimensionsMm.length && d.width === requestedDimensionsMm.width && d.height === requestedDimensionsMm.height;
    return same ? { ok: true } : { ok: false, reason: 'FIXED_SKU_SCALING_FORBIDDEN' };
  }

  global.ObjectWeaveComponentSelector = { evaluate, select, assertFixedGeometry, hasKnownDimensions };
})(typeof window !== 'undefined' ? window : globalThis);
