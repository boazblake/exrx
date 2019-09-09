import m from 'mithril'
import {
  Login,
  Register,
  validateLoginTask,
  validateUserRegistrationTask,
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
  years: range(1900, new Date().getFullYear() + 1).reverse(),
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

const onMakeSuccess = (data) => (state.data.carModel.makes = data.Results)

const onVinSuccess = (data) => {
  console.log(data.Results)

  // let VariableProp = (variable) => propEq('Variable', variable)
  // let ValueProp = (value) => propEq('Value', value)
  // let ValueIdProp = (valueId) => propEq('ValueId', valueId)
  // let makeVar = data.Results.filter()

  // let carModel = { Make: { Make_ID: '', Make_Name: '' }, Model: { Model_ID: '', Model_Name: '' }}

  // carReducer = (carMdl, next) => {

  //   return carMdl
  // }

  // let res = data.Results.filter()

  // state.data.carModel.make = 483
  // state.data.carModel.model = 'Grand Cherokee'
  // state.data.carModel.year = '2000' //Model Year
  // state.data.carModel.findByVin = false
}

const onModelSuccess = (data) => (state.data.carModel.models = data.Results)

const getMakes = (mdl) =>
  mdl.http
    .HttpTask(mdl)('GET')(
      'http://localhost:3001/nhtsa/api/vehicles/getallmakes?format=json'
    )({})(null)
    .fork(onError, onMakeSuccess)

const getModels = (mdl) =>
  mdl.http
    .HttpTask(mdl)('GET')(
      `http://localhost:3001/nhtsa/api/vehicles/GetModelsForMakeId/${state.data.carModel.make}?format=json`
    )({})(null)
    .fork(onError, onModelSuccess)

const getVin = (mdl) =>
  mdl.http
    .HttpTask(mdl)('GET')(
      `http://localhost:3001/nhtsa/api/vehicles/DecodeVIN/${encodeURI(
        state.data.carModel.vin
      )}?format=json`
    )({})(null)
    .fork(onError, onVinSuccess)

const validateForm = (mdl) => (data) => {
  const onValidationError = (errs) => {
    state.errors = errs
    console.log('failed - state', state)
  }

  const onValidationSuccess = (data) => {
    state.errors = {}
    state.page
      ? registerUser(mdl)({ data, ...state.data.carModel }).fork(
        onError,
        onRegisterSuccess(mdl)
      )
      : loginUser(mdl)(data).fork(onError, onLoginSuccess(mdl))
  }
  state.isSubmitted = true
  state.page
    ? validateUserRegistrationTask(data.userModel).fork(
      onValidationError,
      onValidationSuccess
    )
    : validateLoginTask(data.userModel).fork(
      onValidationError,
      onValidationSuccess
    )
}

const loginUser = (mdl) => ({ email, password }) =>
  mdl.http.backEnd.post(mdl)('users/login')({
    login: email,
    password: password,
  })

const registerUser = (mdl) => ({ name, email, password, isAdmin }) =>
  mdl.http.backEnd.post(mdl)('users/register')({
    name,
    email,
    password,
    isAdmin,
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
          getMakes: () => getMakes(mdl),
          getModels: () => getModels(mdl),
          getVin: () => getVin(mdl),
        }),
        footer: [
          m(
            'input.btn.btn-primary authBtn',
            {
              type: 'submit',
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
