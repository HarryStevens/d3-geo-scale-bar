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
      kG,
      kilometers,
      kilometersTickValues,
      kilometersText,
      kilometersRadius = 6371,
      height = 4,
      left = 0,
      top = 0;

  function scaleBar(context){
    var bounds = geoBounds(feature);

    var vert_point_a_projected = projection([0, bounds[0][1]]);
    var vert_point_b_projected = projection([0, bounds[1][1]]);
    var height_projected = Math.abs(vert_point_a_projected[1] - vert_point_b_projected[1]);

    var bottom = Math.abs((bounds[1][1] - bounds[0][1]) * top);
    var point_a = [bounds[0][0], bottom];
    var point_b = [bounds[1][0], bottom];
    var distance_radians = geoDistance(point_a, point_b)

    var distance_miles = distance_radians * milesRadius;
    var distance_kilometers = distance_radians * kilometersRadius;

    var point_a_projected = projection(point_a);
    var point_b_projected = projection(point_b);
    var width_projected = point_b_projected[0] - point_a_projected[0];
    
    // A very simple algorith for determining a good mileage / kilometerage. This can be overridden.
    miles = miles || Math.pow(10, countDigits(distance_miles) - 1);
    var miles_proportion_of_whole = miles / distance_miles;
    var miles_width_of_bar = miles_proportion_of_whole * width_projected;

    kilometers = kilometers || Math.pow(10, countDigits(distance_kilometers) - 1);
    var kilometers_proportion_of_whole = kilometers / distance_kilometers;
    var kilometers_width_of_bar = kilometers_proportion_of_whole * width_projected;

    var top_of_bar = Math.min(vert_point_a_projected[1], vert_point_b_projected[1]) + (height_projected * top);
    var left_of_bar = Math.min(point_a_projected[0], point_b_projected[0]) + (width_projected * left);

    context.attr("width", extent[0]).attr("height", extent[1]);

    var milesScale = scaleLinear()
      .range([0, miles_width_of_bar])
      .domain([0, miles]);

    var milesAxis = axisBottom(milesScale)
      .tickValues(milesTickValues ? milesTickValues : [0, miles / 4, miles / 2, miles])
      .tickSize(height);

    mG = mG || context.append("g")
        .attr("class", "miles");

    mG
        .attr("transform", "translate(" + left_of_bar + ", " + (top_of_bar + 14) + ")")
        .call(milesAxis);

    var milesRects = mG.selectAll("rect")
        .data(milesAxis.tickValues().map(function(d, i, data){ return [d, data[i + 1]]; }).filter(function(d, i, data){ return i !== data.length - 1; }));

    milesRects.enter().append("rect")
        .attr("height", height)
        .style("stroke", "#000")
        .style("fill", function(d, i){ return i % 2 === 0 ? "#000" : "#fff"; })
      .merge(milesRects)
        .attr("x", function(d){ return milesScale(d[0]); })
        .attr("width", function(d){ return milesScale(d[1] - d[0]); });

    milesText = milesText || mG.append("text")
      .attr("class", "label")
      .style("fill", "black")
      .style("text-anchor", "start")
      .style("font-size", "12px")
      .attr("y", -4)
      .text("Miles");

    var kilometersScale = scaleLinear()
      .range([0, kilometers_width_of_bar])
      .domain([0, kilometers]);

    var kilometersAxis = axisBottom(kilometersScale)
      .tickValues(kilometersTickValues ? kilometersTickValues : [0, kilometers / 4, kilometers / 2, kilometers])
      .tickSize(height);

    kG = kG || context.append("g")
    kG
        .attr("class", "kilometers")
        .attr("transform", "translate(" + left_of_bar + ", " + (top_of_bar + 50) + ")")
        .call(kilometersAxis);

    var kilometersRects = kG.selectAll("rect")
        .data(kilometersAxis.tickValues().map(function(d, i, data){ return [d, data[i + 1]]; }).filter(function(d, i, data){ return i !== data.length - 1; }));

    kilometersRects.enter().append("rect")
        .attr("height", height)
        .style("stroke", "#000")
        .style("fill", function(d, i){ return i % 2 === 0 ? "#000" : "#fff"; })
      .merge(kilometersRects)
        .attr("x", function(d){ return kilometersScale(d[0]); })
        .attr("width", function(d){ return kilometersScale(d[1] - d[0]); });

    kilometersText = kilometersText || kG.append("text")
      .attr("class", "label")
      .style("fill", "black")
      .style("text-anchor", "start")
      .style("font-size", "12px")
      .attr("y", -4)
      .text("Kilometers");
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

  scaleBar.kilometers = function(_) {
    return arguments.length ? (kilometers = +_, scaleBar) : kilometers;
  }

  scaleBar.kilometersRadius = function(_) {
    return arguments.length ? (kilometersRadius = +_, scaleBar) : kilometersRadius;
  }

  scaleBar.kilometersTickValues = function(_) {
    return arguments.length ? (kilometersTickValues = _, scaleBar) : kilometersTickValues;
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

  function countDigits(_){
    return Math.floor(_).toString().length;
  }

  return scaleBar;
}