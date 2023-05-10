export const choroplethMap = (parent, props) => {
  const { 
    data,
	margin,
	xValue,
	colourScale,
	selectRegion,
	selectedRegion,
	numberFormat
  } = props;

  const width = +parent.attr('width');
  const height = +parent.attr('height');
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Define projection and pathGenerator
  const projection = d3.geoMercator();
  projection.fitSize([innerWidth, innerHeight], data)
  const pathGenerator = d3.geoPath().projection(projection)

  // Group for map elements
  const map = parent.selectAll('.map').data([null])
	.join('g')
      .attr('class','map')
      .attr('transform', `translate(0,${margin.top})`);

  // Zoom interactivity (using d3-zoom package -- standard d3 bundle)
  map.call(d3.zoom()
	.scaleExtent([1, 8])
	.translateExtent([[0,0], [innerWidth, innerHeight]])
	.on('zoom', event => map.attr('transform', event.transform)));

  // Append our paths for the data
  const areas = map.selectAll('path').data(data.features).join('path')
		.attr('class', 'area')
		.attr('d', d => pathGenerator(d))
		.attr('stroke', 'black')
		.attr('fill', d => colourScale(xValue(d)))
		.attr('opacity', d => (d.properties.RGN22CD == selectedRegion || null == selectedRegion) ? 1 : .3) // vary stroke and opacity to indicate selected area
		.attr('stroke-width', d => (d.properties.RGN22CD == selectedRegion ? 0.5 : 0))
		.on('click', selectRegion);
		

  // Tooltip event listeners
  const tooltip = d3.select('#tooltip')
  const tooltipPadding = 15;
  areas
      .on('mousemove', (event, d) => {
        tooltip
          .style('display', 'block')
          .style('left', (event.pageX + tooltipPadding) + 'px')   
          .style('top', (event.pageY + tooltipPadding) + 'px')
          .html(`
            <div class="tooltip-title"><b>${d.properties.RGN22NM}</b></div>
            <div>Vehicle kilometre/mile: ${ numberFormat(xValue(d))}</div>
          `);
      })
      .on('mouseleave', (event) => {
        tooltip.style('display', 'none');
      });

}

