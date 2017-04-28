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
var backEvaluationGradesMapper = {
	'2': 'Так',
	'1': 'Скоріше так',
	'-1': 'Скоріше ні',
	'-2': 'Ні',
	'0': 'Важко відповісти'
};
var townGradesMapper = {
	'Погане': -2,
	'Нормальне':1,
	'Найкраще': 2,
	'Важко відповісти': 0
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
var townGradesColumns= ['likeIrpin', 'likeVishneve', 'likeBucha', 'likeVorzel', 'likeKocubinske',
	'likeBoyarka', 'likeBrovary', 'likeBoryspil', 'likeVyshgorod' ];
	// 'age','job','timestamp', 'geohome', 'geowork', 'comments'];
var jobList = ['Software Developer','Project/Account Manager','BA/QA','Інша ІТ спеціальність'];
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
d3.csv('./finalconverted.csv', row, function(error, data) {
	mainData = data.filter(d=>!(d.distance && d.distance > 150 || d.job ==='Спеціальність не пов\'язана з ІТ'));
	filteredData = mainData;
	draw();
});

function draw(field) {
	var data = filteredData;

	data.forEach(function(d) {
		/**Draw Routes */
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
		var grade = getGrade(d, field);
		d.highlighted = grade > 0;
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
	return !field ? 0 : field === 'eval' ? evaluationGradesMapper[d[selection]]: d.job === selection ? 2 : -2 ;
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
	if (d.geohome) d.geohome = d.geohome.split(',');
	if (d.geowork) d.geowork = d.geowork.split(',');
	// if (d.geohome && d.geowork) {
	// 	d.distance = Math.round(L.latLng(d.geohome).distanceTo(d.geowork)/1000);
	// }
	d.isSuburb = d.isSuburb === "true";
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
	var evalRows = evaluationColumns.map(i=>backEvaluationGradesMapper[d[i]]?`<p>${columnsMap[i]}: <b>${backEvaluationGradesMapper[d[i]]}</b></p>`:'').join('');
	return `<p><b>${d.age} р., ${d.job}, </b></p><hr/>` + evalRows;
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
	percentsResult.html(`</div><div class='legend-label grade_2'></div>Так ${percents}%<div class='legend-label grade_-2'></div>Ні ${100-percents}%`);
}
function switchFilter(){
	var locationValue = locationElem.value,
		jobValue = jobElem.value;
	filteredData= (!locationValue&& !jobValue) ? mainData: mainData.filter(function(d){
		var jobResult = jobValue ? d.job === jobValue : true;
		var locationResult = locationValue ? d.isSuburb === Boolean(+locationValue) : true;
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
		homeMarkersLayer.clearLayers();;
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