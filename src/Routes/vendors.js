import Layout from '../Layout.js'
import Default from '../Pages/Default'

const Vendors = [
  {
    id: 'bg-products',
    title: 'BG Products',
    icon: 'bgproducts',
    route: '/bg-products',
    position: ['sidebar'],
    group: ['vendors'],
    children: [],
    onmatch: (mdl, props, route) => {
      // console.log('props', props)
      return (mdl.state.route = route)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
]

export default Vendors
