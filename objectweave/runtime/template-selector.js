(function(global){
  "use strict";
  function select(templates,req){
    return (templates||[]).filter(function(t){
      if(req.useIntent!=="UNKNOWN"&&t.useIntent&&t.useIntent!==req.useIntent)return false;
      if(req.occupancy&&t.occupancy&&t.occupancy<req.occupancy)return false;
      return true;
    }).sort(function(a,b){
      var as=(a.features||[]).filter(function(x){return req.features&&req.features[x]===true;}).length;
      var bs=(b.features||[]).filter(function(x){return req.features&&req.features[x]===true;}).length;
      return bs-as;
    });
  }
  global.ObjectWeaveTemplateSelector={select:select};
})(typeof window!=="undefined"?window:this);
