import { axisBottom } from 'd3-axis';

function titleCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Draws legend axis.
 * @param  {string}      selector  Name of unit (e.g. "miles")
 * @param  {Object}      position  Left and top bar position.
 * @param  {function}    scale     D3 scale function.
 * @param  {Selection}   context   Parent g.
 * @param  {number}      barWidth  Bar width in pixel.
 * @param  {number}      barHeight Bar height in pixel.
 * @return {undefined}             DOM side effects.
 */
export default function buildAxis(
  selector,
  position,
  scale,
  context,
  barWidth,
  barHeight
) {
  // Set axis.
  var axis = axisBottom(scale)
    .ticks(5)
    .tickSize(0)
    // minimum of 8, increments decrease for higher bars:
    .tickPadding(Math.max(8, barHeight ** 1 / 1.5)); 

  // Build legend g only on initialization.
  var gUpdate = context.selectAll('g.' + selector).data([1]);
  var g = gUpdate.enter().append('g').attr('class', selector);

  // Draw axis (re-select as g is empty on update).
  d3.select('g.' + selector)
    .attr('transform', 'translate(' + position.left + ', ' + position.top + ')')
    .call(axis);

  // Calculate tick distances.
  var tickValues = d3.selectAll('.' + selector + ' .tick').data();
  var lastValue = tickValues.filter((d, i, data) => i === data.length - 1)[0];
  var lastValuePixel = scale(lastValue);
  var tickDistance = lastValuePixel / (tickValues.length - 1);

  // Adapt domain path (we need to remove the 0.5 pixel vertical lines).
  var domainPath = d3.select('.' + selector + ' .domain');
  domainPath.attr('d', domainPath.attr('d').replace('V0.5', 'V0'));

  // Add dash-array.
  domainPath
    .style('stroke-width', barHeight)
    .style('stroke-dashoffset', 0)
    .style('stroke-dasharray', `${tickDistance}, ${tickDistance}`);

  // Add bar frame.
  g.append('rect')
    .attr('class', 'bar-frame')
    .attr('y', -barHeight / 2)
    .attr('width', barWidth)
    .attr('height', barHeight)
    .style('fill', 'none');

  // Add miles text.
  g.append('text')
    .attr('class', 'bar-label')
    .style('fill', '#000')
    .style('text-anchor', 'start')
    .style('font-size', '12px')
    .attr('y', -8)
    .text(titleCase(selector));
}
