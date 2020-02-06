# d3-geo-scale-bar

Like [d3-axis](https://github.com/d3/d3-axis) but for maps, this module displays automatic scale bars for projected geospatial data.

In cartography, scale bars help viewers understand the geographic extent of maps. Professional cartographers seldom omit them from published maps, yet scale bars are commonly missing from interactive maps published on the internet. d3-geo-scale-bar makes it easy to add scale bars to maps created with [d3-geo](https://github.com/d3/d3-geo).

[See it in action](https://bl.ocks.org/HarryStevens/8c8d3a489aa1372e14b8084f94b32464).

## Installing

If you use NPM, `npm install d3-geo-scale-bar`. Otherwise, download the [latest release](https://github.com/HarryStevens/d3-geo-scale-bar/raw/master/build/d3-geo-scale-bar.zip). AMD, CommonJS, and vanilla environments are supported. In vanilla, a d3 global is exported:

```html
<script src="https://unpkg.com/d3-geo-scale-bar@0.7.0/build/d3-geo-scale-bar.min.js"></script>
<script>

const projection = d3.geoMercator()
    .fitSize([width, height], geoJSON)

const scaleBar = d3.geoScaleBar()
    .projection(projection)
    .size([width, height]);

d3.select("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .call(scaleBar);

</script>
```

[Try d3-geo-scale-bar in your browser](https://npm.runkit.com/d3-geo-scale-bar).

## API Reference

* [Introduction](#introduction)
* [Basic configuration](#basic-configuration)
* [Positioning](#positioning)
* [Sizing](#sizing)
* [Styling](#styling)
* [Zooming](#zooming)

### Introduction

A scale bar's [default design](https://bl.ocks.org/HarryStevens/8c8d3a489aa1372e14b8084f94b32464) references the classic checkered design:

[<img alt="Scale Bar Design" src="https://raw.githubusercontent.com/HarryStevens/d3-geo-scale-bar/master/img/default.png">](https://bl.ocks.org/HarryStevens/8c8d3a489aa1372e14b8084f94b32464)

A scale bar consists of a [g element](https://www.w3.org/TR/SVG/struct.html#Groups) which, by default, contains one [path element](https://www.w3.org/TR/SVG/paths.html#PathElement) of class "domain", four [g elements](https://www.w3.org/TR/SVG/struct.html#Groups) of class "tick" representing each of the scale bar's ticks. Each tick has a [line element](https://www.w3.org/TR/SVG/shapes.html#LineElement) to draw the tick line, a [text element](https://www.w3.org/TR/SVG/text.html#TextElement) for the tick label, and a [rect element](https://www.w3.org/TR/SVG/shapes.html#RectElement) of alternating black and white fill. There is also another text element of class "label" sitting above the bar that denotes the units. All of these can be styled and manipulated like normal SVG elements.

```svg
<g font-family="sans-serif" transform="translate(0,0)">
  <path class="domain" fill="none" stroke="currentColor" d="M0,4 L0,0 L200,0 L200,4"></path>
  <g class="tick" transform="translate(0)" opacity="1">
    <line stroke="currentColor" y2="4"></line>
    <text fill="currentColor" y="6" font-size="10" text-anchor="middle" dy="0.71em">0</text>
    <rect fill="currentColor" stroke="currentColor" stroke-width="0.5" width="50" height="4"></rect>
  </g>
  <g class="tick" transform="translate(50)" opacity="1">
    <line stroke="currentColor" y2="4"></line>
    <text fill="currentColor" y="6" font-size="10" text-anchor="middle" dy="0.71em">25</text>
    <rect fill="#fff" stroke="currentColor" stroke-width="0.5" width="50" height="4"></rect>
  </g>
  <g class="tick" transform="translate(100)" opacity="1">
    <line stroke="currentColor" y2="4"></line>
    <text fill="currentColor" y="6" font-size="10" text-anchor="middle" dy="0.71em">50</text>
    <rect fill="currentColor" stroke="currentColor" stroke-width="0.5" width="100" height="4"></rect>
  </g>
  <g class="tick" transform="translate(200)" opacity="1">
    <line stroke="currentColor" y2="4"></line>
    <text fill="currentColor" y="6" font-size="10" text-anchor="middle" dy="0.71em">100</text>
    <rect fill="#fff" stroke="currentColor" stroke-width="0.5" width="0" height="4"></rect>
  </g>
  <text class="label" fill="currentColor" font-size="12" dy="-0.32em" x="0" text-anchor="start">Kilometers</text>
</g>
```

<a name="geoScaleBar" href="#geoScaleBar">#</a> d3.<b>geoScaleBar</b>() [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L5 "Source")

Constructs a new scale bar generator with the default settings.

<a name="_scaleBar" href="#_scaleBar">#</a> <i>scaleBar</i>(<i>context</i>) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L27 "Source")

Render the scale bar to the given *context*, which may be either a [selection](https://github.com/d3/d3-selection) of SVG containers (either SVG or G elements) or a corresponding [transition](https://github.com/d3/d3-transition). Configure the scale bar with [*scaleBar*.projection](#scaleBar_projection) and [*scaleBar*.extent](#scaleBar_fitSize) before rendering. Generally, you will use this with <i>selection</i>.[call](https://github.com/d3/d3-selection#selection_call):

```js
const scaleBar = d3.geoScaleBar()
    .projection(projection)
    .size([width, height]);

svg.append("g").call(scaleBar);
```

### Basic configuration

<a name="scaleBar_projection" href="#scaleBar_projection">#</a> <i>scaleBar</i>.<b>projection</b>([<i>projection</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L95 "Source")

If *projection* is specified, sets the [projection](https://github.com/d3/d3-geo#projections) and returns the scale bar. If *projection* is not specified, returns the current projection.

<a name="scaleBar_extent" href="#scaleBar_extent">#</a> <i>scaleBar</i>.<b>extent</b>([<i>extent</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L91 "Source")

If <i>extent</i> is specified, sets the extent of the scale bar generator to the specified bounds and returns the scale bar generator. The extent bounds are specified as an array [[<i>x0</i>, <i>y0</i>], [<i>x1</i>, <i>y1</i>]], where <i>x0</i> is the left side of the extent, <i>y0</i> is the top, <i>x1</i> is the right and <i>y1</i> is the bottom. If extent is not specified, returns the current extent which defaults to null. An extent is required.

<a name="scaleBar_size" href="#scaleBar_size">#</a> <i>scaleBar</i>.<b>size</b>([<i>size</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L91 "Source")

An alias for [<i>scaleBar</i>.extent](#scaleBar_extent) where the minimum x and y of the extent are ⟨0,0⟩. Equivalent to:

```js
scaleBar.extent([[0, 0], size]);
```

### Positioning

<a name="scaleBar_left" href="#scaleBar_left">#</a> <i>scaleBar</i>.<b>left</b>([<i>left</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L134 "Source")

If *left* is specified, sets the left position to the specified value which must be in the range [0, 1], where 0 is the left-most side of the scale bar's extent and 1 is the right-most. If *left* is not specified, returns the current left position which defaults to 0.

<a name="scaleBar_top" href="#scaleBar_top">#</a> <i>scaleBar</i>.<b>top</b>([<i>top</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L138 "Source")

If *top* is specified, sets the top position to the specified value which must be in the range [0, 1], where 0 is the top-most side of the scale bar's extent and 1 is the bottom-most. If *top* is not specified, returns the current top position which defaults to 0.

### Sizing

<a name="scaleBar_distance" href="#scaleBar_distance">#</a> <i>scaleBar</i>.<b>distance</b>([<i>distance</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L114 "Source")

If <i>distance</i> is specifed, sets the maxiumum distance of the scale bar in the scale bar's units. Defaults to the largest exponent of 10 that will fit on the map. If <i>distance</i> is not specified, returns the current maximum distance of the scale bar.

<a name="scaleBar_radius" href="#scaleBar_radius">#</a> <i>scaleBar</i>.<b>radius</b>([<i>radius</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L118 "Source")

If <i>radius</i> is specifed, sets the radius of the sphere on which the geospatial data is projected. Defaults to 6371.0088, [the mean radius of Earth in kilometers](https://en.wikipedia.org/wiki/Earth_radius#Mean_radius). If you set [<i>units</i>](#scaleBar_units) to d3.geoScaleMiles, the <i>radius</i> will also update to 3958.7613, [the mean radius of Earth in miles](https://en.wikipedia.org/wiki/Earth_radius#Mean_radius). You can set the *radius* to any number you like, useful for mapping planets other than Earth. If *radius* is not specified, returns the current radius.

<a name="scaleBar_units" href="#scaleBar_units">#</a> <i>scaleBar</i>.<b>units</b>([<i>units</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L99 "Source")

If <i>units</i> is specifed, sets the [radius](#scaleBar_radius) of the scale bar to the corresponding units and returns the scale bar. Defaults to d3.geoScaleKilometers, which sets the label to "Kilometers" and the radius to 6371.0088, [the mean radius of Earth in kilometers](https://en.wikipedia.org/wiki/Earth_radius#Mean_radius). Note that the Earth's radius varies depending upon latitude, so if extremely high precision matters, you can [perform your own calculation of the radius](https://web.archive.org/web/20200118181437/https://rechneronline.de/earth-radius/) and pass the output to <i>scaleBar</i>.[radius](#scaleBar_radius).

If <i>units</i> is not specified, returns a string representing the current unit, e.g. "kilometers". The capitalized version of this string will be used for the [label](#scaleBar_label) if no label is specified.

<a name="geoScaleFeet" href="#geoScaleFeet">#</a> d3.<b>geoScaleFeet</b>() [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/units/feet.js "Source")

When passed to <i>scaleBar</i>.[units](#scaleBar_units), sets the [radius](scaleBar_radius) to 20902259.664, the mean radius of Earth in feet. The [label](#scaleBar_label) will be set to "Feet" if no label is specified.

<a name="geoScaleKilometers" href="#geoScaleKilometers">#</a> d3.<b>geoScaleKilometers</b>() [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/units/kilometers.js "Source")

When passed to <i>scaleBar</i>.[units](#scaleBar_units), sets the [radius](scaleBar_radius) to 6371.0088, the mean radius of Earth in kilometers. The [label](#scaleBar_label) will be set to "Kilometers" if no label is specified.

<a name="geoScaleMeters" href="#geoScaleMeters">#</a> d3.<b>geoScaleMeters</b>() [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/units/meters.js "Source")

When passed to <i>scaleBar</i>.[units](#scaleBar_units), sets the [radius](scaleBar_radius) to 6371008.8, the mean radius of Earth in meters. The [label](#scaleBar_label) will be set to "Meters" if no label is specified.

<a name="geoScaleMiles" href="#geoScaleMiles">#</a> d3.<b>geoScaleMiles</b>() [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/units/miles.js "Source")

When passed to <i>scaleBar</i>.[units](#scaleBar_units), sets the [radius](scaleBar_radius) to 3958.7613, the mean radius of Earth in miles. The [label](#scaleBar_label) will be set to "Miles" if no label is specified.

### Styling

<a name="scaleBar_label" href="#scaleBar_label">#</a> <i>scaleBar</i>.<b>label</b>([<i>label</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L126 "Source")

If a <i>label</i> string is specified, updates the text in the scale bar's label to the specified string. Defaults to the capitalized unit, e.g. "Kilometers". If label is specified as <i>null</i>, removes the label. If <i>label</i> is not specified, returns the current label.

<a name="scaleBar_labelAnchor" href="#scaleBar_labelAnchor">#</a> <i>scaleBar</i>.<b>labelAnchor</b>([<i>anchor</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L126 "Source")

If an <i>anchor</i> string is specified, aligns the scale bar's label such that it is either at the "start" of the scale bar, the "middle" of the scale bar, or the "end" of the scale bar. Defaults to "start". If an <i>anchor</i> string is not specified, returns the current anchor.

<a name="scaleBar_orient" href="#scaleBar_orient">#</a> <i>scaleBar</i>.<b>orient</b>([<i>orientation</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L126 "Source")

If an [<i>orientation</i>](#geoScaleBottom) is specified, styles the bar according to the specified orientation and returns the scale bar. If an <i>orientation</i> is not specified, returns the current orientation as a string, either "top" or "bottom". Defaults to [d3.geoScaleBottom](#geoScaleBottom).

<a name="geoScaleBottom" href="#geoScaleBottom">#</a> d3.<b>geoScaleBottom</b>() [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/orient/bottom.js "Source")

When passed to <i>scaleBar</i>.[orient](#scaleBar_orient), orients the scale bar so that the label is on the top and the ticks are on bottom. This is the default orientation.

```js
scaleBar.orient(d3.geoScaleBottom);
```

<a name="geoScaleTop" href="#geoScaleTop">#</a> d3.<b>geoScaleTop</b>() [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/orient/top.js "Source")

When passed to <i>scaleBar</i>.[orient](#scaleBar_orient), orients the scale bar so that the label is on the bottom and the ticks are on top.

```js
scaleBar.orient(d3.geoScaleTop);
```

<a name="scaleBar_tickFormat" href="#scaleBar_tickFormat">#</a> <i>scaleBar</i>.<b>tickFormat</b>([<i>formatter</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L122 "Source")

If a <i>formatter</i> function is specified, each tick is passed through the formatter before being displayed. Defaults to (d, i, e) => Math.round(d), where d is the tick number, i is the tick index, and e is an array of all tick data. If a <i>formatter</i> is not specified, returns the current formatter.

<a name="scaleBar_tickSize" href="#scaleBar_tickSize">#</a> <i>scaleBar</i>.<b>tickSize</b>([<i>size</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L130 "Source")

If *size* is specified, sets the vertical tick size of the scale bar in pixels. Defaults to 4. If *size* is not specified, returns the current tick size of the scale bar.

<a name="scaleBar_tickValues" href="#scaleBar_tickValues">#</a> <i>scaleBar</i>.<b>tickValues</b>([<i>values</i>]) [<>](https://github.com/HarryStevens/d3-geo-scale-bar/blob/master/src/geoScaleBar.js#L122 "Source")

If a <i>values</i> array is specified, the specified values are used for ticks rather than using the scale bar’s automatic tick generator. Defaults to [0, kilometers / 4, kilometers / 2, kilometers]. Passing <i>null</i> removes the values from the scale bar. If <i>values</i> is not specified, returns the current tick values.

### Zooming

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