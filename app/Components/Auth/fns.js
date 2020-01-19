import { jsonCopy } from "Utils"
import { LoginForm, RegisterForm } from "./forms"

export const data = {
  name: "",
  email: "",
  password: "",
  confirmEmail: "",
  confirmPassword: "",
  isAdmin: false
}

export const state = {
  forms: { 1: RegisterForm, 0: LoginForm },
  page: 0,
  title: {
    1: "Register",
    0: "Login"
  },
  isSubmitted: false,
  errors: {},
  httpError: undefined,
  data: jsonCopy(data)
}

export const resetState = (state) => {
  state.data = jsonCopy(data)
  state.errors = {}
  state.httpError = undefined
  state.isSubmitted = false
  state.page = 0
}
export const changePage = (state) => {
  state.httpError = undefined
  return state.page ? (state.page = 0) : (state.page = 1)
}

export const loginUserTask = (mdl) => ({ email, password }) =>
  mdl.http.backEnd.postTask(mdl)("users/login")({
    login: email,
    password: password
  })

const AddUserIdTask = (mdl) => (id) =>
  mdl.http.postQlTask(mdl)(`mutation {
  createUser(data:{userId:${id}}){id}
}`)

export const registerUserTask = (mdl) => ({ name, email, password, isAdmin }) =>
  mdl.http.backEnd
    .postTask(mdl)("users/register")({
      name,
      email,
      password,
      isAdmin
    })
    .chain((user) =>
      AddUserIdTask(mdl)(JSON.stringify(user.objectId)).map(() => user)
    )
