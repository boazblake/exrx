const FormInput = {
  view: ({
    attrs: { isSubmitted, data, errors, field, label, id, type, validate }
  }) =>
    m(
      ".form-group ",
      isSubmitted && {
        class: errors[field] ? "has-error" : "has-success"
      },
      [
        m("label.form-label text-left", { id }, [
          label,
          m("span.span required", "*")
        ]),
        m("input.form-input", {
          id,
          type,
          placeholder: label,
          oninput: (e) => {
            data[field] = e.target.value
            isSubmitted && validate()
          },
          value: data[field],
          autocomplete: false
        }),
        errors[field] && m("p.form-input-hint", errors[field])
      ]
    )
}

export default FormInput
