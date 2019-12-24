// https://github.com/HarryStevens/d3-geo-scale-bar Version 0.2.0. Copyright 2019 Harry Stevens.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

  // Adapted from d3-axis by Mike Bostock
  // Source: https://github.com/d3/d3-axis/blob/master/src/axis.js
  // License: https://github.com/d3/d3-axis/blob/master/LICENSE
  var slice = Array.prototype.slice;
  var bottom = 3,
      epsilon = 1e-6;

  function translateX(x) {
    return "translate(" + (x + 0.5) + ",0)";
  }

  function number(scale) {
    return function (d) {
      return +scale(d);
    };
  }

  function entering() {
    return !this.__axis;
  }

  function axis(orient, scale) {
    var tickArguments = [],
        tickValues = null,
        tickFormat = null,
        tickSizeInner = 6,
        tickSizeOuter = 6,
        tickPadding = 3,
        k = 1,
        x = "y",
        transform = translateX;

    function axis(context) {
      var values = tickValues == null ? scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain() : tickValues,
          format = tickFormat == null ? scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : function (x) {
        return x;
      } : tickFormat,
          spacing = Math.max(tickSizeInner, 0) + tickPadding,
          range = scale.range(),
          range0 = +range[0] + 0.5,
          range1 = +range[range.length - 1] + 0.5,
          position = number(scale.copy()),
          selection = context.selection ? context.selection() : context,
          path = selection.selectAll(".domain").data([null]),
          tick = selection.selectAll(".tick").data(values, scale).order(),
          tickExit = tick.exit(),
          tickEnter = tick.enter().append("g").attr("class", "tick"),
          line = tick.select("line"),
          text = tick.select("text");
      path = path.merge(path.enter().insert("path", ".tick").attr("class", "domain").attr("stroke", "#000"));
      tick = tick.merge(tickEnter);
      line = line.merge(tickEnter.append("line").attr("stroke", "#000").attr(x + "2", k * tickSizeInner));
      text = text.merge(tickEnter.append("text").attr("fill", "#000").attr(x, k * spacing).attr("dy", "0.71em"));

      if (context !== selection) {
        path = path.transition(context);
        tick = tick.transition(context);
        line = line.transition(context);
        text = text.transition(context);
        tickExit = tickExit.transition(context).attr("opacity", epsilon).attr("transform", function (d) {
          return isFinite(d = position(d)) ? transform(d) : this.getAttribute("transform");
        });
        tickEnter.attr("opacity", epsilon).attr("transform", function (d) {
          var p = this.parentNode.__axis;
          return transform(p && isFinite(p = p(d)) ? p : position(d));
        });
      }

      tickExit.remove();
      path.attr("d", tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V0.5H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + ",0.5H" + range1);
      tick.attr("opacity", 1).attr("transform", function (d) {
        return transform(position(d));
      });
      line.attr(x + "2", k * tickSizeInner);
      text.attr(x, k * spacing).text(format);
      selection.filter(entering).attr("fill", "none").attr("font-size", 10).attr("font-family", "sans-serif").attr("text-anchor", "middle");
      selection.each(function () {
        this.__axis = position;
      });
    }

    axis.scale = function (_) {
      return arguments.length ? (scale = _, axis) : scale;
    };

    axis.ticks = function () {
      return tickArguments = slice.call(arguments), axis;
    };

    axis.tickArguments = function (_) {
      return arguments.length ? (tickArguments = _ == null ? [] : slice.call(_), axis) : tickArguments.slice();
    };

    axis.tickValues = function (_) {
      return arguments.length ? (tickValues = _ == null ? null : slice.call(_), axis) : tickValues && tickValues.slice();
    };

    axis.tickFormat = function (_) {
      return arguments.length ? (tickFormat = _, axis) : tickFormat;
    };

    axis.tickSize = function (_) {
      return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
    };

    axis.tickSizeInner = function (_) {
      return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
    };

    axis.tickSizeOuter = function (_) {
      return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
    };

    axis.tickPadding = function (_) {
      return arguments.length ? (tickPadding = +_, axis) : tickPadding;
    };

    return axis;
  }

  function axisBottom(scale) {
    return axis(bottom, scale);
  }

  // Adds floating point numbers with twice the normal precision.
  // Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
  // Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
  // 305–363 (1997).
  // Code adapted from GeographicLib by Charles F. F. Karney,
  // http://geographiclib.sourceforge.net/
  // ...which was taken from d3-geo by Mike Bostock
  // Source: https://github.com/d3/d3-geo/blob/master/src/adder.js
  // License: https://github.com/d3/d3-geo/blob/master/LICENSE
  function adder () {
    return new Adder();
  }

  function Adder() {
    this.reset();
  }

  Adder.prototype = {
    constructor: Adder,
    reset: function reset() {
      this.s = // rounded value
      this.t = 0; // exact error
    },
    add: function add(y) {
      _add(temp, y, this.t);

      _add(this, temp.s, this.s);

      if (this.s) this.t += temp.t;else this.s = temp.t;
    },
    valueOf: function valueOf() {
      return this.s;
    }
  };
  var temp = new Adder();

  function _add(adder, a, b) {
    var x = adder.s = a + b,
        bv = x - a,
        av = x - bv;
    adder.t = a - av + (b - bv);
  }

  // Adapted from d3-geo by Mike Bostock
  // Source: https://github.com/d3/d3-geo/blob/master/src/math.js
  // License: https://github.com/d3/d3-geo/blob/master/LICENSE
  var abs = Math.abs;
  var atan2 = Math.atan2;
  var cos = Math.cos;
  var radians = Math.PI / 180;
  var sin = Math.sin;
  var sqrt = Math.sqrt;

  // From d3-geo by Mike Bostock
  // Source: https://github.com/d3/d3-geo/blob/master/src/noop.js
  // License: https://github.com/d3/d3-geo/blob/master/LICENSE
  function noop() {}

  // From d3-geo by Mike Bostock
  // Source: https://github.com/d3/d3-geo/blob/master/src/stream.js
  // License: https://github.com/d3/d3-geo/blob/master/LICENSE
  function streamGeometry(geometry, stream) {
    if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
      streamGeometryType[geometry.type](geometry, stream);
    }
  }

  var streamObjectType = {
    Feature: function Feature(object, stream) {
      streamGeometry(object.geometry, stream);
    },
    FeatureCollection: function FeatureCollection(object, stream) {
      var features = object.features,
          i = -1,
          n = features.length;

      while (++i < n) {
        streamGeometry(features[i].geometry, stream);
      }
    }
  };
  var streamGeometryType = {
    Sphere: function Sphere(object, stream) {
      stream.sphere();
    },
    Point: function Point(object, stream) {
      object = object.coordinates;
      stream.point(object[0], object[1], object[2]);
    },
    MultiPoint: function MultiPoint(object, stream) {
      var coordinates = object.coordinates,
          i = -1,
          n = coordinates.length;

      while (++i < n) {
        object = coordinates[i], stream.point(object[0], object[1], object[2]);
      }
    },
    LineString: function LineString(object, stream) {
      streamLine(object.coordinates, stream, 0);
    },
    MultiLineString: function MultiLineString(object, stream) {
      var coordinates = object.coordinates,
          i = -1,
          n = coordinates.length;

      while (++i < n) {
        streamLine(coordinates[i], stream, 0);
      }
    },
    Polygon: function Polygon(object, stream) {
      streamPolygon(object.coordinates, stream);
    },
    MultiPolygon: function MultiPolygon(object, stream) {
      var coordinates = object.coordinates,
          i = -1,
          n = coordinates.length;

      while (++i < n) {
        streamPolygon(coordinates[i], stream);
      }
    },
    GeometryCollection: function GeometryCollection(object, stream) {
      var geometries = object.geometries,
          i = -1,
          n = geometries.length;

      while (++i < n) {
        streamGeometry(geometries[i], stream);
      }
    }
  };

  function streamLine(coordinates, stream, closed) {
    var i = -1,
        n = coordinates.length - closed,
        coordinate;
    stream.lineStart();

    while (++i < n) {
      coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
    }

    stream.lineEnd();
  }

  function streamPolygon(coordinates, stream) {
    var i = -1,
        n = coordinates.length;
    stream.polygonStart();

    while (++i < n) {
      streamLine(coordinates[i], stream, 1);
    }

    stream.polygonEnd();
  }

  function stream (object, stream) {
    if (object && streamObjectType.hasOwnProperty(object.type)) {
      streamObjectType[object.type](object, stream);
    } else {
      streamGeometry(object, stream);
    }
  }

  // From d3-geo by Mike Bostock
  var lengthSum = adder(),
      lambda0,
      sinPhi0,
      cosPhi0;
  var lengthStream = {
    sphere: noop,
    point: noop,
    lineStart: lengthLineStart,
    lineEnd: noop,
    polygonStart: noop,
    polygonEnd: noop
  };

  function lengthLineStart() {
    lengthStream.point = lengthPointFirst;
    lengthStream.lineEnd = lengthLineEnd;
  }

  function lengthLineEnd() {
    lengthStream.point = lengthStream.lineEnd = noop;
  }

  function lengthPointFirst(lambda, phi) {
    lambda *= radians, phi *= radians;
    lambda0 = lambda, sinPhi0 = sin(phi), cosPhi0 = cos(phi);
    lengthStream.point = lengthPoint;
  }

  function lengthPoint(lambda, phi) {
    lambda *= radians, phi *= radians;
    var sinPhi = sin(phi),
        cosPhi = cos(phi),
        delta = abs(lambda - lambda0),
        cosDelta = cos(delta),
        sinDelta = sin(delta),
        x = cosPhi * sinDelta,
        y = cosPhi0 * sinPhi - sinPhi0 * cosPhi * cosDelta,
        z = sinPhi0 * sinPhi + cosPhi0 * cosPhi * cosDelta;
    lengthSum.add(atan2(sqrt(x * x + y * y), z));
    lambda0 = lambda, sinPhi0 = sinPhi, cosPhi0 = cosPhi;
  }

  function length (object) {
    lengthSum.reset();
    stream(object, lengthStream);
    return +lengthSum;
  }

  // From d3-geo by Mike Bostock
  var coordinates = [null, null],
      object = {
    type: "LineString",
    coordinates: coordinates
  };
  function geoDistance (a, b) {
    coordinates[0] = a;
    coordinates[1] = b;
    return length(object);
  }

  // From d3-array by Mike Bostock
  // Source: https://github.com/d3/d3-array/blob/master/src/ticks.js
  // License: https://github.com/d3/d3-array/blob/master/LICENSE
  var e10 = Math.sqrt(50),
      e5 = Math.sqrt(10),
      e2 = Math.sqrt(2);
  function ticks(start, stop, count) {
    var reverse,
        i = -1,
        n,
        ticks,
        step;
    stop = +stop, start = +start, count = +count;
    if (start === stop && count > 0) return [start];
    if (reverse = stop < start) n = start, start = stop, stop = n;
    if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

    if (step > 0) {
      start = Math.ceil(start / step);
      stop = Math.floor(stop / step);
      ticks = new Array(n = Math.ceil(stop - start + 1));

      while (++i < n) {
        ticks[i] = (start + i) * step;
      }
    } else {
      start = Math.floor(start * step);
      stop = Math.ceil(stop * step);
      ticks = new Array(n = Math.ceil(start - stop + 1));

      while (++i < n) {
        ticks[i] = (start - i) / step;
      }
    }

    if (reverse) ticks.reverse();
    return ticks;
  }
  function tickIncrement(start, stop, count) {
    var step = (stop - start) / Math.max(0, count),
        power = Math.floor(Math.log(step) / Math.LN10),
        error = step / Math.pow(10, power);
    return power >= 0 ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power) : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
  }
  function tickStep(start, stop, count) {
    var step0 = Math.abs(stop - start) / Math.max(0, count),
        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
        error = step0 / step1;
    if (error >= e10) step1 *= 10;else if (error >= e5) step1 *= 5;else if (error >= e2) step1 *= 2;
    return stop < start ? -step1 : step1;
  }

  // From d3-array by Mike Bostock
  // Source: https://github.com/d3/d3-array/blob/master/src/ascending.js
  // License: https://github.com/d3/d3-array/blob/master/LICENSE
  function ascending (a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  // From d3-array by Mike Bostock
  function bisector (compare) {
    if (compare.length === 1) compare = ascendingComparator(compare);
    return {
      left: function left(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;

        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;else hi = mid;
        }

        return lo;
      },
      right: function right(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;

        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;else lo = mid + 1;
        }

        return lo;
      }
    };
  }

  function ascendingComparator(f) {
    return function (d, x) {
      return ascending(f(d), x);
    };
  }

  // From d3-array by Mike Bostock
  var ascendingBisect = bisector(ascending);
  var bisectRight = ascendingBisect.right;

  // From d3-interpolate by Mike Bostock
  // Source: https://github.com/d3/d3-interpolate/blob/master/src/number.js
  // License: https://github.com/d3/d3-interpolate/blob/master/LICENSE
  function number$1 (a, b) {
    return a = +a, b = +b, function (t) {
      return a * (1 - t) + b * t;
    };
  }

  // From d3-interpolate by Mike Bostock
  // Source: https://github.com/d3/d3-interpolate/blob/master/src/round.js
  // License: https://github.com/d3/d3-interpolate/blob/master/LICENSE
  function interpolateRound (a, b) {
    return a = +a, b = +b, function (t) {
      return Math.round(a * (1 - t) + b * t);
    };
  }

  // Adapted from d3-interpolate by Mike Bostock
  function interpolateValue (a, b) {
    return number$1(a, b);
  }

  // From d3-scale by Mike Bostock
  // Source: https://github.com/d3/d3-scale/blob/master/src/constant.js
  // License: https://github.com/d3/d3-scale/blob/master/LICENSE
  function constant (x) {
    return function () {
      return x;
    };
  }

  // From d3-scale by Mike Bostock
  // Source: https://github.com/d3/d3-scale/blob/master/src/number.js
  // License: https://github.com/d3/d3-scale/blob/master/LICENSE
  function number$2 (x) {
    return +x;
  }

  // From d3-scale by Mike Bostock
  var unit = [0, 1];
  function identity(x) {
    return x;
  }

  function normalize(a, b) {
    return (b -= a = +a) ? function (x) {
      return (x - a) / b;
    } : constant(isNaN(b) ? NaN : 0.5);
  }

  function clamper(a, b) {
    var t;
    if (a > b) t = a, a = b, b = t;
    return function (x) {
      return Math.max(a, Math.min(b, x));
    };
  } // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
  // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].


  function bimap(domain, range, interpolate) {
    var d0 = domain[0],
        d1 = domain[1],
        r0 = range[0],
        r1 = range[1];
    if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
    return function (x) {
      return r0(d0(x));
    };
  }

  function polymap(domain, range, interpolate) {
    var j = Math.min(domain.length, range.length) - 1,
        d = new Array(j),
        r = new Array(j),
        i = -1; // Reverse descending domains.

    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }

    while (++i < j) {
      d[i] = normalize(domain[i], domain[i + 1]);
      r[i] = interpolate(range[i], range[i + 1]);
    }

    return function (x) {
      var i = bisectRight(domain, x, 1, j) - 1;
      return r[i](d[i](x));
    };
  }

  function copy(source, target) {
    return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
  }
  function transformer() {
    var domain = unit,
        range = unit,
        interpolate = interpolateValue,
        transform,
        untransform,
        unknown,
        clamp = identity,
        piecewise,
        output,
        input;

    function rescale() {
      var n = Math.min(domain.length, range.length);
      if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
      piecewise = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }

    function scale(x) {
      return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
    }

    scale.invert = function (y) {
      return clamp(untransform((input || (input = piecewise(range, domain.map(transform), number$1)))(y)));
    };

    scale.domain = function (_) {
      return arguments.length ? (domain = Array.from(_, number$2), rescale()) : domain.slice();
    };

    scale.range = function (_) {
      return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
    };

    scale.rangeRound = function (_) {
      return range = Array.from(_), interpolate = interpolateRound, rescale();
    };

    scale.clamp = function (_) {
      return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity;
    };

    scale.interpolate = function (_) {
      return arguments.length ? (interpolate = _, rescale()) : interpolate;
    };

    scale.unknown = function (_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };

    return function (t, u) {
      transform = t, untransform = u;
      return rescale();
    };
  }
  function continuous() {
    return transformer()(identity, identity);
  }

  // From d3-scale by Mike Bostock
  // Source: https://github.com/d3/d3-scale/blob/master/src/init.js
  // License: https://github.com/d3/d3-scale/blob/master/LICENSE
  function initRange(domain, range) {
    switch (arguments.length) {
      case 0:
        break;

      case 1:
        this.range(domain);
        break;

      default:
        this.range(range).domain(domain);
        break;
    }

    return this;
  }

  // Computes the decimal coefficient and exponent of the specified number x with
  // significant digits p, where x is positive and p is in [1, 21] or undefined.
  // For example, formatDecimal(1.23) returns ["123", 0].
  function formatDecimal(x, p) {
    if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
    var i, coefficient = x.slice(0, i);

    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [
      coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
      +x.slice(i + 1)
    ];
  }

  function exponent(x) {
    return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
  }

  function formatGroup(grouping, thousands) {
    return function(value, width) {
      var i = value.length,
          t = [],
          j = 0,
          g = grouping[0],
          length = 0;

      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = grouping[j = (j + 1) % grouping.length];
      }

      return t.reverse().join(thousands);
    };
  }

  function formatNumerals(numerals) {
    return function(value) {
      return value.replace(/[0-9]/g, function(i) {
        return numerals[+i];
      });
    };
  }

  // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
  var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

  function formatSpecifier(specifier) {
    if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
    var match;
    return new FormatSpecifier({
      fill: match[1],
      align: match[2],
      sign: match[3],
      symbol: match[4],
      zero: match[5],
      width: match[6],
      comma: match[7],
      precision: match[8] && match[8].slice(1),
      trim: match[9],
      type: match[10]
    });
  }

  formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

  function FormatSpecifier(specifier) {
    this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
    this.align = specifier.align === undefined ? ">" : specifier.align + "";
    this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
    this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
    this.zero = !!specifier.zero;
    this.width = specifier.width === undefined ? undefined : +specifier.width;
    this.comma = !!specifier.comma;
    this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
    this.trim = !!specifier.trim;
    this.type = specifier.type === undefined ? "" : specifier.type + "";
  }

  FormatSpecifier.prototype.toString = function() {
    return this.fill
        + this.align
        + this.sign
        + this.symbol
        + (this.zero ? "0" : "")
        + (this.width === undefined ? "" : Math.max(1, this.width | 0))
        + (this.comma ? "," : "")
        + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
        + (this.trim ? "~" : "")
        + this.type;
  };

  // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
  function formatTrim(s) {
    out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".": i0 = i1 = i; break;
        case "0": if (i0 === 0) i0 = i; i1 = i; break;
        default: if (i0 > 0) { if (!+s[i]) break out; i0 = 0; } break;
      }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
  }

  var prefixExponent;

  function formatPrefixAuto(x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1],
        i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
        n = coefficient.length;
    return i === n ? coefficient
        : i > n ? coefficient + new Array(i - n + 1).join("0")
        : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
        : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
  }

  function formatRounded(x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
        : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
        : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  var formatTypes = {
    "%": function(x, p) { return (x * 100).toFixed(p); },
    "b": function(x) { return Math.round(x).toString(2); },
    "c": function(x) { return x + ""; },
    "d": function(x) { return Math.round(x).toString(10); },
    "e": function(x, p) { return x.toExponential(p); },
    "f": function(x, p) { return x.toFixed(p); },
    "g": function(x, p) { return x.toPrecision(p); },
    "o": function(x) { return Math.round(x).toString(8); },
    "p": function(x, p) { return formatRounded(x * 100, p); },
    "r": formatRounded,
    "s": formatPrefixAuto,
    "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
    "x": function(x) { return Math.round(x).toString(16); }
  };

  function identity$1(x) {
    return x;
  }

  var map = Array.prototype.map,
      prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

  function formatLocale(locale) {
    var group = locale.grouping === undefined || locale.thousands === undefined ? identity$1 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
        currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
        currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
        decimal = locale.decimal === undefined ? "." : locale.decimal + "",
        numerals = locale.numerals === undefined ? identity$1 : formatNumerals(map.call(locale.numerals, String)),
        percent = locale.percent === undefined ? "%" : locale.percent + "",
        minus = locale.minus === undefined ? "-" : locale.minus + "",
        nan = locale.nan === undefined ? "NaN" : locale.nan + "";

    function newFormat(specifier) {
      specifier = formatSpecifier(specifier);

      var fill = specifier.fill,
          align = specifier.align,
          sign = specifier.sign,
          symbol = specifier.symbol,
          zero = specifier.zero,
          width = specifier.width,
          comma = specifier.comma,
          precision = specifier.precision,
          trim = specifier.trim,
          type = specifier.type;

      // The "n" type is an alias for ",g".
      if (type === "n") comma = true, type = "g";

      // The "" type, and any invalid type, is an alias for ".12~g".
      else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

      // If zero fill is specified, padding goes after sign and before digits.
      if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

      // Compute the prefix and suffix.
      // For SI-prefix, the suffix is lazily computed.
      var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
          suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

      // What format function should we use?
      // Is this an integer type?
      // Can this type generate exponential notation?
      var formatType = formatTypes[type],
          maybeSuffix = /[defgprs%]/.test(type);

      // Set the default precision if not specified,
      // or clamp the specified precision to the supported range.
      // For significant precision, it must be in [1, 21].
      // For fixed precision, it must be in [0, 20].
      precision = precision === undefined ? 6
          : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
          : Math.max(0, Math.min(20, precision));

      function format(value) {
        var valuePrefix = prefix,
            valueSuffix = suffix,
            i, n, c;

        if (type === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;

          // Perform the initial formatting.
          var valueNegative = value < 0;
          value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

          // Trim insignificant zeros.
          if (trim) value = formatTrim(value);

          // If a negative value rounds to zero during formatting, treat as positive.
          if (valueNegative && +value === 0) valueNegative = false;

          // Compute the prefix and suffix.
          valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;

          valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

          // Break the formatted value into the integer “value” part that can be
          // grouped, and fractional or exponential “suffix” part that is not.
          if (maybeSuffix) {
            i = -1, n = value.length;
            while (++i < n) {
              if (c = value.charCodeAt(i), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }

        // If the fill character is not "0", grouping is applied before padding.
        if (comma && !zero) value = group(value, Infinity);

        // Compute the padding.
        var length = valuePrefix.length + value.length + valueSuffix.length,
            padding = length < width ? new Array(width - length + 1).join(fill) : "";

        // If the fill character is "0", grouping is applied after padding.
        if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

        // Reconstruct the final output based on the desired alignment.
        switch (align) {
          case "<": value = valuePrefix + value + valueSuffix + padding; break;
          case "=": value = valuePrefix + padding + value + valueSuffix; break;
          case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
          default: value = padding + valuePrefix + value + valueSuffix; break;
        }

        return numerals(value);
      }

      format.toString = function() {
        return specifier + "";
      };

      return format;
    }

    function formatPrefix(specifier, value) {
      var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
          e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
          k = Math.pow(10, -e),
          prefix = prefixes[8 + e / 3];
      return function(value) {
        return f(k * value) + prefix;
      };
    }

    return {
      format: newFormat,
      formatPrefix: formatPrefix
    };
  }

  var locale;
  var format;
  var formatPrefix;

  defaultLocale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["$", ""],
    minus: "-"
  });

  function defaultLocale(definition) {
    locale = formatLocale(definition);
    format = locale.format;
    formatPrefix = locale.formatPrefix;
    return locale;
  }

  function precisionFixed(step) {
    return Math.max(0, -exponent(Math.abs(step)));
  }

  function precisionPrefix(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
  }

  function precisionRound(step, max) {
    step = Math.abs(step), max = Math.abs(max) - step;
    return Math.max(0, exponent(max) - exponent(step)) + 1;
  }

  function tickFormat (start, stop, count, specifier) {
    var step = tickStep(start, stop, count),
        precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);

    switch (specifier.type) {
      case "s":
        {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }

      case "":
      case "e":
      case "g":
      case "p":
      case "r":
        {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }

      case "f":
      case "%":
        {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
    }

    return format(specifier);
  }

  // Adapted from d3-scale by Mike Bostock
  function linearish(scale) {
    var domain = scale.domain;

    scale.tickFormat = function (count, specifier) {
      var d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };

    scale.ticks = function (count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };

    return scale;
  }
  function linear() {
    var scale = continuous();

    scale.copy = function () {
      return copy(scale, linear());
    };

    initRange.apply(scale, arguments);
    return linearish(scale);
  }

  function geoScaleBar () {
    var extent,
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
    var unitPresets = {
      "miles": {
        radius: 3959
      },
      "kilometers": {
        radius: 6371
      }
    };

    function scaleBar(context) {
      context.attr("width", extent[0]).attr("height", extent[1]);
      var x = extent[0] * left,
          y = extent[1] * top,
          start = projection.invert([x, y]);
      distance = distance || Math.pow(10, countDigits(geoDistance(projection.invert([0, 0]), projection.invert([0, extent[1]])) * radius) - 1);
      var w = distance / (geoDistance(start, projection.invert([x + 1, y])) * radius);
      var scale = linear().range([0, w]).domain([0, distance]);

      if (scaleFactor !== 1) {
        scale.domain([0, scale.invert(w / scaleFactor)]);
      }

      var tickMax = scale.domain()[1];
      var axis = axisBottom().scale(scale).tickValues(tickValues ? tickValues : [0, tickMax / 4, tickMax / 2, tickMax]).tickSize(height);
      var g = context.select("g");

      if (!g._groups[0][0]) {
        g = context.append("g").attr("class", "scale-bar");
      }

      g.attr("transform", "translate(" + extent[0] * left + ", " + extent[1] * top + ")").call(axis);
      var rects = g.selectAll("rect").data(axis.tickValues().map(function (d, i, data) {
        return [d, data[i + 1]];
      }).filter(function (d, i, data) {
        return i !== data.length - 1;
      }));
      rects.exit().remove();
      rects.enter().append("rect").attr("height", height).style("stroke", "#000").style("fill", function (d, i) {
        return i % 2 === 0 ? "#000" : "#fff";
      }).merge(rects).attr("x", function (d) {
        return scale(d[0]);
      }).attr("width", function (d) {
        return scale(d[1] - d[0]);
      });
      var text = g.select(".label");

      if (!text._groups[0][0]) {
        text = g.append("text").attr("class", "label");
      }

      text.attr("class", "label").style("fill", "#000").style("text-anchor", "start").style("font-size", "12px").attr("y", -4);
      text.text(label || capitalizeFirstLetter(units));
    }

    scaleBar.extent = function (_) {
      return arguments.length ? (extent = _, scaleBar) : extent;
    };

    scaleBar.projection = function (_) {
      return arguments.length ? (projection = _, scaleBar) : projection;
    };

    scaleBar.units = function (_) {
      if (arguments.length) {
        units = _;

        if (Object.keys(unitPresets).includes(_)) {
          radius = unitPresets[_].radius;
        }

        return scaleBar;
      } else {
        return units;
      }
    };

    scaleBar.distance = function (_) {
      return arguments.length ? (distance = +_, scaleBar) : distance;
    };

    scaleBar.radius = function (_) {
      return arguments.length ? (radius = +_, scaleBar) : radius;
    };

    scaleBar.tickValues = function (_) {
      return arguments.length ? (tickValues = _, scaleBar) : tickValues;
    };

    scaleBar.label = function (_) {
      return arguments.length ? (label = _, scaleBar) : label;
    };

    scaleBar.height = function (_) {
      return arguments.length ? (height = +_, scaleBar) : height;
    };

    scaleBar.left = function (_) {
      return arguments.length ? (left = _ > 1 ? 1 : _ < 0 ? 0 : +_, scaleBar) : left;
    };

    scaleBar.top = function (_) {
      return arguments.length ? (top = _ > 1 ? 1 : _ < 0 ? 0 : +_, scaleBar) : top;
    };

    scaleBar.scaleFactor = function (_) {
      return arguments.length ? (scaleFactor = _, scaleBar) : scaleFactor;
    };

    function countDigits(_) {
      return Math.floor(_).toString().length;
    }

    function capitalizeFirstLetter(_) {
      return _.charAt(0).toUpperCase() + _.slice(1);
    }

    return scaleBar;
  }

  exports.geoScaleBar = geoScaleBar;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
