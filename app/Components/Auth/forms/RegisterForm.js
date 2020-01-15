import FormInput from "Components/FormInputs"

export const RegisterForm = () => {
  return {
    view: ({ attrs: { data, errors, isSubmitted, httpError } }) => [
      m(
        "form.column",
        {
          role: "form",
          id: "Register-form",
          onsubmit: (e) => e.preventDefault()
        },
        [
          (".column col-6",
          [
            m(FormInput, {
              isSubmitted,
              data,
              errors,
              field: "name",
              label: "Name",
              id: "name",
              type: "text"
            }),
            m(FormInput, {
              isSubmitted,
              data,
              errors,
              field: "email",
              label: "email",
              id: "email",
              type: "email"
            }),
            m(FormInput, {
              isSubmitted,
              data,
              errors,
              field: "confirmEmail",
              label: "Confirm Email",
              id: "confirm-email",
              type: "email"
            }),
            m(FormInput, {
              isSubmitted,
              data,
              errors,
              field: "password",
              label: "password",
              id: "reg-pass",
              type: "password"
            }),
            m(FormInput, {
              isSubmitted,
              data,
              errors,
              field: "confirmPassword",
              label: "Confirm Password",
              id: "pass-confirm",
              type: "password"
            })
          ]),
          m(".divider-vert", { dataContent: "|" })
        ]
      ),

      httpError && m(".toast toast-error", httpError)
    ]
  }
}
