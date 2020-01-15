const BatteryTestConfig = ({ attrs: { mdl } }) => {
  // console.log('mdl', mdl)

  return {
    view: () =>
      m(".content", [
        m("section.section", { id: "content-toolbar" }, []),
        m("section.section", { id: "content-data" }, [
          m(".battery-config", { id: mdl.state.route.id }, [
            m("h1.title", mdl.state.route.title)
          ])
        ])
      ])
  }
}

export default BatteryTestConfig
