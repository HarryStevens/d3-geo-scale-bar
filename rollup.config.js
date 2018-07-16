import resolve from "rollup-plugin-node-resolve";

export default {
  input: "index.js",
  output: {
    extend: true,
    file: "build/d3-geo-scale-bar.js",
    format: "umd",
    globals: {
      "d3-geo": "d3"
    },
    name: "d3"
  },
  plugins: [
    resolve({
      only: ["d3-array", "d3-geo"]
    })
  ]
}