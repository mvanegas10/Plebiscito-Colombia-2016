var margin1 = {top: 50, right: 7, bottom: 90, left: 100},
    width1 = 650 - margin1.left - margin1.right,
    height1 = 185 - margin1.top - margin1.bottom;

var margin2 = {top: 20, right: 10, bottom: 50, left: 110},
    width2 = 550 - margin2.left - margin2.right,
    height2 = 500 - margin2.top - margin2.bottom;

var x1 = d3.scaleLinear().range([0, width1 - 100]);
var y1 = d3.scaleLinear().range([0, height1]);
var z1 = d3.scaleSequential(d3.interpolatePuOr);

var x2 = d3.scaleLinear().range([0, width2]);
var y2 = d3.scaleLinear().range([height2, 0]);
var z2 = d3.scaleSequential(d3.interpolatePuBuGn);

var svg1 = d3.select("#chart1").append("svg")
	.attr("width", width1 + margin1.left + margin1.right)
	.attr("height", height1 + margin1.top + margin1.bottom)
		.append("g")
	.attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

var comparadores = [];    
var variables = [];
var correlation = [];
var scatterplot = [];
var departamentos = [];
var departamentos_results = [];

function createMatrix(departamento, data, svg, x, y, z) {
    if (departamento !== undefined)	d3.select("#selection").text(departamento);
    else d3.select("#selection").text("Seleccione un departamento");

	var fnAccX = function(d) { return d.posX; };
    var fnAccY = function(d) { return d.posY; };

	x.domain([0, d3.max(data, fnAccX)]);
	y.domain([0, d3.max(data, fnAccY)]);

	var h = 20;

	const hover = svg.append('g')
	  .data(data)
      .attr('class', 'focus')
      .style('display', 'none');   

    hover.append('text')
      .attr('x', function (d) { return x(fnAccX(d));})
      .attr('y', -6)
      .text(function (d) { return d.Variable1;});

    hover.append('text')
      .attr('x', -50)
      .attr('y', function (d) {return y(fnAccY(d));})
      .text(function (d) { return d.Variable2;});

	var rects = svg.selectAll(".bars")
	  	.data(data);

	var rectsEnter = rects.enter()
		.append("rect");

	rects.merge(rectsEnter)	
		.attr("class", "bars")
		.attr("x", function (d) {return x(fnAccX(d));})
	  	.attr("y", function (d) {return y(fnAccY(d));})
	  	.style("fill", function (d) {
			var x = (d.pearson * (1/2)) + 0.5;
	  		return z(x);})
	  	.attr("height", h)
		.attr("width", h)
		.on("click", function(d){
			updateLabels(svg, [{"text": d.Variable2, "posX": d3.mouse(this)[0], "posY": (height1 + 30)},{"text": (d.pearson).toFixed(2), "posX": d3.mouse(this)[0], "posY": -5}]);
			if (departamento !== undefined) {
				var newData = scatterplot.filter(function (e) {
					if (e.Departamento === departamento) return e;
				});
				createScatterplot(newData, d.Variable1, d.Variable2, x2, y2, z2);
			}
			else createScatterplot(scatterplot, d.Variable1, d.Variable2, x2, y2, z2);
		});

	svg.selectAll(".p")
		.data([{"text":"Porcentaje No", "posY":13},{"text":"Porcentaje Sí","posY":36},{"text":"Abstención", "posY":59}])
		.enter()
		.append("text")
		.attr("class", "p")								
		.attr("x", -10)
		.attr("y", function (d) {return d.posY;})
		.style("text-anchor", "end")
		.text(function (d) { return d.text;});

	svg.append("text")
	  .attr("x", width1 - 25)
	  .attr("y", -42)
	  .attr("dy", ".35em")
	  .attr("text-anchor", "middle")
	  .style("font", "10px sans-serif")
	  .text("Coeficiente de");
	svg.append("text")
	  .attr("x", width1 - 25)
	  .attr("y", -32)
	  .attr("dy", ".35em")
	  .attr("text-anchor", "middle")
	  .style("font", "10px sans-serif")
	  .text("correlación");
	svg.append("text")
	  .attr("x", width1 - 25)
	  .attr("y", -22)
	  .attr("dy", ".35em")
	  .attr("text-anchor", "middle")
	  .style("font", "10px sans-serif")
	  .text("de Pearson");	  	  

	var legend = svg.selectAll(".legend")
		.data([1,0.5,0,-0.5,-1])
		.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
			.style("font", "10px sans-serif");

	legend.append("rect")
	  .attr("x", width1 - 18)
	  .attr("y", -15)
	  .attr("width", 18)
	  .attr("height", 18)
	  .attr("fill", function(d) { 
		var x = (d * (1/2)) + 0.5;
	  		return z(x);});

	legend.append("text")
	  .attr("x", width1 - 24)
	  .attr("y", -5)
	  .attr("dy", ".35em")
	  .attr("text-anchor", "end")
	  .text(function(d) { return d; });				
}

