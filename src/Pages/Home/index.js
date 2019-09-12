import m from 'mithril'
import RegisterCar from '../../Forms/authentication/RegisterCar.js'
import { jsonCopy } from 'utils'
import { range } from 'ramda'

const carModel = {
  year: undefined,
  make: undefined,
  model: undefined,
  mileage: '000000',
  findByVin: false,
  vin: '',
  years: range(1900, new Date().getFullYear() + 1).reverse(),
  makes: undefined,
  models: undefined,
}

const state = {
  isSubmitted: false,
  errors: {},
  httpError: undefined,
  data: jsonCopy(carModel),
}

const onMakeSuccess = (data) => (state.data.makes = data.Results)

const onVinSuccess = (data) => console.log(data.Results)

const onModelSuccess = (data) => (state.data.models = data.Results)

const onError = (error) => {
  console.log('error with http calll', error)
  state.httpError = error.message
  state.isSubmitted = false
}

const getMakes = (mdl) =>
  mdl.http
    .getTask(mdl)(
      'http://localhost:3001/nhtsa/api/vehicles/getallmakes?format=json'
    )
    .fork(onError, onMakeSuccess)

const getModels = (mdl) =>
  mdl.http
    .getTask(mdl)(
      `http://localhost:3001/nhtsa/api/vehicles/GetModelsForMakeId/${state.data.make}?format=json`
    )
    .fork(onError, onModelSuccess)

const getVin = (mdl) =>
  mdl.http
    .getTask(mdl)(
      `http://localhost:3001/nhtsa/api/vehicles/DecodeVIN/${encodeURI(
        state.data.vin
      )}?format=json`
    )
    .fork(onError, onVinSuccess)

const Home = ({ attrs: { mdl } }) => {
  console.log('mdl', mdl)

  return {
    view: () =>
      m('.home', [
        m('.hero-body parallax', [
          m('.parallax-top-left'),
          m('.parallax-top-right'),
          m('.parallax-bottom-left'),
          m('.parallax-bottom-right'),
          m('h1.parallax-content', [
            m('.parallax-front text-center', 'section 1'),
            m('section.parallax-back home-section hero hero-lg bg-primary'), // m('.', 'section 1'),
          ]),
        ]),

        m(
          'section.home-section hero hero-lg bg-light-grey',
          m('.hero-body', [
            m('h1.text-center', 'section 2'),
            m(RegisterCar, {
              data: state.data,
              errors: state.errors,
              isSubmitted: state.isSubmitted,
              httpError: {},
              getMakes: () => getMakes(mdl),
              getModels: () => getModels(mdl),
              getVin: () => getVin(mdl),
              mdl,
            }),
          ])
        ),
        m(
          'section.home-section hero hero-lg bg-secondary parall',
          m('.hero-body', m('h1', 'section 3'))
        ),
        m(
          'section.home-section hero hero-lg bg-dark-grey',
          m('.hero-body', m('h1', 'section 4'))
        ),
      ]),
  }
}

export default Home
