import { default as geoDistance } from "./geo/distance";

export default function(){
  let extent = null,
      projection,
      left = 0,
      top = 0,
      units = "kilometers",
      distance,
      radius = 6371,
      tickValues,
      tickFormat = d => Math.round(d),
      tickSize = 4,
      labelText,
      labelAnchor = "start",
      zoomFactor = 1;

  const unitPresets = {
        "miles": {
          radius: 3959
        },
        "kilometers": {
          radius: 6371
        }
      };

  function scaleBar(context){    
    // If a label has not been explicitly set, set it
    labelText = labelText === null ? null : labelText || units.charAt(0).toUpperCase() + units.slice(1);
    
    // The position, width, and ticks of the scale bar
    let width = extent[1][0] - extent[0][0],
        height = extent[1][1] - extent[0][1],
        x = extent[0][0] + width * left,
        y = extent[0][1] + height * top,
        start = projection.invert([x, y]);
    
    // If the distance has been set explicitly
    let barDistance = 0, barWidth = 0;
    if (distance){
      barDistance = distance;
      barWidth = barDistance / (geoDistance(start, projection.invert([x + 1, y])) * radius);
    }
    // Otherwise, make it an exponent of 10 or 10 * 4 with a minimum width of 60px
    else {
      let dist = .01, minWidth = 60, iters = 0, maxiters = 100;
      
      while (barWidth < minWidth && iters < maxiters){
        barDistance = dist;
        barWidth = barDistance / (geoDistance(start, projection.invert([x + 1, y])) * radius);
        if (barWidth >= minWidth) {break;}
        barDistance = dist * 4;
        barWidth = barDistance / (geoDistance(start, projection.invert([x + 1, y])) * radius);
        dist *= 10;
        iters++;
      }
    }
    
    let max = barDistance / zoomFactor,
        values = tickValues === null ? [] : tickValues ? tickValues : [0, max / 4, max / 2, max],
        scale = dist => dist * barWidth / (barDistance / zoomFactor),
        selection = context.selection ? context.selection() : context,
        label = selection.selectAll(".label").data([labelText]),
        path = selection.selectAll(".domain").data([null]),
        tick = selection.selectAll(".tick").data(values, scale).order(),
        tickExit = tick.exit(),
        tickEnter = tick.enter().append("g").attr("class", "tick"),
        line = tick.select("line"),
        text = tick.select("text"),
        rect = tick.select("rect");
    
    selection
        .attr("font-family", "sans-serif")
        .attr("transform", `translate(${[x, y]})`);
    
    path = path.merge(path.enter().insert("path", ".tick")
        .attr("class", "domain")
        .attr("fill", "none")
        .attr("stroke", "currentColor"));
    
    tick = tick.merge(tickEnter);
    
    line = line.merge(tickEnter.append("line")
        .attr("stroke", "currentColor")
        .attr("y2", tickSize));

    text = text.merge(tickEnter.append("text")
        .attr("fill", "currentColor")
        .attr("y", tickSize + 2)
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("dy", "0.71em"));
    
    rect = rect.merge(tickEnter.append("rect")
        .attr("fill", (d, i) => i % 2 === 0 ?  "currentColor" : "#fff")
        .attr("stroke", "currentColor")
        .attr("stroke-width", 0.5)
        .attr("width", (d, i, e) => i === e.length - 1 ? 0 : scale(values[i + 1] - d))
        .attr("height", tickSize));
    
    if (context !== selection){
      tick = tick.transition(context);
      path = path.transition(context);
      rect = rect.transition(context);
      
      tickExit = tickExit.transition(context)
          .attr("opacity", 1e-6)
          .attr("transform", d => `translate(${scale(d)})`);
      
      tickEnter
          .attr("opacity", 1e-6)
          .attr("transform", d => `translate(${scale(d)})`);
    }
    
    tickExit.remove();
    
    path
        .attr("d", `M${scale(0)},${tickSize} L${scale(0)},0 L${scale(max)},0 L${scale(max)},${tickSize}`);
    
    tick
        .attr("transform", d => `translate(${scale(d)})`)
        .attr("opacity", 1);
    
    line
        .attr("y2", tickSize);

    text
        .attr("y", tickSize + 2)
        .text(tickFormat);
    
    rect
        .attr("fill", (d, i) => i % 2 === 0 ?  "currentColor" : "#fff")
        .attr("width", (d, i, e) => i === e.length - 1 ? 0 : scale(values[i + 1] - d))
        .attr("height", tickSize);
    
    // The label
    if (label === null) {
      label.remove();
    }
    else {
      label.enter().append("text")
          .attr("class", "label")
          .attr("fill", "currentColor")
          .attr("font-size", 12)
          .attr("dy", "-0.32em")
        .merge(label)
          .attr("x", labelAnchor === "start" ? 0 : labelAnchor === "middle" ? scale(max / 2) : scale(max))
          .attr("text-anchor", labelAnchor)
          .text(d => d);
    }

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

  scaleBar.left = function(_) {
    return arguments.length ? (left = +_ > 1 ? 1 : +_ < 0 ? 0 : +_, scaleBar) : left;
  }

  scaleBar.top = function(_) {
    return arguments.length ? (top = +_ > 1 ? 1 : +_ < 0 ? 0 : +_, scaleBar) : top;
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
  
  scaleBar.tickSize = function(_) {
    return arguments.length ? (tickSize = +_, scaleBar) : tickSize;
  }

  scaleBar.label = function(_) {
    return arguments.length ? (labelText = _, scaleBar) : labelText;
  }
  
  scaleBar.labelAnchor = function(_) {
    return arguments.length ? (labelAnchor = _, scaleBar) : labelAnchor;
  }

  scaleBar.zoomFactor = function(_) {
    return arguments.length ? (zoomFactor = +_, scaleBar) : zoomFactor;
  }

  return scaleBar;
}