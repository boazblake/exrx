import m from "mithril"

const facebook = {
  name: "f",
  href: "https://www.facebook.com"
}

const twitter = {
  name: "t",
  href: "https://www.twitter.com"
}

const socialmedialinks = [facebook, twitter]

const avatar = {
  view: ({ attrs: { name, href } }) =>
    m("a", {
      selector: "figure",
      class: "avatar avatar-xl",
      "data-initial": name,
      target: "_blank",
      href
    })
}

const SocialMediaLinks = () => {
  return {
    view: () =>
      m(
        ".socialmedias",
        socialmedialinks.map(({ name, href }) => m(avatar, { name, href }))
      )
  }
}

export default SocialMediaLinks