function updateLabels(svg, labelsData) {
	var labels = svg.selectAll(".label")
		.data(labelsData);
		
	var labelsEnter = labels.enter()
		.append("text")
		.attr("class", "label");

	labels.exit().remove();

	labels.merge(labelsEnter)									
		.attr("x", function (d) {return d.posX;})
		.attr("y", function (d) {return d.posY;})
		.style("text-anchor", "middle")
		.text(function (d) { return d.text;});		
}

function createScatterplot(data, attrX, attrY, x, y, z) {
	d3.select("#chart2").html("");
  	d3.select("#chart2").selectAll("*").remove();

  	var svg = d3.select("#chart2").append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");  

	var xAxis = d3.axisBottom(x);
	var yAxis = d3.axisLeft(y); 

	x.domain([0, d3.max(data, function(d) { return d[attrX]; })]);
  	y.domain([0, d3.max(data, function(d) { return d[attrY]; })]);

	svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + height2 + ")")
	  .call(xAxis);

	svg.append("text")
	  .attr("class", "label")
	  .attr("x", width2)
	  .attr("y", height2 + 30)
	  .style("text-anchor", "end")
	  .text(attrX);

	svg.append("g")
	  .attr("class", "y axis")
	  .call(yAxis);

	svg.append("text")
	  .attr("class", "label")
	  .attr("transform", "rotate(-90)")
	  .attr("x", 10)
	  .attr("y", 15)
	  .style("text-anchor", "end")
	  .text(attrY);

	var dots = svg.selectAll(".dot")
	  .data(data);

	var dotsEnter = dots.enter()
	  .append("circle");

	dots.merge(dotsEnter)	  
	  .attr("class", "dot")
	  .attr("r", 3.5)
	  .attr("cx", 0)
	  .attr("cy", height2)	  
	  .style("fill", z(1))
      .transition()
      .duration(1000)	  
	  .attr("cx", function(d) {	return x(d[attrX]); })
	  .attr("cy", function(d) { return y(d[attrY]); });

	var corrData = correlation.filter(function (d) {
		if (d.Variable1 === attrX && d.Variable2 === attrY) return d;});
	var pendiente = corrData[0].pendiente;
	var intercepto = corrData[0].intercepto;

	var line_0 = d3.line()
	    .x(0)
	    .y(height2);

	var line = d3.line()
	    .x(function(d) { return x(d); })
	    .y(function(d) { return y((pendiente*d) + intercepto); });

	svg.append("path")
	  .datum([0,1])
	  .attr("class", "line")
	  .attr("d",line_0)
      .transition()
      .duration(1000)	  
	  .attr("d", line);
}

d3.csv("/docs/results.csv", function(err, data) {
	if(err) {
		console.err(err);    
	return;
	}

	var var1 = {};
	var var2 = {};

	data.forEach(function (item) {		
		item.Variable1 = item.Variable1.trim();		
		item.Variable2 = item.Variable2.trim();	
		var1[item.Variable1] = true;
		var2[item.Variable2] = true;			
		item.pendiente =+ item.pendiente;
		item.intercepto =+ item.intercepto;
		item.pearson =+ item.pearson;
	});
	
	comparadores = Object.keys(var1);
	variables = Object.keys(var2);

	data.forEach(function (item) {
		for (var i = 0; i < comparadores.length; i++) {
			if (comparadores[i] === item.Variable1) {
				item.posY = i;				
			}
		}
		for (var i = 0; i < variables.length; i++) {
			if (variables[i] === item.Variable2) {
				item.posX = i;
			}
		}
	});

	correlation = data;
	createMatrix(undefined, correlation, svg1, x1, y1, z1);
});

