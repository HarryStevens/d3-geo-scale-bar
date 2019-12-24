// From d3-interpolate by Mike Bostock
// Source: https://github.com/d3/d3-interpolate/blob/master/src/round.js
// License: https://github.com/d3/d3-interpolate/blob/master/LICENSE

export default function(a, b) {
  return a = +a, b = +b, function(t) {
    return Math.round(a * (1 - t) + b * t);
  };
}