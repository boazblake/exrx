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
