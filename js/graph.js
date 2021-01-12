
/**
 * Déclaration des variables
**/
width = document.getElementById("container").offsetWidth * 0.90,
midWidth = width / 2,
graphHeight = 600,

/* Largeur des blocs de la légende du graphe */
legendCellWidth = 80,

/* Largeur des blocs du graphe */
barWidth = 80,

/* Espace entre chaque bloc */
barSpace = 2;

/* Police */
fontPolice = "verdana";

/* Tableau des prédictions du niveau des eaux */
seaLevelPerYear = new Map();

/* Ligne du niveau des eaux */
seaLevelLine = null;

/* Echelle de couleur pour la légende du graphe */
const legendColor = ["#002e4d", "#003d66", "#004d80", "#005c99", "#006bb3", "#007acc", "#008ae6", "#0099ff", "#1aa3ff", "#33adff", "#4db8ff", "#66c2ff", "#80ccff", "#99d6ff", "#b3e0ff", "#ccebff", "#e6f5ff"];

const svg = d3.select('#container').append("svg")
	.attr("id", "svg-1")
	.attr("width", 12 * (legendCellWidth + barSpace) + (legendCellWidth) + 10)
	.attr("height", graphHeight + 10)
	.attr("class", "svg");
	
/* Conteneur du graphe */
const graph = svg.append("g")
	.attr("width", width-legendCellWidth)
	.attr("transform", "translate("+legendCellWidth+", 0)");
/* Conteneur de la légende du graphe */
const legend = svg.append("g")
	.attr("width", legendCellWidth);

/**
 * Met à jour la position de la ligne en fonction de la prédiction à la date sélectionnée
**/
function updateSeaLevel() {
	yearSelected = document.getElementById("slider").value;
	
	/* Mise à jour du titre */
	document.getElementById("titleYear").innerHTML = yearSelected;
	
	radios = document.getElementsByName("modeSelected");
	modeSelected = 0;
	
	for (var i = 0, length = radios.length; i < length; i++) {
		if (radios[i].checked)
			modeSelected = radios[i].value;
	}
	
	seaLevelPrediction = seaLevelPerYear.get(yearSelected)[modeSelected];	
	
	yPos = graphHeight - (seaLevelPrediction / 1000) * legendCellHeight;
	
	if($("#svg-1").css("display") == "block") {
		/* Mise à jour de la ligne */
		seaLevelLine
			.attr("y1", yPos)
			.attr("y2", yPos)
			.style("stroke", function(){
				seaLevel = (seaLevelPrediction / 1000).toFixed(0);
				if(seaLevel <= 16)
					return legendColor[seaLevel];
				else
					return legendColor[legendColor.length - 1];
			});
		seaLevelLabel
			.attr("y", yPos - 10)
			.text((seaLevelPrediction / 1000).toFixed(1) + "m");
	}
}

/* Modification du style des légendes / titres */
d3.select("#title")
	.style("text-align", "center")
	.style("padding-top", "30px");

d3.select("#titleYear")
	.style("text-align", "center");

d3.select("#slider")
	.style("width", "350px")
	.style("height", "30px")
	.style("display", "block")
	.style("margin", "auto")
	.on("input", function() {
		updateSeaLevel();
	});
	
d3.select("#radioButtons")
	.style("text-align", "center")
	.style("display", "block")
	.style("margin", "auto")
	.on("input", function() {
		updateSeaLevel();
	});
	
d3.csv(
	"./db/world-countries-elevation.csv"
).then(function (data) {
	
	/* Taille d'une cellule d'un mètre d'altitude */
	legendCellHeight = graphHeight / 35;
	
	/**
	 * Construction de la légende du graphe
	**/
	legend.selectAll("rect")
		.data(d3.range(legendColor.length))
		.enter().append("rect")
			.attr("height", function(d){
				if(d < 16)
					return legendCellHeight;
				else
					return graphHeight - (legendColor.length - 1) * legendCellHeight;
			})
			.attr("width", legendCellWidth)
			.attr("x", 0)
			.attr("y", function(d){
				if(d < 16)
					return graphHeight - (d + 1) * legendCellHeight;
				else
					return 0;
			})
			.style("fill", function(d){return legendColor[d]});
			
	legend.selectAll("text")
		.data(d3.range(legendColor.length))
		.enter().append("text")
			.attr("x", legendCellWidth/2)
			.attr("y", function(d){
				if(d < 16)
					return graphHeight - (d + 1) * legendCellHeight + 12;
				else
					return 0 + 15;
					
			})
			.style("font-size", "12.5")
			.style("font-weight", "bold")
			.style("text-anchor", "middle")
			.style("font-family", fontPolice)
			.text(function(d){
				if(d < 16)
					return d+1+"m";
				else if(d == 16)
					return 35+"m";
				else
					return 50+"m";
			});
			
	/**
	 * Construction du graphe
	**/
	graph.selectAll("rect")
		.data(data)
		.enter().append("rect")
			.attr("x", function(d){return d.id * (barWidth+barSpace)})
			.attr("y", function(d){return graphHeight - d.elevation * legendCellHeight})
			.attr("width", function(d){return barWidth})
			.attr("height", function(d){return d.elevation * legendCellHeight})
			.attr("fill", "#303030");
	
	graph.selectAll("text")
		.data(data)
		.enter().append("text")
			.attr("x", function(d){return d.id * (barWidth+barSpace) + barWidth/2})
			.attr("y", function(d){return graphHeight - d.elevation * legendCellHeight + legendCellHeight/2 + 5})
			.style("fill", "white")
			.style("font-size", "9.5")
			.style("font-weight", "bold")
			.style("text-anchor", "middle")
			.style("font-family", fontPolice)
			.text(function(d){return d.name});
	
	/**
	 * Construction de la droite du niveau des eaux
	**/	
	seaLevelLine = graph.append("line")
		.style("stroke", "#43CCFF")
		.style("stroke-width", 5)
		.attr("x1", 0)
		.attr("y1", graphHeight)
		.attr("x2", (data.length - 1) * (barWidth+barSpace))
		.attr("y2", graphHeight);
		
	seaLevelLabel = graph.append("text")
		.attr("x", (data.length - 1) * (barWidth+barSpace) - barWidth / 2)
		.attr("y", graphHeight - 10)
		.style("fill", "red")
		.style("font-size", "18")
		.style("font-weight", "bold")
		.style("text-anchor", "middle")
		.style("font-family", fontPolice)
		.text("0.0m");
});

d3.csv(
	"./db/sea-level-predictions.csv"
).then(function (data) {
	for(var i= 0; i < data.length; i++)
	{
		predictions = [data[i].predNoCh, data[i].predWorstCh, data[i].predGoodCh]
		seaLevelPerYear.set(data[i].date, predictions);
	}
});