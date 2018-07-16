import {geoBounds, geoDistance} from "d3-geo";

export default function(){
  var extent,
      projection,
      feature,
      mG,
      kG,
      mRect,
      kRect,
      mText,
      kText,
      miles,
      kilometers,
      radiusMiles = 3959,
      radiusKilometers = 6371,
      height = 1,
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

    var distance_miles = distance_radians * radiusMiles;
    var distance_kilometers = distance_radians * radiusKilometers;

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

    mG = mG || context.append("g")
        .attr("class", "miles");

    mRect = mRect || mG.append("rect");
    mRect
      .attr("width", miles_width_of_bar)
      .attr("height", height)
      .attr("transform", "translate(0, 12)")
      .attr("y", top_of_bar)
      .attr("x", left_of_bar);

    mText = mText || mG.append("text");
    mText
      .attr("x", left_of_bar)
      .attr("y", top_of_bar - 3)
      .attr("transform", "translate(0, 12)")
      .style("font-family", "sans-serif")
      .style("font-size", "12px")
      .text(numberCommas(miles) + " mile" + (miles === 1 ? "" : "s"));

    kG = kG || context.append("g")
        .attr("class", "kilometers");

    kRect = kRect || kG.append("rect");
    kRect
      .attr("width", kilometers_width_of_bar)
      .attr("height", height)
      .attr("transform", "translate(0, 42)")
      .attr("y", top_of_bar)
      .attr("x", left_of_bar);

    kText = kText || kG.append("text");
    kText
      .attr("x", left_of_bar)
      .attr("y", top_of_bar - 3)
      .attr("transform", "translate(0, 42)")
      .style("font-family", "sans-serif")
      .style("font-size", "12px")
      .text(numberCommas(kilometers) + " kilometer" + (kilometers === 1 ? "" : "s"));
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

  scaleBar.radiusMiles = function(_) {
    return arguments.length ? (radiusMiles = +_, scaleBar) : radiusMiles;
  }

  scaleBar.radiusKilometers = function(_) {
    return arguments.length ? (radiusKilometers = +_, scaleBar) : radiusKilometers;
  }

  scaleBar.miles = function(_) {
    return arguments.length ? (miles = +_, scaleBar) : miles;
  }

  scaleBar.kilometers = function(_) {
    return arguments.length ? (kilometers = +_, scaleBar) : kilometers;
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

  function numberCommas(_){
    return _.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return scaleBar;
}