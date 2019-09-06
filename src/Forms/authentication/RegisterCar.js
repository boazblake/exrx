import m from 'mithril'

const Car = () => {
  return {
    view: ({
      attrs: {
        data,
        errors,
        getMakes,
        getModels,
        getYears,
        isSubmitted,
        isLoading,
      },
    }) =>
      m('.column col-6', [
        m(
          'div.form-group',
          m('label.form-switch', [
            m('input', {
              type: 'checkbox',
              onclick: () => {
                console.log('wtf', data)
                data.findByVin = !data.findByVin
                if (!data.findByVin) {
                  console.log(data)
                  getYears()
                }
              },
              checked: data.findByVin,
              value: data.findByVin,
            }),
            m('i.form-icon'),
            'Find By VIN',
          ])
        ),

        !data.findByVin
          ? [
            m(
              '.toast toast-primary',
              { id: 'register-form-toast' },
              'Find your car by Drop Down'
            ),
            m(
              '.form-group ',
              isSubmitted && {
                class: errors.year ? 'has-error' : 'has-success',
              },
              [
                m('label.form-label text-left', { for: 'car-year' }, 'Year'),
                m(
                  'select.form-select',
                  {
                    id: 'car-year',
                    onchange: (e) => {
                      data.year = e.target.value
                      getMakes()
                    },
                    value: data.year,
                  },
                  data.years.map((year) => m('option.option', year))
                ),
                errors.year && m('p.form-input-hint', errors.year),
              ]
            ),
            data.year &&
                data.makes &&
                m(
                  '.form-group',
                  isSubmitted && {
                    class: errors.make ? 'has-error' : 'has-success',
                  },
                  [
                    m(
                      'label.form-label text-left',
                      { for: 'reg-make' },
                      'make'
                    ),
                    m('input.form-select', {
                      id: 'reg-make',
                      onchange: (e) => (data.make = e.target.value),
                      value: data.make,
                    }),
                    errors.make && m('p.form-input-hint', errors.make),
                  ]
                ),
            data.make &&
                data.models &&
                m(
                  '.form-group',
                  isSubmitted && {
                    class: errors.model ? 'has-error' : 'has-success',
                  },
                  [
                    m(
                      'label.form-label text-left',
                      { for: 'reg-model' },
                      'model'
                    ),
                    m('input.form-select', {
                      id: 'reg-model',
                      onchange: (e) => {
                        data.model = e.target.value
                        getModels()
                      },
                      value: data.model,
                    }),
                    errors.model && m('p.form-input-hint', errors.model),
                  ]
                ),
          ]
          : [
            m('.toast toast-primary', 'Find your car by VIN'),
            m(
              '.form-group input-group',
              isSubmitted && {
                class: errors.vin ? 'has-error' : 'has-success',
              },
              [
                m('label.form-label text-left', { for: 'pass-confirm' }),
                m('input.form-input', {
                  id: 'pass-confirm',
                  type: 'password',
                  placeholder: 'must contain and not contain',
                  onkeyup: (e) => (data.vin = e.target.value),
                  value: data.vin,
                }),
                m(
                  'button.btn btn-primary input-group-btn',
                  { onclick: () => console.log('car data', data) },
                  m(`i.icon.icon-search ${isLoading && 'loading'} `)
                ),
                errors.vin && m('p.form-input-hint', errors.vin),
              ]
            ),
          ],
        m(
          '.form-group',
          isSubmitted && {
            class: errors.mileage ? 'has-error' : 'has-success',
          },
          [
            m('label.form-label text-left', { for: 'reg-pass' }, 'mileage'),
            m('input.form-input', {
              id: 'reg-pass',
              type: 'mileage',
              placeholder: 'must contain and not contain',
              onkeyup: (e) => (data.mileage = e.target.value),
              value: data.mileage,
            }),
            errors.mileage && m('p.form-input-hint', errors.mileage),
          ]
        ),
      ]),
  }
}

export default Car
