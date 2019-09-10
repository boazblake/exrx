import m from 'mithril'

const ManageUsers = () => {
  const state = {}

  const loadUsers = ({ attrs: { mdl } }) => {
    const onError = (e) => {
      console.log('ERROR', e)
    }

    const onSuccess = (s) => {
      console.log('SUCCESSS', s)
      state.users = s
    }

    return mdl.http
      .getTask(mdl)(
        'https://api.backendless.com/A0DC91A6-8088-D365-FF60-0DE1BB0C8600/7C923A78-BBF7-7D49-FF41-80A623EBE100/data/Users'
      )
      .fork(onError, onSuccess)
  }

  return {
    oninit: loadUsers,
    view: ({ attrs: { mdl } }) =>
      m('.manageusers', { id: mdl.state.route.id }, [
        m('h1.title', mdl.state.route.title),

        state.users &&
          state.users.map((u) => m('div', [m('p', u.name), m('p', u.email)])),
      ]),
  }
}

export default ManageUsers
