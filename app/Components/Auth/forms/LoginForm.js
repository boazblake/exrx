import FormInput from "Components/FormInputs"

export const LoginForm = () => {
  return {
    view: ({ attrs: { data, errors, isSubmitted, validate, httpError } }) =>
      m(
        "form.column",
        { id: "Login-form", onsubmit: (e) => e.preventDefault() },
        [
          m(FormInput, {
            isSubmitted,
            data,
            validate,
            errors,
            field: "email",
            label: "email",
            id: "email",
            type: "email"
          }),
          m(FormInput, {
            isSubmitted,
            data,
            validate,
            errors,
            field: "password",
            label: "password",
            id: "reg-pass",
            type: "password"
          }),
          httpError && httpError.map((err) => m(".toast toast-error", err))
        ]
      )
  }
}
