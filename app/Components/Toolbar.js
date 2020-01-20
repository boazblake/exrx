const Toolbar = () => {
  return {
    view: ({ attrs: { mdl, left, right } }) =>
      m("section.navbar", { id: "content-toolbar" }, [
        m("section.navbar-section.toolbar-left", { id: "toolbar-left" }, left),
        m(
          "section.navbar-section.toolbar-right",
          { id: "toolbar-right" },
          right
        )
      ])
  }
}

export default Toolbar
