import {geoBounds, geoDistance} from "d3-geo";
import {scaleLinear} from "d3-scale";
import {axisBottom} from "d3-axis";

export default function(){
  var extent,
      projection,
      feature,
      mG,
      miles,
      milesText,
      milesTickValues,
      milesRadius = 3959,
      height = 4,
      left = 0,
      top = 0,
      scaleFactor = 1, // new
      barHeight = 6, // new
      barFrame; // new

  function scaleBar(context){
    var bounds = geoBounds(feature);

    // Calculate the geo height in pixel.
    var vert_point_a_projected = projection([0, bounds[0][1]]);
    var vert_point_b_projected = projection([0, bounds[1][1]]);
    var height_projected = Math.abs(vert_point_a_projected[1] - vert_point_b_projected[1]);

    // Calculate the geo width in radians.
    var bottom = Math.abs((bounds[1][1] - bounds[0][1]) * top);
    var point_a = [bounds[0][0], bottom];
    var point_b = [bounds[1][0], bottom];
    var distance_radians = geoDistance(point_a, point_b)

    // Calulate the geo width in pixel.
    var point_a_projected = projection(point_a);
    var point_b_projected = projection(point_b);
    var width_projected = point_b_projected[0] - point_a_projected[0];

    // Calulate the geo width in miles.
    var distance_miles = distance_radians * milesRadius;
    
    // Calculete a reasonable initial miles value. 
    var initialMiles = miles || Math.pow(10, countDigits(distance_miles) - 1);

    // Calculate the bar width for the range (which will remain).
    var miles_proportion_of_whole = initialMiles / distance_miles;
    var miles_width_of_bar = miles_proportion_of_whole * width_projected;

    // Set the width and height of the g element.
    var top_of_bar = Math.min(vert_point_a_projected[1], vert_point_b_projected[1]) + (height_projected * top);
    var left_of_bar = Math.min(point_a_projected[0], point_b_projected[0]) + (width_projected * left);

    // Calculate the initial, static scale.
    var milesScaleInitial = scaleLinear()
      .domain([0, initialMiles])
      .range([0, miles_width_of_bar]); 

    // Calculate the scaled miles.
    var appliedMiles = initialMiles * scaleFactor;
    var rMaxNew = miles_width_of_bar / scaleFactor;
    var dMaxNew = milesScaleInitial.invert(rMaxNew)

    // Calculate the updated scale.
    var milesScale = scaleLinear()
      .domain([0, dMaxNew])
      .range([0, miles_width_of_bar])

    // Set axis.
    var milesAxis = axisBottom(milesScale)
      .ticks(5)
      .tickSize(0)
      .tickPadding(Math.max(8, barHeight**1/1.5)); // minimum of 8, increments decreasing for higher bars.

    // Draw axis.
    mG = mG || context.append("g")
      .attr("class", "miles");

    mG
      .attr("transform", "translate(" + left_of_bar + ", " + (top_of_bar + 20) + ")")
      .call(milesAxis);

    // Calculate tick distances.
    var tickValues = d3.selectAll('.tick').data();
    var tickLength = tickValues.length;
    var lastValue = tickValues.filter((d,i,data) => i === data.length-1)[0]
    var lastValuePixel = milesScale(lastValue);
    var tickDistance = lastValuePixel / (tickLength - 1)

    // Adapt domain path (we need to remove the 0.5 pixel vertical lines).
    var domainPath = d3.select('.domain');
    domainPath.attr('d', domainPath.attr('d').replace('V0.5', 'V0'));

    // Add dash-array.
    domainPath
      .style('stroke-width', barHeight)
      .style('stroke-dashoffset', 0)
      .style('stroke-dasharray', `${tickDistance}, ${tickDistance}`);

    // Add bar frame.
    barFrame = barFrame || mG
      .append('rect')
      .attr('class', 'bar-frame')
      .attr('y', -barHeight / 2)
      .attr('width', miles_width_of_bar)
      .attr('height', barHeight)
      .style('fill', 'none')
      .style('stroke-width', 0.3);

    // Add miles text.
    milesText = milesText || mG.append("text")
      .attr("class", "label")
      .style("fill", "#000")
      .style("text-anchor", "start")
      .style("font-size", "12px")
      .attr("y", -8)
      .text("Miles");


  }

  scaleBar.fitSize = function(e, o){
    extent = e;
    feature = o;
    return scaleBar;
  }

  scaleBar.extent = function(array) {
    return arguments.length ? (extent = array, scaleBar) : extent;
  }

  scaleBar.feature = function(object) {
    return arguments.length ? (feature = object, scaleBar) : feature;
  }

  scaleBar.projection = function(proj) {
    return arguments.length ? (projection = proj, scaleBar) : projection;
  }

  scaleBar.miles = function(_) {
    return arguments.length ? (miles = +_, scaleBar) : miles;
  }

  scaleBar.milesRadius = function(_) {
    return arguments.length ? (milesRadius = +_, scaleBar) : milesRadius;
  }

  scaleBar.milesTickValues = function(_) {
    return arguments.length ? (milesTickValues = _, scaleBar) : milesTickValues;
  }

  scaleBar.height = function(_) {
    return arguments.length ? (height = +_, scaleBar) : height;
  }

  scaleBar.left = function(_) {
    return arguments.length ? (left = _ > 1 ? 1 : _ < 0 ? 0 : +_, scaleBar) : left;
  }

  scaleBar.top = function(_) {
    return arguments.length ? (top = _ > 1 ? 1 : _ < 0 ? 0 : +_, scaleBar) : top;
  }

  scaleBar.scaleFactor = function(_) {
    return arguments.length ? (scaleFactor = _, scaleBar) : scaleFactor;
  }

  scaleBar.barHeight = function(_) {
    return arguments.length ? (barHeight = _, scaleBar) : barHeight;
  }

  function countDigits(_){
    return Math.floor(_).toString().length;
  }

  return scaleBar;
}