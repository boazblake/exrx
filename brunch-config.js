// See http://brunch.io for documentation.

exports.files = {
  javascripts: {
    joinTo: {
      "vendor.js": /^(?!app)/, // Files that are not in `app` dir.
      "app.js": /^app/
    }
  },
  stylesheets: {
    joinTo: {
      "app.css": ["./app/**/*.scss", (path) => path.includes(".scss")]
    }
  }
}

exports.plugins = {
  sass: { mode: "native", modules: true },
  "@babel": { presets: ["env"] }
}

exports.paths = {
  public: "docs",
  watched: ["app/Utils", "app/FP", "app/Components", "app/Layouts", "app"]
}

exports.npm = {
  globals: { m: "mithril", Stream: "mithril-stream" }
}
