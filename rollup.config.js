import resolve from "rollup-plugin-node-resolve";

export default {
  input: "index.js",
  output: {
    extend: true,
    file: "build/d3-geo-scale-bar.js",
    format: "umd",
    globals: {
      "d3-axis": "d3",
      "d3-geo": "d3",
      "d3-scale": "d3"
    },
    name: "d3"
  },
  plugins: [
    resolve({
      only: ["d3-array", "d3-axis", "d3-collection", "d3-color", "d3-format", "d3-geo", "d3-interpolate", "d3-scale", "d3-time", "d3-time-format"]
    })
  ]
}