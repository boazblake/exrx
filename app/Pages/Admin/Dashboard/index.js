const Dashboard = ({ attrs: { mdl } }) => {
  // console.log('mdl', mdl)

  return {
    view: () => m(".dashboard", m("h1", mdl.state.route.title))
  }
}

export default Dashboard
