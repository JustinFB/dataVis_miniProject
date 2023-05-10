export const ridgeline = (parent, props) => {
  const {
    data,
    margin,
	years, 
	vehicleTypes,
	selectedRegion,
	labelFormat,
	zFunc
  } = props;

// ridgeline chart
// details adapted from https://observablehq.com/@d3/ridgeline-plot

  const width = +parent.attr('width');
  const height = +parent.attr('height');
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  
  const f = data.features;
  let arr;
  let name;
  
  let r;
  // iterate through data to get array of value for relevant region
  for (var d in f) {
	  if (f[d].properties.RGN22CD == selectedRegion) {
		name = f[d].properties.RGN22NM
		r = f[d].properties;
		arr = (years.reduce( (acc, y) => 
			acc.concat(vehicleTypes.map(v => r[y][v])), []))
	  }
	}

  // Chart taking care of inner margins
  const chart = parent.selectAll('.ridgeline').data([null])
    .join('g')
      .attr('class','ridgeline')
      .attr('transform', `translate(${margin.left},${margin.top})`)
  
  //Append axis title to chart
  chart.selectAll('.axis-title').data([null])
	.join('text')
	  .attr('class', 'axis-title')
	  .attr('x', -100)
	  .attr('y', -60)
	  .text(name + ' - Not adjusted for population');

  // Initialise scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(years))
    .range([0, innerWidth])
	
  const yScale = d3.scalePoint()
	.domain(vehicleTypes)
	.range([0, innerHeight])
  
  const zScale = d3.scaleLinear()
	.domain( d3.extent(arr).map(zFunc)).nice()	
	.range([0, -yScale.step()])
	
  // Initialise axes
  const xAxis = g => g 
	.attr('transform', `translate(0,${innerHeight})`)
	.call(d3.axisBottom(xScale)
		.ticks(innerWidth/80)
		.tickSizeOuter(0)
		.tickFormat(d3.format('d')))
	
  const yAxis = g => g
    .call(d3.axisLeft(yScale)
		.tickSize(0)
		.tickPadding(4)
		.tickFormat(d => labelFormat(d)))
    .call(g => g.select(".domain").remove())	

  // d3 area plot to produce areas from areas 
  const area = d3.area()
	.curve(d3.curveBasis)
	.defined(d => !isNaN(d))
	.x((d,i) => xScale( years[i] ))
	.y0(0)
	.y1(d => zScale(zFunc(d)))

  // line function along top of area
  const line = area.lineY1()
    
  // join on axis
  chart.selectAll('.x-axis').data([null])
	.join('g').call(xAxis)
  chart.selectAll('.y-axis').data([null])
	.join('g').call(yAxis)
  
  //groups for each area plot
  const group = chart.selectAll('ridge_group').data(vehicleTypes)
	.join('g')
		.attr('transform', d => `translate(0,${yScale(d) + 1})`)
		.attr('class', 'ridge_group')
  
  group.append('path')
	.attr('fill', '#adb')
	.attr('d', d => area( years.map( y => r[y][d] ))) // using r filter earlier to produce data
	
  group.append('path')
	.attr('fill', 'none')
	.attr('stroke', 'black')
	.attr('d', d => line( years.map( y => r[y][d] ) ))
};