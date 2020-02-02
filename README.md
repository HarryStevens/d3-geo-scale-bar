# d3-geo-scale-bar

Like [d3-axis](https://github.com/d3/d3-axis) but for maps, this module displays automatic scale bars for projected geospatial data.

Scale bars help viewers understand the geographic extent of maps. Printed maps, even those produced over a century ago, seldom lack them, yet scale bars are commonly missing from modern maps published on the internet. d3-geo-scale-bar makes it easy to add scale bars to maps created with [d3-geo](https://github.com/d3/d3-geo).

[See it in action](https://bl.ocks.org/HarryStevens/8c8d3a489aa1372e14b8084f94b32464).

## Installing

If you use NPM, `npm install d3-geo-scale-bar`. Otherwise, download the [latest release](https://github.com/HarryStevens/d3-geo-scale-bar/raw/master/build/d3-geo-scale-bar.zip). AMD, CommonJS, and vanilla environments are supported. In vanilla, a d3 global is exported:

```html
<script src="https://unpkg.com/d3-geo-scale-bar@0.5.0/build/d3-geo-scale-bar.min.js"></script>
<script>

const projection = d3.geoMercator()
    .fitSize([width, height], geoJSON)

const scaleBar = d3.geoScaleBar()
    .projection(projection)
    .size([width, height]);

d3.select("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g").call(scaleBar);

</script>
```

[Try d3-geo-scale-bar in your browser](https://npm.runkit.com/d3-geo-scale-bar).

## API Reference

A scale bar's [default design](https://bl.ocks.org/HarryStevens/8c8d3a489aa1372e14b8084f94b32464) references the classic checkered design:

[<img alt="Scale Bar Design" src="https://raw.githubusercontent.com/HarryStevens/d3-geo-scale-bar/master/img/default.png">](https://bl.ocks.org/HarryStevens/8c8d3a489aa1372e14b8084f94b32464)

A scale bar consists of a [g element](https://www.w3.org/TR/SVG/struct.html#Groups) which, by default, contains one [rect element](https://www.w3.org/TR/SVG/paths.html#RectElement) of class "baseline", three rect elements of class "rectangle" with alternating black and white fill, four [text elements](https://www.w3.org/TR/SVG/text.html#TextElement) of class "value", and one text element of class "label". All of these can be styled and manipulated like normal SVG elements.

```svg
<g transform="translate(0,0)">
  <rect class="baseline" fill="black" height="4" width="200"></rect>
  <rect class="rectangle" height="4" stroke="#000" fill="#000" x="0" width="50"></rect>
  <rect class="rectangle" height="4" stroke="#000" fill="#fff" x="50" width="50"></rect>
  <rect class="rectangle" height="4" stroke="#000" fill="#000" x="100" width="100"></rect>
  <text class="value" text-anchor="middle" font-family="sans-serif" font-size="12" x="0" y="15">0</text>
  <text class="value" text-anchor="middle" font-family="sans-serif" font-size="12" x="50" y="15">250</text>
  <text class="value" text-anchor="middle" font-family="sans-serif" font-size="12" x="100" y="15">500</text>
  <text class="value" text-anchor="middle" font-family="sans-serif" font-size="12" x="200" y="15">1000</text>
  <text class="label" x="0" fill="#000" text-anchor="start" font-size="14" font-family="sans-serif" y="-4">Kilometers</text>
</g>
```

<a name="geoScaleBar" href="#geoScaleBar">#</a> d3.<b>geoScaleBar</b>() [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L5 "Source")

Constructs a new scale bar generator with the default settings.

<a name="_scaleBar" href="#_scaleBar">#</a> <i>scaleBar</i>(<i>context</i>) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L27 "Source")

Render the scale bar to the given *context*, which may be either a [selection](https://github.com/d3/d3-selection) of SVG containers (either SVG or G elements) or a corresponding [transition](https://github.com/d3/d3-transition). Configure the scale bar with [*scaleBar*.projection](#scaleBar_projection) and [*scaleBar*.extent](#scaleBar_fitSize) before rendering.

<a name="scaleBar_projection" href="#scaleBar_projection">#</a> <i>scaleBar</i>.<b>projection</b>([<i>projection</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L95 "Source")

If *projection* is specified, sets the [projection](https://github.com/d3/d3-geo#projections) and returns the scale bar. If *projection* is not specified, returns the current projection.

<a name="scaleBar_distance" href="#scaleBar_distance">#</a> <i>scaleBar</i>.<b>distance</b>([<i>distance</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L114 "Source")

If *distance* is specifed, sets the maxiumum distance of the scale bar in the scale bar's units. Defaults to the largest exponent of 10 that will fit on the map. If *distance* is not specified, returns the current maximum distance of the scale bar.

<a name="scaleBar_extent" href="#scaleBar_extent">#</a> <i>scaleBar</i>.<b>extent</b>([<i>extent</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L91 "Source")

If <i>extent</i> is specified, sets the extent of the scale bar generator to the specified bounds and returns the scale bar generator. The extent bounds are specified as an array [[<i>x0</i>, <i>y0</i>], [<i>x1</i>, <i>y1</i>]], where <i>x0</i> is the left side of the extent, <i>y0</i> is the top, <i>x1</i> is the right and <i>y1</i> is the bottom. If extent is not specified, returns the current extent which defaults to null. An extent is required.

<a name="scaleBar_size" href="#scaleBar_size">#</a> <i>scaleBar</i>.<b>size</b>([<i>size</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L91 "Source")

An alias for [<i>scaleBar</i>.extent](#scaleBar_extent) where the minimum x and y of the extent are ⟨0,0⟩. Equivalent to:

```js
scaleBar.extent([[0, 0], size]);
```

<a name="scaleBar_left" href="#scaleBar_left">#</a> <i>scaleBar</i>.<b>left</b>([<i>left</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L134 "Source")

If *left* is specified, sets the left position to the specified value which must be in the range [0, 1], where 0 is the left-most side of the scale bar's extent and 1 is the right-most. If *left* is not specified, returns the current left position which defaults to 0.

<a name="scaleBar_top" href="#scaleBar_top">#</a> <i>scaleBar</i>.<b>top</b>([<i>top</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L138 "Source")

If *top* is specified, sets the top position to the specified value which must be in the range [0, 1], where 0 is the top-most side of the scale bar's extent and 1 is the bottom-most. If *top* is not specified, returns the current top position which defaults to 0.

<a name="scaleBar_units" href="#scaleBar_units">#</a> <i>scaleBar</i>.<b>units</b>([<i>units</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L99 "Source")

If a *units* string is specifed, sets the units of the scale bar. Defaults to "kilometers". If you set *units* to "miles", the [*radius*]("#scaleBar_radius") will also update to 3,959, [the number of miles of Earth's radius](https://www.google.com/search?q=radius+of+earth+in+miles). You can override this if you are mapping planets other than Earth. If *units* is not specified, returns the current units string.


<a name="scaleBar_radius" href="#scaleBar_radius">#</a> <i>scaleBar</i>.<b>radius</b>([<i>radius</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L118 "Source")

If *radius* is specifed, sets the radius of the sphere on which the geospatial data is projected. Defaults to 6,371, [the radius of the Earth](https://www.google.com/search?q=radius+of+earth+in+kilometers). If you set [*units*]("#scaleBar_units") to "miles", the *radius* will also update to 3,959, [the number of miles of Earth's radius](https://www.google.com/search?q=radius+of+earth+in+miles). You can set the *radius* to any number you like, useful for mapping planets other than Earth. If *radius* is not specified, returns the current radius.

<a name="scaleBar_label" href="#scaleBar_label">#</a> <i>scaleBar</i>.<b>label</b>([<i>label</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L126 "Source")

If a <i>label</i> string is specified, updates the text in the scale bar's label to the specified string. Defaults to the capitalized unit, e.g. "Kilometers". If label is specified as <i>null</i>, removes the label. If <i>label</i> is not specified, returns the current label.

<a name="scaleBar_labelAnchor" href="#scaleBar_labelAnchor">#</a> <i>scaleBar</i>.<b>labelAnchor</b>([<i>anchor</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L126 "Source")

If an <i>anchor</i> string is specified, aligns the scale bar's label such that it is either at the "start" of the scale bar, the "middle" of the scale bar, or the "end" of the scale bar. Defaults to "start". If an <i>anchor</i> string is not specified, returns the current anchor.

<a name="scaleBar_tickFormat" href="#scaleBar_tickFormat">#</a> <i>scaleBar</i>.<b>tickFormat</b>([<i>formatter</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L122 "Source")

If a <i>formatter</i> function is specified, each tick is passed through the formatter before being displayed. Defaults to (d, i, e) => Math.round(d), where d is the tick number, i is the tick index, and e is an array of all tick data. If a <i>formatter</i> is not specified, returns the current formatter.

<a name="scaleBar_tickSize" href="#scaleBar_tickSize">#</a> <i>scaleBar</i>.<b>tickSize</b>([<i>size</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L130 "Source")

If *size* is specified, sets the vertical tick size of the scale bar in pixels. Defaults to 4. If *size* is not specified, returns the current tick size of the scale bar.

<a name="scaleBar_tickValues" href="#scaleBar_tickValues">#</a> <i>scaleBar</i>.<b>tickValues</b>([<i>values</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L122 "Source")

If a <i>values</i> array is specified, the specified values are used for ticks rather than using the scale bar’s automatic tick generator. Defaults to [0, kilometers / 4, kilometers / 2, kilometers]. Passing <i>null</i> removes the values from the scale bar. If <i>values</i> is not specified, returns the current tick values.

<a name="scaleBar_zoomFactor" href="#scaleBar_zoomFactor">#</a> <i>scaleBar</i>.<b>zoomFactor</b>([<i>k</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L142 "Source")

If *k* is specified, zooms the scale bar by the *k* zoom factor. This will commonly [be used](https://bl.ocks.org/HarryStevens/64fc5f1a4489abe78433b7d19510f864) in conjunction with [d3-zoom](https://github.com/d3/d3-zoom):

```js
const zoom = d3.zoom()
  .on("zoom", _ => {
    const t = d3.event.transform;
    
    g.attr("transform", t);
    
    scaleBar.zoomFactor(t.k); // Zoom the scale bar by the k scale factor.
    scaleBarSelection.call(scaleBar);
  });

svg.call(zoom);
```

If *k* is not specified, returns the current scale factor.