import FormInput from "Components/FormInputs"

const RegisterClientForm = () => {
  return {
    view: ({
      attrs: { data, state, errors, isSubmitted, entries, createForms }
    }) => [
      m(
        "button.btn",
        {
          onclick: (e) => {
            e.false

            createForms(entries(entries() + 1), state)
            console.log("entries", entries(), data)
          }
        },
        "Add Another Client"
      ),
      m("section.clientForms", [
        data.map((c) =>
          m("form.column col-6", { id: "client-form" }, [
            m(FormInput, {
              isSubmitted,
              data: c,
              errors,
              field: "firstname",
              label: "First Name",
              id: "first-name",
              type: "text"
            }),
            m(FormInput, {
              isSubmitted,
              data: c,
              errors,
              field: "lastname",
              label: "Last Name",
              id: "last-name",
              type: "text"
            }),
            m(FormInput, {
              isSubmitted,
              data: c,
              errors,
              field: "email",
              label: "Email",
              id: "email",
              type: "email"
            }),
            m(FormInput, {
              isSubmitted,
              data: c,
              errors,
              field: "confirmEmail",
              label: "Confirm Email",
              id: "confirm-email",
              type: "email"
            }),
            m(FormInput, {
              isSubmitted,
              data: c,
              errors,
              field: "birthdate",
              label: "birthdate",
              id: "birthdate",
              type: "date"
            })
          ])
        )
      ])
    ]
  }
}

export default RegisterClientForm
