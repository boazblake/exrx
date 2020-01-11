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
      "app.css": [
        (path) => path.includes(".scss"),
        (path) => path.includes("spectre.css")
      ]
    }
  }
}

exports.plugins = {
  sass: {
    mode: "native",
    sourceMapEmbed: true,
    includePaths: ["node_modules/spectre.css/src/**/*.scss"]
  },
  "@babel": { presets: ["env"] }
}

exports.paths = {
  public: "docs",
  watched: [
    "app/Utils",
    "app/FP",
    "app/Components",
    "app/Layouts",
    "app/Pages",
    "app"
  ]
}

exports.npm = {
  globals: {
    m: "mithril",
    Stream: "mithril-stream"
  },
  styles: {
    "spectre.css": [
      "dist/spectre.css",
      "dist/spectre-exp.css",
      "dist/spectre-icons.css"
    ]
  }
}
