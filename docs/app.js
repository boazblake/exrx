(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("App.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var toRoutes = function toRoutes(mdl) {
  return function (acc, route) {
    acc[route.route] = {
      onmatch: function onmatch(args, path, fullroute) {
        if (route.group.includes('authenticated') && !mdl.state.isAuth()) {
          mdl.route.set(m.route.get());
        }

        mdl.state.route = route;
        mdl.state.anchor = path.split('#')[1];
        var isAnchor = Boolean(mdl.state.anchor);
        route.onmatch(mdl, args, path, fullroute, isAnchor);
      },
      render: function render() {
        return route.component(mdl);
      }
    };
    return acc;
  };
};

var App = function App(mdl) {
  return mdl.Routes.reduce(toRoutes(mdl), {});
};

var _default = App;
exports.default = _default;
});

;require.register("Components/Auth/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../../Forms/index.js");

var _Modal = _interopRequireDefault(require("../Modal.js"));

var _Utils = require("Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userModel = {
  name: "",
  email: "",
  password: "",
  confirmEmail: "",
  confirmPassword: "",
  isAdmin: false
};
var dataModel = {
  userModel: userModel
};
var state = {
  forms: {
    1: _index.Register,
    0: _index.Login
  },
  page: 0,
  title: {
    1: "Register",
    0: "Login"
  },
  isSubmitted: false,
  errors: {},
  httpError: undefined,
  data: (0, _Utils.jsonCopy)(dataModel)
};

var resetState = function resetState() {
  state.data = (0, _Utils.jsonCopy)(dataModel);
  state.errors = {};
  state.httpError = undefined;
  state.isSubmitted = false;
  state.page = 0;
};

var onError = function onError(error) {
  console.log("error with http calll", error);
  state.httpError = error.message;
  state.isSubmitted = false;
};

var onRegisterSuccess = function onRegisterSuccess(data) {
  console.log("succes with registering", data, state);
  return state.page = 0;
};

var onLoginSuccess = function onLoginSuccess(mdl) {
  return function (user) {
    window.sessionStorage.setItem("user-token", user["user-token"]);
    mdl.user = user;
    mdl.state.isAuth(true);
    mdl.toggleAuthModal(mdl);
    resetState();
  };
};

var validateForm = function validateForm(mdl) {
  return function (data) {
    var onValidationError = function onValidationError(errs) {
      state.errors = errs;
      console.log("failed - state", state);
    };

    var onValidationSuccess = function onValidationSuccess(data) {
      state.errors = {};
      state.page ? registerUser(mdl)(data).fork(onError, onRegisterSuccess) : loginUser(mdl)(data).fork(onError, onLoginSuccess(mdl));
    };

    state.isSubmitted = true;
    state.page ? (0, _index.validateUserRegistrationTask)(data.userModel).fork(onValidationError, onValidationSuccess) : (0, _index.validateLoginTask)(data.userModel).fork(onValidationError, onValidationSuccess);
  };
};

var loginUser = function loginUser(mdl) {
  return function (_ref) {
    var email = _ref.email,
        password = _ref.password;
    return mdl.http.backEnd.post(mdl)("users/login")({
      login: email,
      password: password
    });
  };
};

var registerUser = function registerUser(mdl) {
  return function (_ref2) {
    var name = _ref2.name,
        email = _ref2.email,
        password = _ref2.password,
        isAdmin = _ref2.isAdmin;
    return mdl.http.backEnd.post(mdl)("users/register")({
      name: name,
      email: email,
      password: password,
      isAdmin: isAdmin
    });
  };
};

var changePage = function changePage() {
  state.httpError = undefined;
  return state.page ? state.page = 0 : state.page = 1;
};

var AuthLink = function AuthLink() {
  return {
    view: function view(_ref3) {
      var title = _ref3.attrs.title;
      return m("a.AuthLinkBtn btn-link", {
        onclick: changePage
      }, title);
    }
  };
};

var AuthComponent = function AuthComponent() {
  return {
    view: function view(_ref4) {
      var mdl = _ref4.attrs.mdl;
      return m(_Modal.default, {
        isActive: mdl.state.showAuthModal(),
        close: function close() {
          resetState();
          mdl.toggleAuthModal(mdl);
        },
        title: state.title[state.page],
        content: m(state.forms[state.page], {
          data: state.data,
          errors: state.errors,
          httpError: state.httpError,
          isSubmitted: state.isSubmitted
        }),
        footer: [m("input.btn.btn-primary authBtn", {
          type: "submit",
          form: "".concat(state.title[state.page], "-form"),
          onclick: function onclick() {
            return validateForm(mdl)(state.data);
          },
          class: mdl.state.isLoading() && "loading"
        }, state.title[state.page]), m(AuthLink, {
          mdl: mdl,
          title: state.page ? "Login" : "Register"
        })]
      });
    }
  };
};

var _default = AuthComponent;
exports.default = _default;
});

;require.register("Components/Body.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Toaster = _interopRequireDefault(require("./Toaster.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Body = {
  view: function view(_ref) {
    var children = _ref.children,
        mdl = _ref.attrs.mdl;
    return m(".content", {
      id: "content"
    }, [children, mdl.state.toast.show() && m(_Toaster.default, {
      mdl: mdl
    })]);
  }
};
var _default = Body;
exports.default = _default;
});

;require.register("Components/Button.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Button = function Button() {
  return {
    view: function view(_ref) {
      var _ref$attrs = _ref.attrs,
          action = _ref$attrs.action,
          label = _ref$attrs.label,
          _ref$attrs$classList = _ref$attrs.classList,
          classList = _ref$attrs$classList === void 0 ? '' : _ref$attrs$classList,
          isDisabled = _ref$attrs.isDisabled;
      return (0, _mithril.default)("button.btn.".concat(classList), {
        onclick: function onclick(e) {
          return action(e);
        },
        disabled: isDisabled
      }, label);
    }
  };
};

var _default = Button;
exports.default = _default;
});

;require.register("Components/DropDown.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("Utils");

var Selector = {
  onbeforeremove: _Utils.animateChildrenLimitsExit,
  view: function view(_ref) {
    var mdl = _ref.attrs.mdl;
    return m(".limits", mdl.limits.map(function (limit, idx) {
      return m("button.btn.limit", {
        oncreate: (0, _Utils.animateChildrenLimitsEntrance)(idx),
        onclick: function onclick() {
          mdl.state.limit = limit;
          mdl.state.showLimits(false);
        },
        key: idx
      }, limit);
    }));
  }
};
var DropDown = {
  view: function view(_ref2) {
    var mdl = _ref2.attrs.mdl;
    return m(".changeLimits", [m("button.btn", {
      onclick: function onclick() {
        return mdl.toggleLimits(mdl);
      }
    }, "Change Limit"), mdl.state.showLimits() && [m(Selector, {
      mdl: mdl
    })]]);
  }
};
var _default = DropDown;
exports.default = _default;
});

;require.register("Components/Footer.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _SocialMedia = _interopRequireDefault(require("./SocialMedia.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Footer = {
  view: function view() {
    return m("footer", {
      id: "footer"
    }, m("p.text-center", ["Copyright \xA9 Boaz Blake. All rights reserved. ".concat(new Date().getFullYear(), " Privacy Policy"), m(_SocialMedia.default)]));
  }
};
var _default = Footer;
exports.default = _default;
});

;require.register("Components/Hamburger.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Hamburger = function Hamburger(_ref) {
  var mdl = _ref.attrs.mdl;
  var state = {
    close: 'M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z',
    open: 'M10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z'
  };

  var render = function render(dom) {
    return _mithril.default.render(dom, (0, _mithril.default)('path', {
      xmlns: 'http://www.w3.org/2000/svg',
      d: mdl.state.showNav() ? state.close : state.open
    }));
  };

  var updateDom = function updateDom(_ref2) {
    var dom = _ref2.dom;
    var _dom = dom;
    return render(_dom);
  };

  return {
    oncreate: updateDom,
    onupdate: updateDom,
    view: function view(_ref3) {
      var mdl = _ref3.attrs.mdl;
      return (0, _mithril.default)('svg.btn.hamburger', {
        id: 'hamburger',
        onclick: function onclick() {
          return mdl.toggleNav(mdl);
        }
      });
    }
  };
};

var _default = Hamburger;
exports.default = _default;
});

;require.register("Components/Headers/Header.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ProgressBar = _interopRequireDefault(require("../ProgressBar.js"));

var _Hamburger = _interopRequireDefault(require("../Hamburger.js"));

var _index = _interopRequireDefault(require("../Navigation/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Header = function Header() {
  return {
    view: function view(_ref) {
      var mdl = _ref.attrs.mdl;
      return m("header.header", {
        id: "header"
      }, [mdl.state.isLoading() && m(_ProgressBar.default, {
        mdl: mdl
      }), mdl.state.profile !== "desktop" && m(".mobileNav", m(_Hamburger.default, {
        mdl: mdl
      })), m(_index.default, {
        mdl: mdl
      })]);
    }
  };
};

var _default = Header;
exports.default = _default;
});

;require.register("Components/Headers/SplashHeader.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _NavTabs = _interopRequireDefault(require("../Navigation/NavTabs.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SplashHeader = function SplashHeader() {
  return {
    view: function view(_ref) {
      var mdl = _ref.attrs.mdl;
      return m("header.header", {
        id: "header"
      }, [mdl.state.isLoading() && m(ProgressBar, {
        mdl: mdl
      }), m(_NavTabs.default, {
        mdl: mdl,
        tabSelected: function tabSelected() {}
      })]);
    }
  };
};

var _default = SplashHeader;
exports.default = _default;
});

;require.register("Components/Headers/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Header = require("./Header.js");

Object.keys(_Header).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Header[key];
    }
  });
});

var _SplashHeader = require("./SplashHeader.js");

Object.keys(_SplashHeader).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SplashHeader[key];
    }
  });
});
});

;require.register("Components/Icons/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var contact = m("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20"
}, m("path", {
  d: "M2 4v14h14v-6l2-2v10H0V2h10L8 4H2zm10.3-.3l4 4L8 16H4v-4l8.3-8.3zm1.4-1.4L16 0l4 4-2.3 2.3-4-4z"
}));
var dotsVerticleThree = m("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20"
}, m("path", {
  d: "M10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
}));
var downChevron = m("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20"
}, m("path", {
  d: "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
}));
var home = m("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20"
}, m("path", {
  d: "M8 20H3V10H0L10 0l10 10h-3v10h-5v-6H8v6z"
}));
var lock = m("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20"
}, m("path", {
  d: "M4 8V6a6 6 0 1 1 12 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2h1zm5 6.73V17h2v-2.27a2 2 0 1 0-2 0zM7 6v2h6V6a3 3 0 0 0-6 0z"
}));
var upChevron = m("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20"
}, m("path", {
  d: "M10.707 7.05L10 6.343 4.343 12l1.414 1.414L10 9.172l4.243 4.242L15.657 12z"
}));
var services = m("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 20 20"
}, m("path", {
  d: "M9 20v-1.7l.01-.24L15.07 12h2.94c1.1 0 1.99.89 1.99 2v4a2 2 0 0 1-2 2H9zm0-3.34V5.34l2.08-2.07a1.99 1.99 0 0 1 2.82 0l2.83 2.83a2 2 0 0 1 0 2.82L9 16.66zM0 1.99C0 .9.89 0 2 0h4a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zM4 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
}));
var _default = {
  contact: contact,
  services: services,
  home: home,
  downChevron: downChevron,
  lock: lock,
  upChevron: upChevron,
  dotsVerticleThree: dotsVerticleThree
};
exports.default = _default;
});

;require.register("Components/LeftAside.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _NavMenu = _interopRequireDefault(require("./Navigation/NavMenu.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LeftAside = function LeftAside(_ref) {
  var mdl = _ref.attrs.mdl;
  var routes = mdl.Routes.filter(function (r) {
    return r.position.includes("sidebar");
  });
  return {
    view: function view(_ref2) {
      var mdl = _ref2.attrs.mdl;
      return m(".left-aside", {
        id: "left-aside"
      }, m(_NavMenu.default, {
        routes: routes,
        mdl: mdl
      }));
    }
  };
};

var _default = LeftAside;
exports.default = _default;
});

;require.register("Components/Modal.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Modal = {
  view: function view(_ref) {
    var _ref$attrs = _ref.attrs,
        isActive = _ref$attrs.isActive,
        close = _ref$attrs.close,
        title = _ref$attrs.title,
        content = _ref$attrs.content,
        footer = _ref$attrs.footer;
    return (0, _mithril.default)('.modal', {
      class: isActive ? 'active' : '',
      id: 'modal'
    }, [(0, _mithril.default)('a.modal-overlay', {
      'aria-label': 'Close',
      onclick: function onclick() {
        return close();
      }
    }), (0, _mithril.default)('.modal-container', {
      role: 'document'
    }, [(0, _mithril.default)('.modal-header', [(0, _mithril.default)('a.btn btn-clear float-right', {
      id: 'modal-close',
      'aria-label': 'Close',
      onclick: function onclick() {
        return close();
      }
    }), (0, _mithril.default)('.modal-title h3', title)]), (0, _mithril.default)('.modal-body', (0, _mithril.default)('.content', content)), (0, _mithril.default)('.modal-footer', footer)])]);
  }
};
var _default = Modal;
exports.default = _default;
});

;require.register("Components/Navigation/NavLinks.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("Utils");

var NavLink = function NavLink(_ref) {
  var key = _ref.attrs.key;
  return {
    view: function view(_ref2) {
      var _ref2$attrs = _ref2.attrs,
          route = _ref2$attrs.route,
          active = _ref2$attrs.active;
      return m("li", m(m.route.Link, {
        class: active ? "btn btn-primary active" : "btn btn-link",
        key: key,
        id: "".concat(route.id),
        href: "".concat(route.route)
      }, route.title));
    }
  };
};

var NavLinks = function NavLinks() {
  return {
    view: function view(_ref3) {
      var _ref3$attrs = _ref3.attrs,
          mdl = _ref3$attrs.mdl,
          tabSelected = _ref3$attrs.tabSelected;
      var routes = mdl.Routes.filter(function (r) {
        return r.group.includes(tabSelected()) && !r.group.includes("admin");
      });

      var isActive = function isActive(route) {
        var _active = (0, _Utils.getRoute)(2);

        return route.id == _active;
      };

      return m("ul.nav-links bg-secondary accordian-body nav ".concat(routes.length ? "active" : "hide"), {
        id: "navbar"
      }, routes.map(function (route, idx) {
        return m(NavLink, {
          class: "nav-item",
          key: idx,
          active: isActive(route),
          route: route,
          mdl: mdl
        });
      }));
    }
  };
};

var _default = NavLinks;
exports.default = _default;
});

