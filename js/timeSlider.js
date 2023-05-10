export const timeSlider = (parent, props) => {
  const {
    years,
	selectYear
  } = props;
  
  const min = +d3.min(years)
  const max = +d3.max(years)
  
  // direct use of library from https://unpkg.com/d3-simple-slider 
  // adapting implementation https://vizhub.com/gotyou007/0691b8d1dd884517af7697eb7f33f956
  const sliderTime = d3
    .sliderBottom()
    .min(min)
    .max(max)
    .step(1)
    .width(300)
	.tickFormat(d3.format("d"))
    .tickValues([min, max])
	.ticks(2)
    .default(max)
    .on('onchange', val => {
      d3.select('#value-time').text(val);
	  selectYear(val)
    });

  const gTime = d3
	.select('#slider-time')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

  gTime.call(sliderTime);

  d3.select('#value-time').text(sliderTime.value());
}