import { default as geoDistance } from "./geo/distance";

export default function(){
  let extent = null,
      projection,
      height = 4,
      left = 0,
      top = 0,
      units = "kilometers",
      distance,
      radius = 6371,
      tickValues,
      tickFormat = d => Math.round(d),
      label,
      labelAnchor = "start",
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
    const barWidth = extent[1][0] - extent[0][0],
          barHeight = extent[1][1] - extent[0][1];
    
    context.attr("width", barWidth).attr("height", barHeight);
    
    const x = extent[0][0] + barWidth * left,
          y = extent[0][1] + barHeight * top,
          start = projection.invert([x, y]);
    
    distance = distance || Math.pow(10, countDigits(geoDistance(projection.invert(extent[0]), projection.invert([extent[1][0], extent[0][1]])) * radius) - 1);
    
    const w = distance / (geoDistance(start, projection.invert([x + 1, y])) * radius),
          scale = dist => dist * w / (distance / scaleFactor),
          tickMax = distance / scaleFactor,
          ticks = tickValues === null ? [] : tickValues ? tickValues : [0, tickMax / 4, tickMax / 2, tickMax];
    
    let g = context.select("g")
    if (!g._groups[0][0]) {
      g = context.append("g");
    }
    g.attr("transform", `translate(${[x, y]})`);
    
    let baseline = g.select(".baseline")
    if (!baseline._groups[0][0]) {
      baseline = g.append("rect")
          .attr("class", "baseline");
    }
    baseline
        .attr("fill", "black")
        .attr("height", height)
        .attr("width", scale(tickMax));

    const rects = g.selectAll(".rectangle")
        .data(ticks.map((d, i, data) => [d, data[i + 1]]).filter((d, i, data) => i !== data.length - 1));

    rects.exit().remove();

    rects.enter().append("rect")
        .attr("class", "rectangle")
        .attr("height", height)
        .attr("stroke", "#000")
        .attr("fill", (d, i) => i % 2 === 0 ? "#000" : "#fff")
      .merge(rects)
        .attr("x", d => scale(d[0]))
        .attr("width", d => scale(d[1] - d[0]));

    const valueText = g.selectAll(".value")
        .data(ticks);
    
    valueText.exit().remove();
    
    valueText.enter().append("text")
        .attr("class", "value")
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
      .merge(valueText)
        .attr("x", scale)
        .attr("y", height + 11)
        .text(tickFormat); 
    
    let labelText = g.select(".label");
    if (!labelText._groups[0][0]){
      labelText = g.append("text")
          .attr("class", "label")
    }
    labelText
        .attr("x", labelAnchor === "start" ? 0 : labelAnchor === "middle" ? scale(tickMax / 2) : scale(tickMax))
        .attr("class", "label")
        .attr("fill", "#000")
        .attr("text-anchor", labelAnchor)
        .attr("font-size", 14)
        .attr("font-family", "sans-serif")
        .attr("y", -4);
    
    labelText.text(label || capitalizeFirstLetter(units));
  }

  scaleBar.extent = function(_) {
    return arguments.length ? (extent = _, scaleBar) : extent;
  }
  
  scaleBar.size = function(_) {
    return arguments.length ? (extent = [[0, 0], _], scaleBar) : extent[1];
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
  
  scaleBar.tickFormat = function(_) {
    return arguments.length ? (tickFormat = _, scaleBar) : tickFormat;
  }

  scaleBar.label = function(_) {
    return arguments.length ? (label = _, scaleBar) : label;
  }
  
  scaleBar.labelAnchor = function(_) {
    return arguments.length ? (labelAnchor = _, scaleBar) : labelAnchor;
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