;require.register("Components/Navigation/NavMenu.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var goToTop = function goToTop(mdl) {
  return (0, _mithril.default)("button.btn.btn-primary", {
    onclick: function onclick() {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
      mdl.toggleNav(mdl);

      _mithril.default.route.set(mdl.state.route.route);
    }
  }, "Top of Page");
};

var Tab = function Tab(_ref) {
  var key = _ref.attrs.key;
  return {
    view: function view(_ref2) {
      var _ref2$attrs = _ref2.attrs,
          tab = _ref2$attrs.tab,
          active = _ref2$attrs.active,
          mdl = _ref2$attrs.mdl;
      return (0, _mithril.default)("li.".concat(active ? "menu-item" : "menu-item"), (0, _mithril.default)(_mithril.default.route.Link, {
        onclick: function onclick() {
          _mithril.default.route.set("".concat(tab.route, "/#").concat(tab.id));

          mdl.state.scrollPos(window.scrollY);
          mdl.toggleNav(mdl);
        },
        key: key,
        id: "".concat(tab.id, "-key"),
        href: "".concat(tab.route)
      }, tab.title));
    }
  };
};

var NavMenu = function NavMenu(_ref3) {
  var mdl = _ref3.attrs.mdl;
  return {
    // onupdate: () => console.log('update', mdl.state.scrollPos()),
    view: function view(_ref4) {
      var mdl = _ref4.attrs.mdl;

      var route = _mithril.default.route.get().split("/")[2];

      console.log("nav view", mdl.state.scrollPos());
      var routes = mdl.Routes.filter(function (r) {
        return r.group.includes(route);
      });
      return routes.length ? (0, _mithril.default)("ul.menu", {
        id: "menu"
      }, [mdl.state.scrollPos() > 0 && (0, _mithril.default)("li.menu-item", goToTop(mdl)), routes.map(function (tab, idx) {
        return (0, _mithril.default)(Tab, {
          key: idx,
          active: mdl.state.route.route == tab.route,
          tab: tab,
          mdl: mdl
        });
      })]) : [];
    }
  };
};

var _default = NavMenu;
exports.default = _default;
});

;require.register("Components/Navigation/NavTabs.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("Utils");

var _Auth = _interopRequireDefault(require("Components/Auth"));

var _SettingsMenu = _interopRequireDefault(require("./SettingsMenu.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tab = function Tab(_ref) {
  var key = _ref.attrs.key;
  return {
    view: function view(_ref2) {
      var _ref2$attrs = _ref2.attrs,
          tab = _ref2$attrs.tab,
          active = _ref2$attrs.active,
          tabSelected = _ref2$attrs.tabSelected;
      return m(m.route.Link, {
        class: active ? "tab-item active" : "tab-item",
        key: key,
        id: "".concat(tab.id),
        href: "".concat(tab.route),
        onmouseenter: function onmouseenter() {
          tabSelected(tab.id);
        }
      }, tab.title === "Home" ? m("img", {
        style: {
          width: "100px"
        },
        src: "Brand"
      }) : tab.title);
    }
  };
};

var NavTabs = function NavTabs() {
  return {
    view: function view(_ref3) {
      var _ref3$attrs = _ref3.attrs,
          mdl = _ref3$attrs.mdl,
          tabSelected = _ref3$attrs.tabSelected;
      var tabs = mdl.Routes.filter(function (r) {
        return r.position.includes("nav");
      });

      var isTabActive = function isTabActive(tab) {
        var _active = (0, _Utils.getRoute)(1);

        return tab.id == _active;
      };

      return [m("ul.tab tab-group", {
        id: "tabbar"
      }, [tabs.map(function (tab, idx) {
        return m("li.tab-item", m(Tab, {
          key: idx,
          active: isTabActive(tab),
          tab: tab,
          tabSelected: tabSelected,
          mdl: mdl
        }));
      }), mdl.state.isAuth() ? m(_SettingsMenu.default, {
        mdl: mdl
      }) : m("li.tab-item", m("button.btn btn-primary", {
        onclick: function onclick() {
          return mdl.toggleAuthModal(mdl);
        }
      }, "Login / Register")), m(_Auth.default, {
        mdl: mdl
      })])];
    }
  };
};

var _default = NavTabs;
exports.default = _default;
});

;require.register("Components/Navigation/SettingsMenu.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("Utils");

var Logout = function Logout() {
  var onError = function onError(mdl) {
    return function (error) {
      console.log("error", error, mdl);
    };
  };

  var onSuccess = function onSuccess(mdl) {
    return function () {
      window.sessionStorage.removeItem("user-token");
      mdl.state.isAuth(false);
      mdl.user = null;
      mdl.state.route.group.includes("authenticated") && history.back();
    };
  };

  var logout = function logout(mdl) {
    return mdl.http.backEnd.get(mdl)("users/logout").fork(onError(mdl), onSuccess(mdl));
  };

  return {
    view: function view(_ref) {
      var mdl = _ref.attrs.mdl;
      return m("li.menu-item", m("button.btn btn-primary", {
        onclick: function onclick() {
          return logout(mdl);
        }
      }, "LOGOUT"));
    }
  };
};

var Tab = function Tab(_ref2) {
  var key = _ref2.attrs.key;
  return {
    view: function view(_ref3) {
      var _ref3$attrs = _ref3.attrs,
          tab = _ref3$attrs.tab,
          active = _ref3$attrs.active,
          mdl = _ref3$attrs.mdl;
      return m("li.menu-item", m("a.btn btn-link menu-item", {
        class: active && "active",
        onclick: function onclick() {
          m.route.set(tab.route, {
            name: (0, _Utils.makeRoute)(mdl.user.name)
          });
          mdl.toggleNav(mdl);
        },
        key: key,
        id: "".concat(tab.id, "-key") // href: `${tab.route}`,

      }, tab.title));
    }
  };
};

var SettingsMenu = function SettingsMenu() {
  return {
    showMenu: Stream(false),
    view: function view(_ref4) {
      var state = _ref4.state,
          mdl = _ref4.attrs.mdl;
      var routes = mdl.Routes.filter(function (route) {
        return route.group.includes("authenticated") && route.group.includes("admin") && mdl.user.isAdmin || route.group.includes("authenticated") && !route.group.includes("admin");
      });
      return [m("li.dropdown dropdown-right", [m("a.btn btn-primary dropdown-toggle", {
        onclick: function onclick() {
          return state.showMenu(!state.showMenu());
        },
        tabindex: "0"
      }, ["User Settings", m("i.icon icon-arrow-down")]), state.showMenu() && m("ul.menu", [m(".panel", [m(".panel-header", m(".panel-title", "Comments")), m(".panel-nav"), m(".panel-body"), m(".panel-footer")]), m(Logout, {
        mdl: mdl
      }), routes.map(function (tab, idx) {
        return m(Tab, {
          key: idx,
          active: mdl.state.route.route == tab.route,
          tab: tab,
          mdl: mdl
        });
      })])])];
    }
  };
};

var _default = SettingsMenu;
exports.default = _default;
});

;require.register("Components/Navigation/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _NavTabs = _interopRequireDefault(require("./NavTabs.js"));

var _NavLinks = _interopRequireDefault(require("./NavLinks.js"));

var _Utils = require("Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Navigation = function Navigation() {
  var tabSelected = Stream((0, _Utils.getRoute)(1));
  return {
    view: function view(_ref) {
      var mdl = _ref.attrs.mdl;
      return m(".navigation", {
        onmouseenter: function onmouseenter() {
          return tabSelected((0, _Utils.getRoute)(1));
        },
        onmouseleave: function onmouseleave() {
          return tabSelected((0, _Utils.getRoute)(1));
        }
      }, [m(_NavTabs.default, {
        mdl: mdl,
        tabSelected: tabSelected
      }), m(_NavLinks.default, {
        mdl: mdl,
        tabSelected: tabSelected
      })]);
    }
  };
};

var _default = Navigation;
exports.default = _default;
});

;require.register("Components/Navigation/navigation.scss", function(exports, require, module) {
module.exports = {"nav":"_nav_htg3j_1"};
});

require.register("Components/Paginate.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _Components = _interopRequireDefault(require("Components"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Paginate = {
  view: function view(_ref) {
    var _ref$attrs = _ref.attrs,
        state = _ref$attrs.state,
        http = _ref$attrs.http,
        paginateFn = _ref$attrs.paginateFn,
        limit = _ref$attrs.limit,
        mdl = _ref$attrs.mdl;
    return (0, _mithril.default)(".pagination", [(0, _mithril.default)(_Components.default, {
      action: function action() {
        state.from = state.from - mdl.state.limit;
        state.size = mdl.state.limit;
        paginateFn(http);
      },
      isDisabled: state.from - mdl.state.limit <= 0,
      label: [_mithril.default.trust("&#8678;"), limit]
    }), (0, _mithril.default)(_Components.default, {
      action: function action() {
        state.from = state.from + state.data.length++;
        state.size = mdl.state.limit;
        paginateFn(http);
      },
      label: [limit, _mithril.default.trust("&#8680;")],
      isDisabled: state.from + mdl.state.limit > state.total
    }), (0, _mithril.default)(".", (0, _mithril.default)("code.code", "".concat(state.from, " - ").concat(state.from + state.size, " ")), (0, _mithril.default)("code.code.row", " of ".concat(state.total, " ")))]);
  }
};
var _default = Paginate;
exports.default = _default;
});

;require.register("Components/ProgressBar.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ProgressBar = function ProgressBar() {
  return {
    view: function view(_ref) {
      var _ref$attrs$mdl$state$ = _ref.attrs.mdl.state.loadingProgress,
          value = _ref$attrs$mdl$state$.value,
          max = _ref$attrs$mdl$state$.max;
      return (0, _mithril.default)('.progressBar', (0, _mithril.default)('progress.progress', {
        max: max,
        value: value ? value : null
      }));
    }
  };
};

var _default = ProgressBar;
exports.default = _default;
});

;require.register("Components/RightAside.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RightAside = function RightAside() {
  return {
    view: function view() {
      return (0, _mithril.default)('.aside', {
        id: 'right-aside'
      });
    }
  };
};

var _default = RightAside;
exports.default = _default;
});

;require.register("Components/SearchBar.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _Utils = require("Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debounce300 = (0, _Utils.debounce)(300);

var SearchBar = function SearchBar(_ref) {
  var mdl = _ref.attrs.mdl;
  var filterData = mdl.filterData(mdl);
  return {
    view: function view() {
      return (0, _mithril.default)(".searchBar", [(0, _mithril.default)("input.input", {
        placeholder: "search query",
        oninput: function oninput(e) {
          return debounce300(filterData(e.target.value));
        }
      })]);
    }
  };
};

var _default = SearchBar;
exports.default = _default;
});

;require.register("Components/Sidebar.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _Utils = require("Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Sidebar = {
  oncreate: _Utils.animateSidebarEntrance,
  view: function view(_ref) {
    var children = _ref.children,
        classList = _ref.attrs.classList;
    return (0, _mithril.default)("aside.".concat(classList), children);
  }
};
var _default = Sidebar;
exports.default = _default;
});

;require.register("Components/SocialMedia.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var facebook = {
  name: "f",
  href: "https://www.facebook.com"
};
var twitter = {
  name: "t",
  href: "https://www.twitter.com"
};
var socialmedialinks = [facebook, twitter];
var avatar = {
  view: function view(_ref) {
    var _ref$attrs = _ref.attrs,
        name = _ref$attrs.name,
        href = _ref$attrs.href;
    return (0, _mithril.default)("a", {
      selector: "figure",
      class: "avatar avatar-xl",
      "data-initial": name,
      target: "_blank",
      href: href
    });
  }
};

var SocialMediaLinks = function SocialMediaLinks() {
  return {
    view: function view() {
      return (0, _mithril.default)(".socialmedias", socialmedialinks.map(function (_ref2) {
        var name = _ref2.name,
            href = _ref2.href;
        return (0, _mithril.default)(avatar, {
          name: name,
          href: href
        });
      }));
    }
  };
};

var _default = SocialMediaLinks;
exports.default = _default;
});

;require.register("Components/Toaster.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Toaster = function Toaster() {
  return {
    view: function view(_ref) {
      var mdl = _ref.attrs.mdl;
      return (0, _mithril.default)('.toast', {
        class: "toast-".concat(mdl.state.toast.class())
      }, [(0, _mithril.default)('button.btn btn-clear', {
        id: 'btn-toast'
      }), mdl.state.toast.contents()]);
    }
  };
};

var _default = Toaster;
exports.default = _default;
});

;require.register("Components/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Body = require("./Body.js");

Object.keys(_Body).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Body[key];
    }
  });
});

var _Button = require("./Button.js");

Object.keys(_Button).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Button[key];
    }
  });
});

var _DropDown = require("./DropDown.js");

Object.keys(_DropDown).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _DropDown[key];
    }
  });
});

var _Footer = require("./Footer.js");

Object.keys(_Footer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Footer[key];
    }
  });
});

var _Hamburger = require("./Hamburger.js");

Object.keys(_Hamburger).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Hamburger[key];
    }
  });
});

var _Headers = require("./Headers");

Object.keys(_Headers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Headers[key];
    }
  });
});

var _Modal = require("./Modal.js");

Object.keys(_Modal).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Modal[key];
    }
  });
});

var _Sidebar = require("./Sidebar.js");

Object.keys(_Sidebar).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Sidebar[key];
    }
  });
});

var _index = require("./Auth/index.js");

Object.keys(_index).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _index[key];
    }
  });
});

var _index2 = require("./Icons/index.js");

Object.keys(_index2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _index2[key];
    }
  });
});
});

;require.register("FP/all.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.All = void 0;

var All = function All(x) {
  return {
    val: x,
    concat: function concat(_ref) {
      var val = _ref.val;
      return All(x && val);
    }
  };
};

exports.All = All;
All.empty = All(true);
});

;require.register("FP/any.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Any = void 0;

var Any = function Any(x) {
  return {
    val: x,
    concat: function concat(_ref) {
      var val = _ref.val;
      return Any(x || val);
    }
  };
};

exports.Any = Any;
Any.empty = Any(false);
});

