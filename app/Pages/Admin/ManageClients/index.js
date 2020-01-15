import AddClient from "./AddClient.js"
import { removeHyphens } from "Utils/helpers"

const ManageClients = () => {
  const state = {}

  const loadUsers = ({ attrs: { mdl } }) => {
    const query = `query {
  user(where:{clientId: ${removeHyphens(mdl.user.objectId)}}){clients{id}}
}`

    const onError = (e) => {
      console.log("ERROR", e)
    }

    const onSuccess = (s) => {
      console.log("SUCCESSS", s)
      state.clients = s
    }

    console.log("the Q", query)
    return mdl.http
      .postQl(mdl)(query)
      .fork(onError, onSuccess)
  }

  return {
    oninit: loadUsers,
    view: ({ attrs: { mdl } }) =>
      m(".content", [
        m("section.section", { id: "content-toolbar" }, [
          m(AddClient, { mdl })
        ]),
        m("section.section", { id: "content-data" }, [
          m(".manageClients", { id: mdl.state.route.id }, [
            m("h1.title", mdl.state.route.title)
          ])
        ])
      ])
  }
}

export default ManageClients
