import m from 'mithril'
import LoginRegister from '../Navigation/LoginRegister.js'
const getRoute = (int) => m.route.get().split('/')[int]

const Tab = ({ attrs: { key } }) => {
  return {
    view: ({ attrs: { tab, active, tabHovered } }) =>
      m(
        m.route.Link,
        {
          class: active ? 'tab-item active' : 'tab-item',
          key,
          id: `${tab.id}`,
          href: `${tab.route}`,
          onmouseenter: () => {
            tabHovered(tab.id)
          },
        },
        tab.title
      ),
  }
}

const NavTabs = () => {
  return {
    view: ({ attrs: { mdl, tabHovered } }) => {
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
                  tabHovered,
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
