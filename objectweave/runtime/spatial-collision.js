(function(global){
  "use strict";
  function minmax(center,size){return {min:center-size/2,max:center+size/2};}
  function aabb(obj){
    var p=(obj.transform&&obj.transform.positionMm)||[0,0,0], e=obj.envelope||{xMm:0,yMm:0,zMm:0};
    return {x:minmax(p[0],e.xMm),y:minmax(p[1],e.yMm),z:minmax(p[2],e.zMm)};
  }
  function overlap(a,b){return a.min<b.max && a.max>b.min;}
  function intersects(a,b){return overlap(a.x,b.x)&&overlap(a.y,b.y)&&overlap(a.z,b.z);}
  function check(objects,zones){
    var findings=[];
    for(var i=0;i<objects.length;i++) for(var j=i+1;j<objects.length;j++){
      if(intersects(aabb(objects[i]),aabb(objects[j]))){
        findings.push({code:"SPATIAL-COLLISION-001",severity:"ERROR",status:"FAIL",
          message:objects[i].id+" intersects "+objects[j].id});
      }
    }
    for(var k=0;k<objects.length;k++) for(var z=0;z<zones.length;z++){
      if(intersects(aabb(objects[k]),aabb(zones[z])) && zones[z].criticality==="BLOCKING"){
        findings.push({code:"SPATIAL-ZONE-001",severity:"BLOCKER",status:"FAIL",
          message:objects[k].id+" intersects protected zone "+zones[z].id});
      }
    }
    return {status:findings.length?"FAIL":"PASS",findings:findings};
  }
  global.ObjectWeaveSpatialCollision={aabb:aabb,intersects:intersects,check:check};
})(typeof window!=="undefined"?window:this);
