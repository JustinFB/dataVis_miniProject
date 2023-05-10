export const colourBar = (parent, props) => {
  const { 
    colourScale,
    nTicks,
    barWidth,
    barHeight,
	numberFormat
  } = props;

  // Create legend group to append our legend
  const legendG = parent
	.join('g')
      .attr('class', 'legend')
	  .attr('transform', 'translate(20,0)')

  // Legend rectangle
  const legendRect = legendG.append('rect')
      .attr('width',  barWidth)
      .attr('height', barHeight);

  // Legend labels
  const extent = colourScale.domain();
  const ticks = Array.from(Array(nTicks).keys())
    .map( d => (extent[0] + (extent[1]-extent[0])*d/(nTicks-1)) );
  
  legendG.selectAll('.legend-label').data(ticks)
    .join('text')
      .attr('class', 'legend-label')
      .attr('text-anchor', 'middle')
      .attr('y', 27.5)
      .attr('x', (d,i) => Math.round(barWidth*i/(nTicks-1)))
	  .text(numberFormat);
  
  const legendStops = [
    { color: colourScale(extent[0]), value: extent[0], offset: 0},
    { color: colourScale(extent[1]), value: extent[1], offset: 100},
  ]; 

  // Linear gradient to be used for the legend
  const linearGradient = parent.append('linearGradient')
    .attr("id", "legend-gradient");

  // Update gradient for legend
  linearGradient.selectAll('stop').data(legendStops)
    .join('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

  // Apply gradient to rectangle
  legendRect.attr('fill', 'url(#legend-gradient)');
}
