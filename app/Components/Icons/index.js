const contact = m(
  "svg",
  { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" },
  m("path", {
    d:
      "M2 4v14h14v-6l2-2v10H0V2h10L8 4H2zm10.3-.3l4 4L8 16H4v-4l8.3-8.3zm1.4-1.4L16 0l4 4-2.3 2.3-4-4z"
  })
)

const dotsVerticleThree = m(
  "svg",
  { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" },
  m("path", {
    d:
      "M10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
  })
)

const downChevron = m(
  "svg",
  { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" },
  m("path", {
    d:
      "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
  })
)

const home = m(
  "svg",
  { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" },
  m("path", { d: "M8 20H3V10H0L10 0l10 10h-3v10h-5v-6H8v6z" })
)

const lock = m(
  "svg",
  { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" },
  m("path", {
    d:
      "M4 8V6a6 6 0 1 1 12 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2h1zm5 6.73V17h2v-2.27a2 2 0 1 0-2 0zM7 6v2h6V6a3 3 0 0 0-6 0z"
  })
)

const upChevron = m(
  "svg",
  { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" },
  m("path", {
    d:
      "M10.707 7.05L10 6.343 4.343 12l1.414 1.414L10 9.172l4.243 4.242L15.657 12z"
  })
)

const services = m(
  "svg",
  { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" },
  m("path", {
    d:
      "M9 20v-1.7l.01-.24L15.07 12h2.94c1.1 0 1.99.89 1.99 2v4a2 2 0 0 1-2 2H9zm0-3.34V5.34l2.08-2.07a1.99 1.99 0 0 1 2.82 0l2.83 2.83a2 2 0 0 1 0 2.82L9 16.66zM0 1.99C0 .9.89 0 2 0h4a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zM4 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
  })
)

export default {
  contact,
  services,
  home,
  downChevron,
  lock,
  upChevron,
  dotsVerticleThree
}
