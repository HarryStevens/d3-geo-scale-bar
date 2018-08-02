import { scaleLinear } from 'd3-scale';

/**
 * Build the scale to use - considering the zoom scale k.
 * @param  {number} domainMax Max distance in chosen unit (e.g. miles).
 * @param  {number} unitBarWidth   Width of lagend bar in pixel.
 * @param  {number} k              Zoom scale.
 * @return {function}              D3 scale function.
 */
export default function getScale(domainMax, unitBarWidth, k) {
  // Calculate the initial, static scale.
  var scaleInitial = scaleLinear()
    .domain([0, domainMax])
    .range([0, unitBarWidth]);

  // Calculate the scaled miles.
  var rangeMaxNew = unitBarWidth / k;
  var domainMaxNew = scaleInitial.invert(rangeMaxNew);

  // Calculate the updated scale.
  return scaleInitial.copy().domain([0, domainMaxNew]);
}