;require.register("FP/array.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArrayFP = void 0;

var _util = require("./util");

var _flatten = function _flatten(xs) {
  return xs.reduce(function (a, b) {
    return a.concat(b);
  }, []);
};

var configure = function configure(_) {
  var _fmap = function _fmap(f) {
    var xs = this;
    return xs.map(function (x) {
      return f(x);
    }); //avoid index
  };

  Object.defineProperty(Array.prototype, 'fmap', (0, _util.value)(_fmap));

  var _empty = function _empty(_) {
    return [];
  };

  Object.defineProperty(Array.prototype, 'empty', (0, _util.value)(_empty));

  var _chain = function _chain(f) {
    return _flatten(this.fmap(f));
  };

  Object.defineProperty(Array.prototype, 'chain', (0, _util.value)(_chain));

  var _of = function _of(x) {
    return [x];
  };

  Object.defineProperty(Array.prototype, 'of', (0, _util.value)(_of));

  var _ap = function _ap(a2) {
    return _flatten(this.map(function (f) {
      return a2.map(function (a) {
        return f(a);
      });
    }));
  };

  Object.defineProperty(Array.prototype, 'ap', (0, _util.value)(_ap));

  var _traverse = function _traverse(f, point) {
    var cons_f = function cons_f(ys, x) {
      return f(x).map(function (x) {
        return function (y) {
          return y.concat(x);
        };
      }).ap(ys);
    };

    return this.reduce(cons_f, point([]));
  };

  Object.defineProperty(Array.prototype, 'traverse', (0, _util.value)(_traverse));

  var _any = function _any() {
    return this.length > 0;
  };

  Object.defineProperty(Array.prototype, 'any', (0, _util.value)(_any));

  var _in = function _in(comparer) {
    for (var i = 0; i < this.length; i++) {
      if (comparer(this[i])) return true;
    }

    return false;
  };

  Object.defineProperty(Array.prototype, 'in', (0, _util.value)(_in));

  var _pushIfNotExist = function _pushIfNotExist(element, comparer) {
    if (!this.in(comparer)) {
      this.push(element);
    }
  };

  Object.defineProperty(Array.prototype, 'pushIfNotExist', (0, _util.value)(_pushIfNotExist));

  var _foldM = function _foldM(point, f) {
    var _this = this;

    var go = function go(a) {
      return !_this.any() ? point(a) : f(a, _this.shift()).chain(go);
    };

    return go;
  };

  Object.defineProperty(Array.prototype, 'foldM', (0, _util.value)(_foldM));
};

var ArrayFP = {
  configure: configure
};
exports.ArrayFP = ArrayFP;
});

;require.register("FP/coyoneda.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Coyoneda = void 0;

var _daggy = require("daggy");

var _ramda = require("ramda");

var Coyoneda = (0, _daggy.tagged)('x', 'f');
exports.Coyoneda = Coyoneda;

Coyoneda.prototype.map = function (f) {
  return Coyoneda(this.x, (0, _ramda.compose)(f, this.f));
};

Coyoneda.prototype.lower = function () {
  return this.x.map(this.f);
};

Coyoneda.lift = function (x) {
  return Coyoneda(x, _ramda.identity);
};
});

;require.register("FP/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  FP: true,
  Coyoneda: true
};
Object.defineProperty(exports, "Coyoneda", {
  enumerable: true,
  get: function get() {
    return _coyoneda.Coyoneda;
  }
});
exports.FP = void 0;

var _all = require("./all");

Object.keys(_all).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _all[key];
    }
  });
});

var _any = require("./any");

Object.keys(_any).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _any[key];
    }
  });
});

var _tuple = require("./tuple.js");

Object.keys(_tuple).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _tuple[key];
    }
  });
});

var _coyoneda = require("./coyoneda");

var _pointfree = require("./pointfree");

Object.keys(_pointfree).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _pointfree[key];
    }
  });
});

var _sum = require("./sum.js");

Object.keys(_sum).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _sum[key];
    }
  });
});

var _list = require("./list");

Object.keys(_list).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _list[key];
    }
  });
});

var _intersection = require("./intersection.js");

Object.keys(_intersection).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _intersection[key];
    }
  });
});

var _array = require("./array");

var _task = require("./task");

var _maybe = require("./maybe");

var _validation = require("./validation");

var configure = function configure() {
  _array.ArrayFP.configure();

  _task.Task.configure();

  _maybe.Maybe.configure();

  _validation.Validation.configure();
};

var FP = {
  configure: configure
};
exports.FP = FP;
});

;require.register("FP/intersection.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Intersection = void 0;

// Intersection Semigroup.
//
// The intersection (based on value equality) of two lists
// Intersection :: (Eq m) <= m -> Intersection m
var Intersection = function Intersection(xs) {
  return {
    xs: xs,
    concat: function concat(_ref) {
      var ys = _ref.xs;
      return Intersection(xs.filter(function (x) {
        return ys.some(function (y) {
          return y.equals(x);
        });
      }));
    },
    inspect: "Intersection(".concat(xs, ")")
  };
};

exports.Intersection = Intersection;
});

;require.register("FP/list.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.List = void 0;

var _data = require("data.maybe");

var _ramda = require("ramda");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Nil = function Nil() {
  _classCallCheck(this, Nil);

  this.head = undefined;
  this.tail = undefined;
  this.isNil = true;
  this.isCons = false;
};

var Cons = function Cons(x, xs) {
  _classCallCheck(this, Cons);

  this.head = x;
  this.tail = xs;
  this.isNil = false;
  this.isCons = true;
}; //curry :: (a -> b -> c) -> a -> b -> c


var curry = function curry(f) {
  return function (x) {
    return function (y) {
      return f(x, y);
    };
  };
}; //uncurry :: (a -> b -> c) -> (a, b) -> c


var uncurry = function uncurry(f) {
  return function (x, y) {
    return f(x)(y);
  };
}; //o :: ((b -> c), (a -> b)) -> a -> c


var o = function o(f, g) {
  return function (x) {
    return f(g(x));
  };
}; //id :: a -> a


var id = function id(x) {
  return x;
}; //flip :: (a -> b -> c) -> (b, a) -> c


var flip = function flip(f) {
  return function (x, y) {
    return f(y, x);
  };
}; //cons :: (a, List a) -> List a


var cons = function cons(x, xs) {
  return new Cons(x, xs);
}; //snoc :: (List a, a) -> List a


var snoc = function snoc(xs, x) {
  return new Cons(x, xs);
}; //ccons :: a -> List a -> List a


var ccons = curry(cons); //csnoc :: List a -> a -> List a
//const csnoc = curry(snoc)
//nil :: () => List a

var nil = function nil() {
  return new Nil();
}; //head :: List a -> a | undefined


var head = function head(_ref) {
  var head = _ref.head;
  return head;
}; //tail :: List a -> List a | undefined


var tail = function tail(_ref2) {
  var tail = _ref2.tail;
  return tail;
}; //concat :: List a -> List a -> List a


var concat = function concat(xs) {
  return function (ys) {
    return foldr(cons)(ys)(xs);
  };
}; //foldl :: ((a, b) -> a) -> a -> List b -> a


var foldl = function foldl(f) {
  var go = function go(b) {
    return function (_ref3) {
      var isNil = _ref3.isNil,
          head = _ref3.head,
          tail = _ref3.tail;
      return isNil ? b : go(f(b, head))(tail);
    };
  };

  return go;
}; //foldr :: ((a, b) -> a) -> a -> List b -> a


var foldr = function foldr(f) {
  return function (b) {
    var rev = function rev(acc) {
      return function (_ref4) {
        var isNil = _ref4.isNil,
            head = _ref4.head,
            tail = _ref4.tail;
        return isNil ? acc : rev(cons(head, acc))(tail);
      };
    };

    return o(foldl(flip(f))(b), rev(nil()));
  };
}; //foldMap :: Monoid m => (a -> m) -> List a -> m


var foldMap = function foldMap(f) {
  return foldl(function (acc, x) {
    return (acc || f(x).empty()).concat(f(x));
  })(null);
}; //foldM :: Monad m => (a -> m a) -> (a -> b -> m a) -> a -> List b -> m a


var foldM = function foldM(point) {
  return function (f) {
    var go = function go(a) {
      return function (_ref5) {
        var isNil = _ref5.isNil,
            head = _ref5.head,
            tail = _ref5.tail;
        return isNil ? point(a) : f(a, head).chain(function (x) {
          return go(x)(tail);
        });
      };
    };

    return go;
  };
}; //map :: (a -> b) -> List a -> List b


var map = function map(f) {
  return function (_ref6) {
    var isNil = _ref6.isNil,
        head = _ref6.head,
        tail = _ref6.tail;
    return isNil ? nil() : cons(f(head), map(f)(tail));
  };
}; //ap :: List (a -> b) -> List a -> List b


var ap = function ap(_ref7) {
  var isNil = _ref7.isNil,
      f = _ref7.head,
      fs = _ref7.tail;
  return function (xs) {
    return isNil ? nil() : concat(map(f)(xs))(ap(fs)(xs));
  };
}; //pure :: a -> List a


var pure = function pure(a) {
  return cons(a, nil());
}; //chain :: (a -> List b) -> List a -> List b


var chain = function chain(_ref8) {
  var isNil = _ref8.isNil,
      head = _ref8.head,
      tail = _ref8.tail;
  return function (f) {
    return isNil ? nil() : concat(f(head))(chain(tail)(f));
  };
}; //join :: List (List a -> List a)


var join = foldr(uncurry(concat))(nil()); //traverse :: Applicative f => (a -> f a) -> (a -> f b) -> List a -> f (List b)

var traverse = function traverse(point, f) {
  var con_f = function con_f(x, ys) {
    return f(x).map(ccons).ap(ys);
  };

  return foldr(con_f)(point(nil()));
}; //sequenceA :: Applicative f => (a -> f a) -> List (f a) -> f (List a)


var sequenceA = function sequenceA(point) {
  return traverse(point, id);
}; //length :: List a -> Int


var length = function length(xs) {
  var go = function go(b) {
    return function (_ref9) {
      var isCons = _ref9.isCons,
          tail = _ref9.tail;
      return isCons ? go(b + 1)(tail) : b;
    };
  };

  return go(0)(xs);
}; //findIndex :: (a -> Boolean) -> List a -> Maybe Int


var findIndex = function findIndex(f) {
  return function (xs) {
    var go = function go(n) {
      return function (_ref10) {
        var isNil = _ref10.isNil,
            head = _ref10.head,
            tail = _ref10.tail;
        return isNil ? (0, _data.Nothing)() : f(head) ? (0, _data.Just)(n) : go(n + 1)(tail);
      };
    };

    return go(0)(xs);
  };
}; //index :: Int -> List a -> Maybe a


var index = function index(i) {
  return function (xs) {
    var go = function go(n) {
      return function (_ref11) {
        var isNil = _ref11.isNil,
            head = _ref11.head,
            tail = _ref11.tail;
        return isNil ? (0, _data.Nothing)() : n === i ? (0, _data.Just)(head) : go(n + 1)(tail);
      };
    };

    return go(0)(xs);
  };
}; //reverse :: List a -> List a


var reverse = function reverse(xs) {
  var go = function go(acc) {
    return function (_ref12) {
      var isNil = _ref12.isNil,
          head = _ref12.head,
          tail = _ref12.tail;
      return isNil ? acc : go(cons(head, acc))(tail);
    };
  };

  return go(nil())(xs);
}; //contains :: Eq a => List a -> a -> Boolean


var contains = function contains(xs) {
  return function (x) {
    return findIndex((0, _ramda.equals)(x))(xs).isJust;
  };
}; //unique :: Eq a => List a -> List a


var unique = o(reverse, foldl(function (acc, x) {
  return contains(acc)(x) ? acc : cons(x, acc);
})(nil())); //toArray :: List a -> [a]

var toArray = foldl(function (acc, x) {
  return acc.concat([x]);
})([]); //toList :: [a] -> List a

var toList = function toList(xs) {
  return xs.reduceRight(function (acc, x) {
    return cons(x, acc);
  }, nil());
}; //List :: a -> ... -> List a


var list = function list() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return toList(args);
};

var List = {
  list: list,
  cons: cons,
  snoc: snoc,
  nil: nil,
  head: head,
  tail: tail,
  foldl: foldl,
  foldr: foldr,
  foldMap: foldMap,
  foldM: foldM,
  concat: concat,
  map: map,
  ap: ap,
  pure: pure,
  join: join,
  chain: chain,
  traverse: traverse,
  sequenceA: sequenceA,
  findIndex: findIndex,
  index: index,
  length: length,
  reverse: reverse,
  contains: contains,
  unique: unique,
  toArray: toArray,
  toList: toList
};
exports.List = List;
});

