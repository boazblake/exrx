import m from 'mithril'

import UnautherizedView from '../Default/UnautherizedViews.js'

const AirConditioning = ({ attrs: { mdl } }) => {
  return {
    view: () =>
      m('.air-conditioning', [
        m('h1', mdl.state.route.title),

        m('h2.subTitle.bg-secondary', 'service-maintenance'),
        m('.anchor', { id: 'service-maintenance' }),

        m(
          'p.p',
          'Is the air conditioning system of your vehicle blowing hot air or not blowing at all?...  The air conditioning system can have three different types of issues; mechanical, electrical or refrigerant all of which can have the similar effect--an uncomfortable vehicle interior. The benefit of having a certified technician investigate your vehicle\'s air conditioning system is to discover where the source of your problem lies.'
        ),

        m(
          'p.p',
          'PAC (Professional Auto Care) understands how grueling the Houston heat can be and how important, for both comfort and health, your vehicle\'s air conditioning system is for you and your family. We have the latest&nbsp;EPA compliance equipment&nbsp;to inspect your vehicle\'s Heating Ventilation and Air Conditioning System.&nbsp;'
        ),

        m(
          'p.p',
          'The air conditioning is part of the HVAC system. The primary function of the HVAC system (heating, ventilation and air conditioning system) is to provide you comfort while operating your motor vehicle. The HVAC system can be divided into two passenger compartment functions. The first function is the heating and the second function is the cooling system. The air conditioning system\'s function is to remove heat and moisture from the air which therefore reduces the relative humidity in the passenger compartment. Regardless of which system is in use, the passenger compartment temperature can be adjusted with the air temperature controls. A vehicle\'s air conditioning system is equipped with filters to remove and prevent dust and pollen particles from entering the passenger compartment'
        ),

        m(
          'p.p',
          'Professional Auto Care is the premier full-service auto repair shop in SW Houston. Our auto repair shop has been family owned and operated for over 30 years. Professional Auto Care provides honest and reliable automotive repair and maintenance services. When a team member of our auto shop examines your auto A/C you can rest assured knowing a certified professional will be following a step by step procedure to not only determine what exactly the vehicle air conditioning needs, but also why it needs it. All our automotive air conditioning testing procedures come with a full report of the A/C testing findings.'
        ),

        m('h2.subTitle.bg-secondary', 'help-over-heating'),
        m('.anchor', { id: 'help-over-heating' }),

        m(
          'p.p',
          'If your engine begins overheating while driving in heavy traffic, the following steps can help alleviate the condition:'
        ),

        m('ul', [
          m('li', 'Set the climate control system to "Heat"'),
          m('li', 'Set the blower fan on "High"'),
          m('li', 'Set the blower fan on "High"'),
          m('li', 'Roll down your windows'),
          m(
            'li',
            'Allow more distance between your vehicle and the one in front of you. (This enables your engine to "breathe" more easily.)'
          ),
        ]),

        m(
          'p.p',
          'The above steps will help reduce heat on the system. If the overheating condition persists, pull over to the shoulder of the road and allow the engine to cool. DO NOT ATTEMPT TO OPEN THE HOOD. Wait until the vehicle is cool enough to open the hood if your vehicle is over heating and then open the hood to allow cooling. As a precautionary measure, have your vehicle checked by a professional technician as soon as possible.'
        ),

        m('h2.subTitle.bg-secondary', 'ac-video'),
        m('.anchor', { id: 'ac-video' }),

        m('iframe', {
          id: 'ac-video',
          class: 'plyr__video-embed',
          width: '600',
          height: '400',
          src:
            'https://www.youtube.com/embed/lfAQtaBFi0Y?origin=https://plyr.io&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1',
          allowfullscreen: 'allowfullscreen',
          allowtransparency: '',
          allow: 'autoplay',
        }),
        // mdl.state.user.isAutherized ? [] :

        m('h2.subTitle.bg-secondary', 'ac-parts'),
        m('.anchor', { id: 'ac-parts' }),

        m(UnautherizedView, { mdl }),

        m('h2.subTitle.bg-secondary', 'ac-testing-fees'),
        m('.anchor', { id: 'ac-testing-fees' }),
        m(
          'p.p',
          'Testing fees range between $54.99 for mechanic testing up to $168.90 (including refrigerant, technician testing, oil and dye).Please call for details.'
        ),
      ]),
  }
}

export default AirConditioning
