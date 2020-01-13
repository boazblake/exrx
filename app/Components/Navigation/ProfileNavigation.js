import NavTabs from "./NavTabs.js"

const ProfileNavigation = () => {
  return {
    view: ({ attrs: { mdl } }) => {
      return m(".navigation", m(NavTabs, { mdl }))
    }
  }
}

export default ProfileNavigation
