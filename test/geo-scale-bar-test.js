const fs = require("fs"),
    path = require("path"),
    tape = require("tape"),
    jsdom = require("jsdom"),
    d3 = Object.assign({}, require("d3-geo"), require("d3-selection"), require("../"));

tape("geoScaleBar() has the expected defaults", function(test) {
  const s = d3.geoScaleBar();
  test.equal(s.units(), "kilometers");
  test.equal(s.radius(), 6371);
  test.equal(s.tickSize(), 4);
  test.equal(s.left(), 0);
  test.equal(s.top(), 0);
  test.equal(s.zoomFactor(), 1);
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
  const bodyActual = (new jsdom.JSDOM("<!DOCTYPE html><svg><g></g></svg>")).window.document.body;      
  const bodyExpected = (new jsdom.JSDOM(file("geo-scale-bar.html"))).window.document.body;
  
  const india = JSON.parse(file("india.json"));
  const size = [900, 600];
  const projection = d3.geoMercator().fitSize(size, india);
  const s = d3.geoScaleBar().size(size).projection(projection);
  const svg = d3.select(bodyActual).select("svg").attr("width", size[0]).attr("height", size[1]);
  svg.append("g").call(s);
  test.equal(bodyActual.outerHTML, bodyExpected.outerHTML);
  test.end();
});

function file(file) {
  return fs.readFileSync(path.join(__dirname, file), "utf8").replace(/\n\s*/mg, "");
}