// Adapted from d3-scale by Mike Bostock
// Source: https://github.com/d3/d3-scale/blob/master/src/linear.js
// License: https://github.com/d3/d3-scale/blob/master/LICENSE

import { ticks } from "../array/ticks";
import continuous, { copy } from "./continuous";
import { initRange } from "./init";
import tickFormat from "./tickFormat.js";

export function linearish(scale) {
  var domain = scale.domain;

  scale.tickFormat = function(count, specifier) {
    var d = domain();
    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
  };

  scale.ticks = function(count) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };

  return scale;
}

export default function linear() {
  var scale = continuous();

  scale.copy = function() {
    return copy(scale, linear());
  };

  initRange.apply(scale, arguments);

  return linearish(scale);
}