import { jsonCopy } from "Utils"

const dataModel = {
  firstname: "",
  lastname: "",
  email: "",
  confirmEmail: "",
  birthdate: ""
}

export const formState = {
  isSubmitted: false,
  errors: jsonCopy(dataModel),
  httpError: undefined,
  data: jsonCopy(dataModel)
}

export const resetForm = (state) => {
  state.data = jsonCopy(dataModel)
  state.errors = jsonCopy(dataModel)
  state.httpError = undefined
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
  createClient(
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

export const loadClients = ({ attrs: { mdl } }) => {
  const onError = (e) => console.log("ERROR Fetching Clients", e)

  const onSuccess = ({ clients }) => (mdl.clients = clients)

  return loadClientsTask(mdl).fork(onError, onSuccess)
}

export const deleteClient = (mdl) => (id) => {
  const onError = (e) => console.log("ERROR deleteing Client", e)

  const onSuccess = ({ clients }) => (mdl.clients = clients)

  return deleteClientTask(mdl)(id)
    .chain((_) => loadClientsTask(mdl))
    .fork(onError, onSuccess)
}
