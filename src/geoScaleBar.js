import {geoBounds, geoDistance} from "d3-geo";
import {scaleLinear} from "d3-scale";
import {axisBottom} from "d3-axis";

export default function(){

  // Exposed
  var extent,
      projection,
      feature,
      height = 4,
      left = 0,
      top = 0,
      units = "kilometers",
      distance,
      radius = 6371,
      tickValues,
      label,
      scaleFactor = 1;

  // Unexposed
  var g,
      text,
      unitPresets = {
        "miles": {
          radius: 3959
        },
        "kilometers": {
          radius: 6371
        }
      },
      axis,
      scale;

  function scaleBar(context){
    var bounds = geoBounds(feature);

    var vert_point_a_projected = projection([0, bounds[0][1]]);
    var vert_point_b_projected = projection([0, bounds[1][1]]);
    var height_projected = Math.abs(vert_point_a_projected[1] - vert_point_b_projected[1]);

    var bottom = Math.abs((bounds[1][1] - bounds[0][1]) * top);
    var point_a = [bounds[0][0], bottom];
    var point_b = [bounds[1][0], bottom];
    var distance_radians = geoDistance(point_a, point_b)

    var d = distance_radians * radius;

    var point_a_projected = projection(point_a);
    var point_b_projected = projection(point_b);
    var width_projected = point_b_projected[0] - point_a_projected[0];
    
    // A very simple algorithm for determining a good mileage / kilometerage. This can be overridden.
    distance = distance || Math.pow(10, countDigits(d) - 1);

    var proportion_of_whole = distance / d;
    var width_of_bar = proportion_of_whole * width_projected;

    var top_of_bar = Math.min(vert_point_a_projected[1], vert_point_b_projected[1]) + (height_projected * top);
    var left_of_bar = Math.min(point_a_projected[0], point_b_projected[0]) + (width_projected * left);

    context.attr("width", extent[0]).attr("height", extent[1]);

    scale = scale || scaleLinear();
    
    scale
      .range([0, width_of_bar])
      .domain([0, distance]);

    if (scaleFactor !== 1){
      scale
        .domain([0, scale.invert(width_of_bar / scaleFactor)]);
    }

    axis = axis || axisBottom();
    
    var max_tick_value = scale.domain()[1] / distance * distance;
    
    axis
      .scale(scale)
      .tickValues(tickValues ? tickValues : [0, max_tick_value / 4, max_tick_value / 2, max_tick_value])
      .tickSize(height);

    g = g || context.append("g")
        .attr("class", "scale-bar");

    g
        .attr("transform", "translate(" + left_of_bar + ", " + (top_of_bar + 14) + ")")
        .call(axis);

    var rects = g.selectAll("rect")
        .data(axis.tickValues().map(function(d, i, data){ return [d, data[i + 1]]; }).filter(function(d, i, data){ return i !== data.length - 1; }));

    rects.exit().remove();

    rects.enter().append("rect")
        .attr("height", height)
        .style("stroke", "#000")
        .style("fill", function(d, i){ return i % 2 === 0 ? "#000" : "#fff"; })
      .merge(rects)
        .attr("x", function(d){ return scale(d[0]); })
        .attr("width", function(d){ return scale(d[1] - d[0]); });

    text = text || g.append("text")
      .attr("class", "label")
      .style("fill", "#000")
      .style("text-anchor", "start")
      .style("font-size", "12px")
      .attr("y", -4)
    
    text.text(label || capitalizeFirstLetter(units))
  }

  scaleBar.fitSize = function(e, o){
    extent = e;
    feature = o;
    return scaleBar;
  }

  scaleBar.extent = function(_) {
    return arguments.length ? (extent = _, scaleBar) : extent;
  }

  scaleBar.feature = function(_) {
    return arguments.length ? (feature = _, scaleBar) : feature;
  }

  scaleBar.projection = function(_) {
    return arguments.length ? (projection = _, scaleBar) : projection;
  }

  scaleBar.units = function(_){
    if (arguments.length) {
      units = _;
      if (Object.keys(unitPresets).includes(_)) {
        radius = unitPresets[_].radius;
      }

      return scaleBar; 
    }

    else {
      return units;
    }
  }

  scaleBar.distance = function(_) {
    return arguments.length ? (distance = +_, scaleBar) : distance;
  }

  scaleBar.radius = function(_) {
    return arguments.length ? (radius = +_, scaleBar) : radius;
  }

  scaleBar.tickValues = function(_) {
    return arguments.length ? (tickValues = _, scaleBar) : tickValues;
  }

  scaleBar.label = function(_) {
    return arguments.length ? (label = _, scaleBar) : label;
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

  function countDigits(_){
    return Math.floor(_).toString().length;
  }
  function capitalizeFirstLetter(_) {
    return _.charAt(0).toUpperCase() + _.slice(1);
  }

  return scaleBar;
}