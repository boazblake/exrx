import NavMenu from "./Navigation/NavMenu.js"

const LeftAside = ({ attrs: { mdl } }) => {
  let routes = mdl.Routes.filter((r) => r.position.includes("left-aside"))
  return {
    view: ({ attrs: { mdl } }) =>
      m(".left-aside", { id: "left-aside" }, m(NavMenu, { routes, mdl }))
  }
}
export default LeftAside
