import RegisterUser from "./registerUser.js"

export const Register = () => {
  return {
    view: ({
      attrs: {
        data: { userModel },
        errors,
        isSubmitted,
        httpError
      }
    }) => [
      m(
        "form.columns",
        {
          role: "form",
          id: "Register-form",
          onsubmit: (e) => e.preventDefault()
        },
        [
          m(RegisterUser, { data: userModel, errors, isSubmitted, httpError }),
          m(".divider-vert", { dataContent: "|" })
        ]
      ),

      httpError && m(".toast toast-error", httpError)
    ]
  }
}
