# d3-geo-scale-bar

Displays automatic scale bars for projected geospatial data.

## Installing

If you use NPM, `npm install d3-geo-scale-bar`.

```html
<script src="https://d3js.org/d3-array.v1.min.js"></script>
<script src="https://d3js.org/d3-geo.v1.min.js"></script>
<script src="https://unpkg.com/d3-geo-scale-bar@0.0.2/build/d3-geo-scale-bar.min.js"></script>
<script>

var scaleBar = d3.geoScaleBar()
  .projection(d3GeoProjection)
  .fitSize([width, height], geoJsonObject);

d3.select("svg").append("g").call(scaleBar);

</script>
```

## API Reference

Coming soon.