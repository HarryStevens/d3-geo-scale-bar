function countDigits(_) {
  return Math.floor(_).toString().length;
}

/**
 * Calculate the max distance in the chosen unit to be displayed
 * on the legend amd the legend width in pixels based on the max distance.
 * @param  {number} distRadians      The geo distance in radians.
 * @param  {number} unitRadius       The earth radius in the chosen unit.
 * @param  {number} domainMax          The maximum unit distance to display initially.
 * @param  {number} widthProjected   domainMax projected to pixel.
 * @return {Object}                  Object holding the max distance in unit and pixel.
 */
export default function getUnitMeasures(
  distRadians,
  unitRadius,
  domainMax,
  widthProjected
) {
  // Calulate the geo width in chosen units (e.g. miles).
  var distance = distRadians * unitRadius;

  // Calculete a reasonable initial maximum unit value.
  domainMax = domainMax || Math.pow(10, countDigits(distance) - 1);

  // Calculate the bar width in pixel.
  var unit_proportion_of_whole = domainMax / distance;
  var unit_width_of_bar = unit_proportion_of_whole * widthProjected;

  return { domainMax, barWidth: unit_width_of_bar };
}