;require.register("FP/maybe.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Maybe = void 0;

var _data = _interopRequireDefault(require("data.maybe"));

var _data2 = _interopRequireDefault(require("data.task"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var configure = function configure(_) {
  var _toTask = function _toTask(nothing) {
    var cata = {
      Nothing: function Nothing(_) {
        return _data2.default.of(nothing);
      },
      Just: function Just(x) {
        return _data2.default.of(x);
      }
    };
    return this.cata(cata);
  };

  Object.defineProperty(_data.default.prototype, 'toTask', (0, _util.value)(_toTask));
};

var Maybe = {
  configure: configure
};
exports.Maybe = Maybe;
});

;require.register("FP/pointfree.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = exports.taskToPromise = exports.promiseToTask = exports.eitherToTask = exports.toList = exports.fold = exports.foldMap = exports.traverse = exports.of = exports.sequenceA = exports.mconcat = exports.mjoin = exports.ParseError = void 0;

var _ramda = require("ramda");

var _data = _interopRequireDefault(require("data.either"));

var _data2 = _interopRequireDefault(require("data.task"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var ParseError =
/*#__PURE__*/
function (_Error) {
  _inherits(ParseError, _Error);

  function ParseError() {
    _classCallCheck(this, ParseError);

    return _possibleConstructorReturn(this, _getPrototypeOf(ParseError).apply(this, arguments));
  }

  return ParseError;
}(_wrapNativeSuper(Error));

exports.ParseError = ParseError;

var id = function id(x) {
  return x;
};

var _groupsOf = (0, _ramda.curry)(function (n, xs) {
  return !xs.length ? [] : [xs.slice(0, n)].concat(_groupsOf(n, xs.slice(n, length)));
});

var mjoin = function mjoin(mmv) {
  if (mmv.mjoin) return mmv.mjoin();
  return (0, _ramda.chain)(id, mmv);
};

exports.mjoin = mjoin;
var mconcat = (0, _ramda.curry)(function (xs, empty) {
  return xs.length ? xs.reduce(_ramda.concat) : empty();
});
exports.mconcat = mconcat;
var sequenceA = (0, _ramda.curry)(function (point, fctr) {
  return fctr.traverse(id, point);
});
exports.sequenceA = sequenceA;

var of = function of(x) {
  return x.of;
};

exports.of = of;
var traverse = (0, _ramda.curry)(function (f, point, fctr) {
  return (0, _ramda.compose)(sequenceA(point), (0, _ramda.map)(f))(fctr);
});
exports.traverse = traverse;
var foldMap = (0, _ramda.curry)(function (f, fldable) {
  return fldable.reduce(function (acc, x) {
    var r = f(x);
    acc = acc || r.empty();
    return acc.concat(r);
  }, null);
});
exports.foldMap = foldMap;
var fold = (0, _ramda.curry)(function (f, g, x) {
  return x.fold(f, g);
});
exports.fold = fold;

var toList = function toList(x) {
  return x.reduce(function (acc, y) {
    return [y].concat(acc);
  }, []);
};

exports.toList = toList;

var eitherToTask = function eitherToTask(x) {
  return x.cata({
    Left: function Left(e) {
      return _data2.default.rejected(new ParseError(e));
    },
    Right: function Right(x) {
      return _data2.default.of(x);
    }
  });
};

exports.eitherToTask = eitherToTask;

var promiseToTask = function promiseToTask(p) {
  return new _data2.default(function (rej, res) {
    return p.then(res, rej);
  });
};

exports.promiseToTask = promiseToTask;

var taskToPromise = function taskToPromise(t) {
  return new Promise(function (res, rej) {
    return t.fork(rej, res);
  });
};

exports.taskToPromise = taskToPromise;

var parse = _data.default.try((0, _ramda.compose)(JSON.parse, (0, _ramda.prop)('response')));

exports.parse = parse;
});

;require.register("FP/sum.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sum = void 0;

var Sum = function Sum(x) {
  return {
    x: x,
    concat: function concat(_ref) {
      var y = _ref.x;
      return x + y;
    },
    inspect: "Sum(".concat(x, ")")
  };
};

exports.Sum = Sum;
});

;require.register("FP/task.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Task = void 0;

var _data = _interopRequireDefault(require("data.task"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var configure = function configure() {
  var _mjoin = function _mjoin() {
    var _this = this;

    return new _data.default(function (rej, res) {
      return _this.fork(rej, function (s) {
        return s.fork(rej, res);
      });
    });
  };

  Object.defineProperty(_data.default.prototype, 'mjoin', (0, _util.value)(_mjoin));
};

var Task = {
  configure: configure
};
exports.Task = Task;
});

;require.register("FP/tuple.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uncurry5 = exports.uncurry4 = exports.uncurry3 = exports.uncurry2 = exports.curry5 = exports.curry4 = exports.curry3 = exports.curry2 = exports.tuple5 = exports.tuple4 = exports.tuple3 = exports.tuple2 = exports.Tuple5 = exports.Tuple4 = exports.Tuple3 = exports.Tuple2 = exports.Tuple = void 0;

var _daggy = require("daggy");

var Tuple = (0, _daggy.tagged)('_1', '_2');
exports.Tuple = Tuple;
var Tuple2 = Tuple;
exports.Tuple2 = Tuple2;
var Tuple3 = (0, _daggy.tagged)('_1', '_2', '_3');
exports.Tuple3 = Tuple3;
var Tuple4 = (0, _daggy.tagged)('_1', '_2', '_3', '_4');
exports.Tuple4 = Tuple4;
var Tuple5 = (0, _daggy.tagged)('_1', '_2', '_3', '_4', '_5'); // Methods

exports.Tuple5 = Tuple5;

Tuple2.prototype.concat = function (b) {
  return Tuple2(this._1.concat(b._1), this._2.concat(b._2));
};

Tuple3.prototype.concat = function (b) {
  return Tuple3(this._1.concat(b._1), this._2.concat(b._2), this._3.concat(b._3));
};

Tuple4.prototype.concat = function (b) {
  return Tuple4(this._1.concat(b._1), this._2.concat(b._2), this._3.concat(b._3), this._4.concat(b._4));
};

Tuple5.prototype.concat = function (b) {
  return Tuple5(this._1.concat(b._1), this._2.concat(b._2), this._3.concat(b._3), this._4.concat(b._4), this._5.concat(b._5));
}; // Methods


Tuple.prototype.dimap = function (f, g) {
  return Tuple(f(this._1), g(this._2));
};

Tuple.prototype.map = function (f) {
  return Tuple(this._1, f(this._2));
};

Tuple.prototype.curry = function (f) {
  return f(this);
};

Tuple.prototype.uncurry = function (f) {
  return f(this._1, this._2);
};

Tuple.prototype.extend = function (f) {
  return Tuple(this._1, f(this));
};

Tuple.prototype.extract = function () {
  return this._2;
};

Tuple.prototype.foldl = function (f, z) {
  return f(this._2, z);
};

Tuple.prototype.foldr = function (f, z) {
  return f(z, this._2);
};

Tuple.prototype.foldMap = function (f, _) {
  return f(this._2);
};

var tuple2 = Tuple;
exports.tuple2 = tuple2;

var tuple3 = function tuple3(a, b, c) {
  return Tuple(tuple2(a, b), c);
};

exports.tuple3 = tuple3;

var tuple4 = function tuple4(a, b, c, d) {
  return Tuple(tuple3(a, b, c), d);
};

exports.tuple4 = tuple4;

var tuple5 = function tuple5(a, b, c, d, e) {
  return Tuple(tuple4(a, b, c, d), e);
};

exports.tuple5 = tuple5;

var curry2 = function curry2(f, a, b) {
  return f(tuple2(a, b));
};

exports.curry2 = curry2;

var curry3 = function curry3(f, a, b, c) {
  return f(tuple3(a, b, c));
};

exports.curry3 = curry3;

var curry4 = function curry4(f, a, b, c, d) {
  return f(tuple4(a, b, c, d));
};

exports.curry4 = curry4;

var curry5 = function curry5(f, a, b, c, d, e) {
  return f(tuple5(a, b, c, d, e));
};

exports.curry5 = curry5;

var uncurry2 = function uncurry2(f, t) {
  return f(t._1, t._2);
};

exports.uncurry2 = uncurry2;

var uncurry3 = function uncurry3(f, t) {
  return f(t._1._1, t._1._2, t._2);
};

exports.uncurry3 = uncurry3;

var uncurry4 = function uncurry4(f, t) {
  return f(t._1._1._1, t._1._1._2, t._1._2, t._2);
};

exports.uncurry4 = uncurry4;

var uncurry5 = function uncurry5(f, t) {
  return f(t._1._1._1._1, t._1._1._1._2, t._1._1._2, t._1._2, t._2);
};

exports.uncurry5 = uncurry5;
});

;require.register("FP/util.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.value = void 0;

var value = function value(f) {
  var x = {
    value: f,
    writable: true,
    configurable: true,
    enumerable: false
  };
  return x;
};

exports.value = value;
});

;require.register("FP/validation.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Validation = void 0;

var _data = _interopRequireDefault(require("data.validation"));

var _data2 = _interopRequireDefault(require("data.task"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var constant = function constant(x) {
  return function () {
    return x;
  };
};

var id = function id(x) {
  return x;
};

var configure = function configure() {
  var apLeft = function apLeft(b) {
    return this.map(constant).ap(b);
  };

  Object.defineProperty(_data.default.prototype, 'apLeft', (0, _util.value)(apLeft));

  var apRight = function apRight(b) {
    return this.map(constant(id)).ap(b);
  };

  Object.defineProperty(_data.default.prototype, 'apRight', (0, _util.value)(apRight));

  var _toTask = function _toTask() {
    var f = {
      Failure: function Failure(x) {
        return _data2.default.rejected(x);
      },
      Success: function Success(x) {
        return _data2.default.of(x);
      }
    };
    return this.cata(f);
  };

  Object.defineProperty(_data.default.prototype, 'toTask', (0, _util.value)(_toTask));
};

var Validation = {
  configure: configure
};
exports.Validation = Validation;
});

;require.register("Forms/authentication/Login.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Login = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Login = function Login() {
  return {
    view: function view(_ref) {
      var _ref$attrs = _ref.attrs,
          userModel = _ref$attrs.data.userModel,
          errors = _ref$attrs.errors,
          isSubmitted = _ref$attrs.isSubmitted,
          httpError = _ref$attrs.httpError;
      return (0, _mithril.default)('form.column', {
        role: 'form',
        id: 'Login-form',
        onsubmit: function onsubmit(e) {
          return e.preventDefault();
        }
      }, [(0, _mithril.default)('.form-group', isSubmitted && {
        class: errors.email ? 'has-error' : 'has-success'
      }, [(0, _mithril.default)('label.form-label text-left', {
        for: 'reg-email'
      }, 'Email'), (0, _mithril.default)('input.form-input', {
        id: 'reg-email',
        type: 'email',
        placeholder: 'Email',
        onkeyup: function onkeyup(e) {
          return userModel.email = e.target.value;
        },
        value: userModel.email
      }), errors.email && (0, _mithril.default)('p.form-input-hint', errors.email)]), (0, _mithril.default)('.form-group', isSubmitted && {
        class: errors.password ? 'has-error' : 'has-success'
      }, [(0, _mithril.default)('label.form-label text-left', {
        for: 'reg-pass'
      }, 'Password'), (0, _mithril.default)('input.form-input', {
        id: 'reg-pass',
        type: 'password',
        placeholder: 'must contain and not contain',
        onkeyup: function onkeyup(e) {
          return userModel.password = e.target.value;
        },
        value: userModel.password
      }), errors.password && (0, _mithril.default)('p.form-input-hint', errors.password)]), httpError && (0, _mithril.default)('.toast toast-error', httpError)]);
    }
  };
};

exports.Login = Login;
});

;require.register("Forms/authentication/Register.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Register = void 0;

var _registerUser = _interopRequireDefault(require("./registerUser.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Register = function Register() {
  return {
    view: function view(_ref) {
      var _ref$attrs = _ref.attrs,
          userModel = _ref$attrs.data.userModel,
          errors = _ref$attrs.errors,
          isSubmitted = _ref$attrs.isSubmitted,
          httpError = _ref$attrs.httpError;
      return [m("form.columns", {
        role: "form",
        id: "Register-form",
        onsubmit: function onsubmit(e) {
          return e.preventDefault();
        }
      }, [m(_registerUser.default, {
        data: userModel,
        errors: errors,
        isSubmitted: isSubmitted,
        httpError: httpError
      }), m(".divider-vert", {
        dataContent: "|"
      })]), httpError && m(".toast toast-error", httpError)];
    }
  };
};

exports.Register = Register;
});

;require.register("Forms/authentication/Validations.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateLoginTask = exports.validateUserRegistrationTask = void 0;

var _ramda = require("ramda");

var _data = require("data.validation");

var _Utils = require("Utils");

var ValidateRegistration = (0, _data.Success)((0, _ramda.curryN)(3, _ramda.identity));
var ValidateLogin = (0, _data.Success)((0, _ramda.curryN)(2, _ramda.identity));
var nameLense = (0, _ramda.lensProp)("name");
var passwordLense = (0, _ramda.lensProp)("password");
var passwordConfirmLense = (0, _ramda.lensProp)("confirmPassword");
var emailLense = (0, _ramda.lensProp)("email");
var emailConfirmLense = (0, _ramda.lensProp)("confirmEmail");
var NAME_REQUIRED_MSG = "A Name is required";
var PASSWORD_REQUIRED_MSG = "A Password is required";
var EMAIL_REQUIRED_MSG = "An Email is required";
var EMAILS_MUST_MATCH = "Emails do not match";
var INVALID_EMAIL_FORMAT = "Email must be a valid format";
var PASSWORDS_MUST_MATCH = "Passwords do not match";

var inputsMatch = function inputsMatch(input1) {
  return function (input2) {
    return input2 === input1;
  };
};

var validateName = function validateName(data) {
  return (0, _data.Success)(data).apLeft((0, _Utils.validate)(_Utils.isRequired, nameLense, NAME_REQUIRED_MSG, data));
};

var validateEmails = function validateEmails(data) {
  return (0, _data.Success)(data).apLeft((0, _Utils.validate)(_Utils.isRequired, emailLense, EMAIL_REQUIRED_MSG, data)).apLeft((0, _Utils.validate)(_Utils.isRequired, emailConfirmLense, EMAIL_REQUIRED_MSG, data)).apLeft((0, _Utils.validate)(inputsMatch(data.confirmEmail), emailLense, EMAILS_MUST_MATCH, data)).apLeft((0, _Utils.validate)(inputsMatch(data.email), emailConfirmLense, EMAILS_MUST_MATCH, data)).apLeft((0, _Utils.validate)(_Utils.emailFormat, emailConfirmLense, INVALID_EMAIL_FORMAT, data)).apLeft((0, _Utils.validate)(_Utils.emailFormat, emailLense, INVALID_EMAIL_FORMAT, data));
};

var validateEmail = function validateEmail(data) {
  return (0, _data.Success)(data).apLeft((0, _Utils.validate)(_Utils.isRequired, emailLense, EMAIL_REQUIRED_MSG, data)).apLeft((0, _Utils.validate)(_Utils.emailFormat, emailLense, INVALID_EMAIL_FORMAT, data));
};

var validatePasswords = function validatePasswords(data) {
  return (0, _data.Success)(data).apLeft((0, _Utils.validate)(_Utils.isRequired, passwordLense, PASSWORD_REQUIRED_MSG, data)).apLeft((0, _Utils.validate)(_Utils.isRequired, passwordConfirmLense, PASSWORD_REQUIRED_MSG, data)).apLeft((0, _Utils.validate)(inputsMatch(data.password), passwordConfirmLense, PASSWORDS_MUST_MATCH, data)).apLeft((0, _Utils.validate)(inputsMatch(data.confirmPassword), passwordLense, PASSWORDS_MUST_MATCH, data));
};

var validatePassword = function validatePassword(data) {
  return (0, _data.Success)(data).apLeft((0, _Utils.validate)(_Utils.isRequired, passwordLense, PASSWORD_REQUIRED_MSG, data));
};

var validateUserRegistrationTask = function validateUserRegistrationTask(data) {
  return ValidateRegistration.ap(validateName(data)).ap(validateEmails(data)).ap(validatePasswords(data)).failureMap(_ramda.mergeAll).toTask();
};

exports.validateUserRegistrationTask = validateUserRegistrationTask;

var validateLoginTask = function validateLoginTask(data) {
  return ValidateLogin.ap(validateEmail(data)).ap(validatePassword(data)).failureMap(_ramda.mergeAll).toTask();
};

exports.validateLoginTask = validateLoginTask;
});

