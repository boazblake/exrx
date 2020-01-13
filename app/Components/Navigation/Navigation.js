import NavTabs from "./NavTabs.js"

const Navigation = () => {
  return {
    view: ({ attrs: { mdl } }) => {
      return m(".navigation", m(NavTabs, { mdl }))
    }
  }
}

export default Navigation
