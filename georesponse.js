var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1JNHp2MfQoN5IDa4dOtDJpW9TDXdY12uaPHYo3-RtE_o/pubhtml';
var kyivCompanies = {
	"Ciklum-1": [50.422338, 30.505977],
	"Ciklum-2": [50.438579, 30.523105],
	EPAM: [50.431323, 30.487461],
	"Luxoft-2": [50.450266, 30.410349],
	"Luxoft-3": [50.396239, 30.501601],
	DataArt: [50.459355, 30.496512],
	SoftServe: [50.462448, 30.449534],
	Infopulse: [50.444715, 30.450561],
	GlobalLogic: [50.424638, 30.506538],
	Netcracker: [50.420402, 30.528942],
	"Miratech, Luxoft": [50.447575, 30.422399],
	Innovecs: [50.446572, 30.423697],
	EVO: [50.404759, 30.680041]
};
var lvivCompanies = {
	Ciklum: [49.851229, 23.990175],
	EPAM: [49.842517, 24.001335],
	DataArt: [49.816174, 24.062135],
	"SoftServe-1": [49.811884, 23.989471],
	"SoftServe-2": [49.822696, 23.985750],
	"SoftServe-3": [49.832572, 23.998933],
	GlobalLogic: [49.837612, 24.008485]

};
var kharkivCompanies = {
	Ciklum: [50.027112, 36.220323],
	EPAM: [50.022451, 36.226816],
	DataArt: [49.986469, 36.257071],
	"GlobalLogic, Intetics": [50.020997, 36.217766]
};
var evaluationGradesMapper = {
	'Так':2,
	'Скоріше так': 1,
	'Скоріше ні': -1,
	'Ні': -2,
	'Важко відповісти': 0
};
var townGradesMapper = {
	'Погане': -2,
	'Нормальне':1,
	'Найкраще': 2,
	'Важко відповісти': 0
};
var evaluationColumns = ['liveSuburb', 'liveOkolica', 'isGoodWorkLocation',  'isRented',
	'liveHouse', 'isInvestor', 'isActivist', 'isFreeAppartmentImportant'];
var townGradesColumns= ['likeIrpin', 'likeVishneve', 'likeBucha', 'likeVorzel', 'likeKocubinske',
	'likeBoyarka', 'likeBrovary', 'likeBoryspil', 'likeVyshgorod' ];
	// 'age','job','timestamp', 'geohome', 'geowork', 'comments'];
var jobList = ['Software Developer','Project/Account Manager','BA/QA','Інша ІТ спеціальність','Спеціальність не пов\'язана з ІТ'];
var regionBoundaries = {
	kyiv:[[51.0068, 29.5313], [49.6321, 32.0691]],
	lviv:[[50.0906, 23.4476], [49.4288, 24.6396]],
	kharkiv: [[50.0545, 36.1285], [49.9030, 36.3833]],
	dnipro: [[48.5825, 34.8425],[48.3275, 35.3657]],
	odesa: [[46.5541, 30.6409], [46.3332, 30.7864]]
};
var cityBondaries = {
	lviv: [[49.8803, 23.9502], [49.7861, 24.0867]],
	kyiv: [[50.5298, 30.3889], [50.3770, 30.6992]],
	irpin: [[50.5799, 30.0785], [50.5036, 30.2852]],
};
var colorScale = ['#ff00c8','#c000ff', '#1b00ff', '#0043ff', '#0095ff'];
var counter = 0;
var mainData = filteredData = [], selection;
var showRoutes = showWorkingPlaces = showHomePlaces= true;
var homeMarkersLayer = L.layerGroup();
var workMarkersLayer = L.layerGroup();
var routesLayer = L.layerGroup();
var compLabelsLayer = L.layerGroup();
var filterform = document.forms.filters;
var highlightform = document.forms.highlights;
var locationElem = filterform.elements.location;
var jobElem = filterform.elements.job;
var evalElem = highlightform.elements.evaluation;
var jobHighlightElem = highlightform.elements.jobhighlight;
var evaluationSelector = d3.select("#evaluationSelector");
var jobHiglightSelector = d3.select("#jobhighlightSelector");
var jobFilterSelector = d3.select("#filterByJob");


evaluationColumns.forEach(function(i) {
	evaluationSelector
		.append("option")
		.attr("value", i)
		.text(i)
});
jobList.forEach(i => {
	jobHiglightSelector
		.append("option")
		.attr("value", i)
		.text(i)
	jobFilterSelector
		.append("option")
		.attr("value", i)
		.text(i)
});
locationElem.forEach(item=>item.onclick = switchFilter);
jobElem.onchange = switchFilter;

/**Add Companies Labels depending on map Zoom */
map.on('zoomend', function (e) {
	if (showWorkingPlaces) {
		if (e.target._zoom < 12) {
			compLabelsLayer.clearLayers();
		} else {
			addCompaniesLabels(kyivCompanies);
			addCompaniesLabels(lvivCompanies);
			addCompaniesLabels(kharkivCompanies);
			map.addLayer(compLabelsLayer);
		}
	}
});

/**Get main data from tablesheet*/
d3.csv('./finalPollResults.csv', row, function(error, data) {
	mainData = data.filter(function(d){return !(d.distance && d.distance > 150)});
	filteredData = mainData;
	draw();
});