;require.register("Forms/authentication/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Login = require("./Login.js");

Object.keys(_Login).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Login[key];
    }
  });
});

var _Register = require("./Register.js");

Object.keys(_Register).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Register[key];
    }
  });
});

var _Validations = require("./Validations.js");

Object.keys(_Validations).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Validations[key];
    }
  });
});
});

;require.register("Forms/authentication/registerUser.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RegisterUser = function RegisterUser() {
  return {
    view: function view(_ref) {
      var _ref$attrs = _ref.attrs,
          data = _ref$attrs.data,
          errors = _ref$attrs.errors,
          isSubmitted = _ref$attrs.isSubmitted;
      return (0, _mithril.default)('.column col-6', [(0, _mithril.default)('.form-group ', isSubmitted && {
        class: errors.name ? 'has-error' : 'has-success'
      }, [(0, _mithril.default)('label.form-label text-left', {
        for: 'reg-name'
      }, ['Name', (0, _mithril.default)('span.span required', '*')]), (0, _mithril.default)('input.form-input', {
        id: 'reg-name',
        type: 'text',
        placeholder: 'Name',
        onkeyup: function onkeyup(e) {
          return data.name = e.target.value;
        },
        value: data.name
      }), errors.name && (0, _mithril.default)('p.form-input-hint', errors.name)]), (0, _mithril.default)('.form-group', isSubmitted && {
        class: errors.email ? 'has-error' : 'has-success'
      }, [(0, _mithril.default)('label.form-label text-left', {
        for: 'reg-email'
      }, ['Email', (0, _mithril.default)('span.span required', '*')]), (0, _mithril.default)('input.form-input', {
        id: 'reg-email',
        type: 'email',
        placeholder: 'Email',
        onkeyup: function onkeyup(e) {
          return data.email = e.target.value;
        },
        value: data.email
      }), errors.email && (0, _mithril.default)('p.form-input-hint', errors.email)]), (0, _mithril.default)('.form-group', isSubmitted && {
        class: errors.confirmEmail ? 'has-error' : 'has-success'
      }, [(0, _mithril.default)('label.form-label text-left', {
        for: 'confirmEmail'
      }, ['Confirm Email', (0, _mithril.default)('span.span required', '*')]), (0, _mithril.default)('input.form-input', {
        id: 'confirmEmail',
        type: 'email',
        placeholder: 'Email',
        onkeyup: function onkeyup(e) {
          return data.confirmEmail = e.target.value;
        },
        value: data.confirmEmail
      }), errors.confirmEmail && (0, _mithril.default)('p.form-input-hint', errors.confirmEmail)]), (0, _mithril.default)('.form-group', isSubmitted && {
        class: errors.password ? 'has-error' : 'has-success'
      }, [(0, _mithril.default)('label.form-label text-left', {
        for: 'reg-pass'
      }, ['Password', (0, _mithril.default)('span.span required', '*')]), (0, _mithril.default)('input.form-input', {
        id: 'reg-pass',
        type: 'password',
        placeholder: 'must contain and not contain',
        onkeyup: function onkeyup(e) {
          return data.password = e.target.value;
        },
        value: data.password
      }), errors.password && (0, _mithril.default)('p.form-input-hint', errors.password)]), (0, _mithril.default)('.form-group', isSubmitted && {
        class: errors.confirmPassword ? 'has-error' : 'has-success'
      }, [(0, _mithril.default)('label.form-label text-left', {
        for: 'pass-confirm'
      }, ['Confirm Password', (0, _mithril.default)('span.span required', '*')]), (0, _mithril.default)('input.form-input', {
        id: 'pass-confirm',
        type: 'password',
        placeholder: 'must contain and not contain',
        onkeyup: function onkeyup(e) {
          return data.confirmPassword = e.target.value;
        },
        value: data.confirmPassword
      }), errors.confirmPassword && (0, _mithril.default)('p.form-input-hint', errors.confirmPassword)])]);
    }
  };
};

var _default = RegisterUser;
exports.default = _default;
});

;require.register("Forms/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require("./authentication/index.js");

Object.keys(_index).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _index[key];
    }
  });
});
});

;require.register("Layouts/MainLayout.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Header = _interopRequireDefault(require("Components/Headers/Header"));

var _Footer = _interopRequireDefault(require("Components/Footer"));

var _Body = _interopRequireDefault(require("Components/Body"));

var _LeftAside = _interopRequireDefault(require("Components/LeftAside"));

var _RightAside = _interopRequireDefault(require("Components/RightAside"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MainLayout = function MainLayout(_ref) {
  var mdl = _ref.attrs.mdl;

  var showMenu = function showMenu() {
    return mdl.state.showNav() || mdl.state.profile == "desktop";
  };

  return {
    view: function view(_ref2) {
      var children = _ref2.children;
      return m(".mainLayout", {
        id: "mainLayout"
      }, [m(_Header.default, {
        mdl: mdl
      }), showMenu() && m(_LeftAside.default, {
        mdl: mdl
      }), m(_Body.default, {
        mdl: mdl
      }, [children]), m(_RightAside.default, {
        mdl: mdl
      }), m(_Footer.default, {
        mdl: mdl
      })]);
    }
  };
};

var _default = MainLayout;
exports.default = _default;
});

;require.register("Layouts/ProfileLayout.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Headers = _interopRequireDefault(require("Components/Headers"));

var _Footer = _interopRequireDefault(require("Components/Footer"));

var _LeftAside = _interopRequireDefault(require("Components/LeftAside"));

var _Body = _interopRequireDefault(require("Components/Body"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ProfileLayout = function ProfileLayout(_ref) {
  var mdl = _ref.attrs.mdl;
  return {
    view: function view(_ref2) {
      var children = _ref2.children;
      return m(".profileLayout", {
        id: "profileLayout"
      }, [m(_Headers.default, {
        mdl: mdl
      }), m(_LeftAside.default, {
        mdl: mdl
      }), m(_Body.default, {
        mdl: mdl
      }, [children]), m(_Footer.default, {
        mdl: mdl
      })]);
    }
  };
};

var _default = ProfileLayout;
exports.default = _default;
});

;require.register("Layouts/SplashLayout.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Headers = _interopRequireDefault(require("Components/Headers"));

var _Footer = _interopRequireDefault(require("Components/Footer"));

var _Body = _interopRequireDefault(require("Components/Body"));

var _ProgressBar = _interopRequireDefault(require("Components/ProgressBar"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SplashLayout = function SplashLayout(_ref) {
  var mdl = _ref.attrs.mdl;
  return {
    view: function view(_ref2) {
      var children = _ref2.children;
      return m(".splashlayout", {
        id: "splashlayout"
      }, [mdl.state.isLoading() && m(_ProgressBar.default, {
        mdl: mdl
      }), m(_Headers.default, {
        mdl: mdl
      }), m(_Body.default, {
        mdl: mdl
      }, [children]), m(_Headers.default, {
        mdl: mdl
      }), m(_Footer.default, {
        mdl: mdl
      })]);
    }
  };
};

var _default = SplashLayout;
exports.default = _default;
});

;require.register("Layouts/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _MainLayout = require("./MainLayout.js");

Object.keys(_MainLayout).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _MainLayout[key];
    }
  });
});

var _SplashLayout = require("./SplashLayout.js");

Object.keys(_SplashLayout).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SplashLayout[key];
    }
  });
});

var _ProfileLayout = require("./ProfileLayout.js");

Object.keys(_ProfileLayout).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _ProfileLayout[key];
    }
  });
});
});

;require.register("Layouts/styles.scss", function(exports, require, module) {
module.exports = {"hamburger":"_hamburger_1ncq7_3","bold":"_bold_1ncq7_26","page":"_page_1ncq7_32","subTitle":"_subTitle_1ncq7_35","empty":"_empty_1ncq7_43","unauth-lock":"_unauth-lock_1ncq7_46","btn":"_btn_1ncq7_49","modal-footer":"_modal-footer_1ncq7_53","header":"_header_1ncq7_1","tabbar":"_tabbar_1ncq7_1","tab":"_tab_1ncq7_73","tab-item":"_tab-item_1ncq7_73","navbar":"_navbar_1ncq7_1","nav-links":"_nav-links_1ncq7_82","mobileNav":"_mobileNav_1ncq7_85","content":"_content_1ncq7_1","left-aside":"_left-aside_1ncq7_1","menu":"_menu_1ncq7_1","right-aside":"_right-aside_1ncq7_1","footer":"_footer_1ncq7_1","socialmedias":"_socialmedias_1ncq7_124","socialmedia":"_socialmedia_1ncq7_124","avatar":"_avatar_1ncq7_137","loader":"_loader_1ncq7_140","AuthLink":"_AuthLink_1ncq7_144","authBtn":"_authBtn_1ncq7_148","progressBar":"_progressBar_1ncq7_153","homelayout":"_homelayout_1ncq7_1"};
});

require.register("Model.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.model = void 0;

var _http = _interopRequireDefault(require("Utils/http"));

var _index = _interopRequireDefault(require("./Routes/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import m from 'mithril'
var model = {
  Routes: _index.default,
  http: _http.default,
  data: Stream({}),
  state: {
    loadingProgress: {
      max: 0,
      value: 0
    },
    isAuth: Stream(false),
    paginate: {
      from: 1,
      size: 10,
      total: 0
    },
    isLoading: Stream(false),
    url: "",
    route: "",
    scrollPos: Stream(window.scrollY),
    limit: 10,
    profile: "",
    showAuthModal: Stream(false),
    showSettings: Stream(false),
    showNav: Stream(false),
    toast: {
      show: Stream(false),
      class: Stream("primary"),
      contents: Stream("content")
    },
    query: Stream("")
  },
  toggleToast: function toggleToast(mdl) {
    return mdl.state.toast.show(!mdl.state.toast.show());
  },
  toggleAuthModal: function toggleAuthModal(mdl) {
    return mdl.state.showAuthModal(!mdl.state.showAuthModal());
  },
  toggleSettings: function toggleSettings(mdl) {
    return mdl.state.showSettings(!mdl.state.showSettings());
  },
  toggleNav: function toggleNav(mdl) {
    return mdl.state.showNav(!mdl.state.showNav());
  },
  filterData: function filterData(mdl) {
    return function (query) {
      return mdl.state.query(query);
    };
  }
};
exports.model = model;
});

;require.register("Pages/About/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var About = function About(_ref) {
  var mdl = _ref.attrs.mdl;
  // console.log('mdl', mdl)
  return {
    view: function view() {
      return (0, _mithril.default)('.about', mdl.state.route.title);
    }
  };
};

var _default = About;
exports.default = _default;
});

;require.register("Pages/Admin/ManageUsers.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ManageUsers = function ManageUsers() {
  var state = {};

  var loadUsers = function loadUsers(_ref) {
    var mdl = _ref.attrs.mdl;

    var onError = function onError(e) {
      console.log('ERROR', e);
    };

    var onSuccess = function onSuccess(s) {
      console.log('SUCCESSS', s);
      state.users = s;
    };

    return mdl.http.getTask(mdl)('https://api.backendless.com/A0DC91A6-8088-D365-FF60-0DE1BB0C8600/7C923A78-BBF7-7D49-FF41-80A623EBE100/data/Users').fork(onError, onSuccess);
  };

  return {
    oninit: loadUsers,
    view: function view(_ref2) {
      var mdl = _ref2.attrs.mdl;
      return (0, _mithril.default)('.manageusers', {
        id: mdl.state.route.id
      }, [(0, _mithril.default)('h1.title', mdl.state.route.title), state.users && state.users.map(function (u) {
        return (0, _mithril.default)('.menu', (0, _mithril.default)('.menu-item', [(0, _mithril.default)('p', u.name), (0, _mithril.default)('p', u.email), (0, _mithril.default)('.form-group', (0, _mithril.default)('label.form-checkbox', [(0, _mithril.default)('input', {
          type: 'checkbox',
          value: u.isAdmin
        }), (0, _mithril.default)('i.form-icon'), 'User is Admin']))]));
      })]);
    }
  };
};

var _default = ManageUsers;
exports.default = _default;
});

;require.register("Pages/Contact/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Contact = function Contact(_ref) {
  var mdl = _ref.attrs.mdl;
  return {
    view: function view() {
      return (0, _mithril.default)('.contact', mdl.state.route.title);
    }
  };
};

var _default = Contact;
exports.default = _default;
});

;require.register("Pages/Default/UnautherizedViews.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Icons = _interopRequireDefault(require("Components/Icons"));

var _Auth = _interopRequireDefault(require("Components/Auth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UnautherizedView = function UnautherizedView() {
  return {
    view: function view(_ref) {
      var mdl = _ref.attrs.mdl;
      return m(".empty", [m("svg.unauth-lock", _Icons.default.lock), m("p.empty-title.h5", "Registered Users Only"), m("p.empty-subtitle", [m("button.btn", {
        onclick: function onclick() {
          return mdl.toggleAuthModal(mdl);
        }
      }, "Register or Log in to view this content"), m(_Auth.default, {
        mdl: mdl
      })])]);
    }
  };
};

var _default = UnautherizedView;
exports.default = _default;
});

;require.register("Pages/Default/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Default = function Default(_ref) {
  var mdl = _ref.attrs.mdl;
  // console.log('mdl', mdl)
  return {
    view: function view() {
      return (0, _mithril.default)('.default', (0, _mithril.default)('h1', mdl.state.route.title));
    }
  };
};

var _default = Default;
exports.default = _default;
});

;require.register("Pages/Discounts/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Discounts = function Discounts(_ref) {
  var mdl = _ref.attrs.mdl;
  return {
    view: function view() {
      return (0, _mithril.default)('.discounts', mdl.state.route.title);
    }
  };
};

var _default = Discounts;
exports.default = _default;
});

;require.register("Pages/Home/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var Home = function Home(_ref) {
  var mdl = _ref.attrs.mdl;
  return {
    view: function view() {
      return m(".home", [m("section.home-section hero hero-lg bg-primary parall", m(".hero-body", m("h1", "section 1"))), m("section.home-section hero hero-lg bg-secondary", m(".hero-body", m("h1", "section 2")))]);
    }
  };
};

var _default = Home;
exports.default = _default;
});

