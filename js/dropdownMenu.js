export const dropdownMenu = (parent, props) => {
  const {
    options,
    onSelect,
	labelFormat
  } = props;
  
  //simple dropdown menu implementation
  
  const select = parent.selectAll('select').data([null])
	.join('select')
      .on('change', onSelect);

  select.selectAll('option').data(options)
	.join('option')
      .attr('value', d => d)
      .text(d => labelFormat(d));
};