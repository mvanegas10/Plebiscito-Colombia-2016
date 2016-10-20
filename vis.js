var margin = {top: 100, right: 10, bottom: 30, left: 200},
    width = 650 - margin.left - margin.right,
    height = 175 - margin.top - margin.bottom;

var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([0, height]);
var z = d3.scaleOrdinal()
	.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var svg1 = d3.select("#chart1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg2 = d3.select("#chart1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");  

var comparadores = [];    
var variables = [];

function createMatrix(data,cont) {
	var fnAccX = function(d) { return d.posX; };
    var fnAccY = function(d) { return d.posY; };

	x.domain([0, d3.max(data, fnAccX)]);
	y.domain([0, d3.max(data, fnAccY)]);

	var rects = svg1.selectAll(".bars")
	  	.data(data)
		.enter().append("rect")
			.attr("class", "bars")
			.attr("x", function (d) {return x(fnAccX(d));})
		  	.attr("y", function (d) {return y(fnAccY(d));})
		  	.style("fill", function (d) {return z(d.pearson);})
		  	.attr("height", 20)
			.attr("width", 20)
			.on("mouseover", function(){console.log("h");});	     
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

	createMatrix(data);
});


