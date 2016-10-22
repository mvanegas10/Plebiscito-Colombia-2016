var margin1 = {top: 50, right: 7, bottom: 90, left: 100},
    width1 = 650 - margin1.left - margin1.right,
    height1 = 185 - margin1.top - margin1.bottom;

var margin2 = {top: 20, right: 10, bottom: 50, left: 110},
    width2 = 550 - margin2.left - margin2.right,
    height2 = 500 - margin2.top - margin2.bottom;

var x1 = d3.scaleLinear().range([0, width1 - 100]);
var y1 = d3.scaleLinear().range([0, height1]);
var z1 = d3.scaleSequential(d3.interpolateRdBu);

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

function createMatrix(data, svg, x, y, z) {

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
      .attr('x', function (d) {
      	console.log(d)
      	return x(fnAccX(d));})
      .attr('y', -6)
      .text(function (d) { return d.Variable1;});

    hover.append('text')
      .attr('x', -50)
      .attr('y', function (d) {return y(fnAccY(d));})
      .text(function (d) { return d.Variable2;});

	svg.selectAll(".bars")
	  	.data(data)
		.enter().append("rect")
		.attr("class", "bars")
		.attr("x", function (d) {return x(fnAccX(d));})
	  	.attr("y", function (d) {return y(fnAccY(d));})
	  	.style("fill", function (d) {return z(d.pearson);})
	  	.attr("height", h)
		.attr("width", h)
		.on("click", function(d){
			updateLabels(svg, [{"text": d.Variable2, "posX": d3.mouse(this)[0]}]);
			createScatterplot(d.Variable1, d.Variable2, x2, y2, z2);
		});

	svg.selectAll(".p")
		.data([{"text":"Abstención", "posY":13},{"text":"Porcentaje Si", "posY":36},{"text":"Porcentaje No", "posY":59}])
		.enter()
		.append("text")
		.attr("class", "p")								
		.attr("x", -10)
		.attr("y", function (d) {return d.posY;})
		.style("text-anchor", "end")
		.text(function (d) { return d.text;});			
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
		.attr("y", height1 + 30)
		.style("text-anchor", "middle")
		.text(function (d) { return d.text;});		
}

function createScatterplot(attrX, attrY, x, y, z) {

	d3.select("#chart2").html("");
  	d3.select("#chart2").selectAll("*").remove();

  	var svg = d3.select("#chart2").append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");  

	var xAxis = d3.axisBottom(x);
	var yAxis = d3.axisLeft(y); 

	x.domain([0, d3.max(scatterplot, function(d) { return d[attrX]; })]);
  	y.domain([0, d3.max(scatterplot, function(d) { return d[attrY]; })]);

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
	  .data(scatterplot);

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
	createMatrix(correlation, svg1, x1, y1, z1);
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
			else item[key] = item[key];
		}		
	});
	scatterplot = data;
	createScatterplot("Porcentaje No", "Porcentaje de Oscar Ivan Zuluaga (2da vuelta)", x2, y2, z2);

});


$.getJSON("colombia.json",function(colombia){
	var map = L.map('map', { zoomControl:false }).setView([4, -72], 5.8);
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
	          fillColor: "#000",
	          fillOpacity: 1
	        };
	      },
	      onEachFeature: function (feature, layer) {
	    		layer.on({
	        	click: function(e) {
				console.log(feature);
	            // selectedCountry(e.target.feature.properties.indicators);
	          }
	    		});
				},
	    });
	    layer.addTo(map);
	    var legend = L.control({
	    	position: 'bottomleft'
	    });
	    legend.onAdd = function() {
	    	var div = L.DomUtil.create('div', 'legend'),
	      	values = [10,20,30,40,50,60,70,80,90];
	      div.innerHTML += 'EPI SCORE<br>';
	      for (var i = 0; i < values.length; i++) {
	      	div.innerHTML +=
	        	'<i style="background:' + "#000" + '"></i> '+ values[i] + (values[i + 1] ? ' &ndash; ' + values[i + 1] +'<br>' : '+');
	      }
	      return div;
	    };
	    legend.addTo(map);
});
