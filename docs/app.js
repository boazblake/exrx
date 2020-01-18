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
        if (route.group.includes("authenticated") && !mdl.state.isAuth()) {
          mdl.route.set(m.route.get());
        }

        mdl.state.route = route;
        mdl.state.anchor = path.split("#")[1];
        var isAnchor = Boolean(mdl.state.anchor);
        mdl.state.showSidebarModal(false);
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

;require.register("Components/Auth/forms/LoginForm.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoginForm = void 0;

var _FormInputs = _interopRequireDefault(require("Components/FormInputs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LoginForm = function LoginForm() {
  return {
    view: function view(_ref) {
      var _ref$attrs = _ref.attrs,
          data = _ref$attrs.data,
          errors = _ref$attrs.errors,
          isSubmitted = _ref$attrs.isSubmitted,
          httpError = _ref$attrs.httpError;
      return m("form.column", {
        id: "Login-form",
        onsubmit: function onsubmit(e) {
          return e.preventDefault();
        }
      }, [m(_FormInputs.default, {
        isSubmitted: isSubmitted,
        data: data,
        errors: errors,
        field: "email",
        label: "email",
        id: "email",
        type: "email"
      }), m(_FormInputs.default, {
        isSubmitted: isSubmitted,
        data: data,
        errors: errors,
        field: "password",
        label: "password",
        id: "reg-pass",
        type: "password"
      }), httpError && m(".toast toast-error", httpError)]);
    }
  };
};

exports.LoginForm = LoginForm;
});

;require.register("Components/Auth/forms/RegisterForm.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RegisterForm = void 0;

var _FormInputs = _interopRequireDefault(require("Components/FormInputs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RegisterForm = function RegisterForm() {
  return {
    view: function view(_ref) {
      var _ref$attrs = _ref.attrs,
          data = _ref$attrs.data,
          errors = _ref$attrs.errors,
          isSubmitted = _ref$attrs.isSubmitted,
          httpError = _ref$attrs.httpError;
      return [m("form.column", {
        id: "Register-form",
        onsubmit: function onsubmit(e) {
          return e.preventDefault();
        }
      }, [(".column col-6", [m(_FormInputs.default, {
        isSubmitted: isSubmitted,
        data: data,
        errors: errors,
        field: "name",
        label: "Name",
        id: "name",
        type: "text"
      }), m(_FormInputs.default, {
        isSubmitted: isSubmitted,
        data: data,
        errors: errors,
        field: "email",
        label: "email",
        id: "email",
        type: "email"
      }), m(_FormInputs.default, {
        isSubmitted: isSubmitted,
        data: data,
        errors: errors,
        field: "confirmEmail",
        label: "Confirm Email",
        id: "confirm-email",
        type: "email"
      }), m(_FormInputs.default, {
        isSubmitted: isSubmitted,
        data: data,
        errors: errors,
        field: "password",
        label: "password",
        id: "reg-pass",
        type: "password"
      }), m(_FormInputs.default, {
        isSubmitted: isSubmitted,
        data: data,
        errors: errors,
        field: "confirmPassword",
        label: "Confirm Password",
        id: "pass-confirm",
        type: "password"
      })]), m(".divider-vert", {
        dataContent: "|"
      })]), httpError && m(".toast toast-error", httpError)];
    }
  };
};

exports.RegisterForm = RegisterForm;
});

;require.register("Components/Auth/forms/Validations.js", function(exports, require, module) {
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

;require.register("Components/Auth/forms/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _LoginForm = require("./LoginForm.js");

Object.keys(_LoginForm).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _LoginForm[key];
    }
  });
});

var _RegisterForm = require("./RegisterForm.js");

Object.keys(_RegisterForm).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _RegisterForm[key];
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

;require.register("Components/Auth/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _forms = require("./forms");

var _Modal = _interopRequireDefault(require("Components/Modal.js"));

var _Button = _interopRequireDefault(require("Components/Button.js"));

var _Utils = require("Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var data = {
  name: "",
  email: "",
  password: "",
  confirmEmail: "",
  confirmPassword: "",
  isAdmin: false
};
var state = {
  forms: {
    1: _forms.RegisterForm,
    0: _forms.LoginForm
  },
  page: 0,
  title: {
    1: "Register",
    0: "Login"
  },
  isSubmitted: false,
  errors: {},
  httpError: undefined,
  data: (0, _Utils.jsonCopy)(data)
};

var resetState = function resetState() {
  state.data = (0, _Utils.jsonCopy)(data);
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
    m.route.set("/EXRX/".concat(mdl.user.name, "/dashboard"));
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
    state.page ? (0, _forms.validateUserRegistrationTask)(data).fork(onValidationError, onValidationSuccess) : (0, _forms.validateLoginTask)(data).fork(onValidationError, onValidationSuccess);
  };
};

var loginUser = function loginUser(mdl) {
  return function (_ref) {
    var email = _ref.email,
        password = _ref.password;
    return mdl.http.backEnd.postTask(mdl)("users/login")({
      login: email,
      password: password
    });
  };
};

var AddUserId = function AddUserId(mdl) {
  return function (id) {
    return mdl.http.postQl(mdl)("mutation {\n  createUser(data:{userId:".concat(id, "}){id}\n}"));
  };
};

