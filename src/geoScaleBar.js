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
      scaleFactor = 1;

  function scaleBar(context){
    var bounds = geoBounds(feature);

    // debugger

    // Calculate the geo height in pixel.
    var vert_point_a_projected = projection([0, bounds[0][1]]);
    var vert_point_b_projected = projection([0, bounds[1][1]]);
    var height_projected = Math.abs(vert_point_a_projected[1] - vert_point_b_projected[1]);

    // Calculate the geo width in miles.
    var bottom = Math.abs((bounds[1][1] - bounds[0][1]) * top);
    var point_a = [bounds[0][0], bottom];
    var point_b = [bounds[1][0], bottom];
    var distance_radians = geoDistance(point_a, point_b)

    var distance_miles = distance_radians * milesRadius;

    // Calulate the geo width in pixel.
    var point_a_projected = projection(point_a);
    var point_b_projected = projection(point_b);
    var width_projected = point_b_projected[0] - point_a_projected[0];
    
    // Calculete a reasonable miles value. TODO OLD.
    // miles = miles * 1/scaleFactor || Math.pow(10, countDigits(distance_miles) - 1);
    // var miles_proportion_of_whole = miles / distance_miles;
    // var miles_width_of_bar = miles_proportion_of_whole * width_projected;

    // Calculete a reasonable initial miles value. 
    var initialMiles = miles || Math.pow(10, countDigits(distance_miles) - 1);

    // Calculate the bar width for the range (which will remain).
    var miles_proportion_of_whole = initialMiles / distance_miles;
    var miles_width_of_bar = miles_proportion_of_whole * width_projected;

    // Set the width and height of the g element.
    var top_of_bar = Math.min(vert_point_a_projected[1], vert_point_b_projected[1]) + (height_projected * top);
    var left_of_bar = Math.min(point_a_projected[0], point_b_projected[0]) + (width_projected * left);

    // Not necessary:
    // context.attr("width", extent[0]).attr("height", extent[1]);

    // Calculate the initial, static scale.
    var milesScaleInitial = scaleLinear()
      .domain([0, initialMiles])
      .range([0, miles_width_of_bar]); 

    // Calculate the scaled miles.
    var appliedMiles = initialMiles * scaleFactor;
    var rMaxNew = miles_width_of_bar / scaleFactor;
    var dMaxNew = milesScaleInitial.invert(rMaxNew)

    // console.log(initialMiles, miles_width_of_bar, appliedMiles);
    // console.log(dMaxNew)
    // if (scaleFactor > 2) debugger

    var milesScale = scaleLinear()
      .domain([0, dMaxNew])
      .range([0, miles_width_of_bar])

    var milesAxis = axisBottom(milesScale)
      // .tickValues(milesTickValues ? milesTickValues : [0, appliedMiles / 4, appliedMiles / 2, appliedMiles])
      // .tickValues(milesTickValues ? milesTickValues : [0, dMaxNew / 4, dMaxNew / 2, dMaxNew])
      // .tickValues(milesTickValues ? milesTickValues : [0, initialMiles / 4, initialMiles / 2, initialMiles])
      .ticks(5)
      .tickSize(0)
      .tickPadding(6);

    mG = mG || context.append("g")
        .attr("class", "miles");

    mG
        .attr("transform", "translate(" + left_of_bar + ", " + (top_of_bar + 14) + ")")
        .call(milesAxis);


    // d3.selectAll('.line-dash').remove();

    var tickValues = d3.selectAll('.tick').data();
    var tickLength = tickValues.length;
    var lastValue = tickValues.filter((d,i,data) => i === data.length-1)[0]
    var lastValuePixel = milesScale(lastValue);
    var dashLengthPixel = lastValuePixel / (tickLength - 1)


    var domainPath = d3.select('.domain');

    domainPath
      .style('stroke-width', 6)
      .style('stroke-dashoffset', -3.5)
      .style('stroke-dasharray', `${dashLengthPixel}, ${dashLengthPixel}`);



    // console.log(tickLength, lastValue, lastValuePixel, dashLengthPixel);

    // var mL = mG.append('line')
    //   .attr('class', 'line-dash')
    //   .attr('x0', 0)
    //   .attr('x1', miles_width_of_bar)
    //   .style('stroke-width', 5)
    //   .style('stroke', 'tomato')
    //   .style('stroke-dashoffset', '0%')
    //   .style('stroke-dasharray', `${dashLengthPixel}, ${dashLengthPixel}`)



    // var rectData = milesAxis.tickValues()
    //   .map(function(d, i, data) { return [d, data[i + 1]]; })
    //   .filter(function(d, i, data) { return i !== data.length - 1; })


    // var milesRects = mG.selectAll("rect")
    //     .data(rectData);

    // milesRects.exit().remove();

    // milesRects.enter().append("rect")
    //     .attr("height", height)
    //     .style("stroke", "#000")
    //     .style("fill", function(d, i){ return i % 2 === 0 ? "#000" : "#fff"; })
    //   .merge(milesRects)
    //     .attr("x", function(d){ return milesScale(d[0]); })
    //     .attr("width", function(d){ return milesScale(d[1] - d[0]); });

    // milesText = milesText || mG.append("text")
    //   .attr("class", "label")
    //   .style("fill", "#000")
    //   .style("text-anchor", "start")
    //   .style("font-size", "12px")
    //   .attr("y", -4)
    //   .text("Miles");


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
    return arguments.length ? (scaleFactor = _) : scaleFactor;
  }

  function countDigits(_){
    return Math.floor(_).toString().length;
  }

  return scaleBar;
}