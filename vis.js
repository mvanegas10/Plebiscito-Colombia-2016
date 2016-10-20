var regression = {"Abstencion":{},"Porcentaje Si":{},"Porcentaje No":{}};

d3.csv("/docs/results.csv", function(err, data) {
  if(err) {
  	console.err(err);
    alert(err);
    return;
  }
  data.forEach(function (item) {
  	if (item.Variable1 === "Abstencion") {
  		regression.Abstencion[item.Variable2] = {"pendiente":+ item.pendiente, "intercepto":+ item.intercepto, "pearson":+ item.pearson};
  	}
  });
  console.log(regression);
});