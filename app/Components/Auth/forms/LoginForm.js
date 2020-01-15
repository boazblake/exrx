import FormInput from "Components/FormInputs"

export const LoginForm = () => {
  return {
    view: ({ attrs: { data, errors, isSubmitted, httpError } }) =>
      m(
        "form.column",
        { role: "form", id: "Login-form", onsubmit: (e) => e.preventDefault() },
        [
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
            field: "password",
            label: "password",
            id: "reg-pass",
            type: "password"
          }),
          httpError && m(".toast toast-error", httpError)
        ]
      )
  }
}
