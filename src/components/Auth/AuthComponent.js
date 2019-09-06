import m from 'mithril'
import {
  Login,
  Register,
  validateLoginTask,
  validateRegistrationTask,
} from '../../Forms/index.js'
import Modal from '../Modal.js'
import { jsonCopy } from 'utils'
import { range } from 'ramda'

const userModel = {
  name: '',
  email: '',
  password: '',
  confirmEmail: '',
  confirmPassword: '',
  isAdmin: false,
}

const carModel = {
  year: undefined,
  make: undefined,
  model: undefined,
  mileage: '000000',
  findByVin: true,
  vin: '',
  years: range(1900, new Date().getFullYear()).reverse(),
  makes: undefined,
  models: undefined,
}

const dataModel = { carModel, userModel }

const state = {
  forms: { 1: Register, 0: Login },
  page: 0,
  title: {
    1: 'Register',
    0: 'Login',
  },
  isSubmitted: false,
  errors: {},
  httpError: undefined,
  data: jsonCopy(dataModel),
}

const resetState = () => {
  state.data = jsonCopy(dataModel)
  state.errors = {}
  state.httpError = undefined
  state.isSubmitted = false
  state.page = 0
}

const onError = (error) => {
  console.log('error with http calll', error)
  state.httpError = error.message
  state.isSubmitted = false
}

const onRegisterSuccess = (mdl) => (data) => {
  console.log('succes with registering', data, mdl)
  return (state.page = 0)
}

const onLoginSuccess = (mdl) => (user) => {
  window.sessionStorage.setItem('user-token', user['user-token'])
  mdl.user = user
  mdl.state.isAuth(true)
  mdl.toggleAuthModal(mdl)
  resetState()
}

const onMakeSuccess = (data) => {
  state.data.carModel.makes = data
}

const onYearSuccess = ({ years: { min_year, max_year } }) => {
  // { "Years": {"min_year":"1941", "max_year":"2019"} }
  state.data.carmodel.years = range(min_year, max_year).reverse()
}

const getYears = (mdl) =>
  mdl.http
    .getTask(mdl)(
      'https://crossorigin.me/https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getYears'
    )
    .fork(onError, onYearSuccess)

const getMakes = (mdl) =>
  mdl.http
    .getTask(mdl)(
      'https://crossorigin.me/https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json'
    )
    .fork(onError, onMakeSuccess)

const validateForm = (mdl) => (data) => {
  const onValidationError = (errs) => {
    state.errors = errs
    console.log('failed - state', state)
  }

  const onValidationSuccess = (data) => {
    state.errors = {}
    state.page
      ? registerUser(mdl)(data).fork(onError, onRegisterSuccess(mdl))
      : loginUser(mdl)(data).fork(onError, onLoginSuccess(mdl))
  }

  state.isSubmitted = true
  state.page
    ? validateRegistrationTask(data).fork(
      onValidationError,
      onValidationSuccess
    )
    : validateLoginTask(data).fork(onValidationError, onValidationSuccess)
}

const loginUser = (mdl) => ({ email, password }) =>
  mdl.http.postTask(mdl)(mdl.http.baseDBUrl + 'users/login')({
    dto: { login: email, password: password },
  })

const registerUser = (mdl) => ({ name, email, password, isAdmin }) =>
  mdl.http.postTask(mdl)(mdl.http.baseDBUrl + 'users/register')({
    dto: { name, email, password, isAdmin },
  })

const changePage = () => {
  state.httpError = undefined
  return state.page ? (state.page = 0) : (state.page = 1)
}

const AuthLink = () => {
  return {
    view: ({ attrs: { title } }) =>
      m(
        'a.AuthLinkBtn btn-link',
        {
          onclick: changePage,
        },
        title
      ),
  }
}

const AuthComponent = () => {
  return {
    view: ({ attrs: { mdl } }) =>
      m(Modal, {
        isActive: mdl.state.showAuthModal(),
        close: () => {
          resetState()
          mdl.toggleAuthModal(mdl)
        },
        title: state.title[state.page],
        content: m(state.forms[state.page], {
          data: state.data,
          errors: state.errors,
          httpError: state.httpError,
          isSubmitted: state.isSubmitted,
          getYears: () => getYears(mdl),
          getMakes: () => getMakes(mdl),
          getModels: () => console.log('getting models', state.data),
        }),
        footer: [
          m(
            'button.btn.btn-primary authBtn',
            {
              onclick: () => validateForm(mdl)(state.data),
              class: mdl.state.isLoading() && 'loading',
            },
            state.title[state.page]
          ),
          m(AuthLink, {
            mdl,
            title: state.page ? 'Login' : 'Register',
          }),
        ],
      }),
  }
}

export default AuthComponent
