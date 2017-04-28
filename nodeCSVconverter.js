/**
 * Created by administrator on 03.11.16.
 */
var csv = require("fast-csv"),
    fs = require("fs"),
    path = require("path");//,
   geolib = require("geolib");
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
    kyiv2:[[50.471923, 30.355972],[50.425589, 30.412676]],
    irpin: [[50.5799, 30.0785], [50.5036, 30.2852]],
};
var emptyPerson = {
    name: "",
    id: "",
    office: "",
    position: "",
    professionGroup: "",
    uah: "",
    usd: "",
    gbp: "",
    eur: "",
    total: "",
    region: ""
};
var grades = {
    'Так':2,
    'Скоріше так': 1,
    'Скоріше ні': -1,
    'Ні': -2,
    'Важко відповісти': 0
};
var townGrades = {
    'Найкраще'	: 2,
    'Нормальне	': 1,
    'Погане	': -1,
    'Важко відповісти': 0
};
//collectByField("position", ["судя", "суду", "судя"],  "suddi-auto.csv");
collectByField("finalPollResults-copy.csv", "finalconverted.csv");

function collectByField (sourceFile, distanceFile) {
    fs.createReadStream(sourceFile)
        .pipe(csv.parse({headers: true}))
        //pipe the parsed input into a csv formatter
        .pipe(csv.format({headers: true}))
        //Using the transfrom function from the formatting stream
        .transform(function (row, next) {
           const person = rowTransformer(row);
console.log(person);
            next(void 0, person);

        })
        .pipe(fs.createWriteStream(distanceFile))
        .on("finish", () => {console.log("DONE")})
        .on("end", process.exit);
}

function summCur(i, cur) {
    var map = ["готівкові кошти", "кошти, розміщені на банківських рахунках", "інше", "кошти, позичені третім особам", "активи у дорогоцінних (банківських) металах", "внески до кредитних спілок та інших небанківських фінансових установ"]
    var sum = 0;
    map.forEach(function (name) {
        var decl = i["Декларант/" + name + "/" + cur];
        var rod = i["Родина/" + name + "/" + cur];
        sum = sum + (!isNaN(+decl) ? +decl : 0) + (!isNaN(+rod) ? +rod : 0);
    });
    return sum === 0 ? "" : sum;
}

function defineProfessionGroup(d) {
    var prokuraturaMap = ["прокурор", "прокурат", "пркур", "прокрор", "прокруор"];// ["генеральна прокуратура", "генеральна прокуратура україни", "прокуратура"];
    var deputatyMap = ["апарат верховної ради україни", "верховна рада україни", "верховна рада", "народний депутат", "народный депутат"];
    var golovaMap = ["міський голова", "сільський голова", "обласний голова", "районний голова"]; //["голова", "голови", "глава", "глави"];
    var suddiMap = ["судя", "суду", "судя", "судья", "голова суду", /суд$/, /суд\s/, /голова\s.*суду/, /голова\s.*суда/];
    var ministerstvoMap = ["міністерств", /міністр(?!(ац|ат))/, ];
    var slidchiMap = ["следователь", "слідчий", "детектив", "слідчого", "поліці", "оперуповноважений"];
    var inspectorMap = ["інспектор", "інспекц"];
    var ofice = d.office.toLowerCase();
    var position = d.position.toLowerCase();
    return testAny(ministerstvoMap, ofice) || testAny(ministerstvoMap, position) ? "ministerstvo"
            :testAny(deputatyMap, ofice) || testAny(deputatyMap, position) ? "deputat"
        : testAny(prokuraturaMap, ofice) || testAny(prokuraturaMap, ofice) ? "prokuratura"
        : testAny(golovaMap, ofice) || testAny(golovaMap, position) || ((~position.search("голова") || ~position.search("заступник голови") || ~position.search("заступник міського голови")) && (~position.search("адміністрації") || ~position.search("ода") || ~ofice.search("ода") || ~ofice.search("рада") || ~ofice.search("адміністрації") )) ? "golova"
        : testAny(suddiMap, position) || testAny(suddiMap, ofice) ? "suddia"
        : testAny(slidchiMap, position) ? "slidchi"
        : testAny(inspectorMap, position) || testAny(inspectorMap, ofice) ? "inspector" : "";
}

function testAny(arr, str) {
    var result = false;
    arr.forEach(function(el) {
        if (~str.search(el)) result = true
    });
    return result;
}

function findRegion(d) {
    var regionsMap = {
            "Дніпропетровськ": ["дніпро"],
            "Донецьк": ["донец"],
            "Житомир": ["житомир"],
            "Закарпаття": ["закарпат", "ужгород"],
            "Запоріжжя": ["запорі"],
            "Івано-Франківськ": ["іванофранківськ", "івано-франківськ", "франківс"],
            "Київ": ["київ"],
            "Кіровоград": ["кировоград", "кіровоград"],
            "Севастополь": ["севастополь"],
            "Крим": [/крим\s/, /крим$/, "криму", "кримськ"],
            "Львів": ["львів", "львов"],
            "Миколаїв": ["миколаїв"],
            "Одеса": ["одес"],
            "Полтава": ["полтав"],
            "Рівне": ["рівне", "рівенськ", "рівного"],
            "Суми": ["суми", "сумськ"],
            "Тернопіль": ["тернопіль", "тернополя"],
            "Харків": ["харків", "харков", "харьк"],
            "Херсон": ["херсон"],
            "Хмельницький": ["хмельни"],
            "Черкаси": ["черкас"],
            "Чернигів": ["чернигів", "чернигов"],
            "Чернівці": ["чернов", "чернів"],
            "Луганськ": ["луганськ", "луганск"],
            "Вінниця": ["вінни"],
            "Луцьк": ["луць", "волин"]
        };
    var ofice = d.office.toLowerCase();
    var position = d.position.toLowerCase();
    for (var key in regionsMap) {
        if (testAny(regionsMap[key], ofice) || testAny(regionsMap[key], position)) {
            return key;
        }
    }
    return ""
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

function rowTransformer(d) {
    // evaluationColumns.forEach(function(item) {
    //     d[item] = evaluationGradesMapper[d[item]] || -10;
    // });
    // townGradesColumns.forEach(function(item) {
    //     d[item] = townGradesMapper[d[item]] || -10;
    // });
    d.geohome = splitCoord(d.geohome);
    d.geowork = splitCoord(d.geowork);
    if (d.geowork) {
        d.workLong = d.geowork[1];
        d.workLat = d.geowork[0];
    }

    if(d.geohome) {
        d.homeLong = d.geohome[1];
        d.homeLat = d.geohome[0];
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
        var distance = geolib.getDistance(
            {latitude: d.homeLat, longitude: d.homeLong},
            {latitude: d.workLat, longitude: d.workLong}
        );
        d.distance = Math.round(distance/100)/10;
    }
    
    //d.liveHouse = evaluationGradesMapper[d.liveHouse];
    //d.liveSuburb = evaluationGradesMapper[d.liveHouse];
    //d.age = +d.age;
    //d.quantity= 1;
//console.log(d.liveHouse, evaluationGradesMapper[d.liveHouse], evaluationGradesMapper);
    //delete d.comments;
    return d;
}
