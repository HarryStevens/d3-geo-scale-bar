// From d3-array by Mike Bostock
// Source: https://github.com/d3/d3-array/blob/master/src/bisect.js
// License: https://github.com/d3/d3-array/blob/master/LICENSE

import ascending from "./ascending";
import bisector from "./bisector";

const ascendingBisect = bisector(ascending);
export const bisectRight = ascendingBisect.right;
export const bisectLeft = ascendingBisect.left;
export default bisectRight;