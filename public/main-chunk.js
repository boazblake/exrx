(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{1:function(t,e,n){"use strict";function i(){return{view:function(t){var e=t.attrs.mdl.state.loadingProgress,n=e.value,i=e.max;return a()(".progressBar",a()("progress.progress",{max:i,value:n}))}}}function o(t){function e(t){return function(t){return a.a.render(t,a()("path",{xmlns:"http://www.w3.org/2000/svg",d:n.state.showNav()?i:o}))}(t.dom)}var n=t.attrs.mdl,i="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z",o="M10.707 7.05L10 6.343 4.343 12l1.414 1.414L10 9.172l4.243 4.242L15.657 12z";return{oncreate:e,onupdate:e,view:function(t){var e=t.attrs.mdl;return a()("svg.btn",{id:"hamburger",onclick:function(){return e.toggleNav(e)}},"SHOW")}}}function r(){return{view:function(){return a()(".dropdown dropdown-right",a()(".btn-group",[a()("a.btn.btn-primary.dropdown-toggle[tabindex='0']",["Login / Register",a()("i.icon.icon-caret")]),a()("ul.menu",[a()("li.menu-item",a()(a.a.route.Link,{class:"btn-link",href:"#"},"login")),a()("li.menu-item",a()(a.a.route.Link,{class:"btn-link",href:"#"},"register"))])]))}}}var c=n(0),a=n.n(c),s=n(2),u=n(33),d=n.n(u);console.log(d.a);function l(t){var r=t.attrs.key;return{view:function(t){var e=t.attrs,n=e.tab,i=e.active,o=e.tabSelected;return a()(a.a.route.Link,{class:i?"tab-item active":"tab-item",key:r,id:"".concat(n.id),href:"".concat(n.route),onmouseenter:function(){o(n.id)}},"Home"===n.title?a()("img",{style:{width:"100px"},src:d.a}):n.title)}}}function m(){return{view:function(t){var e=t.attrs,n=e.mdl,i=e.tabSelected,o=n.Routes.filter(function(t){return t.position.includes("nav")});return[a()("ul.tab tab-group",{id:"tabbar"},[o.map(function(t,e){return a()("li.tab-item",a()(l,{key:e,active:function(t){var e=Object(s.a)(1);return t.id==e}(t),tab:t,tabSelected:i,mdl:n}))}),a()(r)])]}}}function p(t){var o=t.attrs.key;return{view:function(t){var e=t.attrs,n=e.route,i=e.active;return a()("li",a()(a.a.route.Link,{class:i?"btn btn-primary active":"btn btn-link",key:o,id:"".concat(n.id),href:"".concat(n.route)},n.title))}}}function h(){return{view:function(t){var e=t.attrs,n=e.mdl,i=e.tabSelected,o=n.Routes.filter(function(t){return t.group.includes(i())});return a()(".nav-links bg-secondary",a()("ul.accordian-body nav ".concat(o.length?"active":"hide"),{id:"navbar"},o.map(function(t,e){return a()(p,{class:"nav-item",key:e,active:function(t){var e=Object(s.a)(2);return t.id==e}(t),route:t,mdl:n})})))}}}function g(){var n=Object(y.a)(Object(s.a)(1));return{view:function(t){var e=t.attrs.mdl;return a()(".navigation",{onmouseenter:function(){return n(Object(s.a)(1))},onmouseleave:function(){return n(Object(s.a)(1))}},[a()(m,{mdl:e,tabSelected:n}),a()(h,{mdl:e,tabSelected:n})])}}}function f(){return{view:function(t){var e=t.attrs.mdl;return a()("header.header",{id:"header"},[e.state.isLoading()?a()(i,{mdl:e}):[a()(g,{mdl:e}),"desktop"!==e.state.profile&&a()(o,{mdl:e})]])}}}function b(t){var o=t.attrs.key;return{view:function(t){var e=t.attrs,n=e.tab,i=e.active;return a()("li.menu-item",a()(a.a.route.Link,{class:i?" active menu-item ":"menu-item",onclick:function(){a.a.route.set(n.route,{a:n.id})},key:o,id:"".concat(n.id,"-key"),href:"".concat(n.route)},n.title))}}}function v(t){var n=t.attrs.mdl.Routes.filter(function(t){return t.position.includes("sidebar")});return{view:function(t){var e=t.attrs.mdl;return a()(".left-aside",{id:"left-aside"},a()(k,{routes:n,mdl:e}))}}}function w(){return{view:function(){return a()(".aside",{id:"right-aside"})}}}var y=n(8),O={view:function(){return a()("footer",{id:"footer"},a()("p.p text-center","Copyright © Professional Auto Care. All rights reserved. ".concat((new Date).getFullYear()," Privacy Policy")))}},j={view:function(t){var e=t.children;return a()(".content",{id:"content"},e)}},k={view:function(t){var n=t.attrs.mdl,e=a.a.route.get().split("/")[2],i=n.Routes.filter(function(t){return t.group.includes(e)});return i.length?a()("ul.menu",{id:"menu"},i.map(function(t,e){return a()(b,{key:e,active:n.state.route.route==t.route,tab:t})})):[]}};e.a=function(t){var n=t.attrs.mdl;return{view:function(t){var e=t.children;return a()(".layout",{id:"layout"},[a()(f,{mdl:n}),(n.state.showNav()||"desktop"==n.state.profile)&&a()(v,{mdl:n}),a()(j,{mdl:n},[e]),a()(w,{mdl:n}),a()(O,{mdl:n})])}}}},11:function(t,e,n){"use strict";var i=n(0),o=n.n(i),r=n(8),c=n(13),a=n.n(c),s=n(44),u=n(47),d=n(48),l=n(64),m=Object(l.a)([s.a,u.a,d.a]);function p(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{},i=Object.keys(n);"function"==typeof Object.getOwnPropertySymbols&&(i=i.concat(Object.getOwnPropertySymbols(n).filter(function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),i.forEach(function(t){h(e,t,n[t])})}return e}function h(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function g(t){t.lengthComputable&&(j.state.loadingProgress.max=t.total,j.state.loadingProgress.value=t.loaded,o.a.redraw())}function f(){return!1}function b(){return j.state.isLoading(!0),!1}function v(){return j.state.isLoading(!1),j.state.loadingProgress.max=0,j.state.loadingProgress.value=0,!1}n.d(e,"b",function(){return j});function w(i){return function(n){return new a.a(function(t,e){return o.a.request(i,p({},n,y)).then(e,t)})}}var y={config:function(t){t.onprogress=g,t.onload=f,t.onloadstart=b,t.onloadend=v}},O={getTask:function(e){return function(t){return w(e)({params:p({},t),method:"GET"})}},postTask:function(e){return function(t){return w(e)(p({},t,{method:"POST"}))}},putTask:function(e){return function(t){return w(e)(p({},t,{method:"PUT"}))}}},j=(e.a=O,{Routes:m,http:O,limits:[5,10,15,20,25,30,35,40,45,50],data:Object(r.a)({}),state:{loadingProgress:{max:0,value:0},paginate:{from:1,size:10,total:0},isLoading:Object(r.a)(!1),url:"",route:"",scrollPos:1,limit:10,profile:"",showLimits:Object(r.a)(!1),showSettings:Object(r.a)(!1),showNav:Object(r.a)(!1),query:Object(r.a)("")},toggleLimits:function(t){return t.state.showLimits(!t.state.showLimits())},toggleSettings:function(t){return t.state.showSettings(!t.state.showSettings())},toggleNav:function(t){return t.state.showNav(!t.state.showNav())},filterData:function(e){return function(t){return e.state.query(t)}}})},19:function(t,e,n){"use strict";var i=n(0),o=n.n(i),r=o()("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20"},o()("path",{d:"M2 4v14h14v-6l2-2v10H0V2h10L8 4H2zm10.3-.3l4 4L8 16H4v-4l8.3-8.3zm1.4-1.4L16 0l4 4-2.3 2.3-4-4z"})),c=o()("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20"},o()("path",{d:"M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"})),a=o()("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20"},o()("path",{d:"M8 20H3V10H0L10 0l10 10h-3v10h-5v-6H8v6z"})),s=o()("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20"},o()("path",{d:"M4 8V6a6 6 0 1 1 12 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2h1zm5 6.73V17h2v-2.27a2 2 0 1 0-2 0zM7 6v2h6V6a3 3 0 0 0-6 0z"})),u=o()("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20"},o()("path",{d:"M10.707 7.05L10 6.343 4.343 12l1.414 1.414L10 9.172l4.243 4.242L15.657 12z"})),d={contact:r,services:o()("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20"},o()("path",{d:"M9 20v-1.7l.01-.24L15.07 12h2.94c1.1 0 1.99.89 1.99 2v4a2 2 0 0 1-2 2H9zm0-3.34V5.34l2.08-2.07a1.99 1.99 0 0 1 2.82 0l2.83 2.83a2 2 0 0 1 0 2.82L9 16.66zM0 1.99C0 .9.89 0 2 0h4a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zM4 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"})),home:a,downChevron:c,lock:s,upChevron:u};e.a=d},2:function(t,e,n){"use strict";var i=n(0),o=n.n(i);function r(t){return o.a.route.get().split("/")[t]}function c(t){function e(t){return null!=t}var n=e(t)?document.getElementById(t):document.body,i=window.pageYOffset||document.documentElement.scrollTop,o=e(n)?n.getBoundingClientRect().top:0;window.scroll({top:o+i-10,left:0,behavior:"smooth"})}o()(".holder",[o()(".preloader",[o()("div"),o()("div"),o()("div"),o()("div"),o()("div"),o()("div"),o()("div")])]),n(73),n(65),n(66),n(67),n(68),n(74),n(77),n(49),n(69),n(70),n(76),n(46),n(45),n(71),n(72),n(75),n(13),n(11);n.d(e,"a",function(){return r}),n.d(e,"b",function(){return c})},20:function(t,e,n){"use strict";function i(){return{view:function(){return r()(".empty",[r()("svg.unauth-lock",c.a.lock),r()("p.empty-title.h5","Registered Users Only"),r()("p.empty-subtitle",r()("button.btn","Register or Log in to view this content"))])}}}var o=n(0),r=n.n(o),c=n(19),a=n(2);e.a=function(t){var e=t.attrs.mdl;return{oncreate:function(){return Object(a.b)(e.state.anchor)},view:function(){return r()(".page.air-conditioning",{onscroll:function(){return console.log("wtyf")}},[r()("h1.title",e.state.route.title),r()("section.anchor",{id:"service-maintenance"},[r()("h2.subTitle.bg-secondary","service-maintenance"),r()("p.p","Is the air conditioning system of your vehicle blowing hot air or not blowing at all?...  The air conditioning system can have three different types of issues; mechanical, electrical or refrigerant all of which can have the similar effect--an uncomfortable vehicle interior. The benefit of having a certified technician investigate your vehicle's air conditioning system is to discover where the source of your problem lies."),r()("p.p","PAC (Professional Auto Care) understands how grueling the Houston heat can be and how important, for both comfort and health, your vehicle's air conditioning system is for you and your family. We have the latest&nbsp;EPA compliance equipment&nbsp;to inspect your vehicle's Heating Ventilation and Air Conditioning System.&nbsp;"),r()("p.p","The air conditioning is part of the HVAC system. The primary function of the HVAC system (heating, ventilation and air conditioning system) is to provide you comfort while operating your motor vehicle. The HVAC system can be divided into two passenger compartment functions. The first function is the heating and the second function is the cooling system. The air conditioning system's function is to remove heat and moisture from the air which therefore reduces the relative humidity in the passenger compartment. Regardless of which system is in use, the passenger compartment temperature can be adjusted with the air temperature controls. A vehicle's air conditioning system is equipped with filters to remove and prevent dust and pollen particles from entering the passenger compartment"),r()("p.p","Professional Auto Care is the premier full-service auto repair shop in SW Houston. Our auto repair shop has been family owned and operated for over 30 years. Professional Auto Care provides honest and reliable automotive repair and maintenance services. When a team member of our auto shop examines your auto A/C you can rest assured knowing a certified professional will be following a step by step procedure to not only determine what exactly the vehicle air conditioning needs, but also why it needs it. All our automotive air conditioning testing procedures come with a full report of the A/C testing findings.")]),r()("section.anchor",{id:"help-over-heating"},[r()("h2.subTitle.bg-secondary","help-over-heating"),r()("p.p","If your engine begins overheating while driving in heavy traffic, the following steps can help alleviate the condition:"),r()("ul",[r()("li",'Set the climate control system to "Heat"'),r()("li",'Set the blower fan on "High"'),r()("li",'Set the blower fan on "High"'),r()("li","Roll down your windows"),r()("li",'Allow more distance between your vehicle and the one in front of you. (This enables your engine to "breathe" more easily.)')]),r()("p.p","The above steps will help reduce heat on the system. If the overheating condition persists, pull over to the shoulder of the road and allow the engine to cool. DO NOT ATTEMPT TO OPEN THE HOOD. Wait until the vehicle is cool enough to open the hood if your vehicle is over heating and then open the hood to allow cooling. As a precautionary measure, have your vehicle checked by a professional technician as soon as possible.")]),r()("section.anchor",{id:"ac-video"},[r()("h2.subTitle.bg-secondary","ac-video"),r()("iframe",{id:"ac-video",class:"plyr__video-embed video-responsive",width:"600",height:"400",frameborder:0,src:"https://www.youtube.com/embed/lfAQtaBFi0Y?origin=https://plyr.io&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1",allowfullscreen:!0,allowtransparency:!1,allow:"autoplay"})]),r()("section.anchor",{id:"ac-parts"},[r()("h2.subTitle.bg-secondary","ac-parts"),r()("p.p","The air conditioning is a complex system and understanding the reason something failed is just as important as fixing the car itself. What Parts Make Up the Air Conditioning System? Below are some common heating and air conditioning components, click on the component to get a detailed description and picture."),r()(i,{mdl:e})]),r()("section.anchor",{id:"ac-testing-fees"},[r()("h2.subTitle.bg-secondary","ac-testing-fees"),r()("p.p","Testing fees range between $54.99 for mechanic testing up to $168.90 (including refrigerant, technician testing, oil and dye).Please call for details.")])])}}}},3:function(t,e,n){"use strict";var i=n(0),o=n.n(i);e.a=function(t){var e=t.attrs.mdl;return{view:function(){return o()(".default",e.state.route.title)}}}},33:function(t,e,n){t.exports=n.p+"./assets/professional-auto-care-logo-brand.png"},44:function(t,c,a){"use strict";(function(e){var n=a(1),i=a(3),r=a(2),t=a(19),o=[{id:"home",title:"Home",icon:t.a.home,route:"/home",position:["nav"],group:[],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"services",title:"Services",icon:t.a.services,route:"/services",position:["nav","sidebar"],group:[],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"discounts",title:"Discounts",icon:"discounts",route:"/discounts",position:["nav","footer"],group:[],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"vendors",title:"Vendors",icon:"vendors",route:"/vendors",position:["nav","footer"],group:[],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"about",title:"About",icon:"about",route:"/about",position:["nav"],group:[],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"contact",title:"Contact",icon:t.a.contact,route:"/contact",position:["nav","footer"],group:[],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"blog",title:"Blog",icon:"blog",route:"/blog",position:["nav","footer"],group:[],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}}];c.a=o}).call(this,a(0))},47:function(t,u,d){"use strict";(function(e){var n=d(1),i=d(3),o=d(20),t=d(64),r=d(2),c=[{id:"service-maintenance",title:"Air Conditioning - Service & Maintenance",icon:"airconditioning",route:"/services/air-conditioning/#service-maintenance",position:["sidebar"],group:["air-conditioning"],children:[],onmatch:function(t,e,n,i,o){console.log("onmatch service main",o),o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"help-over-heating",title:"Air Conditioning - Help! OverHeating",icon:"airconditioning",route:"/services/air-conditioning/#help-over-heating",position:["sidebar"],group:["air-conditioning"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(o.a,{mdl:t}))}},{id:"ac-video",title:"Air Conditioning - Video",icon:"airconditioning",route:"/services/air-conditioning/#ac-video",position:["sidebar"],group:["air-conditioning"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(o.a,{mdl:t}))}},{id:"ac-parts",title:"Air Conditioning - Parts",icon:"airconditioning",route:"/services/air-conditioning/#ac-parts",position:["sidebar"],group:["air-conditioning"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(o.a,{mdl:t}))}},{id:"ac-testing-fees",title:"Air Conditioning - Testing Fees",icon:"airconditioning",route:"/services/air-conditioning/#ac-testing-fees",position:["sidebar"],group:["air-conditioning"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(o.a,{mdl:t}))}}],a=[{id:"alignment",title:"Alignment",icon:"alignment",route:"/services/alignment",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"air-conditioning",title:"Air Conditioning",icon:"airconditioning",route:"/services/air-conditioning",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(o.a,{mdl:t}))}},{id:"battery",title:"Battery",icon:"battery",route:"/services/battery",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"belts",title:"Belts",icon:"belts",route:"/services/belts",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"brakes",title:"Brakes",icon:"brakes",route:"/services/brakes",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"check-engine-light",title:"Check Engine Light",icon:"checkenginelight",route:"/services/check-engine-light",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"clutch",title:"Clutch",icon:"clutch",route:"/services/clutch",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"cooling-system",title:"Cooling System",icon:"coolingsystem",route:"/services/cooling-system",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"drive-train",title:"Drivetrain",icon:"drivetrain",route:"/services/drive-train",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"engine-remanufactured",title:"Engine Remanufactured",icon:"engineremanufactured",route:"/services/engine-remanufactured",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"exhuast-emissions",title:"Exhaust & Emissions",icon:"exhuastemissions",route:"/services/exhuast-emissions",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"exterior-repair",title:"Exterior Repair",icon:"exteriorrepair",route:"/services/exterior-repair",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"filters",title:"Filters",icon:"filters",route:"/services/filters",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"flood-repair",title:"Flood Repair",icon:"floodrepair",route:"/services/flood-repair",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"fuel-system",title:"Fuel System",icon:"fuelsystem",route:"/services/fuel-system",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"hoses",title:"Hoses",icon:"hoses",route:"/services/hoses",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"ignition",title:"Ignition",icon:"ignition",route:"/services/ignition",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"inspections",title:"Inspections",icon:"inspections",route:"/services/inspections",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"interior-repairs",title:"Interior Repairs",icon:"interiorrepairs",route:"/services/interior-repairs",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"maintenance",title:"Maintenance",icon:"maintenance",route:"/services/maintenance",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"oil-change",title:"Oil Change",icon:"oilchange",route:"/services/oil-change",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"timing-belt",title:"Timing Belt",icon:"timingbelt",route:"/services/timing-belt",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"tire-management",title:"Tire Management",icon:"tiremanagement",route:"/services/tire-management",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"starting-charging",title:"Starting Charging",icon:"startingcharging",route:"/services/starting-charging",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"steering",title:"Steering",icon:"steering",route:"/services/steering",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"suspension",title:"Suspension",icon:"suspension",route:"/services/suspension",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"transmission-remanufactured",title:"Transmission Remanufactured",icon:"transmissionremanufactured",route:"/services/transmission-remanufactured",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"window-repairs",title:"Window Repairs",icon:"windowrepairs",route:"/services/window-repairs",position:["sidebar"],group:["services"],children:[],onmatch:function(t,e,n,i,o){o&&Object(r.b)(t.state.anchor)},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}}],s=Object(t.a)([a,c]);u.a=s}).call(this,d(0))},48:function(t,o,r){"use strict";(function(e){var n=r(1),i=r(3),t=[{id:"bg-products",title:"BG Products",icon:"bgproducts",route:"/vendors/bg-products",position:["sidebar"],group:["vendors"],children:[],onmatch:function(t,e,n){return t.state.route=n},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"bg-products-fuel-Air-induction-service",title:"BG Products Fuel/Air Induction Service",icon:"bgproducts",route:"/vendors/bg-products/#bg-products-fuel-Air-induction-service",position:["sidebar"],group:["bg-products"],children:[],onmatch:function(t,e,n){return t.state.route=n},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"bg-products-lubrication-fuel-service",title:"BG Products Lubrication + Fuel Service",icon:"bgproducts",route:"/vendors/bg-products/#bg-products-lubrication-fuel-service",position:["sidebar"],group:["bg-products"],children:[],onmatch:function(t,e,n){return t.state.route=n},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"bg-products-cooling-system-service",title:"BG Products Cooling System Service",icon:"bgproducts",route:"/vendors/bg-products/#bg-products-cooling-system-service",position:["sidebar"],group:["bg-products"],children:[],onmatch:function(t,e,n){return t.state.route=n},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"bg-products-transmission-service",title:"BG Products Transmission Service",icon:"bgproducts",route:"/vendors/bg-products/#bg-products-transmission-service",position:["sidebar"],group:["bg-products"],children:[],onmatch:function(t,e,n){return t.state.route=n},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"bg-products-drive-line",title:"BG Products Drive Line",icon:"bgproducts",route:"/vendors/bg-products/#bg-products-drive-line",position:["sidebar"],group:["bg-products"],children:[],onmatch:function(t,e,n){return t.state.route=n},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"bg-products-break-service",title:"BG Products Break Service",icon:"bgproducts",route:"/vendors/bg-products/#bg-products-break-service",position:["sidebar"],group:["bg-products"],children:[],onmatch:function(t,e,n){return t.state.route=n},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"bg-products-climate-control-service",title:"BG Products Climate Control Service",icon:"bgproducts",route:"/vendors/bg-products/#bg-products-climate-control-service",position:["sidebar"],group:["bg-products"],children:[],onmatch:function(t,e,n){return t.state.route=n},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"bg-products-battery-service",title:"BG Products Battery Service",icon:"bgproducts",route:"/vendors/bg-products/#bg-products-battery-service",position:["sidebar"],group:["bg-products"],children:[],onmatch:function(t,e,n){return t.state.route=n},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"bg-products-power-steering-service",title:"BG Products Power Steering Service",icon:"bgproducts",route:"/vendors/bg-products/#bg-products-power-steering-service",position:["sidebar"],group:["bg-products"],children:[],onmatch:function(t,e,n){return t.state.route=n},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}},{id:"bg-products-ethanol-fuel-system-defender",title:"BG Products Ethanol Fuel System Defender",icon:"bgproducts",route:"/vendors/bg-products/#bg-products-ethanol-fuel-system-defender",position:["sidebar"],group:["bg-products"],children:[],onmatch:function(t,e,n){return t.state.route=n},component:function(t){return e(n.a,{mdl:t},e(i.a,{mdl:t}))}}];o.a=t}).call(this,r(0))},62:function(t,e){},63:function(t,e,n){"use strict";n.r(e);var i=n(0),o=n.n(i),r=n(11),c=function(t){return t.Routes.reduce(function(r){return function(t,o){return t[o.route]={onmatch:function(t,e,n){r.state.route=o,r.state.anchor=e.split("#")[1];var i=Boolean(r.state.anchor);o.onmatch(r,t,e,n,i)},render:function(){return o.component(r)}},t}}(t),{})},a=(n(62),document.body),s=window.innerWidth;function u(t){return t<668?"phone":t<920?"tablet":"desktop"}r.b.state.profile=u(s),function t(e){var n=window.innerWidth;if(e!==n){e=n;var i=r.b.state.profile;r.b.state.profile=u(n),i!=r.b.state.profile&&o.a.redraw()}return requestAnimationFrame(t)}(s);document.scroll=function(t){return function(t){return console.log(t),t}(t)},o.a.route(a,"/home",c(r.b))}},[[63,1,2]]]);
//# sourceMappingURL=main-chunk.js.map