var margin1 = {top: 100, right: 10, bottom: 30, left: 200},
    width1 = 650 - margin1.left - margin1.right,
    height1 = 175 - margin1.top - margin1.bottom;

var margin2 = {top: 20, right: 10, bottom: 20, left: 10},
    width2 = 600 - margin2.left - margin2.right,
    height2 = 600 - margin2.top - margin2.bottom;

var x1 = d3.scaleLinear().range([0, width1]);
var y1 = d3.scaleLinear().range([0, height1]);
var z1 = d3.scaleOrdinal()
	.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var x2 = d3.scaleLinear().range([0, width2]);
var y2 = d3.scaleLinear().range([height2, 0]);

var svg1 = d3.select("#chart1").append("svg")
    .attr("width", width1 + margin1.left + margin1.right)
    .attr("height", height1 + margin1.top + margin1.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

var svg2 = d3.select("#chart2").append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");  

var comparadores = [];    
var variables = [];
var scatterplot = [];

function createMatrix(data, svg, x, y, z) {
	var fnAccX = function(d) { return d.posX; };
    var fnAccY = function(d) { return d.posY; };

	x.domain([0, d3.max(data, fnAccX)]);
	y.domain([0, d3.max(data, fnAccY)]);

	var h = 20;

	var rects = svg.selectAll(".bars")
	  	.data(data)
		.enter().append("rect")
			.attr("class", "bars")
			.attr("x", function (d) {return x(fnAccX(d));})
		  	.attr("y", function (d) {return y(fnAccY(d));})
		  	.style("fill", function (d) {return z(d.pearson);})
		  	.attr("height", h)
			.attr("width", h)
			.on("mouseover", function(){console.log("h");})	
			.on("click", function(d){
				createScatterplot(d.Variable1, d.Variable2, svg2, x2, y2);
			});	     
}

function createScatterplot(attrX, attrY, svg, x, y) {

	var xAxis = d3.axisTop(x);
	var yAxis = d3.axisRight(y); 

	var fnAccX = function(d) { return d.attrX; };
    var fnAccY = function(d) { return d.attrY; };

	x.domain([0, d3.max(scatterplot, function(d) { return d[attrX]; })]);
	console.log(d3.max(scatterplot, function(d) { return d[attrX]; }));
  	y.domain([0, d3.max(scatterplot, function(d) { return d[attrY]; })]);

	svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + height2 + ")")
	  .call(xAxis)
	.append("text")
	  .attr("class", "label")
	  .attr("x", width2)
	  .attr("y", -6)
	  .style("text-anchor", "end")
	  .text("Sepal Width (cm)");

	svg.append("g")
	  .attr("class", "y axis")
	  .call(yAxis)
	.append("text")
	  .attr("class", "label")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 6)
	  .attr("dy", ".71em")
	  .style("text-anchor", "end")
	  .text("Sepal Length (cm)")

	var dots = svg.selectAll(".dot")
	  .data(scatterplot);

	var dotsEnter = dots.enter()
	  .append("circle");

	dots.merge(dotsEnter)
	  .attr("class", "dot")
	  .attr("r", 3.5)
	  .attr("cx", function(d) {	return x(d[attrX]); })
	  .attr("cy", function(d) { return y(d[attrY]); })
	  .style("fill", function(d) { return "#000000"; });
}

d3.csv("/docs/results.csv", function(err, correlation) {
	if(err) {
		console.err(err);    
	return;
	}
	var var1 = {};
	var var2 = {};

	correlation.forEach(function (item) {
		var1[item.Variable1] = true;
		var2[item.Variable2] = true;		
		item.pendiente =+ item.pendiente;
		item.intercepto =+ item.intercepto;
		item.pearson =+ item.pearson;
	});
	
	comparadores = Object.keys(var1);
	variables = Object.keys(var2);

	correlation.forEach(function (item) {
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
			item[key] = + item[key];
		}
	});
	scatterplot = data;
});


