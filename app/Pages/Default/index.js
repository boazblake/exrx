const Default = ({ attrs: { mdl } }) => {
  // console.log('mdl', mdl)

  return {
    view: () => m(".default", m("h1", mdl.state.route.title))
  }
}

export default Default
