import m from 'mithril'
import RegisterCar from './RegisterCar.js'
import RegisterUser from './registerUser.js'

export const Register = () => {
  return {
    view: ({
      attrs: {
        data: { userModel, carModel },
        errors,
        isSubmitted,
        httpError,
        getMakes,
        getModels,
        getVin,
      },
    }) => [
      m(
        'form.columns',
        { role: 'form', id: 'Register-form', onsubmit: false },
        [
          m(RegisterUser, { data: userModel, errors, isSubmitted, httpError }),
          m(RegisterCar, {
            data: carModel,
            errors,
            isSubmitted,
            httpError,
            getMakes,
            getModels,
            getVin,
          }),
        ]
      ),

      httpError && m('.toast toast-error', httpError),
    ],
  }
}