;require.register("Pages/Services/AirConditioning.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _UnautherizedViews = _interopRequireDefault(require("../Default/UnautherizedViews.js"));

var _Utils = require("Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AirConditioning = function AirConditioning(_ref) {
  var mdl = _ref.attrs.mdl;
  return {
    oncreate: function oncreate() {
      return (0, _Utils.scrollToAnchor)(mdl.state.anchor);
    },
    view: function view() {
      return m(".page.air-conditioning", {
        id: mdl.state.route.id
      }, [m("h1.title", mdl.state.route.title), m("section.anchor", {
        id: "service-maintenance"
      }, [m("h2.subTitle.bg-secondary", "service maintenance"), m("p.p", "Is the air conditioning system of your vehicle blowing hot air or not blowing at all?...  The air conditioning system can have three different types of issues; mechanical, electrical or refrigerant all of which can have the similar effect--an uncomfortable vehicle interior. The benefit of having a certified technician investigate your vehicle's air conditioning system is to discover where the source of your problem lies."), m("p.p", "PAC (Professional Auto Care) understands how grueling the Houston heat can be and how important, for both comfort and health, your vehicle's air conditioning system is for you and your family. We have the latest&nbsp;EPA compliance equipment&nbsp;to inspect your vehicle's Heating Ventilation and Air Conditioning System.&nbsp;"), m("p.p", "The air conditioning is part of the HVAC system. The primary function of the HVAC system (heating, ventilation and air conditioning system) is to provide you comfort while operating your motor vehicle. The HVAC system can be divided into two passenger compartment functions. The first function is the heating and the second function is the cooling system. The air conditioning system's function is to remove heat and moisture from the air which therefore reduces the relative humidity in the passenger compartment. Regardless of which system is in use, the passenger compartment temperature can be adjusted with the air temperature controls. A vehicle's air conditioning system is equipped with filters to remove and prevent dust and pollen particles from entering the passenger compartment"), m("p.p", "Professional Auto Care is the premier full-service auto repair shop in SW Houston. Our auto repair shop has been family owned and operated for over 30 years. Professional Auto Care provides honest and reliable automotive repair and maintenance services. When a team member of our auto shop examines your auto A/C you can rest assured knowing a certified professional will be following a step by step procedure to not only determine what exactly the vehicle air conditioning needs, but also why it needs it. All our automotive air conditioning testing procedures come with a full report of the A/C testing findings.")]), m("section.anchor", {
        id: "help-over-heating"
      }, [m("h2.subTitle.bg-secondary", "help over heating"), m("p.p", "If your engine begins overheating while driving in heavy traffic, the following steps can help alleviate the condition:"), m("ul", [m("li", 'Set the climate control system to "Heat"'), m("li", 'Set the blower fan on "High"'), m("li", 'Set the blower fan on "High"'), m("li", "Roll down your windows"), m("li", 'Allow more distance between your vehicle and the one in front of you. (This enables your engine to "breathe" more easily.)')]), m("p.p", "The above steps will help reduce heat on the system. If the overheating condition persists, pull over to the shoulder of the road and allow the engine to cool. DO NOT ATTEMPT TO OPEN THE HOOD. Wait until the vehicle is cool enough to open the hood if your vehicle is over heating and then open the hood to allow cooling. As a precautionary measure, have your vehicle checked by a professional technician as soon as possible.")]), m("section.anchor", {
        id: "ac-video"
      }, [m("h2.subTitle.bg-secondary", "AC video"), m("iframe", {
        id: "ac-video",
        class: "plyr__video-embed video-responsive",
        width: "600",
        height: "400",
        frameborder: 0,
        src: "https://www.youtube.com/embed/lfAQtaBFi0Y?origin=https://plyr.io&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1",
        allowfullscreen: true,
        allowtransparency: false,
        allow: "autoplay"
      })]), m("section.anchor", {
        id: "ac-parts"
      }, [m("h2.subTitle.bg-secondary", "AC parts"), m("p.p", "The air conditioning is a complex system and understanding the reason something failed is just as important as fixing the car itself. What Parts Make Up the Air Conditioning System? Below are some common heating and air conditioning components, click on the component to get a detailed description and picture."), mdl.state.isAuth() ? m("ul", [m("li", 'Set the climate control system to "Heat"'), m("li", 'Set the blower fan on "High"'), m("li", 'Set the blower fan on "High"'), m("li", "Roll down your windows"), m("li", 'Allow more distance between your vehicle and the one in front of you. (This enables your engine to "breathe" more easily.)')]) : m(_UnautherizedViews.default, {
        mdl: mdl
      })]), m("section.anchor", {
        id: "ac-testing-fees"
      }, [m("h2.subTitle.bg-secondary", "AC Testing fees"), m("p.p", "Testing fees range between $54.99 for mechanic testing up to $168.90 (including refrigerant, technician testing, oil and dye).Please call for details.")])]);
    }
  };
};

var _default = AirConditioning;
exports.default = _default;
});

;require.register("Pages/Services/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Home = function Home(_ref) {
  var mdl = _ref.attrs.mdl;
  console.log('mdl', mdl);
  return {
    view: function view() {
      return (0, _mithril.default)('.home', mdl.state.route.title);
    }
  };
};

var _default = Home;
exports.default = _default;
});

;require.register("Routes/authenticated.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../Layouts/index.js");

var _Default = _interopRequireDefault(require("../Pages/Default"));

var _ManageUsers = _interopRequireDefault(require("../Pages/Admin/ManageUsers.js"));

var _Utils = require("Utils");

var _Icons = _interopRequireDefault(require("Components/Icons"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var authenticated = [{
  id: "profile-page",
  title: "Profile Page",
  icon: _Icons.default.home,
  route: "/profile/:name",
  position: [],
  group: ["authenticated", "all", "client"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    console.log("profile page login on match", mdl, args, path, fullroute, isAnchor, !mdl.state.isAuth());
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_index.ProfileLayout, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "manage-users",
  title: "Manage Users",
  icon: _Icons.default.users,
  route: "/admin/user-management",
  position: [],
  group: ["authenticated", "admin"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    console.log("manage users on match", mdl, args, path, fullroute, isAnchor, mdl.state.isAuth(), mdl.user.isAdmin);
    !mdl.user.isAdmin && m.route.set(m.route.get());
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_index.ProfileLayout, {
      mdl: mdl
    }, m(_ManageUsers.default, {
      mdl: mdl
    }));
  }
}];
var _default = authenticated;
exports.default = _default;
});

;require.register("Routes/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _main = _interopRequireDefault(require("./main.js"));

var _services = _interopRequireDefault(require("./services.js"));

var _authenticated = _interopRequireDefault(require("./authenticated"));

var _vendors = _interopRequireDefault(require("./vendors.js"));

var _splash = _interopRequireDefault(require("./splash.js"));

var _ramda = require("ramda");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Routes = (0, _ramda.flatten)([_main.default, _services.default, _vendors.default, _splash.default, _authenticated.default]);
var _default = Routes;
exports.default = _default;
});

;require.register("Routes/main.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _MainLayout = _interopRequireDefault(require("Layouts/MainLayout"));

var _SplashLayout = _interopRequireDefault(require("Layouts/SplashLayout"));

var _Default = _interopRequireDefault(require("../Pages/Default"));

var _Home = _interopRequireDefault(require("../Pages/Home"));

var _Utils = require("Utils");

var _Icons = _interopRequireDefault(require("Components/Icons"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Main = [{
  id: "home",
  title: "Home",
  icon: _Icons.default.home,
  route: "/home",
  position: ["nav"],
  group: [],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_SplashLayout.default, {
      mdl: mdl
    }, m(_Home.default, {
      mdl: mdl
    }));
  }
}, {
  id: "services",
  title: "Services",
  icon: _Icons.default.services,
  route: "/services",
  position: ["nav", "sidebar"],
  group: [],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "discounts",
  title: "Discounts",
  icon: "discounts",
  route: "/discounts",
  position: ["nav", "footer"],
  group: [],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
    if (!mdl.state.isAuth()) return m.route.SKIP;
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "vendors",
  title: "Vendors",
  icon: "vendors",
  route: "/vendors",
  position: ["nav", "footer"],
  group: [],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "about",
  title: "About",
  icon: "about",
  route: "/about",
  position: ["nav"],
  group: [],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "contact",
  title: "Contact",
  icon: _Icons.default.contact,
  route: "/contact",
  position: ["nav", "footer"],
  group: [],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "blog",
  title: "Blog",
  icon: "blog",
  route: "/blog",
  position: ["nav", "footer"],
  group: [],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}];
var _default = Main;
exports.default = _default;
});

;require.register("Routes/services.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _MainLayout = _interopRequireDefault(require("Layouts/MainLayout"));

var _Default = _interopRequireDefault(require("../Pages/Default"));

var _AirConditioning = _interopRequireDefault(require("../Pages/Services/AirConditioning.js"));

var _ramda = require("ramda");

var _Utils = require("Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AirConditioningRoutes = [{
  id: "service-maintenance",
  title: "Air Conditioning - Service & Maintenance",
  icon: "airconditioning",
  route: "/services/air-conditioning/#service-maintenance",
  position: ["sidebar"],
  group: ["air-conditioning"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    console.log("onmatch service main", isAnchor);
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "help-over-heating",
  title: "Air Conditioning - Help! OverHeating",
  icon: "airconditioning",
  route: "/services/air-conditioning/#help-over-heating",
  position: ["sidebar"],
  group: ["air-conditioning"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_AirConditioning.default, {
      mdl: mdl
    }));
  }
}, {
  id: "ac-video",
  title: "Air Conditioning - Video",
  icon: "airconditioning",
  route: "/services/air-conditioning/#ac-video",
  position: ["sidebar"],
  group: ["air-conditioning"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_AirConditioning.default, {
      mdl: mdl
    }));
  }
}, {
  id: "ac-parts",
  title: "Air Conditioning - Parts",
  icon: "airconditioning",
  route: "/services/air-conditioning/#ac-parts",
  position: ["sidebar"],
  group: ["air-conditioning"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_AirConditioning.default, {
      mdl: mdl
    }));
  }
}, {
  id: "ac-testing-fees",
  title: "Air Conditioning - Testing Fees",
  icon: "airconditioning",
  route: "/services/air-conditioning/#ac-testing-fees",
  position: ["sidebar"],
  group: ["air-conditioning"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_AirConditioning.default, {
      mdl: mdl
    }));
  }
}];
var SubMenu = [{
  id: "alignment",
  title: "Alignment",
  icon: "alignment",
  route: "/services/alignment",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "air-conditioning",
  title: "Air Conditioning",
  icon: "airconditioning",
  route: "/services/air-conditioning",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_AirConditioning.default, {
      mdl: mdl
    }));
  }
}, {
  id: "battery",
  title: "Battery",
  icon: "battery",
  route: "/services/battery",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "belts",
  title: "Belts",
  icon: "belts",
  route: "/services/belts",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "brakes",
  title: "Brakes",
  icon: "brakes",
  route: "/services/brakes",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "check-engine-light",
  title: "Check Engine Light",
  icon: "checkenginelight",
  route: "/services/check-engine-light",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "clutch",
  title: "Clutch",
  icon: "clutch",
  route: "/services/clutch",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "cooling-system",
  title: "Cooling System",
  icon: "coolingsystem",
  route: "/services/cooling-system",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "drive-train",
  title: "Drivetrain",
  icon: "drivetrain",
  route: "/services/drive-train",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "engine-remanufactured",
  title: "Engine Remanufactured",
  icon: "engineremanufactured",
  route: "/services/engine-remanufactured",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "exhuast-emissions",
  title: "Exhaust & Emissions",
  icon: "exhuastemissions",
  route: "/services/exhuast-emissions",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "exterior-repair",
  title: "Exterior Repair",
  icon: "exteriorrepair",
  route: "/services/exterior-repair",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "filters",
  title: "Filters",
  icon: "filters",
  route: "/services/filters",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "flood-repair",
  title: "Flood Repair",
  icon: "floodrepair",
  route: "/services/flood-repair",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "fuel-system",
  title: "Fuel System",
  icon: "fuelsystem",
  route: "/services/fuel-system",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "hoses",
  title: "Hoses",
  icon: "hoses",
  route: "/services/hoses",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "ignition",
  title: "Ignition",
  icon: "ignition",
  route: "/services/ignition",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "inspections",
  title: "Inspections",
  icon: "inspections",
  route: "/services/inspections",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "interior-repairs",
  title: "Interior Repairs",
  icon: "interiorrepairs",
  route: "/services/interior-repairs",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "maintenance",
  title: "Maintenance",
  icon: "maintenance",
  route: "/services/maintenance",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "oil-change",
  title: "Oil Change",
  icon: "oilchange",
  route: "/services/oil-change",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "timing-belt",
  title: "Timing Belt",
  icon: "timingbelt",
  route: "/services/timing-belt",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "tire-management",
  title: "Tire Management",
  icon: "tiremanagement",
  route: "/services/tire-management",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "starting-charging",
  title: "Starting Charging",
  icon: "startingcharging",
  route: "/services/starting-charging",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "steering",
  title: "Steering",
  icon: "steering",
  route: "/services/steering",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "suspension",
  title: "Suspension",
  icon: "suspension",
  route: "/services/suspension",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "transmission-remanufactured",
  title: "Transmission Remanufactured",
  icon: "transmissionremanufactured",
  route: "/services/transmission-remanufactured",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "window-repairs",
  title: "Window Repairs",
  icon: "windowrepairs",
  route: "/services/window-repairs",
  position: ["sidebar"],
  group: ["services"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}];
var Services = (0, _ramda.flatten)([SubMenu, AirConditioningRoutes]);
var _default = Services;
exports.default = _default;
});

;require.register("Routes/splash.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../Layouts/index.js");

var _Default = _interopRequireDefault(require("../Pages/Default"));

var _ramda = require("ramda");

var _Utils = require("Utils");

