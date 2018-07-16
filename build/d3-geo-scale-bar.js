// https://github.com/HarryStevens/d3-geo-scale-bar Version 0.0.3. Copyright 2018 Harry Stevens.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

  // Adds floating point numbers with twice the normal precision.
  // Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
  // Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
  // 305–363 (1997).
  // Code adapted from GeographicLib by Charles F. F. Karney,
  // http://geographiclib.sourceforge.net/

  function adder() {
    return new Adder;
  }

  function Adder() {
    this.reset();
  }

  Adder.prototype = {
    constructor: Adder,
    reset: function() {
      this.s = // rounded value
      this.t = 0; // exact error
    },
    add: function(y) {
      add(temp, y, this.t);
      add(this, temp.s, this.s);
      if (this.s) this.t += temp.t;
      else this.s = temp.t;
    },
    valueOf: function() {
      return this.s;
    }
  };

  var temp = new Adder;

  function add(adder, a, b) {
    var x = adder.s = a + b,
        bv = x - a,
        av = x - bv;
    adder.t = (a - av) + (b - bv);
  }

  var epsilon = 1e-6;
  var pi = Math.PI;
  var halfPi = pi / 2;
  var quarterPi = pi / 4;
  var tau = pi * 2;

  var degrees = 180 / pi;
  var radians = pi / 180;

  var abs = Math.abs;
  var atan2 = Math.atan2;
  var cos = Math.cos;
  var sin = Math.sin;
  var sqrt = Math.sqrt;

  function asin(x) {
    return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
  }

  function noop() {}

  function streamGeometry(geometry, stream) {
    if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
      streamGeometryType[geometry.type](geometry, stream);
    }
  }

  var streamObjectType = {
    Feature: function(object, stream) {
      streamGeometry(object.geometry, stream);
    },
    FeatureCollection: function(object, stream) {
      var features = object.features, i = -1, n = features.length;
      while (++i < n) streamGeometry(features[i].geometry, stream);
    }
  };

  var streamGeometryType = {
    Sphere: function(object, stream) {
      stream.sphere();
    },
    Point: function(object, stream) {
      object = object.coordinates;
      stream.point(object[0], object[1], object[2]);
    },
    MultiPoint: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
    },
    LineString: function(object, stream) {
      streamLine(object.coordinates, stream, 0);
    },
    MultiLineString: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) streamLine(coordinates[i], stream, 0);
    },
    Polygon: function(object, stream) {
      streamPolygon(object.coordinates, stream);
    },
    MultiPolygon: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) streamPolygon(coordinates[i], stream);
    },
    GeometryCollection: function(object, stream) {
      var geometries = object.geometries, i = -1, n = geometries.length;
      while (++i < n) streamGeometry(geometries[i], stream);
    }
  };

  function streamLine(coordinates, stream, closed) {
    var i = -1, n = coordinates.length - closed, coordinate;
    stream.lineStart();
    while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
    stream.lineEnd();
  }

  function streamPolygon(coordinates, stream) {
    var i = -1, n = coordinates.length;
    stream.polygonStart();
    while (++i < n) streamLine(coordinates[i], stream, 1);
    stream.polygonEnd();
  }

  function geoStream(object, stream) {
    if (object && streamObjectType.hasOwnProperty(object.type)) {
      streamObjectType[object.type](object, stream);
    } else {
      streamGeometry(object, stream);
    }
  }

  var areaRingSum = adder();

  var areaSum = adder(),
      lambda00,
      phi00,
      lambda0,
      cosPhi0,
      sinPhi0;

  var areaStream = {
    point: noop,
    lineStart: noop,
    lineEnd: noop,
    polygonStart: function() {
      areaRingSum.reset();
      areaStream.lineStart = areaRingStart;
      areaStream.lineEnd = areaRingEnd;
    },
    polygonEnd: function() {
      var areaRing = +areaRingSum;
      areaSum.add(areaRing < 0 ? tau + areaRing : areaRing);
      this.lineStart = this.lineEnd = this.point = noop;
    },
    sphere: function() {
      areaSum.add(tau);
    }
  };

  function areaRingStart() {
    areaStream.point = areaPointFirst;
  }

  function areaRingEnd() {
    areaPoint(lambda00, phi00);
  }

  function areaPointFirst(lambda, phi) {
    areaStream.point = areaPoint;
    lambda00 = lambda, phi00 = phi;
    lambda *= radians, phi *= radians;
    lambda0 = lambda, cosPhi0 = cos(phi = phi / 2 + quarterPi), sinPhi0 = sin(phi);
  }

  function areaPoint(lambda, phi) {
    lambda *= radians, phi *= radians;
    phi = phi / 2 + quarterPi; // half the angular distance from south pole

    // Spherical excess E for a spherical triangle with vertices: south pole,
    // previous point, current point.  Uses a formula derived from Cagnoli’s
    // theorem.  See Todhunter, Spherical Trig. (1871), Sec. 103, Eq. (2).
    var dLambda = lambda - lambda0,
        sdLambda = dLambda >= 0 ? 1 : -1,
        adLambda = sdLambda * dLambda,
        cosPhi = cos(phi),
        sinPhi = sin(phi),
        k = sinPhi0 * sinPhi,
        u = cosPhi0 * cosPhi + k * cos(adLambda),
        v = k * sdLambda * sin(adLambda);
    areaRingSum.add(atan2(v, u));

    // Advance the previous points.
    lambda0 = lambda, cosPhi0 = cosPhi, sinPhi0 = sinPhi;
  }

  function spherical(cartesian) {
    return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
  }

  function cartesian(spherical) {
    var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
    return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
  }

  function cartesianCross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }

  // TODO return d
  function cartesianNormalizeInPlace(d) {
    var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    d[0] /= l, d[1] /= l, d[2] /= l;
  }

  var lambda0$1, phi0, lambda1, phi1, // bounds
      lambda2, // previous lambda-coordinate
      lambda00$1, phi00$1, // first point
      p0, // previous 3D point
      deltaSum = adder(),
      ranges,
      range;

  var boundsStream = {
    point: boundsPoint,
    lineStart: boundsLineStart,
    lineEnd: boundsLineEnd,
    polygonStart: function() {
      boundsStream.point = boundsRingPoint;
      boundsStream.lineStart = boundsRingStart;
      boundsStream.lineEnd = boundsRingEnd;
      deltaSum.reset();
      areaStream.polygonStart();
    },
    polygonEnd: function() {
      areaStream.polygonEnd();
      boundsStream.point = boundsPoint;
      boundsStream.lineStart = boundsLineStart;
      boundsStream.lineEnd = boundsLineEnd;
      if (areaRingSum < 0) lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
      else if (deltaSum > epsilon) phi1 = 90;
      else if (deltaSum < -epsilon) phi0 = -90;
      range[0] = lambda0$1, range[1] = lambda1;
    }
  };

  function boundsPoint(lambda, phi) {
    ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
    if (phi < phi0) phi0 = phi;
    if (phi > phi1) phi1 = phi;
  }

  function linePoint(lambda, phi) {
    var p = cartesian([lambda * radians, phi * radians]);
    if (p0) {
      var normal = cartesianCross(p0, p),
          equatorial = [normal[1], -normal[0], 0],
          inflection = cartesianCross(equatorial, normal);
      cartesianNormalizeInPlace(inflection);
      inflection = spherical(inflection);
      var delta = lambda - lambda2,
          sign$$1 = delta > 0 ? 1 : -1,
          lambdai = inflection[0] * degrees * sign$$1,
          phii,
          antimeridian = abs(delta) > 180;
      if (antimeridian ^ (sign$$1 * lambda2 < lambdai && lambdai < sign$$1 * lambda)) {
        phii = inflection[1] * degrees;
        if (phii > phi1) phi1 = phii;
      } else if (lambdai = (lambdai + 360) % 360 - 180, antimeridian ^ (sign$$1 * lambda2 < lambdai && lambdai < sign$$1 * lambda)) {
        phii = -inflection[1] * degrees;
        if (phii < phi0) phi0 = phii;
      } else {
        if (phi < phi0) phi0 = phi;
        if (phi > phi1) phi1 = phi;
      }
      if (antimeridian) {
        if (lambda < lambda2) {
          if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
        } else {
          if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
        }
      } else {
        if (lambda1 >= lambda0$1) {
          if (lambda < lambda0$1) lambda0$1 = lambda;
          if (lambda > lambda1) lambda1 = lambda;
        } else {
          if (lambda > lambda2) {
            if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
          } else {
            if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
          }
        }
      }
    } else {
      ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
    }
    if (phi < phi0) phi0 = phi;
    if (phi > phi1) phi1 = phi;
    p0 = p, lambda2 = lambda;
  }

  function boundsLineStart() {
    boundsStream.point = linePoint;
  }

  function boundsLineEnd() {
    range[0] = lambda0$1, range[1] = lambda1;
    boundsStream.point = boundsPoint;
    p0 = null;
  }

  function boundsRingPoint(lambda, phi) {
    if (p0) {
      var delta = lambda - lambda2;
      deltaSum.add(abs(delta) > 180 ? delta + (delta > 0 ? 360 : -360) : delta);
    } else {
      lambda00$1 = lambda, phi00$1 = phi;
    }
    areaStream.point(lambda, phi);
    linePoint(lambda, phi);
  }

  function boundsRingStart() {
    areaStream.lineStart();
  }

  function boundsRingEnd() {
    boundsRingPoint(lambda00$1, phi00$1);
    areaStream.lineEnd();
    if (abs(deltaSum) > epsilon) lambda0$1 = -(lambda1 = 180);
    range[0] = lambda0$1, range[1] = lambda1;
    p0 = null;
  }

  // Finds the left-right distance between two longitudes.
  // This is almost the same as (lambda1 - lambda0 + 360°) % 360°, except that we want
  // the distance between ±180° to be 360°.
  function angle(lambda0, lambda1) {
    return (lambda1 -= lambda0) < 0 ? lambda1 + 360 : lambda1;
  }

  function rangeCompare(a, b) {
    return a[0] - b[0];
  }

  function rangeContains(range, x) {
    return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
  }

  function geoBounds(feature) {
    var i, n, a, b, merged, deltaMax, delta;

    phi1 = lambda1 = -(lambda0$1 = phi0 = Infinity);
    ranges = [];
    geoStream(feature, boundsStream);

    // First, sort ranges by their minimum longitudes.
    if (n = ranges.length) {
      ranges.sort(rangeCompare);

      // Then, merge any ranges that overlap.
      for (i = 1, a = ranges[0], merged = [a]; i < n; ++i) {
        b = ranges[i];
        if (rangeContains(a, b[0]) || rangeContains(a, b[1])) {
          if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
          if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
        } else {
          merged.push(a = b);
        }
      }

      // Finally, find the largest gap between the merged ranges.
      // The final bounding box will be the inverse of this gap.
      for (deltaMax = -Infinity, n = merged.length - 1, i = 0, a = merged[n]; i <= n; a = b, ++i) {
        b = merged[i];
        if ((delta = angle(a[1], b[0])) > deltaMax) deltaMax = delta, lambda0$1 = b[0], lambda1 = a[1];
      }
    }

    ranges = range = null;

    return lambda0$1 === Infinity || phi0 === Infinity
        ? [[NaN, NaN], [NaN, NaN]]
        : [[lambda0$1, phi0], [lambda1, phi1]];
  }

  var sum = adder();

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function bisector(compare) {
    if (compare.length === 1) compare = ascendingComparator(compare);
    return {
      left: function(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      },
      right: function(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }
    };
  }

  function ascendingComparator(f) {
    return function(d, x) {
      return ascending(f(d), x);
    };
  }

  var ascendingBisect = bisector(ascending);

  var lengthSum = adder(),
      lambda0$2,
      sinPhi0$1,
      cosPhi0$1;

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
    lambda0$2 = lambda, sinPhi0$1 = sin(phi), cosPhi0$1 = cos(phi);
    lengthStream.point = lengthPoint;
  }

  function lengthPoint(lambda, phi) {
    lambda *= radians, phi *= radians;
    var sinPhi = sin(phi),
        cosPhi = cos(phi),
        delta = abs(lambda - lambda0$2),
        cosDelta = cos(delta),
        sinDelta = sin(delta),
        x = cosPhi * sinDelta,
        y = cosPhi0$1 * sinPhi - sinPhi0$1 * cosPhi * cosDelta,
        z = sinPhi0$1 * sinPhi + cosPhi0$1 * cosPhi * cosDelta;
    lengthSum.add(atan2(sqrt(x * x + y * y), z));
    lambda0$2 = lambda, sinPhi0$1 = sinPhi, cosPhi0$1 = cosPhi;
  }

  function length$1(object) {
    lengthSum.reset();
    geoStream(object, lengthStream);
    return +lengthSum;
  }

  var coordinates = [null, null],
      object = {type: "LineString", coordinates: coordinates};

  function distance(a, b) {
    coordinates[0] = a;
    coordinates[1] = b;
    return length$1(object);
  }

  var areaSum$1 = adder(),
      areaRingSum$1 = adder();

  var lengthSum$1 = adder();

  function geoScaleBar(){
    var extent,
        projection$$1,
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

      var vert_point_a_projected = projection$$1([0, bounds[0][1]]);
      var vert_point_b_projected = projection$$1([0, bounds[1][1]]);
      var height_projected = Math.abs(vert_point_a_projected[1] - vert_point_b_projected[1]);

      var bottom = Math.abs((bounds[1][1] - bounds[0][1]) * top);
      var point_a = [bounds[0][0], bottom];
      var point_b = [bounds[1][0], bottom];
      var distance_radians = distance(point_a, point_b);

      var distance_miles = distance_radians * radiusMiles;
      var distance_kilometers = distance_radians * radiusKilometers;

      var point_a_projected = projection$$1(point_a);
      var point_b_projected = projection$$1(point_b);
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
    };

    scaleBar.extent = function(array) {
      return arguments.length ? (extent = array, scaleBar) : extent;
    };

    scaleBar.feature = function(object) {
      return arguments.length ? (feature = object, scaleBar) : feature;
    };

    scaleBar.projection = function(proj) {
      return arguments.length ? (projection$$1 = proj, scaleBar) : projection$$1;
    };

    scaleBar.radiusMiles = function(_) {
      return arguments.length ? (radiusMiles = +_, scaleBar) : radiusMiles;
    };

    scaleBar.radiusKilometers = function(_) {
      return arguments.length ? (radiusKilometers = +_, scaleBar) : radiusKilometers;
    };

    scaleBar.miles = function(_) {
      return arguments.length ? (miles = +_, scaleBar) : miles;
    };

    scaleBar.kilometers = function(_) {
      return arguments.length ? (kilometers = +_, scaleBar) : kilometers;
    };

    scaleBar.height = function(_) {
      return arguments.length ? (height = +_, scaleBar) : height;
    };

    scaleBar.left = function(_) {
      return arguments.length ? (left = _ > 1 ? 1 : _ < 0 ? 0 : +_, scaleBar) : left;
    };

    scaleBar.top = function(_) {
      return arguments.length ? (top = _ > 1 ? 1 : _ < 0 ? 0 : +_, scaleBar) : top;
    };

    function countDigits(_){
      return Math.floor(_).toString().length;
    }

    function numberCommas(_){
      return _.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return scaleBar;
  }

  exports.geoScaleBar = geoScaleBar;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
