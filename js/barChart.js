//https://observablehq.com/@d3/zoomable-bar-chart
export const barChart = (parent, props) => {
  const {
    data,
    margin,
	xValue,
    yValue, 
    yAxisLabel,
	regionCode,
	selectedRegion,
	selectRegion,
	numberFormat
  } = props;

  const width = +parent.attr('width');
  const height = +parent.attr('height');
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Chart taking care of inner margins
  const chart = parent.selectAll('.barChart').data([null])
    .join('g')
      .attr('class','barChart')
      .attr('transform', `translate(${margin.left},${margin.top})`)
	  .attr('viewbox', [0, 0, innerWidth, innerHeight])
	  
  chart.selectAll('.axis-title').data([null])
	.join('text')
	  .attr('class', 'axis-title')
	  .attr('x', -50)
	  .attr('y', -10)
	  .text(yAxisLabel + ' - Zoom and pan on dense charts');
 
 // bar chart zoom from https://observablehq.com/@d3/zoomable-bar-chart
 // adapted to use case and to vary with number of data points
  function zoom(svg) {
	  const extent = [[0, 0], [innerWidth, innerHeight]];

	  svg.call(d3.zoom()
		  .scaleExtent([1, 12])
		  .translateExtent(extent)
		  .extent(extent)
		  .on("zoom", zoomed));

	  function zoomed(event) {
		xScale.range([0, innerWidth].map(d => event.transform.applyX(d)));
		svg.selectAll('rect').attr("x", d => xScale(d.name)).attr("width", xScale.bandwidth());
		svg.selectAll(".x-axis").call(xAxis);
		svg.selectAll('.x-axis .tick').style('display', (event.transform.k > 8) ? 'initial' : 'none'); 
	  }
  }
  
  // sort data by y value - vehicle count  
  data.sort((a,b) => yValue(b)-yValue(a))
  
  // Initialise scales
  const xScale = d3.scaleBand()
    .domain(data.map(xValue))
    .range([0, innerWidth])
    .paddingInner(0.2);
	  
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, yValue)]).nice()
    .range([innerHeight, 0]);

  // Initialise axes
  const xAxis = d3.axisBottom(xScale)
    .tickPadding(5)
	.tickSize(3)
    
  const yAxis = d3.axisLeft(yScale)
    .ticks(6)
	.tickFormat(numberFormat)
    .tickSizeOuter(0)
    .tickPadding(8);

  // Append empty x-axis group and move it to the bottom of the chart
  const xAxisG = chart.selectAll('.x-axis').data([null])
	.join('g')
      .attr('class','x-axis')
      .attr('transform', `translate(0,${innerHeight})`);
  xAxisG.call(xAxis);
  
  // translate x-axis tick labels
  xAxisG.selectAll("text")  
    .style("text-anchor", "end")
    .attr("dx", "-.5em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-35)")

  // Hide ticks and enable zoom for dense graphs 
  if(xScale.domain().length > 20) {
	  chart.selectAll('.x-axis .tick').style('display', 'none') 
	  chart.call(zoom)
  }

  // Append y-axis group
  const yAxisG = chart.selectAll('.y-axis').data([null])
    .join('g')
      .attr('class','y-axis');
  yAxisG.call(yAxis);
    
  // Plot data
  const rects = chart.selectAll('.bar').data(data)
	.join('rect')
      .attr('class', 'bar')
	  .attr('width', xScale.bandwidth())
	  .attr('height', 0)
	  .attr('x', d => xScale(xValue(d)))
	  .attr('y', innerHeight)
	  .attr('fill', 'green')
	  .attr('opacity', d => (regionCode(d) == selectedRegion || null == selectedRegion) ? 1 : 0.3) // filter opacity on selected region
	  .on('click', selectRegion)
	  .transition().duration(800) // animate transitions
		  .attr('y', d => yScale(yValue(d)))	  
		  .attr('height', d => innerHeight - yScale(yValue(d)))
		  
		  
  // Tooltip event listeners
  const tooltip = d3.select('#tooltip')
  const tooltipPadding = 15;
  d3.selectAll('.bar')
      .on('mousemove', (event, d) => {
        tooltip
          .style('display', 'block')
          .style('left', (event.pageX + tooltipPadding) + 'px')   
          .style('top', (event.pageY + tooltipPadding) + 'px')
          .html(`
            <div class="tooltip-title"><b>${xValue(d)}</b></div>
            <div>Vehicle kilometre/mile: ${ numberFormat(yValue(d)) }</div>
          `);
      })
      .on('mouseleave', (event) => {
        tooltip.style('display', 'none');
      });

}