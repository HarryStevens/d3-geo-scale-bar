const fs = require("fs"),
    path = require("path"),
    tape = require("tape"),
    jsdom = require("jsdom"),
    d3 = Object.assign({}, require("d3-geo"), require("d3-selection"), require("../"));

tape("geoScaleBar() has the expected defaults", function(test) {
  const s = d3.geoScaleBar();
  test.equal(s.units(), "kilometers");
  test.equal(s.radius(), 6371.0088);
  test.equal(s.left(), 0);
  test.equal(s.top(), 0);
  test.equal(s.tickPadding(), 2);
  test.equal(s.tickSize(), 4);
  test.equal(s.zoomClamp(), true);
  test.equal(s.zoomFactor(), 1);
  test.end();
});

tape("Orientation methods are exported", function(test) {
  test.equal(d3.geoScaleBottom(), 1);
  test.equal(d3.geoScaleTop(), -1);
  const s = d3.geoScaleBar().orient(d3.geoScaleBottom);
  test.equal(s.orient(), "bottom");
  s.orient(d3.geoScaleTop);
  test.equal(s.orient(), "top");
  test.end();
});

tape("Units objects are exported", function(test) {
  const feet = d3.geoScaleFeet;
  test.equal(feet.units, "feet");
  test.equal(feet.radius, 20902259.664);

  const kilometers = d3.geoScaleKilometers;
  test.equal(kilometers.units, "kilometers");
  test.equal(kilometers.radius, 6371.0088);

  const meters = d3.geoScaleMeters;
  test.equal(meters.units, "meters");
  test.equal(meters.radius, 6371008.8);

  const miles = d3.geoScaleMiles;
  test.equal(miles.units, "miles");
  test.equal(miles.radius, 3958.7613);

  const s = d3.geoScaleBar().units(feet);
  test.equal(s.units(), "feet");
  test.equal(s.radius(), 20902259.664);

  s.units(kilometers);
  test.equal(s.units(), "kilometers");
  test.equal(s.radius(), 6371.0088);

  s.units(meters);
  test.equal(s.units(), "meters");
  test.equal(s.radius(), 6371008.8);

  s.units(miles);
  test.equal(s.units(), "miles");
  test.equal(s.radius(), 3958.7613);

  test.end();
});

tape("scaleBar.extent(extent) sets the extent explicitly", function(test) {
  const s = d3.geoScaleBar().extent([[0, 0], [100, 100]]);
  test.deepEqual(s.extent(), [[0, 0], [100, 100]]);
  test.end();
});

tape("scaleBar.size(size) sets the size explicitly and the extent implicitly", function(test) {
  const s = d3.geoScaleBar().size([100, 100]);
  test.deepEqual(s.extent(), [[0, 0], [100, 100]]);
  test.deepEqual(s.size(), [100, 100]);
  test.end();
});

tape("scaleBar(selection) produces the expected result", function(test) {
  const bodyActual = (new jsdom.JSDOM("<!DOCTYPE html><svg></svg>")).window.document.body;      
  const bodyExpected = (new jsdom.JSDOM(file("geo-scale-bar.html"))).window.document.body;
  
  const india = JSON.parse(file("india.json"));
  const size = [900, 600];
  const projection = d3.geoMercator().fitSize(size, india);
  const s = d3.geoScaleBar()
      .size(size)
      .projection(projection)
      .distance(1000)
      .left(.1)
      .top(.1);
      
  const svg = d3.select(bodyActual).select("svg").attr("width", size[0]).attr("height", size[1]);
  svg.append("g").call(s);
  test.equal(bodyActual.outerHTML, bodyExpected.outerHTML);
  test.end();
});

function file(file) {
  return fs.readFileSync(path.join(__dirname, file), "utf8").replace(/\n\s*/mg, "");
}