var _Icons = _interopRequireDefault(require("Components/Icons"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SubMenu = [{
  id: "home-route-call",
  title: "713.270.0474",
  icon: _Icons.default.phone,
  route: "/contact",
  position: [],
  group: ["home"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_index.MainLayout, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "home-route-brand",
  title: "BRAND",
  icon: "Assets/professional-auto-care-logo-brand.png",
  route: "/contact",
  position: [],
  group: ["home"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_index.MainLayout, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "home-route-address",
  title: "Professional Auto Care 9916 Honeywell St Houston TX 77074",
  icon: "address",
  route: "/contact",
  position: [],
  group: ["home"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_index.MainLayout, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}];
var Splash = (0, _ramda.flatten)([SubMenu]);
var _default = Splash;
exports.default = _default;
});

;require.register("Routes/vendors.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _MainLayout = _interopRequireDefault(require("Layouts/MainLayout"));

var _Default = _interopRequireDefault(require("../Pages/Default"));

var _ramda = require("ramda");

var _Utils = require("Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BGProducts = [{
  id: "bg-products-fuel-Air-induction-service",
  title: "BG Products Fuel/Air Induction Service",
  icon: "bgproducts",
  route: "/vendors/bg-products/#bg-products-fuel-Air-induction-service",
  position: ["sidebar"],
  group: ["bg-products"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "bg-products-lubrication-fuel-service",
  title: "BG Products Lubrication + Fuel Service",
  icon: "bgproducts",
  route: "/vendors/bg-products/#bg-products-lubrication-fuel-service",
  position: ["sidebar"],
  group: ["bg-products"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "bg-products-cooling-system-service",
  title: "BG Products Cooling System Service",
  icon: "bgproducts",
  route: "/vendors/bg-products/#bg-products-cooling-system-service",
  position: ["sidebar"],
  group: ["bg-products"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "bg-products-transmission-service",
  title: "BG Products Transmission Service",
  icon: "bgproducts",
  route: "/vendors/bg-products/#bg-products-transmission-service",
  position: ["sidebar"],
  group: ["bg-products"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "bg-products-drive-line",
  title: "BG Products Drive Line",
  icon: "bgproducts",
  route: "/vendors/bg-products/#bg-products-drive-line",
  position: ["sidebar"],
  group: ["bg-products"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "bg-products-break-service",
  title: "BG Products Break Service",
  icon: "bgproducts",
  route: "/vendors/bg-products/#bg-products-break-service",
  position: ["sidebar"],
  group: ["bg-products"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "bg-products-climate-control-service",
  title: "BG Products Climate Control Service",
  icon: "bgproducts",
  route: "/vendors/bg-products/#bg-products-climate-control-service",
  position: ["sidebar"],
  group: ["bg-products"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "bg-products-battery-service",
  title: "BG Products Battery Service",
  icon: "bgproducts",
  route: "/vendors/bg-products/#bg-products-battery-service",
  position: ["sidebar"],
  group: ["bg-products"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "bg-products-power-steering-service",
  title: "BG Products Power Steering Service",
  icon: "bgproducts",
  route: "/vendors/bg-products/#bg-products-power-steering-service",
  position: ["sidebar"],
  group: ["bg-products"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "bg-products-ethanol-fuel-system-defender",
  title: "BG Products Ethanol Fuel System Defender",
  icon: "bgproducts",
  route: "/vendors/bg-products/#bg-products-ethanol-fuel-system-defender",
  position: ["sidebar"],
  group: ["bg-products"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}];
var SubMenu = [{
  id: "bg-products",
  title: "BG Products",
  icon: "bgproducts",
  route: "/vendors/bg-products",
  position: ["sidebar"],
  group: ["vendors"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_MainLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}];
var Vendors = (0, _ramda.flatten)([SubMenu, BGProducts]);
var _default = Vendors;
exports.default = _default;
});

;require.register("Styles/animations.scss", function(exports, require, module) {
module.exports = {"reverseAnimation":"_reverseAnimation_1hw2t_19","slideDown":"_slideDown_1hw2t_23","slideUp":"_slideUp_1hw2t_65","slideLeft":"_slideLeft_1hw2t_107","slideRight":"_slideRight_1hw2t_149","slideExpandUp":"_slideExpandUp_1hw2t_191","expandUp":"_expandUp_1hw2t_245","fadeIn":"_fadeIn_1hw2t_279","expandOpen":"_expandOpen_1hw2t_319","bigEntrance":"_bigEntrance_1hw2t_357","hatch":"_hatch_1hw2t_417","bounce":"_bounce_1hw2t_466","pulse":"_pulse_1hw2t_510","floating":"_floating_1hw2t_545","tossing":"_tossing_1hw2t_574","pullUp":"_pullUp_1hw2t_603","pullDown":"_pullDown_1hw2t_651","stretchLeft":"_stretchLeft_1hw2t_699","stretchRight":"_stretchRight_1hw2t_747","hamburger--elastic":"_hamburger--elastic_1hw2t_794","hamburger-inner":"_hamburger-inner_1hw2t_794","is-active":"_is-active_1hw2t_807","hamburger--elastic-r":"_hamburger--elastic-r_1hw2t_822"};
});

require.register("Styles/index.scss", function(exports, require, module) {
module.exports = {"bg-light-grey":"_bg-light-grey_1abfi_3","bg-dark-grey":"_bg-dark-grey_1abfi_6","hamburger":"_hamburger_1abfi_9","bold":"_bold_1abfi_32","page":"_page_1abfi_38","subTitle":"_subTitle_1abfi_42","empty":"_empty_1abfi_51","unauth-lock":"_unauth-lock_1abfi_54","btn":"_btn_1abfi_57","required":"_required_1abfi_61","home-section":"_home-section_1abfi_65","register-form-toast":"_register-form-toast_1abfi_1","vin-toast":"_vin-toast_1abfi_1","modal-close":"_modal-close_1abfi_1","form-input-hint":"_form-input-hint_1abfi_77","modal-footer":"_modal-footer_1abfi_80","header":"_header_1abfi_1","tabbar":"_tabbar_1abfi_1","tab":"_tab_1abfi_100","tab-item":"_tab-item_1abfi_100","navbar":"_navbar_1abfi_1","nav-links":"_nav-links_1abfi_109","mobileNav":"_mobileNav_1abfi_112","content":"_content_1abfi_1","left-aside":"_left-aside_1abfi_1","menu":"_menu_1abfi_1","right-aside":"_right-aside_1abfi_1","footer":"_footer_1abfi_1","socialmedias":"_socialmedias_1abfi_152","socialmedia":"_socialmedia_1abfi_152","avatar":"_avatar_1abfi_165","loader":"_loader_1abfi_168","AuthLink":"_AuthLink_1abfi_172","authBtn":"_authBtn_1abfi_176","progressBar":"_progressBar_1abfi_181","mainLayout":"_mainLayout_1abfi_1","homeLayout":"_homeLayout_1abfi_1","home-route-address":"_home-route-address_1abfi_1","home-route-call":"_home-route-call_1abfi_1","profileLayout":"_profileLayout_1abfi_1"};
});

require.register("Styles/loader.scss", function(exports, require, module) {
module.exports = {"holder":"_holder_1uw36_1","preloader":"_preloader_1uw36_8","rotatePreloader":"_rotatePreloader_1uw36_1","rotateCircle1":"_rotateCircle1_1uw36_1","rotateCircle2":"_rotateCircle2_1uw36_1","rotateCircle3":"_rotateCircle3_1uw36_1","rotateCircle4":"_rotateCircle4_1uw36_1","rotateCircle5":"_rotateCircle5_1uw36_1","rotateCircle6":"_rotateCircle6_1uw36_1","rotateCircle7":"_rotateCircle7_1uw36_1"};
});

require.register("Utils/animations.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.animateChildrenLimitsExit = exports.slideModalOut = exports.animate = exports.animateChildrenLimitsEntrance = exports.animateChildrenEntrance = exports.animateSidebarEntrance = exports.animateComponentEntrance = exports.IsLoading = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var IsLoading = (0, _mithril.default)('.holder', [(0, _mithril.default)('.preloader', [(0, _mithril.default)('div'), (0, _mithril.default)('div'), (0, _mithril.default)('div'), (0, _mithril.default)('div'), (0, _mithril.default)('div'), (0, _mithril.default)('div'), (0, _mithril.default)('div')])]);
exports.IsLoading = IsLoading;

var animateComponentEntrance = function animateComponentEntrance(idx) {
  return function (_ref) {
    var dom = _ref.dom;
    dom.style.opacity = 0;
    return setTimeout(function () {
      dom.classList.toggle('stretchRight');
      dom.style.opacity = 1;
    }, idx * 100 + 20);
  };
};

exports.animateComponentEntrance = animateComponentEntrance;

var animateSidebarEntrance = function animateSidebarEntrance(_ref2) {
  var dom = _ref2.dom;
  dom.style.opacity = 0;
  dom.classList.toggle('slideRight');
  dom.style.opacity = 1;
};

exports.animateSidebarEntrance = animateSidebarEntrance;

var animateChildrenEntrance = function animateChildrenEntrance(_ref3) {
  var dom = _ref3.dom;

  var children = _toConsumableArray(dom.children);

  return children.map(function (child, idx) {
    child.style.opacity = 0;
    setTimeout(function () {
      child.classList.toggle('slideRight');
      child.style.opacity = 1;
    }, (idx + 1) * 10);
  });
};

exports.animateChildrenEntrance = animateChildrenEntrance;

var animateChildrenLimitsEntrance = function animateChildrenLimitsEntrance(idx) {
  return function (_ref4) {
    var dom = _ref4.dom;
    dom.style.opacity = 0;
    setTimeout(function () {
      dom.classList.toggle('slideDown');
      dom.style.opacity = 1;
    }, (idx + 1) * 200);
  };
};

exports.animateChildrenLimitsEntrance = animateChildrenLimitsEntrance;

var animate = function animate(dir) {
  return function (_ref5) {
    var dom = _ref5.dom;
    dom.style.opacity = 0;
    setTimeout(function () {
      dom.classList.toggle(dir);
      dom.style.opacity = 1;
    }, 200);
  };
};

exports.animate = animate;

var slideModalOut = function slideModalOut(_ref6) {
  var dom = _ref6.dom;
  return new Promise(function () {
    dom.classList.remove('slideRight');
    return setTimeout(function () {
      dom.classList.add('reverseAnimation', 'slideRight');
    }, 200);
  });
};

exports.slideModalOut = slideModalOut;

var animateChildrenLimitsExit = function animateChildrenLimitsExit(_ref7) {
  var dom = _ref7.dom;
  return new Promise(function () {
    _toConsumableArray(dom.children).reverse().map(function (child, idx) {
      return setTimeout(function () {
        child.style.display = 'none';
      }, idx * 100);
    });
  });
};

exports.animateChildrenLimitsExit = animateChildrenLimitsExit;
});

;require.register("Utils/helpers.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonCopy = exports.scrollToAnchor = exports.getRoute = exports.debounce = exports.filterTask = exports._paginate = exports._direction = exports._sort = exports._search = exports.addTerms = exports.infiniteScroll = exports.isEmpty = exports.log = exports.makeRoute = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _ramda = require("ramda");

var _data = _interopRequireDefault(require("data.task"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var makeRoute = (0, _ramda.compose)((0, _ramda.join)('-'), (0, _ramda.split)(' '), (0, _ramda.trim)(), (0, _ramda.toLower)());
exports.makeRoute = makeRoute;

var log = function log(m) {
  return function (v) {
    console.log(m, v);
    return v;
  };
};

exports.log = log;

var isEmpty = function isEmpty(data) {
  return data.length == 0;
};

exports.isEmpty = isEmpty;

var infiniteScroll = function infiniteScroll(mdl) {
  return function (e) {
    var route = mdl.state.route;
    var length = mdl.data[route].data.length;
    var setpoint = 10 * length * mdl.state.scrollPos;

    if (e.target.scrollTop - mdl.state.scrollPos >= setpoint) {
      mdl.state.scrollPos++ + e.target.scrollTop;
    }
  };
};

exports.infiniteScroll = infiniteScroll;

var addTerms = function addTerms(item) {
  var terms = (0, _ramda.compose)((0, _ramda.join)(' '), _ramda.values, (0, _ramda.props)(['uuid', 'id', 'name']))(item);
  return (0, _ramda.assoc)('_terms', terms, item);
};

exports.addTerms = addTerms;

var byTerms = function byTerms(query) {
  return (0, _ramda.compose)((0, _ramda.test)(new RegExp(query, 'i')), (0, _ramda.prop)('name'));
};

var _search = function _search(query) {
  return (0, _ramda.compose)((0, _ramda.filter)(byTerms(query)));
};

exports._search = _search;

var _sort = function _sort(p) {
  return (0, _ramda.sortBy)((0, _ramda.compose)(_ramda.toLower, toString, (0, _ramda.prop)(p)));
};

exports._sort = _sort;

var _direction = function _direction(dir) {
  return dir == 'asc' ? _ramda.identity : _ramda.reverse;
};

exports._direction = _direction;

var _paginate = function _paginate(offset) {
  return function (limit) {
    return function (data) {
      return (0, _ramda.slice)((0, _ramda.max)(0, (0, _ramda.min)(offset, data.length)), (0, _ramda.min)(offset + limit, data.length), data);
    };
  };
};

exports._paginate = _paginate;

var filterTask = function filterTask(query) {
  return function (prop) {
    return function (direction) {
      return function (offset) {
        return function (limit) {
          return (0, _ramda.compose)(_data.default.of, (0, _ramda.map)(_paginate(offset)(limit)), (0, _ramda.map)(_direction(direction)), (0, _ramda.map)(_sort(prop)), _search(query));
        };
      };
    };
  };
};

exports.filterTask = filterTask;

var debounce = function debounce(wait, now) {
  return function (fn) {
    var timeout = undefined;
    return function () {
      var context = this;
      var args = arguments;

      var later = function later() {
        timeout = undefined;
        if (!now) fn.apply(context, args);
      };

      var callNow = now && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      console.log(fn);
      if (callNow) fn.apply(context, args);
    };
  };
};

exports.debounce = debounce;

var getRoute = function getRoute(int) {
  return _mithril.default.route.get().split('/')[int];
};

exports.getRoute = getRoute;

var scrollToAnchor = function scrollToAnchor(anchor) {
  var is = function is(el) {
    return el !== undefined && el !== null;
  }; //if you pass an undefined anchor it will scroll to the top of the body


  var targetEl = is(anchor) ? document.getElementById(anchor) : document.body;
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  var target = is(targetEl) ? targetEl.getBoundingClientRect().top : 0;
  window.scroll({
    top: target + scrollTop - 10,
    left: 0,
    behavior: 'smooth'
  });
};

exports.scrollToAnchor = scrollToAnchor;

var jsonCopy = function jsonCopy(src) {
  return JSON.parse(JSON.stringify(src));
};

exports.jsonCopy = jsonCopy;
});

;require.register("Utils/http.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.parseHttpSuccess = exports.parseHttpError = void 0;

var _data = _interopRequireDefault(require("data.task"));

var _secrets = require("./secrets.js");

var _Model = require("../Model.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function onProgress(e) {
  if (e.lengthComputable) {
    _Model.model.state.loadingProgress.max = e.total;
    _Model.model.state.loadingProgress.value = e.loaded;
    m.redraw();
  }
}

function onLoad() {
  return false;
}

function onLoadStart() {
  _Model.model.state.isLoading(true);

  return false;
}

function onLoadEnd() {
  _Model.model.state.isLoading(false);

  _Model.model.state.loadingProgress.max = 0;
  _Model.model.state.loadingProgress.value = 0;
  return false;
}

var xhrProgress = {
  config: function config(xhr) {
    xhr.onprogress = onProgress;
    xhr.onload = onLoad;
    xhr.onloadstart = onLoadStart;
    xhr.onloadend = onLoadEnd;
  }
}; // const makeQuery = (string) => JSON.parse(JSON.stringify(string))
// const parseQLResponse = (model) => ({ data, errors }) => {
//   model.state.isLoading(false)
//   return errors ? Promise.reject(errors) : Promise.resolve(data)
// }

var parseHttpError = function parseHttpError(model) {
  return function (rej) {
    return function (Error) {
      model.state.isLoading(false);
      return rej(Error.response);
    };
  };
};

exports.parseHttpError = parseHttpError;

var parseHttpSuccess = function parseHttpSuccess(model) {
  return function (res) {
    return function (data) {
      model.state.isLoading(false);
      return res(data);
    };
  };
}; // const getUserToken = () =>
//   window.sessionStorage.getItem('user-token')
//     ? window.sessionStorage.getItem('user-token')
//     : ''
// const postQl = (model) => (query) => {
//   model.state.isLoading(true)
//   return new Task((rej, res) =>
//     m
//       .request({
//         method: 'POST',
//         // url: graphQl,
//         withCredentials: false,
//         ...xhrProgress,
//         data: makeQuery(query),
//         headers: {
//           Authorization: `Bearer ${model.state.token}`,
//           'cache-control': 'no-cache',
//           'x-apikey': '64fecd3f0cbb54d46d7f7260b86b8ad45d31b',
//           'content-type': 'application/json',
//         },
//       })
//       .then(parseQLResponse(model))
//       .then(parseHttpSuccess(model)(res), parseHttpError(model)(rej))
//   )
// }


exports.parseHttpSuccess = parseHttpSuccess;

var HttpTask = function HttpTask(_headers) {
  return function (method) {
    return function (mdl) {
      return function (url) {
        return function (body) {
          mdl.state.isLoading(true);
          return new _data.default(function (rej, res) {
            return m.request(_objectSpread({
              method: method,
              url: url,
              headers: _objectSpread({
                'content-type': 'application/json'
              }, _headers),
              body: body,
              withCredentials: false
            }, xhrProgress)).then(parseHttpSuccess(mdl)(res), parseHttpError(mdl)(rej));
          });
        };
      };
    };
  };
}; // const postTask = (model) => (url) => ({ dto }) => {
//   model.state.isLoading(true)
//   return new Task((rej, res) =>
//     m
//       .request({
//         method: 'POST',
//         url: `${url}`,
//         body: dto,
//         headers: { 'user-token': getUserToken() },
//         withCredentials: false,
//         ...xhrProgress,
//       })
//       .then(parseHttpSuccess(model)(res), parseHttpError(model)(rej))
//   )
// }
// const putTask = (model) => (url) => ({ dto }) => {
//   model.state.isLoading(true)
//   return new Task((rej, res) =>
//     m
//       .request({
//         method: 'PUT',
//         url: `${url}`,
//         body: dto,
//         headers: { 'user-token': getUserToken() },
//         withCredentials: false,
//         ...xhrProgress,
//       })
//       .then(parseHttpSuccess(model)(res), parseHttpError(model)(rej))
//   )
// }
// const getTask = (model) => (url) => {
//   model.state.isLoading(true)
//   return new Task((rej, res) =>
//     m
//       .request({
//         method: 'GET',
//         url: `${url}`,
//         headers: { 'user-token': getUserToken() },
//         withCredentials: false,
//         ...xhrProgress,
//       })
//       .then(parseHttpSuccess(model)(res), parseHttpError(model)(rej))
//   )
// }
// const deleteTask = (model) => (url) => (id) => {
//   model.state.isLoading(true)
//   return new Task((rej, res) =>
//     m
//       .request({
//         method: 'DELETE',
//         url: `${url}/${id}`,
//         headers: { 'user-token': getUserToken() },
//         withCredentials: false,
//         ...xhrProgress,
//       })
//       .then(parseHttpSuccess(model)(res), parseHttpError(model)(rej))
//   )
// }


var lookupLocationTask = function lookupLocationTask(query) {
  return new _data.default(function (rej, res) {
    return m.request({
      method: 'GET',
      url: "https://nominatim.openstreetmap.org/search?q=".concat(query, "&format=json")
    }).then(res, rej);
  });
};

var getTask = function getTask(mdl) {
  return function (url) {
    return HttpTask({})('GET')(mdl)(url)(null);
  };
};

var nhtsaUrl = 'http://localhost:3001/nhtsa/api/';
var nhtsa = {
  get: function get(mdl) {
    return function (url) {
      return getTask(mdl)(nhtsaUrl + '/' + url);
    };
  }
};
var backEndUrl = "".concat(_secrets.BackEnd.baseUrl, "/").concat(_secrets.BackEnd.APP_ID, "/").concat(_secrets.BackEnd.API_KEY, "/");
var backEnd = {
  get: function get(mdl) {
    return function (url) {
      return HttpTask(_secrets.BackEnd.headers)('GET')(mdl)(backEndUrl + url)(null);
    };
  },
  post: function post(mdl) {
    return function (url) {
      return function (dto) {
        return HttpTask(_secrets.BackEnd.headers)('POST')(mdl)(backEndUrl + url)(dto);
      };
    };
  }
};
var http = {
  backEnd: backEnd,
  nhtsa: nhtsa,
  HttpTask: HttpTask,
  // postQl,
  // postTask,
  getTask: getTask,
  // putTask,
  // deleteTask,
  lookupLocationTask: lookupLocationTask
};
var _default = http;
exports.default = _default;
});

;require.register("Utils/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _animations = require("./animations.js");

Object.keys(_animations).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _animations[key];
    }
  });
});

var _helpers = require("./helpers.js");

Object.keys(_helpers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _helpers[key];
    }
  });
});

var _http = require("./http.js");

Object.keys(_http).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _http[key];
    }
  });
});

