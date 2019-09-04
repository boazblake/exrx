import m from 'mithril'

const Modal = {
  view: ({ attrs: { isActive, close, title, content, footer } }) =>
    m('.modal', { class: isActive ? 'active' : '', id: 'modal' }, [
      m('a.modal-overlay', {
        href: '#modals',
        'aria-label': 'Close',
        onclick: () => close(),
      }),
      m('.modal-container', { role: 'document' }, [
        m('.modal-header', [
          m('a.btn btn-clear float-right', {
            href: '#modals',
            'aria-label': 'Close',
            onclick: () => close(),
          }),
          m('.modal-title h5', title),
        ]),
        m('.modal-body', m('.content', content)),
        m('.modal-footer', footer),
      ]),
    ]),
}

export default Modal
