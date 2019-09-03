import m from 'mithril'
import LoginRegister from '../Navigation/LoginRegister.js'
import { getRoute } from 'utils'
import Brand from 'assets/professional-auto-care-logo-brand.png'

console.log(Brand)

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { tab, active, tabSelected } }) =>
      m(
        m.route.Link,
        {
          class: active ? 'tab-item active' : 'tab-item',
          key,
          id: `${tab.id}`,
          href: `${tab.route}`,
          onmouseenter: () => {
            tabSelected(tab.id)
          },
        },
        tab.title === 'Home'
          ? m('img', { style: { width: '100px' }, src: Brand })
          : tab.title
      ),
  }
}

const NavTabs = () => {
  return {
    view: ({ attrs: { mdl, tabSelected } }) => {
      let tabs = mdl.Routes.filter((r) => r.position.includes('nav'))
      const isTabActive = (tab) => {
        let _active = getRoute(1)
        return tab.id == _active
      }

      return [
        m(
          'ul.tab tab-group',
          {
            id: 'tabbar',
          },

          [
            tabs.map((tab, idx) =>
              m(
                'li.tab-item',
                m(Tab, {
                  key: idx,
                  active: isTabActive(tab),
                  tab,
                  tabSelected,
                  mdl,
                })
              )
            ),
            m(LoginRegister),
          ]
        ),
      ]
    },
  }
}

export default NavTabs
