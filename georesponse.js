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
var backEvaluationGradesMapper = {
	'2': 'Так',
	'1': 'Скоріше так',
	'-1': 'Скоріше ні',
	'-2': 'Ні',
	'0': 'Важко відповісти'
};
var evaluationColumns = ['liveSuburb', 'liveOkolica', 'isGoodWorkLocation',  'isRented',
	'liveHouse', 'isInvestor', 'isActivist', 'isFreeAppartmentImportant'];
const columnsMap = {
	'liveSuburb': 'Готовий оселитися в комфортному передмісті',
	'liveOkolica': 'Готовий працювати на околиці міста',
	'isGoodWorkLocation':'Задоволений розташуванням поточної роботи',
	'isRented':'Орендує житло',
	'liveHouse': 'Хотів би жити у власному будинку',
	'isInvestor': 'Схильний інвестувати в інфрастуктуру свого району',
	'isActivist':'Схильний до громадської активності',
	'isFreeAppartmentImportant': 'Цінує надання роботодавцем пільгового житла'
};
var jobList = ['Software Developer','Project/Account Manager','BA/QA','Інша ІТ спеціальність'];
var mainData = filteredData = [], selection, selectionField;
var showHomePlaces= true;
var showWorkingPlaces = showRoutes = false;
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
var percentsResult = d3.select("#percentsResult");
var percents = 100;


evaluationColumns.forEach(function(i) {
	evaluationSelector
		.append("option")
		.attr("value", i)
		.text(columnsMap[i])
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
d3.csv('./finalconverted.csv', function(error, data) {
	mainData = data;
	filteredData = mainData;
	draw();
});

function draw(field) {
	var data = filteredData;

	data.forEach(function(d) {
		/**Draw Routes */
		d.geohome = (d.homeLat && d.homeLong) ? [d.homeLat, d.homeLong]: null;
		d.geowork = (d.workLat && d.workLong) ? [d.workLat, d.workLong]: null;
		if (d.geohome && d.geowork && showRoutes) {
			var polylineOptions = {
				color: '#888',
				//dashArray: "10, 2",
				weight: 1,
				opacity: 0.4
			};
			var polyline = L.polyline([d.geohome, d.geowork], polylineOptions);
			routesLayer.addLayer(polyline);
		}
		var grade = getGrade(d, field) || 0;
		d.highlighted = grade > 0;
		d.noEvalValue = Boolean(grade);
		/**Draw Work Markers */
		if (d.geowork && showWorkingPlaces) {
			var iconWork = L.divIcon({className: `work-label workgrade_${grade}`});
			var workMark = L.marker(d.geowork, {icon: iconWork, riseOnHover: true});
			workMarkersLayer.addLayer(workMark);
		}

		/**Draw home Markers */
		if (d.geohome && showHomePlaces ) {
			var iconHome = L.divIcon({className: `home-label grade_${grade}`});
			var homeMark = L.marker(d.geohome, {icon: iconHome, riseOnHover: true, zIndexOffset: 5 + grade});
			//workMark.bindTooltip(d);
			//homeMark.bindTooltip(getHomeTooltipContent(d), {className: 'home-tooltip'});
			homeMarkersLayer.addLayer(homeMark);
		}
	});
	map.addLayer(homeMarkersLayer);
	map.addLayer(workMarkersLayer);
	map.addLayer(routesLayer);

}
function getGrade(d, field) {
	var grade = -2;
	if (!field) grade = 0;
	if (field === 'eval') grade = d[selection];
	if (field === 'job' && jobList[+d.job] === selection) grade = 2;
	if (field === 'job' && selection=== '') grade = 0;
	return  grade;
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

function clearAll() {
	homeMarkersLayer.clearLayers();
	routesLayer.clearLayers();
	workMarkersLayer.clearLayers();
	homeMarkersLayer.clearLayers();
}

function switchSelection(field){
	selectionField = field;
	var value;
	if (field === 'job') {
		evalElem.value = '';
		value = jobHighlightElem.value;
	}
	if (field === 'eval') {
		jobHighlightElem.value = '';
		value = evalElem.value;
	}
	selection = value;
	clearAll();
	draw(field);
	var highlighted = filteredData.filter(d=>d.highlighted);
	percents = Math.floor(highlighted.length*100/filteredData.length);
	percentsResult.html(`<h4>Всі міста разом:</h4><div class='legend-label grade_2'></div>Так ${percents}%<div class='legend-label grade_-2'></div>Ні ${100-percents}%`);
}
function switchFilter(){
	var locationValue = locationElem.value,
		jobValue = jobElem.value;
	filteredData= (!locationValue&& !jobValue) ? mainData: mainData.filter(function(d){
		var jobResult = jobValue ? jobList[d.job] === jobValue : true;
		var locationResult = locationValue ? d.isSuburb === locationValue : true;
		return jobResult&& locationResult;
	});
	clearAll();
	draw(selectionField);
	percents = Math.floor(filteredData.length*100/mainData.length);
	percentsResult.text('Обрано: ' + Math.floor(percents)+'%');
}

function switchRoutes(value){
	showRoutes = value;
	if (!showRoutes) {
		routesLayer.clearLayers();
	} else {
		clearAll();
		draw(selectionField);
	}
}
function switchWorkingPlaces(value){
	showWorkingPlaces = value;
	if (!showWorkingPlaces) {
		workMarkersLayer.clearLayers();
	} else {
		clearAll();
		draw(selectionField);
	}
}
function switchHomePlaces(value){
	showHomePlaces = value;
	if (!showHomePlaces) {
		homeMarkersLayer.clearLayers();
	} else {
		clearAll();
		draw(selectionField);
	}
}
function clearFilters() {
	filteredData = mainData;
	selection = selectionField = undefined;
	locationElem.value = jobElem.value = evalElem.value = '';
	clearAll();
	draw();
	percentsResult.text('');
}