function draw(field) {
	var data = filteredData;
	if (selection) data = data.sort((b,a)=>(a[selection]-b[selection]));

	data.forEach(function(d) {
		/**Draw Routes */
		if (d.geohome && d.geowork && showRoutes) {
			var polylineOptions = {
				lineCap: 'round',
				color: '#999',
				//dashArray: "10, 2",
				weight: 1,
				opacity: 0.4
			};
			var polyline = L.polyline([d.geohome, d.geowork], polylineOptions);
			routesLayer.addLayer(polyline);
		}

		/**Draw Work Markers */
		if (d.geowork && showWorkingPlaces) {
			var iconWork = L.divIcon({className: 'work-label'});
			var workMark = L.marker(d.geowork, {icon: iconWork, riseOnHover: true});
			workMarkersLayer.addLayer(workMark);
		}

		/**Draw home Markers */
		if (d.geohome && showHomePlaces ) {
			var grade = getGrade(d, field);
			var iconHome = L.divIcon({className: `home-label grade_${grade}`});
			var homeMark = L.marker(d.geohome, {icon: iconHome, riseOnHover: true, zIndexOffset: 5 + grade});
			//workMark.bindTooltip(d);
			homeMark.bindTooltip(getHomeTooltipContent(d), {className: 'home-tooltip'});
			homeMarkersLayer.addLayer(homeMark);
		}
	});

	map.addLayer(homeMarkersLayer);
	map.addLayer(workMarkersLayer);
	map.addLayer(routesLayer);

}
function getGrade(d, field) {
	return field === 'eval' ? d[selection]: d.job === selection ? 2 : -2 ;
}
function splitCoord(string) {
	if (!string) return null;
	var splitted = string.split("|");
	if (!splitted[1]) splitted = string.split(", ");
	if (!splitted[1]) splitted = string.split(",");
	var isValid = splitted.length === 2 && !isNaN(splitted[1]) && !isNaN(splitted[0]);
	return isValid ? splitted : null;
}
function isInBorders(borders, coords) {
	var isCity = +coords[0] < borders[0][0] && +coords[0] > borders[1][0]
		&& +coords[1] > borders[0][1] && +coords[1] < borders[1][1];
	return isCity;
}

function row(d) {
	evaluationColumns.forEach(function(item) {
		d[item] = evaluationGradesMapper[d[item]] || -10;
	});
	townGradesColumns.forEach(function(item) {
		d[item] = townGradesMapper[d[item]] || -10;
	});
	d.geohome = splitCoord(d.geohome);
	d.geowork = splitCoord(d.geowork);
	if(d.geohome) {
		for (var region in regionBoundaries) {
			if (isInBorders(regionBoundaries[region], d.geohome)) d.region = region;
		}
		for (var city in cityBondaries) {
			if (isInBorders(cityBondaries[city], d.geohome)) d.city = city;
		}
		var isSuburb = ((d.region == 'kyiv' || d.region == 'lviv') && !(d.city && d.city != 'irpin'));
		d.isSuburb = isSuburb;
	};
	if (d.geohome && d.geowork) {
		d.distance = Math.round(L.latLng(d.geohome).distanceTo(d.geowork)/1000);
	}
	//d.liveHouse = evaluationGradesMapper[d.liveHouse];
	//d.liveSuburb = evaluationGradesMapper[d.liveHouse];
	d.age = +d.age;
	//d.quantity= 1;
//console.log(d.liveHouse, evaluationGradesMapper[d.liveHouse], evaluationGradesMapper);
	return d;
}
function addCompaniesLabels(labelsList) {
	for (var key in labelsList) {
		var coord = labelsList[key];
		var icon = L.divIcon({className: 'comp-label'});
		var compLabel = L.marker(coord, {icon: icon, zIndexOffset: 3});
		compLabel.bindTooltip(key, {permanent: true, className: 'comp-label-tooltip'});
		compLabelsLayer.addLayer(compLabel);
	};
}
function getHomeTooltipContent(d) {
	return `<p>${d.job},</p> ${d.age}`
}
function clearAll() {
	homeMarkersLayer.clearLayers();
	clearRoutes();
	clearWorkMarkers();
	homeMarkersLayer.clearLayers();
}
function clearRoutes() {
	routesLayer.clearLayers();
}
function clearHomeMarkers() {
	homeMarkersLayer.clearLayers();
}
function clearWorkMarkers() {
	workMarkersLayer.clearLayers();
}
function switchSelectionByEvaluation(selector){
	var value;
	if (selector === 'job') {
		evalElem.value = '';
		value = jobHighlightElem.value;
	}
	if (selector === 'eval') {
		jobHighlightElem.value = '';
		value = evalElem.value;
	}
	clearAll();
	selection = value;
	draw(selector);
}
function switchFilter(){
	evalElem.value='';
	var locationValue = locationElem.value,
		jobValue = jobElem.value;
	filteredData= (!locationValue&& !jobValue) ? mainData: mainData.filter(function(d){
		var jobResult = jobValue ? d.job === jobValue : true;
		var locationResult = locationValue ? d.isSuburb === Boolean(+locationValue) : true;
		return jobResult&& locationResult;
	});
	clearAll();
	draw()
}
// function switchSuburbFilter(value){
// 	filteredData= !value ? filteredData: filteredData.filter(function(d){return d.job === value});
// 	clearAll();
// 	draw()
// }
function switchRoutes(value){
	showRoutes = value;
	if (!showRoutes) {
		clearRoutes();
	} else {
		clearAll();
		draw();
	}
}
function switchWorkingPlaces(value){
	showWorkingPlaces = value;
	if (!showWorkingPlaces) {
		clearWorkMarkers();
	} else {
		clearAll();
		draw();
	}
}
function switchHomePlaces(value){
	showHomePlaces = value;
	if (!showHomePlaces) {
		homeMarkersLayer.clearLayers();;
	} else {
		clearAll();
		draw();
	}
}