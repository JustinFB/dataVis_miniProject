import {processHexData} from './processHexData.js'

export const hexMap  = (parent, props) => {
  const { 
    data,
	margin,
	xValue,
	colourScale,
	selectRegion,
	selectedRegion,
	numberFormat
  } = props;
  
  // using file format and library from https://github.com/olihawkins/d3-hexjson
	
 processHexData(data).then(loadedData => { //load hexjson file with relevant csv data
	let hexjson = loadedData;
	
	const width = +parent.attr('width');
	const height = +parent.attr('height');
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	//Group for map elements
	const map = parent.selectAll('.map').data([null])
	  .join('g')
		  .attr('class','map')
		  .attr('transform', `translate(${margin.left},${margin.top})`);

	// Render the hexes
	var hexes = d3.renderHexJSON(hexjson, innerWidth, innerHeight);

	// Bind the hexes to g elements of the map and position them
	var hexmap = map.selectAll('g').data(hexes)
		.join('g')
		.attr('transform', function(hex) {
		return 'translate(' + hex.x + ',' + hex.y + ')'});
	
	//Reset previous renders
	d3.selectAll('polygon').remove()

	// Draw the polygons around each hex's centre
	const polygons = hexmap.append('polygon')
		.attr('class', 'area')
		.attr('points', hex => hex.points)
		.attr('stroke', 'black')
		.attr('stroke-width', hex => (hex.ONS_code == selectedRegion && xValue(hex) != undefined) ? 1.3 : 0.8) // vary stroke and opacity by selected region
		.attr('opacity', hex => (hex.ONS_code == selectedRegion || null == selectedRegion) ? 1 : 0.3 )
		.attr('fill', hex => (colourScale(xValue(hex))!=undefined) ? colourScale(xValue(hex)) : 'grey') // display grey area if no data is available
		.on('click', selectRegion)
		
  //Tooltip interaction	
  const tooltip = d3.select('#tooltip')
  const tooltipPadding = 15;
  polygons
	  .on('mousemove', (event, d) => { 
		if(d.population!=undefined) { // hide tooltip if no relevant data
			tooltip
			  .style('display', 'block')
			  .style('left', (event.pageX + tooltipPadding) + 'px')   
			  .style('top', (event.pageY + tooltipPadding) + 'px')
			  .html(`
				<div class='tooltip-title'><b>${d.name}</b></div>
				<div>Vehicle kilometre/mile: ${ numberFormat(xValue(d)) }</div>
			  `);
		}
	  })
	  .on('mouseleave', (event) => {
		tooltip.style('display', 'none');
	  });
 })
}