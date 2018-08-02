import {geoBounds, geoDistance} from "d3-geo";
import getUnitMeasures from './getUnitMeasures'
import getScale from './getScale'
import buildAxis from './buildAxis'

export default function(){

  // Exposed.
  var extent,
      feature,
      projection,
      miles,
      milesRadius = 3959,
      milesTickValues,
      kilometres,
      kilometresRadius = 6371,
      kilometresTickValues,
      height = 0,
      left = 0,
      top = 0,
      scaleFactor = 1,
      barHeight = 6;

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

    // Set the width and height of the g element.
    var top_of_bar = Math.min(vert_point_a_projected[1], vert_point_b_projected[1]) + (height_projected * top);
    var left_of_bar = Math.min(point_a_projected[0], point_b_projected[0]) + (width_projected * left);

    // Get key measures.
    var measuresMiles = getUnitMeasures(distance_radians, milesRadius, miles, width_projected);
    var measuresKilometres = getUnitMeasures(distance_radians, kilometresRadius, kilometres, width_projected);

    // Get a zoom factor aware scale.
    var scaleMiles = getScale(measuresMiles.domainMax, measuresMiles.barWidth, scaleFactor);
    var scaleKilometres = getScale(measuresKilometres.domainMax, measuresKilometres.barWidth, scaleFactor);

    // Draw the miles axis.
    buildAxis(
      'miles', 
      {left: left_of_bar, top: (top_of_bar + 20)},
      scaleMiles, 
      context, 
      measuresMiles.barWidth,
      barHeight
    )

    // Draw the kilometres axis.
    buildAxis(
      'kilometres', 
      {left: left_of_bar, top: (top_of_bar + 60)},
      scaleKilometres, 
      context, 
      measuresKilometres.barWidth,
      barHeight
    )
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

  scaleBar.kilometres = function(_) {
    return arguments.length ? (kilometres = +_, scaleBar) : kilometres;
  }

  scaleBar.kilometresRadius = function(_) {
    return arguments.length ? (kilometresRadius = +_, scaleBar) : kilometresRadius;
  }

  scaleBar.kilometresTickValues = function(_) {
    return arguments.length ? (kilometresTickValues = _, scaleBar) : kilometresTickValues;
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

  return scaleBar;
}