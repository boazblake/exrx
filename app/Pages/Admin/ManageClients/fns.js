import { compose, map, prop, lensProp, over } from "ramda"
import { jsonCopy, addTerms, filterListBy } from "Utils"
import { clientPageState } from "./index.js"
import M from "moment"

const clientModel = {
  firstname: "",
  lastname: "",
  email: "",
  confirmEmail: "",
  birthdate: ""
}

export const formState = {
  isSubmitted: false,
  errors: jsonCopy(clientModel),
  httpError: null,
  data: jsonCopy(clientModel)
}

export const clientPageStateModel = () => ({
  isAsc: Stream(true),
  sortProp: "firstname",
  term: Stream("")
})

export const resetClientPageState = (state) => (state = clientPageStateModel())

export const clientProps = [
  { value: "firstname", key: "first name" },
  { value: "lastname", key: "last name" },
  { value: "birthdate", key: "birthdate" },
  { value: "email", key: "email" }
]

const dateLens = lensProp("birthdate")

const formatAndIncBirthdate = (date) =>
  M(date)
    .add(1, "days")
    .format("YYYY-MM-DD")

const dateViewModel = over(dateLens, formatAndIncBirthdate)
const makeTerms = addTerms(map(prop("value"), clientProps))

const toViewModel = compose(makeTerms, dateViewModel)

export const resetForm = (state) => {
  state.data = jsonCopy(clientModel)
  state.errors = jsonCopy(clientModel)
  state.httpError = null
  state.isSubmitted = false
}

const loadClientsTask = (mdl) =>
  mdl.http.postQlTask(mdl)(
    `query{
      clients(where:{trainer:{userId:${JSON.stringify(
        mdl.user.objectId
      )}}}){id, firstname, lastname, email, birthdate}
      }`
  )

const deleteClientTask = (mdl) => (id) =>
  mdl.http.postQlTask(mdl)(`
mutation {
  deleteClient(where:{id:${JSON.stringify(id)}}){id}
}`)

const saveClientTask = (mdl) => ({ email, firstname, lastname, birthdate }) =>
  mdl.http.postQlTask(mdl)(`mutation {
  createClient(
    data: {
      email:${JSON.stringify(email)},
      firstname:${JSON.stringify(firstname)},
      lastname:${JSON.stringify(lastname)},
      birthdate:${JSON.stringify(birthdate)},
      trainer:{connect:{userId: ${JSON.stringify(mdl.user.objectId)}}}
    }), {id, firstname, lastname, email, birthdate}
}`)

const editClientTask = (mdl) => ({
  id,
  email,
  firstname,
  lastname,
  birthdate
}) =>
  mdl.http.postQlTask(mdl)(`mutation {
  updateClient(
    where: {id: ${JSON.stringify(id)}}
    data: {
      email:${JSON.stringify(email)},
      firstname:${JSON.stringify(firstname)},
      lastname:${JSON.stringify(lastname)},
      birthdate:${JSON.stringify(birthdate)},
      trainer:{connect:{userId: ${JSON.stringify(mdl.user.objectId)}}}
    }), {id, firstname, lastname, email, birthdate}
}`)

export const editClient = (mdl) => (client) => editClientTask(mdl)(client)

export const saveClient = (mdl) => (client) => saveClientTask(mdl)(client)

export const filterClientsBy = (state) =>
  compose(filterListBy(state.term)(state.sortProp)(state.isAsc))

export const loadClients = (mdl) => {
  const onError = (e) => console.log("ERROR Fetching Clients", e)

  const onSuccess = (clients) => (mdl.clients = clients)

  return loadClientsTask(mdl)
    .map(prop("clients"))
    .map(map(toViewModel))
    .map(filterClientsBy(clientPageState))
    .fork(onError, onSuccess)
}

export const deleteClient = (mdl) => (id) => {
  const onError = (e) => console.log("ERROR deleteing Client", e)

  const onSuccess = (mdl) => ({ clients }) => (mdl.clients = clients)

  return deleteClientTask(mdl)(id)
    .chain((_) => loadClientsTask(mdl))
    .fork(onError, onSuccess(mdl))
}
