export const checkbox = (parent, props) => {
  const {
    id,
    textlabel,
    isChecked,
    onBoxClicked
  } = props;
	
  // basic checkbox implementation taking arguments in call properties
  
  const input = parent.selectAll('input').data([null]);
  const inputEnter = input.join('input')
      .attr('type', 'checkbox')
      .attr('id', id)
      .text(textlabel);
  inputEnter.merge(input)
      .property('checked', isChecked)
      .on('change', onBoxClicked);

  const label = parent.selectAll('label').data([null]);
  label.join('label')
      .attr('class', 'checkbox-label')
      .attr('for', id)
      .text(textlabel)
};