var registerUser = function registerUser(mdl) {
  return function (_ref2) {
    var name = _ref2.name,
        email = _ref2.email,
        password = _ref2.password,
        isAdmin = _ref2.isAdmin;
    return mdl.http.backEnd.postTask(mdl)("users/register")({
      name: name,
      email: email,
      password: password,
      isAdmin: isAdmin
    }).chain(function (user) {
      return AddUserId(mdl)(JSON.stringify(user.objectId)).map(function () {
        return user;
      });
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
      return m("a.authLinkBtn btn-link", {
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
        classList: "auth-modal",
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
        footer: [m(_Button.default, {
          mdl: mdl,
          type: "submit",
          for: "".concat(state.title[state.page], "-form"),
          action: function action() {
            return validateForm(mdl)(state.data);
          },
          label: state.title[state.page],
          classList: "input btn btn-primary authBtn"
        }), m(AuthLink, {
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
    return m(".main", {
      id: "main"
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
          mdl = _ref$attrs.mdl,
          action = _ref$attrs.action,
          label = _ref$attrs.label,
          _ref$attrs$classList = _ref$attrs.classList,
          classList = _ref$attrs$classList === void 0 ? "" : _ref$attrs$classList,
          isDisabled = _ref$attrs.isDisabled;
      return (0, _mithril.default)("button.btn.".concat(classList, " ").concat(mdl.state.isLoading() ? "loading" : ""), {
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

var GoToTop = {
  view: function view(_ref) {
    var mdl = _ref.attrs.mdl;
    return m("button.btn btn-action btn-secondary btn-lg s-circle icon icon-arrow-up", {
      onclick: function onclick() {
        window.scroll({
          top: 0,
          left: 0,
          behavior: "smooth"
        });
        mdl.toggleNav(mdl);
        m.route.set(mdl.state.route.route);
      }
    }, "Back Up");
  }
};
var Footer = {
  view: function view(_ref2) {
    var mdl = _ref2.attrs.mdl;
    return m("footer", {
      id: "footer"
    }, m(_SocialMedia.default), m("p.text-center", ["Copyright \xA9 Boaz Blake. All rights reserved. ".concat(new Date().getFullYear(), " Privacy Policy")]));
  }
};
var _default = Footer;
exports.default = _default;
});

;require.register("Components/FormInputs.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var FormInput = {
  view: function view(_ref) {
    var _ref$attrs = _ref.attrs,
        isSubmitted = _ref$attrs.isSubmitted,
        data = _ref$attrs.data,
        errors = _ref$attrs.errors,
        field = _ref$attrs.field,
        label = _ref$attrs.label,
        id = _ref$attrs.id,
        type = _ref$attrs.type;
    return m(".form-group ", isSubmitted && {
      class: errors[field] ? "has-error" : "has-success"
    }, [m("label.form-label text-left", {
      id: id
    }, [label, m("span.span required", "*")]), m("input.form-input", {
      id: id,
      type: type,
      placeholder: label,
      onkeyup: function onkeyup(e) {
        return data[field] = e.target.value;
      },
      value: data[field],
      autocomplete: false
    }), errors[field] && m("p.form-input-hint", errors[field])]);
  }
};
var _default = FormInput;
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

;require.register("Components/Headers/MainHeader.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ProgressBar = _interopRequireDefault(require("Components/ProgressBar"));

var _Hamburger = _interopRequireDefault(require("Components/Hamburger"));

var _Navigation = _interopRequireDefault(require("Components/Navigation"));

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
      })), m(_Navigation.default, {
        mdl: mdl
      })]);
    }
  };
};

var _default = Header;
exports.default = _default;
});

;require.register("Components/Headers/ProfileHeader.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _NavTabs = _interopRequireDefault(require("../Navigation/NavTabs.js"));

var _ProgressBar = _interopRequireDefault(require("Components/ProgressBar"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ProfileHeader = function ProfileHeader() {
  return {
    view: function view(_ref) {
      var mdl = _ref.attrs.mdl;
      return m("header.header", {
        id: "header"
      }, [mdl.state.isLoading() && m(_ProgressBar.default, {
        mdl: mdl
      }), m(_NavTabs.default, {
        mdl: mdl,
        tabSelected: function tabSelected() {}
      })]);
    }
  };
};

var _default = ProfileHeader;
exports.default = _default;
});

;require.register("Components/Headers/SplashHeader.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _NavTabs = _interopRequireDefault(require("../Navigation/NavTabs.js"));

var _ProgressBar = _interopRequireDefault(require("Components/ProgressBar"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SplashHeader = function SplashHeader() {
  return {
    view: function view(_ref) {
      var mdl = _ref.attrs.mdl;
      return m("header.header", {
        id: "header"
      }, [mdl.state.isLoading() && m(_ProgressBar.default, {
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

var _MainHeader = require("./MainHeader.js");

Object.keys(_MainHeader).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _MainHeader[key];
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

var _ProfileHeader = require("./ProfileHeader.js");

Object.keys(_ProfileHeader).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _ProfileHeader[key];
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
var logo = m("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  "xmlns:xlink": "http://www.w3.org/1999/xlink",
  version: "1.1",
  x: "0px",
  y: "0px",
  viewBox: "0 0 99.978 100",
  "enable-background": "new 0 0 99.978 100",
  "xml:space": "preserve"
}, [m("polygon", {
  fill: "#ecf0f1",
  points: "49.987,0 0,25 0,37.5 49.987,12.5 99.978,37.5 99.978,25 "
}), m("path", {
  id: "ruler",
  fill: "#ecf0f1",
  d: "M74.978,37.5V100h18.75V37.5H74.978z M89.561,45.834h-6.25V50h6.25v4.167h-3.125v4.167h3.125V62.5h-6.25  v4.167h6.25v4.166h-3.125V75h3.125v4.167h-6.25v4.166h6.25V87.5h-3.125v4.166h3.125v4.167H79.145V41.667h10.416V45.834z"
}), m("path", {
  id: "hammer",
  fill: "#ecf0f1",
  d: "M41.111,48.539c-5.442-7.942-12.465-9.623-17.427-9.623c-3.235,0-5.497,0.741-5.593,0.773  c-0.307,0.102-0.586,0.276-0.814,0.505l-1.473,1.473h-1.221c0-1.151-0.932-2.083-2.083-2.083H8.333  c-1.151,0-2.083,0.932-2.083,2.083v6.25C6.25,49.068,7.182,50,8.333,50H12.5c1.151,0,2.083-0.932,2.083-2.083h2.083v14.245  l-1.975,5.929c-0.071,0.212-0.108,0.436-0.108,0.659v29.166c0,1.152,0.932,2.084,2.083,2.084H25c1.151,0,2.083-0.932,2.083-2.084  V68.75c0-0.224-0.037-0.447-0.108-0.659L25,62.162V49.149c0.903-0.386,1.961-0.581,3.158-0.581c4.905,0,10.302,3.186,10.355,3.218  c0.325,0.195,0.684,0.289,1.043,0.293c1.17,0.094,2.15-0.907,2.15-2.079C41.707,49.431,41.479,48.914,41.111,48.539z"
}), m("path", {
  id: "mouse",
  fill: "#ecf0f1",
  d: "M58.26,60.588c1.029-1.677,1.978-3.805,1.994-6.092c0.014-2.233-0.86-4.301-2.531-5.969  c-0.539-0.541-1.2-1.082-1.904-1.652c-2.256-1.822-3.735-3.174-3.735-5.208c0-2.689,2.569-5.867,3.558-6.864  c0.81-0.813,0.808-2.132-0.006-2.946c-0.816-0.81-2.13-0.81-2.942,0.004c-0.488,0.488-4.777,4.916-4.777,9.807  c0,4.175,3.052,6.645,5.281,8.447c0.58,0.472,1.133,0.911,1.579,1.359c0.887,0.887,1.314,1.863,1.31,2.982  c-0.012,2.254-1.737,4.703-2.838,5.969c-7.212,0.11-13.666,1.624-13.666,10.408v8.334c0,10.241,5.455,20.833,14.583,20.833  c9.473,0,14.583-10.734,14.583-20.833v-8.334C68.75,63.367,64.088,61.153,58.26,60.588z M64.583,70.833v2.084H56.25v-8.289  C63.303,64.93,64.583,66.874,64.583,70.833z M52.083,64.628v8.289H43.75v-2.084C43.75,66.874,45.029,64.93,52.083,64.628z   M54.167,95.833c-6.433,0-10.417-8.65-10.417-16.666v-2.084h20.833v2.084C64.583,86.088,61.352,95.833,54.167,95.833z"
})]);
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
  logo: logo,
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

var _animations = require("Utils/animations");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LeftAside = function LeftAside(_ref) {
  var mdl = _ref.attrs.mdl;
  var routes = mdl.Routes.filter(function (r) {
    return r.position.includes("left-aside");
  });

  if (mdl.state.profile == "desktop") {
    routes = routes.filter(function (r) {
      return r.id != "dashboard";
    });
  }

  return {
    oncreate: _animations.SlideInRight,
    onbeforeremove: _animations.SlideOutLeft,
    view: function view(_ref2) {
      var mdl = _ref2.attrs.mdl;
      return m(".left-aside.sidebar-modal", {
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

var Modal = function Modal(_ref) {
  var animateEntrance = _ref.animateEntrance,
      animateExit = _ref.animateExit;
  return {
    oncreate: animateEntrance,
    onbeforeremove: animateExit,
    view: function view(_ref2) {
      var _ref2$attrs = _ref2.attrs,
          classList = _ref2$attrs.classList,
          isActive = _ref2$attrs.isActive,
          close = _ref2$attrs.close,
          title = _ref2$attrs.title,
          content = _ref2$attrs.content,
          footer = _ref2$attrs.footer;
      return m("section.modal.".concat(classList), {
        class: isActive ? "active" : "",
        id: "modal"
      }, [m("a.modal-overlay", {
        "aria-label": "Close",
        onclick: function onclick() {
          return close();
        }
      }), m(".modal-container", {
        role: "document"
      }, [m(".modal-header", [m("a.btn btn-clear float-right", {
        id: "modal-close",
        "aria-label": "Close",
        onclick: function onclick() {
          return close();
        }
      }), m(".modal-title h3", title)]), m(".modal-body", m(".modal-content", content)), m(".modal-footer", footer)])]);
    }
  };
};

var _default = Modal;
exports.default = _default;
});

;require.register("Components/Navigation/NavMenu.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var Tab = function Tab(_ref) {
  var key = _ref.attrs.key;

  var getUser = function getUser(user) {
    return user ? user.name : "";
  };

  return {
    view: function view(_ref2) {
      var _ref2$attrs = _ref2.attrs,
          tab = _ref2$attrs.tab,
          active = _ref2$attrs.active,
          mdl = _ref2$attrs.mdl;
      return m("li.nav-item ".concat(active ? "active" : ""), m(m.route.Link, {
        key: key,
        class: "sidebar-nav",
        id: "".concat(tab.id, "-link"),
        href: tab.group.includes("authenticated") ? "EXRX/".concat(getUser(mdl.user), "/").concat(tab.id) : "".concat(tab.route)
      }, tab.title));
    }
  };
};

var NavMenu = function NavMenu(_ref3) {
  var mdl = _ref3.attrs.mdl;
  return {
    view: function view(_ref4) {
      var _ref4$attrs = _ref4.attrs,
          mdl = _ref4$attrs.mdl,
          routes = _ref4$attrs.routes;
      return routes.length ? m("ul.nav", {
        id: "menu"
      }, [routes.map(function (tab, idx) {
        return m(Tab, {
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

var _Icons = _interopRequireDefault(require("Components/Icons"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tab = function Tab(_ref) {
  var key = _ref.attrs.key;
  return {
    view: function view(_ref2) {
      var _ref2$attrs = _ref2.attrs,
          mdl = _ref2$attrs.mdl,
          tab = _ref2$attrs.tab,
          active = _ref2$attrs.active;
      return m(m.route.Link, {
        class: active ? "tab-item active" : "tab-item",
        key: key,
        id: "".concat(tab.id),
        onclick: function onclick(e) {
          if (tab.id == "dashboard" && mdl.state.profile != "desktop") {
            e.stopPropagation();
            e.preventDefault();
            mdl.toggleSidebarModal(mdl);
          }
        },
        href: tab.group.includes("authenticated") ? "/EXRX/".concat(mdl.user.name, "/").concat(tab.id) : "".concat(tab.route)
      }, ["Dashboard", "Home"].includes(tab.title) ? m(".img", {
        style: {
          width: "50px"
        }
      }, _Icons.default.logo) : tab.title);
    }
  };
};

var NavTabs = function NavTabs() {
  return {
    view: function view(_ref3) {
      var mdl = _ref3.attrs.mdl;
      var tabs = mdl.state.isAuth() ? mdl.Routes.filter(function (r) {
        return r.position.includes("auth-nav");
      }) : mdl.Routes.filter(function (r) {
        return r.position.includes("nav");
      });

      var isTabActive = function isTabActive(tab) {
        var _active = (0, _Utils.getRoute)(1); // console.log(tab.id, _active)


        return tab.id == _active;
      };

      return [m("ul.tab tab-group", {
        id: "tabbar"
      }, [tabs.map(function (tab, idx) {
        return m("li.tab-item", m(Tab, {
          key: idx,
          active: isTabActive(tab),
          tab: tab,
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

;require.register("Components/Navigation/Navigation.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _NavTabs = _interopRequireDefault(require("./NavTabs.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Navigation = function Navigation() {
  return {
    view: function view(_ref) {
      var mdl = _ref.attrs.mdl;
      return m(".navigation", m(_NavTabs.default, {
        mdl: mdl
      }));
    }
  };
};

var _default = Navigation;
exports.default = _default;
});

;require.register("Components/Navigation/ProfileNavigation.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _NavTabs = _interopRequireDefault(require("./NavTabs.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ProfileNavigation = function ProfileNavigation() {
  return {
    view: function view(_ref) {
      var mdl = _ref.attrs.mdl;
      return m(".navigation", m(_NavTabs.default, {
        mdl: mdl
      }));
    }
  };
};

var _default = ProfileNavigation;
exports.default = _default;
});

;require.register("Components/Navigation/SettingsMenu.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Utils = require("Utils");

var _ramda = require("ramda");

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
      mdl.clients = [];
      mdl.state.route.group.includes("authenticated") && history.back();
    };
  };

  var logout = function logout(mdl) {
    return mdl.http.backEnd.getTask(mdl)("users/logout").fork(onError(mdl), onSuccess(mdl));
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

var toSettingsMenuRoutes = function toSettingsMenuRoutes(mdl) {
  return mdl.user.isAdmin ? mdl.Routes.filter(function (route) {
    return route.position.includes("settings-nav");
  }) : mdl.Routes.filter(function (route) {
    return route.position.includes("settings-nav") && !route.group.includes("admin");
  });
};

var SettingsMenu = function SettingsMenu() {
  return {
    showMenu: Stream(false),
    view: function view(_ref4) {
      var state = _ref4.state,
          mdl = _ref4.attrs.mdl;
      var routes = toSettingsMenuRoutes(mdl);
      return [m("li.dropdown dropdown-right", [m("a.btn btn-primary dropdown-toggle", {
        onclick: function onclick() {
          return state.showMenu(!state.showMenu());
        },
        tabindex: "0"
      }, ["User Settings", m("i.icon icon-arrow-down")]), state.showMenu() && m("ul.menu", [// m(".panel", [
      //   m(".panel-header", m(".panel-title", "Comments")),
      //   m(".panel-nav"),
      //   m(".panel-body"),
      //   m(".panel-footer")
      // ]),
      m(Logout, {
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

var _Navigation = require("./Navigation");

Object.keys(_Navigation).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Navigation[key];
    }
  });
});

var _ProfileNavigation = require("./ProfileNavigation");

Object.keys(_ProfileNavigation).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _ProfileNavigation[key];
    }
  });
});
});

;require.register("Components/Paginate.js", function(exports, require, module) {
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

var ProgressBar = function ProgressBar() {
  return {
    view: function view(_ref) {
      var _ref$attrs$mdl$state$ = _ref.attrs.mdl.state.loadingProgress,
          value = _ref$attrs$mdl$state$.value,
          max = _ref$attrs$mdl$state$.max;
      return m(".progressBar", m("progress.progress", {
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

var _ProgressBar = require("./ProgressBar.js");

Object.keys(_ProgressBar).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _ProgressBar[key];
    }
  });
});

var _FormInputs = require("./FormInputs.js");

Object.keys(_FormInputs).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _FormInputs[key];
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

;require.register("Layouts/ProfileLayout.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ProfileHeader = _interopRequireDefault(require("Components/Headers/ProfileHeader"));

var _Footer = _interopRequireDefault(require("Components/Footer"));

var _LeftAside = _interopRequireDefault(require("Components/LeftAside"));

var _Body = _interopRequireDefault(require("Components/Body"));

var _Modal = _interopRequireDefault(require("Components/Modal"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ProfileLayout = function ProfileLayout(_ref) {
  var mdl = _ref.attrs.mdl;
  return {
    view: function view(_ref2) {
      var children = _ref2.children;
      return m(".layout", {
        id: "profile-layout"
      }, [m(_ProfileHeader.default, {
        mdl: mdl
      }), mdl.state.profile !== "desktop" ? m(_Modal.default, {
        isActive: mdl.state.showSidebarModal(),
        close: function close() {
          return mdl.toggleSidebarModal(mdl);
        },
        classList: "",
        mdl: mdl,
        content: m(_LeftAside.default, {
          mdl: mdl
        })
      }) : m(_LeftAside.default, {
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

var _SplashHeader = _interopRequireDefault(require("Components/Headers/SplashHeader"));

var _Footer = _interopRequireDefault(require("Components/Footer"));

var _Body = _interopRequireDefault(require("Components/Body"));

var _ProgressBar = _interopRequireDefault(require("Components/ProgressBar"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SplashLayout = function SplashLayout(_ref) {
  var mdl = _ref.attrs.mdl;
  return {
    view: function view(_ref2) {
      var children = _ref2.children;
      return m(".layout", {
        id: "splash-layout"
      }, [m(_SplashHeader.default, {
        mdl: mdl
      }), m(_Body.default, {
        mdl: mdl
      }, [children]), m(_Footer.default, {
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

;require.register("Model.js", function(exports, require, module) {
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
  clients: [],
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
    showModal: Stream(false),
    showSidebarModal: Stream(false),
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
  toggleModal: function toggleModal(mdl) {
    return mdl.state.showModal(!mdl.state.showModal());
  },
  toggleToast: function toggleToast(mdl) {
    return mdl.state.toast.show(!mdl.state.toast.show());
  },
  toggleSidebarModal: function toggleSidebarModal(mdl) {
    return mdl.state.showSidebarModal(!mdl.state.showSidebarModal());
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

;require.register("Pages/Admin/BatteryConfig/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var BatteryTestConfig = function BatteryTestConfig(_ref) {
  var mdl = _ref.attrs.mdl;
  // console.log('mdl', mdl)
  return {
    view: function view() {
      return m(".content", [m("section.section", {
        id: "content-toolbar"
      }, []), m("section.section", {
        id: "content-data"
      }, [m(".battery-config", {
        id: mdl.state.route.id
      }, [m("h1.title", mdl.state.route.title)])])]);
    }
  };
};

var _default = BatteryTestConfig;
exports.default = _default;
});

;require.register("Pages/Admin/Dashboard/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var Dashboard = function Dashboard(_ref) {
  var mdl = _ref.attrs.mdl;
  // console.log('mdl', mdl)
  return {
    view: function view() {
      return m(".content", [m("section.section", {
        id: "content-toolbar"
      }, []), m("section.section", {
        id: "content-data"
      }, [m(".dashboard", {
        id: mdl.state.route.id
      }, [m("h1.title", mdl.state.route.title)])])]);
    }
  };
};

var _default = Dashboard;
exports.default = _default;
});

;require.register("Pages/Admin/ManageClients/AddClientModal/Validations.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateClientRegistrationTask = void 0;

var _ramda = require("ramda");

var _data = require("data.validation");

var _Utils = require("Utils");

var ValidateRegistration = (0, _data.Success)((0, _ramda.curryN)(2, _ramda.identity));
var nameLense = (0, _ramda.lensProp)("name");
var emailLense = (0, _ramda.lensProp)("email");
var emailConfirmLense = (0, _ramda.lensProp)("confirmEmail");
var NAME_REQUIRED_MSG = "A Name is required";
var EMAIL_REQUIRED_MSG = "An Email is required";
var EMAILS_MUST_MATCH = "Emails do not match";
var INVALID_EMAIL_FORMAT = "Email must be a valid format";

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

var validateClientRegistrationTask = function validateClientRegistrationTask(data) {
  return ValidateRegistration.ap(validateName(data)).ap(validateEmails(data)) // .ap(validateBirthday(data))
  .failureMap(_ramda.mergeAll).toTask();
};

exports.validateClientRegistrationTask = validateClientRegistrationTask;
});

;require.register("Pages/Admin/ManageClients/AddClientModal/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Modal = _interopRequireDefault(require("Components/Modal"));

var _animations = require("Utils/animations");

var _registerClientForm = _interopRequireDefault(require("./registerClientForm.js"));

var _Validations = require("./Validations.js");

var _Utils = require("Utils");

var _Button = _interopRequireDefault(require("Components/Button"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dataModel = {
  firstname: "",
  lastname: "",
  email: "",
  confirmEmail: "",
  birthdate: ""
};
var state = {
  isSubmitted: false,
  errors: {},
  httpError: undefined,
  data: (0, _Utils.jsonCopy)(dataModel)
};

var resetState = function resetState() {
  state.data = [];
  state.errors = {};
  state.httpError = undefined;
  state.isSubmitted = false;
};

var saveClientTask = function saveClientTask(mdl) {
  return function (_ref) {
    var email = _ref.email,
        firstname = _ref.firstname,
        lastname = _ref.lastname,
        birthdate = _ref.birthdate;
    return mdl.http.postQl(mdl)("mutation {\n  createClient(\n    data: {\n      email:".concat(JSON.stringify(email), ",\n      firstname:").concat(JSON.stringify(firstname), ",\n      lastname:").concat(JSON.stringify(lastname), ",\n      birthdate:").concat(JSON.stringify(birthdate), ",\n      trainer:{connect:{userId: ").concat(JSON.stringify(mdl.user.objectId), "}}\n    }), {id, firstname, lastname, email, birthdate}\n}"));
  };
};

var validateForm = function validateForm(mdl) {
  return function (data) {
    var onError = function onError(errs) {
      state.errors = errs;
      console.log("failed - state", state);
    };

    var onSuccess = function onSuccess(mdl) {
      return function (_ref2) {
        var createClient = _ref2.createClient;
        mdl.clients.push(createClient);
        mdl.toggleModal(mdl);
        resetState();
      };
    };

    state.isSubmitted = true;
    (0, _Validations.validateClientRegistrationTask)(data).chain(saveClientTask(mdl)).fork(onError, onSuccess(mdl));
  };
};

var AddClientActions = function AddClientActions() {
  return {
    view: function view(_ref3) {
      var _ref3$attrs = _ref3.attrs,
          mdl = _ref3$attrs.mdl,
          state = _ref3$attrs.state;
      return [m(_Button.default, {
        mdl: mdl,
        type: "submit",
        for: "client-form",
        action: function action() {
          return validateForm(mdl)(state.data);
        },
        label: "Add New Client",
        classList: "input btn btn-primary authBtn"
      })];
    }
  };
};

var AddClient = function AddClient() {
  return {
    view: function view(_ref4) {
      var mdl = _ref4.attrs.mdl;
      return m(".", [m("button.btn", {
        onclick: function onclick(e) {
          return mdl.toggleModal(mdl);
        }
      }, "Add Client"), m(_Modal.default, {
        animateEntrance: _animations.animateComponentEntrance,
        animateExit: _animations.slideModalOut,
        mdl: mdl,
        classList: "",
        isActive: mdl.state.showModal(),
        close: function close() {
          return mdl.toggleModal(mdl);
        },
        title: "Add Client",
        content: m(_registerClientForm.default, {
          data: state.data,
          errors: state.errors,
          isSubmitted: state.isSubmitted
        }),
        footer: m(AddClientActions, {
          mdl: mdl,
          state: state
        })
      })]);
    }
  };
};

var _default = AddClient;
exports.default = _default;
});

;require.register("Pages/Admin/ManageClients/AddClientModal/registerClientForm.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _FormInputs = _interopRequireDefault(require("Components/FormInputs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RegisterClientForm = function RegisterClientForm() {
  return {
    view: function view(_ref) {
      var _ref$attrs = _ref.attrs,
          data = _ref$attrs.data,
          errors = _ref$attrs.errors,
          isSubmitted = _ref$attrs.isSubmitted;
      return [m("form.column col-6", {
        id: "client-form"
      }, [m(_FormInputs.default, {
        isSubmitted: isSubmitted,
        data: data,
        errors: errors,
        field: "firstname",
        label: "First Name",
        id: "first-name",
        type: "text"
      }), m(_FormInputs.default, {
        isSubmitted: isSubmitted,
        data: data,
        errors: errors,
        field: "lastname",
        label: "Last Name",
        id: "last-name",
        type: "text"
      }), m(_FormInputs.default, {
        isSubmitted: isSubmitted,
        data: data,
        errors: errors,
        field: "email",
        label: "Email",
        id: "email",
        type: "email"
      }), m(_FormInputs.default, {
        isSubmitted: isSubmitted,
        data: data,
        errors: errors,
        field: "confirmEmail",
        label: "Confirm Email",
        id: "confirm-email",
        type: "email"
      }), m(_FormInputs.default, {
        isSubmitted: isSubmitted,
        data: data,
        errors: errors,
        field: "birthdate",
        label: "birthdate",
        id: "birthdate",
        type: "date"
      })])];
    }
  };
};

var _default = RegisterClientForm;
exports.default = _default;
});

;require.register("Pages/Admin/ManageClients/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = _interopRequireDefault(require("./AddClientModal/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ManageClients = function ManageClients() {
  var loadClients = function loadClients(_ref) {
    var mdl = _ref.attrs.mdl;

    var onError = function onError(e) {
      return console.log("ERROR Fetching Clients", e);
    };

    var onSuccess = function onSuccess(_ref2) {
      var clients = _ref2.clients;
      return mdl.clients = clients;
    };

    return mdl.http.postQl(mdl)("query{\n  clients(where:{trainer:{userId:".concat(JSON.stringify(mdl.user.objectId), "}}){id, firstname, lastname, email, birthdate}\n}")).fork(onError, onSuccess);
  };

  return {
    oninit: loadClients,
    view: function view(_ref3) {
      var mdl = _ref3.attrs.mdl;
      return m(".contents", {
        id: "content"
      }, [m("section.section", {
        id: "content-toolbar"
      }, [m(_index.default, {
        mdl: mdl
      })]), m("section.section", {
        id: "content-data"
      }, [m(".manageClients", {
        id: mdl.state.route.id
      }, [m("section.panel", [m(".panel-header", m("h1.panel-title", mdl.state.route.title)), m(".panel-body", mdl.clients.map(function (client) {
        return m(".panel-item.card.client", m(".tile.tile-centered", [m(".tile-icon", m("figure.avatar", {
          "data-initial": "".concat(client.firstname[0]).concat(client.lastname[0])
        })), m(".tile-content", m(".text.text-bold", "".concat(client.lastname, ", ").concat(client.firstname))), m(".dropdown dropdown-right", m(".btn-group", [m("button.btn.btn-action.btn-lg.dropdown-toggle", {
          tabIndex: 0
        }, m("i.icon.icon-more-vert")), m("ul.menu", [m("li.menu-item", "Edit"), m("li.menu-item", "Delete")])]))]));
      }))])])])]);
    }
  };
};

var _default = ManageClients;
exports.default = _default;
});

;require.register("Pages/Admin/ManageNetwork/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var ManageNetwork = function ManageNetwork() {
  var state = {};

  var loadUsers = function loadUsers(_ref) {
    var mdl = _ref.attrs.mdl;

    var onError = function onError(e) {
      console.log("ERROR", e);
    };

    var onSuccess = function onSuccess(s) {
      console.log("SUCCESSS", s);
      state.users = s;
    };

    return mdl.http.backEnd.getTask(mdl)("data/users?pageSize=100").fork(onError, onSuccess);
  };

  var updateAdminStatus = function updateAdminStatus(mdl, user) {
    return function (e) {
      var onError = function onError(user) {
        return function (e) {
          user.isAdmin = !user.isAdmin;
          console.log("ERROR", e);
        };
      };

      var onSuccess = function onSuccess(user) {
        return function (s) {
          console.log("SUCCESSS", user);
        };
      };

      console.log({
        mdl: mdl,
        user: user
      });
      mdl.http.backEnd.putTask(mdl)("data/Users/".concat(user.objectId))({
        isAdmin: user.isAdmin = !user.isAdmin
      }).fork(onError(user), onSuccess(user));
    };
  };

  return {
    oninit: loadUsers,
    view: function view(_ref2) {
      var mdl = _ref2.attrs.mdl;
      return m(".content", [m("section.section", {
        id: "content-toolbar"
      }, [m(".", [m("button.btn", "Add User")])]), m("section.section", {
        id: "content-data"
      }, [m(".manageNetworks", {
        id: mdl.state.route.id
      }, [m("h1.title", mdl.state.route.title), state.users && state.users.map(function (u) {
        return m(".menu", m(".menu-item", [m("p", u.name), m("p", u.email), m(".form-group", m("label.form-switch", [m("input[type='checkbox']", {
          checked: u.isAdmin,
          onchange: updateAdminStatus(mdl, u),
          isDisabled: false,
          class: ""
        }), m("i.form-icon"), "User is Admin"]))]));
      })])])]);
    }
  };
};

var _default = ManageNetwork;
exports.default = _default;
});

;require.register("Pages/Admin/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require("./Dashboard/index");

Object.keys(_index).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _index[key];
    }
  });
});

var _index2 = require("./ManageNetwork/index");

Object.keys(_index2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _index2[key];
    }
  });
});

var _index3 = require("./ManageClients/index");

Object.keys(_index3).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _index3[key];
    }
  });
});

var _index4 = require("./BatteryConfig/index");

Object.keys(_index4).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _index4[key];
    }
  });
});
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

var Default = function Default(_ref) {
  var mdl = _ref.attrs.mdl;
  // console.log('mdl', mdl)
  return {
    view: function view() {
      return m(".content", [m("section.section", {
        id: "content-toolbar"
      }, []), m("section.section", {
        id: "content-data"
      }, [m(".default", {
        id: mdl.state.route.id
      }, [m("h1.title", mdl.state.route.title)])])]);
    }
  };
};

var _default = Default;
exports.default = _default;
});

;require.register("Pages/Splash/About/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var About = function About(_ref) {
  var mdl = _ref.attrs.mdl;
  // console.log('mdl', mdl)
  return {
    view: function view() {
      return m(".about", mdl.state.route.title);
    }
  };
};

var _default = About;
exports.default = _default;
});

;require.register("Pages/Splash/Contact/index.js", function(exports, require, module) {
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

;require.register("Pages/Splash/Home/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Icons = _interopRequireDefault(require("Components/Icons"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Home = function Home(_ref) {
  var mdl = _ref.attrs.mdl;
  return {
    view: function view() {
      return m("section.section", {
        id: "content-data"
      }, [m("section.home-section hero hero-lg bg-primary parall", m(".hero-body", [m("h1", "section 1")])), m("section.home-section hero hero-lg bg-secondary", m(".hero-body", m("h1", "section 2")))]);
    }
  };
};

var _default = Home;
exports.default = _default;
});

;require.register("Pages/Splash/index.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require("./About/index");

Object.keys(_index).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _index[key];
    }
  });
});

var _index2 = require("./Contact/index");

Object.keys(_index2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _index2[key];
    }
  });
});

var _index3 = require("./Home/index");

Object.keys(_index3).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _index3[key];
    }
  });
});
});

;require.register("Routes/authenticated.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ProfileLayout = _interopRequireDefault(require("Layouts/ProfileLayout"));

var _Dashboard = _interopRequireDefault(require("Pages/Admin/Dashboard"));

var _Default = _interopRequireDefault(require("Pages/Default"));

var _ManageClients = _interopRequireDefault(require("Pages/Admin/ManageClients"));

var _ManageNetwork = _interopRequireDefault(require("Pages/Admin/ManageNetwork"));

var _BatteryConfig = _interopRequireDefault(require("Pages/Admin/BatteryConfig"));

var _Utils = require("Utils");

var _Icons = _interopRequireDefault(require("Components/Icons"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var authenticated = [{
  id: "dashboard",
  title: "Dashboard",
  icon: _Icons.default.logo,
  route: "/EXRX/:name/dashboard",
  position: ["auth-nav", "left-aside"],
  group: ["authenticated"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_ProfileLayout.default, {
      mdl: mdl
    }, m(_Dashboard.default, {
      mdl: mdl
    }));
  }
}, {
  id: "profile-page",
  title: "Profile Page",
  icon: _Icons.default.home,
  route: "/EXRX/:name/profile",
  position: ["settings-nav"],
  group: ["authenticated"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    console.log("profile page login on match", mdl, args, path, fullroute, isAnchor, !mdl.state.isAuth());
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_ProfileLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}, {
  id: "battery-config",
  title: "Battery Tests",
  icon: _Icons.default.calcs,
  route: "/EXRX/:name/battery-config",
  position: ["left-aside"],
  group: ["authenticated", "admin"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    // console.log(
    //   "calcconfig",
    //   mdl,
    //   args,
    //   path,
    //   fullroute,
    //   isAnchor,
    //   mdl.state.isAuth(),
    //   mdl.user.isAdmin
    // )
    // !mdl.user.isAdmin && m.route.set(m.route.get())
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_ProfileLayout.default, {
      mdl: mdl
    }, m(_BatteryConfig.default, {
      mdl: mdl
    }));
  }
}, {
  id: "manage-clients",
  title: "Clients",
  icon: _Icons.default.users,
  route: "/EXRX/:name/manage-clients",
  position: ["left-aside"],
  group: ["authenticated", "admin"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    // console.log(
    //   "manage users on match",
    //   mdl,
    //   args,
    //   path,
    //   fullroute,
    //   isAnchor,
    //   mdl.state.isAuth(),
    //   mdl.user.isAdmin
    // )
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_ProfileLayout.default, {
      mdl: mdl
    }, m(_ManageClients.default, {
      mdl: mdl
    }));
  }
}, {
  id: "manage-network",
  title: "Configure Network",
  icon: _Icons.default.users,
  route: "/EXRX/:name/network-management",
  position: ["settings-nav"],
  group: ["authenticated", "admin"],
  children: [],
  onmatch: function onmatch(mdl, args, path, fullroute, isAnchor) {
    // console.log(
    //   "manage users on match",
    //   mdl,
    //   args,
    //   path,
    //   fullroute,
    //   isAnchor,
    //   mdl.state.isAuth(),
    //   mdl.user.isAdmin
    // )
    !mdl.user.isAdmin && m.route.set(m.route.get());
    isAnchor && (0, _Utils.scrollToAnchor)(mdl.state.anchor);
  },
  component: function component(mdl) {
    return m(_ProfileLayout.default, {
      mdl: mdl
    }, m(_ManageNetwork.default, {
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

var _splash = _interopRequireDefault(require("./splash.js"));

var _authenticated = _interopRequireDefault(require("./authenticated"));

var _ramda = require("ramda");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Routes = (0, _ramda.flatten)([_splash.default, _authenticated.default]);
var _default = Routes;
exports.default = _default;
});

;require.register("Routes/splash.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _SplashLayout = _interopRequireDefault(require("Layouts/SplashLayout"));

var _Default = _interopRequireDefault(require("../Pages/Default"));

var _Home = _interopRequireDefault(require("Pages/Splash/Home"));

var _Utils = require("Utils");

var _Icons = _interopRequireDefault(require("Components/Icons"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Splash = [{
  id: "home",
  title: "Home",
  icon: _Icons.default.logo,
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
    return m(_SplashLayout.default, {
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
    return m(_SplashLayout.default, {
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
    return m(_SplashLayout.default, {
      mdl: mdl
    }, m(_Default.default, {
      mdl: mdl
    }));
  }
}];
var _default = Splash;
exports.default = _default;
});

;require.register("Styles/animations.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoveChildrenOut = exports.animate = exports.SlideChildrenInDown = exports.StretchInLeft = exports.SlideChildrenInRight = exports.SlideOutLeft = exports.SlideInRight = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var SlideInRight = function SlideInRight(_ref) {
  var dom = _ref.dom;
  dom.style.opacity = 0;
  dom.classList.toggle("slideRight");
  dom.style.opacity = 1;
};

exports.SlideInRight = SlideInRight;

var SlideOutLeft = function SlideOutLeft(_ref2) {
  var dom = _ref2.dom;
  return new Promise(function () {
    dom.classList.remove("slideRight");
    return setTimeout(function () {
      dom.classList.add("reverseAnimation", "slideRight");
    }, 200);
  });
};

exports.SlideOutLeft = SlideOutLeft;

var SlideChildrenInRight = function SlideChildrenInRight(_ref3) {
  var dom = _ref3.dom;

  var children = _toConsumableArray(dom.children);

  return children.map(function (child, idx) {
    child.style.opacity = 0;
    setTimeout(function () {
      child.classList.toggle("slideRight");
      child.style.opacity = 1;
    }, (idx + 1) * 10);
  });
};

exports.SlideChildrenInRight = SlideChildrenInRight;

var StretchInLeft = function StretchInLeft(idx) {
  return function (_ref4) {
    var dom = _ref4.dom;
    dom.style.opacity = 0;
    return setTimeout(function () {
      dom.classList.toggle("stretchRight");
      dom.style.opacity = 1;
    }, idx * 100 + 20);
  };
};

exports.StretchInLeft = StretchInLeft;

var SlideChildrenInDown = function SlideChildrenInDown(idx) {
  return function (_ref5) {
    var dom = _ref5.dom;
    dom.style.opacity = 0;
    setTimeout(function () {
      dom.classList.toggle("slideDown");
      dom.style.opacity = 1;
    }, (idx + 1) * 200);
  };
};

exports.SlideChildrenInDown = SlideChildrenInDown;

var animate = function animate(dir) {
  return function (_ref6) {
    var dom = _ref6.dom;
    dom.style.opacity = 0;
    setTimeout(function () {
      dom.classList.toggle(dir);
      dom.style.opacity = 1;
    }, 200);
  };
};

exports.animate = animate;

var RemoveChildrenOut = function RemoveChildrenOut(_ref7) {
  var dom = _ref7.dom;
  return new Promise(function () {
    ;

    _toConsumableArray(dom.children).reverse().map(function (child, idx) {
      return setTimeout(function () {
        child.style.display = "none";
      }, idx * 100);
    });
  });
};

exports.RemoveChildrenOut = RemoveChildrenOut;
});

;require.register("Utils/animations.js", function(exports, require, module) {
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

var IsLoading = (0, _mithril.default)(".holder", [(0, _mithril.default)(".preloader", [(0, _mithril.default)("div"), (0, _mithril.default)("div"), (0, _mithril.default)("div"), (0, _mithril.default)("div"), (0, _mithril.default)("div"), (0, _mithril.default)("div"), (0, _mithril.default)("div")])]);
exports.IsLoading = IsLoading;

var animateComponentEntrance = function animateComponentEntrance(idx) {
  return function (_ref) {
    var dom = _ref.dom;
    dom.style.opacity = 0;
    return setTimeout(function () {
      dom.classList.toggle("stretchRight");
      dom.style.opacity = 1;
    }, idx * 100 + 20);
  };
};

exports.animateComponentEntrance = animateComponentEntrance;

var animateSidebarEntrance = function animateSidebarEntrance(_ref2) {
  var dom = _ref2.dom;
  dom.style.opacity = 0;
  dom.classList.toggle("slideRight");
  dom.style.opacity = 1;
};

exports.animateSidebarEntrance = animateSidebarEntrance;

var animateChildrenEntrance = function animateChildrenEntrance(_ref3) {
  var dom = _ref3.dom;

  var children = _toConsumableArray(dom.children);

  return children.map(function (child, idx) {
    child.style.opacity = 0;
    setTimeout(function () {
      child.classList.toggle("slideRight");
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
      dom.classList.toggle("slideDown");
      dom.style.opacity = 1;
    }, (idx + 1) * 200);
  };
};

exports.animateChildrenLimitsEntrance = animateChildrenLimitsEntrance;

var animate = function animate(dir) {
  return function (_ref5) {
    var dom = _ref5.dom;
    dom.style.opacity = 0;
    return setTimeout(function () {
      dom.classList.toggle(dir);
      dom.style.opacity = 1;
    }, 200);
  };
};

exports.animate = animate;

var slideModalOut = function slideModalOut(_ref6) {
  var dom = _ref6.dom;
  return new Promise(function () {
    dom.classList.remove("slideRight");
    return setTimeout(function () {
      dom.classList.add("reverseAnimation", "slideRight");
    }, 200);
  });
};

exports.slideModalOut = slideModalOut;

var animateChildrenLimitsExit = function animateChildrenLimitsExit(_ref7) {
  var dom = _ref7.dom;
  return new Promise(function () {
    ;

    _toConsumableArray(dom.children).reverse().map(function (child, idx) {
      return setTimeout(function () {
        child.style.display = "none";
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
exports.jsonCopy = exports.scrollToAnchor = exports.getRoute = exports.debounce = exports.filterTask = exports._paginate = exports._direction = exports._sort = exports._search = exports.removeHyphens = exports.addTerms = exports.infiniteScroll = exports.isEmpty = exports.log = exports.makeRoute = void 0;

var _ramda = require("ramda");

var _data = _interopRequireDefault(require("data.task"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var makeRoute = (0, _ramda.compose)((0, _ramda.join)("-"), (0, _ramda.split)(" "), (0, _ramda.trim)(), (0, _ramda.toLower)());
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
  var terms = (0, _ramda.compose)((0, _ramda.join)(" "), _ramda.values, (0, _ramda.props)(["uuid", "id", "name"]))(item);
  return (0, _ramda.assoc)("_terms", terms, item);
};

exports.addTerms = addTerms;

var removeHyphens = function removeHyphens(str) {
  return str.replace(/-/gi, "");
};

exports.removeHyphens = removeHyphens;

var byTerms = function byTerms(query) {
  return (0, _ramda.compose)((0, _ramda.test)(new RegExp(query, "i")), (0, _ramda.prop)("name"));
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
  return dir == "asc" ? _ramda.identity : _ramda.reverse;
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

var getRoute = function getRoute() {
  return (0, _ramda.last)(m.route.get().split("/"));
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
    behavior: "smooth"
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
};

var makeQueryString = function makeQueryString(query) {
  return JSON.parse(JSON.stringify(query));
};

var parseQLResponse = function parseQLResponse(model) {
  return function (_ref) {
    var data = _ref.data,
        errors = _ref.errors;
    model.state.isLoading(false);
    return errors ? Promise.reject(errors) : Promise.resolve(data);
  };
};

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


exports.parseHttpSuccess = parseHttpSuccess;

var postQl = function postQl(model) {
  return function (query) {
    model.state.isLoading(true);
    return new _data.default(function (rej, res) {
      return m.request(_objectSpread({
        method: "POST",
        url: _secrets.GraphQl.local,
        withCredentials: false
      }, xhrProgress, {
        body: makeQueryString({
          query: query
        })
      })).then(parseQLResponse(model)).then(parseHttpSuccess(model)(res), parseHttpError(model)(rej));
    });
  };
};

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
                "content-type": "application/json"
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


var backEndUrl = "".concat(_secrets.BackEnd.baseUrl, "/").concat(_secrets.BackEnd.APP_ID, "/").concat(_secrets.BackEnd.API_KEY, "/");
var backEnd = {
  getTask: function getTask(mdl) {
    return function (url) {
      return HttpTask(_secrets.BackEnd.headers())("GET")(mdl)(backEndUrl + url)(null);
    };
  },
  postTask: function postTask(mdl) {
    return function (url) {
      return function (dto) {
        return HttpTask(_secrets.BackEnd.headers())("POST")(mdl)(backEndUrl + url)(dto);
      };
    };
  },
  putTask: function putTask(mdl) {
    return function (url) {
      return function (dto) {
        return HttpTask(_secrets.BackEnd.headers())("PUT")(mdl)(backEndUrl + url)(dto);
      };
    };
  }
};
var http = {
  backEnd: backEnd,
  postQl: postQl
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
exports.GraphQl = exports.BackEnd = void 0;

var getUserToken = function getUserToken() {
  return window.sessionStorage.getItem("user-token") ? window.sessionStorage.getItem("user-token") : "";
};

var BackEnd = {
  API_KEY: "0870B3E1-56DD-4A8A-8DA7-A6F7AC417C16",
  APP_ID: "62607660-30EF-AD36-FFB1-FF547F6B1800",
  baseUrl: "https://api.backendless.com",
  headers: function headers() {
    return {
      "user-token": getUserToken()
    };
  }
};
exports.BackEnd = BackEnd;
var GraphQl = {
  online: "https://us1.prisma.sh/exrx/exrx_service/dev",
  local: "http://localhost:4466/"
};
exports.GraphQl = GraphQl;
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

if ('development' !== "production") {} // console.log("Looks like we are in development mode!")
// set display profiles


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

checkWidth(winW); //Include custome and Fp polyfills

_FP.FP.configure(); //position on page


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