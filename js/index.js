import {loadAndProcessData} from './loadAndProcessData.js';

import {choroplethMap} from './choroplethMap.js';
import {hexMap} from './hexMap.js';
import {barChart} from './barChart.js';
import {ridgeline} from './ridgeline.js';

import {dropdownMenu} from './dropdownMenu.js';
import {timeSlider} from './timeSlider.js';
import {colourBar} from './colourBar.js';
import {checkbox} from './checkbox.js';

// select html elements
const map_svg = d3.select('#map_svg');
const bar_svg = d3.select('#bar_svg');
const region_svg = d3.select('#region_svg');
const legendGroup = map_svg.append('g')		

//init variables
let geoData;
let hexData;

// define repeatedly using functions dependent on boolean value
const regionCode = (d) => hexChecked ? d.ONS_code : d.properties.RGN22CD

const value = d => hexChecked ? d[selectedVehicleType] / (popChecked ? (d.population!=undefined ? d.population : 1e21 ) : 1)  //v. annoying complexities with local authorites changing over time, so some fudging to hide anomalous values
	: d.properties[selectedYear][selectedVehicleType] / (popChecked ? d.properties.population : 1)

// dropdown menu function
let vehicleTypes
let selectedVehicleType;
const onVehicleTypeSelect = event => {
	selectedVehicleType = event.target.value;
	updateVis();
}

// region selection will null default
let selectedRegion = null;
const selectRegion = (event, d) => {
	selectedRegion = selectedRegion === regionCode(d) ? null : regionCode(d);
	updateVis();
}

// year selection
let years;
let selectedYear;
const selectYear = y => {
	selectedYear = y
	updateVis();
};

//checkbox variables and functions
let hexChecked;
const onHexCheck = event => {
	hexChecked = event.target.checked;
	//reset visualisation on change
	d3.select('.map').remove()
	selectedRegion = null
	selectedVehicleType = "all_motor_vehicles";
	updateVis();
}

let popChecked;
const onPopCheck = event => {
	popChecked = event.target.checked;
	updateVis();
}

let logChecked;
const onLogCheck = event => {
	logChecked = event.target.checked;
	updateVis();
}

// formatting functions for vehicle type labels and large number values
const labelFormat = (s) => {
  const words = s.split("_");
  return words.map((word) => {
   if (word === "hgvs") return "HGVs" // special cases 
   if (word === "lgvs") return "LGVs" 
   return word[0].toUpperCase() + word.substring(1)}).join(" "); //capitalise first letter of each word
}

const numberFormat = (n) => {  // simplify to metric prefixes
	n = n.toFixed(0)
	if (n<1e3) return n
	const endings = ['K','M','B'];
	let i = 0;
	while (n>=1e3) { n /= 1e3; i += 1 } 
	return +n.toFixed(2) + endings[i-1]
}
	
const updateVis = () => {
	// define vehicle type options
	vehicleTypes = hexChecked ? ["all_motor_vehicles", "cars_and_taxis"] : ["all_motor_vehicles", "cars_and_taxis", "pedal_cycles", "two_wheeled_motor_vehicles", "buses_and_coaches", "lgvs", "all_hgvs"];
	
	//colourscale dependent on current data, selected year and population checkbox
	const colourScale = d3.scaleSequential()
		.domain( d3.extent( hexChecked ? hexData.get(selectedYear) : geoData.features, value)).nice()
		.interpolator(d3.interpolateBlues);

	// call function on relevant element to create visualisation
	
	
	d3.select('#menu').call(dropdownMenu, {
		options: vehicleTypes,
		onSelect: onVehicleTypeSelect,
		labelFormat
	});
	d3.select('#menu select').property('value', selectedVehicleType);
	
	d3.select('#checkbox-hex').call(checkbox, {
		id: 'hexCheckbox',
		textlabel: 'Show Local Authorities in hexgrid map',
		isChecked: hexChecked,
		onBoxClicked: onHexCheck
	});
	d3.select('#checkbox-pop').call(checkbox, {
		id: 'popCheckbox',
		textlabel: 'Show population weighted values',
		isChecked: popChecked,
		onBoxClicked: onPopCheck
	});
	
	const log_checkbox = d3.select('#checkbox-log')
	log_checkbox.call(checkbox, {
		id: 'logCheckbox',
		textlabel: 'Use log scale',
		isChecked: logChecked,
		onBoxClicked: onLogCheck
	});
	log_checkbox.style('display', selectedRegion == null || hexChecked ? 'none' : 'initial') // hide log checkbox when not relevant

	legendGroup.call(colourBar, {
		colourScale,  
		nTicks: 3,
		barWidth: 300,
		barHeight: 12,
		numberFormat
	});

	let map = hexChecked ? hexMap : choroplethMap // different maps dependent on checkbox value
	map_svg.call(map, {
		data: hexChecked ? hexData.get(selectedYear) : geoData,
		margin: { top: 40, bottom: 50, left: 20, right: 20 },
		xValue: value,
		colourScale,
		selectedRegion,
		selectRegion,
		numberFormat
	});
		
	bar_svg.call(barChart, {
		data: hexChecked ? hexData.get(selectedYear) : geoData.features,
		margin: { top: 20, bottom: 130, left: 100, right: 10 },
		xValue: d => hexChecked ? d.name : d.properties.RGN22NM,
		yValue: value, 
		yAxisLabel: "Vehicle kilometre/mile",
		regionCode,
		selectedRegion,
		selectRegion,
		numberFormat
	});
	
	if (!hexChecked && selectedRegion != null) { // chart only updated when in correct part of visualisation
		d3.select('.ridgeline').remove()	
		region_svg.call(ridgeline , {
			data: geoData,
			margin: { top: 80, bottom: 30, left: 150, right: 30 },
			years,
			vehicleTypes,
			selectedRegion,
			labelFormat,
			zFunc: logChecked ? x => Math.log(x) : x => x // function on displayed value to optionally account for large data range
		});
	}
		
};

loadAndProcessData().then(loadedData => {
	geoData = loadedData[0];
	hexData = loadedData[1];
	  
    const arr = Object.keys(geoData.features[0].properties) 
    years = (arr.slice(0, arr.length-11)) // get array of years in data excluding other values
	
	//initial values
	selectedYear = 2021;
	selectedVehicleType = "all_motor_vehicles";

	hexChecked = true;
	popChecked = false;
	logChecked = false;

	updateVis();

	// add time slider - not dependent on updating aspects of visualisation
	map_svg.call(timeSlider, {
		years,
		selectYear
	});
});