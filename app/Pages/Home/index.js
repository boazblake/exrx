const Home = ({ attrs: { mdl } }) => {
  return {
    view: () =>
      m(".home", [
        m(
          "section.home-section hero hero-lg bg-primary parall",
          m(".hero-body", m("h1", "section 1"))
        ),
        m(
          "section.home-section hero hero-lg bg-secondary",
          m(".hero-body", m("h1", "section 2"))
        )
      ])
  }
}

export default Home
