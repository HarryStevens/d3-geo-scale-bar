// https://github.com/HarryStevens/d3-geo-scale-bar Version 0.3.1. Copyright 2020 Harry Stevens.
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

  // Adapted from d3-geo by Mike Bostock
  var lengthSum = adder(),
      lambda0,
      sinPhi0,
      cosPhi0;
  var lengthStream = {
    sphere: function sphere(_) {},
    point: function point(_) {},
    lineStart: lengthLineStart,
    lineEnd: function lineEnd(_) {},
    polygonStart: function polygonStart(_) {},
    polygonEnd: function polygonEnd(_) {}
  };

  function lengthLineStart() {
    lengthStream.point = lengthPointFirst;
    lengthStream.lineEnd = lengthLineEnd;
  }

  function lengthLineEnd() {
    lengthStream.point = lengthStream.lineEnd = function (_) {};
  }

  function lengthPointFirst(lambda, phi) {
    lambda *= Math.PI / 180, phi *= Math.PI / 180;
    lambda0 = lambda, sinPhi0 = Math.sin(phi), cosPhi0 = Math.cos(phi);
    lengthStream.point = lengthPoint;
  }

  function lengthPoint(lambda, phi) {
    lambda *= Math.PI / 180, phi *= Math.PI / 180;
    var sinPhi = Math.sin(phi),
        cosPhi = Math.cos(phi),
        delta = Math.abs(lambda - lambda0),
        cosDelta = Math.cos(delta),
        sinDelta = Math.sin(delta),
        x = cosPhi * sinDelta,
        y = cosPhi0 * sinPhi - sinPhi0 * cosPhi * cosDelta,
        z = sinPhi0 * sinPhi + cosPhi0 * cosPhi * cosDelta;
    lengthSum.add(Math.atan2(Math.sqrt(x * x + y * y), z));
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
        tickFormat = function tickFormat(d) {
      return Math.round(d);
    },
        label,
        labelAnchor = "start",
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
      var barWidth = extent[1][0] - extent[0][0],
          barHeight = extent[1][1] - extent[0][1];
      context.attr("width", barWidth).attr("height", barHeight);
      var x = extent[0][0] + barWidth * left,
          y = extent[0][1] + barHeight * top,
          start = projection.invert([x, y]);
      distance = distance || Math.pow(10, countDigits(geoDistance(projection.invert(extent[0]), projection.invert([extent[1][0], extent[0][1]])) * radius) - 1);

      var w = distance / (geoDistance(start, projection.invert([x + 1, y])) * radius),
          scale = function scale(dist) {
        return dist * w / (distance / scaleFactor);
      },
          tickMax = distance / scaleFactor,
          ticks = tickValues === null ? [] : tickValues ? tickValues : [0, tickMax / 4, tickMax / 2, tickMax];

      var g = context.select("g");

      if (!g._groups[0][0]) {
        g = context.append("g");
      }

      g.attr("transform", "translate(".concat([x, y], ")"));
      var baseline = g.select(".baseline");

      if (!baseline._groups[0][0]) {
        baseline = g.append("rect").attr("class", "baseline");
      }

      baseline.attr("fill", "black").attr("height", height).attr("width", scale(tickMax));
      var rects = g.selectAll(".rectangle").data(ticks.map(function (d, i, data) {
        return [d, data[i + 1]];
      }).filter(function (d, i, data) {
        return i !== data.length - 1;
      }));
      rects.exit().remove();
      rects.enter().append("rect").attr("class", "rectangle").attr("height", height).attr("stroke", "#000").attr("fill", function (d, i) {
        return i % 2 === 0 ? "#000" : "#fff";
      }).merge(rects).attr("x", function (d) {
        return scale(d[0]);
      }).attr("width", function (d) {
        return scale(d[1] - d[0]);
      });
      var valueText = g.selectAll(".value").data(ticks);
      valueText.exit().remove();
      valueText.enter().append("text").attr("class", "value").attr("text-anchor", "middle").attr("font-family", "sans-serif").attr("font-size", 12).merge(valueText).attr("x", scale).attr("y", height + 11).text(tickFormat);
      var labelText = g.select(".label");

      if (!labelText._groups[0][0]) {
        labelText = g.append("text").attr("class", "label");
      }

      labelText.attr("x", labelAnchor === "start" ? 0 : labelAnchor === "middle" ? scale(tickMax / 2) : scale(tickMax)).attr("class", "label").attr("fill", "#000").attr("text-anchor", labelAnchor).attr("font-size", 14).attr("font-family", "sans-serif").attr("y", -4);
      labelText.text(label || capitalizeFirstLetter(units));
    }

    scaleBar.extent = function (_) {
      return arguments.length ? (extent = _, scaleBar) : extent;
    };

    scaleBar.size = function (_) {
      return arguments.length ? (extent = [[0, 0], _], scaleBar) : extent[1];
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

    scaleBar.tickFormat = function (_) {
      return arguments.length ? (tickFormat = _, scaleBar) : tickFormat;
    };

    scaleBar.label = function (_) {
      return arguments.length ? (label = _, scaleBar) : label;
    };

    scaleBar.labelAnchor = function (_) {
      return arguments.length ? (labelAnchor = _, scaleBar) : labelAnchor;
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
