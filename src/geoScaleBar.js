import { axisBottom } from "./axis/axis";
import { default as geoDistance } from "./geo/distance";
import { default as scaleLinear } from "./scale/linear";

export default function(){
  let extent,
      projection,
      height = 4,
      left = 0,
      top = 0,
      units = "kilometers",
      distance,
      radius = 6371,
      tickValues,
      label,
      scaleFactor = 1;

  const unitPresets = {
        "miles": {
          radius: 3959
        },
        "kilometers": {
          radius: 6371
        }
      };
  
  function scaleBar(context){
    context.attr("width", extent[0]).attr("height", extent[1]);
    
    const x = extent[0] * left,
          y = extent[1] * top,
          start = projection.invert([x, y]);
    
    distance = distance || Math.pow(10, countDigits(geoDistance(projection.invert([0, 0]), projection.invert([0, extent[1]])) * radius) - 1);
    
    const w = distance / (geoDistance(start, projection.invert([x + 1, y])) * radius);
    
    const scale = scaleLinear()
        .range([0, w])
        .domain([0, distance]);

    if (scaleFactor !== 1){
      scale
          .domain([0, scale.invert(w / scaleFactor)]);
    }

    const tickMax = scale.domain()[1];
    
    const axis = axisBottom()
        .scale(scale)
        .tickValues(tickValues ? tickValues : [0, tickMax / 4, tickMax / 2, tickMax])
        .tickSize(height);
    
    let g = context.select("g")
    if (!g._groups[0][0]) {
      g = context.append("g")
          .attr("class", "scale-bar");
    }
    g
        .attr("transform", "translate(" + (extent[0] * left) + ", " + (extent[1] * top) + ")")
        .call(axis);

    const rects = g.selectAll("rect")
        .data(axis.tickValues().map((d, i, data) => [d, data[i + 1]]).filter((d, i, data) => i !== data.length - 1));

    rects.exit().remove();

    rects.enter().append("rect")
        .attr("height", height)
        .style("stroke", "#000")
        .style("fill", (d, i) => i % 2 === 0 ? "#000" : "#fff")
      .merge(rects)
        .attr("x", d => scale(d[0]))
        .attr("width", d => scale(d[1] - d[0]));

    let text = g.select(".label");
    if (!text._groups[0][0]){
      text = g.append("text")
          .attr("class", "label")
    }
    text
      .attr("class", "label")
      .style("fill", "#000")
      .style("text-anchor", "start")
      .style("font-size", "12px")
      .attr("y", -4);
    
    text.text(label || capitalizeFirstLetter(units));
  }

  scaleBar.extent = function(_) {
    return arguments.length ? (extent = _, scaleBar) : extent;
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