d3.csv("/docs/plebiscito.csv", function(err, data) {
	if(err) {
		console.err(err);    
	return;
	}
	var var1 = {};
	var var2 = {};

	data.forEach(function (item) {
		for (var key in item) {
			if (key !== "Municipio" && key !== "Departamento") item[key] = + item[key];
			else item[key] = item[key].trim();
		}		
	});
	scatterplot = data;
	createScatterplot(scatterplot, "PorcentajeNo", "PorcentajeOscarIvanZuluagaSegundaVuelta", x2, y2, z2);

});

d3.csv("/docs/departamentos.csv", function(err, data) {
	if(err) {
		console.err(err);    
	return;
	}
	departamentos = data;
});

d3.csv("/docs/departamentos_results.csv", function(err, data) {
	if(err) {
		console.err(err);    
	return;
	}
	data.forEach(function (item) {
		for (var key in item) {
			if (key !== "Variable1" && key !== "Variable2" && key !== "Departamento") item[key] = + item[key];
			else item[key] = item[key].trim();
		}		
		for (var i = 0; i < comparadores.length; i++) {
			if (comparadores[i] === item.Variable1) {
				item.posY = i;				
			}
		}
		for (var i = 0; i < variables.length; i++) {
			if (variables[i] === item.Variable2) {
				item.posX = i;
			}
		}
	});

	departamentos_results = data;
});

$.getJSON("/docs/colombia.json",function(colombia){
	colombia.features.forEach(function(d){
	    departamentos.forEach(function (e){
	        if(e.Departamento.toUpperCase().indexOf(d.properties.NOMBRE_DPT) !== -1){
	        	d.properties.indicators = {};
	        	for (key in e) {
	        		if (key !== "Departamento") d.properties.indicators[key] = + e[key];
	        		else d.properties.indicators[key] = e[key];
	        	}
       		}
      	})
    });	          

	var map = L.map('map', { zoomControl:false }).setView([4, -73.5], 5.6);
	    map.dragging.disable();
	    map.scrollWheelZoom.disable();
		var layer = L.geoJson(colombia, {
			clickable: true,
			style: function(feature) {
		        return {
		          stroke: true,
		          color: "#0d174e",
		          weight: 1,
		          fill: true,
		          fillColor: setColor(-1,1,feature.properties.indicators,"Resultado plebiscito", undefined,true),
		          fillOpacity: 1
		        };
		    },
			onEachFeature: function (feature, layer) {
				layer.on({
					click: function(e) { 
						var depto = e.target.feature.properties.indicators.Departamento;
						var dataMatrix = departamentos_results.filter(function (d) {
							if (d.Departamento === depto) return d;
						});
						createMatrix(depto, dataMatrix, svg1, x1, y1, z1);
						console.log(e);},
					mouseover: function (e) { 
						var indicators = e.target.feature.properties.indicators;
						var ganador = (indicators["Resultado plebiscito"] > 0)? "Sí": "No";
						var porcentaje = (ganador === "Sí")? indicators["Resultado plebiscito"]: -indicators["Resultado plebiscito"];
						this.bindPopup(indicators.Departamento + '<br>' + ganador + ": " + porcentaje);
						this.openPopup();
					},
					mouseout: function (e) { this.closePopup();},
				});    	
			}
	    });
	    layer.addTo(map);
	    var legend = L.control({
	    	position: 'bottomright'
	    });
	    legend.onAdd = function() {
	    	var div = L.DomUtil.create('div', 'legend'),
	      	values = [1,0.5,0,-0.5,-1];
	      	labels = ["Sí","","Empate","","No"];
	      div.innerHTML += 'Resultado plebiscito<br>';
	      for (var i = 0; i < values.length; i++) {
	      	div.innerHTML +=
	        	'<i style="background:' + setColor(-1,1,undefined,undefined,values[i], false) + '"></i> '+ labels[i] + '<br>';
	      }
	      return div;
	    };
    	legend.addTo(map);
	}
);

function setColor (init, fin, indicators, key, value, map) {
	if (value !== undefined) {
		var x = (value * (1/2)) + 0.5;
		return d3.scaleSequential(d3.interpolateRdBu)(x);
	}  
	else if (indicators !== undefined && map) {
		var x = (indicators[key] * (1/2)) + 0.5;
		return d3.scaleSequential(d3.interpolateRdBu)(x);
	}
	else if (indicators !== undefined && !map) {
		var x = (indicators[key] * (1/2)) + 0.5;
		return d3.scaleSequential(d3.interpolatePuOr)(x);
	} 
}