var _validation = require("./validation.js");

Object.keys(_validation).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _validation[key];
    }
  });
});
});

;require.register("Utils/secrets.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CarMd = exports.BackEnd = void 0;

//NEED TO MOVE THESE TO ENVIRONMENT/GITLAT IN PRODUCTION for manifest
var getUserToken = function getUserToken() {
  return window.sessionStorage.getItem('user-token') ? window.sessionStorage.getItem('user-token') : '';
};

var BackEnd = {
  API_KEY: '7C923A78-BBF7-7D49-FF41-80A623EBE100',
  APP_ID: 'A0DC91A6-8088-D365-FF60-0DE1BB0C8600',
  baseUrl: 'https://api.backendless.com',
  headers: {
    'user-token': getUserToken()
  }
};
exports.BackEnd = BackEnd;
var CarMd = {
  headers: {
    'content-type': 'application/json',
    authorization: 'MDg4YjZmMTYtZTYzOC00YzAyLTk3ODQtODQ0ZmRhZjdhMmZh',
    'partner-token': '6ef25b68f4d54eb19c286ce8d1d2a954'
  },
  baseUrl: 'http://api.carmd.com/v3.0'
};
exports.CarMd = CarMd;
});

;require.register("Utils/validation.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNilOrEmptyOrAtom = exports.allCaps = exports.inDateRange = exports.unique = exports.maxLengthNullable = exports.onlyNumeric = exports.urlFormat = exports.phoneFormat = exports.onlyAlphaNumericSpaceSpecial = exports.onlyAlphaNumericSpaceUnderscore = exports.onlyAlphaNumericSpace = exports.onlyAlphaNumericUnderscore = exports.onlyAlphaNumeric = exports.onlyAlpha = exports.emailFormat = exports.maxSize = exports.maxLength = exports.isNullOrEmpty = exports.isNotNullOrEmpty = exports.IsNotNil = exports.isRequired = exports.validate = exports.getOrElse = void 0;

var _ramda = require("ramda");

var _data = require("data.validation");

var _data2 = _interopRequireDefault(require("data.maybe"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getOrElse = function getOrElse(val) {
  return function (x) {
    return x.getOrElse(val);
  };
};

exports.getOrElse = getOrElse;
var validate = (0, _ramda.curry)(function (rule, lens, msg, data) {
  return rule((0, _ramda.view)(lens, data)) ? (0, _data.Success)(data) : (0, _data.Failure)([(0, _ramda.set)(lens, msg, {})]);
});
exports.validate = validate;
var isRequired = (0, _ramda.compose)(_ramda.not, _ramda.isEmpty);
exports.isRequired = isRequired;
var IsNotNil = (0, _ramda.compose)(_ramda.not, _ramda.isNil);
exports.IsNotNil = IsNotNil;

var isNotNullOrEmpty = function isNotNullOrEmpty(data) {
  return !isNullOrEmpty(data);
};

exports.isNotNullOrEmpty = isNotNullOrEmpty;

var isNullOrEmpty = function isNullOrEmpty(data) {
  return (0, _ramda.isNil)(data) || (0, _ramda.isEmpty)(data);
};

exports.isNullOrEmpty = isNullOrEmpty;

var maxLength = function maxLength(max) {
  return (0, _ramda.compose)((0, _ramda.gte)(max), _ramda.length);
};

exports.maxLength = maxLength;
var maxSize = (0, _ramda.curry)(function (max, value) {
  return (0, _ramda.gte)(max, value);
});
exports.maxSize = maxSize;
var emailFormat = (0, _ramda.test)(/@/);
exports.emailFormat = emailFormat;
var onlyAlpha = (0, _ramda.test)(/^[a-zA-Z]*$/);
exports.onlyAlpha = onlyAlpha;
var onlyAlphaNumeric = (0, _ramda.test)(/^[a-zA-Z0-9]*$/);
exports.onlyAlphaNumeric = onlyAlphaNumeric;
var onlyAlphaNumericUnderscore = (0, _ramda.test)(/^[a-zA-Z0-9_]*$/);
exports.onlyAlphaNumericUnderscore = onlyAlphaNumericUnderscore;
var onlyAlphaNumericSpace = (0, _ramda.test)(/^[a-zA-Z0-9\s]*$/);
exports.onlyAlphaNumericSpace = onlyAlphaNumericSpace;
var onlyAlphaNumericSpaceUnderscore = (0, _ramda.test)(/^[a-zA-Z0-9_\s]*$/);
exports.onlyAlphaNumericSpaceUnderscore = onlyAlphaNumericSpaceUnderscore;
var onlyAlphaNumericSpaceSpecial = (0, _ramda.test)(/^[a-zA-Z0-9_.~!*''();:@&=+$,/?#[%-\]+\s]*$/);
exports.onlyAlphaNumericSpaceSpecial = onlyAlphaNumericSpaceSpecial;
var phoneFormat = (0, _ramda.test)(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/);
exports.phoneFormat = phoneFormat;
var urlFormat = (0, _ramda.test)(/^[a-zA-Z0-9_.~!*''();:@&=+$,/?#[%-\]+]*$/);
exports.urlFormat = urlFormat;
var onlyNumeric = (0, _ramda.test)(/^[0-9]*$/);
exports.onlyNumeric = onlyNumeric;

var maxLengthNullable = function maxLengthNullable(max) {
  return (0, _ramda.compose)(getOrElse(false), (0, _ramda.map)((0, _ramda.gte)(max)), (0, _ramda.map)(_ramda.length), _data2.default.fromNullable);
};

exports.maxLengthNullable = maxLengthNullable;
var unique = (0, _ramda.curry)(function (keys, value) {
  var lookup = _data2.default.fromNullable(keys);

  return !(0, _ramda.contains)((0, _ramda.toUpper)(value.toString()), (0, _ramda.map)(function (y) {
    return (0, _ramda.toUpper)(y.toString());
  }, lookup.getOrElse([])));
});
exports.unique = unique;
var inDateRange = (0, _ramda.curry)(function (start, end, value) {
  if (value == null || value === '') {
    return true;
  }

  return new Date(start) <= new Date(value) && new Date(value) < new Date(end);
});
exports.inDateRange = inDateRange;

var allCaps = function allCaps(str) {
  return str.toUpperCase() === str;
};

exports.allCaps = allCaps;

var isNilOrEmptyOrAtom = function isNilOrEmptyOrAtom(item) {
  return (0, _ramda.isNil)(item) || (0, _ramda.isEmpty)(item) || item === '{$type:atom}';
};

exports.isNilOrEmptyOrAtom = isNilOrEmptyOrAtom;
});

;require.register("index.js", function(exports, require, module) {
"use strict";

var _Model = require("./Model.js");

var _App = _interopRequireDefault(require("./App.js"));

var _FP = require("FP");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var root = document.body;
var winW = window.innerWidth;

if (module.hot) {
  module.hot.accept();
}

if ('development' !== "production") {
  console.log("Looks like we are in development mode!");
}

var getProfile = function getProfile(w) {
  if (w < 668) return "phone";
  if (w < 920) return "tablet";
  return "desktop";
};

var checkWidth = function checkWidth(winW) {
  var w = window.innerWidth;

  if (winW !== w) {
    winW = w;
    var lastProfile = _Model.model.state.profile;
    _Model.model.state.profile = getProfile(w);
    if (lastProfile != _Model.model.state.profile) m.redraw();
  }

  return requestAnimationFrame(checkWidth);
};

_Model.model.state.profile = getProfile(winW); // if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('./service-worker.js')
//       .then((registration) => {
//         console.log('🧟 SW registered: ', registration)
//       })
//       .catch((registrationError) => {
//         console.log('⚙️ SW registration failed: ', registrationError)
//       })
//   })
// }

checkWidth(winW);

_FP.FP.configure();

window.onscroll = function () {
  _Model.model.state.scrollPos(window.pageYOffset);
};

m.route(root, "/home", (0, _App.default)(_Model.model));
});

;require.register("init.js", function(exports, require, module) {
"use strict";

document.addEventListener("DOMContentLoaded", function () {
  require("index");
});
});

;require.alias(".pnpm/registry.npmjs.org/process/0.11.10/node_modules/process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  

// Auto-loaded modules from config.npm.globals.
window.m = require("mithril");
window.Stream = require("mithril-stream");


});})();require('___globals___');


//# sourceMappingURL=app.js.map