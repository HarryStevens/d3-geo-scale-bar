// From d3-array by Mike Bostock
// Source: https://github.com/d3/d3-array/blob/master/src/ascending.js
// License: https://github.com/d3/d3-array/blob/master/LICENSE

export default function(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}