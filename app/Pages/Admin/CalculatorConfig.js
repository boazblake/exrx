const ConfigCalculators = ({ attrs: { mdl } }) => {
  // console.log('mdl', mdl)

  return {
    view: () => m(".calc-config", m("h1", mdl.state.route.title))
  }
}

export default ConfigCalculators
