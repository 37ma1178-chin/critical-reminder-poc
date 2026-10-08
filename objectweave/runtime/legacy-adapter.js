(function(global){'use strict';
function fromLegacy(spec){
 if(!spec||!spec.body) throw new Error('Missing donor body specification');
 const a=spec.assumptions||{};
 return {
  schemaVersion:'0.2.0',
  donorVehicleId:'force-urbania-dx-4400-16d-prototype',
  digitalTwinId:'dt-force-urbania-4400-16d-v0',
  units:'mm',
  coordinateSystem:{x:'rear_to_front',y:'centerline_positive_right',z:'ground_up'},
  body:{
   overallLengthMm:spec.body.length,
   overallWidthMm:spec.body.width,
   overallHeightMm:spec.body.height,
   wheelbaseMm:spec.body.wheelbase,
   groundClearanceMm:spec.body.ground_clearance
  },
  ratings:{gvwKg:spec.body.gvw_kg},
  estimated:{
   cabDepthMm:a.cab_depth??null,
   interiorWallThicknessMm:a.interior_wall_thickness??null,
   floorHeightMm:a.floor_height??null,
   wheelHousing:a.wheel_housing||null,
   profile:a.profile||null
  },
  sourceLegacy:spec
 };
}
global.ObjectWeaveLegacyAdapter={fromLegacy};
})(window);
