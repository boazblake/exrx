import Layout from '../Layout.js'
import Default from '../Pages/Default'
import { scrollToAnchor } from 'utils'
import Icons from 'icons'

const authenticated = [
  {
    id: 'profile-page',
    title: 'Profile Page',
    icon: Icons.home,
    route: '/profile/:name',
    position: [],
    group: ['authenticated', 'all', 'client'],
    children: [],
    onmatch: (mdl, args, path, fullroute, isAnchor) => {
      console.log(
        'profile page login on match',
        mdl,
        args,
        path,
        fullroute,
        isAnchor,
        !mdl.state.isAuth()
      )
      isAnchor && scrollToAnchor(mdl.state.anchor)
    },
    component: (mdl) => m(Layout, { mdl }, m(Default, { mdl })),
  },
]

export default authenticated
