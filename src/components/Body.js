import m from 'mithril'

const Body = {
  view: ({ children }) =>
    m(
      '.content',
      {
        id: 'content',
      },
      children
    ),
}

export default Body
