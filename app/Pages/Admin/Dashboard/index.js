const Dashboard = ({ attrs: { mdl } }) => {
  // console.log('mdl', mdl)

  return {
    view: () =>
      m(".content", [
        m("section.section", { id: "content-toolbar" }, []),
        m("section.section", { id: "content-data" }, [
          m(".dashboard", { id: mdl.state.route.id }, [
            m("h1.title", mdl.state.route.title)
          ])
        ])
      ])
  }
}

export default Dashboard
