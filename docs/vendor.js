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

require.register("sanctuary-type-classes/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "sanctuary-type-classes");
  (function() {
    /*
             ############                  #
            ############                  ###
                  #####                  #####
                #####      ####################
              #####       ######################
            #####                     ###########
          #####         ######################
        #####          ####################
      #####                        #####
     ############                 ###
    ############                 */

//. # sanctuary-type-classes
//.
//. The [Fantasy Land Specification][FL] "specifies interoperability of common
//. algebraic structures" by defining a number of type classes. For each type
//. class, it states laws which every member of a type must obey in order for
//. the type to be a member of the type class. In order for the Maybe type to
//. be considered a [Functor][], for example, every `Maybe a` value must have
//. a `fantasy-land/map` method which obeys the identity and composition laws.
//.
//. This project provides:
//.
//.   - [`TypeClass`](#TypeClass), a function for defining type classes;
//.   - one `TypeClass` value for each Fantasy Land type class;
//.   - lawful Fantasy Land methods for JavaScript's built-in types;
//.   - one function for each Fantasy Land method; and
//.   - several functions derived from these functions.
//.
//. ## Type-class hierarchy
//.
/* eslint-disable max-len */
//. <pre>
//.  Setoid   Semigroupoid  Semigroup   Foldable        Functor      Contravariant  Filterable
//. (equals)    (compose)    (concat)   (reduce)         (map)        (contramap)    (filter)
//.     |           |           |           \         / | | | | \
//.     |           |           |            \       /  | | | |  \
//.     |           |           |             \     /   | | | |   \
//.     |           |           |              \   /    | | | |    \
//.     |           |           |               \ /     | | | |     \
//.    Ord      Category     Monoid         Traversable | | | |      \
//.   (lte)       (id)       (empty)        (traverse)  / | | \       \
//.                             |                      /  | |  \       \
//.                             |                     /   / \   \       \
//.                             |             Profunctor /   \ Bifunctor \
//.                             |              (promap) /     \ (bimap)   \
//.                             |                      /       \           \
//.                           Group                   /         \           \
//.                          (invert)               Alt        Apply      Extend
//.                                                (alt)        (ap)     (extend)
//.                                                 /           / \           \
//.                                                /           /   \           \
//.                                               /           /     \           \
//.                                              /           /       \           \
//.                                             /           /         \           \
//.                                           Plus    Applicative    Chain      Comonad
//.                                          (zero)       (of)      (chain)    (extract)
//.                                             \         / \         / \
//.                                              \       /   \       /   \
//.                                               \     /     \     /     \
//.                                                \   /       \   /       \
//.                                                 \ /         \ /         \
//.                                             Alternative    Monad     ChainRec
//.                                                                     (chainRec)
//. </pre>
/* eslint-enable max-len */
//.
//. ## API

(function(f) {

  'use strict';

  /* istanbul ignore else */
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = f (require ('sanctuary-type-identifiers'));
  } else if (typeof define === 'function' && define.amd != null) {
    define (['sanctuary-type-identifiers'], f);
  } else {
    self.sanctuaryTypeClasses = f (self.sanctuaryTypeIdentifiers);
  }

} (function(type) {

  'use strict';

  /* istanbul ignore if */
  if (typeof __doctest !== 'undefined') {
    /* eslint-disable no-unused-vars */
    var Identity = __doctest.require ('sanctuary-identity');
    var List = __doctest.require ('./test/List');
    var Maybe = __doctest.require ('sanctuary-maybe');
    var Pair = __doctest.require ('sanctuary-pair');
    var Sum = __doctest.require ('./test/Sum');

    var Nil = List.Nil, Cons = List.Cons;
    var Nothing = Maybe.Nothing, Just = Maybe.Just;
    /* eslint-enable no-unused-vars */
  }

  //  concat_ :: Array a -> Array a -> Array a
  function concat_(xs) {
    return function(ys) {
      return xs.concat (ys);
    };
  }

  //  constant :: a -> b -> a
  function constant(x) {
    return function(y) {
      return x;
    };
  }

  //  forEachKey :: (StrMap a, StrMap a ~> String -> Undefined) -> Undefined
  function forEachKey(strMap, f) {
    (Object.keys (strMap)).forEach (f, strMap);
  }

  //  has :: (String, Object) -> Boolean
  function has(k, o) {
    return Object.prototype.hasOwnProperty.call (o, k);
  }

  //  identity :: a -> a
  function identity(x) { return x; }

  //  pair :: a -> b -> Array2 a b
  function pair(x) {
    return function(y) {
      return [x, y];
    };
  }

  //  sameType :: (a, b) -> Boolean
  function sameType(x, y) {
    return typeof x === typeof y && type (x) === type (y);
  }

  //  sortedKeys :: Object -> Array String
  function sortedKeys(o) {
    return (Object.keys (o)).sort ();
  }

  //  thrush :: a -> (a -> b) -> b
  function thrush(x) {
    return function(f) {
      return f (x);
    };
  }

  //  unary :: (a -> b) -> (a, Any...) -> b
  function unary(f) {
    return function(x) {
      return f (x);
    };
  }

  //  type Iteration a = { value :: a, done :: Boolean }

  //  iterationNext :: a -> Iteration a
  function iterationNext(x) { return {value: x, done: false}; }

  //  iterationDone :: a -> Iteration a
  function iterationDone(x) { return {value: x, done: true}; }

  //# TypeClass :: (String, String, Array TypeClass, a -> Boolean) -> TypeClass
  //.
  //. The arguments are:
  //.
  //.   - the name of the type class, prefixed by its npm package name;
  //.   - the documentation URL of the type class;
  //.   - an array of dependencies; and
  //.   - a predicate which accepts any JavaScript value and returns `true`
  //.     if the value satisfies the requirements of the type class; `false`
  //.     otherwise.
  //.
  //. Example:
  //.
  //. ```javascript
  //. //    hasMethod :: String -> a -> Boolean
  //. const hasMethod = name => x => x != null && typeof x[name] == 'function';
  //.
  //. //    Foo :: TypeClass
  //. const Foo = Z.TypeClass (
  //.   'my-package/Foo',
  //.   'http://example.com/my-package#Foo',
  //.   [],
  //.   hasMethod ('foo')
  //. );
  //.
  //. //    Bar :: TypeClass
  //. const Bar = Z.TypeClass (
  //.   'my-package/Bar',
  //.   'http://example.com/my-package#Bar',
  //.   [Foo],
  //.   hasMethod ('bar')
  //. );
  //. ```
  //.
  //. Types whose values have a `foo` method are members of the Foo type class.
  //. Members of the Foo type class whose values have a `bar` method are also
  //. members of the Bar type class.
  //.
  //. Each `TypeClass` value has a `test` field: a function which accepts
  //. any JavaScript value and returns `true` if the value satisfies the
  //. type class's predicate and the predicates of all the type class's
  //. dependencies; `false` otherwise.
  //.
  //. `TypeClass` values may be used with [sanctuary-def][type-classes]
  //. to define parametrically polymorphic functions which verify their
  //. type-class constraints at run time.
  function TypeClass(name, url, dependencies, test) {
    if (!(this instanceof TypeClass)) {
      return new TypeClass (name, url, dependencies, test);
    }
    this.name = name;
    this.url = url;
    this.test = function(x) {
      return dependencies.every (function(d) { return d.test (x); }) &&
             test (x);
    };
  }

  TypeClass['@@type'] = 'sanctuary-type-classes/TypeClass@1';

  //  data Location = Constructor | Value

  //  Constructor :: Location
  var Constructor = 'Constructor';

  //  Value :: Location
  var Value = 'Value';

  //  _funcPath :: (Boolean, Array String, a) -> Nullable Function
  function _funcPath(allowInheritedProps, path, _x) {
    var x = _x;
    for (var idx = 0; idx < path.length; idx += 1) {
      var k = path[idx];
      if (x == null || !(allowInheritedProps || has (k, x))) return null;
      x = x[k];
    }
    return typeof x === 'function' ? x : null;
  }

  //  funcPath :: (Array String, a) -> Nullable Function
  function funcPath(path, x) {
    return _funcPath (true, path, x);
  }

  //  implPath :: Array String -> Nullable Function
  function implPath(path) {
    return _funcPath (false, path, implementations);
  }

  //  functionName :: Function -> String
  var functionName = has ('name', function f() {}) ?
    function functionName(f) { return f.name; } :
    /* istanbul ignore next */
    function functionName(f) {
      var match = /function (\w*)/.exec (f);
      return match == null ? '' : match[1];
    };

  //  $ :: (String, Array TypeClass, StrMap (Array Location)) -> TypeClass
  function $(_name, dependencies, requirements) {
    function getBoundMethod(_name) {
      var name = 'fantasy-land/' + _name;
      return requirements[_name] === Constructor ?
        function(typeRep) {
          var f = funcPath ([name], typeRep);
          return f == null && typeof typeRep === 'function' ?
            implPath ([functionName (typeRep), name]) :
            f;
        } :
        function(x) {
          var isPrototype = x != null &&
                            x.constructor != null &&
                            x.constructor.prototype === x;
          var m = null;
          if (!isPrototype) m = funcPath ([name], x);
          if (m == null)    m = implPath ([type (x), 'prototype', name]);
          return m && m.bind (x);
        };
    }

    var version = '11.0.0';  // updated programmatically
    var keys = Object.keys (requirements);

    var typeClass = TypeClass (
      'sanctuary-type-classes/' + _name,
      'https://github.com/sanctuary-js/sanctuary-type-classes/tree/v' + version
        + '#' + _name,
      dependencies,
      function(x) {
        return keys.every (function(_name) {
          var arg = requirements[_name] === Constructor ? x.constructor : x;
          return getBoundMethod (_name) (arg) != null;
        });
      }
    );

    typeClass.methods = keys.reduce (function(methods, _name) {
      methods[_name] = getBoundMethod (_name);
      return methods;
    }, {});

    return typeClass;
  }

  //# Setoid :: TypeClass
  //.
  //. `TypeClass` value for [Setoid][].
  //.
  //. ```javascript
  //. > Setoid.test (null)
  //. true
  //. ```
  var Setoid = $ ('Setoid', [], {equals: Value});

  //# Ord :: TypeClass
  //.
  //. `TypeClass` value for [Ord][].
  //.
  //. ```javascript
  //. > Ord.test (0)
  //. true
  //.
  //. > Ord.test (Math.sqrt)
  //. false
  //. ```
  var Ord = $ ('Ord', [Setoid], {lte: Value});

  //# Semigroupoid :: TypeClass
  //.
  //. `TypeClass` value for [Semigroupoid][].
  //.
  //. ```javascript
  //. > Semigroupoid.test (Math.sqrt)
  //. true
  //.
  //. > Semigroupoid.test (0)
  //. false
  //. ```
  var Semigroupoid = $ ('Semigroupoid', [], {compose: Value});

  //# Category :: TypeClass
  //.
  //. `TypeClass` value for [Category][].
  //.
  //. ```javascript
  //. > Category.test (Math.sqrt)
  //. true
  //.
  //. > Category.test (0)
  //. false
  //. ```
  var Category = $ ('Category', [Semigroupoid], {id: Constructor});

  //# Semigroup :: TypeClass
  //.
  //. `TypeClass` value for [Semigroup][].
  //.
  //. ```javascript
  //. > Semigroup.test ('')
  //. true
  //.
  //. > Semigroup.test (0)
  //. false
  //. ```
  var Semigroup = $ ('Semigroup', [], {concat: Value});

  //# Monoid :: TypeClass
  //.
  //. `TypeClass` value for [Monoid][].
  //.
  //. ```javascript
  //. > Monoid.test ('')
  //. true
  //.
  //. > Monoid.test (0)
  //. false
  //. ```
  var Monoid = $ ('Monoid', [Semigroup], {empty: Constructor});

  //# Group :: TypeClass
  //.
  //. `TypeClass` value for [Group][].
  //.
  //. ```javascript
  //. > Group.test (Sum (0))
  //. true
  //.
  //. > Group.test ('')
  //. false
  //. ```
  var Group = $ ('Group', [Monoid], {invert: Value});

  //# Filterable :: TypeClass
  //.
  //. `TypeClass` value for [Filterable][].
  //.
  //. ```javascript
  //. > Filterable.test ({})
  //. true
  //.
  //. > Filterable.test ('')
  //. false
  //. ```
  var Filterable = $ ('Filterable', [], {filter: Value});

  //# Functor :: TypeClass
  //.
  //. `TypeClass` value for [Functor][].
  //.
  //. ```javascript
  //. > Functor.test ([])
  //. true
  //.
  //. > Functor.test ('')
  //. false
  //. ```
  var Functor = $ ('Functor', [], {map: Value});

  //# Bifunctor :: TypeClass
  //.
  //. `TypeClass` value for [Bifunctor][].
  //.
  //. ```javascript
  //. > Bifunctor.test (Pair ('foo') (64))
  //. true
  //.
  //. > Bifunctor.test ([])
  //. false
  //. ```
  var Bifunctor = $ ('Bifunctor', [Functor], {bimap: Value});

  //# Profunctor :: TypeClass
  //.
  //. `TypeClass` value for [Profunctor][].
  //.
  //. ```javascript
  //. > Profunctor.test (Math.sqrt)
  //. true
  //.
  //. > Profunctor.test ([])
  //. false
  //. ```
  var Profunctor = $ ('Profunctor', [Functor], {promap: Value});

  //# Apply :: TypeClass
  //.
  //. `TypeClass` value for [Apply][].
  //.
  //. ```javascript
  //. > Apply.test ([])
  //. true
  //.
  //. > Apply.test ('')
  //. false
  //. ```
  var Apply = $ ('Apply', [Functor], {ap: Value});

  //# Applicative :: TypeClass
  //.
  //. `TypeClass` value for [Applicative][].
  //.
  //. ```javascript
  //. > Applicative.test ([])
  //. true
  //.
  //. > Applicative.test ({})
  //. false
  //. ```
  var Applicative = $ ('Applicative', [Apply], {of: Constructor});

  //# Chain :: TypeClass
  //.
  //. `TypeClass` value for [Chain][].
  //.
  //. ```javascript
  //. > Chain.test ([])
  //. true
  //.
  //. > Chain.test ({})
  //. false
  //. ```
  var Chain = $ ('Chain', [Apply], {chain: Value});

  //# ChainRec :: TypeClass
  //.
  //. `TypeClass` value for [ChainRec][].
  //.
  //. ```javascript
  //. > ChainRec.test ([])
  //. true
  //.
  //. > ChainRec.test ({})
  //. false
  //. ```
  var ChainRec = $ ('ChainRec', [Chain], {chainRec: Constructor});

  //# Monad :: TypeClass
  //.
  //. `TypeClass` value for [Monad][].
  //.
  //. ```javascript
  //. > Monad.test ([])
  //. true
  //.
  //. > Monad.test ({})
  //. false
  //. ```
  var Monad = $ ('Monad', [Applicative, Chain], {});

  //# Alt :: TypeClass
  //.
  //. `TypeClass` value for [Alt][].
  //.
  //. ```javascript
  //. > Alt.test ({})
  //. true
  //.
  //. > Alt.test ('')
  //. false
  //. ```
  var Alt = $ ('Alt', [Functor], {alt: Value});

  //# Plus :: TypeClass
  //.
  //. `TypeClass` value for [Plus][].
  //.
  //. ```javascript
  //. > Plus.test ({})
  //. true
  //.
  //. > Plus.test ('')
  //. false
  //. ```
  var Plus = $ ('Plus', [Alt], {zero: Constructor});

  //# Alternative :: TypeClass
  //.
  //. `TypeClass` value for [Alternative][].
  //.
  //. ```javascript
  //. > Alternative.test ([])
  //. true
  //.
  //. > Alternative.test ({})
  //. false
  //. ```
  var Alternative = $ ('Alternative', [Applicative, Plus], {});

  //# Foldable :: TypeClass
  //.
  //. `TypeClass` value for [Foldable][].
  //.
  //. ```javascript
  //. > Foldable.test ({})
  //. true
  //.
  //. > Foldable.test ('')
  //. false
  //. ```
  var Foldable = $ ('Foldable', [], {reduce: Value});

  //# Traversable :: TypeClass
  //.
  //. `TypeClass` value for [Traversable][].
  //.
  //. ```javascript
  //. > Traversable.test ([])
  //. true
  //.
  //. > Traversable.test ('')
  //. false
  //. ```
  var Traversable = $ ('Traversable', [Functor, Foldable], {traverse: Value});

  //# Extend :: TypeClass
  //.
  //. `TypeClass` value for [Extend][].
  //.
  //. ```javascript
  //. > Extend.test ([])
  //. true
  //.
  //. > Extend.test ({})
  //. false
  //. ```
  var Extend = $ ('Extend', [Functor], {extend: Value});

  //# Comonad :: TypeClass
  //.
  //. `TypeClass` value for [Comonad][].
  //.
  //. ```javascript
  //. > Comonad.test (Identity (0))
  //. true
  //.
  //. > Comonad.test ([])
  //. false
  //. ```
  var Comonad = $ ('Comonad', [Extend], {extract: Value});

  //# Contravariant :: TypeClass
  //.
  //. `TypeClass` value for [Contravariant][].
  //.
  //. ```javascript
  //. > Contravariant.test (Math.sqrt)
  //. true
  //.
  //. > Contravariant.test ([])
  //. false
  //. ```
  var Contravariant = $ ('Contravariant', [], {contramap: Value});

  //  Null$prototype$equals :: Null ~> Null -> Boolean
  function Null$prototype$equals(other) {
    return true;
  }

  //  Null$prototype$lte :: Null ~> Null -> Boolean
  function Null$prototype$lte(other) {
    return true;
  }

  //  Undefined$prototype$equals :: Undefined ~> Undefined -> Boolean
  function Undefined$prototype$equals(other) {
    return true;
  }

  //  Undefined$prototype$lte :: Undefined ~> Undefined -> Boolean
  function Undefined$prototype$lte(other) {
    return true;
  }

  //  Boolean$prototype$equals :: Boolean ~> Boolean -> Boolean
  function Boolean$prototype$equals(other) {
    return typeof this === 'object' ?
      equals (this.valueOf (), other.valueOf ()) :
      this === other;
  }

  //  Boolean$prototype$lte :: Boolean ~> Boolean -> Boolean
  function Boolean$prototype$lte(other) {
    return typeof this === 'object' ?
      lte (this.valueOf (), other.valueOf ()) :
      this === false || other === true;
  }

  //  Number$prototype$equals :: Number ~> Number -> Boolean
  function Number$prototype$equals(other) {
    return typeof this === 'object' ?
      equals (this.valueOf (), other.valueOf ()) :
      isNaN (this) && isNaN (other) || this === other;
  }

  //  Number$prototype$lte :: Number ~> Number -> Boolean
  function Number$prototype$lte(other) {
    return typeof this === 'object' ?
      lte (this.valueOf (), other.valueOf ()) :
      isNaN (this) || this <= other;
  }

  //  Date$prototype$equals :: Date ~> Date -> Boolean
  function Date$prototype$equals(other) {
    return equals (this.valueOf (), other.valueOf ());
  }

  //  Date$prototype$lte :: Date ~> Date -> Boolean
  function Date$prototype$lte(other) {
    return lte (this.valueOf (), other.valueOf ());
  }

  //  RegExp$prototype$equals :: RegExp ~> RegExp -> Boolean
  function RegExp$prototype$equals(other) {
    return other.source === this.source &&
           other.global === this.global &&
           other.ignoreCase === this.ignoreCase &&
           other.multiline === this.multiline &&
           other.sticky === this.sticky &&
           other.unicode === this.unicode;
  }

  //  String$empty :: () -> String
  function String$empty() {
    return '';
  }

  //  String$prototype$equals :: String ~> String -> Boolean
  function String$prototype$equals(other) {
    return typeof this === 'object' ?
      equals (this.valueOf (), other.valueOf ()) :
      this === other;
  }

  //  String$prototype$lte :: String ~> String -> Boolean
  function String$prototype$lte(other) {
    return typeof this === 'object' ?
      lte (this.valueOf (), other.valueOf ()) :
      this <= other;
  }

  //  String$prototype$concat :: String ~> String -> String
  function String$prototype$concat(other) {
    return this + other;
  }

  //  Array$empty :: () -> Array a
  function Array$empty() {
    return [];
  }

  //  Array$of :: a -> Array a
  function Array$of(x) {
    return [x];
  }

  //  Array$chainRec :: ((a -> c, b -> c, a) -> Array c, a) -> Array b
  function Array$chainRec(f, x) {
    var result = [];
    var nil = {};
    var todo = {head: x, tail: nil};
    while (todo !== nil) {
      var more = nil;
      var steps = f (iterationNext, iterationDone, todo.head);
      for (var idx = 0; idx < steps.length; idx += 1) {
        var step = steps[idx];
        if (step.done) {
          result.push (step.value);
        } else {
          more = {head: step.value, tail: more};
        }
      }
      todo = todo.tail;
      while (more !== nil) {
        todo = {head: more.head, tail: todo};
        more = more.tail;
      }
    }
    return result;
  }

  //  Array$zero :: () -> Array a
  function Array$zero() {
    return [];
  }

  //  Array$prototype$equals :: Array a ~> Array a -> Boolean
  function Array$prototype$equals(other) {
    if (other.length !== this.length) return false;
    for (var idx = 0; idx < this.length; idx += 1) {
      if (!(equals (this[idx], other[idx]))) return false;
    }
    return true;
  }

  //  Array$prototype$lte :: Array a ~> Array a -> Boolean
  function Array$prototype$lte(other) {
    for (var idx = 0; true; idx += 1) {
      if (idx === this.length) return true;
      if (idx === other.length) return false;
      if (!(equals (this[idx], other[idx]))) {
        return lte (this[idx], other[idx]);
      }
    }
  }

  //  Array$prototype$concat :: Array a ~> Array a -> Array a
  function Array$prototype$concat(other) {
    return this.concat (other);
  }

  //  Array$prototype$filter :: Array a ~> (a -> Boolean) -> Array a
  function Array$prototype$filter(pred) {
    return this.filter (function(x) { return pred (x); });
  }

  //  Array$prototype$map :: Array a ~> (a -> b) -> Array b
  function Array$prototype$map(f) {
    return this.map (function(x) { return f (x); });
  }

  //  Array$prototype$ap :: Array a ~> Array (a -> b) -> Array b
  function Array$prototype$ap(fs) {
    var result = [];
    for (var idx = 0; idx < fs.length; idx += 1) {
      for (var idx2 = 0; idx2 < this.length; idx2 += 1) {
        result.push (fs[idx] (this[idx2]));
      }
    }
    return result;
  }

  //  Array$prototype$chain :: Array a ~> (a -> Array b) -> Array b
  function Array$prototype$chain(f) {
    var result = [];
    for (var idx = 0; idx < this.length; idx += 1) {
      for (var idx2 = 0, xs = f (this[idx]); idx2 < xs.length; idx2 += 1) {
        result.push (xs[idx2]);
      }
    }
    return result;
  }

  //  Array$prototype$alt :: Array a ~> Array a -> Array a
  var Array$prototype$alt = Array$prototype$concat;

  //  Array$prototype$reduce :: Array a ~> ((b, a) -> b, b) -> b
  function Array$prototype$reduce(f, initial) {
    var acc = initial;
    for (var idx = 0; idx < this.length; idx += 1) acc = f (acc, this[idx]);
    return acc;
  }

  //  Array$prototype$traverse :: Applicative f => Array a ~> (TypeRep f, a -> f b) -> f (Array b)
  function Array$prototype$traverse(typeRep, f) {
    var xs = this;
    function go(idx, n) {
      switch (n) {
        case 0: return of (typeRep, []);
        case 2: return lift2 (pair, f (xs[idx]), f (xs[idx + 1]));
        default:
          var m = Math.floor (n / 4) * 2;
          return lift2 (concat_, go (idx, m), go (idx + m, n - m));
      }
    }
    return this.length % 2 === 1 ?
      lift2 (concat_, map (Array$of, f (this[0])), go (1, this.length - 1)) :
      go (0, this.length);
  }

  //  Array$prototype$extend :: Array a ~> (Array a -> b) -> Array b
  function Array$prototype$extend(f) {
    return this.map (function(_, idx, xs) { return f (xs.slice (idx)); });
  }

  //  Arguments$prototype$equals :: Arguments ~> Arguments -> Boolean
  function Arguments$prototype$equals(other) {
    return Array$prototype$equals.call (this, other);
  }

  //  Arguments$prototype$lte :: Arguments ~> Arguments -> Boolean
  function Arguments$prototype$lte(other) {
    return Array$prototype$lte.call (this, other);
  }

  //  Error$prototype$equals :: Error ~> Error -> Boolean
  function Error$prototype$equals(other) {
    return equals (this.name, other.name) &&
           equals (this.message, other.message);
  }

  //  Object$empty :: () -> StrMap a
  function Object$empty() {
    return {};
  }

  //  Object$zero :: () -> StrMap a
  function Object$zero() {
    return {};
  }

  //  Object$prototype$equals :: StrMap a ~> StrMap a -> Boolean
  function Object$prototype$equals(other) {
    var self = this;
    var keys = sortedKeys (this);
    return equals (keys, sortedKeys (other)) &&
           keys.every (function(k) { return equals (self[k], other[k]); });
  }

  //  Object$prototype$lte :: StrMap a ~> StrMap a -> Boolean
  function Object$prototype$lte(other) {
    var theseKeys = sortedKeys (this);
    var otherKeys = sortedKeys (other);
    while (true) {
      if (theseKeys.length === 0) return true;
      if (otherKeys.length === 0) return false;
      var k = theseKeys.shift ();
      var z = otherKeys.shift ();
      if (k < z) return true;
      if (k > z) return false;
      if (!(equals (this[k], other[k]))) return lte (this[k], other[k]);
    }
  }

  //  Object$prototype$concat :: StrMap a ~> StrMap a -> StrMap a
  function Object$prototype$concat(other) {
    var result = {};
    function assign(k) { result[k] = this[k]; }
    forEachKey (this, assign);
    forEachKey (other, assign);
    return result;
  }

  //  Object$prototype$filter :: StrMap a ~> (a -> Boolean) -> StrMap a
  function Object$prototype$filter(pred) {
    var result = {};
    forEachKey (this, function(k) {
      if (pred (this[k])) result[k] = this[k];
    });
    return result;
  }

  //  Object$prototype$map :: StrMap a ~> (a -> b) -> StrMap b
  function Object$prototype$map(f) {
    var result = {};
    forEachKey (this, function(k) { result[k] = f (this[k]); });
    return result;
  }

  //  Object$prototype$ap :: StrMap a ~> StrMap (a -> b) -> StrMap b
  function Object$prototype$ap(other) {
    var result = {};
    forEachKey (this, function(k) {
      if (has (k, other)) result[k] = other[k] (this[k]);
    });
    return result;
  }

  //  Object$prototype$alt :: StrMap a ~> StrMap a -> StrMap a
  var Object$prototype$alt = Object$prototype$concat;

  //  Object$prototype$reduce :: StrMap a ~> ((b, a) -> b, b) -> b
  function Object$prototype$reduce(f, initial) {
    var self = this;
    function reducer(acc, k) { return f (acc, self[k]); }
    return (sortedKeys (this)).reduce (reducer, initial);
  }

  //  Object$prototype$traverse :: Applicative f => StrMap a ~> (TypeRep f, a -> f b) -> f (StrMap b)
  function Object$prototype$traverse(typeRep, f) {
    var self = this;
    return (Object.keys (this)).reduce (function(applicative, k) {
      function set(o) {
        return function(v) {
          var singleton = {}; singleton[k] = v;
          return Object$prototype$concat.call (o, singleton);
        };
      }
      return lift2 (set, applicative, f (self[k]));
    }, of (typeRep, {}));
  }

  //  Function$id :: () -> a -> a
  function Function$id() {
    return identity;
  }

  //  Function$of :: b -> (a -> b)
  function Function$of(x) {
    return function(_) { return x; };
  }

  //  Function$chainRec :: ((a -> c, b -> c, a) -> (z -> c), a) -> (z -> b)
  function Function$chainRec(f, x) {
    return function(a) {
      var step = iterationNext (x);
      while (!step.done) {
        step = f (iterationNext, iterationDone, step.value) (a);
      }
      return step.value;
    };
  }

  //  Function$prototype$equals :: Function ~> Function -> Boolean
  function Function$prototype$equals(other) {
    return other === this;
  }

  //  Function$prototype$compose :: (a -> b) ~> (b -> c) -> (a -> c)
  function Function$prototype$compose(other) {
    var semigroupoid = this;
    return function(x) { return other (semigroupoid (x)); };
  }

  //  Function$prototype$map :: (a -> b) ~> (b -> c) -> (a -> c)
  function Function$prototype$map(f) {
    var functor = this;
    return function(x) { return f (functor (x)); };
  }

  //  Function$prototype$promap :: (b -> c) ~> (a -> b, c -> d) -> (a -> d)
  function Function$prototype$promap(f, g) {
    var profunctor = this;
    return function(x) { return g (profunctor (f (x))); };
  }

  //  Function$prototype$ap :: (a -> b) ~> (a -> b -> c) -> (a -> c)
  function Function$prototype$ap(f) {
    var apply = this;
    return function(x) { return f (x) (apply (x)); };
  }

  //  Function$prototype$chain :: (a -> b) ~> (b -> a -> c) -> (a -> c)
  function Function$prototype$chain(f) {
    var chain = this;
    return function(x) { return f (chain (x)) (x); };
  }

  //  Function$prototype$extend :: Semigroup a => (a -> b) ~> ((a -> b) -> c) -> (a -> c)
  function Function$prototype$extend(f) {
    var extend = this;
    return function(x) {
      return f (function(y) { return extend (concat (x, y)); });
    };
  }

  //  Function$prototype$contramap :: (b -> c) ~> (a -> b) -> (a -> c)
  function Function$prototype$contramap(f) {
    var contravariant = this;
    return function(x) { return contravariant (f (x)); };
  }

  /* eslint-disable key-spacing */
  var implementations = {
    Null: {
      'prototype': {
        'fantasy-land/equals':      Null$prototype$equals,
        'fantasy-land/lte':         Null$prototype$lte
      }
    },
    Undefined: {
      'prototype': {
        'fantasy-land/equals':      Undefined$prototype$equals,
        'fantasy-land/lte':         Undefined$prototype$lte
      }
    },
    Boolean: {
      'prototype': {
        'fantasy-land/equals':      Boolean$prototype$equals,
        'fantasy-land/lte':         Boolean$prototype$lte
      }
    },
    Number: {
      'prototype': {
        'fantasy-land/equals':      Number$prototype$equals,
        'fantasy-land/lte':         Number$prototype$lte
      }
    },
    Date: {
      'prototype': {
        'fantasy-land/equals':      Date$prototype$equals,
        'fantasy-land/lte':         Date$prototype$lte
      }
    },
    RegExp: {
      'prototype': {
        'fantasy-land/equals':      RegExp$prototype$equals
      }
    },
    String: {
      'fantasy-land/empty':         String$empty,
      'prototype': {
        'fantasy-land/equals':      String$prototype$equals,
        'fantasy-land/lte':         String$prototype$lte,
        'fantasy-land/concat':      String$prototype$concat
      }
    },
    Array: {
      'fantasy-land/empty':         Array$empty,
      'fantasy-land/of':            Array$of,
      'fantasy-land/chainRec':      Array$chainRec,
      'fantasy-land/zero':          Array$zero,
      'prototype': {
        'fantasy-land/equals':      Array$prototype$equals,
        'fantasy-land/lte':         Array$prototype$lte,
        'fantasy-land/concat':      Array$prototype$concat,
        'fantasy-land/filter':      Array$prototype$filter,
        'fantasy-land/map':         Array$prototype$map,
        'fantasy-land/ap':          Array$prototype$ap,
        'fantasy-land/chain':       Array$prototype$chain,
        'fantasy-land/alt':         Array$prototype$alt,
        'fantasy-land/reduce':      Array$prototype$reduce,
        'fantasy-land/traverse':    Array$prototype$traverse,
        'fantasy-land/extend':      Array$prototype$extend
      }
    },
    Arguments: {
      'prototype': {
        'fantasy-land/equals':      Arguments$prototype$equals,
        'fantasy-land/lte':         Arguments$prototype$lte
      }
    },
    Error: {
      'prototype': {
        'fantasy-land/equals':      Error$prototype$equals
      }
    },
    Object: {
      'fantasy-land/empty':         Object$empty,
      'fantasy-land/zero':          Object$zero,
      'prototype': {
        'fantasy-land/equals':      Object$prototype$equals,
        'fantasy-land/lte':         Object$prototype$lte,
        'fantasy-land/concat':      Object$prototype$concat,
        'fantasy-land/filter':      Object$prototype$filter,
        'fantasy-land/map':         Object$prototype$map,
        'fantasy-land/ap':          Object$prototype$ap,
        'fantasy-land/alt':         Object$prototype$alt,
        'fantasy-land/reduce':      Object$prototype$reduce,
        'fantasy-land/traverse':    Object$prototype$traverse
      }
    },
    Function: {
      'fantasy-land/id':            Function$id,
      'fantasy-land/of':            Function$of,
      'fantasy-land/chainRec':      Function$chainRec,
      'prototype': {
        'fantasy-land/equals':      Function$prototype$equals,
        'fantasy-land/compose':     Function$prototype$compose,
        'fantasy-land/map':         Function$prototype$map,
        'fantasy-land/promap':      Function$prototype$promap,
        'fantasy-land/ap':          Function$prototype$ap,
        'fantasy-land/chain':       Function$prototype$chain,
        'fantasy-land/extend':      Function$prototype$extend,
        'fantasy-land/contramap':   Function$prototype$contramap
      }
    }
  };
  /* eslint-enable key-spacing */

  //# equals :: (a, b) -> Boolean
  //.
  //. Returns `true` if its arguments are of the same type and equal according
  //. to the type's [`fantasy-land/equals`][] method; `false` otherwise.
  //.
  //. `fantasy-land/equals` implementations are provided for the following
  //. built-in types: Null, Undefined, Boolean, Number, Date, RegExp, String,
  //. Array, Arguments, Error, Object, and Function.
  //.
  //. The algorithm supports circular data structures. Two arrays are equal
  //. if they have the same index paths and for each path have equal values.
  //. Two arrays which represent `[1, [1, [1, [1, [1, ...]]]]]`, for example,
  //. are equal even if their internal structures differ. Two objects are equal
  //. if they have the same property paths and for each path have equal values.
  //.
  //. ```javascript
  //. > equals (0, -0)
  //. true
  //.
  //. > equals (NaN, NaN)
  //. true
  //.
  //. > equals (Cons (1, Cons (2, Nil)), Cons (1, Cons (2, Nil)))
  //. true
  //.
  //. > equals (Cons (1, Cons (2, Nil)), Cons (2, Cons (1, Nil)))
  //. false
  //. ```
  var equals = (function() {
    //  $pairs :: Array (Array2 Any Any)
    var $pairs = [];

    return function equals(x, y) {
      if (!(sameType (x, y))) return false;

      //  This algorithm for comparing circular data structures was
      //  suggested in <http://stackoverflow.com/a/40622794/312785>.
      if ($pairs.some (function(p) { return p[0] === x && p[1] === y; })) {
        return true;
      }

      $pairs.push ([x, y]);
      try {
        return Setoid.test (x) &&
               Setoid.test (y) &&
               Setoid.methods.equals (x) (y);
      } finally {
        $pairs.pop ();
      }
    };
  } ());

  //# lt :: (a, b) -> Boolean
  //.
  //. Returns `true` if its arguments are of the same type and the first is
  //. less than the second according to the type's [`fantasy-land/lte`][]
  //. method; `false` otherwise.
  //.
  //. This function is derived from [`lte`](#lte).
  //.
  //. See also [`gt`](#gt) and [`gte`](#gte).
  //.
  //. ```javascript
  //. > lt (0, 0)
  //. false
  //.
  //. > lt (0, 1)
  //. true
  //.
  //. > lt (1, 0)
  //. false
  //. ```
  function lt(x, y) {
    return sameType (x, y) && !(lte (y, x));
  }

  //# lte :: (a, b) -> Boolean
  //.
  //. Returns `true` if its arguments are of the same type and the first
  //. is less than or equal to the second according to the type's
  //. [`fantasy-land/lte`][] method; `false` otherwise.
  //.
  //. `fantasy-land/lte` implementations are provided for the following
  //. built-in types: Null, Undefined, Boolean, Number, Date, String, Array,
  //. Arguments, and Object.
  //.
  //. The algorithm supports circular data structures in the same manner as
  //. [`equals`](#equals).
  //.
  //. See also [`lt`](#lt), [`gt`](#gt), and [`gte`](#gte).
  //.
  //. ```javascript
  //. > lte (0, 0)
  //. true
  //.
  //. > lte (0, 1)
  //. true
  //.
  //. > lte (1, 0)
  //. false
  //. ```
  var lte = (function() {
    //  $pairs :: Array (Array2 Any Any)
    var $pairs = [];

    return function lte(x, y) {
      if (!(sameType (x, y))) return false;

      //  This algorithm for comparing circular data structures was
      //  suggested in <http://stackoverflow.com/a/40622794/312785>.
      if ($pairs.some (function(p) { return p[0] === x && p[1] === y; })) {
        return equals (x, y);
      }

      $pairs.push ([x, y]);
      try {
        return Ord.test (x) && Ord.test (y) && Ord.methods.lte (x) (y);
      } finally {
        $pairs.pop ();
      }
    };
  } ());

  //# gt :: (a, b) -> Boolean
  //.
  //. Returns `true` if its arguments are of the same type and the first is
  //. greater than the second according to the type's [`fantasy-land/lte`][]
  //. method; `false` otherwise.
  //.
  //. This function is derived from [`lte`](#lte).
  //.
  //. See also [`lt`](#lt) and [`gte`](#gte).
  //.
  //. ```javascript
  //. > gt (0, 0)
  //. false
  //.
  //. > gt (0, 1)
  //. false
  //.
  //. > gt (1, 0)
  //. true
  //. ```
  function gt(x, y) {
    return lt (y, x);
  }

  //# gte :: (a, b) -> Boolean
  //.
  //. Returns `true` if its arguments are of the same type and the first
  //. is greater than or equal to the second according to the type's
  //. [`fantasy-land/lte`][] method; `false` otherwise.
  //.
  //. This function is derived from [`lte`](#lte).
  //.
  //. See also [`lt`](#lt) and [`gt`](#gt).
  //.
  //. ```javascript
  //. > gte (0, 0)
  //. true
  //.
  //. > gte (0, 1)
  //. false
  //.
  //. > gte (1, 0)
  //. true
  //. ```
  function gte(x, y) {
    return lte (y, x);
  }

  //# min :: Ord a => (a, a) -> a
  //.
  //. Returns the smaller of its two arguments.
  //.
  //. This function is derived from [`lte`](#lte).
  //.
  //. See also [`max`](#max).
  //.
  //. ```javascript
  //. > min (10, 2)
  //. 2
  //.
  //. > min (new Date ('1999-12-31'), new Date ('2000-01-01'))
  //. new Date ('1999-12-31')
  //.
  //. > min ('10', '2')
  //. '10'
  //. ```
  function min(x, y) {
    return lte (x, y) ? x : y;
  }

  //# max :: Ord a => (a, a) -> a
  //.
  //. Returns the larger of its two arguments.
  //.
  //. This function is derived from [`lte`](#lte).
  //.
  //. See also [`min`](#min).
  //.
  //. ```javascript
  //. > max (10, 2)
  //. 10
  //.
  //. > max (new Date ('1999-12-31'), new Date ('2000-01-01'))
  //. new Date ('2000-01-01')
  //.
  //. > max ('10', '2')
  //. '2'
  //. ```
  function max(x, y) {
    return lte (x, y) ? y : x;
  }

  //# clamp :: Ord a => (a, a, a) -> a
  //.
  //. Takes a lower bound, an upper bound, and a value of the same type.
  //. Returns the value if it is within the bounds; the nearer bound otherwise.
  //.
  //. This function is derived from [`min`](#min) and [`max`](#max).
  //.
  //. ```javascript
  //. > clamp (0, 100, 42)
  //. 42
  //.
  //. > clamp (0, 100, -1)
  //. 0
  //.
  //. > clamp ('A', 'Z', '~')
  //. 'Z'
  //. ```
  function clamp(lower, upper, x) {
    return max (lower, min (upper, x));
  }

  //# compose :: Semigroupoid c => (c j k, c i j) -> c i k
  //.
  //. Function wrapper for [`fantasy-land/compose`][].
  //.
  //. `fantasy-land/compose` implementations are provided for the following
  //. built-in types: Function.
  //.
  //. ```javascript
  //. > compose (Math.sqrt, x => x + 1) (99)
  //. 10
  //. ```
  function compose(x, y) {
    return Semigroupoid.methods.compose (y) (x);
  }

  //# id :: Category c => TypeRep c -> c
  //.
  //. Function wrapper for [`fantasy-land/id`][].
  //.
  //. `fantasy-land/id` implementations are provided for the following
  //. built-in types: Function.
  //.
  //. ```javascript
  //. > id (Function) ('foo')
  //. 'foo'
  //. ```
  function id(typeRep) {
    return Category.methods.id (typeRep) ();
  }

  //# concat :: Semigroup a => (a, a) -> a
  //.
  //. Function wrapper for [`fantasy-land/concat`][].
  //.
  //. `fantasy-land/concat` implementations are provided for the following
  //. built-in types: String, Array, and Object.
  //.
  //. ```javascript
  //. > concat ('abc', 'def')
  //. 'abcdef'
  //.
  //. > concat ([1, 2, 3], [4, 5, 6])
  //. [1, 2, 3, 4, 5, 6]
  //.
  //. > concat ({x: 1, y: 2}, {y: 3, z: 4})
  //. {x: 1, y: 3, z: 4}
  //.
  //. > concat (Cons ('foo', Cons ('bar', Cons ('baz', Nil))), Cons ('quux', Nil))
  //. Cons ('foo', Cons ('bar', Cons ('baz', Cons ('quux', Nil))))
  //. ```
  function concat(x, y) {
    return Semigroup.methods.concat (x) (y);
  }

  //# empty :: Monoid m => TypeRep m -> m
  //.
  //. Function wrapper for [`fantasy-land/empty`][].
  //.
  //. `fantasy-land/empty` implementations are provided for the following
  //. built-in types: String, Array, and Object.
  //.
  //. ```javascript
  //. > empty (String)
  //. ''
  //.
  //. > empty (Array)
  //. []
  //.
  //. > empty (Object)
  //. {}
  //.
  //. > empty (List)
  //. Nil
  //. ```
  function empty(typeRep) {
    return Monoid.methods.empty (typeRep) ();
  }

  //# invert :: Group g => g -> g
  //.
  //. Function wrapper for [`fantasy-land/invert`][].
  //.
  //. ```javascript
  //. > invert (Sum (5))
  //. Sum (-5)
  //. ```
  function invert(group) {
    return Group.methods.invert (group) ();
  }

  //# filter :: Filterable f => (a -> Boolean, f a) -> f a
  //.
  //. Function wrapper for [`fantasy-land/filter`][]. Discards every element
  //. which does not satisfy the predicate.
  //.
  //. `fantasy-land/filter` implementations are provided for the following
  //. built-in types: Array and Object.
  //.
  //. See also [`reject`](#reject).
  //.
  //. ```javascript
  //. > filter (x => x % 2 == 1, [1, 2, 3])
  //. [1, 3]
  //.
  //. > filter (x => x % 2 == 1, {x: 1, y: 2, z: 3})
  //. {x: 1, z: 3}
  //.
  //. > filter (x => x % 2 == 1, Cons (1, Cons (2, Cons (3, Nil))))
  //. Cons (1, Cons (3, Nil))
  //.
  //. > filter (x => x % 2 == 1, Nothing)
  //. Nothing
  //.
  //. > filter (x => x % 2 == 1, Just (0))
  //. Nothing
  //.
  //. > filter (x => x % 2 == 1, Just (1))
  //. Just (1)
  //. ```
  function filter(pred, filterable) {
    return Filterable.methods.filter (filterable) (pred);
  }

  //# reject :: Filterable f => (a -> Boolean, f a) -> f a
  //.
  //. Discards every element which satisfies the predicate.
  //.
  //. This function is derived from [`filter`](#filter).
  //.
  //. ```javascript
  //. > reject (x => x % 2 == 1, [1, 2, 3])
  //. [2]
  //.
  //. > reject (x => x % 2 == 1, {x: 1, y: 2, z: 3})
  //. {y: 2}
  //.
  //. > reject (x => x % 2 == 1, Cons (1, Cons (2, Cons (3, Nil))))
  //. Cons (2, Nil)
  //.
  //. > reject (x => x % 2 == 1, Nothing)
  //. Nothing
  //.
  //. > reject (x => x % 2 == 1, Just (0))
  //. Just (0)
  //.
  //. > reject (x => x % 2 == 1, Just (1))
  //. Nothing
  //. ```
  function reject(pred, filterable) {
    return filter (function(x) { return !(pred (x)); }, filterable);
  }

  //# map :: Functor f => (a -> b, f a) -> f b
  //.
  //. Function wrapper for [`fantasy-land/map`][].
  //.
  //. `fantasy-land/map` implementations are provided for the following
  //. built-in types: Array, Object, and Function.
  //.
  //. ```javascript
  //. > map (Math.sqrt, [1, 4, 9])
  //. [1, 2, 3]
  //.
  //. > map (Math.sqrt, {x: 1, y: 4, z: 9})
  //. {x: 1, y: 2, z: 3}
  //.
  //. > map (Math.sqrt, s => s.length) ('Sanctuary')
  //. 3
  //.
  //. > map (Math.sqrt, Pair ('foo') (64))
  //. Pair ('foo') (8)
  //.
  //. > map (Math.sqrt, Nil)
  //. Nil
  //.
  //. > map (Math.sqrt, Cons (1, Cons (4, Cons (9, Nil))))
  //. Cons (1, Cons (2, Cons (3, Nil)))
  //. ```
  function map(f, functor) {
    return Functor.methods.map (functor) (f);
  }

  //# flip :: Functor f => (f (a -> b), a) -> f b
  //.
  //. Maps over the given functions, applying each to the given value.
  //.
  //. This function is derived from [`map`](#map).
  //.
  //. ```javascript
  //. > flip (x => y => x + y, '!') ('foo')
  //. 'foo!'
  //.
  //. > flip ([Math.floor, Math.ceil], 1.5)
  //. [1, 2]
  //.
  //. > flip ({floor: Math.floor, ceil: Math.ceil}, 1.5)
  //. {floor: 1, ceil: 2}
  //.
  //. > flip (Cons (Math.floor, Cons (Math.ceil, Nil)), 1.5)
  //. Cons (1, Cons (2, Nil))
  //. ```
  function flip(functor, x) {
    return Functor.methods.map (functor) (thrush (x));
  }

  //# bimap :: Bifunctor f => (a -> b, c -> d, f a c) -> f b d
  //.
  //. Function wrapper for [`fantasy-land/bimap`][].
  //.
  //. ```javascript
  //. > bimap (s => s.toUpperCase (), Math.sqrt, Pair ('foo') (64))
  //. Pair ('FOO') (8)
  //. ```
  function bimap(f, g, bifunctor) {
    return Bifunctor.methods.bimap (bifunctor) (f, g);
  }

  //# mapLeft :: Bifunctor f => (a -> b, f a c) -> f b c
  //.
  //. Maps the given function over the left side of a Bifunctor.
  //.
  //. ```javascript
  //. > mapLeft (Math.sqrt, Pair (64) (9))
  //. Pair (8) (9)
  //. ```
  function mapLeft(f, bifunctor) {
    return bimap (f, identity, bifunctor);
  }

  //# promap :: Profunctor p => (a -> b, c -> d, p b c) -> p a d
  //.
  //. Function wrapper for [`fantasy-land/promap`][].
  //.
  //. `fantasy-land/promap` implementations are provided for the following
  //. built-in types: Function.
  //.
  //. ```javascript
  //. > promap (Math.abs, x => x + 1, Math.sqrt) (-100)
  //. 11
  //. ```
  function promap(f, g, profunctor) {
    return Profunctor.methods.promap (profunctor) (f, g);
  }

  //# ap :: Apply f => (f (a -> b), f a) -> f b
  //.
  //. Function wrapper for [`fantasy-land/ap`][].
  //.
  //. `fantasy-land/ap` implementations are provided for the following
  //. built-in types: Array, Object, and Function.
  //.
  //. ```javascript
  //. > ap ([Math.sqrt, x => x * x], [1, 4, 9, 16, 25])
  //. [1, 2, 3, 4, 5, 1, 16, 81, 256, 625]
  //.
  //. > ap ({a: Math.sqrt, b: x => x * x}, {a: 16, b: 10, c: 1})
  //. {a: 4, b: 100}
  //.
  //. > ap (s => n => s.slice (0, n), s => Math.ceil (s.length / 2)) ('Haskell')
  //. 'Hask'
  //.
  //. > ap (Identity (Math.sqrt), Identity (64))
  //. Identity (8)
  //.
  //. > ap (Cons (Math.sqrt, Cons (x => x * x, Nil)), Cons (16, Cons (100, Nil)))
  //. Cons (4, Cons (10, Cons (256, Cons (10000, Nil))))
  //. ```
  function ap(applyF, applyX) {
    return Apply.methods.ap (applyX) (applyF);
  }

  //# lift2 :: Apply f => (a -> b -> c, f a, f b) -> f c
  //.
  //. Lifts `a -> b -> c` to `Apply f => f a -> f b -> f c` and returns the
  //. result of applying this to the given arguments.
  //.
  //. This function is derived from [`map`](#map) and [`ap`](#ap).
  //.
  //. See also [`lift3`](#lift3).
  //.
  //. ```javascript
  //. > lift2 (x => y => Math.pow (x, y), [10], [1, 2, 3])
  //. [10, 100, 1000]
  //.
  //. > lift2 (x => y => Math.pow (x, y), Identity (10), Identity (3))
  //. Identity (1000)
  //. ```
  function lift2(f, x, y) {
    return ap (map (f, x), y);
  }

  //# lift3 :: Apply f => (a -> b -> c -> d, f a, f b, f c) -> f d
  //.
  //. Lifts `a -> b -> c -> d` to `Apply f => f a -> f b -> f c -> f d` and
  //. returns the result of applying this to the given arguments.
  //.
  //. This function is derived from [`map`](#map) and [`ap`](#ap).
  //.
  //. See also [`lift2`](#lift2).
  //.
  //. ```javascript
  //. > lift3 (x => y => z => x + z + y,
  //. .        ['<', '['],
  //. .        ['>', ']'],
  //. .        ['foo', 'bar', 'baz'])
  //. [ '<foo>', '<bar>', '<baz>',
  //. . '<foo]', '<bar]', '<baz]',
  //. . '[foo>', '[bar>', '[baz>',
  //. . '[foo]', '[bar]', '[baz]' ]
  //.
  //. > lift3 (x => y => z => x + z + y,
  //. .        Identity ('<'),
  //. .        Identity ('>'),
  //. .        Identity ('baz'))
  //. Identity ('<baz>')
  //. ```
  function lift3(f, x, y, z) {
    return ap (ap (map (f, x), y), z);
  }

  //# apFirst :: Apply f => (f a, f b) -> f a
  //.
  //. Combines two effectful actions, keeping only the result of the first.
  //. Equivalent to Haskell's `(<*)` function.
  //.
  //. This function is derived from [`lift2`](#lift2).
  //.
  //. See also [`apSecond`](#apSecond).
  //.
  //. ```javascript
  //. > apFirst ([1, 2], [3, 4])
  //. [1, 1, 2, 2]
  //.
  //. > apFirst (Identity (1), Identity (2))
  //. Identity (1)
  //. ```
  function apFirst(x, y) {
    return lift2 (constant, x, y);
  }

  //# apSecond :: Apply f => (f a, f b) -> f b
  //.
  //. Combines two effectful actions, keeping only the result of the second.
  //. Equivalent to Haskell's `(*>)` function.
  //.
  //. This function is derived from [`lift2`](#lift2).
  //.
  //. See also [`apFirst`](#apFirst).
  //.
  //. ```javascript
  //. > apSecond ([1, 2], [3, 4])
  //. [3, 4, 3, 4]
  //.
  //. > apSecond (Identity (1), Identity (2))
  //. Identity (2)
  //. ```
  function apSecond(x, y) {
    return lift2 (constant (identity), x, y);
  }

  //# of :: Applicative f => (TypeRep f, a) -> f a
  //.
  //. Function wrapper for [`fantasy-land/of`][].
  //.
  //. `fantasy-land/of` implementations are provided for the following
  //. built-in types: Array and Function.
  //.
  //. ```javascript
  //. > of (Array, 42)
  //. [42]
  //.
  //. > of (Function, 42) (null)
  //. 42
  //.
  //. > of (List, 42)
  //. Cons (42, Nil)
  //. ```
  function of(typeRep, x) {
    return Applicative.methods.of (typeRep) (x);
  }

  //# append :: (Applicative f, Semigroup (f a)) => (a, f a) -> f a
  //.
  //. Returns the result of appending the first argument to the second.
  //.
  //. This function is derived from [`concat`](#concat) and [`of`](#of).
  //.
  //. See also [`prepend`](#prepend).
  //.
  //. ```javascript
  //. > append (3, [1, 2])
  //. [1, 2, 3]
  //.
  //. > append (3, Cons (1, Cons (2, Nil)))
  //. Cons (1, Cons (2, Cons (3, Nil)))
  //. ```
  function append(x, xs) {
    return concat (xs, of (xs.constructor, x));
  }

  //# prepend :: (Applicative f, Semigroup (f a)) => (a, f a) -> f a
  //.
  //. Returns the result of prepending the first argument to the second.
  //.
  //. This function is derived from [`concat`](#concat) and [`of`](#of).
  //.
  //. See also [`append`](#append).
  //.
  //. ```javascript
  //. > prepend (1, [2, 3])
  //. [1, 2, 3]
  //.
  //. > prepend (1, Cons (2, Cons (3, Nil)))
  //. Cons (1, Cons (2, Cons (3, Nil)))
  //. ```
  function prepend(x, xs) {
    return concat (of (xs.constructor, x), xs);
  }

  //# chain :: Chain m => (a -> m b, m a) -> m b
  //.
  //. Function wrapper for [`fantasy-land/chain`][].
  //.
  //. `fantasy-land/chain` implementations are provided for the following
  //. built-in types: Array and Function.
  //.
  //. ```javascript
  //. > chain (x => [x, x], [1, 2, 3])
  //. [1, 1, 2, 2, 3, 3]
  //.
  //. > chain (x => x % 2 == 1 ? of (List, x) : Nil,
  //. .        Cons (1, Cons (2, Cons (3, Nil))))
  //. Cons (1, Cons (3, Nil))
  //.
  //. > chain (n => s => s.slice (0, n),
  //. .        s => Math.ceil (s.length / 2))
  //. .       ('Haskell')
  //. 'Hask'
  //. ```
  function chain(f, chain_) {
    return Chain.methods.chain (chain_) (f);
  }

  //# join :: Chain m => m (m a) -> m a
  //.
  //. Removes one level of nesting from a nested monadic structure.
  //.
  //. This function is derived from [`chain`](#chain).
  //.
  //. ```javascript
  //. > join ([[1], [2], [3]])
  //. [1, 2, 3]
  //.
  //. > join ([[[1, 2, 3]]])
  //. [[1, 2, 3]]
  //.
  //. > join (Identity (Identity (1)))
  //. Identity (1)
  //. ```
  function join(chain_) {
    return chain (identity, chain_);
  }

  //# chainRec :: ChainRec m => (TypeRep m, (a -> c, b -> c, a) -> m c, a) -> m b
  //.
  //. Function wrapper for [`fantasy-land/chainRec`][].
  //.
  //. `fantasy-land/chainRec` implementations are provided for the following
  //. built-in types: Array.
  //.
  //. ```javascript
  //. > chainRec (
  //. .   Array,
  //. .   (next, done, s) => s.length == 2 ? [s + '!', s + '?'].map (done)
  //. .                                    : [s + 'o', s + 'n'].map (next),
  //. .   ''
  //. . )
  //. ['oo!', 'oo?', 'on!', 'on?', 'no!', 'no?', 'nn!', 'nn?']
  //. ```
  function chainRec(typeRep, f, x) {
    return ChainRec.methods.chainRec (typeRep) (f, x);
  }

  //# alt :: Alt f => (f a, f a) -> f a
  //.
  //. Function wrapper for [`fantasy-land/alt`][].
  //.
  //. `fantasy-land/alt` implementations are provided for the following
  //. built-in types: Array and Object.
  //.
  //. ```javascript
  //. > alt ([1, 2, 3], [4, 5, 6])
  //. [1, 2, 3, 4, 5, 6]
  //.
  //. > alt (Nothing, Nothing)
  //. Nothing
  //.
  //. > alt (Nothing, Just (1))
  //. Just (1)
  //.
  //. > alt (Just (2), Just (3))
  //. Just (2)
  //. ```
  function alt(x, y) {
    return Alt.methods.alt (x) (y);
  }

  //# zero :: Plus f => TypeRep f -> f a
  //.
  //. Function wrapper for [`fantasy-land/zero`][].
  //.
  //. `fantasy-land/zero` implementations are provided for the following
  //. built-in types: Array and Object.
  //.
  //. ```javascript
  //. > zero (Array)
  //. []
  //.
  //. > zero (Object)
  //. {}
  //.
  //. > zero (Maybe)
  //. Nothing
  //. ```
  function zero(typeRep) {
    return Plus.methods.zero (typeRep) ();
  }

  //# reduce :: Foldable f => ((b, a) -> b, b, f a) -> b
  //.
  //. Function wrapper for [`fantasy-land/reduce`][].
  //.
  //. `fantasy-land/reduce` implementations are provided for the following
  //. built-in types: Array and Object.
  //.
  //. ```javascript
  //. > reduce ((xs, x) => [x].concat (xs), [], [1, 2, 3])
  //. [3, 2, 1]
  //.
  //. > reduce (concat, '', Cons ('foo', Cons ('bar', Cons ('baz', Nil))))
  //. 'foobarbaz'
  //. ```
  function reduce(f, x, foldable) {
    return Foldable.methods.reduce (foldable) (f, x);
  }

  //# size :: Foldable f => f a -> Integer
  //.
  //. Returns the number of elements of the given structure.
  //.
  //. This function is derived from [`reduce`](#reduce).
  //.
  //. ```javascript
  //. > size ([])
  //. 0
  //.
  //. > size (['foo', 'bar', 'baz'])
  //. 3
  //.
  //. > size (Nil)
  //. 0
  //.
  //. > size (Cons ('foo', Cons ('bar', Cons ('baz', Nil))))
  //. 3
  //. ```
  function size(foldable) {
    //  Fast path for arrays.
    if (Array.isArray (foldable)) return foldable.length;
    return reduce (function(n, _) { return n + 1; }, 0, foldable);
  }

  //# all :: Foldable f => (a -> Boolean, f a) -> Boolean
  //.
  //. Returns `true` if all the elements of the structure satisfy the
  //. predicate; `false` otherwise.
  //.
  //. This function is derived from [`reduce`](#reduce).
  //.
  //. See also [`any`](#any) and [`none`](#none).
  //.
  //. ```javascript
  //. > all (Number.isInteger, [])
  //. true
  //.
  //. > all (Number.isInteger, [1, 2, 3])
  //. true
  //.
  //. > all (Number.isInteger, [0, 0.25, 0.5, 0.75, 1])
  //. false
  //. ```
  function all(pred, foldable) {
    //  Fast path for arrays.
    if (Array.isArray (foldable)) return foldable.every (unary (pred));
    return reduce (function(b, x) { return b && pred (x); }, true, foldable);
  }

  //# any :: Foldable f => (a -> Boolean, f a) -> Boolean
  //.
  //. Returns `true` if any element of the structure satisfies the predicate;
  //. `false` otherwise.
  //.
  //. This function is derived from [`reduce`](#reduce).
  //.
  //. See also [`all`](#all) and [`none`](#none).
  //.
  //. ```javascript
  //. > any (Number.isInteger, [])
  //. false
  //.
  //. > any (Number.isInteger, [1, 2, 3])
  //. true
  //.
  //. > any (Number.isInteger, [0, 0.25, 0.5, 0.75, 1])
  //. true
  //. ```
  function any(pred, foldable) {
    //  Fast path for arrays.
    if (Array.isArray (foldable)) return foldable.some (unary (pred));
    return reduce (function(b, x) { return b || pred (x); }, false, foldable);
  }

  //# none :: Foldable f => (a -> Boolean, f a) -> Boolean
  //.
  //. Returns `true` if none of the elements of the structure satisfies the
  //. predicate; `false` otherwise.
  //.
  //. This function is derived from [`any`](#any). `none (pred, foldable)` is
  //. equivalent to `!(any (pred, foldable))`.
  //.
  //. See also [`all`](#all).
  //.
  //. ```javascript
  //. > none (Number.isInteger, [])
  //. true
  //.
  //. > none (Number.isInteger, [0, 0.25, 0.5, 0.75, 1])
  //. false
  //. ```
  function none(pred, foldable) {
    return !(any (pred, foldable));
  }

  //# elem :: (Setoid a, Foldable f) => (a, f a) -> Boolean
  //.
  //. Takes a value and a structure and returns `true` if the
  //. value is an element of the structure; `false` otherwise.
  //.
  //. This function is derived from [`equals`](#equals) and
  //. [`reduce`](#reduce).
  //.
  //. ```javascript
  //. > elem ('c', ['a', 'b', 'c'])
  //. true
  //.
  //. > elem ('x', ['a', 'b', 'c'])
  //. false
  //.
  //. > elem (3, {x: 1, y: 2, z: 3})
  //. true
  //.
  //. > elem (8, {x: 1, y: 2, z: 3})
  //. false
  //.
  //. > elem (0, Just (0))
  //. true
  //.
  //. > elem (0, Just (1))
  //. false
  //.
  //. > elem (0, Nothing)
  //. false
  //. ```
  function elem(x, foldable) {
    return any (function(y) { return equals (x, y); }, foldable);
  }

  //# foldMap :: (Monoid m, Foldable f) => (TypeRep m, a -> m, f a) -> m
  //.
  //. Deconstructs a foldable by mapping every element to a monoid and
  //. concatenating the results.
  //.
  //. This function is derived from [`concat`](#concat), [`empty`](#empty),
  //. and [`reduce`](#reduce).
  //.
  //. ```javascript
  //. > foldMap (String, f => f.name, [Math.sin, Math.cos, Math.tan])
  //. 'sincostan'
  //. ```
  function foldMap(typeRep, f, foldable) {
    return reduce (function(monoid, x) { return concat (monoid, f (x)); },
                   empty (typeRep),
                   foldable);
  }

  //# reverse :: (Applicative f, Foldable f, Monoid (f a)) => f a -> f a
  //.
  //. Reverses the elements of the given structure.
  //.
  //. This function is derived from [`concat`](#concat), [`empty`](#empty),
  //. [`of`](#of), and [`reduce`](#reduce).
  //.
  //. ```javascript
  //. > reverse ([1, 2, 3])
  //. [3, 2, 1]
  //.
  //. > reverse (Cons (1, Cons (2, Cons (3, Nil))))
  //. Cons (3, Cons (2, Cons (1, Nil)))
  //. ```
  function reverse(foldable) {
    //  Fast path for arrays.
    if (Array.isArray (foldable)) return (foldable.slice ()).reverse ();
    var F = foldable.constructor;
    return reduce (function(xs, x) { return concat (of (F, x), xs); },
                   empty (F),
                   foldable);
  }

  //# sort :: (Ord a, Applicative f, Foldable f, Monoid (f a)) => f a -> f a
  //.
  //. Performs a [stable sort][] of the elements of the given structure,
  //. using [`lte`](#lte) for comparisons.
  //.
  //. This function is derived from [`lte`](#lte), [`concat`](#concat),
  //. [`empty`](#empty), [`of`](#of), and [`reduce`](#reduce).
  //.
  //. See also [`sortBy`](#sortBy).
  //.
  //. ```javascript
  //. > sort (['foo', 'bar', 'baz'])
  //. ['bar', 'baz', 'foo']
  //.
  //. > sort ([Just (2), Nothing, Just (1)])
  //. [Nothing, Just (1), Just (2)]
  //.
  //. > sort (Cons ('foo', Cons ('bar', Cons ('baz', Nil))))
  //. Cons ('bar', Cons ('baz', Cons ('foo', Nil)))
  //. ```
  function sort(foldable) {
    return sortBy (identity, foldable);
  }

  //# sortBy :: (Ord b, Applicative f, Foldable f, Monoid (f a)) => (a -> b, f a) -> f a
  //.
  //. Performs a [stable sort][] of the elements of the given structure,
  //. using [`lte`](#lte) to compare the values produced by applying the
  //. given function to each element of the structure.
  //.
  //. This function is derived from [`lte`](#lte), [`concat`](#concat),
  //. [`empty`](#empty), [`of`](#of), and [`reduce`](#reduce).
  //.
  //. See also [`sort`](#sort).
  //.
  //. ```javascript
  //. > sortBy (s => s.length, ['red', 'green', 'blue'])
  //. ['red', 'blue', 'green']
  //.
  //. > sortBy (s => s.length, ['black', 'white'])
  //. ['black', 'white']
  //.
  //. > sortBy (s => s.length, ['white', 'black'])
  //. ['white', 'black']
  //.
  //. > sortBy (s => s.length, Cons ('red', Cons ('green', Cons ('blue', Nil))))
  //. Cons ('red', Cons ('blue', Cons ('green', Nil)))
  //. ```
  function sortBy(f, foldable) {
    var rs = reduce (function(rs, x) {
      rs.push ({idx: rs.length, x: x, fx: f (x)});
      return rs;
    }, [], foldable);

    var lte_ = (function(r) {
      switch (typeof (r && r.fx)) {
        case 'number':  return function(x, y) { return x <= y || x !== x; };
        case 'string':  return function(x, y) { return x <= y; };
        default:        return lte;
      }
    } (rs[0]));

    rs.sort (function(a, b) {
      return lte_ (a.fx, b.fx) ? lte_ (b.fx, a.fx) ? a.idx - b.idx : -1 : 1;
    });

    if (Array.isArray (foldable)) {
      for (var idx = 0; idx < rs.length; idx += 1) rs[idx] = rs[idx].x;
      return rs;
    }

    var F = foldable.constructor;
    var result = empty (F);
    for (idx = 0; idx < rs.length; idx += 1) {
      result = concat (result, of (F, rs[idx].x));
    }
    return result;
  }

  //# traverse :: (Applicative f, Traversable t) => (TypeRep f, a -> f b, t a) -> f (t b)
  //.
  //. Function wrapper for [`fantasy-land/traverse`][].
  //.
  //. `fantasy-land/traverse` implementations are provided for the following
  //. built-in types: Array and Object.
  //.
  //. See also [`sequence`](#sequence).
  //.
  //. ```javascript
  //. > traverse (Array, x => x, [[1, 2, 3], [4, 5]])
  //. [[1, 4], [1, 5], [2, 4], [2, 5], [3, 4], [3, 5]]
  //.
  //. > traverse (Identity, x => Identity (x + 1), [1, 2, 3])
  //. Identity ([2, 3, 4])
  //. ```
  function traverse(typeRep, f, traversable) {
    return Traversable.methods.traverse (traversable) (typeRep, f);
  }

  //# sequence :: (Applicative f, Traversable t) => (TypeRep f, t (f a)) -> f (t a)
  //.
  //. Inverts the given `t (f a)` to produce an `f (t a)`.
  //.
  //. This function is derived from [`traverse`](#traverse).
  //.
  //. ```javascript
  //. > sequence (Array, Identity ([1, 2, 3]))
  //. [Identity (1), Identity (2), Identity (3)]
  //.
  //. > sequence (Identity, [Identity (1), Identity (2), Identity (3)])
  //. Identity ([1, 2, 3])
  //. ```
  function sequence(typeRep, traversable) {
    return traverse (typeRep, identity, traversable);
  }

  //# extend :: Extend w => (w a -> b, w a) -> w b
  //.
  //. Function wrapper for [`fantasy-land/extend`][].
  //.
  //. `fantasy-land/extend` implementations are provided for the following
  //. built-in types: Array and Function.
  //.
  //. ```javascript
  //. > extend (ss => ss.join (''), ['x', 'y', 'z'])
  //. ['xyz', 'yz', 'z']
  //.
  //. > extend (f => f ([3, 4]), reverse) ([1, 2])
  //. [4, 3, 2, 1]
  //. ```
  function extend(f, extend_) {
    return Extend.methods.extend (extend_) (f);
  }

  //# duplicate :: Extend w => w a -> w (w a)
  //.
  //. Adds one level of nesting to a comonadic structure.
  //.
  //. This function is derived from [`extend`](#extend).
  //.
  //. ```javascript
  //. > duplicate (Identity (1))
  //. Identity (Identity (1))
  //.
  //. > duplicate ([1])
  //. [[1]]
  //.
  //. > duplicate ([1, 2, 3])
  //. [[1, 2, 3], [2, 3], [3]]
  //.
  //. > duplicate (reverse) ([1, 2]) ([3, 4])
  //. [4, 3, 2, 1]
  //. ```
  function duplicate(extend_) {
    return extend (identity, extend_);
  }

  //# extract :: Comonad w => w a -> a
  //.
  //. Function wrapper for [`fantasy-land/extract`][].
  //.
  //. ```javascript
  //. > extract (Identity (42))
  //. 42
  //. ```
  function extract(comonad) {
    return Comonad.methods.extract (comonad) ();
  }

  //# contramap :: Contravariant f => (b -> a, f a) -> f b
  //.
  //. Function wrapper for [`fantasy-land/contramap`][].
  //.
  //. `fantasy-land/contramap` implementations are provided for the following
  //. built-in types: Function.
  //.
  //. ```javascript
  //. > contramap (s => s.length, Math.sqrt) ('Sanctuary')
  //. 3
  //. ```
  function contramap(f, contravariant) {
    return Contravariant.methods.contramap (contravariant) (f);
  }

  return {
    TypeClass: TypeClass,
    Setoid: Setoid,
    Ord: Ord,
    Semigroupoid: Semigroupoid,
    Category: Category,
    Semigroup: Semigroup,
    Monoid: Monoid,
    Group: Group,
    Filterable: Filterable,
    Functor: Functor,
    Bifunctor: Bifunctor,
    Profunctor: Profunctor,
    Apply: Apply,
    Applicative: Applicative,
    Chain: Chain,
    ChainRec: ChainRec,
    Monad: Monad,
    Alt: Alt,
    Plus: Plus,
    Alternative: Alternative,
    Foldable: Foldable,
    Traversable: Traversable,
    Extend: Extend,
    Comonad: Comonad,
    Contravariant: Contravariant,
    equals: equals,
    lt: lt,
    lte: lte,
    gt: gt,
    gte: gte,
    min: min,
    max: max,
    clamp: clamp,
    compose: compose,
    id: id,
    concat: concat,
    empty: empty,
    invert: invert,
    filter: filter,
    reject: reject,
    map: map,
    flip: flip,
    bimap: bimap,
    mapLeft: mapLeft,
    promap: promap,
    ap: ap,
    lift2: lift2,
    lift3: lift3,
    apFirst: apFirst,
    apSecond: apSecond,
    of: of,
    append: append,
    prepend: prepend,
    chain: chain,
    join: join,
    chainRec: chainRec,
    alt: alt,
    zero: zero,
    reduce: reduce,
    size: size,
    all: all,
    any: any,
    none: none,
    elem: elem,
    foldMap: foldMap,
    reverse: reverse,
    sort: sort,
    sortBy: sortBy,
    traverse: traverse,
    sequence: sequence,
    extend: extend,
    duplicate: duplicate,
    extract: extract,
    contramap: contramap
  };

}));

//. [Alt]:                      v:fantasyland/fantasy-land#alt
//. [Alternative]:              v:fantasyland/fantasy-land#alternative
//. [Applicative]:              v:fantasyland/fantasy-land#applicative
//. [Apply]:                    v:fantasyland/fantasy-land#apply
//. [Bifunctor]:                v:fantasyland/fantasy-land#bifunctor
//. [Category]:                 v:fantasyland/fantasy-land#category
//. [Chain]:                    v:fantasyland/fantasy-land#chain
//. [ChainRec]:                 v:fantasyland/fantasy-land#chainrec
//. [Comonad]:                  v:fantasyland/fantasy-land#comonad
//. [Contravariant]:            v:fantasyland/fantasy-land#contravariant
//. [Extend]:                   v:fantasyland/fantasy-land#extend
//. [FL]:                       v:fantasyland/fantasy-land
//. [Filterable]:               v:fantasyland/fantasy-land#filterable
//. [Foldable]:                 v:fantasyland/fantasy-land#foldable
//. [Functor]:                  v:fantasyland/fantasy-land#functor
//. [Group]:                    v:fantasyland/fantasy-land#group
//. [Monad]:                    v:fantasyland/fantasy-land#monad
//. [Monoid]:                   v:fantasyland/fantasy-land#monoid
//. [Ord]:                      v:fantasyland/fantasy-land#ord
//. [Plus]:                     v:fantasyland/fantasy-land#plus
//. [Profunctor]:               v:fantasyland/fantasy-land#profunctor
//. [Semigroup]:                v:fantasyland/fantasy-land#semigroup
//. [Semigroupoid]:             v:fantasyland/fantasy-land#semigroupoid
//. [Setoid]:                   v:fantasyland/fantasy-land#setoid
//. [Traversable]:              v:fantasyland/fantasy-land#traversable
//. [`fantasy-land/alt`]:       v:fantasyland/fantasy-land#alt-method
//. [`fantasy-land/ap`]:        v:fantasyland/fantasy-land#ap-method
//. [`fantasy-land/bimap`]:     v:fantasyland/fantasy-land#bimap-method
//. [`fantasy-land/chain`]:     v:fantasyland/fantasy-land#chain-method
//. [`fantasy-land/chainRec`]:  v:fantasyland/fantasy-land#chainrec-method
//. [`fantasy-land/compose`]:   v:fantasyland/fantasy-land#compose-method
//. [`fantasy-land/concat`]:    v:fantasyland/fantasy-land#concat-method
//. [`fantasy-land/contramap`]: v:fantasyland/fantasy-land#contramap-method
//. [`fantasy-land/empty`]:     v:fantasyland/fantasy-land#empty-method
//. [`fantasy-land/equals`]:    v:fantasyland/fantasy-land#equals-method
//. [`fantasy-land/extend`]:    v:fantasyland/fantasy-land#extend-method
//. [`fantasy-land/extract`]:   v:fantasyland/fantasy-land#extract-method
//. [`fantasy-land/filter`]:    v:fantasyland/fantasy-land#filter-method
//. [`fantasy-land/id`]:        v:fantasyland/fantasy-land#id-method
//. [`fantasy-land/invert`]:    v:fantasyland/fantasy-land#invert-method
//. [`fantasy-land/lte`]:       v:fantasyland/fantasy-land#lte-method
//. [`fantasy-land/map`]:       v:fantasyland/fantasy-land#map-method
//. [`fantasy-land/of`]:        v:fantasyland/fantasy-land#of-method
//. [`fantasy-land/promap`]:    v:fantasyland/fantasy-land#promap-method
//. [`fantasy-land/reduce`]:    v:fantasyland/fantasy-land#reduce-method
//. [`fantasy-land/traverse`]:  v:fantasyland/fantasy-land#traverse-method
//. [`fantasy-land/zero`]:      v:fantasyland/fantasy-land#zero-method
//. [stable sort]:              https://en.wikipedia.org/wiki/Sorting_algorithm#Stability
//. [type-classes]:             https://github.com/sanctuary-js/sanctuary-def#type-classes
  })();
});

require.register("sanctuary-type-identifiers/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "sanctuary-type-identifiers");
  (function() {
    /*
        @@@@@@@            @@@@@@@         @@
      @@       @@        @@       @@      @@@
    @@   @@@ @@  @@    @@   @@@ @@  @@   @@@@@@ @@   @@@  @@ @@@      @@@@
   @@  @@   @@@   @@  @@  @@   @@@   @@   @@@   @@   @@@  @@@   @@  @@@   @@
   @@  @@   @@@   @@  @@  @@   @@@   @@   @@@   @@   @@@  @@@   @@  @@@@@@@@
   @@  @@   @@@  @@   @@  @@   @@@  @@    @@@   @@   @@@  @@@   @@  @@@
    @@   @@@ @@@@@     @@   @@@ @@@@@      @@@    @@@ @@  @@@@@@      @@@@@
      @@                 @@                           @@  @@
        @@@@@@@            @@@@@@@               @@@@@    @@
                                                          */
//. # sanctuary-type-identifiers
//.
//. A type is a set of values. Boolean, for example, is the type comprising
//. `true` and `false`. A value may be a member of multiple types (`42` is a
//. member of Number, PositiveNumber, Integer, and many other types).
//.
//. In certain situations it is useful to divide JavaScript values into
//. non-overlapping types. The language provides two constructs for this
//. purpose: the [`typeof`][1] operator and [`Object.prototype.toString`][2].
//. Each has pros and cons, but neither supports user-defined types.
//.
//. sanctuary-type-identifiers comprises:
//.
//.   - an npm and browser -compatible package for deriving the
//.     _type identifier_ of a JavaScript value; and
//.   - a specification which authors may follow to specify type
//.     identifiers for their types.
//.
//. ### Specification
//.
//. For a type to be compatible with the algorithm:
//.
//.   - every member of the type MUST have a `constructor` property
//.     pointing to an object known as the _type representative_;
//.
//.   - the type representative MUST have a `@@type` property
//.     (the _type identifier_); and
//.
//.   - the type identifier MUST be a string primitive and SHOULD have
//.     format `'<namespace>/<name>[@<version>]'`, where:
//.
//.       - `<namespace>` MUST consist of one or more characters, and
//.         SHOULD equal the name of the npm package which defines the
//.         type (including [scope][3] where appropriate);
//.
//.       - `<name>` MUST consist of one or more characters, and SHOULD
//.         be the unique name of the type; and
//.
//.       - `<version>` MUST consist of one or more digits, and SHOULD
//.         represent the version of the type.
//.
//. If the type identifier does not conform to the format specified above,
//. it is assumed that the entire string represents the _name_ of the type;
//. _namespace_ will be `null` and _version_ will be `0`.
//.
//. If the _version_ is not given, it is assumed to be `0`.
//.
//. For example:
//.
//. ```javascript
//. //  Identity :: a -> Identity a
//. function Identity(x) {
//.   if (!(this instanceof Identity)) return new Identity(x);
//.   this.value = x;
//. }
//.
//. Identity['@@type'] = 'my-package/Identity';
//. ```
//.
//. Note that by using a constructor function the `constructor` property is set
//. implicitly for each value created. Constructor functions are convenient for
//. this reason, but are not required. This definition is also valid:
//.
//. ```javascript
//. //  IdentityTypeRep :: TypeRep Identity
//. var IdentityTypeRep = {
//.   '@@type': 'my-package/Identity'
//. };
//.
//. //  Identity :: a -> Identity a
//. function Identity(x) {
//.   return {constructor: IdentityTypeRep, value: x};
//. }
//. ```

(function(f) {

  'use strict';

  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = f();
  } else if (typeof define === 'function' && define.amd != null) {
    define([], f);
  } else {
    self.sanctuaryTypeIdentifiers = f();
  }

}(function() {

  'use strict';

  //  $$type :: String
  var $$type = '@@type';

  //  pattern :: RegExp
  var pattern = new RegExp(
    '^'
  + '([\\s\\S]+)'   //  <namespace>
  + '/'             //  SOLIDUS (U+002F)
  + '([\\s\\S]+?)'  //  <name>
  + '(?:'           //  optional non-capturing group {
  +   '@'           //    COMMERCIAL AT (U+0040)
  +   '([0-9]+)'    //    <version>
  + ')?'            //  }
  + '$'
  );

  //. ### Usage
  //.
  //. ```javascript
  //. const type = require('sanctuary-type-identifiers');
  //. ```
  //.
  //. ```javascript
  //. > function Identity(x) {
  //. .   if (!(this instanceof Identity)) return new Identity(x);
  //. .   this.value = x;
  //. . }
  //. . Identity['@@type'] = 'my-package/Identity@1';
  //.
  //. > type.parse(type(Identity(0)))
  //. {namespace: 'my-package', name: 'Identity', version: 1}
  //. ```
  //.
  //. ### API
  //.
  //# type :: Any -> String
  //.
  //. Takes any value and returns a string which identifies its type. If the
  //. value conforms to the [specification][4], the custom type identifier is
  //. returned.
  //.
  //. ```javascript
  //. > type(null)
  //. 'Null'
  //.
  //. > type(true)
  //. 'Boolean'
  //.
  //. > type(Identity(0))
  //. 'my-package/Identity@1'
  //. ```
  function type(x) {
    return x != null &&
           x.constructor != null &&
           x.constructor.prototype !== x &&
           typeof x.constructor[$$type] === 'string' ?
      x.constructor[$$type] :
      Object.prototype.toString.call(x).slice('[object '.length, -']'.length);
  }

  //# type.parse :: String -> { namespace :: Nullable String, name :: String, version :: Number }
  //.
  //. Takes any string and parses it according to the [specification][4],
  //. returning an object with `namespace`, `name`, and `version` fields.
  //.
  //. ```javascript
  //. > type.parse('my-package/List@2')
  //. {namespace: 'my-package', name: 'List', version: 2}
  //.
  //. > type.parse('nonsense!')
  //. {namespace: null, name: 'nonsense!', version: 0}
  //.
  //. > type.parse(Identity['@@type'])
  //. {namespace: 'my-package', name: 'Identity', version: 1}
  //. ```
  type.parse = function parse(s) {
    var groups = pattern.exec(s);
    return {
      namespace: groups == null || groups[1] == null ? null : groups[1],
      name:      groups == null                      ? s    : groups[2],
      version:   groups == null || groups[3] == null ? 0    : Number(groups[3])
    };
  };

  return type;

}));

//. [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
//. [2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString
//. [3]: https://docs.npmjs.com/misc/scope
//. [4]: #specification
  })();
});

require.register(".pnpm/registry.npmjs.org/process/0.11.10/node_modules/process/browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, ".pnpm/registry.npmjs.org/process/0.11.10/node_modules/process");
  (function() {
    // shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };
  })();
});

require.register("daggy/src/daggy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "daggy");
  (function() {
    (function(f) {

  'use strict';

  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = f(require('sanctuary-type-classes'),
                       require('sanctuary-type-identifiers'));
  } else if (typeof define === 'function' && define.amd != null) {
    define(['sanctuary-type-classes',
            'sanctuary-type-identifiers'],
           f);
  } else {
    self.daggy = f(self.sanctuaryTypeClasses,
                   self.sanctuaryTypeIdentifiers);
  }

}(function(Z, type) {

  'use strict';

  // Names of prop used to store:
  // * name of variant of a sum type
  var TAG = '@@tag';
  // * array of arguments used to create a value (to speed up `cata`)
  var VALUES = '@@values';
  // * `@@type` of its returned results
  var TYPE = '@@type';
  // * `@@type` of variant constructor's returned results
  var RET_TYPE = '@@ret_type';
  // * names of all variants of a sum type
  var TAGS = '@@tags';

  function tagged(typeName, fields) {
    var proto = {toString: tagged$toString};
    // this way we avoid named function
    var typeRep = makeConstructor(fields, proto);
    typeRep.toString = typeRepToString;
    typeRep.prototype = proto;
    typeRep.is = isType(typeName);
    typeRep.from = makeConstructorFromObject(fields, proto);
    typeRep[TYPE] = typeName;
    proto.constructor = typeRep;
    return typeRep;
  }

  function taggedSum(typeName, constructors) {
    var proto = {cata: sum$cata, toString: sum$toString};
    var tags = Object.keys(constructors);
    var typeRep = proto.constructor = {
      toString: typeRepToString,
      prototype: proto,
      is: isType(typeName),
      '@@type': typeName,
      '@@tags': tags
    };
    tags.forEach(function(tag) {
      var fields = constructors[tag];
      var tagProto = Object.create(proto);
      defProp(tagProto, TAG, tag);
      if (fields.length === 0) {
        typeRep[tag] = makeValue(fields, tagProto, [], 0);
        typeRep[tag].is = sum$isUnit(typeRep[tag]);
        return;
      }
      typeRep[tag] = makeConstructor(fields, tagProto);
      typeRep[tag].is = sum$isVariant(typeRep[tag]);
      typeRep[tag][TAG] = tag;
      typeRep[tag][RET_TYPE] = typeName;
      typeRep[tag].toString = sum$ctrToString;
      typeRep[tag].from = makeConstructorFromObject(fields, tagProto);
    });
    return typeRep;
  }

  function sum$cata(fs) {
    var tags = this.constructor[TAGS];
    var tag;
    for (var idx = 0; idx < tags.length; idx += 1) {
      tag = tags[idx];
      if (!fs[tag]) {
        throw new TypeError(
          "Constructors given to cata didn't include: " + tag
        );
      }
    }
    return fs[this[TAG]].apply(fs, this[VALUES]);
  }

  function sum$ctrToString() {
    return this[RET_TYPE] + '.' + this[TAG];
  }

  function sum$toString() {
    return this.constructor[TYPE] + '.' +
           this[TAG] + arrToString(this[VALUES]);
  }

  function typeRepToString() {
    return this[TYPE];
  }

  function tagged$toString() {
    return this.constructor[TYPE] + arrToString(this[VALUES]);
  }

  function sum$isVariant(variant) {
    return function $sum$isVariant(val) {
      return Boolean(val) &&
        variant[TAG] === val[TAG] &&
        variant[RET_TYPE] === type(val);
    };
  }

  function sum$isUnit(unit) {
    return function $sum$isUnit(val) {
      return unit === val || Boolean(val) &&
        unit[TAG] === val[TAG] &&
        type(unit) === type(val);
    };
  }

  function isType(typeName) {
    return function $isType(val) {
      return typeName === type(val);
    };
  }

  function makeValue(fields, proto, values, argumentsLength) {
    if (argumentsLength !== fields.length) {
      throw new TypeError(
        'Expected ' + fields.length + ' arguments, got ' + argumentsLength
      );
    }
    var obj = Object.create(proto);
    defProp(obj, VALUES, values);
    for (var idx = 0; idx < fields.length; idx += 1) {
      obj[fields[idx]] = values[idx];
    }
    return obj;
  }

  // adopted version of withValue from  https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
  function defProp(obj, prop, val) {
    var desc = defProp.desc || (
      defProp.desc = {
        enumerable: false,
        writable: false,
        configurable: false,
        value: null
      }
    );
    desc.value = val;
    Object.defineProperty(obj, prop, desc);
  }

  // optimised version of `arr.map(toString).join(', ')`
  function arrToString(arr) {
    if (arr.length === 0) return '';
    var str = '(' + Z.toString(arr[0]);
    for (var idx = 1; idx < arr.length; idx += 1) {
      str = str + ', ' + Z.toString(arr[idx]);
    }
    return str + ')';
  }

  function makeConstructor(fields, proto) {
    switch (fields.length) {
      /* eslint-disable max-len */
      case  1: return function(a) { return makeValue(fields, proto, [a], arguments.length); };
      case  2: return function(a, b) { return makeValue(fields, proto, [a, b], arguments.length); };
      case  3: return function(a, b, c) { return makeValue(fields, proto, [a, b, c], arguments.length); };
      case  4: return function(a, b, c, d) { return makeValue(fields, proto, [a, b, c, d], arguments.length); };
      case  5: return function(a, b, c, d, e) { return makeValue(fields, proto, [a, b, c, d, e], arguments.length); };
      case  6: return function(a, b, c, d, e, f) { return makeValue(fields, proto, [a, b, c, d, e, f], arguments.length); };
      case  7: return function(a, b, c, d, e, f, g) { return makeValue(fields, proto, [a, b, c, d, e, f, g], arguments.length); };
      case  8: return function(a, b, c, d, e, f, g, h) { return makeValue(fields, proto, [a, b, c, d, e, f, g, h], arguments.length); };
      case  9: return function(a, b, c, d, e, f, g, h, i) { return makeValue(fields, proto, [a, b, c, d, e, f, g, h, i], arguments.length); };
      case 10: return function(a, b, c, d, e, f, g, h, i, j) { return makeValue(fields, proto, [a, b, c, d, e, f, g, h, i, j], arguments.length); };
      /* eslint-enable max-len */
      default: return Object.defineProperty(
        function() {
          return makeValue(fields, proto, arguments, arguments.length);
        },
        'length',
        {value: fields.length}
      );
    }
  }

  function makeConstructorFromObject(fields, proto) {
    return function(obj) {
      var values = [];
      for (var idx = 0; idx < fields.length; idx += 1) {
        var field = fields[idx];
        if (!Object.prototype.hasOwnProperty.call(obj, field)) {
          throw new TypeError('Missing field: ' + field);
        }
        values.push(obj[field]);
      }
      return makeValue(fields, proto, values, values.length);
    };
  }

  return {tagged: tagged, taggedSum: taggedSum};

}));
  })();
});

require.register("data.either/lib/either.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "data.either");
  (function() {
    // Copyright (c) 2013-2014 Quildreen Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * @module lib/either
 */
module.exports = Either

// -- Aliases ----------------------------------------------------------
var clone         = Object.create
var unimplemented = function(){ throw new Error('Not implemented.') }
var noop          = function(){ return this                         }


// -- Implementation ---------------------------------------------------

/**
 * The `Either(a, b)` structure represents the logical disjunction between `a`
 * and `b`. In other words, `Either` may contain either a value of type `a` or
 * a value of type `b`, at any given time. This particular implementation is
 * biased on the right value (`b`), thus projections will take the right value
 * over the left one.
 *
 * This class models two different cases: `Left a` and `Right b`, and can hold
 * one of the cases at any given time. The projections are, none the less,
 * biased for the `Right` case, thus a common use case for this structure is to
 * hold the results of computations that may fail, when you want to store
 * additional information on the failure (instead of throwing an exception).
 *
 * Furthermore, the values of `Either(a, b)` can be combined and manipulated by
 * using the expressive monadic operations. This allows safely sequencing
 * operations that may fail, and safely composing values that you don't know
 * whether they're present or not, failing early (returning a `Left a`) if any
 * of the operations fail.
 *
 * While this class can certainly model input validations, the [Validation][]
 * structure lends itself better to that use case, since it can naturally
 * aggregate failures — monads shortcut on the first failure.
 *
 * [Validation]: https://github.com/folktale/data.validation
 *
 *
 * @class
 * @summary
 * Either[α, β] <: Applicative[β]
 *               , Functor[β]
 *               , Chain[β]
 *               , Show
 *               , Eq
 */
function Either() { }

Left.prototype = clone(Either.prototype)
function Left(a) {
  this.value = a
}

Right.prototype = clone(Either.prototype)
function Right(a) {
  this.value = a
}

// -- Constructors -----------------------------------------------------

/**
 * Constructs a new `Either[α, β]` structure holding a `Left` value. This
 * usually represents a failure due to the right-bias of this structure.
 *
 * @summary a → Either[α, β]
 */
Either.Left = function(a) {
  return new Left(a)
}
Either.prototype.Left = Either.Left

/**
 * Constructs a new `Either[α, β]` structure holding a `Right` value. This
 * usually represents a successful value due to the right bias of this
 * structure.
 *
 * @summary β → Either[α, β]
 */
Either.Right = function(a) {
  return new Right(a)
}
Either.prototype.Right = Either.Right


// -- Conversions ------------------------------------------------------

/**
 * Constructs a new `Either[α, β]` structure from a nullable type.
 *
 * Takes the `Left` case if the value is `null` or `undefined`. Takes the
 * `Right` case otherwise.
 *
 * @summary α → Either[α, α]
 */
Either.fromNullable = function(a) {
  return a != null?       new Right(a)
  :      /* otherwise */  new Left(a)
}
Either.prototype.fromNullable = Either.fromNullable

/**
 * Constructs a new `Either[α, β]` structure from a `Validation[α, β]` type.
 *
 * @summary Validation[α, β] → Either[α, β]
 */
Either.fromValidation = function(a) {
  return a.fold(Either.Left, Either.Right)
}

/**
 * Executes a synchronous computation that may throw and converts it to an
 * Either type.
 *
 * @summary (α₁, α₂, ..., αₙ -> β :: throws γ) -> (α₁, α₂, ..., αₙ -> Either[γ, β])
 */
Either.try = function(f) {
  return function() {
    try {
      return new Right(f.apply(null, arguments))
    } catch(e) {
      return new Left(e)
    }
  }
}


// -- Predicates -------------------------------------------------------

/**
 * True if the `Either[α, β]` contains a `Left` value.
 *
 * @summary Boolean
 */
Either.prototype.isLeft = false
Left.prototype.isLeft   = true

/**
 * True if the `Either[α, β]` contains a `Right` value.
 *
 * @summary Boolean
 */
Either.prototype.isRight = false
Right.prototype.isRight  = true


// -- Applicative ------------------------------------------------------

/**
 * Creates a new `Either[α, β]` instance holding the `Right` value `b`.
 *
 * `b` can be any value, including `null`, `undefined` or another
 * `Either[α, β]` structure.
 *
 * @summary β → Either[α, β]
 */
Either.of = function(a) {
  return new Right(a)
}
Either.prototype.of = Either.of


/**
 * Applies the function inside the `Right` case of the `Either[α, β]` structure
 * to another applicative type.
 *
 * The `Either[α, β]` should contain a function value, otherwise a `TypeError`
 * is thrown.
 *
 * @method
 * @summary (@Either[α, β → γ], f:Applicative[_]) => f[β] → f[γ]
 */
Either.prototype.ap = unimplemented

Left.prototype.ap = function(b) {
  return this
}

Right.prototype.ap = function(b) {
  return b.map(this.value)
}


// -- Functor ----------------------------------------------------------

/**
 * Transforms the `Right` value of the `Either[α, β]` structure using a regular
 * unary function.
 *
 * @method
 * @summary (@Either[α, β]) => (β → γ) → Either[α, γ]
 */
Either.prototype.map = unimplemented
Left.prototype.map   = noop

Right.prototype.map = function(f) {
  return this.of(f(this.value))
}


// -- Chain ------------------------------------------------------------

/**
 * Transforms the `Right` value of the `Either[α, β]` structure using an unary
 * function to monads.
 *
 * @method
 * @summary (@Either[α, β], m:Monad[_]) => (β → m[γ]) → m[γ]
 */
Either.prototype.chain = unimplemented
Left.prototype.chain   = noop

Right.prototype.chain = function(f) {
  return f(this.value)
}

// -- Semigroup ----------------------------------------------------------

/**
 * Concats the `Right` value of the `Either[α, β]` structure with another `Right` or keeps the `Left` on either side
 *
 * @method
 * @summary (@Either[α, m:Monoid]) => Either[β, m] → Either[α, m]
 */
Either.prototype.concat = unimplemented

Left.prototype.concat = function(other) {
  return this
}

Right.prototype.concat = function(other) {
  var that = this
  return other.fold(function(_){
                      return other
                    },
                    function(y) {
                      return that.Right(that.value.concat(y))
                    })
}


// -- Show -------------------------------------------------------------

/**
 * Returns a textual representation of the `Either[α, β]` structure.
 *
 * @method
 * @summary (@Either[α, β]) => Void → String
 */
Either.prototype.toString = unimplemented

Left.prototype.toString = function() {
  return 'Either.Left(' + this.value + ')'
}

Right.prototype.toString = function() {
  return 'Either.Right(' + this.value + ')'
}


// -- Eq ---------------------------------------------------------------

/**
 * Tests if an `Either[α, β]` structure is equal to another `Either[α, β]`
 * structure.
 *
 * @method
 * @summary (@Either[α, β]) => Either[α, β] → Boolean
 */
Either.prototype.isEqual = unimplemented

Left.prototype.isEqual = function(a) {
  return a.isLeft && (a.value === this.value)
}

Right.prototype.isEqual = function(a) {
  return a.isRight && (a.value === this.value)
}


// -- Extracting and recovering ----------------------------------------

/**
 * Extracts the `Right` value out of the `Either[α, β]` structure, if it
 * exists. Otherwise throws a `TypeError`.
 *
 * @method
 * @summary (@Either[α, β]) => Void → β         :: partial, throws
 * @see {@link module:lib/either~Either#getOrElse} — A getter that can handle failures.
 * @see {@link module:lib/either~Either#merge} — The convergence of both values.
 * @throws {TypeError} if the structure has no `Right` value.
 */
Either.prototype.get = unimplemented

Left.prototype.get = function() {
  throw new TypeError("Can't extract the value of a Left(a).")
}

Right.prototype.get = function() {
  return this.value
}


/**
 * Extracts the `Right` value out of the `Either[α, β]` structure. If the
 * structure doesn't have a `Right` value, returns the given default.
 *
 * @method
 * @summary (@Either[α, β]) => β → β
 */
Either.prototype.getOrElse = unimplemented

Left.prototype.getOrElse = function(a) {
  return a
}

Right.prototype.getOrElse = function(_) {
  return this.value
}


/**
 * Transforms a `Left` value into a new `Either[α, β]` structure. Does nothing
 * if the structure contain a `Right` value.
 *
 * @method
 * @summary (@Either[α, β]) => (α → Either[γ, β]) → Either[γ, β]
 */
Either.prototype.orElse = unimplemented
Right.prototype.orElse  = noop

Left.prototype.orElse = function(f) {
  return f(this.value)
}


/**
 * Returns the value of whichever side of the disjunction that is present.
 *
 * @summary (@Either[α, α]) => Void → α
 */
Either.prototype.merge = function() {
  return this.value
}


// -- Folds and Extended Transformations -------------------------------

/**
 * Applies a function to each case in this data structure.
 *
 * @method
 * @summary (@Either[α, β]) => (α → γ), (β → γ) → γ
 */
Either.prototype.fold = unimplemented

Left.prototype.fold = function(f, _) {
  return f(this.value)
}

Right.prototype.fold = function(_, g) {
  return g(this.value)
}

/**
 * Catamorphism.
 * 
 * @method
 * @summary (@Either[α, β]) => { Left: α → γ, Right: β → γ } → γ
 */
Either.prototype.cata = unimplemented

Left.prototype.cata = function(pattern) {
  return pattern.Left(this.value)
}

Right.prototype.cata = function(pattern) {
  return pattern.Right(this.value)
}


/**
 * Swaps the disjunction values.
 *
 * @method
 * @summary (@Either[α, β]) => Void → Either[β, α]
 */
Either.prototype.swap = unimplemented

Left.prototype.swap = function() {
  return this.Right(this.value)
}

Right.prototype.swap = function() {
  return this.Left(this.value)
}


/**
 * Maps both sides of the disjunction.
 *
 * @method
 * @summary (@Either[α, β]) => (α → γ), (β → δ) → Either[γ, δ]
 */
Either.prototype.bimap = unimplemented

Left.prototype.bimap = function(f, _) {
  return this.Left(f(this.value))
}

Right.prototype.bimap = function(_, g) {
  return this.Right(g(this.value))
}


/**
 * Maps the left side of the disjunction.
 *
 * @method
 * @summary (@Either[α, β]) => (α → γ) → Either[γ, β]
 */
Either.prototype.leftMap = unimplemented
Right.prototype.leftMap  = noop

Left.prototype.leftMap = function(f) {
  return this.Left(f(this.value))
}
  })();
});

require.register("data.either/lib/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "data.either");
  (function() {
    // Copyright (c) 2013-2014 Quildreen Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = require('./either')
  })();
});

require.register("data.maybe/lib/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "data.maybe");
  (function() {
    // Copyright (c) 2013-2014 Quildreen Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = require('./maybe')
  })();
});

require.register("data.maybe/lib/maybe.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "data.maybe");
  (function() {
    // Copyright (c) 2013-2014 Quildreen Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * @module lib/maybe
 */
module.exports = Maybe

// -- Aliases ----------------------------------------------------------
var clone         = Object.create
var unimplemented = function(){ throw new Error('Not implemented.') }
var noop          = function(){ return this                         }

// -- Implementation ---------------------------------------------------

/**
 * A structure for values that may not be present, or computations that may
 * fail. `Maybe(a)` explicitly models the effects that are implicit in
 * `Nullable` types, thus has none of the problems associated with
 * `null` or `undefined` — like `NullPointerExceptions`.
 *
 * The class models two different cases:
 *
 *  + `Just a` — represents a `Maybe(a)` that contains a value. `a` may
 *     be any value, including `null` or `undefined`.
 *
 *  + `Nothing` — represents a `Maybe(a)` that has no values. Or a
 *     failure that needs no additional information.
 *
 * Common uses of this structure includes modelling values that may or may
 * not be present in a collection, thus instead of needing a
 * `collection.has(a)`, the `collection.get(a)` operation gives you all
 * the information you need — `collection.get(a).is-nothing` being
 * equivalent to `collection.has(a)`; Similarly the same reasoning may
 * be applied to computations that may fail to provide a value, e.g.:
 * `collection.find(predicate)` can safely return a `Maybe(a)` instance,
 * even if the collection contains nullable values.
 *
 * Furthermore, the values of `Maybe(a)` can be combined and manipulated
 * by using the expressive monadic operations. This allows safely
 * sequencing operations that may fail, and safely composing values that
 * you don't know whether they're present or not, failing early
 * (returning a `Nothing`) if any of the operations fail.
 *
 * If one wants to store additional information about failures, the
 * [Either][] and [Validation][] structures provide such a capability, and
 * should be used instead of the `Maybe(a)` structure.
 *
 * [Either]: https://github.com/folktale/data.either
 * [Validation]: https://github.com/folktale/data.validation
 *
 *
 * @class
 */
function Maybe() {}

// The case for successful values
Just.prototype = clone(Maybe.prototype)
function Just(a){
  this.value = a
}

// The case for failure values
Nothing.prototype = clone(Maybe.prototype)
function Nothing(){}


// -- Constructors -----------------------------------------------------

/**
 * Constructs a new `Maybe[α]` structure with an absent value. Commonly used
 * to represent a failure.
 *
 * @summary Void → Maybe[α]
 */
Maybe.Nothing = function() {
  return new Nothing
}
Maybe.prototype.Nothing = Maybe.Nothing

/**
 * Constructs a new `Maybe[α]` structure that holds the single value
 * `α`. Commonly used to represent a success.
 *
 * `α` can be any value, including `null`, `undefined` or another
 * `Maybe[α]` structure.
 *
 * @summary α → Maybe[α]
 */
Maybe.Just = function(a) {
  return new Just(a)
}
Maybe.prototype.Just = Maybe.Just


// -- Conversions ------------------------------------------------------

/**
 * Constructs a new `Maybe[α]` structure from a nullable type.
 *
 * If the value is either `null` or `undefined`, this function returns a
 * `Nothing`, otherwise the value is wrapped in a `Just(α)`.
 *
 * @summary α → Maybe[α]
 */
Maybe.fromNullable = function(a) {
  return a != null?       new Just(a)
  :      /* otherwise */  new Nothing
}
Maybe.prototype.fromNullable = Maybe.fromNullable

/**
 * Constructs a new `Maybe[β]` structure from an `Either[α, β]` type.
 *
 * The left side of the `Either` becomes `Nothing`, and the right side
 * is wrapped in a `Just(β)`.
 *
 * @summary Either[α, β] → Maybe[β]
 */
Maybe.fromEither = function(a) {
  return a.fold(Maybe.Nothing, Maybe.Just)
}
Maybe.prototype.fromEither = Maybe.fromEither

/**
 * Constructs a new `Maybe[β]` structure from a `Validation[α, β]` type.
 *
 * The failure side of the `Validation` becomes `Nothing`, and the right
 * side is wrapped in a `Just(β)`.
 *
 * @method
 * @summary Validation[α, β] → Maybe[β]
 */
Maybe.fromValidation           = Maybe.fromEither
Maybe.prototype.fromValidation = Maybe.fromEither


// -- Predicates -------------------------------------------------------

/**
 * True if the `Maybe[α]` structure contains a failure (i.e.: `Nothing`).
 *
 * @summary Boolean
 */
Maybe.prototype.isNothing   = false
Nothing.prototype.isNothing = true


/**
 * True if the `Maybe[α]` structure contains a single value (i.e.: `Just(α)`).
 *
 * @summary Boolean
 */
Maybe.prototype.isJust = false
Just.prototype.isJust  = true


// -- Applicative ------------------------------------------------------

/**
 * Creates a new `Maybe[α]` structure holding the single value `α`.
 *
 * `α` can be any value, including `null`, `undefined`, or another
 * `Maybe[α]` structure.
 *
 * @summary α → Maybe[α]
 */
Maybe.of = function(a) {
  return new Just(a)
}
Maybe.prototype.of = Maybe.of


/**
 * Applies the function inside the `Maybe[α]` structure to another
 * applicative type.
 *
 * The `Maybe[α]` structure should contain a function value, otherwise a
 * `TypeError` is thrown.
 *
 * @method
 * @summary (@Maybe[α → β], f:Applicative[_]) => f[α] → f[β]
 */
Maybe.prototype.ap = unimplemented

Nothing.prototype.ap = noop

Just.prototype.ap = function(b) {
  return b.map(this.value)
}




// -- Functor ----------------------------------------------------------

/**
 * Transforms the value of the `Maybe[α]` structure using a regular unary
 * function.
 *
 * @method
 * @summary @Maybe[α] => (α → β) → Maybe[β]
 */
Maybe.prototype.map   = unimplemented
Nothing.prototype.map = noop

Just.prototype.map = function(f) {
  return this.of(f(this.value))
}


// -- Chain ------------------------------------------------------------

/**
 * Transforms the value of the `Maybe[α]` structure using an unary function
 * to monads.
 *
 * @method
 * @summary (@Maybe[α], m:Monad[_]) => (α → m[β]) → m[β]
 */
Maybe.prototype.chain   = unimplemented
Nothing.prototype.chain = noop

Just.prototype.chain = function(f) {
  return f(this.value)
}


// -- Show -------------------------------------------------------------

/**
 * Returns a textual representation of the `Maybe[α]` structure.
 *
 * @method
 * @summary @Maybe[α] => Void → String
 */
Maybe.prototype.toString = unimplemented

Nothing.prototype.toString = function() {
  return 'Maybe.Nothing'
}

Just.prototype.toString = function() {
  return 'Maybe.Just(' + this.value + ')'
}


// -- Eq ---------------------------------------------------------------

/**
 * Tests if a `Maybe[α]` structure is equal to another `Maybe[α]` structure.
 *
 * @method
 * @summary @Maybe[α] => Maybe[α] → Boolean
 */
Maybe.prototype.isEqual = unimplemented

Nothing.prototype.isEqual = function(b) {
  return b.isNothing
}

Just.prototype.isEqual = function(b) {
  return b.isJust
  &&     b.value === this.value
}


// -- Extracting and recovering ----------------------------------------

/**
 * Extracts the value out of the `Maybe[α]` structure, if it
 * exists. Otherwise throws a `TypeError`.
 *
 * @method
 * @summary @Maybe[α] => Void → a,      :: partial, throws
 * @see {@link module:lib/maybe~Maybe#getOrElse} — A getter that can handle failures
 * @throws {TypeError} if the structure has no value (`Nothing`).
 */
Maybe.prototype.get = unimplemented

Nothing.prototype.get = function() {
  throw new TypeError("Can't extract the value of a Nothing.")
}

Just.prototype.get = function() {
  return this.value
}


/**
 * Extracts the value out of the `Maybe[α]` structure. If there is no value,
 * returns the given default.
 *
 * @method
 * @summary @Maybe[α] => α → α
 */
Maybe.prototype.getOrElse = unimplemented

Nothing.prototype.getOrElse = function(a) {
  return a
}

Just.prototype.getOrElse = function(_) {
  return this.value
}


/**
 * Transforms a failure into a new `Maybe[α]` structure. Does nothing if the
 * structure already contains a value.
 *
 * @method
 * @summary @Maybe[α] => (Void → Maybe[α]) → Maybe[α]
 */
Maybe.prototype.orElse = unimplemented

Nothing.prototype.orElse = function(f) {
  return f()
}

Just.prototype.orElse = function(_) {
  return this
}


/**
 * Catamorphism.
 * 
 * @method
 * @summary @Maybe[α] => { Nothing: Void → β, Just: α → β } → β
 */
Maybe.prototype.cata = unimplemented

Nothing.prototype.cata = function(pattern) {
  return pattern.Nothing()
}

Just.prototype.cata = function(pattern) {
  return pattern.Just(this.value);
}


/**
 * JSON serialisation
 *
 * @method
 * @summary @Maybe[α] => Void → Object
 */
Maybe.prototype.toJSON = unimplemented

Nothing.prototype.toJSON = function() {
  return { '#type': 'folktale:Maybe.Nothing' }
}

Just.prototype.toJSON = function() {
  return { '#type': 'folktale:Maybe.Just'
         , value: this.value }
}
  })();
});

require.register("data.task/lib/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "data.task");
  (function() {
    module.exports = require('./task');
  })();
});

require.register("data.task/lib/task.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "data.task");
  (function() {
    'use strict';


/**
 * A helper for delaying the execution of a function.
 * @private
 * @summary (Any... -> Any) -> Void
 */
var delayed = typeof setImmediate !== 'undefined'?  setImmediate
            : typeof process !== 'undefined'?       process.nextTick
            : /* otherwise */                       setTimeout

/**
 * @module lib/task
 */
module.exports = Task;

// -- Implementation ---------------------------------------------------

/**
 * The `Task[α, β]` structure represents values that depend on time. This
 * allows one to model time-based effects explicitly, such that one can have
 * full knowledge of when they're dealing with delayed computations, latency,
 * or anything that can not be computed immediately.
 *
 * A common use for this structure is to replace the usual Continuation-Passing
 * Style form of programming, in order to be able to compose and sequence
 * time-dependent effects using the generic and powerful monadic operations.
 *
 * @class
 * @summary
 * ((α → Void), (β → Void) → Void), (Void → Void) → Task[α, β]
 *
 * Task[α, β] <: Chain[β]
 *               , Monad[β]
 *               , Functor[β]
 *               , Applicative[β]
 *               , Semigroup[β]
 *               , Monoid[β]
 *               , Show
 */
function Task(computation, cleanup) {
  this.fork = computation;

  this.cleanup = cleanup || function() {};
}

/**
 * Constructs a new `Task[α, β]` containing the single value `β`.
 *
 * `β` can be any value, including `null`, `undefined`, or another
 * `Task[α, β]` structure.
 *
 * @summary β → Task[α, β]
 */
Task.prototype.of = function _of(b) {
  return new Task(function(_, resolve) {
    return resolve(b);
  });
};

Task.of = Task.prototype.of;

/**
 * Constructs a new `Task[α, β]` containing the single value `α`.
 *
 * `α` can be any value, including `null`, `undefined`, or another
 * `Task[α, β]` structure.
 *
 * @summary α → Task[α, β]
 */
Task.prototype.rejected = function _rejected(a) {
  return new Task(function(reject) {
    return reject(a);
  });
};

Task.rejected = Task.prototype.rejected;

// -- Functor ----------------------------------------------------------

/**
 * Transforms the successful value of the `Task[α, β]` using a regular unary
 * function.
 *
 * @summary @Task[α, β] => (β → γ) → Task[α, γ]
 */
Task.prototype.map = function _map(f) {
  var fork = this.fork;
  var cleanup = this.cleanup;

  return new Task(function(reject, resolve) {
    return fork(function(a) {
      return reject(a);
    }, function(b) {
      return resolve(f(b));
    });
  }, cleanup);
};

// -- Chain ------------------------------------------------------------

/**
 * Transforms the succesful value of the `Task[α, β]` using a function to a
 * monad.
 *
 * @summary @Task[α, β] => (β → Task[α, γ]) → Task[α, γ]
 */
Task.prototype.chain = function _chain(f) {
  var fork = this.fork;
  var cleanup = this.cleanup;

  return new Task(function(reject, resolve) {
    return fork(function(a) {
      return reject(a);
    }, function(b) {
      return f(b).fork(reject, resolve);
    });
  }, cleanup);
};

// -- Apply ------------------------------------------------------------

/**
 * Applys the successful value of the `Task[α, (β → γ)]` to the successful
 * value of the `Task[α, β]`
 *
 * @summary @Task[α, (β → γ)] => Task[α, β] → Task[α, γ]
 */

Task.prototype.ap = function _ap(that) {
  var forkThis = this.fork;
  var forkThat = that.fork;
  var cleanupThis = this.cleanup;
  var cleanupThat = that.cleanup;

  function cleanupBoth(state) {
    cleanupThis(state[0]);
    cleanupThat(state[1]);
  }

  return new Task(function(reject, resolve) {
    var func, funcLoaded = false;
    var val, valLoaded = false;
    var rejected = false;
    var allState;

    var thisState = forkThis(guardReject, guardResolve(function(x) {
      funcLoaded = true;
      func = x;
    }));

    var thatState = forkThat(guardReject, guardResolve(function(x) {
      valLoaded = true;
      val = x;
    }));

    function guardResolve(setter) {
      return function(x) {
        if (rejected) {
          return;
        }

        setter(x);
        if (funcLoaded && valLoaded) {
          delayed(function(){ cleanupBoth(allState) });
          return resolve(func(val));
        } else {
          return x;
        }
      }
    }

    function guardReject(x) {
      if (!rejected) {
        rejected = true;
        return reject(x);
      }
    }

    return allState = [thisState, thatState];
  }, cleanupBoth);
};

// -- Semigroup ------------------------------------------------------------

/**
 * Selects the earlier of the two tasks `Task[α, β]`
 *
 * @summary @Task[α, β] => Task[α, β] → Task[α, β]
 */

Task.prototype.concat = function _concat(that) {
  var forkThis = this.fork;
  var forkThat = that.fork;
  var cleanupThis = this.cleanup;
  var cleanupThat = that.cleanup;

  function cleanupBoth(state) {
    cleanupThis(state[0]);
    cleanupThat(state[1]);
  }

  return new Task(function(reject, resolve) {
    var done = false;
    var allState;
    var thisState = forkThis(guard(reject), guard(resolve));
    var thatState = forkThat(guard(reject), guard(resolve));

    return allState = [thisState, thatState];

    function guard(f) {
      return function(x) {
        if (!done) {
          done = true;
          delayed(function(){ cleanupBoth(allState) })
          return f(x);
        }
      };
    }
  }, cleanupBoth);

};

// -- Monoid ------------------------------------------------------------

/**
 * Returns a Task that will never resolve
 *
 * @summary Void → Task[α, _]
 */
Task.empty = function _empty() {
  return new Task(function() {});
};

Task.prototype.empty = Task.empty;

// -- Show -------------------------------------------------------------

/**
 * Returns a textual representation of the `Task[α, β]`
 *
 * @summary @Task[α, β] => Void → String
 */
Task.prototype.toString = function _toString() {
  return 'Task';
};

// -- Extracting and recovering ----------------------------------------

/**
 * Transforms a failure value into a new `Task[α, β]`. Does nothing if the
 * structure already contains a successful value.
 *
 * @summary @Task[α, β] => (α → Task[γ, β]) → Task[γ, β]
 */
Task.prototype.orElse = function _orElse(f) {
  var fork = this.fork;
  var cleanup = this.cleanup;

  return new Task(function(reject, resolve) {
    return fork(function(a) {
      return f(a).fork(reject, resolve);
    }, function(b) {
      return resolve(b);
    });
  }, cleanup);
};

// -- Folds and extended transformations -------------------------------

/**
 * Catamorphism. Takes two functions, applies the leftmost one to the failure
 * value, and the rightmost one to the successful value, depending on which one
 * is present.
 *
 * @summary @Task[α, β] => (α → γ), (β → γ) → Task[δ, γ]
 */
Task.prototype.fold = function _fold(f, g) {
  var fork = this.fork;
  var cleanup = this.cleanup;

  return new Task(function(reject, resolve) {
    return fork(function(a) {
      return resolve(f(a));
    }, function(b) {
      return resolve(g(b));
    });
  }, cleanup);
};

/**
 * Catamorphism.
 *
 * @summary @Task[α, β] => { Rejected: α → γ, Resolved: β → γ } → Task[δ, γ]
 */
Task.prototype.cata = function _cata(pattern) {
  return this.fold(pattern.Rejected, pattern.Resolved);
};

/**
 * Swaps the disjunction values.
 *
 * @summary @Task[α, β] => Void → Task[β, α]
 */
Task.prototype.swap = function _swap() {
  var fork = this.fork;
  var cleanup = this.cleanup;

  return new Task(function(reject, resolve) {
    return fork(function(a) {
      return resolve(a);
    }, function(b) {
      return reject(b);
    });
  }, cleanup);
};

/**
 * Maps both sides of the disjunction.
 *
 * @summary @Task[α, β] => (α → γ), (β → δ) → Task[γ, δ]
 */
Task.prototype.bimap = function _bimap(f, g) {
  var fork = this.fork;
  var cleanup = this.cleanup;

  return new Task(function(reject, resolve) {
    return fork(function(a) {
      return reject(f(a));
    }, function(b) {
      return resolve(g(b));
    });
  }, cleanup);
};

/**
 * Maps the left side of the disjunction (failure).
 *
 * @summary @Task[α, β] => (α → γ) → Task[γ, β]
 */
Task.prototype.rejectedMap = function _rejectedMap(f) {
  var fork = this.fork;
  var cleanup = this.cleanup;

  return new Task(function(reject, resolve) {
    return fork(function(a) {
      return reject(f(a));
    }, function(b) {
      return resolve(b);
    });
  }, cleanup);
};
  })();
});

require.register("data.validation/lib/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "data.validation");
  (function() {
    // Copyright (c) 2013-2014 Quildreen Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = require('./validation')
  })();
});

require.register("data.validation/lib/validation.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "data.validation");
  (function() {
    // Copyright (c) 2013-2014 Quildreen Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * @module lib/validation
 */
module.exports = Validation

// -- Aliases ----------------------------------------------------------
var clone         = Object.create
var unimplemented = function(){ throw new Error('Not implemented.') }
var noop          = function(){ return this                         }


// -- Implementation ---------------------------------------------------

/**
 * The `Validation[α, β]` is a disjunction that's more appropriate for
 * validating inputs, or any use case where you want to aggregate failures. Not
 * only does the `Validation` provide a better terminology for working with
 * such cases (`Failure` and `Success` versus `Failure` and `Success`), it also
 * allows one to easily aggregate failures and successes as an Applicative
 * Functor.
 *
 * @class
 * @summary
 * Validation[α, β] <: Applicative[β]
 *                   , Functor[β]
 *                   , Show
 *                   , Eq
 */
function Validation() { }

Failure.prototype = clone(Validation.prototype)
function Failure(a) {
  this.value = a
}

Success.prototype = clone(Validation.prototype)
function Success(a) {
  this.value = a
}

// -- Constructors -----------------------------------------------------

/**
 * Constructs a new `Validation[α, β]` structure holding a `Failure` value.
 *
 * @summary a → Validation[α, β]
 */
Validation.Failure = function(a) {
  return new Failure(a)
}
Validation.prototype.Failure = Validation.Failure

/**
 * Constructs a new `Etiher[α, β]` structure holding a `Success` value.
 *
 * @summary β → Validation[α, β]
 */
Validation.Success = function(a) {
  return new Success(a)
}
Validation.prototype.Success = Validation.Success


// -- Conversions ------------------------------------------------------

/**
 * Constructs a new `Validation[α, β]` structure from a nullable type.
 *
 * Takes the `Failure` case if the value is `null` or `undefined`. Takes the
 * `Success` case otherwise.
 *
 * @summary α → Validation[α, α]
 */
Validation.fromNullable = function(a) {
  return a != null?       new Success(a)
  :      /* otherwise */  new Failure(a)
}
Validation.prototype.fromNullable = Validation.fromNullable

/**
 * Constructs a new `Either[α, β]` structure from a `Validation[α, β]` type.
 *
 * @summary Either[α, β] → Validation[α, β]
 */
Validation.fromEither = function(a) {
  return a.fold(Validation.Failure, Validation.Success)
}


// -- Predicates -------------------------------------------------------

/**
 * True if the `Validation[α, β]` contains a `Failure` value.
 *
 * @summary Boolean
 */
Validation.prototype.isFailure = false
Failure.prototype.isFailure    = true

/**
 * True if the `Validation[α, β]` contains a `Success` value.
 *
 * @summary Boolean
 */
Validation.prototype.isSuccess = false
Success.prototype.isSuccess    = true


// -- Applicative ------------------------------------------------------

/**
 * Creates a new `Validation[α, β]` instance holding the `Success` value `b`.
 *
 * `b` can be any value, including `null`, `undefined` or another
 * `Validation[α, β]` structure.
 *
 * @summary β → Validation[α, β]
 */
Validation.of = function(a) {
  return new Success(a)
}
Validation.prototype.of = Validation.of


/**
 * Applies the function inside the `Success` case of the `Validation[α, β]` structure
 * to another applicative type.
 *
 * The `Validation[α, β]` should contain a function value, otherwise a `TypeError`
 * is thrown.
 *
 * @method
 * @summary (@Validation[α, β → γ], f:Applicative[_]) => f[β] → f[γ]
 */
Validation.prototype.ap = unimplemented

Failure.prototype.ap = function(b) {
  return b.isFailure?     this.Failure(this.value.concat(b.value))
  :      /* otherwise */  this
}

Success.prototype.ap = function(b) {
  return b.isFailure?     b
  :      /* otherwise */  b.map(this.value)
}


// -- Functor ----------------------------------------------------------

/**
 * Transforms the `Success` value of the `Validation[α, β]` structure using a regular
 * unary function.
 *
 * @method
 * @summary (@Validation[α, β]) => (β → γ) → Validation[α, γ]
 */
Validation.prototype.map = unimplemented
Failure.prototype.map    = noop

Success.prototype.map = function(f) {
  return this.of(f(this.value))
}


// -- Show -------------------------------------------------------------

/**
 * Returns a textual representation of the `Validation[α, β]` structure.
 *
 * @method
 * @summary (@Validation[α, β]) => Void → String
 */
Validation.prototype.toString = unimplemented

Failure.prototype.toString = function() {
  return 'Validation.Failure(' + this.value + ')'
}

Success.prototype.toString = function() {
  return 'Validation.Success(' + this.value + ')'
}


// -- Eq ---------------------------------------------------------------

/**
 * Tests if an `Validation[α, β]` structure is equal to another `Validation[α, β]`
 * structure.
 *
 * @method
 * @summary (@Validation[α, β]) => Validation[α, β] → Boolean
 */
Validation.prototype.isEqual = unimplemented

Failure.prototype.isEqual = function(a) {
  return a.isFailure && (a.value === this.value)
}

Success.prototype.isEqual = function(a) {
  return a.isSuccess && (a.value === this.value)
}


// -- Extracting and recovering ----------------------------------------

/**
 * Extracts the `Success` value out of the `Validation[α, β]` structure, if it
 * exists. Otherwise throws a `TypeError`.
 *
 * @method
 * @summary (@Validation[α, β]) => Void → β         :: partial, throws
 * @see {@link module:lib/validation~Validation#getOrElse} — A getter that can handle failures.
 * @see {@link module:lib/validation~Validation#merge} — The convergence of both values.
 * @throws {TypeError} if the structure has no `Success` value.
 */
Validation.prototype.get = unimplemented

Failure.prototype.get = function() {
  throw new TypeError("Can't extract the value of a Failure(a).")
}

Success.prototype.get = function() {
  return this.value
}


/**
 * Extracts the `Success` value out of the `Validation[α, β]` structure. If the
 * structure doesn't have a `Success` value, returns the given default.
 *
 * @method
 * @summary (@Validation[α, β]) => β → β
 */
Validation.prototype.getOrElse = unimplemented

Failure.prototype.getOrElse = function(a) {
  return a
}

Success.prototype.getOrElse = function(_) {
  return this.value
}


/**
 * Transforms a `Failure` value into a new `Validation[α, β]` structure. Does nothing
 * if the structure contain a `Success` value.
 *
 * @method
 * @summary (@Validation[α, β]) => (α → Validation[γ, β]) → Validation[γ, β]
 */
Validation.prototype.orElse = unimplemented
Success.prototype.orElse    = noop

Failure.prototype.orElse = function(f) {
  return f(this.value)
}


/**
 * Returns the value of whichever side of the disjunction that is present.
 *
 * @summary (@Validation[α, α]) => Void → α
 */
Validation.prototype.merge = function() {
  return this.value
}


// -- Folds and Extended Transformations -------------------------------

/**
 * Applies a function to each case in this data structure.
 *
 * @method
 * @summary (@Validation[α, β]) => (α → γ), (β → γ) → γ
 */
Validation.prototype.fold = unimplemented

Failure.prototype.fold = function(f, _) {
  return f(this.value)
}

Success.prototype.fold = function(_, g) {
  return g(this.value)
}

/**
 * Catamorphism.
 * 
 * @method
 * @summary (@Validation[α, β]) => { Success: α → γ, Failure: α → γ } → γ
 */
Validation.prototype.cata = unimplemented

Failure.prototype.cata = function(pattern) {
  return pattern.Failure(this.value)
}

Success.prototype.cata = function(pattern) {
  return pattern.Success(this.value)
}


/**
 * Swaps the disjunction values.
 *
 * @method
 * @summary (@Validation[α, β]) => Void → Validation[β, α]
 */
Validation.prototype.swap = unimplemented

Failure.prototype.swap = function() {
  return this.Success(this.value)
}

Success.prototype.swap = function() {
  return this.Failure(this.value)
}


/**
 * Maps both sides of the disjunction.
 *
 * @method
 * @summary (@Validation[α, β]) => (α → γ), (β → δ) → Validation[γ, δ]
 */
Validation.prototype.bimap = unimplemented

Failure.prototype.bimap = function(f, _) {
  return this.Failure(f(this.value))
}

Success.prototype.bimap = function(_, g) {
  return this.Success(g(this.value))
}


/**
 * Maps the failure side of the disjunction.
 *
 * @method
 * @summary (@Validation[α, β]) => (α → γ) → Validation[γ, β]
 */
Validation.prototype.failureMap = unimplemented
Success.prototype.failureMap    = noop

Failure.prototype.failureMap = function(f) {
  return this.Failure(f(this.value))
}

/**
 * Maps the failure side of the disjunction.
 *
 * @method
 * @deprecated in favour of {@link module:lib/validation~Validation#failureMap}
 * @summary (@Validation[α, β]) => (α → γ) → Validation[γ, β]
 */
Validation.prototype.leftMap = Validation.prototype.failureMap
Success.prototype.leftMap    = Success.prototype.failureMap
Failure.prototype.leftMap    = Failure.prototype.failureMap
  })();
});

require.register("mithril-stream/stream.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril-stream");
  (function() {
    /* eslint-disable */
;(function() {
"use strict"
/* eslint-enable */
Stream.SKIP = {}
Stream.lift = lift
Stream.scan = scan
Stream.merge = merge
Stream.combine = combine
Stream.scanMerge = scanMerge
Stream["fantasy-land/of"] = Stream

var warnedHalt = false
Object.defineProperty(Stream, "HALT", {
	get: function() {
		warnedHalt || console.log("HALT is deprecated and has been renamed to SKIP");
		warnedHalt = true
		return Stream.SKIP
	}
})

function Stream(value) {
	var dependentStreams = []
	var dependentFns = []

	function stream(v) {
		if (arguments.length && v !== Stream.SKIP) {
			value = v
			if (open(stream)) {
				stream.changing()
				stream.state = "active"
				dependentStreams.forEach(function(s, i) { s(dependentFns[i](value)) })
			}
		}

		return value
	}

	stream.constructor = Stream
	stream.state = arguments.length && value !== Stream.SKIP ? "active" : "pending"
	stream.parents = []

	stream.changing = function() {
		open(stream) && (stream.state = "changing")
		dependentStreams.forEach(function(s) {
			s.changing()
		})
	}

	stream.map = function(fn, ignoreInitial) {
		var target = stream.state === "active" && ignoreInitial !== Stream.SKIP
			? Stream(fn(value))
			: Stream()
		target.parents.push(stream)

		dependentStreams.push(target)
		dependentFns.push(fn)
		return target
	}

	var end
	function createEnd() {
		end = Stream()
		end.map(function(value) {
			if (value === true) {
				stream.parents.forEach(function (p) {p.unregisterChild(stream)})
				stream.state = "ended"
				stream.parents.length = dependentStreams.length = dependentFns.length = 0
			}
			return value
		})
		return end
	}

	stream.toJSON = function() { return value != null && typeof value.toJSON === "function" ? value.toJSON() : value }

	stream["fantasy-land/map"] = stream.map
	stream["fantasy-land/ap"] = function(x) { return combine(function(s1, s2) { return s1()(s2()) }, [x, stream]) }

	stream.unregisterChild = function(child) {
		var childIndex = dependentStreams.indexOf(child)
		if (childIndex !== -1) {
			dependentStreams.splice(childIndex, 1)
			dependentFns.splice(childIndex, 1)
		}
	}

	Object.defineProperty(stream, "end", {
		get: function() { return end || createEnd() }
	})

	return stream
}

function combine(fn, streams) {
	var ready = streams.every(function(s) {
		if (s.constructor !== Stream)
			throw new Error("Ensure that each item passed to stream.combine/stream.merge/lift is a stream")
		return s.state === "active"
	})
	var stream = ready
		? Stream(fn.apply(null, streams.concat([streams])))
		: Stream()

	var changed = []

	var mappers = streams.map(function(s) {
		return s.map(function(value) {
			changed.push(s)
			if (ready || streams.every(function(s) { return s.state !== "pending" })) {
				ready = true
				stream(fn.apply(null, streams.concat([changed])))
				changed = []
			}
			return value
		}, Stream.SKIP)
	})

	var endStream = stream.end.map(function(value) {
		if (value === true) {
			mappers.forEach(function(mapper) { mapper.end(true) })
			endStream.end(true)
		}
		return undefined
	})

	return stream
}

function merge(streams) {
	return combine(function() { return streams.map(function(s) { return s() }) }, streams)
}

function scan(fn, acc, origin) {
	var stream = origin.map(function(v) {
		var next = fn(acc, v)
		if (next !== Stream.SKIP) acc = next
		return next
	})
	stream(acc)
	return stream
}

function scanMerge(tuples, seed) {
	var streams = tuples.map(function(tuple) { return tuple[0] })

	var stream = combine(function() {
		var changed = arguments[arguments.length - 1]
		streams.forEach(function(stream, i) {
			if (changed.indexOf(stream) > -1)
				seed = tuples[i][1](seed, stream())
		})

		return seed
	}, streams)

	stream(seed)

	return stream
}

function lift() {
	var fn = arguments[0]
	var streams = Array.prototype.slice.call(arguments, 1)
	return merge(streams).map(function(streams) {
		return fn.apply(undefined, streams)
	})
}

function open(s) {
	return s.state === "pending" || s.state === "active" || s.state === "changing"
}

if (typeof module !== "undefined") module["exports"] = Stream
else if (typeof window.m === "function" && !("stream" in window.m)) window.m.stream = Stream
else window.m = {stream : Stream}

}());
  })();
});

require.register("mithril/api/mount-redraw.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var Vnode = require("../render/vnode")

module.exports = function(render, schedule, console) {
	var subscriptions = []
	var rendering = false
	var pending = false

	function sync() {
		if (rendering) throw new Error("Nested m.redraw.sync() call")
		rendering = true
		for (var i = 0; i < subscriptions.length; i += 2) {
			try { render(subscriptions[i], Vnode(subscriptions[i + 1]), redraw) }
			catch (e) { console.error(e) }
		}
		rendering = false
	}

	function redraw() {
		if (!pending) {
			pending = true
			schedule(function() {
				pending = false
				sync()
			})
		}
	}

	redraw.sync = sync

	function mount(root, component) {
		if (component != null && component.view == null && typeof component !== "function") {
			throw new TypeError("m.mount(element, component) expects a component, not a vnode")
		}

		var index = subscriptions.indexOf(root)
		if (index >= 0) {
			subscriptions.splice(index, 2)
			render(root, [], redraw)
		}

		if (component != null) {
			subscriptions.push(root, component)
			render(root, Vnode(component), redraw)
		}
	}

	return {mount: mount, redraw: redraw}
}
  })();
});

require.register("mithril/api/router.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var Vnode = require("../render/vnode")
var m = require("../render/hyperscript")
var Promise = require("../promise/promise")

var buildPathname = require("../pathname/build")
var parsePathname = require("../pathname/parse")
var compileTemplate = require("../pathname/compileTemplate")
var assign = require("../pathname/assign")

var sentinel = {}

module.exports = function($window, mountRedraw) {
	var fireAsync

	function setPath(path, data, options) {
		path = buildPathname(path, data)
		if (fireAsync != null) {
			fireAsync()
			var state = options ? options.state : null
			var title = options ? options.title : null
			if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path)
			else $window.history.pushState(state, title, route.prefix + path)
		}
		else {
			$window.location.href = route.prefix + path
		}
	}

	var currentResolver = sentinel, component, attrs, currentPath, lastUpdate

	var SKIP = route.SKIP = {}

	function route(root, defaultRoute, routes) {
		if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
		// 0 = start
		// 1 = init
		// 2 = ready
		var state = 0

		var compiled = Object.keys(routes).map(function(route) {
			if (route[0] !== "/") throw new SyntaxError("Routes must start with a `/`")
			if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
				throw new SyntaxError("Route parameter names must be separated with either `/`, `.`, or `-`")
			}
			return {
				route: route,
				component: routes[route],
				check: compileTemplate(route),
			}
		})
		var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
		var p = Promise.resolve()
		var scheduled = false
		var onremove

		fireAsync = null

		if (defaultRoute != null) {
			var defaultData = parsePathname(defaultRoute)

			if (!compiled.some(function (i) { return i.check(defaultData) })) {
				throw new ReferenceError("Default route doesn't match any known routes")
			}
		}

		function resolveRoute() {
			scheduled = false
			// Consider the pathname holistically. The prefix might even be invalid,
			// but that's not our problem.
			var prefix = $window.location.hash
			if (route.prefix[0] !== "#") {
				prefix = $window.location.search + prefix
				if (route.prefix[0] !== "?") {
					prefix = $window.location.pathname + prefix
					if (prefix[0] !== "/") prefix = "/" + prefix
				}
			}
			// This seemingly useless `.concat()` speeds up the tests quite a bit,
			// since the representation is consistently a relatively poorly
			// optimized cons string.
			var path = prefix.concat()
				.replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
				.slice(route.prefix.length)
			var data = parsePathname(path)

			assign(data.params, $window.history.state)

			function fail() {
				if (path === defaultRoute) throw new Error("Could not resolve default route " + defaultRoute)
				setPath(defaultRoute, null, {replace: true})
			}

			loop(0)
			function loop(i) {
				// 0 = init
				// 1 = scheduled
				// 2 = done
				for (; i < compiled.length; i++) {
					if (compiled[i].check(data)) {
						var payload = compiled[i].component
						var matchedRoute = compiled[i].route
						var localComp = payload
						var update = lastUpdate = function(comp) {
							if (update !== lastUpdate) return
							if (comp === SKIP) return loop(i + 1)
							component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
							attrs = data.params, currentPath = path, lastUpdate = null
							currentResolver = payload.render ? payload : null
							if (state === 2) mountRedraw.redraw()
							else {
								state = 2
								mountRedraw.redraw.sync()
							}
						}
						// There's no understating how much I *wish* I could
						// use `async`/`await` here...
						if (payload.view || typeof payload === "function") {
							payload = {}
							update(localComp)
						}
						else if (payload.onmatch) {
							p.then(function () {
								return payload.onmatch(data.params, path, matchedRoute)
							}).then(update, fail)
						}
						else update("div")
						return
					}
				}
				fail()
			}
		}

		// Set it unconditionally so `m.route.set` and `m.route.Link` both work,
		// even if neither `pushState` nor `hashchange` are supported. It's
		// cleared if `hashchange` is used, since that makes it automatically
		// async.
		fireAsync = function() {
			if (!scheduled) {
				scheduled = true
				callAsync(resolveRoute)
			}
		}

		if (typeof $window.history.pushState === "function") {
			onremove = function() {
				$window.removeEventListener("popstate", fireAsync, false)
			}
			$window.addEventListener("popstate", fireAsync, false)
		} else if (route.prefix[0] === "#") {
			fireAsync = null
			onremove = function() {
				$window.removeEventListener("hashchange", resolveRoute, false)
			}
			$window.addEventListener("hashchange", resolveRoute, false)
		}

		return mountRedraw.mount(root, {
			onbeforeupdate: function() {
				state = state ? 2 : 1
				return !(!state || sentinel === currentResolver)
			},
			oncreate: resolveRoute,
			onremove: onremove,
			view: function() {
				if (!state || sentinel === currentResolver) return
				// Wrap in a fragment to preserve existing key semantics
				var vnode = [Vnode(component, attrs.key, attrs)]
				if (currentResolver) vnode = currentResolver.render(vnode[0])
				return vnode
			},
		})
	}
	route.set = function(path, data, options) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		setPath(path, data, options)
	}
	route.get = function() {return currentPath}
	route.prefix = "#!"
	route.Link = {
		view: function(vnode) {
			var options = vnode.attrs.options
			// Remove these so they don't get overwritten
			var attrs = {}, onclick, href
			assign(attrs, vnode.attrs)
			// The first two are internal, but the rest are magic attributes
			// that need censored to not screw up rendering.
			attrs.selector = attrs.options = attrs.key = attrs.oninit =
			attrs.oncreate = attrs.onbeforeupdate = attrs.onupdate =
			attrs.onbeforeremove = attrs.onremove = null

			// Do this now so we can get the most current `href` and `disabled`.
			// Those attributes may also be specified in the selector, and we
			// should honor that.
			var child = m(vnode.attrs.selector || "a", attrs, vnode.children)

			// Let's provide a *right* way to disable a route link, rather than
			// letting people screw up accessibility on accident.
			//
			// The attribute is coerced so users don't get surprised over
			// `disabled: 0` resulting in a button that's somehow routable
			// despite being visibly disabled.
			if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
				child.attrs.href = null
				child.attrs["aria-disabled"] = "true"
				// If you *really* do want to do this on a disabled link, use
				// an `oncreate` hook to add it.
				child.attrs.onclick = null
			} else {
				onclick = child.attrs.onclick
				href = child.attrs.href
				child.attrs.href = route.prefix + href
				child.attrs.onclick = function(e) {
					var result
					if (typeof onclick === "function") {
						result = onclick.call(e.currentTarget, e)
					} else if (onclick == null || typeof onclick !== "object") {
						// do nothing
					} else if (typeof onclick.handleEvent === "function") {
						onclick.handleEvent(e)
					}

					// Adapted from React Router's implementation:
					// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
					//
					// Try to be flexible and intuitive in how we handle links.
					// Fun fact: links aren't as obvious to get right as you
					// would expect. There's a lot more valid ways to click a
					// link than this, and one might want to not simply click a
					// link, but right click or command-click it to copy the
					// link target, etc. Nope, this isn't just for blind people.
					if (
						// Skip if `onclick` prevented default
						result !== false && !e.defaultPrevented &&
						// Ignore everything but left clicks
						(e.button === 0 || e.which === 0 || e.which === 1) &&
						// Let the browser handle `target=_blank`, etc.
						(!e.currentTarget.target || e.currentTarget.target === "_self") &&
						// No modifier keys
						!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
					) {
						e.preventDefault()
						e.redraw = false
						route.set(href, null, options)
					}
				}
			}
			return child
		},
	}
	route.param = function(key) {
		return attrs && key != null ? attrs[key] : attrs
	}

	return route
}
  })();
});

require.register("mithril/hyperscript.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var hyperscript = require("./render/hyperscript")

hyperscript.trust = require("./render/trust")
hyperscript.fragment = require("./render/fragment")

module.exports = hyperscript
  })();
});

require.register("mithril/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var hyperscript = require("./hyperscript")
var request = require("./request")
var mountRedraw = require("./mount-redraw")

var m = function m() { return hyperscript.apply(this, arguments) }
m.m = hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
m.mount = mountRedraw.mount
m.route = require("./route")
m.render = require("./render")
m.redraw = mountRedraw.redraw
m.request = request.request
m.jsonp = request.jsonp
m.parseQueryString = require("./querystring/parse")
m.buildQueryString = require("./querystring/build")
m.parsePathname = require("./pathname/parse")
m.buildPathname = require("./pathname/build")
m.vnode = require("./render/vnode")
m.PromisePolyfill = require("./promise/polyfill")

module.exports = m
  })();
});

require.register("mithril/mount-redraw.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var render = require("./render")

module.exports = require("./api/mount-redraw")(render, requestAnimationFrame, console)
  })();
});

require.register("mithril/pathname/assign.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

module.exports = Object.assign || function(target, source) {
	if(source) Object.keys(source).forEach(function(key) { target[key] = source[key] })
}
  })();
});

require.register("mithril/pathname/build.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var buildQueryString = require("../querystring/build")
var assign = require("./assign")

// Returns `path` from `template` + `params`
module.exports = function(template, params) {
	if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
		throw new SyntaxError("Template parameter names *must* be separated")
	}
	if (params == null) return template
	var queryIndex = template.indexOf("?")
	var hashIndex = template.indexOf("#")
	var queryEnd = hashIndex < 0 ? template.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = template.slice(0, pathEnd)
	var query = {}

	assign(query, params)

	var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
		delete query[key]
		// If no such parameter exists, don't interpolate it.
		if (params[key] == null) return m
		// Escape normal parameters, but not variadic ones.
		return variadic ? params[key] : encodeURIComponent(String(params[key]))
	})

	// In case the template substitution adds new query/hash parameters.
	var newQueryIndex = resolved.indexOf("?")
	var newHashIndex = resolved.indexOf("#")
	var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex
	var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex
	var result = resolved.slice(0, newPathEnd)

	if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd)
	if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd)
	var querystring = buildQueryString(query)
	if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring
	if (hashIndex >= 0) result += template.slice(hashIndex)
	if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex)
	return result
}
  })();
});

require.register("mithril/pathname/compileTemplate.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var parsePathname = require("./parse")

// Compiles a template into a function that takes a resolved path (without query
// strings) and returns an object containing the template parameters with their
// parsed values. This expects the input of the compiled template to be the
// output of `parsePathname`. Note that it does *not* remove query parameters
// specified in the template.
module.exports = function(template) {
	var templateData = parsePathname(template)
	var templateKeys = Object.keys(templateData.params)
	var keys = []
	var regexp = new RegExp("^" + templateData.path.replace(
		// I escape literal text so people can use things like `:file.:ext` or
		// `:lang-:locale` in routes. This is all merged into one pass so I
		// don't also accidentally escape `-` and make it harder to detect it to
		// ban it from template parameters.
		/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
		function(m, key, extra) {
			if (key == null) return "\\" + m
			keys.push({k: key, r: extra === "..."})
			if (extra === "...") return "(.*)"
			if (extra === ".") return "([^/]+)\\."
			return "([^/]+)" + (extra || "")
		}
	) + "$")
	return function(data) {
		// First, check the params. Usually, there isn't any, and it's just
		// checking a static set.
		for (var i = 0; i < templateKeys.length; i++) {
			if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false
		}
		// If no interpolations exist, let's skip all the ceremony
		if (!keys.length) return regexp.test(data.path)
		var values = regexp.exec(data.path)
		if (values == null) return false
		for (var i = 0; i < keys.length; i++) {
			data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1])
		}
		return true
	}
}
  })();
});

require.register("mithril/pathname/parse.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var parseQueryString = require("../querystring/parse")

// Returns `{path, params}` from `url`
module.exports = function(url) {
	var queryIndex = url.indexOf("?")
	var hashIndex = url.indexOf("#")
	var queryEnd = hashIndex < 0 ? url.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/")

	if (!path) path = "/"
	else {
		if (path[0] !== "/") path = "/" + path
		if (path.length > 1 && path[path.length - 1] === "/") path = path.slice(0, -1)
	}
	return {
		path: path,
		params: queryIndex < 0
			? {}
			: parseQueryString(url.slice(queryIndex + 1, queryEnd)),
	}
}
  })();
});

require.register("mithril/promise/polyfill.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
	if (typeof executor !== "function") throw new TypeError("executor must be a function")

	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
					executeOnce(then.bind(value))
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
						for (var i = 0; i < list.length; i++) list[i](value)
						resolvers.length = 0, rejectors.length = 0
						instance.state = shouldAbsorb
						instance.retry = function() {execute(value)}
					})
				}
			}
			catch (e) {
				rejectCurrent(e)
			}
		}
	}
	function executeOnce(then) {
		var runs = 0
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value)
			}
		}
		var onerror = run(rejectCurrent)
		try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
	}

	executeOnce(executor)
}
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value)
			else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
		})
		if (typeof instance.retry === "function" && state === instance.state) instance.retry()
	}
	var resolveNext, rejectNext
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
	return promise
}
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
}
PromisePolyfill.prototype.finally = function(callback) {
	return this.then(
		function(value) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return value
			})
		},
		function(reason) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return PromisePolyfill.reject(reason);
			})
		}
	)
}
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value)})
}
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value)})
}
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = []
		if (list.length === 0) resolve([])
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++
					values[i] = value
					if (count === total) resolve(values)
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject)
				}
				else consume(list[i])
			})(i)
		}
	})
}
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject)
		}
	})
}

module.exports = PromisePolyfill
  })();
});

require.register("mithril/promise/promise.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var PromisePolyfill = require("./polyfill")

if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") {
		window.Promise = PromisePolyfill
	} else if (!window.Promise.prototype.finally) {
		window.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = window.Promise
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") {
		global.Promise = PromisePolyfill
	} else if (!global.Promise.prototype.finally) {
		global.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = global.Promise
} else {
	module.exports = PromisePolyfill
}
  })();
});

require.register("mithril/querystring/build.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

module.exports = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""

	var args = []
	for (var key in object) {
		destructure(key, object[key])
	}

	return args.join("&")

	function destructure(key, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
	}
}
  })();
});

require.register("mithril/querystring/parse.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

module.exports = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)

	var entries = string.split("&"), counters = {}, data = {}
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=")
		var key = decodeURIComponent(entry[0])
		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : ""

		if (value === "true") value = true
		else if (value === "false") value = false

		var levels = key.split(/\]\[?|\[/)
		var cursor = data
		if (key.indexOf("[") > -1) levels.pop()
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1]
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			if (level === "") {
				var key = levels.slice(0, j).join()
				if (counters[key] == null) {
					counters[key] = Array.isArray(cursor) ? cursor.length : 0
				}
				level = counters[key]++
			}
			// Disallow direct prototype pollution
			else if (level === "__proto__") break
			if (j === levels.length - 1) cursor[level] = value
			else {
				// Read own properties exclusively to disallow indirect
				// prototype pollution
				var desc = Object.getOwnPropertyDescriptor(cursor, level)
				if (desc != null) desc = desc.value
				if (desc == null) cursor[level] = desc = isNumber ? [] : {}
				cursor = desc
			}
		}
	}
	return data
}
  })();
});

require.register("mithril/render.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

module.exports = require("./render/render")(window)
  })();
});

require.register("mithril/render/fragment.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var Vnode = require("../render/vnode")
var hyperscriptVnode = require("./hyperscriptVnode")

module.exports = function() {
	var vnode = hyperscriptVnode.apply(0, arguments)

	vnode.tag = "["
	vnode.children = Vnode.normalizeChildren(vnode.children)
	return vnode
}
  })();
});

require.register("mithril/render/hyperscript.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var Vnode = require("../render/vnode")
var hyperscriptVnode = require("./hyperscriptVnode")

var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}
var hasOwn = {}.hasOwnProperty

function isEmpty(object) {
	for (var key in object) if (hasOwn.call(object, key)) return false
	return true
}

function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {}
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2]
		if (type === "" && value !== "") tag = value
		else if (type === "#") attrs.id = value
		else if (type === ".") classes.push(value)
		else if (match[3][0] === "[") {
			var attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			if (match[4] === "class") classes.push(attrValue)
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ")
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}

function execSelector(state, vnode) {
	var attrs = vnode.attrs
	var children = Vnode.normalizeChildren(vnode.children)
	var hasClass = hasOwn.call(attrs, "class")
	var className = hasClass ? attrs.class : attrs.className

	vnode.tag = state.tag
	vnode.attrs = null
	vnode.children = undefined

	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
		var newAttrs = {}

		for (var key in attrs) {
			if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key]
		}

		attrs = newAttrs
	}

	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)){
			attrs[key] = state.attrs[key]
		}
	}
	if (className != null || state.attrs.className != null) attrs.className =
		className != null
			? state.attrs.className != null
				? String(state.attrs.className) + " " + String(className)
				: className
			: state.attrs.className != null
				? state.attrs.className
				: null

	if (hasClass) attrs.class = null

	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			vnode.attrs = attrs
			break
		}
	}

	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		vnode.text = children[0].children
	} else {
		vnode.children = children
	}

	return vnode
}

function hyperscript(selector) {
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}

	var vnode = hyperscriptVnode.apply(1, arguments)

	if (typeof selector === "string") {
		vnode.children = Vnode.normalizeChildren(vnode.children)
		if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
	}

	vnode.tag = selector
	return vnode
}

module.exports = hyperscript
  })();
});

require.register("mithril/render/hyperscriptVnode.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var Vnode = require("../render/vnode")

// Call via `hyperscriptVnode.apply(startOffset, arguments)`
//
// The reason I do it this way, forwarding the arguments and passing the start
// offset in `this`, is so I don't have to create a temporary array in a
// performance-critical path.
//
// In native ES6, I'd instead add a final `...args` parameter to the
// `hyperscript` and `fragment` factories and define this as
// `hyperscriptVnode(...args)`, since modern engines do optimize that away. But
// ES5 (what Mithril requires thanks to IE support) doesn't give me that luxury,
// and engines aren't nearly intelligent enough to do either of these:
//
// 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
//    another function only to be indexed.
// 2. Elide an `arguments` allocation when it's passed to any function other
//    than `Function.prototype.apply` or `Reflect.apply`.
//
// In ES6, it'd probably look closer to this (I'd need to profile it, though):
// module.exports = function(attrs, ...children) {
//     if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
//         if (children.length === 1 && Array.isArray(children[0])) children = children[0]
//     } else {
//         children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
//         attrs = undefined
//     }
//
//     if (attrs == null) attrs = {}
//     return Vnode("", attrs.key, attrs, children)
// }
module.exports = function() {
	var attrs = arguments[this], start = this + 1, children

	if (attrs == null) {
		attrs = {}
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {}
		start = this
	}

	if (arguments.length === start + 1) {
		children = arguments[start]
		if (!Array.isArray(children)) children = [children]
	} else {
		children = []
		while (start < arguments.length) children.push(arguments[start++])
	}

	return Vnode("", attrs.key, attrs, children)
}
  })();
});

require.register("mithril/render/render.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var Vnode = require("../render/vnode")

module.exports = function($window) {
	var $doc = $window && $window.document
	var currentRedraw

	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	}

	function getNameSpace(vnode) {
		return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
	}

	//sanity check to discourage people from doing `vnode.state = ...`
	function checkState(vnode, original) {
		if (vnode.state !== original) throw new Error("`vnode.state` must not be modified")
	}

	//Note: the hook is passed as the `this` argument to allow proxying the
	//arguments without requiring a full array allocation to do so. It also
	//takes advantage of the fact the current `vnode` is the first argument in
	//all lifecycle methods.
	function callHook(vnode) {
		var original = vnode.state
		try {
			return this.apply(original, arguments)
		} finally {
			checkState(vnode, original)
		}
	}

	// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
	// inside an iframe. Catch and swallow this error, and heavy-handidly return null.
	function activeElement() {
		try {
			return $doc.activeElement
		} catch (e) {
			return null
		}
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling)
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		if (typeof tag === "string") {
			vnode.state = {}
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
			switch (tag) {
				case "#": createText(parent, vnode, nextSibling); break
				case "<": createHTML(parent, vnode, ns, nextSibling); break
				case "[": createFragment(parent, vnode, hooks, ns, nextSibling); break
				default: createElement(parent, vnode, hooks, ns, nextSibling)
			}
		}
		else createComponent(parent, vnode, hooks, ns, nextSibling)
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children)
		insertNode(parent, vnode.dom, nextSibling)
	}
	var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}
	function createHTML(parent, vnode, ns, nextSibling) {
		var match = vnode.children.match(/^\s*?<(\w+)/im) || []
		// not using the proper parent makes the child element(s) vanish.
		//     var div = document.createElement("div")
		//     div.innerHTML = "<td>i</td><td>j</td>"
		//     console.log(div.innerHTML)
		// --> "ij", no <td> in sight.
		var temp = $doc.createElement(possibleParents[match[1]] || "div")
		if (ns === "http://www.w3.org/2000/svg") {
			temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode.children + "</svg>"
			temp = temp.firstChild
		} else {
			temp.innerHTML = vnode.children
		}
		vnode.dom = temp.firstChild
		vnode.domSize = temp.childNodes.length
		// Capture nodes to remove, so we don't confuse them.
		vnode.instance = []
		var fragment = $doc.createDocumentFragment()
		var child
		while (child = temp.firstChild) {
			vnode.instance.push(child)
			fragment.appendChild(child)
		}
		insertNode(parent, fragment, nextSibling)
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment()
		if (vnode.children != null) {
			var children = vnode.children
			createNodes(fragment, children, 0, children.length, hooks, null, ns)
		}
		vnode.dom = fragment.firstChild
		vnode.domSize = fragment.childNodes.length
		insertNode(parent, fragment, nextSibling)
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		var attrs = vnode.attrs
		var is = attrs && attrs.is

		ns = getNameSpace(vnode) || ns

		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
		vnode.dom = element

		if (attrs != null) {
			setAttrs(vnode, attrs, ns)
		}

		insertNode(parent, element, nextSibling)

		if (!maybeSetContentEditable(vnode)) {
			if (vnode.text != null) {
				if (vnode.text !== "") element.textContent = vnode.text
				else vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			}
			if (vnode.children != null) {
				var children = vnode.children
				createNodes(element, children, 0, children.length, hooks, null, ns)
				if (vnode.tag === "select" && attrs != null) setLateSelectAttrs(vnode, attrs)
			}
		}
	}
	function initComponent(vnode, hooks) {
		var sentinel
		if (typeof vnode.tag.view === "function") {
			vnode.state = Object.create(vnode.tag)
			sentinel = vnode.state.view
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
		} else {
			vnode.state = void 0
			sentinel = vnode.tag
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
			vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
		}
		initLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		initComponent(vnode, hooks)
		if (vnode.instance != null) {
			createNode(parent, vnode.instance, hooks, ns, nextSibling)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
		}
		else {
			vnode.domSize = 0
		}
	}

	//update
	/**
	 * @param {Element|Fragment} parent - the parent element
	 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
	 *                               this part of the tree
	 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
	 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
	 * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
	 *                                       fragment that is not the last item in its
	 *                                       parent
	 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
	 * @returns void
	 */
	// This function diffs and patches lists of vnodes, both keyed and unkeyed.
	//
	// We will:
	//
	// 1. describe its general structure
	// 2. focus on the diff algorithm optimizations
	// 3. discuss DOM node operations.

	// ## Overview:
	//
	// The updateNodes() function:
	// - deals with trivial cases
	// - determines whether the lists are keyed or unkeyed based on the first non-null node
	//   of each list.
	// - diffs them and patches the DOM if needed (that's the brunt of the code)
	// - manages the leftovers: after diffing, are there:
	//   - old nodes left to remove?
	// 	 - new nodes to insert?
	// 	 deal with them!
	//
	// The lists are only iterated over once, with an exception for the nodes in `old` that
	// are visited in the fourth part of the diff and in the `removeNodes` loop.

	// ## Diffing
	//
	// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
	// may be good for context on longest increasing subsequence-based logic for moving nodes.
	//
	// In order to diff keyed lists, one has to
	//
	// 1) match nodes in both lists, per key, and update them accordingly
	// 2) create the nodes present in the new list, but absent in the old one
	// 3) remove the nodes present in the old list, but absent in the new one
	// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
	//
	// To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
	// over the new list and for each new vnode, find the corresponding vnode in the old list using
	// the map.
	// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
	// and must be created.
	// For the removals, we actually remove the nodes that have been updated from the old list.
	// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
	// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
	// algorithm.
	//
	// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
	// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
	// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
	//  match the above lists, for example).
	//
	// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
	// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
	//
	// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
	// the longest increasing subsequence *of old nodes still present in the new list*).
	//
	// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
	// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
	// the `LIS` and a temporary one to create the LIS).
	//
	// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
	// the LIS and can be updated without moving them.
	//
	// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
	// the exception of the last node if the list is fully reversed).
	//
	// ## Finding the next sibling.
	//
	// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
	// When the list is being traversed top-down, at any index, the DOM nodes up to the previous
	// vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
	// list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
	//
	// In the other scenarios (swaps, upwards traversal, map-based diff),
	// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
	// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
	// as the next sibling (cached in the `nextSibling` variable).


	// ## DOM node moves
	//
	// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
	// this is not the case if the node moved (second and fourth part of the diff algo). We move
	// the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
	// variable rather than fetching it using `getNextSibling()`.
	//
	// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
	// like #1791 and #1999. We need to be smarter about those situations where adjascent old
	// nodes remain together in the new list in a way that isn't covered by parts one and
	// three of the diff algo.

	function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
		else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length)
		else {
			var isOldKeyed = old[0] != null && old[0].key != null
			var isKeyed = vnodes[0] != null && vnodes[0].key != null
			var start = 0, oldStart = 0
			if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++
			if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++
			if (isKeyed === null && isOldKeyed == null) return // both lists are full of nulls
			if (isOldKeyed !== isKeyed) {
				removeNodes(parent, old, oldStart, old.length)
				createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else if (!isKeyed) {
				// Don't index past the end of either list (causes deopts).
				var commonLength = old.length < vnodes.length ? old.length : vnodes.length
				// Rewind if necessary to the first non-null index on either side.
				// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
				// but that would be optimizing for sparse lists which are more rare than dense ones.
				start = start < oldStart ? start : oldStart
				for (; start < commonLength; start++) {
					o = old[start]
					v = vnodes[start]
					if (o === v || o == null && v == null) continue
					else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling))
					else if (v == null) removeNode(parent, o)
					else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns)
				}
				if (old.length > commonLength) removeNodes(parent, old, start, old.length)
				if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else {
				// keyed diff
				var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling

				// bottom-up
				while (oldEnd >= oldStart && end >= start) {
					oe = old[oldEnd]
					ve = vnodes[end]
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
				}
				// top-down
				while (oldEnd >= oldStart && end >= start) {
					o = old[oldStart]
					v = vnodes[start]
					if (o.key !== v.key) break
					oldStart++, start++
					if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns)
				}
				// swaps and list reversals
				while (oldEnd >= oldStart && end >= start) {
					if (start === end) break
					if (o.key !== ve.key || oe.key !== v.key) break
					topSibling = getNextSibling(old, oldStart, nextSibling)
					moveNodes(parent, oe, topSibling)
					if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns)
					if (++start <= --end) moveNodes(parent, o, nextSibling)
					if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldStart++; oldEnd--
					oe = old[oldEnd]
					ve = vnodes[end]
					o = old[oldStart]
					v = vnodes[start]
				}
				// bottom up once again
				while (oldEnd >= oldStart && end >= start) {
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
					oe = old[oldEnd]
					ve = vnodes[end]
				}
				if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1)
				else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
				else {
					// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
					var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices
					for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1
					for (i = end; i >= start; i--) {
						if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1)
						ve = vnodes[i]
						var oldIndex = map[ve.key]
						if (oldIndex != null) {
							pos = (oldIndex < pos) ? oldIndex : -1 // becomes -1 if nodes were re-ordered
							oldIndices[i-start] = oldIndex
							oe = old[oldIndex]
							old[oldIndex] = null
							if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
							if (ve.dom != null) nextSibling = ve.dom
							matched++
						}
					}
					nextSibling = originalNextSibling
					if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1)
					if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
					else {
						if (pos === -1) {
							// the indices of the indices of the items that are part of the
							// longest increasing subsequence in the oldIndices list
							lisIndices = makeLisIndices(oldIndices)
							li = lisIndices.length - 1
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								else {
									if (lisIndices[li] === i - start) li--
									else moveNodes(parent, v, nextSibling)
								}
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						} else {
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						}
					}
				}
			}
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
		var oldTag = old.tag, tag = vnode.tag
		if (oldTag === tag) {
			vnode.state = old.state
			vnode.events = old.events
			if (shouldNotUpdate(vnode, old)) return
			if (typeof oldTag === "string") {
				if (vnode.attrs != null) {
					updateLifecycle(vnode.attrs, vnode, hooks)
				}
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, ns, nextSibling); break
					case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, hooks, ns)
				}
			}
			else updateComponent(parent, old, vnode, hooks, nextSibling, ns)
		}
		else {
			removeNode(parent, old)
			createNode(parent, vnode, hooks, ns, nextSibling)
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children
		}
		vnode.dom = old.dom
	}
	function updateHTML(parent, old, vnode, ns, nextSibling) {
		if (old.children !== vnode.children) {
			removeHTML(parent, old)
			createHTML(parent, vnode, ns, nextSibling)
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
			vnode.instance = old.instance
		}
	}
	function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns)
		var domSize = 0, children = vnode.children
		vnode.dom = null
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i]
				if (child != null && child.dom != null) {
					if (vnode.dom == null) vnode.dom = child.dom
					domSize += child.domSize || 1
				}
			}
			if (domSize !== 1) vnode.domSize = domSize
		}
	}
	function updateElement(old, vnode, hooks, ns) {
		var element = vnode.dom = old.dom
		ns = getNameSpace(vnode) || ns

		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) vnode.attrs = {}
			if (vnode.text != null) {
				vnode.attrs.value = vnode.text //FIXME handle multiple children
				vnode.text = undefined
			}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns)
		if (!maybeSetContentEditable(vnode)) {
			if (old.text != null && vnode.text != null && vnode.text !== "") {
				if (old.text.toString() !== vnode.text.toString()) old.dom.firstChild.nodeValue = vnode.text
			}
			else {
				if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
				if (vnode.text != null) vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
				updateNodes(element, old.children, vnode.children, hooks, null, ns)
			}
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, ns) {
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		updateLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
		if (vnode.instance != null) {
			if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
			else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.instance.domSize
		}
		else if (old.instance != null) {
			removeNode(parent, old.instance)
			vnode.dom = undefined
			vnode.domSize = 0
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
		}
	}
	function getKeyMap(vnodes, start, end) {
		var map = Object.create(null)
		for (; start < end; start++) {
			var vnode = vnodes[start]
			if (vnode != null) {
				var key = vnode.key
				if (key != null) map[key] = start
			}
		}
		return map
	}
	// Lifted from ivi https://github.com/ivijs/ivi/
	// takes a list of unique numbers (-1 is special and can
	// occur multiple times) and returns an array with the indices
	// of the items that are part of the longest increasing
	// subsequece
	var lisTemp = []
	function makeLisIndices(a) {
		var result = [0]
		var u = 0, v = 0, i = 0
		var il = lisTemp.length = a.length
		for (var i = 0; i < il; i++) lisTemp[i] = a[i]
		for (var i = 0; i < il; ++i) {
			if (a[i] === -1) continue
			var j = result[result.length - 1]
			if (a[j] < a[i]) {
				lisTemp[i] = j
				result.push(i)
				continue
			}
			u = 0
			v = result.length - 1
			while (u < v) {
				// Fast integer average without overflow.
				// eslint-disable-next-line no-bitwise
				var c = (u >>> 1) + (v >>> 1) + (u & v & 1)
				if (a[result[c]] < a[i]) {
					u = c + 1
				}
				else {
					v = c
				}
			}
			if (a[i] < a[result[u]]) {
				if (u > 0) lisTemp[i] = result[u - 1]
				result[u] = i
			}
		}
		u = result.length
		v = result[u - 1]
		while (u-- > 0) {
			result[u] = v
			v = lisTemp[v]
		}
		lisTemp.length = 0
		return result
	}

	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}

	// This covers a really specific edge case:
	// - Parent node is keyed and contains child
	// - Child is removed, returns unresolved promise in `onbeforeremove`
	// - Parent node is moved in keyed diff
	// - Remaining children still need moved appropriately
	//
	// Ideally, I'd track removed nodes as well, but that introduces a lot more
	// complexity and I'm not exactly interested in doing that.
	function moveNodes(parent, vnode, nextSibling) {
		var frag = $doc.createDocumentFragment()
		moveChildToFrag(parent, frag, vnode)
		insertNode(parent, frag, nextSibling)
	}
	function moveChildToFrag(parent, frag, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				for (var i = 0; i < vnode.instance.length; i++) {
					frag.appendChild(vnode.instance[i])
				}
			} else if (vnode.tag !== "[") {
				// Don't recurse for text nodes *or* elements, just fragments
				frag.appendChild(vnode.dom)
			} else if (vnode.children.length === 1) {
				vnode = vnode.children[0]
				if (vnode != null) continue
			} else {
				for (var i = 0; i < vnode.children.length; i++) {
					var child = vnode.children[i]
					if (child != null) moveChildToFrag(parent, frag, child)
				}
			}
			break
		}
	}

	function insertNode(parent, dom, nextSibling) {
		if (nextSibling != null) parent.insertBefore(dom, nextSibling)
		else parent.appendChild(dom)
	}

	function maybeSetContentEditable(vnode) {
		if (vnode.attrs == null || (
			vnode.attrs.contenteditable == null && // attribute
			vnode.attrs.contentEditable == null // property
		)) return false
		var children = vnode.children
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children
			if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
		}
		else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
		return true
	}

	//remove
	function removeNodes(parent, vnodes, start, end) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) removeNode(parent, vnode)
		}
	}
	function removeNode(parent, vnode) {
		var mask = 0
		var original = vnode.state
		var stateResult, attrsResult
		if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") {
			var result = callHook.call(vnode.state.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				mask = 1
				stateResult = result
			}
		}
		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
			var result = callHook.call(vnode.attrs.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				// eslint-disable-next-line no-bitwise
				mask |= 2
				attrsResult = result
			}
		}
		checkState(vnode, original)

		// If we can, try to fast-path it and avoid all the overhead of awaiting
		if (!mask) {
			onremove(vnode)
			removeChild(parent, vnode)
		} else {
			if (stateResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 1) { mask &= 2; if (!mask) reallyRemove() }
				}
				stateResult.then(next, next)
			}
			if (attrsResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 2) { mask &= 1; if (!mask) reallyRemove() }
				}
				attrsResult.then(next, next)
			}
		}

		function reallyRemove() {
			checkState(vnode, original)
			onremove(vnode)
			removeChild(parent, vnode)
		}
	}
	function removeHTML(parent, vnode) {
		for (var i = 0; i < vnode.instance.length; i++) {
			parent.removeChild(vnode.instance[i])
		}
	}
	function removeChild(parent, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				removeHTML(parent, vnode)
			} else {
				if (vnode.tag !== "[") {
					parent.removeChild(vnode.dom)
					if (!Array.isArray(vnode.children)) break
				}
				if (vnode.children.length === 1) {
					vnode = vnode.children[0]
					if (vnode != null) continue
				} else {
					for (var i = 0; i < vnode.children.length; i++) {
						var child = vnode.children[i]
						if (child != null) removeChild(parent, child)
					}
				}
			}
			break
		}
	}
	function onremove(vnode) {
		if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode)
		if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode)
		if (typeof vnode.tag !== "string") {
			if (vnode.instance != null) onremove(vnode.instance)
		} else {
			var children = vnode.children
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i]
					if (child != null) onremove(child)
				}
			}
		}
	}

	//attrs
	function setAttrs(vnode, attrs, ns) {
		for (var key in attrs) {
			setAttr(vnode, key, null, attrs[key], ns)
		}
	}
	function setAttr(vnode, key, old, value, ns) {
		if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object") return
		if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value)
		if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value)
		else if (key === "style") updateStyle(vnode.dom, old, value)
		else if (hasPropertyKey(vnode, key, ns)) {
			if (key === "value") {
				// Only do the coercion if we're actually going to check the value.
				/* eslint-disable no-implicit-coercion */
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value && vnode.dom === activeElement()) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return
				/* eslint-enable no-implicit-coercion */
			}
			// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
			if (vnode.tag === "input" && key === "type") vnode.dom.setAttribute(key, value)
			else vnode.dom[key] = value
		} else {
			if (typeof value === "boolean") {
				if (value) vnode.dom.setAttribute(key, "")
				else vnode.dom.removeAttribute(key)
			}
			else vnode.dom.setAttribute(key === "className" ? "class" : key, value)
		}
	}
	function removeAttr(vnode, key, old, ns) {
		if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
		if (key[0] === "o" && key[1] === "n" && !isLifecycleMethod(key)) updateEvent(vnode, key, undefined)
		else if (key === "style") updateStyle(vnode.dom, old, null)
		else if (
			hasPropertyKey(vnode, key, ns)
			&& key !== "className"
			&& !(key === "value" && (
				vnode.tag === "option"
				|| vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement()
			))
			&& !(vnode.tag === "input" && key === "type")
		) {
			vnode.dom[key] = null
		} else {
			var nsLastIndex = key.indexOf(":")
			if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1)
			if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key)
		}
	}
	function setLateSelectAttrs(vnode, attrs) {
		if ("value" in attrs) {
			if(attrs.value === null) {
				if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null
			} else {
				var normalized = "" + attrs.value // eslint-disable-line no-implicit-coercion
				if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
					vnode.dom.value = normalized
				}
			}
		}
		if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined)
	}
	function updateAttrs(vnode, old, attrs, ns) {
		if (attrs != null) {
			for (var key in attrs) {
				setAttr(vnode, key, old && old[key], attrs[key], ns)
			}
		}
		var val
		if (old != null) {
			for (var key in old) {
				if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
					removeAttr(vnode, key, val, ns)
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === activeElement() || vnode.tag === "option" && vnode.dom.parentNode === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function hasPropertyKey(vnode, key, ns) {
		// Filter out namespaced keys
		return ns === undefined && (
			// If it's a custom element, just keep it.
			vnode.tag.indexOf("-") > -1 || vnode.attrs != null && vnode.attrs.is ||
			// If it's a normal element, let's try to avoid a few browser bugs.
			key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
			// Defer the property check until *after* we check everything.
		) && key in vnode.dom
	}

	//style
	var uppercaseRegex = /[A-Z]/g
	function toLowerCase(capital) { return "-" + capital.toLowerCase() }
	function normalizeKey(key) {
		return key[0] === "-" && key[1] === "-" ? key :
			key === "cssFloat" ? "float" :
				key.replace(uppercaseRegex, toLowerCase)
	}
	function updateStyle(element, old, style) {
		if (old === style) {
			// Styles are equivalent, do nothing.
		} else if (style == null) {
			// New style is missing, just clear it.
			element.style.cssText = ""
		} else if (typeof style !== "object") {
			// New style is a string, let engine deal with patching.
			element.style.cssText = style
		} else if (old == null || typeof old !== "object") {
			// `old` is missing or a string, `style` is an object.
			element.style.cssText = ""
			// Add new style properties
			for (var key in style) {
				var value = style[key]
				if (value != null) element.style.setProperty(normalizeKey(key), String(value))
			}
		} else {
			// Both old & new are (different) objects.
			// Update style properties that have changed
			for (var key in style) {
				var value = style[key]
				if (value != null && (value = String(value)) !== String(old[key])) {
					element.style.setProperty(normalizeKey(key), value)
				}
			}
			// Remove style properties that no longer exist
			for (var key in old) {
				if (old[key] != null && style[key] == null) {
					element.style.removeProperty(normalizeKey(key))
				}
			}
		}
	}

	// Here's an explanation of how this works:
	// 1. The event names are always (by design) prefixed by `on`.
	// 2. The EventListener interface accepts either a function or an object
	//    with a `handleEvent` method.
	// 3. The object does not inherit from `Object.prototype`, to avoid
	//    any potential interference with that (e.g. setters).
	// 4. The event name is remapped to the handler before calling it.
	// 5. In function-based event handlers, `ev.target === this`. We replicate
	//    that below.
	// 6. In function-based event handlers, `return false` prevents the default
	//    action and stops event propagation. We replicate that below.
	function EventDict() {
		// Save this, so the current redraw is correctly tracked.
		this._ = currentRedraw
	}
	EventDict.prototype = Object.create(null)
	EventDict.prototype.handleEvent = function (ev) {
		var handler = this["on" + ev.type]
		var result
		if (typeof handler === "function") result = handler.call(ev.currentTarget, ev)
		else if (typeof handler.handleEvent === "function") handler.handleEvent(ev)
		if (this._ && ev.redraw !== false) (0, this._)()
		if (result === false) {
			ev.preventDefault()
			ev.stopPropagation()
		}
	}

	//event
	function updateEvent(vnode, key, value) {
		if (vnode.events != null) {
			if (vnode.events[key] === value) return
			if (value != null && (typeof value === "function" || typeof value === "object")) {
				if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = value
			} else {
				if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = undefined
			}
		} else if (value != null && (typeof value === "function" || typeof value === "object")) {
			vnode.events = new EventDict()
			vnode.dom.addEventListener(key.slice(2), vnode.events, false)
			vnode.events[key] = value
		}
	}

	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") callHook.call(source.oninit, vnode)
		if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode))
	}
	function updateLifecycle(source, vnode, hooks) {
		if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode))
	}
	function shouldNotUpdate(vnode, old) {
		do {
			if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
				var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
				var force = callHook.call(vnode.state.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			return false
		} while (false); // eslint-disable-line no-constant-condition
		vnode.dom = old.dom
		vnode.domSize = old.domSize
		vnode.instance = old.instance
		// One would think having the actual latest attributes would be ideal,
		// but it doesn't let us properly diff based on our current internal
		// representation. We have to save not only the old DOM info, but also
		// the attributes used to create it, as we diff *that*, not against the
		// DOM directly (with a few exceptions in `setAttr`). And, of course, we
		// need to save the children and text as they are conceptually not
		// unlike special "attributes" internally.
		vnode.attrs = old.attrs
		vnode.children = old.children
		vnode.text = old.text
		return true
	}

	return function(dom, vnodes, redraw) {
		if (!dom) throw new TypeError("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
		var hooks = []
		var active = activeElement()
		var namespace = dom.namespaceURI

		// First time rendering into a node clears it out
		if (dom.vnodes == null) dom.textContent = ""

		vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes])
		var prevRedraw = currentRedraw
		try {
			currentRedraw = typeof redraw === "function" ? redraw : undefined
			updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
		} finally {
			currentRedraw = prevRedraw
		}
		dom.vnodes = vnodes
		// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
		if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus()
		for (var i = 0; i < hooks.length; i++) hooks[i]()
	}
}
  })();
});

require.register("mithril/render/trust.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var Vnode = require("../render/vnode")

module.exports = function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}
  })();
});

require.register("mithril/render/vnode.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

function Vnode(tag, key, attrs, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node == null || typeof node === "boolean") return null
	if (typeof node === "object") return node
	return Vnode("#", undefined, undefined, String(node), undefined, undefined)
}
Vnode.normalizeChildren = function(input) {
	var children = []
	if (input.length) {
		var isKeyed = input[0] != null && input[0].key != null
		// Note: this is a *very* perf-sensitive check.
		// Fun fact: merging the loop like this is somehow faster than splitting
		// it, noticeably so.
		for (var i = 1; i < input.length; i++) {
			if ((input[i] != null && input[i].key != null) !== isKeyed) {
				throw new TypeError("Vnodes must either always have keys or never have keys!")
			}
		}
		for (var i = 0; i < input.length; i++) {
			children[i] = Vnode.normalize(input[i])
		}
	}
	return children
}

module.exports = Vnode
  })();
});

require.register("mithril/request.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var PromisePolyfill = require("./promise/promise")
var mountRedraw = require("./mount-redraw")

module.exports = require("./request/request")(window, PromisePolyfill, mountRedraw.redraw)
  })();
});

require.register("mithril/request/request.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var buildPathname = require("../pathname/build")

module.exports = function($window, Promise, oncompletion) {
	var callbackCount = 0

	function PromiseProxy(executor) {
		return new Promise(executor)
	}

	// In case the global Promise is some userland library's where they rely on
	// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
	// similar. Let's *not* break them.
	PromiseProxy.prototype = Promise.prototype
	PromiseProxy.__proto__ = Promise // eslint-disable-line no-proto

	function makeRequest(factory) {
		return function(url, args) {
			if (typeof url !== "string") { args = url; url = url.url }
			else if (args == null) args = {}
			var promise = new Promise(function(resolve, reject) {
				factory(buildPathname(url, args.params), args, function (data) {
					if (typeof args.type === "function") {
						if (Array.isArray(data)) {
							for (var i = 0; i < data.length; i++) {
								data[i] = new args.type(data[i])
							}
						}
						else data = new args.type(data)
					}
					resolve(data)
				}, reject)
			})
			if (args.background === true) return promise
			var count = 0
			function complete() {
				if (--count === 0 && typeof oncompletion === "function") oncompletion()
			}

			return wrap(promise)

			function wrap(promise) {
				var then = promise.then
				// Set the constructor, so engines know to not await or resolve
				// this as a native promise. At the time of writing, this is
				// only necessary for V8, but their behavior is the correct
				// behavior per spec. See this spec issue for more details:
				// https://github.com/tc39/ecma262/issues/1577. Also, see the
				// corresponding comment in `request/tests/test-request.js` for
				// a bit more background on the issue at hand.
				promise.constructor = PromiseProxy
				promise.then = function() {
					count++
					var next = then.apply(promise, arguments)
					next.then(complete, function(e) {
						complete()
						if (count === 0) throw e
					})
					return wrap(next)
				}
				return promise
			}
		}
	}

	function hasHeader(args, name) {
		for (var key in args.headers) {
			if ({}.hasOwnProperty.call(args.headers, key) && name.test(key)) return true
		}
		return false
	}

	return {
		request: makeRequest(function(url, args, resolve, reject) {
			var method = args.method != null ? args.method.toUpperCase() : "GET"
			var body = args.body
			var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData)
			var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json")

			var xhr = new $window.XMLHttpRequest(), aborted = false
			var original = xhr, replacedAbort
			var abort = xhr.abort

			xhr.abort = function() {
				aborted = true
				abort.call(this)
			}

			xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)

			if (assumeJSON && body != null && !hasHeader(args, /^content-type$/i)) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (typeof args.deserialize !== "function" && !hasHeader(args, /^accept$/i)) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			if (args.timeout) xhr.timeout = args.timeout
			xhr.responseType = responseType

			for (var key in args.headers) {
				if ({}.hasOwnProperty.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key])
				}
			}

			xhr.onreadystatechange = function(ev) {
				// Don't throw errors on xhr.abort().
				if (aborted) return

				if (ev.target.readyState === 4) {
					try {
						var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url)
						// When the response type isn't "" or "text",
						// `xhr.responseText` is the wrong thing to use.
						// Browsers do the right thing and throw here, and we
						// should honor that and do the right thing by
						// preferring `xhr.response` where possible/practical.
						var response = ev.target.response, message

						if (responseType === "json") {
							// For IE and Edge, which don't implement
							// `responseType: "json"`.
							if (!ev.target.responseType && typeof args.extract !== "function") response = JSON.parse(ev.target.responseText)
						} else if (!responseType || responseType === "text") {
							// Only use this default if it's text. If a parsed
							// document is needed on old IE and friends (all
							// unsupported), the user should use a custom
							// `config` instead. They're already using this at
							// their own risk.
							if (response == null) response = ev.target.responseText
						}

						if (typeof args.extract === "function") {
							response = args.extract(ev.target, args)
							success = true
						} else if (typeof args.deserialize === "function") {
							response = args.deserialize(response)
						}
						if (success) resolve(response)
						else {
							try { message = ev.target.responseText }
							catch (e) { message = response }
							var error = new Error(message)
							error.code = ev.target.status
							error.response = response
							reject(error)
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}

			if (typeof args.config === "function") {
				xhr = args.config(xhr, args, url) || xhr

				// Propagate the `abort` to any replacement XHR as well.
				if (xhr !== original) {
					replacedAbort = xhr.abort
					xhr.abort = function() {
						aborted = true
						replacedAbort.call(this)
					}
				}
			}

			if (body == null) xhr.send()
			else if (typeof args.serialize === "function") xhr.send(args.serialize(body))
			else if (body instanceof $window.FormData) xhr.send(body)
			else xhr.send(JSON.stringify(body))
		}),
		jsonp: makeRequest(function(url, args, resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			var script = $window.document.createElement("script")
			$window[callbackName] = function(data) {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				resolve(data)
			}
			script.onerror = function() {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				reject(new Error("JSONP request failed"))
			}
			script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
				encodeURIComponent(args.callbackKey || "callback") + "=" +
				encodeURIComponent(callbackName)
			$window.document.documentElement.appendChild(script)
		}),
	}
}
  })();
});

require.register("mithril/route.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "mithril");
  (function() {
    "use strict"

var mountRedraw = require("./mount-redraw")

module.exports = require("./api/router")(window, mountRedraw)
  })();
});

require.register("moment/moment.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "moment");
  (function() {
    //! moment.js

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, (function () { 'use strict';

    var hookCallback;

    function hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
            return (Object.getOwnPropertyNames(obj).length === 0);
        } else {
            var k;
            for (k in obj) {
                if (obj.hasOwnProperty(k)) {
                    return false;
                }
            }
            return true;
        }
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false,
            parsedDateParts : [],
            meridiem        : null,
            rfc2822         : false,
            weekdayMismatch : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            var isNowValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.weekdayMismatch &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid = isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            }
            else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid (flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i = 0; i < momentProperties.length; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (hooks.suppressDeprecationWarnings === false &&
                (typeof console !==  'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (var key in arguments[0]) {
                            arg += key + ': ' + arguments[0][key] + ', ';
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) &&
                    !hasOwnProp(childConfig, prop) &&
                    isObject(parentConfig[prop])) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function calendar (key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        ss : '%d seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({unit: u, priority: priorities[u]});
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '', i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;

    var regexes = {};

    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get (mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function set$1 (mom, unit, value) {
        if (mom.isValid() && !isNaN(value)) {
            if (unit === 'FullYear' && isLeapYear(mom.year()) && mom.month() === 1 && mom.date() === 29) {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value, mom.month(), daysInMonth(value, mom.month()));
            }
            else {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
    }

    // MOMENTS

    function stringGet (units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }


    function stringSet (units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function mod(n, x) {
        return ((n % x) + x) % x;
    }

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
            return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1 ? (isLeapYear(year) ? 29 : 28) : (31 - modMonth % 7 % 2);
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
        if (!m) {
            return isArray(this._months) ? this._months :
                this._months['standalone'];
        }
        return isArray(this._months) ? this._months[m.month()] :
            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
        if (!m) {
            return isArray(this._monthsShort) ? this._monthsShort :
                this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    function createDate (y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date;
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            date = new Date(y + 400, m, d, h, M, s, ms);
            if (isFinite(date.getFullYear())) {
                date.setFullYear(y);
            }
        } else {
            date = new Date(y, m, d, h, M, s, ms);
        }

        return date;
    }

    function createUTCDate (y) {
        var date;
        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            var args = Array.prototype.slice.call(arguments);
            // preserve leap years using a full 400 year cycle, then reset
            args[0] = y + 400;
            date = new Date(Date.UTC.apply(null, args));
            if (isFinite(date.getUTCFullYear())) {
                date.setUTCFullYear(y);
            }
        } else {
            date = new Date(Date.UTC.apply(null, arguments));
        }

        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 6th is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd',   function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd',   function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES
    function shiftWeekdays (ws, n) {
        return ws.slice(n, 7).concat(ws.slice(0, n));
    }

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
        var weekdays = isArray(this._weekdays) ? this._weekdays :
            this._weekdays[(m && m !== true && this._weekdays.isFormat.test(format)) ? 'format' : 'standalone'];
        return (m === true) ? shiftWeekdays(weekdays, this._week.dow)
            : (m) ? weekdays[m.day()] : weekdays;
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return (m === true) ? shiftWeekdays(this._weekdaysShort, this._week.dow)
            : (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return (m === true) ? shiftWeekdays(this._weekdaysMin, this._week.dow)
            : (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse (weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ?
                this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ?
                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ?
                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }


    function computeWeekdaysParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('k',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour they want. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse
    };

    // internal storage for locale config files
    var locales = {};
    var localeFamilies = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return globalLocale;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                var aliasedRequire = require;
                aliasedRequire('./locale/' + name);
                getSetGlobalLocale(oldLocale);
            } catch (e) {}
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
            else {
                if ((typeof console !==  'undefined') && console.warn) {
                    //warn user if arguments are passed but the locale could not be set
                    console.warn('Locale ' + key +  ' not found. Did you forget to load it?');
                }
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, config) {
        if (config !== null) {
            var locale, parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    locale = loadLocale(config.parentLocale);
                    if (locale != null) {
                        parentConfig = locale._config;
                    } else {
                        if (!localeFamilies[config.parentLocale]) {
                            localeFamilies[config.parentLocale] = [];
                        }
                        localeFamilies[config.parentLocale].push({
                            name: name,
                            config: config
                        });
                        return null;
                    }
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);


            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, tmpLocale, parentConfig = baseConfig;
            // MERGE
            tmpLocale = loadLocale(name);
            if (tmpLocale != null) {
                parentConfig = tmpLocale._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys(locales);
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, expectedWeekday, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();

        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }

        // check for mismatching day of week
        if (config._w && typeof config._w.d !== 'undefined' && config._w.d !== expectedWeekday) {
            getParsingFlags(config).weekdayMismatch = true;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            var curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from beginning of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to beginning of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
    var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

    function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
        var result = [
            untruncateYear(yearStr),
            defaultLocaleMonthsShort.indexOf(monthStr),
            parseInt(dayStr, 10),
            parseInt(hourStr, 10),
            parseInt(minuteStr, 10)
        ];

        if (secondStr) {
            result.push(parseInt(secondStr, 10));
        }

        return result;
    }

    function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
            return 2000 + year;
        } else if (year <= 999) {
            return 1900 + year;
        }
        return year;
    }

    function preprocessRFC2822(s) {
        // Remove comments and folding whitespace and replace multiple-spaces with a single space
        return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
            // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
            var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
            if (weekdayProvided !== weekdayActual) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return false;
            }
        }
        return true;
    }

    var obsOffsets = {
        UT: 0,
        GMT: 0,
        EDT: -4 * 60,
        EST: -5 * 60,
        CDT: -5 * 60,
        CST: -6 * 60,
        MDT: -6 * 60,
        MST: -7 * 60,
        PDT: -7 * 60,
        PST: -8 * 60
    };

    function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
            return obsOffsets[obsOffset];
        } else if (militaryOffset) {
            // the only allowed military tz is Z
            return 0;
        } else {
            var hm = parseInt(numOffset, 10);
            var m = hm % 100, h = (hm - m) / 100;
            return h * 60 + m;
        }
    }

    // date and time from ref 2822 format
    function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i));
        if (match) {
            var parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
            if (!checkWeekday(match[1], parsedArray, config)) {
                return;
            }

            config._a = parsedArray;
            config._tzm = calculateOffset(match[8], match[9], match[10]);

            config._d = createUTCDate.apply(null, config._a);
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        // Final attempt, use Input Fallback
        hooks.createFromInputFallback(config);
    }

    hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
        'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
        'discouraged and will be removed in an upcoming major release. Please refer to ' +
        'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // constant that refers to the ISO standard
    hooks.ISO_8601 = function () {};

    // constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        }  else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if ((isObject(input) && isObjectEmpty(input)) ||
                (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
        'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other < this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

    function isDurationValid(m) {
        for (var key in m) {
            if (!(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                return false;
            }
        }

        var unitHasDecimal = false;
        for (var i = 0; i < ordering.length; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible to translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function absRound (number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // FORMATTING

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher);

        if (matches === null) {
            return null;
        }

        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ?
          0 :
          parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            }
            else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset () {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc () {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

    function createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (isNumber(input)) {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])                         * sign,
                h  : toInt(match[HOUR])                         * sign,
                m  : toInt(match[MINUTE])                       * sign,
                s  : toInt(match[SECOND])                       * sign,
                ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                w : parseIso(match[4], sign),
                d : parseIso(match[5], sign),
                h : parseIso(match[6], sign),
                m : parseIso(match[7], sign),
                s : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {milliseconds: 0, months: 0};
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add      = createAdder(1, 'add');
    var subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function calendar$1 (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween (from, to, units, inclusivity) {
        var localFrom = isMoment(from) ? from : createLocal(from),
            localTo = isMoment(to) ? to : createLocal(to);
        if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
            return false;
        }
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(localFrom, units) : !this.isBefore(localFrom, units)) &&
            (inclusivity[1] === ')' ? this.isBefore(localTo, units) : !this.isAfter(localTo, units));
    }

    function isSame (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter (input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore (input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff (input, units, asFloat) {
        var that,
            zoneDelta,
            output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        switch (units) {
            case 'year': output = monthDiff(this, that) / 12; break;
            case 'month': output = monthDiff(this, that); break;
            case 'quarter': output = monthDiff(this, that) / 3; break;
            case 'second': output = (this - that) / 1e3; break; // 1000
            case 'minute': output = (this - that) / 6e4; break; // 1000 * 60
            case 'hour': output = (this - that) / 36e5; break; // 1000 * 60 * 60
            case 'day': output = (this - that - zoneDelta) / 864e5; break; // 1000 * 60 * 60 * 24, negate dst
            case 'week': output = (this - that - zoneDelta) / 6048e5; break; // 1000 * 60 * 60 * 24 * 7, negate dst
            default: output = this - that;
        }

        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString(keepOffset) {
        if (!this.isValid()) {
            return null;
        }
        var utc = keepOffset !== true;
        var m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(m, utc ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ');
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            if (utc) {
                return this.toDate().toISOString();
            } else {
                return new Date(this.valueOf() + this.utcOffset() * 60 * 1000).toISOString().replace('Z', formatMoment(m, 'Z'));
            }
        }
        return formatMoment(m, utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ');
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect () {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment';
        var zone = '';
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        var prefix = '[' + func + '("]';
        var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
        var datetime = '-MM-DD[T]HH:mm:ss.SSS';
        var suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format (inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 createLocal(time).isValid())) {
            return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow (withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 createLocal(time).isValid())) {
            return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow (withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    var MS_PER_SECOND = 1000;
    var MS_PER_MINUTE = 60 * MS_PER_SECOND;
    var MS_PER_HOUR = 60 * MS_PER_MINUTE;
    var MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

    // actual modulo - handles negative numbers (for dates before 1970):
    function mod$1(dividend, divisor) {
        return (dividend % divisor + divisor) % divisor;
    }

    function localStartOfDate(y, m, d) {
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return new Date(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return new Date(y, m, d).valueOf();
        }
    }

    function utcStartOfDate(y, m, d) {
        // Date.UTC remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return Date.UTC(y, m, d);
        }
    }

    function startOf (units) {
        var time;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        var startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year(), 0, 1);
                break;
            case 'quarter':
                time = startOfDate(this.year(), this.month() - this.month() % 3, 1);
                break;
            case 'month':
                time = startOfDate(this.year(), this.month(), 1);
                break;
            case 'week':
                time = startOfDate(this.year(), this.month(), this.date() - this.weekday());
                break;
            case 'isoWeek':
                time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1));
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date());
                break;
            case 'hour':
                time = this._d.valueOf();
                time -= mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR);
                break;
            case 'minute':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_MINUTE);
                break;
            case 'second':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_SECOND);
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function endOf (units) {
        var time;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        var startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year() + 1, 0, 1) - 1;
                break;
            case 'quarter':
                time = startOfDate(this.year(), this.month() - this.month() % 3 + 3, 1) - 1;
                break;
            case 'month':
                time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                break;
            case 'week':
                time = startOfDate(this.year(), this.month(), this.date() - this.weekday() + 7) - 1;
                break;
            case 'isoWeek':
                time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1) + 7) - 1;
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                break;
            case 'hour':
                time = this._d.valueOf();
                time += MS_PER_HOUR - mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR) - 1;
                break;
            case 'minute':
                time = this._d.valueOf();
                time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                break;
            case 'second':
                time = this._d.valueOf();
                time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function valueOf () {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate () {
        return new Date(this.valueOf());
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON () {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2 () {
        return isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);


    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy);
    }

    function getSetISOWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIORITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict ?
          (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
          locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add               = add;
    proto.calendar          = calendar$1;
    proto.clone             = clone;
    proto.diff              = diff;
    proto.endOf             = endOf;
    proto.format            = format;
    proto.from              = from;
    proto.fromNow           = fromNow;
    proto.to                = to;
    proto.toNow             = toNow;
    proto.get               = stringGet;
    proto.invalidAt         = invalidAt;
    proto.isAfter           = isAfter;
    proto.isBefore          = isBefore;
    proto.isBetween         = isBetween;
    proto.isSame            = isSame;
    proto.isSameOrAfter     = isSameOrAfter;
    proto.isSameOrBefore    = isSameOrBefore;
    proto.isValid           = isValid$2;
    proto.lang              = lang;
    proto.locale            = locale;
    proto.localeData        = localeData;
    proto.max               = prototypeMax;
    proto.min               = prototypeMin;
    proto.parsingFlags      = parsingFlags;
    proto.set               = stringSet;
    proto.startOf           = startOf;
    proto.subtract          = subtract;
    proto.toArray           = toArray;
    proto.toObject          = toObject;
    proto.toDate            = toDate;
    proto.toISOString       = toISOString;
    proto.inspect           = inspect;
    proto.toJSON            = toJSON;
    proto.toString          = toString;
    proto.unix              = unix;
    proto.valueOf           = valueOf;
    proto.creationData      = creationData;
    proto.year       = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear    = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month       = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week           = proto.weeks        = getSetWeek;
    proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
    proto.weeksInYear    = getWeeksInYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.date       = getSetDayOfMonth;
    proto.day        = proto.days             = getSetDayOfWeek;
    proto.weekday    = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear  = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset            = getSetOffset;
    proto.utc                  = setOffsetToUTC;
    proto.local                = setOffsetToLocal;
    proto.parseZone            = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST                = isDaylightSavingTime;
    proto.isLocal              = isLocal;
    proto.isUtcOffset          = isUtcOffset;
    proto.isUtc                = isUtc;
    proto.isUTC                = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    function createUnix (input) {
        return createLocal(input * 1000);
    }

    function createInZone () {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat (string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar        = calendar;
    proto$1.longDateFormat  = longDateFormat;
    proto$1.invalidDate     = invalidDate;
    proto$1.ordinal         = ordinal;
    proto$1.preparse        = preParsePostFormat;
    proto$1.postformat      = preParsePostFormat;
    proto$1.relativeTime    = relativeTime;
    proto$1.pastFuture      = pastFuture;
    proto$1.set             = set;

    proto$1.months            =        localeMonths;
    proto$1.monthsShort       =        localeMonthsShort;
    proto$1.monthsParse       =        localeMonthsParse;
    proto$1.monthsRegex       = monthsRegex;
    proto$1.monthsShortRegex  = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

    proto$1.weekdays       =        localeWeekdays;
    proto$1.weekdaysMin    =        localeWeekdaysMin;
    proto$1.weekdaysShort  =        localeWeekdaysShort;
    proto$1.weekdaysParse  =        localeWeekdaysParse;

    proto$1.weekdaysRegex       =        weekdaysRegex;
    proto$1.weekdaysShortRegex  =        weekdaysShortRegex;
    proto$1.weekdaysMinRegex    =        weekdaysMinRegex;

    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1 (format, index, field, setter) {
        var locale = getLocale();
        var utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl (format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl (localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0;

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths (format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort (format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports

    hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
    hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

    var mathAbs = Math.abs;

    function abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function addSubtract$1 (duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function add$1 (input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1 (input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'quarter' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            switch (units) {
                case 'month':   return months;
                case 'quarter': return months / 3;
                case 'year':    return months / 12;
            }
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function valueOf$1 () {
        if (!this.isValid()) {
            return NaN;
        }
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asQuarters     = makeAs('Q');
    var asYears        = makeAs('y');

    function clone$1 () {
        return createDuration(this);
    }

    function get$2 (units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        ss: 44,         // a few seconds to seconds
        s : 45,         // seconds to minute
        m : 45,         // minutes to hour
        h : 22,         // hours to day
        d : 26,         // days to month
        M : 11          // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
        var duration = createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds <= thresholds.ss && ['s', seconds]  ||
                seconds < thresholds.s   && ['ss', seconds] ||
                minutes <= 1             && ['m']           ||
                minutes < thresholds.m   && ['mm', minutes] ||
                hours   <= 1             && ['h']           ||
                hours   < thresholds.h   && ['hh', hours]   ||
                days    <= 1             && ['d']           ||
                days    < thresholds.d   && ['dd', days]    ||
                months  <= 1             && ['M']           ||
                months  < thresholds.M   && ['MM', months]  ||
                years   <= 1             && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding (roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof(roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize (withSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var locale = this.localeData();
        var output = relativeTime$1(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function sign(x) {
        return ((x > 0) - (x < 0)) || +x;
    }

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000;
        var days         = abs$1(this._days);
        var months       = abs$1(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        var totalSign = total < 0 ? '-' : '';
        var ymSign = sign(this._months) !== sign(total) ? '-' : '';
        var daysSign = sign(this._days) !== sign(total) ? '-' : '';
        var hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

        return totalSign + 'P' +
            (Y ? ymSign + Y + 'Y' : '') +
            (M ? ymSign + M + 'M' : '') +
            (D ? daysSign + D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? hmsSign + h + 'H' : '') +
            (m ? hmsSign + m + 'M' : '') +
            (s ? hmsSign + s + 'S' : '');
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid        = isValid$1;
    proto$2.abs            = abs;
    proto$2.add            = add$1;
    proto$2.subtract       = subtract$1;
    proto$2.as             = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds      = asSeconds;
    proto$2.asMinutes      = asMinutes;
    proto$2.asHours        = asHours;
    proto$2.asDays         = asDays;
    proto$2.asWeeks        = asWeeks;
    proto$2.asMonths       = asMonths;
    proto$2.asQuarters     = asQuarters;
    proto$2.asYears        = asYears;
    proto$2.valueOf        = valueOf$1;
    proto$2._bubble        = bubble;
    proto$2.clone          = clone$1;
    proto$2.get            = get$2;
    proto$2.milliseconds   = milliseconds;
    proto$2.seconds        = seconds;
    proto$2.minutes        = minutes;
    proto$2.hours          = hours;
    proto$2.days           = days;
    proto$2.weeks          = weeks;
    proto$2.months         = months;
    proto$2.years          = years;
    proto$2.humanize       = humanize;
    proto$2.toISOString    = toISOString$1;
    proto$2.toString       = toISOString$1;
    proto$2.toJSON         = toISOString$1;
    proto$2.locale         = locale;
    proto$2.localeData     = localeData;

    proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
    proto$2.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    hooks.version = '2.24.0';

    setHookCallback(createLocal);

    hooks.fn                    = proto;
    hooks.min                   = min;
    hooks.max                   = max;
    hooks.now                   = now;
    hooks.utc                   = createUTC;
    hooks.unix                  = createUnix;
    hooks.months                = listMonths;
    hooks.isDate                = isDate;
    hooks.locale                = getSetGlobalLocale;
    hooks.invalid               = createInvalid;
    hooks.duration              = createDuration;
    hooks.isMoment              = isMoment;
    hooks.weekdays              = listWeekdays;
    hooks.parseZone             = createInZone;
    hooks.localeData            = getLocale;
    hooks.isDuration            = isDuration;
    hooks.monthsShort           = listMonthsShort;
    hooks.weekdaysMin           = listWeekdaysMin;
    hooks.defineLocale          = defineLocale;
    hooks.updateLocale          = updateLocale;
    hooks.locales               = listLocales;
    hooks.weekdaysShort         = listWeekdaysShort;
    hooks.normalizeUnits        = normalizeUnits;
    hooks.relativeTimeRounding  = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat        = getCalendarFormat;
    hooks.prototype             = proto;

    // currently HTML5 input type only supports 24-hour formats
    hooks.HTML5_FMT = {
        DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',             // <input type="datetime-local" />
        DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss',  // <input type="datetime-local" step="1" />
        DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS',   // <input type="datetime-local" step="0.001" />
        DATE: 'YYYY-MM-DD',                             // <input type="date" />
        TIME: 'HH:mm',                                  // <input type="time" />
        TIME_SECONDS: 'HH:mm:ss',                       // <input type="time" step="1" />
        TIME_MS: 'HH:mm:ss.SSS',                        // <input type="time" step="0.001" />
        WEEK: 'GGGG-[W]WW',                             // <input type="week" />
        MONTH: 'YYYY-MM'                                // <input type="month" />
    };

    return hooks;

})));
  })();
});

require.register("ramda/src/F.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    /**
 * A function that always returns `false`. Any passed in parameters are ignored.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Function
 * @sig * -> Boolean
 * @param {*}
 * @return {Boolean}
 * @see R.T
 * @example
 *
 *      R.F(); //=> false
 */
var F = function () {
  return false;
};
module.exports = F;
  })();
});

require.register("ramda/src/T.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    /**
 * A function that always returns `true`. Any passed in parameters are ignored.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Function
 * @sig * -> Boolean
 * @param {*}
 * @return {Boolean}
 * @see R.F
 * @example
 *
 *      R.T(); //=> true
 */
var T = function () {
  return true;
};
module.exports = T;
  })();
});

require.register("ramda/src/__.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    /**
 * A special placeholder value used to specify "gaps" within curried functions,
 * allowing partial application of any combination of arguments, regardless of
 * their positions.
 *
 * If `g` is a curried ternary function and `_` is `R.__`, the following are
 * equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2, _)(1, 3)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @name __
 * @constant
 * @memberOf R
 * @since v0.6.0
 * @category Function
 * @example
 *
 *      const greet = R.replace('{name}', R.__, 'Hello, {name}!');
 *      greet('Alice'); //=> 'Hello, Alice!'
 */
module.exports = { '@@functional/placeholder': true };
  })();
});

require.register("ramda/src/add.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Adds two values.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} a
 * @param {Number} b
 * @return {Number}
 * @see R.subtract
 * @example
 *
 *      R.add(2, 3);       //=>  5
 *      R.add(7)(10);      //=> 17
 */


var add = /*#__PURE__*/_curry2(function add(a, b) {
  return Number(a) + Number(b);
});
module.exports = add;
  })();
});

require.register("ramda/src/addIndex.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _concat = /*#__PURE__*/require('./internal/_concat');

var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var curryN = /*#__PURE__*/require('./curryN');

/**
 * Creates a new list iteration function from an existing one by adding two new
 * parameters to its callback function: the current index, and the entire list.
 *
 * This would turn, for instance, [`R.map`](#map) function into one that
 * more closely resembles `Array.prototype.map`. Note that this will only work
 * for functions in which the iteration callback function is the first
 * parameter, and where the list is the last parameter. (This latter might be
 * unimportant if the list parameter is not used.)
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Function
 * @category List
 * @sig ((a ... -> b) ... -> [a] -> *) -> ((a ..., Int, [a] -> b) ... -> [a] -> *)
 * @param {Function} fn A list iteration function that does not pass index or list to its callback
 * @return {Function} An altered list iteration function that passes (item, index, list) to its callback
 * @example
 *
 *      const mapIndexed = R.addIndex(R.map);
 *      mapIndexed((val, idx) => idx + '-' + val, ['f', 'o', 'o', 'b', 'a', 'r']);
 *      //=> ['0-f', '1-o', '2-o', '3-b', '4-a', '5-r']
 */


var addIndex = /*#__PURE__*/_curry1(function addIndex(fn) {
  return curryN(fn.length, function () {
    var idx = 0;
    var origFn = arguments[0];
    var list = arguments[arguments.length - 1];
    var args = Array.prototype.slice.call(arguments, 0);
    args[0] = function () {
      var result = origFn.apply(this, _concat(arguments, [idx, list]));
      idx += 1;
      return result;
    };
    return fn.apply(this, args);
  });
});
module.exports = addIndex;
  })();
});

require.register("ramda/src/adjust.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _concat = /*#__PURE__*/require('./internal/_concat');

var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Applies a function to the value at the given index of an array, returning a
 * new copy of the array with the element at the given index replaced with the
 * result of the function application.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category List
 * @sig Number -> (a -> a) -> [a] -> [a]
 * @param {Number} idx The index.
 * @param {Function} fn The function to apply.
 * @param {Array|Arguments} list An array-like object whose value
 *        at the supplied index will be replaced.
 * @return {Array} A copy of the supplied array-like object with
 *         the element at index `idx` replaced with the value
 *         returned by applying `fn` to the existing element.
 * @see R.update
 * @example
 *
 *      R.adjust(1, R.toUpper, ['a', 'b', 'c', 'd']);      //=> ['a', 'B', 'c', 'd']
 *      R.adjust(-1, R.toUpper, ['a', 'b', 'c', 'd']);     //=> ['a', 'b', 'c', 'D']
 * @symb R.adjust(-1, f, [a, b]) = [a, f(b)]
 * @symb R.adjust(0, f, [a, b]) = [f(a), b]
 */


var adjust = /*#__PURE__*/_curry3(function adjust(idx, fn, list) {
  if (idx >= list.length || idx < -list.length) {
    return list;
  }
  var start = idx < 0 ? list.length : 0;
  var _idx = start + idx;
  var _list = _concat(list);
  _list[_idx] = fn(list[_idx]);
  return _list;
});
module.exports = adjust;
  })();
});

require.register("ramda/src/all.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xall = /*#__PURE__*/require('./internal/_xall');

/**
 * Returns `true` if all elements of the list match the predicate, `false` if
 * there are any that don't.
 *
 * Dispatches to the `all` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> Boolean
 * @param {Function} fn The predicate function.
 * @param {Array} list The array to consider.
 * @return {Boolean} `true` if the predicate is satisfied by every element, `false`
 *         otherwise.
 * @see R.any, R.none, R.transduce
 * @example
 *
 *      const equals3 = R.equals(3);
 *      R.all(equals3)([3, 3, 3, 3]); //=> true
 *      R.all(equals3)([3, 3, 1, 3]); //=> false
 */


var all = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['all'], _xall, function all(fn, list) {
  var idx = 0;
  while (idx < list.length) {
    if (!fn(list[idx])) {
      return false;
    }
    idx += 1;
  }
  return true;
}));
module.exports = all;
  })();
});

require.register("ramda/src/allPass.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var curryN = /*#__PURE__*/require('./curryN');

var max = /*#__PURE__*/require('./max');

var pluck = /*#__PURE__*/require('./pluck');

var reduce = /*#__PURE__*/require('./reduce');

/**
 * Takes a list of predicates and returns a predicate that returns true for a
 * given list of arguments if every one of the provided predicates is satisfied
 * by those arguments.
 *
 * The function returned is a curried function whose arity matches that of the
 * highest-arity predicate.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Logic
 * @sig [(*... -> Boolean)] -> (*... -> Boolean)
 * @param {Array} predicates An array of predicates to check
 * @return {Function} The combined predicate
 * @see R.anyPass
 * @example
 *
 *      const isQueen = R.propEq('rank', 'Q');
 *      const isSpade = R.propEq('suit', '♠︎');
 *      const isQueenOfSpades = R.allPass([isQueen, isSpade]);
 *
 *      isQueenOfSpades({rank: 'Q', suit: '♣︎'}); //=> false
 *      isQueenOfSpades({rank: 'Q', suit: '♠︎'}); //=> true
 */


var allPass = /*#__PURE__*/_curry1(function allPass(preds) {
  return curryN(reduce(max, 0, pluck('length', preds)), function () {
    var idx = 0;
    var len = preds.length;
    while (idx < len) {
      if (!preds[idx].apply(this, arguments)) {
        return false;
      }
      idx += 1;
    }
    return true;
  });
});
module.exports = allPass;
  })();
});

require.register("ramda/src/always.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Returns a function that always returns the given value. Note that for
 * non-primitives the value returned is a reference to the original value.
 *
 * This function is known as `const`, `constant`, or `K` (for K combinator) in
 * other languages and libraries.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig a -> (* -> a)
 * @param {*} val The value to wrap in a function
 * @return {Function} A Function :: * -> val.
 * @example
 *
 *      const t = R.always('Tee');
 *      t(); //=> 'Tee'
 */


var always = /*#__PURE__*/_curry1(function always(val) {
  return function () {
    return val;
  };
});
module.exports = always;
  })();
});

require.register("ramda/src/and.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns `true` if both arguments are `true`; `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig a -> b -> a | b
 * @param {Any} a
 * @param {Any} b
 * @return {Any} the first argument if it is falsy, otherwise the second argument.
 * @see R.both
 * @example
 *
 *      R.and(true, true); //=> true
 *      R.and(true, false); //=> false
 *      R.and(false, true); //=> false
 *      R.and(false, false); //=> false
 */


var and = /*#__PURE__*/_curry2(function and(a, b) {
  return a && b;
});
module.exports = and;
  })();
});

require.register("ramda/src/any.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xany = /*#__PURE__*/require('./internal/_xany');

/**
 * Returns `true` if at least one of the elements of the list match the predicate,
 * `false` otherwise.
 *
 * Dispatches to the `any` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> Boolean
 * @param {Function} fn The predicate function.
 * @param {Array} list The array to consider.
 * @return {Boolean} `true` if the predicate is satisfied by at least one element, `false`
 *         otherwise.
 * @see R.all, R.none, R.transduce
 * @example
 *
 *      const lessThan0 = R.flip(R.lt)(0);
 *      const lessThan2 = R.flip(R.lt)(2);
 *      R.any(lessThan0)([1, 2]); //=> false
 *      R.any(lessThan2)([1, 2]); //=> true
 */


var any = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['any'], _xany, function any(fn, list) {
  var idx = 0;
  while (idx < list.length) {
    if (fn(list[idx])) {
      return true;
    }
    idx += 1;
  }
  return false;
}));
module.exports = any;
  })();
});

require.register("ramda/src/anyPass.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var curryN = /*#__PURE__*/require('./curryN');

var max = /*#__PURE__*/require('./max');

var pluck = /*#__PURE__*/require('./pluck');

var reduce = /*#__PURE__*/require('./reduce');

/**
 * Takes a list of predicates and returns a predicate that returns true for a
 * given list of arguments if at least one of the provided predicates is
 * satisfied by those arguments.
 *
 * The function returned is a curried function whose arity matches that of the
 * highest-arity predicate.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Logic
 * @sig [(*... -> Boolean)] -> (*... -> Boolean)
 * @param {Array} predicates An array of predicates to check
 * @return {Function} The combined predicate
 * @see R.allPass
 * @example
 *
 *      const isClub = R.propEq('suit', '♣');
 *      const isSpade = R.propEq('suit', '♠');
 *      const isBlackCard = R.anyPass([isClub, isSpade]);
 *
 *      isBlackCard({rank: '10', suit: '♣'}); //=> true
 *      isBlackCard({rank: 'Q', suit: '♠'}); //=> true
 *      isBlackCard({rank: 'Q', suit: '♦'}); //=> false
 */


var anyPass = /*#__PURE__*/_curry1(function anyPass(preds) {
  return curryN(reduce(max, 0, pluck('length', preds)), function () {
    var idx = 0;
    var len = preds.length;
    while (idx < len) {
      if (preds[idx].apply(this, arguments)) {
        return true;
      }
      idx += 1;
    }
    return false;
  });
});
module.exports = anyPass;
  })();
});

require.register("ramda/src/ap.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _concat = /*#__PURE__*/require('./internal/_concat');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _reduce = /*#__PURE__*/require('./internal/_reduce');

var map = /*#__PURE__*/require('./map');

/**
 * ap applies a list of functions to a list of values.
 *
 * Dispatches to the `ap` method of the second argument, if present. Also
 * treats curried functions as applicatives.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Function
 * @sig [a -> b] -> [a] -> [b]
 * @sig Apply f => f (a -> b) -> f a -> f b
 * @sig (r -> a -> b) -> (r -> a) -> (r -> b)
 * @param {*} applyF
 * @param {*} applyX
 * @return {*}
 * @example
 *
 *      R.ap([R.multiply(2), R.add(3)], [1,2,3]); //=> [2, 4, 6, 4, 5, 6]
 *      R.ap([R.concat('tasty '), R.toUpper], ['pizza', 'salad']); //=> ["tasty pizza", "tasty salad", "PIZZA", "SALAD"]
 *
 *      // R.ap can also be used as S combinator
 *      // when only two functions are passed
 *      R.ap(R.concat, R.toUpper)('Ramda') //=> 'RamdaRAMDA'
 * @symb R.ap([f, g], [a, b]) = [f(a), f(b), g(a), g(b)]
 */


var ap = /*#__PURE__*/_curry2(function ap(applyF, applyX) {
  return typeof applyX['fantasy-land/ap'] === 'function' ? applyX['fantasy-land/ap'](applyF) : typeof applyF.ap === 'function' ? applyF.ap(applyX) : typeof applyF === 'function' ? function (x) {
    return applyF(x)(applyX(x));
  } : _reduce(function (acc, f) {
    return _concat(acc, map(f, applyX));
  }, [], applyF);
});
module.exports = ap;
  })();
});

require.register("ramda/src/aperture.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _aperture = /*#__PURE__*/require('./internal/_aperture');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xaperture = /*#__PURE__*/require('./internal/_xaperture');

/**
 * Returns a new list, composed of n-tuples of consecutive elements. If `n` is
 * greater than the length of the list, an empty list is returned.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category List
 * @sig Number -> [a] -> [[a]]
 * @param {Number} n The size of the tuples to create
 * @param {Array} list The list to split into `n`-length tuples
 * @return {Array} The resulting list of `n`-length tuples
 * @see R.transduce
 * @example
 *
 *      R.aperture(2, [1, 2, 3, 4, 5]); //=> [[1, 2], [2, 3], [3, 4], [4, 5]]
 *      R.aperture(3, [1, 2, 3, 4, 5]); //=> [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
 *      R.aperture(7, [1, 2, 3, 4, 5]); //=> []
 */


var aperture = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable([], _xaperture, _aperture));
module.exports = aperture;
  })();
});

require.register("ramda/src/append.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _concat = /*#__PURE__*/require('./internal/_concat');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns a new list containing the contents of the given list, followed by
 * the given element.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> [a]
 * @param {*} el The element to add to the end of the new list.
 * @param {Array} list The list of elements to add a new item to.
 *        list.
 * @return {Array} A new list containing the elements of the old list followed by `el`.
 * @see R.prepend
 * @example
 *
 *      R.append('tests', ['write', 'more']); //=> ['write', 'more', 'tests']
 *      R.append('tests', []); //=> ['tests']
 *      R.append(['tests'], ['write', 'more']); //=> ['write', 'more', ['tests']]
 */


var append = /*#__PURE__*/_curry2(function append(el, list) {
  return _concat(list, [el]);
});
module.exports = append;
  })();
});

require.register("ramda/src/apply.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Applies function `fn` to the argument list `args`. This is useful for
 * creating a fixed-arity function from a variadic function. `fn` should be a
 * bound function if context is significant.
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Function
 * @sig (*... -> a) -> [*] -> a
 * @param {Function} fn The function which will be called with `args`
 * @param {Array} args The arguments to call `fn` with
 * @return {*} result The result, equivalent to `fn(...args)`
 * @see R.call, R.unapply
 * @example
 *
 *      const nums = [1, 2, 3, -99, 42, 6, 7];
 *      R.apply(Math.max, nums); //=> 42
 * @symb R.apply(f, [a, b, c]) = f(a, b, c)
 */


var apply = /*#__PURE__*/_curry2(function apply(fn, args) {
  return fn.apply(this, args);
});
module.exports = apply;
  })();
});

require.register("ramda/src/applySpec.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var apply = /*#__PURE__*/require('./apply');

var curryN = /*#__PURE__*/require('./curryN');

var max = /*#__PURE__*/require('./max');

var pluck = /*#__PURE__*/require('./pluck');

var reduce = /*#__PURE__*/require('./reduce');

var keys = /*#__PURE__*/require('./keys');

var values = /*#__PURE__*/require('./values');

// Use custom mapValues function to avoid issues with specs that include a "map" key and R.map
// delegating calls to .map


function mapValues(fn, obj) {
  return keys(obj).reduce(function (acc, key) {
    acc[key] = fn(obj[key]);
    return acc;
  }, {});
}

/**
 * Given a spec object recursively mapping properties to functions, creates a
 * function producing an object of the same structure, by mapping each property
 * to the result of calling its associated function with the supplied arguments.
 *
 * @func
 * @memberOf R
 * @since v0.20.0
 * @category Function
 * @sig {k: ((a, b, ..., m) -> v)} -> ((a, b, ..., m) -> {k: v})
 * @param {Object} spec an object recursively mapping properties to functions for
 *        producing the values for these properties.
 * @return {Function} A function that returns an object of the same structure
 * as `spec', with each property set to the value returned by calling its
 * associated function with the supplied arguments.
 * @see R.converge, R.juxt
 * @example
 *
 *      const getMetrics = R.applySpec({
 *        sum: R.add,
 *        nested: { mul: R.multiply }
 *      });
 *      getMetrics(2, 4); // => { sum: 6, nested: { mul: 8 } }
 * @symb R.applySpec({ x: f, y: { z: g } })(a, b) = { x: f(a, b), y: { z: g(a, b) } }
 */
var applySpec = /*#__PURE__*/_curry1(function applySpec(spec) {
  spec = mapValues(function (v) {
    return typeof v == 'function' ? v : applySpec(v);
  }, spec);

  return curryN(reduce(max, 0, pluck('length', values(spec))), function () {
    var args = arguments;
    return mapValues(function (f) {
      return apply(f, args);
    }, spec);
  });
});
module.exports = applySpec;
  })();
});

require.register("ramda/src/applyTo.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Takes a value and applies a function to it.
 *
 * This function is also known as the `thrush` combinator.
 *
 * @func
 * @memberOf R
 * @since v0.25.0
 * @category Function
 * @sig a -> (a -> b) -> b
 * @param {*} x The value
 * @param {Function} f The function to apply
 * @return {*} The result of applying `f` to `x`
 * @example
 *
 *      const t42 = R.applyTo(42);
 *      t42(R.identity); //=> 42
 *      t42(R.add(1)); //=> 43
 */


var applyTo = /*#__PURE__*/_curry2(function applyTo(x, f) {
  return f(x);
});
module.exports = applyTo;
  })();
});

require.register("ramda/src/ascend.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Makes an ascending comparator function out of a function that returns a value
 * that can be compared with `<` and `>`.
 *
 * @func
 * @memberOf R
 * @since v0.23.0
 * @category Function
 * @sig Ord b => (a -> b) -> a -> a -> Number
 * @param {Function} fn A function of arity one that returns a value that can be compared
 * @param {*} a The first item to be compared.
 * @param {*} b The second item to be compared.
 * @return {Number} `-1` if fn(a) < fn(b), `1` if fn(b) < fn(a), otherwise `0`
 * @see R.descend
 * @example
 *
 *      const byAge = R.ascend(R.prop('age'));
 *      const people = [
 *        { name: 'Emma', age: 70 },
 *        { name: 'Peter', age: 78 },
 *        { name: 'Mikhail', age: 62 },
 *      ];
 *      const peopleByYoungestFirst = R.sort(byAge, people);
 *        //=> [{ name: 'Mikhail', age: 62 },{ name: 'Emma', age: 70 }, { name: 'Peter', age: 78 }]
 */


var ascend = /*#__PURE__*/_curry3(function ascend(fn, a, b) {
  var aa = fn(a);
  var bb = fn(b);
  return aa < bb ? -1 : aa > bb ? 1 : 0;
});
module.exports = ascend;
  })();
});

require.register("ramda/src/assoc.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Makes a shallow clone of an object, setting or overriding the specified
 * property with the given value. Note that this copies and flattens prototype
 * properties onto the new object as well. All non-primitive properties are
 * copied by reference.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @sig String -> a -> {k: v} -> {k: v}
 * @param {String} prop The property name to set
 * @param {*} val The new value
 * @param {Object} obj The object to clone
 * @return {Object} A new object equivalent to the original except for the changed property.
 * @see R.dissoc, R.pick
 * @example
 *
 *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
 */


var assoc = /*#__PURE__*/_curry3(function assoc(prop, val, obj) {
  var result = {};
  for (var p in obj) {
    result[p] = obj[p];
  }
  result[prop] = val;
  return result;
});
module.exports = assoc;
  })();
});

require.register("ramda/src/assocPath.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var _has = /*#__PURE__*/require('./internal/_has');

var _isArray = /*#__PURE__*/require('./internal/_isArray');

var _isInteger = /*#__PURE__*/require('./internal/_isInteger');

var assoc = /*#__PURE__*/require('./assoc');

var isNil = /*#__PURE__*/require('./isNil');

/**
 * Makes a shallow clone of an object, setting or overriding the nodes required
 * to create the given path, and placing the specific value at the tail end of
 * that path. Note that this copies and flattens prototype properties onto the
 * new object as well. All non-primitive properties are copied by reference.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig [Idx] -> a -> {a} -> {a}
 * @param {Array} path the path to set
 * @param {*} val The new value
 * @param {Object} obj The object to clone
 * @return {Object} A new object equivalent to the original except along the specified path.
 * @see R.dissocPath
 * @example
 *
 *      R.assocPath(['a', 'b', 'c'], 42, {a: {b: {c: 0}}}); //=> {a: {b: {c: 42}}}
 *
 *      // Any missing or non-object keys in path will be overridden
 *      R.assocPath(['a', 'b', 'c'], 42, {a: 5}); //=> {a: {b: {c: 42}}}
 */


var assocPath = /*#__PURE__*/_curry3(function assocPath(path, val, obj) {
  if (path.length === 0) {
    return val;
  }
  var idx = path[0];
  if (path.length > 1) {
    var nextObj = !isNil(obj) && _has(idx, obj) ? obj[idx] : _isInteger(path[1]) ? [] : {};
    val = assocPath(Array.prototype.slice.call(path, 1), val, nextObj);
  }
  if (_isInteger(idx) && _isArray(obj)) {
    var arr = [].concat(obj);
    arr[idx] = val;
    return arr;
  } else {
    return assoc(idx, val, obj);
  }
});
module.exports = assocPath;
  })();
});

require.register("ramda/src/binary.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var nAry = /*#__PURE__*/require('./nAry');

/**
 * Wraps a function of any arity (including nullary) in a function that accepts
 * exactly 2 parameters. Any extraneous parameters will not be passed to the
 * supplied function.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category Function
 * @sig (* -> c) -> (a, b -> c)
 * @param {Function} fn The function to wrap.
 * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
 *         arity 2.
 * @see R.nAry, R.unary
 * @example
 *
 *      const takesThreeArgs = function(a, b, c) {
 *        return [a, b, c];
 *      };
 *      takesThreeArgs.length; //=> 3
 *      takesThreeArgs(1, 2, 3); //=> [1, 2, 3]
 *
 *      const takesTwoArgs = R.binary(takesThreeArgs);
 *      takesTwoArgs.length; //=> 2
 *      // Only 2 arguments are passed to the wrapped function
 *      takesTwoArgs(1, 2, 3); //=> [1, 2, undefined]
 * @symb R.binary(f)(a, b, c) = f(a, b)
 */


var binary = /*#__PURE__*/_curry1(function binary(fn) {
  return nAry(2, fn);
});
module.exports = binary;
  })();
});

require.register("ramda/src/bind.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _arity = /*#__PURE__*/require('./internal/_arity');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Creates a function that is bound to a context.
 * Note: `R.bind` does not provide the additional argument-binding capabilities of
 * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category Function
 * @category Object
 * @sig (* -> *) -> {*} -> (* -> *)
 * @param {Function} fn The function to bind to context
 * @param {Object} thisObj The context to bind `fn` to
 * @return {Function} A function that will execute in the context of `thisObj`.
 * @see R.partial
 * @example
 *
 *      const log = R.bind(console.log, console);
 *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}
 *      // logs {a: 2}
 * @symb R.bind(f, o)(a, b) = f.call(o, a, b)
 */


var bind = /*#__PURE__*/_curry2(function bind(fn, thisObj) {
  return _arity(fn.length, function () {
    return fn.apply(thisObj, arguments);
  });
});
module.exports = bind;
  })();
});

require.register("ramda/src/both.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _isFunction = /*#__PURE__*/require('./internal/_isFunction');

var and = /*#__PURE__*/require('./and');

var lift = /*#__PURE__*/require('./lift');

/**
 * A function which calls the two provided functions and returns the `&&`
 * of the results.
 * It returns the result of the first function if it is false-y and the result
 * of the second function otherwise. Note that this is short-circuited,
 * meaning that the second function will not be invoked if the first returns a
 * false-y value.
 *
 * In addition to functions, `R.both` also accepts any fantasy-land compatible
 * applicative functor.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category Logic
 * @sig (*... -> Boolean) -> (*... -> Boolean) -> (*... -> Boolean)
 * @param {Function} f A predicate
 * @param {Function} g Another predicate
 * @return {Function} a function that applies its arguments to `f` and `g` and `&&`s their outputs together.
 * @see R.and
 * @example
 *
 *      const gt10 = R.gt(R.__, 10)
 *      const lt20 = R.lt(R.__, 20)
 *      const f = R.both(gt10, lt20);
 *      f(15); //=> true
 *      f(30); //=> false
 *
 *      R.both(Maybe.Just(false), Maybe.Just(55)); // => Maybe.Just(false)
 *      R.both([false, false, 'a'], [11]); //=> [false, false, 11]
 */


var both = /*#__PURE__*/_curry2(function both(f, g) {
  return _isFunction(f) ? function _both() {
    return f.apply(this, arguments) && g.apply(this, arguments);
  } : lift(and)(f, g);
});
module.exports = both;
  })();
});

require.register("ramda/src/call.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var curry = /*#__PURE__*/require('./curry');

/**
 * Returns the result of calling its first argument with the remaining
 * arguments. This is occasionally useful as a converging function for
 * [`R.converge`](#converge): the first branch can produce a function while the
 * remaining branches produce values to be passed to that function as its
 * arguments.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Function
 * @sig (*... -> a),*... -> a
 * @param {Function} fn The function to apply to the remaining arguments.
 * @param {...*} args Any number of positional arguments.
 * @return {*}
 * @see R.apply
 * @example
 *
 *      R.call(R.add, 1, 2); //=> 3
 *
 *      const indentN = R.pipe(R.repeat(' '),
 *                           R.join(''),
 *                           R.replace(/^(?!$)/gm));
 *
 *      const format = R.converge(R.call, [
 *                                  R.pipe(R.prop('indent'), indentN),
 *                                  R.prop('value')
 *                              ]);
 *
 *      format({indent: 2, value: 'foo\nbar\nbaz\n'}); //=> '  foo\n  bar\n  baz\n'
 * @symb R.call(f, a, b) = f(a, b)
 */


var call = /*#__PURE__*/curry(function call(fn) {
  return fn.apply(this, Array.prototype.slice.call(arguments, 1));
});
module.exports = call;
  })();
});

require.register("ramda/src/chain.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _makeFlat = /*#__PURE__*/require('./internal/_makeFlat');

var _xchain = /*#__PURE__*/require('./internal/_xchain');

var map = /*#__PURE__*/require('./map');

/**
 * `chain` maps a function over a list and concatenates the results. `chain`
 * is also known as `flatMap` in some libraries.
 *
 * Dispatches to the `chain` method of the second argument, if present,
 * according to the [FantasyLand Chain spec](https://github.com/fantasyland/fantasy-land#chain).
 *
 * If second argument is a function, `chain(f, g)(x)` is equivalent to `f(g(x), x)`.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig Chain m => (a -> m b) -> m a -> m b
 * @param {Function} fn The function to map with
 * @param {Array} list The list to map over
 * @return {Array} The result of flat-mapping `list` with `fn`
 * @example
 *
 *      const duplicate = n => [n, n];
 *      R.chain(duplicate, [1, 2, 3]); //=> [1, 1, 2, 2, 3, 3]
 *
 *      R.chain(R.append, R.head)([1, 2, 3]); //=> [1, 2, 3, 1]
 */


var chain = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['fantasy-land/chain', 'chain'], _xchain, function chain(fn, monad) {
  if (typeof monad === 'function') {
    return function (x) {
      return fn(monad(x))(x);
    };
  }
  return _makeFlat(false)(map(fn, monad));
}));
module.exports = chain;
  })();
});

require.register("ramda/src/clamp.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Restricts a number to be within a range.
 *
 * Also works for other ordered types such as Strings and Dates.
 *
 * @func
 * @memberOf R
 * @since v0.20.0
 * @category Relation
 * @sig Ord a => a -> a -> a -> a
 * @param {Number} minimum The lower limit of the clamp (inclusive)
 * @param {Number} maximum The upper limit of the clamp (inclusive)
 * @param {Number} value Value to be clamped
 * @return {Number} Returns `minimum` when `val < minimum`, `maximum` when `val > maximum`, returns `val` otherwise
 * @example
 *
 *      R.clamp(1, 10, -5) // => 1
 *      R.clamp(1, 10, 15) // => 10
 *      R.clamp(1, 10, 4)  // => 4
 */


var clamp = /*#__PURE__*/_curry3(function clamp(min, max, value) {
  if (min > max) {
    throw new Error('min must not be greater than max in clamp(min, max, value)');
  }
  return value < min ? min : value > max ? max : value;
});
module.exports = clamp;
  })();
});

require.register("ramda/src/clone.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _clone = /*#__PURE__*/require('./internal/_clone');

var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Creates a deep copy of the value which may contain (nested) `Array`s and
 * `Object`s, `Number`s, `String`s, `Boolean`s and `Date`s. `Function`s are
 * assigned by reference rather than copied
 *
 * Dispatches to a `clone` method if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {*} -> {*}
 * @param {*} value The object or array to clone
 * @return {*} A deeply cloned copy of `val`
 * @example
 *
 *      const objects = [{}, {}, {}];
 *      const objectsClone = R.clone(objects);
 *      objects === objectsClone; //=> false
 *      objects[0] === objectsClone[0]; //=> false
 */


var clone = /*#__PURE__*/_curry1(function clone(value) {
  return value != null && typeof value.clone === 'function' ? value.clone() : _clone(value, [], [], true);
});
module.exports = clone;
  })();
});

require.register("ramda/src/comparator.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Makes a comparator function out of a function that reports whether the first
 * element is less than the second.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((a, b) -> Boolean) -> ((a, b) -> Number)
 * @param {Function} pred A predicate function of arity two which will return `true` if the first argument
 * is less than the second, `false` otherwise
 * @return {Function} A Function :: a -> b -> Int that returns `-1` if a < b, `1` if b < a, otherwise `0`
 * @example
 *
 *      const byAge = R.comparator((a, b) => a.age < b.age);
 *      const people = [
 *        { name: 'Emma', age: 70 },
 *        { name: 'Peter', age: 78 },
 *        { name: 'Mikhail', age: 62 },
 *      ];
 *      const peopleByIncreasingAge = R.sort(byAge, people);
 *        //=> [{ name: 'Mikhail', age: 62 },{ name: 'Emma', age: 70 }, { name: 'Peter', age: 78 }]
 */


var comparator = /*#__PURE__*/_curry1(function comparator(pred) {
  return function (a, b) {
    return pred(a, b) ? -1 : pred(b, a) ? 1 : 0;
  };
});
module.exports = comparator;
  })();
});

require.register("ramda/src/complement.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var lift = /*#__PURE__*/require('./lift');

var not = /*#__PURE__*/require('./not');

/**
 * Takes a function `f` and returns a function `g` such that if called with the same arguments
 * when `f` returns a "truthy" value, `g` returns `false` and when `f` returns a "falsy" value `g` returns `true`.
 *
 * `R.complement` may be applied to any functor
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category Logic
 * @sig (*... -> *) -> (*... -> Boolean)
 * @param {Function} f
 * @return {Function}
 * @see R.not
 * @example
 *
 *      const isNotNil = R.complement(R.isNil);
 *      isNil(null); //=> true
 *      isNotNil(null); //=> false
 *      isNil(7); //=> false
 *      isNotNil(7); //=> true
 */


var complement = /*#__PURE__*/lift(not);
module.exports = complement;
  })();
});

require.register("ramda/src/compose.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var pipe = /*#__PURE__*/require('./pipe');

var reverse = /*#__PURE__*/require('./reverse');

/**
 * Performs right-to-left function composition. The rightmost function may have
 * any arity; the remaining functions must be unary.
 *
 * **Note:** The result of compose is not automatically curried.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)) -> ((a, b, ..., n) -> z)
 * @param {...Function} ...functions The functions to compose
 * @return {Function}
 * @see R.pipe
 * @example
 *
 *      const classyGreeting = (firstName, lastName) => "The name's " + lastName + ", " + firstName + " " + lastName
 *      const yellGreeting = R.compose(R.toUpper, classyGreeting);
 *      yellGreeting('James', 'Bond'); //=> "THE NAME'S BOND, JAMES BOND"
 *
 *      R.compose(Math.abs, R.add(1), R.multiply(2))(-4) //=> 7
 *
 * @symb R.compose(f, g, h)(a, b) = f(g(h(a, b)))
 */


function compose() {
  if (arguments.length === 0) {
    throw new Error('compose requires at least one argument');
  }
  return pipe.apply(this, reverse(arguments));
}
module.exports = compose;
  })();
});

require.register("ramda/src/composeK.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var chain = /*#__PURE__*/require('./chain');

var compose = /*#__PURE__*/require('./compose');

var map = /*#__PURE__*/require('./map');

/**
 * Returns the right-to-left Kleisli composition of the provided functions,
 * each of which must return a value of a type supported by [`chain`](#chain).
 *
 * `R.composeK(h, g, f)` is equivalent to `R.compose(R.chain(h), R.chain(g), f)`.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Function
 * @sig Chain m => ((y -> m z), (x -> m y), ..., (a -> m b)) -> (a -> m z)
 * @param {...Function} ...functions The functions to compose
 * @return {Function}
 * @see R.pipeK
 * @deprecated since v0.26.0
 * @example
 *
 *       //  get :: String -> Object -> Maybe *
 *       const get = R.curry((propName, obj) => Maybe(obj[propName]))
 *
 *       //  getStateCode :: Maybe String -> Maybe String
 *       const getStateCode = R.composeK(
 *         R.compose(Maybe.of, R.toUpper),
 *         get('state'),
 *         get('address'),
 *         get('user'),
 *       );
 *       getStateCode({"user":{"address":{"state":"ny"}}}); //=> Maybe.Just("NY")
 *       getStateCode({}); //=> Maybe.Nothing()
 * @symb R.composeK(f, g, h)(a) = R.chain(f, R.chain(g, h(a)))
 */


function composeK() {
  if (arguments.length === 0) {
    throw new Error('composeK requires at least one argument');
  }
  var init = Array.prototype.slice.call(arguments);
  var last = init.pop();
  return compose(compose.apply(this, map(chain, init)), last);
}
module.exports = composeK;
  })();
});

require.register("ramda/src/composeP.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var pipeP = /*#__PURE__*/require('./pipeP');

var reverse = /*#__PURE__*/require('./reverse');

/**
 * Performs right-to-left composition of one or more Promise-returning
 * functions. The rightmost function may have any arity; the remaining
 * functions must be unary.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Function
 * @sig ((y -> Promise z), (x -> Promise y), ..., (a -> Promise b)) -> (a -> Promise z)
 * @param {...Function} functions The functions to compose
 * @return {Function}
 * @see R.pipeP
 * @deprecated since v0.26.0
 * @example
 *
 *      const db = {
 *        users: {
 *          JOE: {
 *            name: 'Joe',
 *            followers: ['STEVE', 'SUZY']
 *          }
 *        }
 *      }
 *
 *      // We'll pretend to do a db lookup which returns a promise
 *      const lookupUser = (userId) => Promise.resolve(db.users[userId])
 *      const lookupFollowers = (user) => Promise.resolve(user.followers)
 *      lookupUser('JOE').then(lookupFollowers)
 *
 *      //  followersForUser :: String -> Promise [UserId]
 *      const followersForUser = R.composeP(lookupFollowers, lookupUser);
 *      followersForUser('JOE').then(followers => console.log('Followers:', followers))
 *      // Followers: ["STEVE","SUZY"]
 */


function composeP() {
  if (arguments.length === 0) {
    throw new Error('composeP requires at least one argument');
  }
  return pipeP.apply(this, reverse(arguments));
}
module.exports = composeP;
  })();
});

require.register("ramda/src/composeWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var pipeWith = /*#__PURE__*/require('./pipeWith');

var reverse = /*#__PURE__*/require('./reverse');

/**
 * Performs right-to-left function composition using transforming function. The rightmost function may have
 * any arity; the remaining functions must be unary.
 *
 * **Note:** The result of compose is not automatically curried.
 *
 * @func
 * @memberOf R
 * @category Function
 * @sig ((* -> *), [(y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)]) -> ((a, b, ..., n) -> z)
 * @param {...Function} ...functions The functions to compose
 * @return {Function}
 * @see R.compose, R.pipeWith
 * @example
 *
 *      const composeWhileNotNil = R.composeWith((f, res) => R.isNil(res) ? res : f(res));
 *
 *      composeWhileNotNil([R.inc, R.prop('age')])({age: 1}) //=> 2
 *      composeWhileNotNil([R.inc, R.prop('age')])({}) //=> undefined
 *
 * @symb R.composeWith(f)([g, h, i])(...args) = f(g, f(h, f(i, ...args)))
 */


var composeWith = /*#__PURE__*/_curry2(function composeWith(xf, list) {
  return pipeWith.apply(this, [xf, reverse(list)]);
});
module.exports = composeWith;
  })();
});

require.register("ramda/src/concat.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _isArray = /*#__PURE__*/require('./internal/_isArray');

var _isFunction = /*#__PURE__*/require('./internal/_isFunction');

var _isString = /*#__PURE__*/require('./internal/_isString');

var toString = /*#__PURE__*/require('./toString');

/**
 * Returns the result of concatenating the given lists or strings.
 *
 * Note: `R.concat` expects both arguments to be of the same type,
 * unlike the native `Array.prototype.concat` method. It will throw
 * an error if you `concat` an Array with a non-Array value.
 *
 * Dispatches to the `concat` method of the first argument, if present.
 * Can also concatenate two members of a [fantasy-land
 * compatible semigroup](https://github.com/fantasyland/fantasy-land#semigroup).
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a] -> [a]
 * @sig String -> String -> String
 * @param {Array|String} firstList The first list
 * @param {Array|String} secondList The second list
 * @return {Array|String} A list consisting of the elements of `firstList` followed by the elements of
 * `secondList`.
 *
 * @example
 *
 *      R.concat('ABC', 'DEF'); // 'ABCDEF'
 *      R.concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
 *      R.concat([], []); //=> []
 */


var concat = /*#__PURE__*/_curry2(function concat(a, b) {
  if (_isArray(a)) {
    if (_isArray(b)) {
      return a.concat(b);
    }
    throw new TypeError(toString(b) + ' is not an array');
  }
  if (_isString(a)) {
    if (_isString(b)) {
      return a + b;
    }
    throw new TypeError(toString(b) + ' is not a string');
  }
  if (a != null && _isFunction(a['fantasy-land/concat'])) {
    return a['fantasy-land/concat'](b);
  }
  if (a != null && _isFunction(a.concat)) {
    return a.concat(b);
  }
  throw new TypeError(toString(a) + ' does not have a method named "concat" or "fantasy-land/concat"');
});
module.exports = concat;
  })();
});

require.register("ramda/src/cond.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _arity = /*#__PURE__*/require('./internal/_arity');

var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var map = /*#__PURE__*/require('./map');

var max = /*#__PURE__*/require('./max');

var reduce = /*#__PURE__*/require('./reduce');

/**
 * Returns a function, `fn`, which encapsulates `if/else, if/else, ...` logic.
 * `R.cond` takes a list of [predicate, transformer] pairs. All of the arguments
 * to `fn` are applied to each of the predicates in turn until one returns a
 * "truthy" value, at which point `fn` returns the result of applying its
 * arguments to the corresponding transformer. If none of the predicates
 * matches, `fn` returns undefined.
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category Logic
 * @sig [[(*... -> Boolean),(*... -> *)]] -> (*... -> *)
 * @param {Array} pairs A list of [predicate, transformer]
 * @return {Function}
 * @see R.ifElse, R.unless, R.when
 * @example
 *
 *      const fn = R.cond([
 *        [R.equals(0),   R.always('water freezes at 0°C')],
 *        [R.equals(100), R.always('water boils at 100°C')],
 *        [R.T,           temp => 'nothing special happens at ' + temp + '°C']
 *      ]);
 *      fn(0); //=> 'water freezes at 0°C'
 *      fn(50); //=> 'nothing special happens at 50°C'
 *      fn(100); //=> 'water boils at 100°C'
 */


var cond = /*#__PURE__*/_curry1(function cond(pairs) {
  var arity = reduce(max, 0, map(function (pair) {
    return pair[0].length;
  }, pairs));
  return _arity(arity, function () {
    var idx = 0;
    while (idx < pairs.length) {
      if (pairs[idx][0].apply(this, arguments)) {
        return pairs[idx][1].apply(this, arguments);
      }
      idx += 1;
    }
  });
});
module.exports = cond;
  })();
});

require.register("ramda/src/construct.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var constructN = /*#__PURE__*/require('./constructN');

/**
 * Wraps a constructor function inside a curried function that can be called
 * with the same arguments and returns the same type.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (* -> {*}) -> (* -> {*})
 * @param {Function} fn The constructor function to wrap.
 * @return {Function} A wrapped, curried constructor function.
 * @see R.invoker
 * @example
 *
 *      // Constructor function
 *      function Animal(kind) {
 *        this.kind = kind;
 *      };
 *      Animal.prototype.sighting = function() {
 *        return "It's a " + this.kind + "!";
 *      }
 *
 *      const AnimalConstructor = R.construct(Animal)
 *
 *      // Notice we no longer need the 'new' keyword:
 *      AnimalConstructor('Pig'); //=> {"kind": "Pig", "sighting": function (){...}};
 *
 *      const animalTypes = ["Lion", "Tiger", "Bear"];
 *      const animalSighting = R.invoker(0, 'sighting');
 *      const sightNewAnimal = R.compose(animalSighting, AnimalConstructor);
 *      R.map(sightNewAnimal, animalTypes); //=> ["It's a Lion!", "It's a Tiger!", "It's a Bear!"]
 */


var construct = /*#__PURE__*/_curry1(function construct(Fn) {
  return constructN(Fn.length, Fn);
});
module.exports = construct;
  })();
});

require.register("ramda/src/constructN.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var curry = /*#__PURE__*/require('./curry');

var nAry = /*#__PURE__*/require('./nAry');

/**
 * Wraps a constructor function inside a curried function that can be called
 * with the same arguments and returns the same type. The arity of the function
 * returned is specified to allow using variadic constructor functions.
 *
 * @func
 * @memberOf R
 * @since v0.4.0
 * @category Function
 * @sig Number -> (* -> {*}) -> (* -> {*})
 * @param {Number} n The arity of the constructor function.
 * @param {Function} Fn The constructor function to wrap.
 * @return {Function} A wrapped, curried constructor function.
 * @example
 *
 *      // Variadic Constructor function
 *      function Salad() {
 *        this.ingredients = arguments;
 *      }
 *
 *      Salad.prototype.recipe = function() {
 *        const instructions = R.map(ingredient => 'Add a dollop of ' + ingredient, this.ingredients);
 *        return R.join('\n', instructions);
 *      };
 *
 *      const ThreeLayerSalad = R.constructN(3, Salad);
 *
 *      // Notice we no longer need the 'new' keyword, and the constructor is curried for 3 arguments.
 *      const salad = ThreeLayerSalad('Mayonnaise')('Potato Chips')('Ketchup');
 *
 *      console.log(salad.recipe());
 *      // Add a dollop of Mayonnaise
 *      // Add a dollop of Potato Chips
 *      // Add a dollop of Ketchup
 */


var constructN = /*#__PURE__*/_curry2(function constructN(n, Fn) {
  if (n > 10) {
    throw new Error('Constructor with greater than ten arguments');
  }
  if (n === 0) {
    return function () {
      return new Fn();
    };
  }
  return curry(nAry(n, function ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
    switch (arguments.length) {
      case 1:
        return new Fn($0);
      case 2:
        return new Fn($0, $1);
      case 3:
        return new Fn($0, $1, $2);
      case 4:
        return new Fn($0, $1, $2, $3);
      case 5:
        return new Fn($0, $1, $2, $3, $4);
      case 6:
        return new Fn($0, $1, $2, $3, $4, $5);
      case 7:
        return new Fn($0, $1, $2, $3, $4, $5, $6);
      case 8:
        return new Fn($0, $1, $2, $3, $4, $5, $6, $7);
      case 9:
        return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8);
      case 10:
        return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8, $9);
    }
  }));
});
module.exports = constructN;
  })();
});

require.register("ramda/src/contains.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _includes = /*#__PURE__*/require('./internal/_includes');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns `true` if the specified value is equal, in [`R.equals`](#equals)
 * terms, to at least one element of the given list; `false` otherwise.
 * Works also with strings.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> Boolean
 * @param {Object} a The item to compare against.
 * @param {Array} list The array to consider.
 * @return {Boolean} `true` if an equivalent item is in the list, `false` otherwise.
 * @see R.includes
 * @deprecated since v0.26.0
 * @example
 *
 *      R.contains(3, [1, 2, 3]); //=> true
 *      R.contains(4, [1, 2, 3]); //=> false
 *      R.contains({ name: 'Fred' }, [{ name: 'Fred' }]); //=> true
 *      R.contains([42], [[42]]); //=> true
 *      R.contains('ba', 'banana'); //=>true
 */


var contains = /*#__PURE__*/_curry2(_includes);
module.exports = contains;
  })();
});

require.register("ramda/src/converge.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _map = /*#__PURE__*/require('./internal/_map');

var curryN = /*#__PURE__*/require('./curryN');

var max = /*#__PURE__*/require('./max');

var pluck = /*#__PURE__*/require('./pluck');

var reduce = /*#__PURE__*/require('./reduce');

/**
 * Accepts a converging function and a list of branching functions and returns
 * a new function. The arity of the new function is the same as the arity of
 * the longest branching function. When invoked, this new function is applied
 * to some arguments, and each branching function is applied to those same
 * arguments. The results of each branching function are passed as arguments
 * to the converging function to produce the return value.
 *
 * @func
 * @memberOf R
 * @since v0.4.2
 * @category Function
 * @sig ((x1, x2, ...) -> z) -> [((a, b, ...) -> x1), ((a, b, ...) -> x2), ...] -> (a -> b -> ... -> z)
 * @param {Function} after A function. `after` will be invoked with the return values of
 *        `fn1` and `fn2` as its arguments.
 * @param {Array} functions A list of functions.
 * @return {Function} A new function.
 * @see R.useWith
 * @example
 *
 *      const average = R.converge(R.divide, [R.sum, R.length])
 *      average([1, 2, 3, 4, 5, 6, 7]) //=> 4
 *
 *      const strangeConcat = R.converge(R.concat, [R.toUpper, R.toLower])
 *      strangeConcat("Yodel") //=> "YODELyodel"
 *
 * @symb R.converge(f, [g, h])(a, b) = f(g(a, b), h(a, b))
 */


var converge = /*#__PURE__*/_curry2(function converge(after, fns) {
  return curryN(reduce(max, 0, pluck('length', fns)), function () {
    var args = arguments;
    var context = this;
    return after.apply(context, _map(function (fn) {
      return fn.apply(context, args);
    }, fns));
  });
});
module.exports = converge;
  })();
});

require.register("ramda/src/countBy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var reduceBy = /*#__PURE__*/require('./reduceBy');

/**
 * Counts the elements of a list according to how many match each value of a
 * key generated by the supplied function. Returns an object mapping the keys
 * produced by `fn` to the number of occurrences in the list. Note that all
 * keys are coerced to strings because of how JavaScript objects work.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig (a -> String) -> [a] -> {*}
 * @param {Function} fn The function used to map values to keys.
 * @param {Array} list The list to count elements from.
 * @return {Object} An object mapping keys to number of occurrences in the list.
 * @example
 *
 *      const numbers = [1.0, 1.1, 1.2, 2.0, 3.0, 2.2];
 *      R.countBy(Math.floor)(numbers);    //=> {'1': 3, '2': 2, '3': 1}
 *
 *      const letters = ['a', 'b', 'A', 'a', 'B', 'c'];
 *      R.countBy(R.toLower)(letters);   //=> {'a': 3, 'b': 2, 'c': 1}
 */


var countBy = /*#__PURE__*/reduceBy(function (acc, elem) {
  return acc + 1;
}, 0);
module.exports = countBy;
  })();
});

require.register("ramda/src/curry.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var curryN = /*#__PURE__*/require('./curryN');

/**
 * Returns a curried equivalent of the provided function. The curried function
 * has two unusual capabilities. First, its arguments needn't be provided one
 * at a time. If `f` is a ternary function and `g` is `R.curry(f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (* -> a) -> (* -> a)
 * @param {Function} fn The function to curry.
 * @return {Function} A new, curried function.
 * @see R.curryN, R.partial
 * @example
 *
 *      const addFourNumbers = (a, b, c, d) => a + b + c + d;
 *
 *      const curriedAddFourNumbers = R.curry(addFourNumbers);
 *      const f = curriedAddFourNumbers(1, 2);
 *      const g = f(3);
 *      g(4); //=> 10
 */


var curry = /*#__PURE__*/_curry1(function curry(fn) {
  return curryN(fn.length, fn);
});
module.exports = curry;
  })();
});

require.register("ramda/src/curryN.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _arity = /*#__PURE__*/require('./internal/_arity');

var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _curryN = /*#__PURE__*/require('./internal/_curryN');

/**
 * Returns a curried equivalent of the provided function, with the specified
 * arity. The curried function has two unusual capabilities. First, its
 * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @func
 * @memberOf R
 * @since v0.5.0
 * @category Function
 * @sig Number -> (* -> a) -> (* -> a)
 * @param {Number} length The arity for the returned function.
 * @param {Function} fn The function to curry.
 * @return {Function} A new, curried function.
 * @see R.curry
 * @example
 *
 *      const sumArgs = (...args) => R.sum(args);
 *
 *      const curriedAddFourNumbers = R.curryN(4, sumArgs);
 *      const f = curriedAddFourNumbers(1, 2);
 *      const g = f(3);
 *      g(4); //=> 10
 */


var curryN = /*#__PURE__*/_curry2(function curryN(length, fn) {
  if (length === 1) {
    return _curry1(fn);
  }
  return _arity(length, _curryN(length, [], fn));
});
module.exports = curryN;
  })();
});

require.register("ramda/src/dec.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var add = /*#__PURE__*/require('./add');

/**
 * Decrements its argument.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Math
 * @sig Number -> Number
 * @param {Number} n
 * @return {Number} n - 1
 * @see R.inc
 * @example
 *
 *      R.dec(42); //=> 41
 */


var dec = /*#__PURE__*/add(-1);
module.exports = dec;
  })();
});

require.register("ramda/src/defaultTo.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns the second argument if it is not `null`, `undefined` or `NaN`;
 * otherwise the first argument is returned.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Logic
 * @sig a -> b -> a | b
 * @param {a} default The default value.
 * @param {b} val `val` will be returned instead of `default` unless `val` is `null`, `undefined` or `NaN`.
 * @return {*} The second value if it is not `null`, `undefined` or `NaN`, otherwise the default value
 * @example
 *
 *      const defaultTo42 = R.defaultTo(42);
 *
 *      defaultTo42(null);  //=> 42
 *      defaultTo42(undefined);  //=> 42
 *      defaultTo42(false);  //=> false
 *      defaultTo42('Ramda');  //=> 'Ramda'
 *      // parseInt('string') results in NaN
 *      defaultTo42(parseInt('string')); //=> 42
 */


var defaultTo = /*#__PURE__*/_curry2(function defaultTo(d, v) {
  return v == null || v !== v ? d : v;
});
module.exports = defaultTo;
  })();
});

require.register("ramda/src/descend.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Makes a descending comparator function out of a function that returns a value
 * that can be compared with `<` and `>`.
 *
 * @func
 * @memberOf R
 * @since v0.23.0
 * @category Function
 * @sig Ord b => (a -> b) -> a -> a -> Number
 * @param {Function} fn A function of arity one that returns a value that can be compared
 * @param {*} a The first item to be compared.
 * @param {*} b The second item to be compared.
 * @return {Number} `-1` if fn(a) > fn(b), `1` if fn(b) > fn(a), otherwise `0`
 * @see R.ascend
 * @example
 *
 *      const byAge = R.descend(R.prop('age'));
 *      const people = [
 *        { name: 'Emma', age: 70 },
 *        { name: 'Peter', age: 78 },
 *        { name: 'Mikhail', age: 62 },
 *      ];
 *      const peopleByOldestFirst = R.sort(byAge, people);
 *        //=> [{ name: 'Peter', age: 78 }, { name: 'Emma', age: 70 }, { name: 'Mikhail', age: 62 }]
 */


var descend = /*#__PURE__*/_curry3(function descend(fn, a, b) {
  var aa = fn(a);
  var bb = fn(b);
  return aa > bb ? -1 : aa < bb ? 1 : 0;
});
module.exports = descend;
  })();
});

require.register("ramda/src/difference.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _Set = /*#__PURE__*/require('./internal/_Set');

/**
 * Finds the set (i.e. no duplicates) of all elements in the first list not
 * contained in the second list. Objects and Arrays are compared in terms of
 * value equality, not reference equality.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig [*] -> [*] -> [*]
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The elements in `list1` that are not in `list2`.
 * @see R.differenceWith, R.symmetricDifference, R.symmetricDifferenceWith, R.without
 * @example
 *
 *      R.difference([1,2,3,4], [7,6,5,4,3]); //=> [1,2]
 *      R.difference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5]
 *      R.difference([{a: 1}, {b: 2}], [{a: 1}, {c: 3}]) //=> [{b: 2}]
 */


var difference = /*#__PURE__*/_curry2(function difference(first, second) {
  var out = [];
  var idx = 0;
  var firstLen = first.length;
  var secondLen = second.length;
  var toFilterOut = new _Set();

  for (var i = 0; i < secondLen; i += 1) {
    toFilterOut.add(second[i]);
  }

  while (idx < firstLen) {
    if (toFilterOut.add(first[idx])) {
      out[out.length] = first[idx];
    }
    idx += 1;
  }
  return out;
});
module.exports = difference;
  })();
});

require.register("ramda/src/differenceWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _includesWith = /*#__PURE__*/require('./internal/_includesWith');

var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Finds the set (i.e. no duplicates) of all elements in the first list not
 * contained in the second list. Duplication is determined according to the
 * value returned by applying the supplied predicate to two list elements.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig ((a, a) -> Boolean) -> [a] -> [a] -> [a]
 * @param {Function} pred A predicate used to test whether two items are equal.
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The elements in `list1` that are not in `list2`.
 * @see R.difference, R.symmetricDifference, R.symmetricDifferenceWith
 * @example
 *
 *      const cmp = (x, y) => x.a === y.a;
 *      const l1 = [{a: 1}, {a: 2}, {a: 3}];
 *      const l2 = [{a: 3}, {a: 4}];
 *      R.differenceWith(cmp, l1, l2); //=> [{a: 1}, {a: 2}]
 */


var differenceWith = /*#__PURE__*/_curry3(function differenceWith(pred, first, second) {
  var out = [];
  var idx = 0;
  var firstLen = first.length;
  while (idx < firstLen) {
    if (!_includesWith(pred, first[idx], second) && !_includesWith(pred, first[idx], out)) {
      out.push(first[idx]);
    }
    idx += 1;
  }
  return out;
});
module.exports = differenceWith;
  })();
});

require.register("ramda/src/dissoc.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns a new object that does not contain a `prop` property.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Object
 * @sig String -> {k: v} -> {k: v}
 * @param {String} prop The name of the property to dissociate
 * @param {Object} obj The object to clone
 * @return {Object} A new object equivalent to the original but without the specified property
 * @see R.assoc, R.omit
 * @example
 *
 *      R.dissoc('b', {a: 1, b: 2, c: 3}); //=> {a: 1, c: 3}
 */


var dissoc = /*#__PURE__*/_curry2(function dissoc(prop, obj) {
  var result = {};
  for (var p in obj) {
    result[p] = obj[p];
  }
  delete result[prop];
  return result;
});
module.exports = dissoc;
  })();
});

require.register("ramda/src/dissocPath.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _isInteger = /*#__PURE__*/require('./internal/_isInteger');

var _isArray = /*#__PURE__*/require('./internal/_isArray');

var assoc = /*#__PURE__*/require('./assoc');

var dissoc = /*#__PURE__*/require('./dissoc');

var remove = /*#__PURE__*/require('./remove');

var update = /*#__PURE__*/require('./update');

/**
 * Makes a shallow clone of an object, omitting the property at the given path.
 * Note that this copies and flattens prototype properties onto the new object
 * as well. All non-primitive properties are copied by reference.
 *
 * @func
 * @memberOf R
 * @since v0.11.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig [Idx] -> {k: v} -> {k: v}
 * @param {Array} path The path to the value to omit
 * @param {Object} obj The object to clone
 * @return {Object} A new object without the property at path
 * @see R.assocPath
 * @example
 *
 *      R.dissocPath(['a', 'b', 'c'], {a: {b: {c: 42}}}); //=> {a: {b: {}}}
 */


var dissocPath = /*#__PURE__*/_curry2(function dissocPath(path, obj) {
  switch (path.length) {
    case 0:
      return obj;
    case 1:
      return _isInteger(path[0]) && _isArray(obj) ? remove(path[0], 1, obj) : dissoc(path[0], obj);
    default:
      var head = path[0];
      var tail = Array.prototype.slice.call(path, 1);
      if (obj[head] == null) {
        return obj;
      } else if (_isInteger(head) && _isArray(obj)) {
        return update(head, dissocPath(tail, obj[head]), obj);
      } else {
        return assoc(head, dissocPath(tail, obj[head]), obj);
      }
  }
});
module.exports = dissocPath;
  })();
});

require.register("ramda/src/divide.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Divides two numbers. Equivalent to `a / b`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} a The first value.
 * @param {Number} b The second value.
 * @return {Number} The result of `a / b`.
 * @see R.multiply
 * @example
 *
 *      R.divide(71, 100); //=> 0.71
 *
 *      const half = R.divide(R.__, 2);
 *      half(42); //=> 21
 *
 *      const reciprocal = R.divide(1);
 *      reciprocal(4);   //=> 0.25
 */


var divide = /*#__PURE__*/_curry2(function divide(a, b) {
  return a / b;
});
module.exports = divide;
  })();
});

require.register("ramda/src/drop.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xdrop = /*#__PURE__*/require('./internal/_xdrop');

var slice = /*#__PURE__*/require('./slice');

/**
 * Returns all but the first `n` elements of the given list, string, or
 * transducer/transformer (or object with a `drop` method).
 *
 * Dispatches to the `drop` method of the second argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Number -> [a] -> [a]
 * @sig Number -> String -> String
 * @param {Number} n
 * @param {*} list
 * @return {*} A copy of list without the first `n` elements
 * @see R.take, R.transduce, R.dropLast, R.dropWhile
 * @example
 *
 *      R.drop(1, ['foo', 'bar', 'baz']); //=> ['bar', 'baz']
 *      R.drop(2, ['foo', 'bar', 'baz']); //=> ['baz']
 *      R.drop(3, ['foo', 'bar', 'baz']); //=> []
 *      R.drop(4, ['foo', 'bar', 'baz']); //=> []
 *      R.drop(3, 'ramda');               //=> 'da'
 */


var drop = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['drop'], _xdrop, function drop(n, xs) {
  return slice(Math.max(0, n), Infinity, xs);
}));
module.exports = drop;
  })();
});

require.register("ramda/src/dropLast.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _dropLast = /*#__PURE__*/require('./internal/_dropLast');

var _xdropLast = /*#__PURE__*/require('./internal/_xdropLast');

/**
 * Returns a list containing all but the last `n` elements of the given `list`.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig Number -> [a] -> [a]
 * @sig Number -> String -> String
 * @param {Number} n The number of elements of `list` to skip.
 * @param {Array} list The list of elements to consider.
 * @return {Array} A copy of the list with only the first `list.length - n` elements
 * @see R.takeLast, R.drop, R.dropWhile, R.dropLastWhile
 * @example
 *
 *      R.dropLast(1, ['foo', 'bar', 'baz']); //=> ['foo', 'bar']
 *      R.dropLast(2, ['foo', 'bar', 'baz']); //=> ['foo']
 *      R.dropLast(3, ['foo', 'bar', 'baz']); //=> []
 *      R.dropLast(4, ['foo', 'bar', 'baz']); //=> []
 *      R.dropLast(3, 'ramda');               //=> 'ra'
 */


var dropLast = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable([], _xdropLast, _dropLast));
module.exports = dropLast;
  })();
});

require.register("ramda/src/dropLastWhile.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _dropLastWhile = /*#__PURE__*/require('./internal/_dropLastWhile');

var _xdropLastWhile = /*#__PURE__*/require('./internal/_xdropLastWhile');

/**
 * Returns a new list excluding all the tailing elements of a given list which
 * satisfy the supplied predicate function. It passes each value from the right
 * to the supplied predicate function, skipping elements until the predicate
 * function returns a `falsy` value. The predicate function is applied to one argument:
 * *(value)*.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> [a]
 * @sig (a -> Boolean) -> String -> String
 * @param {Function} predicate The function to be called on each element
 * @param {Array} xs The collection to iterate over.
 * @return {Array} A new array without any trailing elements that return `falsy` values from the `predicate`.
 * @see R.takeLastWhile, R.addIndex, R.drop, R.dropWhile
 * @example
 *
 *      const lteThree = x => x <= 3;
 *
 *      R.dropLastWhile(lteThree, [1, 2, 3, 4, 3, 2, 1]); //=> [1, 2, 3, 4]
 *
 *      R.dropLastWhile(x => x !== 'd' , 'Ramda'); //=> 'Ramd'
 */


var dropLastWhile = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable([], _xdropLastWhile, _dropLastWhile));
module.exports = dropLastWhile;
  })();
});

require.register("ramda/src/dropRepeats.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xdropRepeatsWith = /*#__PURE__*/require('./internal/_xdropRepeatsWith');

var dropRepeatsWith = /*#__PURE__*/require('./dropRepeatsWith');

var equals = /*#__PURE__*/require('./equals');

/**
 * Returns a new list without any consecutively repeating elements.
 * [`R.equals`](#equals) is used to determine equality.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category List
 * @sig [a] -> [a]
 * @param {Array} list The array to consider.
 * @return {Array} `list` without repeating elements.
 * @see R.transduce
 * @example
 *
 *     R.dropRepeats([1, 1, 1, 2, 3, 4, 4, 2, 2]); //=> [1, 2, 3, 4, 2]
 */


var dropRepeats = /*#__PURE__*/_curry1( /*#__PURE__*/_dispatchable([], /*#__PURE__*/_xdropRepeatsWith(equals), /*#__PURE__*/dropRepeatsWith(equals)));
module.exports = dropRepeats;
  })();
});

require.register("ramda/src/dropRepeatsWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xdropRepeatsWith = /*#__PURE__*/require('./internal/_xdropRepeatsWith');

var last = /*#__PURE__*/require('./last');

/**
 * Returns a new list without any consecutively repeating elements. Equality is
 * determined by applying the supplied predicate to each pair of consecutive elements. The
 * first element in a series of equal elements will be preserved.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category List
 * @sig ((a, a) -> Boolean) -> [a] -> [a]
 * @param {Function} pred A predicate used to test whether two items are equal.
 * @param {Array} list The array to consider.
 * @return {Array} `list` without repeating elements.
 * @see R.transduce
 * @example
 *
 *      const l = [1, -1, 1, 3, 4, -4, -4, -5, 5, 3, 3];
 *      R.dropRepeatsWith(R.eqBy(Math.abs), l); //=> [1, 3, 4, -5, 3]
 */


var dropRepeatsWith = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable([], _xdropRepeatsWith, function dropRepeatsWith(pred, list) {
  var result = [];
  var idx = 1;
  var len = list.length;
  if (len !== 0) {
    result[0] = list[0];
    while (idx < len) {
      if (!pred(last(result), list[idx])) {
        result[result.length] = list[idx];
      }
      idx += 1;
    }
  }
  return result;
}));
module.exports = dropRepeatsWith;
  })();
});

require.register("ramda/src/dropWhile.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xdropWhile = /*#__PURE__*/require('./internal/_xdropWhile');

var slice = /*#__PURE__*/require('./slice');

/**
 * Returns a new list excluding the leading elements of a given list which
 * satisfy the supplied predicate function. It passes each value to the supplied
 * predicate function, skipping elements while the predicate function returns
 * `true`. The predicate function is applied to one argument: *(value)*.
 *
 * Dispatches to the `dropWhile` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> [a]
 * @sig (a -> Boolean) -> String -> String
 * @param {Function} fn The function called per iteration.
 * @param {Array} xs The collection to iterate over.
 * @return {Array} A new array.
 * @see R.takeWhile, R.transduce, R.addIndex
 * @example
 *
 *      const lteTwo = x => x <= 2;
 *
 *      R.dropWhile(lteTwo, [1, 2, 3, 4, 3, 2, 1]); //=> [3, 4, 3, 2, 1]
 *
 *      R.dropWhile(x => x !== 'd' , 'Ramda'); //=> 'da'
 */


var dropWhile = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['dropWhile'], _xdropWhile, function dropWhile(pred, xs) {
  var idx = 0;
  var len = xs.length;
  while (idx < len && pred(xs[idx])) {
    idx += 1;
  }
  return slice(idx, Infinity, xs);
}));
module.exports = dropWhile;
  })();
});

require.register("ramda/src/either.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _isFunction = /*#__PURE__*/require('./internal/_isFunction');

var lift = /*#__PURE__*/require('./lift');

var or = /*#__PURE__*/require('./or');

/**
 * A function wrapping calls to the two functions in an `||` operation,
 * returning the result of the first function if it is truth-y and the result
 * of the second function otherwise. Note that this is short-circuited,
 * meaning that the second function will not be invoked if the first returns a
 * truth-y value.
 *
 * In addition to functions, `R.either` also accepts any fantasy-land compatible
 * applicative functor.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category Logic
 * @sig (*... -> Boolean) -> (*... -> Boolean) -> (*... -> Boolean)
 * @param {Function} f a predicate
 * @param {Function} g another predicate
 * @return {Function} a function that applies its arguments to `f` and `g` and `||`s their outputs together.
 * @see R.or
 * @example
 *
 *      const gt10 = x => x > 10;
 *      const even = x => x % 2 === 0;
 *      const f = R.either(gt10, even);
 *      f(101); //=> true
 *      f(8); //=> true
 *
 *      R.either(Maybe.Just(false), Maybe.Just(55)); // => Maybe.Just(55)
 *      R.either([false, false, 'a'], [11]) // => [11, 11, "a"]
 */


var either = /*#__PURE__*/_curry2(function either(f, g) {
  return _isFunction(f) ? function _either() {
    return f.apply(this, arguments) || g.apply(this, arguments);
  } : lift(or)(f, g);
});
module.exports = either;
  })();
});

require.register("ramda/src/empty.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var _isArguments = /*#__PURE__*/require('./internal/_isArguments');

var _isArray = /*#__PURE__*/require('./internal/_isArray');

var _isObject = /*#__PURE__*/require('./internal/_isObject');

var _isString = /*#__PURE__*/require('./internal/_isString');

/**
 * Returns the empty value of its argument's type. Ramda defines the empty
 * value of Array (`[]`), Object (`{}`), String (`''`), and Arguments. Other
 * types are supported if they define `<Type>.empty`,
 * `<Type>.prototype.empty` or implement the
 * [FantasyLand Monoid spec](https://github.com/fantasyland/fantasy-land#monoid).
 *
 * Dispatches to the `empty` method of the first argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Function
 * @sig a -> a
 * @param {*} x
 * @return {*}
 * @example
 *
 *      R.empty(Just(42));      //=> Nothing()
 *      R.empty([1, 2, 3]);     //=> []
 *      R.empty('unicorns');    //=> ''
 *      R.empty({x: 1, y: 2});  //=> {}
 */


var empty = /*#__PURE__*/_curry1(function empty(x) {
  return x != null && typeof x['fantasy-land/empty'] === 'function' ? x['fantasy-land/empty']() : x != null && x.constructor != null && typeof x.constructor['fantasy-land/empty'] === 'function' ? x.constructor['fantasy-land/empty']() : x != null && typeof x.empty === 'function' ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === 'function' ? x.constructor.empty() : _isArray(x) ? [] : _isString(x) ? '' : _isObject(x) ? {} : _isArguments(x) ? function () {
    return arguments;
  }() : void 0 // else
  ;
});
module.exports = empty;
  })();
});

require.register("ramda/src/endsWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var equals = /*#__PURE__*/require('./equals');

var takeLast = /*#__PURE__*/require('./takeLast');

/**
 * Checks if a list ends with the provided sublist.
 *
 * Similarly, checks if a string ends with the provided substring.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category List
 * @sig [a] -> [a] -> Boolean
 * @sig String -> String -> Boolean
 * @param {*} suffix
 * @param {*} list
 * @return {Boolean}
 * @see R.startsWith
 * @example
 *
 *      R.endsWith('c', 'abc')                //=> true
 *      R.endsWith('b', 'abc')                //=> false
 *      R.endsWith(['c'], ['a', 'b', 'c'])    //=> true
 *      R.endsWith(['b'], ['a', 'b', 'c'])    //=> false
 */


var endsWith = /*#__PURE__*/_curry2(function (suffix, list) {
  return equals(takeLast(suffix.length, list), suffix);
});
module.exports = endsWith;
  })();
});

require.register("ramda/src/eqBy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var equals = /*#__PURE__*/require('./equals');

/**
 * Takes a function and two values in its domain and returns `true` if the
 * values map to the same value in the codomain; `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category Relation
 * @sig (a -> b) -> a -> a -> Boolean
 * @param {Function} f
 * @param {*} x
 * @param {*} y
 * @return {Boolean}
 * @example
 *
 *      R.eqBy(Math.abs, 5, -5); //=> true
 */


var eqBy = /*#__PURE__*/_curry3(function eqBy(f, x, y) {
  return equals(f(x), f(y));
});
module.exports = eqBy;
  })();
});

require.register("ramda/src/eqProps.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var equals = /*#__PURE__*/require('./equals');

/**
 * Reports whether two objects have the same value, in [`R.equals`](#equals)
 * terms, for the specified property. Useful as a curried predicate.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig k -> {k: v} -> {k: v} -> Boolean
 * @param {String} prop The name of the property to compare
 * @param {Object} obj1
 * @param {Object} obj2
 * @return {Boolean}
 *
 * @example
 *
 *      const o1 = { a: 1, b: 2, c: 3, d: 4 };
 *      const o2 = { a: 10, b: 20, c: 3, d: 40 };
 *      R.eqProps('a', o1, o2); //=> false
 *      R.eqProps('c', o1, o2); //=> true
 */


var eqProps = /*#__PURE__*/_curry3(function eqProps(prop, obj1, obj2) {
  return equals(obj1[prop], obj2[prop]);
});
module.exports = eqProps;
  })();
});

require.register("ramda/src/equals.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _equals = /*#__PURE__*/require('./internal/_equals');

/**
 * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
 * cyclical data structures.
 *
 * Dispatches symmetrically to the `equals` methods of both arguments, if
 * present.
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Relation
 * @sig a -> b -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      R.equals(1, 1); //=> true
 *      R.equals(1, '1'); //=> false
 *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
 *
 *      const a = {}; a.v = a;
 *      const b = {}; b.v = b;
 *      R.equals(a, b); //=> true
 */


var equals = /*#__PURE__*/_curry2(function equals(a, b) {
  return _equals(a, b, [], []);
});
module.exports = equals;
  })();
});

require.register("ramda/src/evolve.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Creates a new object by recursively evolving a shallow copy of `object`,
 * according to the `transformation` functions. All non-primitive properties
 * are copied by reference.
 *
 * A `transformation` function will not be invoked if its corresponding key
 * does not exist in the evolved object.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Object
 * @sig {k: (v -> v)} -> {k: v} -> {k: v}
 * @param {Object} transformations The object specifying transformation functions to apply
 *        to the object.
 * @param {Object} object The object to be transformed.
 * @return {Object} The transformed object.
 * @example
 *
 *      const tomato = {firstName: '  Tomato ', data: {elapsed: 100, remaining: 1400}, id:123};
 *      const transformations = {
 *        firstName: R.trim,
 *        lastName: R.trim, // Will not get invoked.
 *        data: {elapsed: R.add(1), remaining: R.add(-1)}
 *      };
 *      R.evolve(transformations, tomato); //=> {firstName: 'Tomato', data: {elapsed: 101, remaining: 1399}, id:123}
 */


var evolve = /*#__PURE__*/_curry2(function evolve(transformations, object) {
  var result = object instanceof Array ? [] : {};
  var transformation, key, type;
  for (key in object) {
    transformation = transformations[key];
    type = typeof transformation;
    result[key] = type === 'function' ? transformation(object[key]) : transformation && type === 'object' ? evolve(transformation, object[key]) : object[key];
  }
  return result;
});
module.exports = evolve;
  })();
});

require.register("ramda/src/filter.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _filter = /*#__PURE__*/require('./internal/_filter');

var _isObject = /*#__PURE__*/require('./internal/_isObject');

var _reduce = /*#__PURE__*/require('./internal/_reduce');

var _xfilter = /*#__PURE__*/require('./internal/_xfilter');

var keys = /*#__PURE__*/require('./keys');

/**
 * Takes a predicate and a `Filterable`, and returns a new filterable of the
 * same type containing the members of the given filterable which satisfy the
 * given predicate. Filterable objects include plain objects or any object
 * that has a filter method such as `Array`.
 *
 * Dispatches to the `filter` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Filterable f => (a -> Boolean) -> f a -> f a
 * @param {Function} pred
 * @param {Array} filterable
 * @return {Array} Filterable
 * @see R.reject, R.transduce, R.addIndex
 * @example
 *
 *      const isEven = n => n % 2 === 0;
 *
 *      R.filter(isEven, [1, 2, 3, 4]); //=> [2, 4]
 *
 *      R.filter(isEven, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
 */


var filter = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['filter'], _xfilter, function (pred, filterable) {
  return _isObject(filterable) ? _reduce(function (acc, key) {
    if (pred(filterable[key])) {
      acc[key] = filterable[key];
    }
    return acc;
  }, {}, keys(filterable)) :
  // else
  _filter(pred, filterable);
}));
module.exports = filter;
  })();
});

require.register("ramda/src/find.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xfind = /*#__PURE__*/require('./internal/_xfind');

/**
 * Returns the first element of the list which matches the predicate, or
 * `undefined` if no element matches.
 *
 * Dispatches to the `find` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> a | undefined
 * @param {Function} fn The predicate function used to determine if the element is the
 *        desired one.
 * @param {Array} list The array to consider.
 * @return {Object} The element found, or `undefined`.
 * @see R.transduce
 * @example
 *
 *      const xs = [{a: 1}, {a: 2}, {a: 3}];
 *      R.find(R.propEq('a', 2))(xs); //=> {a: 2}
 *      R.find(R.propEq('a', 4))(xs); //=> undefined
 */


var find = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['find'], _xfind, function find(fn, list) {
  var idx = 0;
  var len = list.length;
  while (idx < len) {
    if (fn(list[idx])) {
      return list[idx];
    }
    idx += 1;
  }
}));
module.exports = find;
  })();
});

require.register("ramda/src/findIndex.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xfindIndex = /*#__PURE__*/require('./internal/_xfindIndex');

/**
 * Returns the index of the first element of the list which matches the
 * predicate, or `-1` if no element matches.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category List
 * @sig (a -> Boolean) -> [a] -> Number
 * @param {Function} fn The predicate function used to determine if the element is the
 * desired one.
 * @param {Array} list The array to consider.
 * @return {Number} The index of the element found, or `-1`.
 * @see R.transduce
 * @example
 *
 *      const xs = [{a: 1}, {a: 2}, {a: 3}];
 *      R.findIndex(R.propEq('a', 2))(xs); //=> 1
 *      R.findIndex(R.propEq('a', 4))(xs); //=> -1
 */


var findIndex = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable([], _xfindIndex, function findIndex(fn, list) {
  var idx = 0;
  var len = list.length;
  while (idx < len) {
    if (fn(list[idx])) {
      return idx;
    }
    idx += 1;
  }
  return -1;
}));
module.exports = findIndex;
  })();
});

require.register("ramda/src/findLast.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xfindLast = /*#__PURE__*/require('./internal/_xfindLast');

/**
 * Returns the last element of the list which matches the predicate, or
 * `undefined` if no element matches.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category List
 * @sig (a -> Boolean) -> [a] -> a | undefined
 * @param {Function} fn The predicate function used to determine if the element is the
 * desired one.
 * @param {Array} list The array to consider.
 * @return {Object} The element found, or `undefined`.
 * @see R.transduce
 * @example
 *
 *      const xs = [{a: 1, b: 0}, {a:1, b: 1}];
 *      R.findLast(R.propEq('a', 1))(xs); //=> {a: 1, b: 1}
 *      R.findLast(R.propEq('a', 4))(xs); //=> undefined
 */


var findLast = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable([], _xfindLast, function findLast(fn, list) {
  var idx = list.length - 1;
  while (idx >= 0) {
    if (fn(list[idx])) {
      return list[idx];
    }
    idx -= 1;
  }
}));
module.exports = findLast;
  })();
});

require.register("ramda/src/findLastIndex.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xfindLastIndex = /*#__PURE__*/require('./internal/_xfindLastIndex');

/**
 * Returns the index of the last element of the list which matches the
 * predicate, or `-1` if no element matches.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category List
 * @sig (a -> Boolean) -> [a] -> Number
 * @param {Function} fn The predicate function used to determine if the element is the
 * desired one.
 * @param {Array} list The array to consider.
 * @return {Number} The index of the element found, or `-1`.
 * @see R.transduce
 * @example
 *
 *      const xs = [{a: 1, b: 0}, {a:1, b: 1}];
 *      R.findLastIndex(R.propEq('a', 1))(xs); //=> 1
 *      R.findLastIndex(R.propEq('a', 4))(xs); //=> -1
 */


var findLastIndex = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable([], _xfindLastIndex, function findLastIndex(fn, list) {
  var idx = list.length - 1;
  while (idx >= 0) {
    if (fn(list[idx])) {
      return idx;
    }
    idx -= 1;
  }
  return -1;
}));
module.exports = findLastIndex;
  })();
});

require.register("ramda/src/flatten.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var _makeFlat = /*#__PURE__*/require('./internal/_makeFlat');

/**
 * Returns a new list by pulling every item out of it (and all its sub-arrays)
 * and putting them in a new array, depth-first.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [b]
 * @param {Array} list The array to consider.
 * @return {Array} The flattened list.
 * @see R.unnest
 * @example
 *
 *      R.flatten([1, 2, [3, 4], 5, [6, [7, 8, [9, [10, 11], 12]]]]);
 *      //=> [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
 */


var flatten = /*#__PURE__*/_curry1( /*#__PURE__*/_makeFlat(true));
module.exports = flatten;
  })();
});

require.register("ramda/src/flip.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var curryN = /*#__PURE__*/require('./curryN');

/**
 * Returns a new function much like the supplied one, except that the first two
 * arguments' order is reversed.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((a, b, c, ...) -> z) -> (b -> a -> c -> ... -> z)
 * @param {Function} fn The function to invoke with its first two parameters reversed.
 * @return {*} The result of invoking `fn` with its first two parameters' order reversed.
 * @example
 *
 *      const mergeThree = (a, b, c) => [].concat(a, b, c);
 *
 *      mergeThree(1, 2, 3); //=> [1, 2, 3]
 *
 *      R.flip(mergeThree)(1, 2, 3); //=> [2, 1, 3]
 * @symb R.flip(f)(a, b, c) = f(b, a, c)
 */


var flip = /*#__PURE__*/_curry1(function flip(fn) {
  return curryN(fn.length, function (a, b) {
    var args = Array.prototype.slice.call(arguments, 0);
    args[0] = b;
    args[1] = a;
    return fn.apply(this, args);
  });
});
module.exports = flip;
  })();
});

require.register("ramda/src/forEach.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _checkForMethod = /*#__PURE__*/require('./internal/_checkForMethod');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Iterate over an input `list`, calling a provided function `fn` for each
 * element in the list.
 *
 * `fn` receives one argument: *(value)*.
 *
 * Note: `R.forEach` does not skip deleted or unassigned indices (sparse
 * arrays), unlike the native `Array.prototype.forEach` method. For more
 * details on this behavior, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Description
 *
 * Also note that, unlike `Array.prototype.forEach`, Ramda's `forEach` returns
 * the original array. In some libraries this function is named `each`.
 *
 * Dispatches to the `forEach` method of the second argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category List
 * @sig (a -> *) -> [a] -> [a]
 * @param {Function} fn The function to invoke. Receives one argument, `value`.
 * @param {Array} list The list to iterate over.
 * @return {Array} The original list.
 * @see R.addIndex
 * @example
 *
 *      const printXPlusFive = x => console.log(x + 5);
 *      R.forEach(printXPlusFive, [1, 2, 3]); //=> [1, 2, 3]
 *      // logs 6
 *      // logs 7
 *      // logs 8
 * @symb R.forEach(f, [a, b, c]) = [a, b, c]
 */


var forEach = /*#__PURE__*/_curry2( /*#__PURE__*/_checkForMethod('forEach', function forEach(fn, list) {
  var len = list.length;
  var idx = 0;
  while (idx < len) {
    fn(list[idx]);
    idx += 1;
  }
  return list;
}));
module.exports = forEach;
  })();
});

require.register("ramda/src/forEachObjIndexed.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var keys = /*#__PURE__*/require('./keys');

/**
 * Iterate over an input `object`, calling a provided function `fn` for each
 * key and value in the object.
 *
 * `fn` receives three argument: *(value, key, obj)*.
 *
 * @func
 * @memberOf R
 * @since v0.23.0
 * @category Object
 * @sig ((a, String, StrMap a) -> Any) -> StrMap a -> StrMap a
 * @param {Function} fn The function to invoke. Receives three argument, `value`, `key`, `obj`.
 * @param {Object} obj The object to iterate over.
 * @return {Object} The original object.
 * @example
 *
 *      const printKeyConcatValue = (value, key) => console.log(key + ':' + value);
 *      R.forEachObjIndexed(printKeyConcatValue, {x: 1, y: 2}); //=> {x: 1, y: 2}
 *      // logs x:1
 *      // logs y:2
 * @symb R.forEachObjIndexed(f, {x: a, y: b}) = {x: a, y: b}
 */


var forEachObjIndexed = /*#__PURE__*/_curry2(function forEachObjIndexed(fn, obj) {
  var keyList = keys(obj);
  var idx = 0;
  while (idx < keyList.length) {
    var key = keyList[idx];
    fn(obj[key], key, obj);
    idx += 1;
  }
  return obj;
});
module.exports = forEachObjIndexed;
  })();
});

require.register("ramda/src/fromPairs.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Creates a new object from a list key-value pairs. If a key appears in
 * multiple pairs, the rightmost pair is included in the object.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig [[k,v]] -> {k: v}
 * @param {Array} pairs An array of two-element arrays that will be the keys and values of the output object.
 * @return {Object} The object made by pairing up `keys` and `values`.
 * @see R.toPairs, R.pair
 * @example
 *
 *      R.fromPairs([['a', 1], ['b', 2], ['c', 3]]); //=> {a: 1, b: 2, c: 3}
 */


var fromPairs = /*#__PURE__*/_curry1(function fromPairs(pairs) {
  var result = {};
  var idx = 0;
  while (idx < pairs.length) {
    result[pairs[idx][0]] = pairs[idx][1];
    idx += 1;
  }
  return result;
});
module.exports = fromPairs;
  })();
});

require.register("ramda/src/groupBy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _checkForMethod = /*#__PURE__*/require('./internal/_checkForMethod');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var reduceBy = /*#__PURE__*/require('./reduceBy');

/**
 * Splits a list into sub-lists stored in an object, based on the result of
 * calling a String-returning function on each element, and grouping the
 * results according to values returned.
 *
 * Dispatches to the `groupBy` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig (a -> String) -> [a] -> {String: [a]}
 * @param {Function} fn Function :: a -> String
 * @param {Array} list The array to group
 * @return {Object} An object with the output of `fn` for keys, mapped to arrays of elements
 *         that produced that key when passed to `fn`.
 * @see R.reduceBy, R.transduce
 * @example
 *
 *      const byGrade = R.groupBy(function(student) {
 *        const score = student.score;
 *        return score < 65 ? 'F' :
 *               score < 70 ? 'D' :
 *               score < 80 ? 'C' :
 *               score < 90 ? 'B' : 'A';
 *      });
 *      const students = [{name: 'Abby', score: 84},
 *                      {name: 'Eddy', score: 58},
 *                      // ...
 *                      {name: 'Jack', score: 69}];
 *      byGrade(students);
 *      // {
 *      //   'A': [{name: 'Dianne', score: 99}],
 *      //   'B': [{name: 'Abby', score: 84}]
 *      //   // ...,
 *      //   'F': [{name: 'Eddy', score: 58}]
 *      // }
 */


var groupBy = /*#__PURE__*/_curry2( /*#__PURE__*/_checkForMethod('groupBy', /*#__PURE__*/reduceBy(function (acc, item) {
  if (acc == null) {
    acc = [];
  }
  acc.push(item);
  return acc;
}, null)));
module.exports = groupBy;
  })();
});

require.register("ramda/src/groupWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Takes a list and returns a list of lists where each sublist's elements are
 * all satisfied pairwise comparison according to the provided function.
 * Only adjacent elements are passed to the comparison function.
 *
 * @func
 * @memberOf R
 * @since v0.21.0
 * @category List
 * @sig ((a, a) → Boolean) → [a] → [[a]]
 * @param {Function} fn Function for determining whether two given (adjacent)
 *        elements should be in the same group
 * @param {Array} list The array to group. Also accepts a string, which will be
 *        treated as a list of characters.
 * @return {List} A list that contains sublists of elements,
 *         whose concatenations are equal to the original list.
 * @example
 *
 * R.groupWith(R.equals, [0, 1, 1, 2, 3, 5, 8, 13, 21])
 * //=> [[0], [1, 1], [2], [3], [5], [8], [13], [21]]
 *
 * R.groupWith((a, b) => a + 1 === b, [0, 1, 1, 2, 3, 5, 8, 13, 21])
 * //=> [[0, 1], [1, 2, 3], [5], [8], [13], [21]]
 *
 * R.groupWith((a, b) => a % 2 === b % 2, [0, 1, 1, 2, 3, 5, 8, 13, 21])
 * //=> [[0], [1, 1], [2], [3, 5], [8], [13, 21]]
 *
 * R.groupWith(R.eqBy(isVowel), 'aestiou')
 * //=> ['ae', 'st', 'iou']
 */


var groupWith = /*#__PURE__*/_curry2(function (fn, list) {
  var res = [];
  var idx = 0;
  var len = list.length;
  while (idx < len) {
    var nextidx = idx + 1;
    while (nextidx < len && fn(list[nextidx - 1], list[nextidx])) {
      nextidx += 1;
    }
    res.push(list.slice(idx, nextidx));
    idx = nextidx;
  }
  return res;
});
module.exports = groupWith;
  })();
});

require.register("ramda/src/gt.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns `true` if the first argument is greater than the second; `false`
 * otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @see R.lt
 * @example
 *
 *      R.gt(2, 1); //=> true
 *      R.gt(2, 2); //=> false
 *      R.gt(2, 3); //=> false
 *      R.gt('a', 'z'); //=> false
 *      R.gt('z', 'a'); //=> true
 */


var gt = /*#__PURE__*/_curry2(function gt(a, b) {
  return a > b;
});
module.exports = gt;
  })();
});

require.register("ramda/src/gte.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns `true` if the first argument is greater than or equal to the second;
 * `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> Boolean
 * @param {Number} a
 * @param {Number} b
 * @return {Boolean}
 * @see R.lte
 * @example
 *
 *      R.gte(2, 1); //=> true
 *      R.gte(2, 2); //=> true
 *      R.gte(2, 3); //=> false
 *      R.gte('a', 'z'); //=> false
 *      R.gte('z', 'a'); //=> true
 */


var gte = /*#__PURE__*/_curry2(function gte(a, b) {
  return a >= b;
});
module.exports = gte;
  })();
});

require.register("ramda/src/has.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var hasPath = /*#__PURE__*/require('./hasPath');

/**
 * Returns whether or not an object has an own property with the specified name
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Object
 * @sig s -> {s: x} -> Boolean
 * @param {String} prop The name of the property to check for.
 * @param {Object} obj The object to query.
 * @return {Boolean} Whether the property exists.
 * @example
 *
 *      const hasName = R.has('name');
 *      hasName({name: 'alice'});   //=> true
 *      hasName({name: 'bob'});     //=> true
 *      hasName({});                //=> false
 *
 *      const point = {x: 0, y: 0};
 *      const pointHas = R.has(R.__, point);
 *      pointHas('x');  //=> true
 *      pointHas('y');  //=> true
 *      pointHas('z');  //=> false
 */


var has = /*#__PURE__*/_curry2(function has(prop, obj) {
  return hasPath([prop], obj);
});
module.exports = has;
  })();
});

require.register("ramda/src/hasIn.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns whether or not an object or its prototype chain has a property with
 * the specified name
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Object
 * @sig s -> {s: x} -> Boolean
 * @param {String} prop The name of the property to check for.
 * @param {Object} obj The object to query.
 * @return {Boolean} Whether the property exists.
 * @example
 *
 *      function Rectangle(width, height) {
 *        this.width = width;
 *        this.height = height;
 *      }
 *      Rectangle.prototype.area = function() {
 *        return this.width * this.height;
 *      };
 *
 *      const square = new Rectangle(2, 2);
 *      R.hasIn('width', square);  //=> true
 *      R.hasIn('area', square);  //=> true
 */


var hasIn = /*#__PURE__*/_curry2(function hasIn(prop, obj) {
  return prop in obj;
});
module.exports = hasIn;
  })();
});

require.register("ramda/src/hasPath.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _has = /*#__PURE__*/require('./internal/_has');

/**
 * Returns whether or not a path exists in an object. Only the object's
 * own properties are checked.
 *
 * @func
 * @memberOf R
 * @since v0.26.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig [Idx] -> {a} -> Boolean
 * @param {Array} path The path to use.
 * @param {Object} obj The object to check the path in.
 * @return {Boolean} Whether the path exists.
 * @see R.has
 * @example
 *
 *      R.hasPath(['a', 'b'], {a: {b: 2}});         // => true
 *      R.hasPath(['a', 'b'], {a: {b: undefined}}); // => true
 *      R.hasPath(['a', 'b'], {a: {c: 2}});         // => false
 *      R.hasPath(['a', 'b'], {});                  // => false
 */


var hasPath = /*#__PURE__*/_curry2(function hasPath(_path, obj) {
  if (_path.length === 0) {
    return false;
  }
  var val = obj;
  var idx = 0;
  while (idx < _path.length) {
    if (_has(_path[idx], val)) {
      val = val[_path[idx]];
      idx += 1;
    } else {
      return false;
    }
  }
  return true;
});
module.exports = hasPath;
  })();
});

require.register("ramda/src/head.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var nth = /*#__PURE__*/require('./nth');

/**
 * Returns the first element of the given list or string. In some libraries
 * this function is named `first`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> a | Undefined
 * @sig String -> String
 * @param {Array|String} list
 * @return {*}
 * @see R.tail, R.init, R.last
 * @example
 *
 *      R.head(['fi', 'fo', 'fum']); //=> 'fi'
 *      R.head([]); //=> undefined
 *
 *      R.head('abc'); //=> 'a'
 *      R.head(''); //=> ''
 */


var head = /*#__PURE__*/nth(0);
module.exports = head;
  })();
});

require.register("ramda/src/identical.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _objectIs = /*#__PURE__*/require('./internal/_objectIs');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns true if its arguments are identical, false otherwise. Values are
 * identical if they reference the same memory. `NaN` is identical to `NaN`;
 * `0` and `-0` are not identical.
 *
 * Note this is merely a curried version of ES6 `Object.is`.
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Relation
 * @sig a -> a -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      const o = {};
 *      R.identical(o, o); //=> true
 *      R.identical(1, 1); //=> true
 *      R.identical(1, '1'); //=> false
 *      R.identical([], []); //=> false
 *      R.identical(0, -0); //=> false
 *      R.identical(NaN, NaN); //=> true
 */


var identical = /*#__PURE__*/_curry2(_objectIs);
module.exports = identical;
  })();
});

require.register("ramda/src/identity.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var _identity = /*#__PURE__*/require('./internal/_identity');

/**
 * A function that does nothing but return the parameter supplied to it. Good
 * as a default or placeholder function.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig a -> a
 * @param {*} x The value to return.
 * @return {*} The input value, `x`.
 * @example
 *
 *      R.identity(1); //=> 1
 *
 *      const obj = {};
 *      R.identity(obj) === obj; //=> true
 * @symb R.identity(a) = a
 */


var identity = /*#__PURE__*/_curry1(_identity);
module.exports = identity;
  })();
});

require.register("ramda/src/ifElse.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var curryN = /*#__PURE__*/require('./curryN');

/**
 * Creates a function that will process either the `onTrue` or the `onFalse`
 * function depending upon the result of the `condition` predicate.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Logic
 * @sig (*... -> Boolean) -> (*... -> *) -> (*... -> *) -> (*... -> *)
 * @param {Function} condition A predicate function
 * @param {Function} onTrue A function to invoke when the `condition` evaluates to a truthy value.
 * @param {Function} onFalse A function to invoke when the `condition` evaluates to a falsy value.
 * @return {Function} A new function that will process either the `onTrue` or the `onFalse`
 *                    function depending upon the result of the `condition` predicate.
 * @see R.unless, R.when, R.cond
 * @example
 *
 *      const incCount = R.ifElse(
 *        R.has('count'),
 *        R.over(R.lensProp('count'), R.inc),
 *        R.assoc('count', 1)
 *      );
 *      incCount({});           //=> { count: 1 }
 *      incCount({ count: 1 }); //=> { count: 2 }
 */


var ifElse = /*#__PURE__*/_curry3(function ifElse(condition, onTrue, onFalse) {
  return curryN(Math.max(condition.length, onTrue.length, onFalse.length), function _ifElse() {
    return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments);
  });
});
module.exports = ifElse;
  })();
});

require.register("ramda/src/inc.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var add = /*#__PURE__*/require('./add');

/**
 * Increments its argument.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Math
 * @sig Number -> Number
 * @param {Number} n
 * @return {Number} n + 1
 * @see R.dec
 * @example
 *
 *      R.inc(42); //=> 43
 */


var inc = /*#__PURE__*/add(1);
module.exports = inc;
  })();
});

require.register("ramda/src/includes.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _includes = /*#__PURE__*/require('./internal/_includes');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns `true` if the specified value is equal, in [`R.equals`](#equals)
 * terms, to at least one element of the given list; `false` otherwise.
 * Works also with strings.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> Boolean
 * @param {Object} a The item to compare against.
 * @param {Array} list The array to consider.
 * @return {Boolean} `true` if an equivalent item is in the list, `false` otherwise.
 * @see R.any
 * @example
 *
 *      R.includes(3, [1, 2, 3]); //=> true
 *      R.includes(4, [1, 2, 3]); //=> false
 *      R.includes({ name: 'Fred' }, [{ name: 'Fred' }]); //=> true
 *      R.includes([42], [[42]]); //=> true
 *      R.includes('ba', 'banana'); //=>true
 */


var includes = /*#__PURE__*/_curry2(_includes);
module.exports = includes;
  })();
});

require.register("ramda/src/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    module.exports = {};
module.exports.F = /*#__PURE__*/require('./F');
module.exports.T = /*#__PURE__*/require('./T');
module.exports.__ = /*#__PURE__*/require('./__');
module.exports.add = /*#__PURE__*/require('./add');
module.exports.addIndex = /*#__PURE__*/require('./addIndex');
module.exports.adjust = /*#__PURE__*/require('./adjust');
module.exports.all = /*#__PURE__*/require('./all');
module.exports.allPass = /*#__PURE__*/require('./allPass');
module.exports.always = /*#__PURE__*/require('./always');
module.exports.and = /*#__PURE__*/require('./and');
module.exports.any = /*#__PURE__*/require('./any');
module.exports.anyPass = /*#__PURE__*/require('./anyPass');
module.exports.ap = /*#__PURE__*/require('./ap');
module.exports.aperture = /*#__PURE__*/require('./aperture');
module.exports.append = /*#__PURE__*/require('./append');
module.exports.apply = /*#__PURE__*/require('./apply');
module.exports.applySpec = /*#__PURE__*/require('./applySpec');
module.exports.applyTo = /*#__PURE__*/require('./applyTo');
module.exports.ascend = /*#__PURE__*/require('./ascend');
module.exports.assoc = /*#__PURE__*/require('./assoc');
module.exports.assocPath = /*#__PURE__*/require('./assocPath');
module.exports.binary = /*#__PURE__*/require('./binary');
module.exports.bind = /*#__PURE__*/require('./bind');
module.exports.both = /*#__PURE__*/require('./both');
module.exports.call = /*#__PURE__*/require('./call');
module.exports.chain = /*#__PURE__*/require('./chain');
module.exports.clamp = /*#__PURE__*/require('./clamp');
module.exports.clone = /*#__PURE__*/require('./clone');
module.exports.comparator = /*#__PURE__*/require('./comparator');
module.exports.complement = /*#__PURE__*/require('./complement');
module.exports.compose = /*#__PURE__*/require('./compose');
module.exports.composeK = /*#__PURE__*/require('./composeK');
module.exports.composeP = /*#__PURE__*/require('./composeP');
module.exports.composeWith = /*#__PURE__*/require('./composeWith');
module.exports.concat = /*#__PURE__*/require('./concat');
module.exports.cond = /*#__PURE__*/require('./cond');
module.exports.construct = /*#__PURE__*/require('./construct');
module.exports.constructN = /*#__PURE__*/require('./constructN');
module.exports.contains = /*#__PURE__*/require('./contains');
module.exports.converge = /*#__PURE__*/require('./converge');
module.exports.countBy = /*#__PURE__*/require('./countBy');
module.exports.curry = /*#__PURE__*/require('./curry');
module.exports.curryN = /*#__PURE__*/require('./curryN');
module.exports.dec = /*#__PURE__*/require('./dec');
module.exports.defaultTo = /*#__PURE__*/require('./defaultTo');
module.exports.descend = /*#__PURE__*/require('./descend');
module.exports.difference = /*#__PURE__*/require('./difference');
module.exports.differenceWith = /*#__PURE__*/require('./differenceWith');
module.exports.dissoc = /*#__PURE__*/require('./dissoc');
module.exports.dissocPath = /*#__PURE__*/require('./dissocPath');
module.exports.divide = /*#__PURE__*/require('./divide');
module.exports.drop = /*#__PURE__*/require('./drop');
module.exports.dropLast = /*#__PURE__*/require('./dropLast');
module.exports.dropLastWhile = /*#__PURE__*/require('./dropLastWhile');
module.exports.dropRepeats = /*#__PURE__*/require('./dropRepeats');
module.exports.dropRepeatsWith = /*#__PURE__*/require('./dropRepeatsWith');
module.exports.dropWhile = /*#__PURE__*/require('./dropWhile');
module.exports.either = /*#__PURE__*/require('./either');
module.exports.empty = /*#__PURE__*/require('./empty');
module.exports.endsWith = /*#__PURE__*/require('./endsWith');
module.exports.eqBy = /*#__PURE__*/require('./eqBy');
module.exports.eqProps = /*#__PURE__*/require('./eqProps');
module.exports.equals = /*#__PURE__*/require('./equals');
module.exports.evolve = /*#__PURE__*/require('./evolve');
module.exports.filter = /*#__PURE__*/require('./filter');
module.exports.find = /*#__PURE__*/require('./find');
module.exports.findIndex = /*#__PURE__*/require('./findIndex');
module.exports.findLast = /*#__PURE__*/require('./findLast');
module.exports.findLastIndex = /*#__PURE__*/require('./findLastIndex');
module.exports.flatten = /*#__PURE__*/require('./flatten');
module.exports.flip = /*#__PURE__*/require('./flip');
module.exports.forEach = /*#__PURE__*/require('./forEach');
module.exports.forEachObjIndexed = /*#__PURE__*/require('./forEachObjIndexed');
module.exports.fromPairs = /*#__PURE__*/require('./fromPairs');
module.exports.groupBy = /*#__PURE__*/require('./groupBy');
module.exports.groupWith = /*#__PURE__*/require('./groupWith');
module.exports.gt = /*#__PURE__*/require('./gt');
module.exports.gte = /*#__PURE__*/require('./gte');
module.exports.has = /*#__PURE__*/require('./has');
module.exports.hasIn = /*#__PURE__*/require('./hasIn');
module.exports.hasPath = /*#__PURE__*/require('./hasPath');
module.exports.head = /*#__PURE__*/require('./head');
module.exports.identical = /*#__PURE__*/require('./identical');
module.exports.identity = /*#__PURE__*/require('./identity');
module.exports.ifElse = /*#__PURE__*/require('./ifElse');
module.exports.inc = /*#__PURE__*/require('./inc');
module.exports.includes = /*#__PURE__*/require('./includes');
module.exports.indexBy = /*#__PURE__*/require('./indexBy');
module.exports.indexOf = /*#__PURE__*/require('./indexOf');
module.exports.init = /*#__PURE__*/require('./init');
module.exports.innerJoin = /*#__PURE__*/require('./innerJoin');
module.exports.insert = /*#__PURE__*/require('./insert');
module.exports.insertAll = /*#__PURE__*/require('./insertAll');
module.exports.intersection = /*#__PURE__*/require('./intersection');
module.exports.intersperse = /*#__PURE__*/require('./intersperse');
module.exports.into = /*#__PURE__*/require('./into');
module.exports.invert = /*#__PURE__*/require('./invert');
module.exports.invertObj = /*#__PURE__*/require('./invertObj');
module.exports.invoker = /*#__PURE__*/require('./invoker');
module.exports.is = /*#__PURE__*/require('./is');
module.exports.isEmpty = /*#__PURE__*/require('./isEmpty');
module.exports.isNil = /*#__PURE__*/require('./isNil');
module.exports.join = /*#__PURE__*/require('./join');
module.exports.juxt = /*#__PURE__*/require('./juxt');
module.exports.keys = /*#__PURE__*/require('./keys');
module.exports.keysIn = /*#__PURE__*/require('./keysIn');
module.exports.last = /*#__PURE__*/require('./last');
module.exports.lastIndexOf = /*#__PURE__*/require('./lastIndexOf');
module.exports.length = /*#__PURE__*/require('./length');
module.exports.lens = /*#__PURE__*/require('./lens');
module.exports.lensIndex = /*#__PURE__*/require('./lensIndex');
module.exports.lensPath = /*#__PURE__*/require('./lensPath');
module.exports.lensProp = /*#__PURE__*/require('./lensProp');
module.exports.lift = /*#__PURE__*/require('./lift');
module.exports.liftN = /*#__PURE__*/require('./liftN');
module.exports.lt = /*#__PURE__*/require('./lt');
module.exports.lte = /*#__PURE__*/require('./lte');
module.exports.map = /*#__PURE__*/require('./map');
module.exports.mapAccum = /*#__PURE__*/require('./mapAccum');
module.exports.mapAccumRight = /*#__PURE__*/require('./mapAccumRight');
module.exports.mapObjIndexed = /*#__PURE__*/require('./mapObjIndexed');
module.exports.match = /*#__PURE__*/require('./match');
module.exports.mathMod = /*#__PURE__*/require('./mathMod');
module.exports.max = /*#__PURE__*/require('./max');
module.exports.maxBy = /*#__PURE__*/require('./maxBy');
module.exports.mean = /*#__PURE__*/require('./mean');
module.exports.median = /*#__PURE__*/require('./median');
module.exports.memoizeWith = /*#__PURE__*/require('./memoizeWith');
module.exports.merge = /*#__PURE__*/require('./merge');
module.exports.mergeAll = /*#__PURE__*/require('./mergeAll');
module.exports.mergeDeepLeft = /*#__PURE__*/require('./mergeDeepLeft');
module.exports.mergeDeepRight = /*#__PURE__*/require('./mergeDeepRight');
module.exports.mergeDeepWith = /*#__PURE__*/require('./mergeDeepWith');
module.exports.mergeDeepWithKey = /*#__PURE__*/require('./mergeDeepWithKey');
module.exports.mergeLeft = /*#__PURE__*/require('./mergeLeft');
module.exports.mergeRight = /*#__PURE__*/require('./mergeRight');
module.exports.mergeWith = /*#__PURE__*/require('./mergeWith');
module.exports.mergeWithKey = /*#__PURE__*/require('./mergeWithKey');
module.exports.min = /*#__PURE__*/require('./min');
module.exports.minBy = /*#__PURE__*/require('./minBy');
module.exports.modulo = /*#__PURE__*/require('./modulo');
module.exports.move = /*#__PURE__*/require('./move');
module.exports.multiply = /*#__PURE__*/require('./multiply');
module.exports.nAry = /*#__PURE__*/require('./nAry');
module.exports.negate = /*#__PURE__*/require('./negate');
module.exports.none = /*#__PURE__*/require('./none');
module.exports.not = /*#__PURE__*/require('./not');
module.exports.nth = /*#__PURE__*/require('./nth');
module.exports.nthArg = /*#__PURE__*/require('./nthArg');
module.exports.o = /*#__PURE__*/require('./o');
module.exports.objOf = /*#__PURE__*/require('./objOf');
module.exports.of = /*#__PURE__*/require('./of');
module.exports.omit = /*#__PURE__*/require('./omit');
module.exports.once = /*#__PURE__*/require('./once');
module.exports.or = /*#__PURE__*/require('./or');
module.exports.otherwise = /*#__PURE__*/require('./otherwise');
module.exports.over = /*#__PURE__*/require('./over');
module.exports.pair = /*#__PURE__*/require('./pair');
module.exports.partial = /*#__PURE__*/require('./partial');
module.exports.partialRight = /*#__PURE__*/require('./partialRight');
module.exports.partition = /*#__PURE__*/require('./partition');
module.exports.path = /*#__PURE__*/require('./path');
module.exports.pathEq = /*#__PURE__*/require('./pathEq');
module.exports.pathOr = /*#__PURE__*/require('./pathOr');
module.exports.pathSatisfies = /*#__PURE__*/require('./pathSatisfies');
module.exports.pick = /*#__PURE__*/require('./pick');
module.exports.pickAll = /*#__PURE__*/require('./pickAll');
module.exports.pickBy = /*#__PURE__*/require('./pickBy');
module.exports.pipe = /*#__PURE__*/require('./pipe');
module.exports.pipeK = /*#__PURE__*/require('./pipeK');
module.exports.pipeP = /*#__PURE__*/require('./pipeP');
module.exports.pipeWith = /*#__PURE__*/require('./pipeWith');
module.exports.pluck = /*#__PURE__*/require('./pluck');
module.exports.prepend = /*#__PURE__*/require('./prepend');
module.exports.product = /*#__PURE__*/require('./product');
module.exports.project = /*#__PURE__*/require('./project');
module.exports.prop = /*#__PURE__*/require('./prop');
module.exports.propEq = /*#__PURE__*/require('./propEq');
module.exports.propIs = /*#__PURE__*/require('./propIs');
module.exports.propOr = /*#__PURE__*/require('./propOr');
module.exports.propSatisfies = /*#__PURE__*/require('./propSatisfies');
module.exports.props = /*#__PURE__*/require('./props');
module.exports.range = /*#__PURE__*/require('./range');
module.exports.reduce = /*#__PURE__*/require('./reduce');
module.exports.reduceBy = /*#__PURE__*/require('./reduceBy');
module.exports.reduceRight = /*#__PURE__*/require('./reduceRight');
module.exports.reduceWhile = /*#__PURE__*/require('./reduceWhile');
module.exports.reduced = /*#__PURE__*/require('./reduced');
module.exports.reject = /*#__PURE__*/require('./reject');
module.exports.remove = /*#__PURE__*/require('./remove');
module.exports.repeat = /*#__PURE__*/require('./repeat');
module.exports.replace = /*#__PURE__*/require('./replace');
module.exports.reverse = /*#__PURE__*/require('./reverse');
module.exports.scan = /*#__PURE__*/require('./scan');
module.exports.sequence = /*#__PURE__*/require('./sequence');
module.exports.set = /*#__PURE__*/require('./set');
module.exports.slice = /*#__PURE__*/require('./slice');
module.exports.sort = /*#__PURE__*/require('./sort');
module.exports.sortBy = /*#__PURE__*/require('./sortBy');
module.exports.sortWith = /*#__PURE__*/require('./sortWith');
module.exports.split = /*#__PURE__*/require('./split');
module.exports.splitAt = /*#__PURE__*/require('./splitAt');
module.exports.splitEvery = /*#__PURE__*/require('./splitEvery');
module.exports.splitWhen = /*#__PURE__*/require('./splitWhen');
module.exports.startsWith = /*#__PURE__*/require('./startsWith');
module.exports.subtract = /*#__PURE__*/require('./subtract');
module.exports.sum = /*#__PURE__*/require('./sum');
module.exports.symmetricDifference = /*#__PURE__*/require('./symmetricDifference');
module.exports.symmetricDifferenceWith = /*#__PURE__*/require('./symmetricDifferenceWith');
module.exports.tail = /*#__PURE__*/require('./tail');
module.exports.take = /*#__PURE__*/require('./take');
module.exports.takeLast = /*#__PURE__*/require('./takeLast');
module.exports.takeLastWhile = /*#__PURE__*/require('./takeLastWhile');
module.exports.takeWhile = /*#__PURE__*/require('./takeWhile');
module.exports.tap = /*#__PURE__*/require('./tap');
module.exports.test = /*#__PURE__*/require('./test');
module.exports.then = /*#__PURE__*/require('./then');
module.exports.times = /*#__PURE__*/require('./times');
module.exports.toLower = /*#__PURE__*/require('./toLower');
module.exports.toPairs = /*#__PURE__*/require('./toPairs');
module.exports.toPairsIn = /*#__PURE__*/require('./toPairsIn');
module.exports.toString = /*#__PURE__*/require('./toString');
module.exports.toUpper = /*#__PURE__*/require('./toUpper');
module.exports.transduce = /*#__PURE__*/require('./transduce');
module.exports.transpose = /*#__PURE__*/require('./transpose');
module.exports.traverse = /*#__PURE__*/require('./traverse');
module.exports.trim = /*#__PURE__*/require('./trim');
module.exports.tryCatch = /*#__PURE__*/require('./tryCatch');
module.exports.type = /*#__PURE__*/require('./type');
module.exports.unapply = /*#__PURE__*/require('./unapply');
module.exports.unary = /*#__PURE__*/require('./unary');
module.exports.uncurryN = /*#__PURE__*/require('./uncurryN');
module.exports.unfold = /*#__PURE__*/require('./unfold');
module.exports.union = /*#__PURE__*/require('./union');
module.exports.unionWith = /*#__PURE__*/require('./unionWith');
module.exports.uniq = /*#__PURE__*/require('./uniq');
module.exports.uniqBy = /*#__PURE__*/require('./uniqBy');
module.exports.uniqWith = /*#__PURE__*/require('./uniqWith');
module.exports.unless = /*#__PURE__*/require('./unless');
module.exports.unnest = /*#__PURE__*/require('./unnest');
module.exports.until = /*#__PURE__*/require('./until');
module.exports.update = /*#__PURE__*/require('./update');
module.exports.useWith = /*#__PURE__*/require('./useWith');
module.exports.values = /*#__PURE__*/require('./values');
module.exports.valuesIn = /*#__PURE__*/require('./valuesIn');
module.exports.view = /*#__PURE__*/require('./view');
module.exports.when = /*#__PURE__*/require('./when');
module.exports.where = /*#__PURE__*/require('./where');
module.exports.whereEq = /*#__PURE__*/require('./whereEq');
module.exports.without = /*#__PURE__*/require('./without');
module.exports.xprod = /*#__PURE__*/require('./xprod');
module.exports.zip = /*#__PURE__*/require('./zip');
module.exports.zipObj = /*#__PURE__*/require('./zipObj');
module.exports.zipWith = /*#__PURE__*/require('./zipWith');
module.exports.thunkify = /*#__PURE__*/require('./thunkify');
  })();
});

require.register("ramda/src/indexBy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var reduceBy = /*#__PURE__*/require('./reduceBy');

/**
 * Given a function that generates a key, turns a list of objects into an
 * object indexing the objects by the given key. Note that if multiple
 * objects generate the same value for the indexing key only the last value
 * will be included in the generated object.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig (a -> String) -> [{k: v}] -> {k: {k: v}}
 * @param {Function} fn Function :: a -> String
 * @param {Array} array The array of objects to index
 * @return {Object} An object indexing each array element by the given property.
 * @example
 *
 *      const list = [{id: 'xyz', title: 'A'}, {id: 'abc', title: 'B'}];
 *      R.indexBy(R.prop('id'), list);
 *      //=> {abc: {id: 'abc', title: 'B'}, xyz: {id: 'xyz', title: 'A'}}
 */


var indexBy = /*#__PURE__*/reduceBy(function (acc, elem) {
  return elem;
}, null);
module.exports = indexBy;
  })();
});

require.register("ramda/src/indexOf.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _indexOf = /*#__PURE__*/require('./internal/_indexOf');

var _isArray = /*#__PURE__*/require('./internal/_isArray');

/**
 * Returns the position of the first occurrence of an item in an array, or -1
 * if the item is not included in the array. [`R.equals`](#equals) is used to
 * determine equality.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> Number
 * @param {*} target The item to find.
 * @param {Array} xs The array to search in.
 * @return {Number} the index of the target, or -1 if the target is not found.
 * @see R.lastIndexOf
 * @example
 *
 *      R.indexOf(3, [1,2,3,4]); //=> 2
 *      R.indexOf(10, [1,2,3,4]); //=> -1
 */


var indexOf = /*#__PURE__*/_curry2(function indexOf(target, xs) {
  return typeof xs.indexOf === 'function' && !_isArray(xs) ? xs.indexOf(target) : _indexOf(xs, target, 0);
});
module.exports = indexOf;
  })();
});

require.register("ramda/src/init.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var slice = /*#__PURE__*/require('./slice');

/**
 * Returns all but the last element of the given list or string.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category List
 * @sig [a] -> [a]
 * @sig String -> String
 * @param {*} list
 * @return {*}
 * @see R.last, R.head, R.tail
 * @example
 *
 *      R.init([1, 2, 3]);  //=> [1, 2]
 *      R.init([1, 2]);     //=> [1]
 *      R.init([1]);        //=> []
 *      R.init([]);         //=> []
 *
 *      R.init('abc');  //=> 'ab'
 *      R.init('ab');   //=> 'a'
 *      R.init('a');    //=> ''
 *      R.init('');     //=> ''
 */


var init = /*#__PURE__*/slice(0, -1);
module.exports = init;
  })();
});

require.register("ramda/src/innerJoin.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _includesWith = /*#__PURE__*/require('./internal/_includesWith');

var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var _filter = /*#__PURE__*/require('./internal/_filter');

/**
 * Takes a predicate `pred`, a list `xs`, and a list `ys`, and returns a list
 * `xs'` comprising each of the elements of `xs` which is equal to one or more
 * elements of `ys` according to `pred`.
 *
 * `pred` must be a binary function expecting an element from each list.
 *
 * `xs`, `ys`, and `xs'` are treated as sets, semantically, so ordering should
 * not be significant, but since `xs'` is ordered the implementation guarantees
 * that its values are in the same order as they appear in `xs`. Duplicates are
 * not removed, so `xs'` may contain duplicates if `xs` contains duplicates.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Relation
 * @sig ((a, b) -> Boolean) -> [a] -> [b] -> [a]
 * @param {Function} pred
 * @param {Array} xs
 * @param {Array} ys
 * @return {Array}
 * @see R.intersection
 * @example
 *
 *      R.innerJoin(
 *        (record, id) => record.id === id,
 *        [{id: 824, name: 'Richie Furay'},
 *         {id: 956, name: 'Dewey Martin'},
 *         {id: 313, name: 'Bruce Palmer'},
 *         {id: 456, name: 'Stephen Stills'},
 *         {id: 177, name: 'Neil Young'}],
 *        [177, 456, 999]
 *      );
 *      //=> [{id: 456, name: 'Stephen Stills'}, {id: 177, name: 'Neil Young'}]
 */


var innerJoin = /*#__PURE__*/_curry3(function innerJoin(pred, xs, ys) {
  return _filter(function (x) {
    return _includesWith(pred, x, ys);
  }, xs);
});
module.exports = innerJoin;
  })();
});

require.register("ramda/src/insert.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Inserts the supplied element into the list, at the specified `index`. _Note that

 * this is not destructive_: it returns a copy of the list with the changes.
 * <small>No lists have been harmed in the application of this function.</small>
 *
 * @func
 * @memberOf R
 * @since v0.2.2
 * @category List
 * @sig Number -> a -> [a] -> [a]
 * @param {Number} index The position to insert the element
 * @param {*} elt The element to insert into the Array
 * @param {Array} list The list to insert into
 * @return {Array} A new Array with `elt` inserted at `index`.
 * @example
 *
 *      R.insert(2, 'x', [1,2,3,4]); //=> [1,2,'x',3,4]
 */


var insert = /*#__PURE__*/_curry3(function insert(idx, elt, list) {
  idx = idx < list.length && idx >= 0 ? idx : list.length;
  var result = Array.prototype.slice.call(list, 0);
  result.splice(idx, 0, elt);
  return result;
});
module.exports = insert;
  })();
});

require.register("ramda/src/insertAll.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Inserts the sub-list into the list, at the specified `index`. _Note that this is not
 * destructive_: it returns a copy of the list with the changes.
 * <small>No lists have been harmed in the application of this function.</small>
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category List
 * @sig Number -> [a] -> [a] -> [a]
 * @param {Number} index The position to insert the sub-list
 * @param {Array} elts The sub-list to insert into the Array
 * @param {Array} list The list to insert the sub-list into
 * @return {Array} A new Array with `elts` inserted starting at `index`.
 * @example
 *
 *      R.insertAll(2, ['x','y','z'], [1,2,3,4]); //=> [1,2,'x','y','z',3,4]
 */


var insertAll = /*#__PURE__*/_curry3(function insertAll(idx, elts, list) {
  idx = idx < list.length && idx >= 0 ? idx : list.length;
  return [].concat(Array.prototype.slice.call(list, 0, idx), elts, Array.prototype.slice.call(list, idx));
});
module.exports = insertAll;
  })();
});

require.register("ramda/src/internal/_Set.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _includes = /*#__PURE__*/require('./_includes');

var _Set = /*#__PURE__*/function () {

  function _Set() {
    /* globals Set */
    this._nativeSet = typeof Set === 'function' ? new Set() : null;
    this._items = {};
  }

  // until we figure out why jsdoc chokes on this
  // @param item The item to add to the Set
  // @returns {boolean} true if the item did not exist prior, otherwise false
  //
  _Set.prototype.add = function (item) {
    return !hasOrAdd(item, true, this);
  };

  //
  // @param item The item to check for existence in the Set
  // @returns {boolean} true if the item exists in the Set, otherwise false
  //
  _Set.prototype.has = function (item) {
    return hasOrAdd(item, false, this);
  };

  //
  // Combines the logic for checking whether an item is a member of the set and
  // for adding a new item to the set.
  //
  // @param item       The item to check or add to the Set instance.
  // @param shouldAdd  If true, the item will be added to the set if it doesn't
  //                   already exist.
  // @param set        The set instance to check or add to.
  // @return {boolean} true if the item already existed, otherwise false.
  //
  return _Set;
}();

function hasOrAdd(item, shouldAdd, set) {
  var type = typeof item;
  var prevSize, newSize;
  switch (type) {
    case 'string':
    case 'number':
      // distinguish between +0 and -0
      if (item === 0 && 1 / item === -Infinity) {
        if (set._items['-0']) {
          return true;
        } else {
          if (shouldAdd) {
            set._items['-0'] = true;
          }
          return false;
        }
      }
      // these types can all utilise the native Set
      if (set._nativeSet !== null) {
        if (shouldAdd) {
          prevSize = set._nativeSet.size;
          set._nativeSet.add(item);
          newSize = set._nativeSet.size;
          return newSize === prevSize;
        } else {
          return set._nativeSet.has(item);
        }
      } else {
        if (!(type in set._items)) {
          if (shouldAdd) {
            set._items[type] = {};
            set._items[type][item] = true;
          }
          return false;
        } else if (item in set._items[type]) {
          return true;
        } else {
          if (shouldAdd) {
            set._items[type][item] = true;
          }
          return false;
        }
      }

    case 'boolean':
      // set._items['boolean'] holds a two element array
      // representing [ falseExists, trueExists ]
      if (type in set._items) {
        var bIdx = item ? 1 : 0;
        if (set._items[type][bIdx]) {
          return true;
        } else {
          if (shouldAdd) {
            set._items[type][bIdx] = true;
          }
          return false;
        }
      } else {
        if (shouldAdd) {
          set._items[type] = item ? [false, true] : [true, false];
        }
        return false;
      }

    case 'function':
      // compare functions for reference equality
      if (set._nativeSet !== null) {
        if (shouldAdd) {
          prevSize = set._nativeSet.size;
          set._nativeSet.add(item);
          newSize = set._nativeSet.size;
          return newSize === prevSize;
        } else {
          return set._nativeSet.has(item);
        }
      } else {
        if (!(type in set._items)) {
          if (shouldAdd) {
            set._items[type] = [item];
          }
          return false;
        }
        if (!_includes(item, set._items[type])) {
          if (shouldAdd) {
            set._items[type].push(item);
          }
          return false;
        }
        return true;
      }

    case 'undefined':
      if (set._items[type]) {
        return true;
      } else {
        if (shouldAdd) {
          set._items[type] = true;
        }
        return false;
      }

    case 'object':
      if (item === null) {
        if (!set._items['null']) {
          if (shouldAdd) {
            set._items['null'] = true;
          }
          return false;
        }
        return true;
      }
    /* falls through */
    default:
      // reduce the search size of heterogeneous sets by creating buckets
      // for each type.
      type = Object.prototype.toString.call(item);
      if (!(type in set._items)) {
        if (shouldAdd) {
          set._items[type] = [item];
        }
        return false;
      }
      // scan through all previously applied items
      if (!_includes(item, set._items[type])) {
        if (shouldAdd) {
          set._items[type].push(item);
        }
        return false;
      }
      return true;
  }
}

// A simple Set type that honours R.equals semantics
module.exports = _Set;
  })();
});

require.register("ramda/src/internal/_aperture.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _aperture(n, list) {
  var idx = 0;
  var limit = list.length - (n - 1);
  var acc = new Array(limit >= 0 ? limit : 0);
  while (idx < limit) {
    acc[idx] = Array.prototype.slice.call(list, idx, idx + n);
    idx += 1;
  }
  return acc;
}
module.exports = _aperture;
  })();
});

require.register("ramda/src/internal/_arity.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _arity(n, fn) {
  /* eslint-disable no-unused-vars */
  switch (n) {
    case 0:
      return function () {
        return fn.apply(this, arguments);
      };
    case 1:
      return function (a0) {
        return fn.apply(this, arguments);
      };
    case 2:
      return function (a0, a1) {
        return fn.apply(this, arguments);
      };
    case 3:
      return function (a0, a1, a2) {
        return fn.apply(this, arguments);
      };
    case 4:
      return function (a0, a1, a2, a3) {
        return fn.apply(this, arguments);
      };
    case 5:
      return function (a0, a1, a2, a3, a4) {
        return fn.apply(this, arguments);
      };
    case 6:
      return function (a0, a1, a2, a3, a4, a5) {
        return fn.apply(this, arguments);
      };
    case 7:
      return function (a0, a1, a2, a3, a4, a5, a6) {
        return fn.apply(this, arguments);
      };
    case 8:
      return function (a0, a1, a2, a3, a4, a5, a6, a7) {
        return fn.apply(this, arguments);
      };
    case 9:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
        return fn.apply(this, arguments);
      };
    case 10:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        return fn.apply(this, arguments);
      };
    default:
      throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
  }
}
module.exports = _arity;
  })();
});

require.register("ramda/src/internal/_arrayFromIterator.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _arrayFromIterator(iter) {
  var list = [];
  var next;
  while (!(next = iter.next()).done) {
    list.push(next.value);
  }
  return list;
}
module.exports = _arrayFromIterator;
  })();
});

require.register("ramda/src/internal/_assertPromise.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _isFunction = /*#__PURE__*/require('./_isFunction');

var _toString = /*#__PURE__*/require('./_toString');

function _assertPromise(name, p) {
  if (p == null || !_isFunction(p.then)) {
    throw new TypeError('`' + name + '` expected a Promise, received ' + _toString(p, []));
  }
}
module.exports = _assertPromise;
  })();
});

require.register("ramda/src/internal/_checkForMethod.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _isArray = /*#__PURE__*/require('./_isArray');

/**
 * This checks whether a function has a [methodname] function. If it isn't an
 * array it will execute that function otherwise it will default to the ramda
 * implementation.
 *
 * @private
 * @param {Function} fn ramda implemtation
 * @param {String} methodname property to check for a custom implementation
 * @return {Object} Whatever the return value of the method is.
 */


function _checkForMethod(methodname, fn) {
  return function () {
    var length = arguments.length;
    if (length === 0) {
      return fn();
    }
    var obj = arguments[length - 1];
    return _isArray(obj) || typeof obj[methodname] !== 'function' ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
  };
}
module.exports = _checkForMethod;
  })();
});

require.register("ramda/src/internal/_clone.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _cloneRegExp = /*#__PURE__*/require('./_cloneRegExp');

var type = /*#__PURE__*/require('../type');

/**
 * Copies an object.
 *
 * @private
 * @param {*} value The value to be copied
 * @param {Array} refFrom Array containing the source references
 * @param {Array} refTo Array containing the copied source references
 * @param {Boolean} deep Whether or not to perform deep cloning.
 * @return {*} The copied value.
 */


function _clone(value, refFrom, refTo, deep) {
  var copy = function copy(copiedValue) {
    var len = refFrom.length;
    var idx = 0;
    while (idx < len) {
      if (value === refFrom[idx]) {
        return refTo[idx];
      }
      idx += 1;
    }
    refFrom[idx + 1] = value;
    refTo[idx + 1] = copiedValue;
    for (var key in value) {
      copiedValue[key] = deep ? _clone(value[key], refFrom, refTo, true) : value[key];
    }
    return copiedValue;
  };
  switch (type(value)) {
    case 'Object':
      return copy({});
    case 'Array':
      return copy([]);
    case 'Date':
      return new Date(value.valueOf());
    case 'RegExp':
      return _cloneRegExp(value);
    default:
      return value;
  }
}
module.exports = _clone;
  })();
});

require.register("ramda/src/internal/_cloneRegExp.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _cloneRegExp(pattern) {
                                  return new RegExp(pattern.source, (pattern.global ? 'g' : '') + (pattern.ignoreCase ? 'i' : '') + (pattern.multiline ? 'm' : '') + (pattern.sticky ? 'y' : '') + (pattern.unicode ? 'u' : ''));
}
module.exports = _cloneRegExp;
  })();
});

require.register("ramda/src/internal/_complement.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _complement(f) {
  return function () {
    return !f.apply(this, arguments);
  };
}
module.exports = _complement;
  })();
});

require.register("ramda/src/internal/_concat.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    /**
 * Private `concat` function to merge two array-like objects.
 *
 * @private
 * @param {Array|Arguments} [set1=[]] An array-like object.
 * @param {Array|Arguments} [set2=[]] An array-like object.
 * @return {Array} A new, merged array.
 * @example
 *
 *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
 */
function _concat(set1, set2) {
  set1 = set1 || [];
  set2 = set2 || [];
  var idx;
  var len1 = set1.length;
  var len2 = set2.length;
  var result = [];

  idx = 0;
  while (idx < len1) {
    result[result.length] = set1[idx];
    idx += 1;
  }
  idx = 0;
  while (idx < len2) {
    result[result.length] = set2[idx];
    idx += 1;
  }
  return result;
}
module.exports = _concat;
  })();
});

require.register("ramda/src/internal/_createPartialApplicator.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _arity = /*#__PURE__*/require('./_arity');

var _curry2 = /*#__PURE__*/require('./_curry2');

function _createPartialApplicator(concat) {
  return _curry2(function (fn, args) {
    return _arity(Math.max(0, fn.length - args.length), function () {
      return fn.apply(this, concat(args, arguments));
    });
  });
}
module.exports = _createPartialApplicator;
  })();
});

require.register("ramda/src/internal/_curry1.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _isPlaceholder = /*#__PURE__*/require('./_isPlaceholder');

/**
 * Optimized internal one-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */


function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0 || _isPlaceholder(a)) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
}
module.exports = _curry1;
  })();
});

require.register("ramda/src/internal/_curry2.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./_curry1');

var _isPlaceholder = /*#__PURE__*/require('./_isPlaceholder');

/**
 * Optimized internal two-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */


function _curry2(fn) {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;
      case 1:
        return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
          return fn(a, _b);
        });
      default:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b);
        }) : fn(a, b);
    }
  };
}
module.exports = _curry2;
  })();
});

require.register("ramda/src/internal/_curry3.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./_curry1');

var _curry2 = /*#__PURE__*/require('./_curry2');

var _isPlaceholder = /*#__PURE__*/require('./_isPlaceholder');

/**
 * Optimized internal three-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */


function _curry3(fn) {
  return function f3(a, b, c) {
    switch (arguments.length) {
      case 0:
        return f3;
      case 1:
        return _isPlaceholder(a) ? f3 : _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        });
      case 2:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function (_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) ? _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        }) : _curry1(function (_c) {
          return fn(a, b, _c);
        });
      default:
        return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function (_a, _b) {
          return fn(_a, _b, c);
        }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function (_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        }) : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b, c);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b, c);
        }) : _isPlaceholder(c) ? _curry1(function (_c) {
          return fn(a, b, _c);
        }) : fn(a, b, c);
    }
  };
}
module.exports = _curry3;
  })();
});

require.register("ramda/src/internal/_curryN.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _arity = /*#__PURE__*/require('./_arity');

var _isPlaceholder = /*#__PURE__*/require('./_isPlaceholder');

/**
 * Internal curryN function.
 *
 * @private
 * @category Function
 * @param {Number} length The arity of the curried function.
 * @param {Array} received An array of arguments received thus far.
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */


function _curryN(length, received, fn) {
  return function () {
    var combined = [];
    var argsIdx = 0;
    var left = length;
    var combinedIdx = 0;
    while (combinedIdx < received.length || argsIdx < arguments.length) {
      var result;
      if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
        result = received[combinedIdx];
      } else {
        result = arguments[argsIdx];
        argsIdx += 1;
      }
      combined[combinedIdx] = result;
      if (!_isPlaceholder(result)) {
        left -= 1;
      }
      combinedIdx += 1;
    }
    return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
  };
}
module.exports = _curryN;
  })();
});

require.register("ramda/src/internal/_dispatchable.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _isArray = /*#__PURE__*/require('./_isArray');

var _isTransformer = /*#__PURE__*/require('./_isTransformer');

/**
 * Returns a function that dispatches with different strategies based on the
 * object in list position (last argument). If it is an array, executes [fn].
 * Otherwise, if it has a function with one of the given method names, it will
 * execute that function (functor case). Otherwise, if it is a transformer,
 * uses transducer [xf] to return a new transformer (transducer case).
 * Otherwise, it will default to executing [fn].
 *
 * @private
 * @param {Array} methodNames properties to check for a custom implementation
 * @param {Function} xf transducer to initialize if object is transformer
 * @param {Function} fn default ramda implementation
 * @return {Function} A function that dispatches on object in list position
 */


function _dispatchable(methodNames, xf, fn) {
  return function () {
    if (arguments.length === 0) {
      return fn();
    }
    var args = Array.prototype.slice.call(arguments, 0);
    var obj = args.pop();
    if (!_isArray(obj)) {
      var idx = 0;
      while (idx < methodNames.length) {
        if (typeof obj[methodNames[idx]] === 'function') {
          return obj[methodNames[idx]].apply(obj, args);
        }
        idx += 1;
      }
      if (_isTransformer(obj)) {
        var transducer = xf.apply(null, args);
        return transducer(obj);
      }
    }
    return fn.apply(this, arguments);
  };
}
module.exports = _dispatchable;
  })();
});

require.register("ramda/src/internal/_dropLast.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var take = /*#__PURE__*/require('../take');

function dropLast(n, xs) {
  return take(n < xs.length ? xs.length - n : 0, xs);
}
module.exports = dropLast;
  })();
});

require.register("ramda/src/internal/_dropLastWhile.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var slice = /*#__PURE__*/require('../slice');

function dropLastWhile(pred, xs) {
  var idx = xs.length - 1;
  while (idx >= 0 && pred(xs[idx])) {
    idx -= 1;
  }
  return slice(0, idx + 1, xs);
}
module.exports = dropLastWhile;
  })();
});

require.register("ramda/src/internal/_equals.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _arrayFromIterator = /*#__PURE__*/require('./_arrayFromIterator');

var _includesWith = /*#__PURE__*/require('./_includesWith');

var _functionName = /*#__PURE__*/require('./_functionName');

var _has = /*#__PURE__*/require('./_has');

var _objectIs = /*#__PURE__*/require('./_objectIs');

var keys = /*#__PURE__*/require('../keys');

var type = /*#__PURE__*/require('../type');

/**
 * private _uniqContentEquals function.
 * That function is checking equality of 2 iterator contents with 2 assumptions
 * - iterators lengths are the same
 * - iterators values are unique
 *
 * false-positive result will be returned for comparision of, e.g.
 * - [1,2,3] and [1,2,3,4]
 * - [1,1,1] and [1,2,3]
 * */

function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
  var a = _arrayFromIterator(aIterator);
  var b = _arrayFromIterator(bIterator);

  function eq(_a, _b) {
    return _equals(_a, _b, stackA.slice(), stackB.slice());
  }

  // if *a* array contains any element that is not included in *b*
  return !_includesWith(function (b, aItem) {
    return !_includesWith(eq, aItem, b);
  }, b, a);
}

function _equals(a, b, stackA, stackB) {
  if (_objectIs(a, b)) {
    return true;
  }

  var typeA = type(a);

  if (typeA !== type(b)) {
    return false;
  }

  if (a == null || b == null) {
    return false;
  }

  if (typeof a['fantasy-land/equals'] === 'function' || typeof b['fantasy-land/equals'] === 'function') {
    return typeof a['fantasy-land/equals'] === 'function' && a['fantasy-land/equals'](b) && typeof b['fantasy-land/equals'] === 'function' && b['fantasy-land/equals'](a);
  }

  if (typeof a.equals === 'function' || typeof b.equals === 'function') {
    return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a);
  }

  switch (typeA) {
    case 'Arguments':
    case 'Array':
    case 'Object':
      if (typeof a.constructor === 'function' && _functionName(a.constructor) === 'Promise') {
        return a === b;
      }
      break;
    case 'Boolean':
    case 'Number':
    case 'String':
      if (!(typeof a === typeof b && _objectIs(a.valueOf(), b.valueOf()))) {
        return false;
      }
      break;
    case 'Date':
      if (!_objectIs(a.valueOf(), b.valueOf())) {
        return false;
      }
      break;
    case 'Error':
      return a.name === b.name && a.message === b.message;
    case 'RegExp':
      if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
        return false;
      }
      break;
  }

  var idx = stackA.length - 1;
  while (idx >= 0) {
    if (stackA[idx] === a) {
      return stackB[idx] === b;
    }
    idx -= 1;
  }

  switch (typeA) {
    case 'Map':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));
    case 'Set':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));
    case 'Arguments':
    case 'Array':
    case 'Object':
    case 'Boolean':
    case 'Number':
    case 'String':
    case 'Date':
    case 'Error':
    case 'RegExp':
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'ArrayBuffer':
      break;
    default:
      // Values of other types are only equal if identical.
      return false;
  }

  var keysA = keys(a);
  if (keysA.length !== keys(b).length) {
    return false;
  }

  var extendedStackA = stackA.concat([a]);
  var extendedStackB = stackB.concat([b]);

  idx = keysA.length - 1;
  while (idx >= 0) {
    var key = keysA[idx];
    if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
      return false;
    }
    idx -= 1;
  }
  return true;
}
module.exports = _equals;
  })();
});

require.register("ramda/src/internal/_filter.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _filter(fn, list) {
  var idx = 0;
  var len = list.length;
  var result = [];

  while (idx < len) {
    if (fn(list[idx])) {
      result[result.length] = list[idx];
    }
    idx += 1;
  }
  return result;
}
module.exports = _filter;
  })();
});

require.register("ramda/src/internal/_flatCat.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _forceReduced = /*#__PURE__*/require('./_forceReduced');

var _isArrayLike = /*#__PURE__*/require('./_isArrayLike');

var _reduce = /*#__PURE__*/require('./_reduce');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var preservingReduced = function (xf) {
  return {
    '@@transducer/init': _xfBase.init,
    '@@transducer/result': function (result) {
      return xf['@@transducer/result'](result);
    },
    '@@transducer/step': function (result, input) {
      var ret = xf['@@transducer/step'](result, input);
      return ret['@@transducer/reduced'] ? _forceReduced(ret) : ret;
    }
  };
};

var _flatCat = function _xcat(xf) {
  var rxf = preservingReduced(xf);
  return {
    '@@transducer/init': _xfBase.init,
    '@@transducer/result': function (result) {
      return rxf['@@transducer/result'](result);
    },
    '@@transducer/step': function (result, input) {
      return !_isArrayLike(input) ? _reduce(rxf, result, [input]) : _reduce(rxf, result, input);
    }
  };
};

module.exports = _flatCat;
  })();
});

require.register("ramda/src/internal/_forceReduced.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _forceReduced(x) {
  return {
    '@@transducer/value': x,
    '@@transducer/reduced': true
  };
}
module.exports = _forceReduced;
  })();
});

require.register("ramda/src/internal/_functionName.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _functionName(f) {
  // String(x => x) evaluates to "x => x", so the pattern may not match.
  var match = String(f).match(/^function (\w*)/);
  return match == null ? '' : match[1];
}
module.exports = _functionName;
  })();
});

require.register("ramda/src/internal/_has.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
module.exports = _has;
  })();
});

require.register("ramda/src/internal/_identity.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _identity(x) {
  return x;
}
module.exports = _identity;
  })();
});

require.register("ramda/src/internal/_includes.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _indexOf = /*#__PURE__*/require('./_indexOf');

function _includes(a, list) {
  return _indexOf(list, a, 0) >= 0;
}
module.exports = _includes;
  })();
});

require.register("ramda/src/internal/_includesWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _includesWith(pred, x, list) {
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    if (pred(x, list[idx])) {
      return true;
    }
    idx += 1;
  }
  return false;
}
module.exports = _includesWith;
  })();
});

require.register("ramda/src/internal/_indexOf.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var equals = /*#__PURE__*/require('../equals');

function _indexOf(list, a, idx) {
  var inf, item;
  // Array.prototype.indexOf doesn't exist below IE9
  if (typeof list.indexOf === 'function') {
    switch (typeof a) {
      case 'number':
        if (a === 0) {
          // manually crawl the list to distinguish between +0 and -0
          inf = 1 / a;
          while (idx < list.length) {
            item = list[idx];
            if (item === 0 && 1 / item === inf) {
              return idx;
            }
            idx += 1;
          }
          return -1;
        } else if (a !== a) {
          // NaN
          while (idx < list.length) {
            item = list[idx];
            if (typeof item === 'number' && item !== item) {
              return idx;
            }
            idx += 1;
          }
          return -1;
        }
        // non-zero numbers can utilise Set
        return list.indexOf(a, idx);

      // all these types can utilise Set
      case 'string':
      case 'boolean':
      case 'function':
      case 'undefined':
        return list.indexOf(a, idx);

      case 'object':
        if (a === null) {
          // null can utilise Set
          return list.indexOf(a, idx);
        }
    }
  }
  // anything else not covered above, defer to R.equals
  while (idx < list.length) {
    if (equals(list[idx], a)) {
      return idx;
    }
    idx += 1;
  }
  return -1;
}
module.exports = _indexOf;
  })();
});

require.register("ramda/src/internal/_isArguments.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _has = /*#__PURE__*/require('./_has');

var toString = Object.prototype.toString;
var _isArguments = /*#__PURE__*/function () {
  return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
    return toString.call(x) === '[object Arguments]';
  } : function _isArguments(x) {
    return _has('callee', x);
  };
}();

module.exports = _isArguments;
  })();
});

require.register("ramda/src/internal/_isArray.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    /**
 * Tests whether or not an object is an array.
 *
 * @private
 * @param {*} val The object to test.
 * @return {Boolean} `true` if `val` is an array, `false` otherwise.
 * @example
 *
 *      _isArray([]); //=> true
 *      _isArray(null); //=> false
 *      _isArray({}); //=> false
 */
module.exports = Array.isArray || function _isArray(val) {
  return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
};
  })();
});

require.register("ramda/src/internal/_isArrayLike.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./_curry1');

var _isArray = /*#__PURE__*/require('./_isArray');

var _isString = /*#__PURE__*/require('./_isString');

/**
 * Tests whether or not an object is similar to an array.
 *
 * @private
 * @category Type
 * @category List
 * @sig * -> Boolean
 * @param {*} x The object to test.
 * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
 * @example
 *
 *      _isArrayLike([]); //=> true
 *      _isArrayLike(true); //=> false
 *      _isArrayLike({}); //=> false
 *      _isArrayLike({length: 10}); //=> false
 *      _isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
 */


var _isArrayLike = /*#__PURE__*/_curry1(function isArrayLike(x) {
  if (_isArray(x)) {
    return true;
  }
  if (!x) {
    return false;
  }
  if (typeof x !== 'object') {
    return false;
  }
  if (_isString(x)) {
    return false;
  }
  if (x.nodeType === 1) {
    return !!x.length;
  }
  if (x.length === 0) {
    return true;
  }
  if (x.length > 0) {
    return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
  }
  return false;
});
module.exports = _isArrayLike;
  })();
});

require.register("ramda/src/internal/_isFunction.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _isFunction(x) {
  return Object.prototype.toString.call(x) === '[object Function]';
}
module.exports = _isFunction;
  })();
});

require.register("ramda/src/internal/_isInteger.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    /**
 * Determine if the passed argument is an integer.
 *
 * @private
 * @param {*} n
 * @category Type
 * @return {Boolean}
 */
module.exports = Number.isInteger || function _isInteger(n) {
  return n << 0 === n;
};
  })();
});

require.register("ramda/src/internal/_isNumber.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _isNumber(x) {
  return Object.prototype.toString.call(x) === '[object Number]';
}
module.exports = _isNumber;
  })();
});

require.register("ramda/src/internal/_isObject.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _isObject(x) {
  return Object.prototype.toString.call(x) === '[object Object]';
}
module.exports = _isObject;
  })();
});

require.register("ramda/src/internal/_isPlaceholder.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _isPlaceholder(a) {
       return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
}
module.exports = _isPlaceholder;
  })();
});

require.register("ramda/src/internal/_isRegExp.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _isRegExp(x) {
  return Object.prototype.toString.call(x) === '[object RegExp]';
}
module.exports = _isRegExp;
  })();
});

require.register("ramda/src/internal/_isString.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
}
module.exports = _isString;
  })();
});

require.register("ramda/src/internal/_isTransformer.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _isTransformer(obj) {
  return obj != null && typeof obj['@@transducer/step'] === 'function';
}
module.exports = _isTransformer;
  })();
});

require.register("ramda/src/internal/_makeFlat.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _isArrayLike = /*#__PURE__*/require('./_isArrayLike');

/**
 * `_makeFlat` is a helper function that returns a one-level or fully recursive
 * function based on the flag passed in.
 *
 * @private
 */


function _makeFlat(recursive) {
  return function flatt(list) {
    var value, jlen, j;
    var result = [];
    var idx = 0;
    var ilen = list.length;

    while (idx < ilen) {
      if (_isArrayLike(list[idx])) {
        value = recursive ? flatt(list[idx]) : list[idx];
        j = 0;
        jlen = value.length;
        while (j < jlen) {
          result[result.length] = value[j];
          j += 1;
        }
      } else {
        result[result.length] = list[idx];
      }
      idx += 1;
    }
    return result;
  };
}
module.exports = _makeFlat;
  })();
});

require.register("ramda/src/internal/_map.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _map(fn, functor) {
  var idx = 0;
  var len = functor.length;
  var result = Array(len);
  while (idx < len) {
    result[idx] = fn(functor[idx]);
    idx += 1;
  }
  return result;
}
module.exports = _map;
  })();
});

require.register("ramda/src/internal/_objectAssign.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _has = /*#__PURE__*/require('./_has');

// Based on https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign


function _objectAssign(target) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var output = Object(target);
  var idx = 1;
  var length = arguments.length;
  while (idx < length) {
    var source = arguments[idx];
    if (source != null) {
      for (var nextKey in source) {
        if (_has(nextKey, source)) {
          output[nextKey] = source[nextKey];
        }
      }
    }
    idx += 1;
  }
  return output;
}

module.exports = typeof Object.assign === 'function' ? Object.assign : _objectAssign;
  })();
});

require.register("ramda/src/internal/_objectIs.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    // Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
function _objectIs(a, b) {
  // SameValue algorithm
  if (a === b) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return a !== 0 || 1 / a === 1 / b;
  } else {
    // Step 6.a: NaN == NaN
    return a !== a && b !== b;
  }
}

module.exports = typeof Object.is === 'function' ? Object.is : _objectIs;
  })();
});

require.register("ramda/src/internal/_of.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _of(x) {
  return [x];
}
module.exports = _of;
  })();
});

require.register("ramda/src/internal/_pipe.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _pipe(f, g) {
  return function () {
    return g.call(this, f.apply(this, arguments));
  };
}
module.exports = _pipe;
  })();
});

require.register("ramda/src/internal/_pipeP.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _pipeP(f, g) {
  return function () {
    var ctx = this;
    return f.apply(ctx, arguments).then(function (x) {
      return g.call(ctx, x);
    });
  };
}
module.exports = _pipeP;
  })();
});

require.register("ramda/src/internal/_quote.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _quote(s) {
  var escaped = s.replace(/\\/g, '\\\\').replace(/[\b]/g, '\\b') // \b matches word boundary; [\b] matches backspace
  .replace(/\f/g, '\\f').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\v/g, '\\v').replace(/\0/g, '\\0');

  return '"' + escaped.replace(/"/g, '\\"') + '"';
}
module.exports = _quote;
  })();
});

require.register("ramda/src/internal/_reduce.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _isArrayLike = /*#__PURE__*/require('./_isArrayLike');

var _xwrap = /*#__PURE__*/require('./_xwrap');

var bind = /*#__PURE__*/require('../bind');

function _arrayReduce(xf, acc, list) {
  var idx = 0;
  var len = list.length;
  while (idx < len) {
    acc = xf['@@transducer/step'](acc, list[idx]);
    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }
    idx += 1;
  }
  return xf['@@transducer/result'](acc);
}

function _iterableReduce(xf, acc, iter) {
  var step = iter.next();
  while (!step.done) {
    acc = xf['@@transducer/step'](acc, step.value);
    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }
    step = iter.next();
  }
  return xf['@@transducer/result'](acc);
}

function _methodReduce(xf, acc, obj, methodName) {
  return xf['@@transducer/result'](obj[methodName](bind(xf['@@transducer/step'], xf), acc));
}

var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';

function _reduce(fn, acc, list) {
  if (typeof fn === 'function') {
    fn = _xwrap(fn);
  }
  if (_isArrayLike(list)) {
    return _arrayReduce(fn, acc, list);
  }
  if (typeof list['fantasy-land/reduce'] === 'function') {
    return _methodReduce(fn, acc, list, 'fantasy-land/reduce');
  }
  if (list[symIterator] != null) {
    return _iterableReduce(fn, acc, list[symIterator]());
  }
  if (typeof list.next === 'function') {
    return _iterableReduce(fn, acc, list);
  }
  if (typeof list.reduce === 'function') {
    return _methodReduce(fn, acc, list, 'reduce');
  }

  throw new TypeError('reduce: list must be array or iterable');
}
module.exports = _reduce;
  })();
});

require.register("ramda/src/internal/_reduced.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    function _reduced(x) {
  return x && x['@@transducer/reduced'] ? x : {
    '@@transducer/value': x,
    '@@transducer/reduced': true
  };
}
module.exports = _reduced;
  })();
});

require.register("ramda/src/internal/_stepCat.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _objectAssign = /*#__PURE__*/require('./_objectAssign');

var _identity = /*#__PURE__*/require('./_identity');

var _isArrayLike = /*#__PURE__*/require('./_isArrayLike');

var _isTransformer = /*#__PURE__*/require('./_isTransformer');

var objOf = /*#__PURE__*/require('../objOf');

var _stepCatArray = {
  '@@transducer/init': Array,
  '@@transducer/step': function (xs, x) {
    xs.push(x);
    return xs;
  },
  '@@transducer/result': _identity
};
var _stepCatString = {
  '@@transducer/init': String,
  '@@transducer/step': function (a, b) {
    return a + b;
  },
  '@@transducer/result': _identity
};
var _stepCatObject = {
  '@@transducer/init': Object,
  '@@transducer/step': function (result, input) {
    return _objectAssign(result, _isArrayLike(input) ? objOf(input[0], input[1]) : input);
  },
  '@@transducer/result': _identity
};

function _stepCat(obj) {
  if (_isTransformer(obj)) {
    return obj;
  }
  if (_isArrayLike(obj)) {
    return _stepCatArray;
  }
  if (typeof obj === 'string') {
    return _stepCatString;
  }
  if (typeof obj === 'object') {
    return _stepCatObject;
  }
  throw new Error('Cannot create transformer for ' + obj);
}
module.exports = _stepCat;
  })();
});

require.register("ramda/src/internal/_toISOString.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    /**
 * Polyfill from <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString>.
 */
var pad = function pad(n) {
  return (n < 10 ? '0' : '') + n;
};

var _toISOString = typeof Date.prototype.toISOString === 'function' ? function _toISOString(d) {
  return d.toISOString();
} : function _toISOString(d) {
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + '.' + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';
};

module.exports = _toISOString;
  })();
});

require.register("ramda/src/internal/_toString.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _includes = /*#__PURE__*/require('./_includes');

var _map = /*#__PURE__*/require('./_map');

var _quote = /*#__PURE__*/require('./_quote');

var _toISOString = /*#__PURE__*/require('./_toISOString');

var keys = /*#__PURE__*/require('../keys');

var reject = /*#__PURE__*/require('../reject');

function _toString(x, seen) {
  var recur = function recur(y) {
    var xs = seen.concat([x]);
    return _includes(y, xs) ? '<Circular>' : _toString(y, xs);
  };

  //  mapPairs :: (Object, [String]) -> [String]
  var mapPairs = function (obj, keys) {
    return _map(function (k) {
      return _quote(k) + ': ' + recur(obj[k]);
    }, keys.slice().sort());
  };

  switch (Object.prototype.toString.call(x)) {
    case '[object Arguments]':
      return '(function() { return arguments; }(' + _map(recur, x).join(', ') + '))';
    case '[object Array]':
      return '[' + _map(recur, x).concat(mapPairs(x, reject(function (k) {
        return (/^\d+$/.test(k)
        );
      }, keys(x)))).join(', ') + ']';
    case '[object Boolean]':
      return typeof x === 'object' ? 'new Boolean(' + recur(x.valueOf()) + ')' : x.toString();
    case '[object Date]':
      return 'new Date(' + (isNaN(x.valueOf()) ? recur(NaN) : _quote(_toISOString(x))) + ')';
    case '[object Null]':
      return 'null';
    case '[object Number]':
      return typeof x === 'object' ? 'new Number(' + recur(x.valueOf()) + ')' : 1 / x === -Infinity ? '-0' : x.toString(10);
    case '[object String]':
      return typeof x === 'object' ? 'new String(' + recur(x.valueOf()) + ')' : _quote(x);
    case '[object Undefined]':
      return 'undefined';
    default:
      if (typeof x.toString === 'function') {
        var repr = x.toString();
        if (repr !== '[object Object]') {
          return repr;
        }
      }
      return '{' + mapPairs(x, keys(x)).join(', ') + '}';
  }
}
module.exports = _toString;
  })();
});

require.register("ramda/src/internal/_xall.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _reduced = /*#__PURE__*/require('./_reduced');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XAll = /*#__PURE__*/function () {

  function XAll(f, xf) {
    this.xf = xf;
    this.f = f;
    this.all = true;
  }
  XAll.prototype['@@transducer/init'] = _xfBase.init;
  XAll.prototype['@@transducer/result'] = function (result) {
    if (this.all) {
      result = this.xf['@@transducer/step'](result, true);
    }
    return this.xf['@@transducer/result'](result);
  };
  XAll.prototype['@@transducer/step'] = function (result, input) {
    if (!this.f(input)) {
      this.all = false;
      result = _reduced(this.xf['@@transducer/step'](result, false));
    }
    return result;
  };

  return XAll;
}();

var _xall = /*#__PURE__*/_curry2(function _xall(f, xf) {
  return new XAll(f, xf);
});
module.exports = _xall;
  })();
});

require.register("ramda/src/internal/_xany.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _reduced = /*#__PURE__*/require('./_reduced');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XAny = /*#__PURE__*/function () {

  function XAny(f, xf) {
    this.xf = xf;
    this.f = f;
    this.any = false;
  }
  XAny.prototype['@@transducer/init'] = _xfBase.init;
  XAny.prototype['@@transducer/result'] = function (result) {
    if (!this.any) {
      result = this.xf['@@transducer/step'](result, false);
    }
    return this.xf['@@transducer/result'](result);
  };
  XAny.prototype['@@transducer/step'] = function (result, input) {
    if (this.f(input)) {
      this.any = true;
      result = _reduced(this.xf['@@transducer/step'](result, true));
    }
    return result;
  };

  return XAny;
}();

var _xany = /*#__PURE__*/_curry2(function _xany(f, xf) {
  return new XAny(f, xf);
});
module.exports = _xany;
  })();
});

require.register("ramda/src/internal/_xaperture.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _concat = /*#__PURE__*/require('./_concat');

var _curry2 = /*#__PURE__*/require('./_curry2');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XAperture = /*#__PURE__*/function () {

  function XAperture(n, xf) {
    this.xf = xf;
    this.pos = 0;
    this.full = false;
    this.acc = new Array(n);
  }
  XAperture.prototype['@@transducer/init'] = _xfBase.init;
  XAperture.prototype['@@transducer/result'] = function (result) {
    this.acc = null;
    return this.xf['@@transducer/result'](result);
  };
  XAperture.prototype['@@transducer/step'] = function (result, input) {
    this.store(input);
    return this.full ? this.xf['@@transducer/step'](result, this.getCopy()) : result;
  };
  XAperture.prototype.store = function (input) {
    this.acc[this.pos] = input;
    this.pos += 1;
    if (this.pos === this.acc.length) {
      this.pos = 0;
      this.full = true;
    }
  };
  XAperture.prototype.getCopy = function () {
    return _concat(Array.prototype.slice.call(this.acc, this.pos), Array.prototype.slice.call(this.acc, 0, this.pos));
  };

  return XAperture;
}();

var _xaperture = /*#__PURE__*/_curry2(function _xaperture(n, xf) {
  return new XAperture(n, xf);
});
module.exports = _xaperture;
  })();
});

require.register("ramda/src/internal/_xchain.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _flatCat = /*#__PURE__*/require('./_flatCat');

var map = /*#__PURE__*/require('../map');

var _xchain = /*#__PURE__*/_curry2(function _xchain(f, xf) {
  return map(f, _flatCat(xf));
});
module.exports = _xchain;
  })();
});

require.register("ramda/src/internal/_xdrop.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XDrop = /*#__PURE__*/function () {

  function XDrop(n, xf) {
    this.xf = xf;
    this.n = n;
  }
  XDrop.prototype['@@transducer/init'] = _xfBase.init;
  XDrop.prototype['@@transducer/result'] = _xfBase.result;
  XDrop.prototype['@@transducer/step'] = function (result, input) {
    if (this.n > 0) {
      this.n -= 1;
      return result;
    }
    return this.xf['@@transducer/step'](result, input);
  };

  return XDrop;
}();

var _xdrop = /*#__PURE__*/_curry2(function _xdrop(n, xf) {
  return new XDrop(n, xf);
});
module.exports = _xdrop;
  })();
});

require.register("ramda/src/internal/_xdropLast.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XDropLast = /*#__PURE__*/function () {

  function XDropLast(n, xf) {
    this.xf = xf;
    this.pos = 0;
    this.full = false;
    this.acc = new Array(n);
  }
  XDropLast.prototype['@@transducer/init'] = _xfBase.init;
  XDropLast.prototype['@@transducer/result'] = function (result) {
    this.acc = null;
    return this.xf['@@transducer/result'](result);
  };
  XDropLast.prototype['@@transducer/step'] = function (result, input) {
    if (this.full) {
      result = this.xf['@@transducer/step'](result, this.acc[this.pos]);
    }
    this.store(input);
    return result;
  };
  XDropLast.prototype.store = function (input) {
    this.acc[this.pos] = input;
    this.pos += 1;
    if (this.pos === this.acc.length) {
      this.pos = 0;
      this.full = true;
    }
  };

  return XDropLast;
}();

var _xdropLast = /*#__PURE__*/_curry2(function _xdropLast(n, xf) {
  return new XDropLast(n, xf);
});
module.exports = _xdropLast;
  })();
});

require.register("ramda/src/internal/_xdropLastWhile.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _reduce = /*#__PURE__*/require('./_reduce');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XDropLastWhile = /*#__PURE__*/function () {

  function XDropLastWhile(fn, xf) {
    this.f = fn;
    this.retained = [];
    this.xf = xf;
  }
  XDropLastWhile.prototype['@@transducer/init'] = _xfBase.init;
  XDropLastWhile.prototype['@@transducer/result'] = function (result) {
    this.retained = null;
    return this.xf['@@transducer/result'](result);
  };
  XDropLastWhile.prototype['@@transducer/step'] = function (result, input) {
    return this.f(input) ? this.retain(result, input) : this.flush(result, input);
  };
  XDropLastWhile.prototype.flush = function (result, input) {
    result = _reduce(this.xf['@@transducer/step'], result, this.retained);
    this.retained = [];
    return this.xf['@@transducer/step'](result, input);
  };
  XDropLastWhile.prototype.retain = function (result, input) {
    this.retained.push(input);
    return result;
  };

  return XDropLastWhile;
}();

var _xdropLastWhile = /*#__PURE__*/_curry2(function _xdropLastWhile(fn, xf) {
  return new XDropLastWhile(fn, xf);
});
module.exports = _xdropLastWhile;
  })();
});

require.register("ramda/src/internal/_xdropRepeatsWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XDropRepeatsWith = /*#__PURE__*/function () {

  function XDropRepeatsWith(pred, xf) {
    this.xf = xf;
    this.pred = pred;
    this.lastValue = undefined;
    this.seenFirstValue = false;
  }

  XDropRepeatsWith.prototype['@@transducer/init'] = _xfBase.init;
  XDropRepeatsWith.prototype['@@transducer/result'] = _xfBase.result;
  XDropRepeatsWith.prototype['@@transducer/step'] = function (result, input) {
    var sameAsLast = false;
    if (!this.seenFirstValue) {
      this.seenFirstValue = true;
    } else if (this.pred(this.lastValue, input)) {
      sameAsLast = true;
    }
    this.lastValue = input;
    return sameAsLast ? result : this.xf['@@transducer/step'](result, input);
  };

  return XDropRepeatsWith;
}();

var _xdropRepeatsWith = /*#__PURE__*/_curry2(function _xdropRepeatsWith(pred, xf) {
  return new XDropRepeatsWith(pred, xf);
});
module.exports = _xdropRepeatsWith;
  })();
});

require.register("ramda/src/internal/_xdropWhile.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XDropWhile = /*#__PURE__*/function () {

  function XDropWhile(f, xf) {
    this.xf = xf;
    this.f = f;
  }
  XDropWhile.prototype['@@transducer/init'] = _xfBase.init;
  XDropWhile.prototype['@@transducer/result'] = _xfBase.result;
  XDropWhile.prototype['@@transducer/step'] = function (result, input) {
    if (this.f) {
      if (this.f(input)) {
        return result;
      }
      this.f = null;
    }
    return this.xf['@@transducer/step'](result, input);
  };

  return XDropWhile;
}();

var _xdropWhile = /*#__PURE__*/_curry2(function _xdropWhile(f, xf) {
  return new XDropWhile(f, xf);
});
module.exports = _xdropWhile;
  })();
});

require.register("ramda/src/internal/_xfBase.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    module.exports = {
  init: function () {
    return this.xf['@@transducer/init']();
  },
  result: function (result) {
    return this.xf['@@transducer/result'](result);
  }
};
  })();
});

require.register("ramda/src/internal/_xfilter.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XFilter = /*#__PURE__*/function () {

  function XFilter(f, xf) {
    this.xf = xf;
    this.f = f;
  }
  XFilter.prototype['@@transducer/init'] = _xfBase.init;
  XFilter.prototype['@@transducer/result'] = _xfBase.result;
  XFilter.prototype['@@transducer/step'] = function (result, input) {
    return this.f(input) ? this.xf['@@transducer/step'](result, input) : result;
  };

  return XFilter;
}();

var _xfilter = /*#__PURE__*/_curry2(function _xfilter(f, xf) {
  return new XFilter(f, xf);
});
module.exports = _xfilter;
  })();
});

require.register("ramda/src/internal/_xfind.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _reduced = /*#__PURE__*/require('./_reduced');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XFind = /*#__PURE__*/function () {

  function XFind(f, xf) {
    this.xf = xf;
    this.f = f;
    this.found = false;
  }
  XFind.prototype['@@transducer/init'] = _xfBase.init;
  XFind.prototype['@@transducer/result'] = function (result) {
    if (!this.found) {
      result = this.xf['@@transducer/step'](result, void 0);
    }
    return this.xf['@@transducer/result'](result);
  };
  XFind.prototype['@@transducer/step'] = function (result, input) {
    if (this.f(input)) {
      this.found = true;
      result = _reduced(this.xf['@@transducer/step'](result, input));
    }
    return result;
  };

  return XFind;
}();

var _xfind = /*#__PURE__*/_curry2(function _xfind(f, xf) {
  return new XFind(f, xf);
});
module.exports = _xfind;
  })();
});

require.register("ramda/src/internal/_xfindIndex.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _reduced = /*#__PURE__*/require('./_reduced');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XFindIndex = /*#__PURE__*/function () {

  function XFindIndex(f, xf) {
    this.xf = xf;
    this.f = f;
    this.idx = -1;
    this.found = false;
  }
  XFindIndex.prototype['@@transducer/init'] = _xfBase.init;
  XFindIndex.prototype['@@transducer/result'] = function (result) {
    if (!this.found) {
      result = this.xf['@@transducer/step'](result, -1);
    }
    return this.xf['@@transducer/result'](result);
  };
  XFindIndex.prototype['@@transducer/step'] = function (result, input) {
    this.idx += 1;
    if (this.f(input)) {
      this.found = true;
      result = _reduced(this.xf['@@transducer/step'](result, this.idx));
    }
    return result;
  };

  return XFindIndex;
}();

var _xfindIndex = /*#__PURE__*/_curry2(function _xfindIndex(f, xf) {
  return new XFindIndex(f, xf);
});
module.exports = _xfindIndex;
  })();
});

require.register("ramda/src/internal/_xfindLast.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XFindLast = /*#__PURE__*/function () {

  function XFindLast(f, xf) {
    this.xf = xf;
    this.f = f;
  }
  XFindLast.prototype['@@transducer/init'] = _xfBase.init;
  XFindLast.prototype['@@transducer/result'] = function (result) {
    return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result, this.last));
  };
  XFindLast.prototype['@@transducer/step'] = function (result, input) {
    if (this.f(input)) {
      this.last = input;
    }
    return result;
  };

  return XFindLast;
}();

var _xfindLast = /*#__PURE__*/_curry2(function _xfindLast(f, xf) {
  return new XFindLast(f, xf);
});
module.exports = _xfindLast;
  })();
});

require.register("ramda/src/internal/_xfindLastIndex.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XFindLastIndex = /*#__PURE__*/function () {

  function XFindLastIndex(f, xf) {
    this.xf = xf;
    this.f = f;
    this.idx = -1;
    this.lastIdx = -1;
  }
  XFindLastIndex.prototype['@@transducer/init'] = _xfBase.init;
  XFindLastIndex.prototype['@@transducer/result'] = function (result) {
    return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result, this.lastIdx));
  };
  XFindLastIndex.prototype['@@transducer/step'] = function (result, input) {
    this.idx += 1;
    if (this.f(input)) {
      this.lastIdx = this.idx;
    }
    return result;
  };

  return XFindLastIndex;
}();

var _xfindLastIndex = /*#__PURE__*/_curry2(function _xfindLastIndex(f, xf) {
  return new XFindLastIndex(f, xf);
});
module.exports = _xfindLastIndex;
  })();
});

require.register("ramda/src/internal/_xmap.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XMap = /*#__PURE__*/function () {

  function XMap(f, xf) {
    this.xf = xf;
    this.f = f;
  }
  XMap.prototype['@@transducer/init'] = _xfBase.init;
  XMap.prototype['@@transducer/result'] = _xfBase.result;
  XMap.prototype['@@transducer/step'] = function (result, input) {
    return this.xf['@@transducer/step'](result, this.f(input));
  };

  return XMap;
}();

var _xmap = /*#__PURE__*/_curry2(function _xmap(f, xf) {
  return new XMap(f, xf);
});
module.exports = _xmap;
  })();
});

require.register("ramda/src/internal/_xreduceBy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curryN = /*#__PURE__*/require('./_curryN');

var _has = /*#__PURE__*/require('./_has');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XReduceBy = /*#__PURE__*/function () {

  function XReduceBy(valueFn, valueAcc, keyFn, xf) {
    this.valueFn = valueFn;
    this.valueAcc = valueAcc;
    this.keyFn = keyFn;
    this.xf = xf;
    this.inputs = {};
  }
  XReduceBy.prototype['@@transducer/init'] = _xfBase.init;
  XReduceBy.prototype['@@transducer/result'] = function (result) {
    var key;
    for (key in this.inputs) {
      if (_has(key, this.inputs)) {
        result = this.xf['@@transducer/step'](result, this.inputs[key]);
        if (result['@@transducer/reduced']) {
          result = result['@@transducer/value'];
          break;
        }
      }
    }
    this.inputs = null;
    return this.xf['@@transducer/result'](result);
  };
  XReduceBy.prototype['@@transducer/step'] = function (result, input) {
    var key = this.keyFn(input);
    this.inputs[key] = this.inputs[key] || [key, this.valueAcc];
    this.inputs[key][1] = this.valueFn(this.inputs[key][1], input);
    return result;
  };

  return XReduceBy;
}();

var _xreduceBy = /*#__PURE__*/_curryN(4, [], function _xreduceBy(valueFn, valueAcc, keyFn, xf) {
  return new XReduceBy(valueFn, valueAcc, keyFn, xf);
});
module.exports = _xreduceBy;
  })();
});

require.register("ramda/src/internal/_xtake.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _reduced = /*#__PURE__*/require('./_reduced');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XTake = /*#__PURE__*/function () {

  function XTake(n, xf) {
    this.xf = xf;
    this.n = n;
    this.i = 0;
  }
  XTake.prototype['@@transducer/init'] = _xfBase.init;
  XTake.prototype['@@transducer/result'] = _xfBase.result;
  XTake.prototype['@@transducer/step'] = function (result, input) {
    this.i += 1;
    var ret = this.n === 0 ? result : this.xf['@@transducer/step'](result, input);
    return this.n >= 0 && this.i >= this.n ? _reduced(ret) : ret;
  };

  return XTake;
}();

var _xtake = /*#__PURE__*/_curry2(function _xtake(n, xf) {
  return new XTake(n, xf);
});
module.exports = _xtake;
  })();
});

require.register("ramda/src/internal/_xtakeWhile.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _reduced = /*#__PURE__*/require('./_reduced');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XTakeWhile = /*#__PURE__*/function () {

  function XTakeWhile(f, xf) {
    this.xf = xf;
    this.f = f;
  }
  XTakeWhile.prototype['@@transducer/init'] = _xfBase.init;
  XTakeWhile.prototype['@@transducer/result'] = _xfBase.result;
  XTakeWhile.prototype['@@transducer/step'] = function (result, input) {
    return this.f(input) ? this.xf['@@transducer/step'](result, input) : _reduced(result);
  };

  return XTakeWhile;
}();

var _xtakeWhile = /*#__PURE__*/_curry2(function _xtakeWhile(f, xf) {
  return new XTakeWhile(f, xf);
});
module.exports = _xtakeWhile;
  })();
});

require.register("ramda/src/internal/_xtap.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./_curry2');

var _xfBase = /*#__PURE__*/require('./_xfBase');

var XTap = /*#__PURE__*/function () {

  function XTap(f, xf) {
    this.xf = xf;
    this.f = f;
  }
  XTap.prototype['@@transducer/init'] = _xfBase.init;
  XTap.prototype['@@transducer/result'] = _xfBase.result;
  XTap.prototype['@@transducer/step'] = function (result, input) {
    this.f(input);
    return this.xf['@@transducer/step'](result, input);
  };

  return XTap;
}();

var _xtap = /*#__PURE__*/_curry2(function _xtap(f, xf) {
  return new XTap(f, xf);
});
module.exports = _xtap;
  })();
});

require.register("ramda/src/internal/_xwrap.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var XWrap = /*#__PURE__*/function () {
  function XWrap(fn) {
    this.f = fn;
  }
  XWrap.prototype['@@transducer/init'] = function () {
    throw new Error('init not implemented on XWrap');
  };
  XWrap.prototype['@@transducer/result'] = function (acc) {
    return acc;
  };
  XWrap.prototype['@@transducer/step'] = function (acc, x) {
    return this.f(acc, x);
  };

  return XWrap;
}();

function _xwrap(fn) {
  return new XWrap(fn);
}
module.exports = _xwrap;
  })();
});

require.register("ramda/src/intersection.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _includes = /*#__PURE__*/require('./internal/_includes');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _filter = /*#__PURE__*/require('./internal/_filter');

var flip = /*#__PURE__*/require('./flip');

var uniq = /*#__PURE__*/require('./uniq');

/**
 * Combines two lists into a set (i.e. no duplicates) composed of those
 * elements common to both lists.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig [*] -> [*] -> [*]
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The list of elements found in both `list1` and `list2`.
 * @see R.innerJoin
 * @example
 *
 *      R.intersection([1,2,3,4], [7,6,5,4,3]); //=> [4, 3]
 */


var intersection = /*#__PURE__*/_curry2(function intersection(list1, list2) {
  var lookupList, filteredList;
  if (list1.length > list2.length) {
    lookupList = list1;
    filteredList = list2;
  } else {
    lookupList = list2;
    filteredList = list1;
  }
  return uniq(_filter(flip(_includes)(lookupList), filteredList));
});
module.exports = intersection;
  })();
});

require.register("ramda/src/intersperse.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _checkForMethod = /*#__PURE__*/require('./internal/_checkForMethod');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Creates a new list with the separator interposed between elements.
 *
 * Dispatches to the `intersperse` method of the second argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category List
 * @sig a -> [a] -> [a]
 * @param {*} separator The element to add to the list.
 * @param {Array} list The list to be interposed.
 * @return {Array} The new list.
 * @example
 *
 *      R.intersperse('a', ['b', 'n', 'n', 's']); //=> ['b', 'a', 'n', 'a', 'n', 'a', 's']
 */


var intersperse = /*#__PURE__*/_curry2( /*#__PURE__*/_checkForMethod('intersperse', function intersperse(separator, list) {
  var out = [];
  var idx = 0;
  var length = list.length;
  while (idx < length) {
    if (idx === length - 1) {
      out.push(list[idx]);
    } else {
      out.push(list[idx], separator);
    }
    idx += 1;
  }
  return out;
}));
module.exports = intersperse;
  })();
});

require.register("ramda/src/into.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _clone = /*#__PURE__*/require('./internal/_clone');

var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var _isTransformer = /*#__PURE__*/require('./internal/_isTransformer');

var _reduce = /*#__PURE__*/require('./internal/_reduce');

var _stepCat = /*#__PURE__*/require('./internal/_stepCat');

/**
 * Transforms the items of the list with the transducer and appends the
 * transformed items to the accumulator using an appropriate iterator function
 * based on the accumulator type.
 *
 * The accumulator can be an array, string, object or a transformer. Iterated
 * items will be appended to arrays and concatenated to strings. Objects will
 * be merged directly or 2-item arrays will be merged as key, value pairs.
 *
 * The accumulator can also be a transformer object that provides a 2-arity
 * reducing iterator function, step, 0-arity initial value function, init, and
 * 1-arity result extraction function result. The step function is used as the
 * iterator function in reduce. The result function is used to convert the
 * final accumulator into the return type and in most cases is R.identity. The
 * init function is used to provide the initial accumulator.
 *
 * The iteration is performed with [`R.reduce`](#reduce) after initializing the
 * transducer.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category List
 * @sig a -> (b -> b) -> [c] -> a
 * @param {*} acc The initial accumulator value.
 * @param {Function} xf The transducer function. Receives a transformer and returns a transformer.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.transduce
 * @example
 *
 *      const numbers = [1, 2, 3, 4];
 *      const transducer = R.compose(R.map(R.add(1)), R.take(2));
 *
 *      R.into([], transducer, numbers); //=> [2, 3]
 *
 *      const intoArray = R.into([]);
 *      intoArray(transducer, numbers); //=> [2, 3]
 */


var into = /*#__PURE__*/_curry3(function into(acc, xf, list) {
  return _isTransformer(acc) ? _reduce(xf(acc), acc['@@transducer/init'](), list) : _reduce(xf(_stepCat(acc)), _clone(acc, [], [], false), list);
});
module.exports = into;
  })();
});

require.register("ramda/src/invert.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var _has = /*#__PURE__*/require('./internal/_has');

var keys = /*#__PURE__*/require('./keys');

/**
 * Same as [`R.invertObj`](#invertObj), however this accounts for objects with
 * duplicate values by putting the values into an array.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Object
 * @sig {s: x} -> {x: [ s, ... ]}
 * @param {Object} obj The object or array to invert
 * @return {Object} out A new object with keys in an array.
 * @see R.invertObj
 * @example
 *
 *      const raceResultsByFirstName = {
 *        first: 'alice',
 *        second: 'jake',
 *        third: 'alice',
 *      };
 *      R.invert(raceResultsByFirstName);
 *      //=> { 'alice': ['first', 'third'], 'jake':['second'] }
 */


var invert = /*#__PURE__*/_curry1(function invert(obj) {
  var props = keys(obj);
  var len = props.length;
  var idx = 0;
  var out = {};

  while (idx < len) {
    var key = props[idx];
    var val = obj[key];
    var list = _has(val, out) ? out[val] : out[val] = [];
    list[list.length] = key;
    idx += 1;
  }
  return out;
});
module.exports = invert;
  })();
});

require.register("ramda/src/invertObj.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var keys = /*#__PURE__*/require('./keys');

/**
 * Returns a new object with the keys of the given object as values, and the
 * values of the given object, which are coerced to strings, as keys. Note
 * that the last key found is preferred when handling the same value.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Object
 * @sig {s: x} -> {x: s}
 * @param {Object} obj The object or array to invert
 * @return {Object} out A new object
 * @see R.invert
 * @example
 *
 *      const raceResults = {
 *        first: 'alice',
 *        second: 'jake'
 *      };
 *      R.invertObj(raceResults);
 *      //=> { 'alice': 'first', 'jake':'second' }
 *
 *      // Alternatively:
 *      const raceResults = ['alice', 'jake'];
 *      R.invertObj(raceResults);
 *      //=> { 'alice': '0', 'jake':'1' }
 */


var invertObj = /*#__PURE__*/_curry1(function invertObj(obj) {
  var props = keys(obj);
  var len = props.length;
  var idx = 0;
  var out = {};

  while (idx < len) {
    var key = props[idx];
    out[obj[key]] = key;
    idx += 1;
  }
  return out;
});
module.exports = invertObj;
  })();
});

require.register("ramda/src/invoker.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _isFunction = /*#__PURE__*/require('./internal/_isFunction');

var curryN = /*#__PURE__*/require('./curryN');

var toString = /*#__PURE__*/require('./toString');

/**
 * Turns a named method with a specified arity into a function that can be
 * called directly supplied with arguments and a target object.
 *
 * The returned function is curried and accepts `arity + 1` parameters where
 * the final parameter is the target object.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig Number -> String -> (a -> b -> ... -> n -> Object -> *)
 * @param {Number} arity Number of arguments the returned function should take
 *        before the target object.
 * @param {String} method Name of the method to call.
 * @return {Function} A new curried function.
 * @see R.construct
 * @example
 *
 *      const sliceFrom = R.invoker(1, 'slice');
 *      sliceFrom(6, 'abcdefghijklm'); //=> 'ghijklm'
 *      const sliceFrom6 = R.invoker(2, 'slice')(6);
 *      sliceFrom6(8, 'abcdefghijklm'); //=> 'gh'
 * @symb R.invoker(0, 'method')(o) = o['method']()
 * @symb R.invoker(1, 'method')(a, o) = o['method'](a)
 * @symb R.invoker(2, 'method')(a, b, o) = o['method'](a, b)
 */


var invoker = /*#__PURE__*/_curry2(function invoker(arity, method) {
  return curryN(arity + 1, function () {
    var target = arguments[arity];
    if (target != null && _isFunction(target[method])) {
      return target[method].apply(target, Array.prototype.slice.call(arguments, 0, arity));
    }
    throw new TypeError(toString(target) + ' does not have a method named "' + method + '"');
  });
});
module.exports = invoker;
  })();
});

require.register("ramda/src/is.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * See if an object (`val`) is an instance of the supplied constructor. This
 * function will check up the inheritance chain, if any.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Type
 * @sig (* -> {*}) -> a -> Boolean
 * @param {Object} ctor A constructor
 * @param {*} val The value to test
 * @return {Boolean}
 * @example
 *
 *      R.is(Object, {}); //=> true
 *      R.is(Number, 1); //=> true
 *      R.is(Object, 1); //=> false
 *      R.is(String, 's'); //=> true
 *      R.is(String, new String('')); //=> true
 *      R.is(Object, new String('')); //=> true
 *      R.is(Object, 's'); //=> false
 *      R.is(Number, {}); //=> false
 */


var is = /*#__PURE__*/_curry2(function is(Ctor, val) {
  return val != null && val.constructor === Ctor || val instanceof Ctor;
});
module.exports = is;
  })();
});

require.register("ramda/src/isEmpty.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var empty = /*#__PURE__*/require('./empty');

var equals = /*#__PURE__*/require('./equals');

/**
 * Returns `true` if the given value is its type's empty value; `false`
 * otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig a -> Boolean
 * @param {*} x
 * @return {Boolean}
 * @see R.empty
 * @example
 *
 *      R.isEmpty([1, 2, 3]);   //=> false
 *      R.isEmpty([]);          //=> true
 *      R.isEmpty('');          //=> true
 *      R.isEmpty(null);        //=> false
 *      R.isEmpty({});          //=> true
 *      R.isEmpty({length: 0}); //=> false
 */


var isEmpty = /*#__PURE__*/_curry1(function isEmpty(x) {
  return x != null && equals(x, empty(x));
});
module.exports = isEmpty;
  })();
});

require.register("ramda/src/isNil.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Checks if the input value is `null` or `undefined`.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Type
 * @sig * -> Boolean
 * @param {*} x The value to test.
 * @return {Boolean} `true` if `x` is `undefined` or `null`, otherwise `false`.
 * @example
 *
 *      R.isNil(null); //=> true
 *      R.isNil(undefined); //=> true
 *      R.isNil(0); //=> false
 *      R.isNil([]); //=> false
 */


var isNil = /*#__PURE__*/_curry1(function isNil(x) {
  return x == null;
});
module.exports = isNil;
  })();
});

require.register("ramda/src/join.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var invoker = /*#__PURE__*/require('./invoker');

/**
 * Returns a string made by inserting the `separator` between each element and
 * concatenating all the elements into a single string.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig String -> [a] -> String
 * @param {Number|String} separator The string used to separate the elements.
 * @param {Array} xs The elements to join into a string.
 * @return {String} str The string made by concatenating `xs` with `separator`.
 * @see R.split
 * @example
 *
 *      const spacer = R.join(' ');
 *      spacer(['a', 2, 3.4]);   //=> 'a 2 3.4'
 *      R.join('|', [1, 2, 3]);    //=> '1|2|3'
 */


var join = /*#__PURE__*/invoker(1, 'join');
module.exports = join;
  })();
});

require.register("ramda/src/juxt.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var converge = /*#__PURE__*/require('./converge');

/**
 * juxt applies a list of functions to a list of values.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Function
 * @sig [(a, b, ..., m) -> n] -> ((a, b, ..., m) -> [n])
 * @param {Array} fns An array of functions
 * @return {Function} A function that returns a list of values after applying each of the original `fns` to its parameters.
 * @see R.applySpec
 * @example
 *
 *      const getRange = R.juxt([Math.min, Math.max]);
 *      getRange(3, 4, 9, -3); //=> [-3, 9]
 * @symb R.juxt([f, g, h])(a, b) = [f(a, b), g(a, b), h(a, b)]
 */


var juxt = /*#__PURE__*/_curry1(function juxt(fns) {
  return converge(function () {
    return Array.prototype.slice.call(arguments, 0);
  }, fns);
});
module.exports = juxt;
  })();
});

require.register("ramda/src/keys.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var _has = /*#__PURE__*/require('./internal/_has');

var _isArguments = /*#__PURE__*/require('./internal/_isArguments');

// cover IE < 9 keys issues


var hasEnumBug = ! /*#__PURE__*/{ toString: null }.propertyIsEnumerable('toString');
var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
// Safari bug
var hasArgsEnumBug = /*#__PURE__*/function () {
  'use strict';

  return arguments.propertyIsEnumerable('length');
}();

var contains = function contains(list, item) {
  var idx = 0;
  while (idx < list.length) {
    if (list[idx] === item) {
      return true;
    }
    idx += 1;
  }
  return false;
};

/**
 * Returns a list containing the names of all the enumerable own properties of
 * the supplied object.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [k]
 * @param {Object} obj The object to extract properties from
 * @return {Array} An array of the object's own properties.
 * @see R.keysIn, R.values
 * @example
 *
 *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
 */
var keys = typeof Object.keys === 'function' && !hasArgsEnumBug ? /*#__PURE__*/_curry1(function keys(obj) {
  return Object(obj) !== obj ? [] : Object.keys(obj);
}) : /*#__PURE__*/_curry1(function keys(obj) {
  if (Object(obj) !== obj) {
    return [];
  }
  var prop, nIdx;
  var ks = [];
  var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
  for (prop in obj) {
    if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
      ks[ks.length] = prop;
    }
  }
  if (hasEnumBug) {
    nIdx = nonEnumerableProps.length - 1;
    while (nIdx >= 0) {
      prop = nonEnumerableProps[nIdx];
      if (_has(prop, obj) && !contains(ks, prop)) {
        ks[ks.length] = prop;
      }
      nIdx -= 1;
    }
  }
  return ks;
});
module.exports = keys;
  })();
});

require.register("ramda/src/keysIn.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Returns a list containing the names of all the properties of the supplied
 * object, including prototype properties.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category Object
 * @sig {k: v} -> [k]
 * @param {Object} obj The object to extract properties from
 * @return {Array} An array of the object's own and prototype properties.
 * @see R.keys, R.valuesIn
 * @example
 *
 *      const F = function() { this.x = 'X'; };
 *      F.prototype.y = 'Y';
 *      const f = new F();
 *      R.keysIn(f); //=> ['x', 'y']
 */


var keysIn = /*#__PURE__*/_curry1(function keysIn(obj) {
  var prop;
  var ks = [];
  for (prop in obj) {
    ks[ks.length] = prop;
  }
  return ks;
});
module.exports = keysIn;
  })();
});

require.register("ramda/src/last.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var nth = /*#__PURE__*/require('./nth');

/**
 * Returns the last element of the given list or string.
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig [a] -> a | Undefined
 * @sig String -> String
 * @param {*} list
 * @return {*}
 * @see R.init, R.head, R.tail
 * @example
 *
 *      R.last(['fi', 'fo', 'fum']); //=> 'fum'
 *      R.last([]); //=> undefined
 *
 *      R.last('abc'); //=> 'c'
 *      R.last(''); //=> ''
 */


var last = /*#__PURE__*/nth(-1);
module.exports = last;
  })();
});

require.register("ramda/src/lastIndexOf.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _isArray = /*#__PURE__*/require('./internal/_isArray');

var equals = /*#__PURE__*/require('./equals');

/**
 * Returns the position of the last occurrence of an item in an array, or -1 if
 * the item is not included in the array. [`R.equals`](#equals) is used to
 * determine equality.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> Number
 * @param {*} target The item to find.
 * @param {Array} xs The array to search in.
 * @return {Number} the index of the target, or -1 if the target is not found.
 * @see R.indexOf
 * @example
 *
 *      R.lastIndexOf(3, [-1,3,3,0,1,2,3,4]); //=> 6
 *      R.lastIndexOf(10, [1,2,3,4]); //=> -1
 */


var lastIndexOf = /*#__PURE__*/_curry2(function lastIndexOf(target, xs) {
  if (typeof xs.lastIndexOf === 'function' && !_isArray(xs)) {
    return xs.lastIndexOf(target);
  } else {
    var idx = xs.length - 1;
    while (idx >= 0) {
      if (equals(xs[idx], target)) {
        return idx;
      }
      idx -= 1;
    }
    return -1;
  }
});
module.exports = lastIndexOf;
  })();
});

require.register("ramda/src/length.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var _isNumber = /*#__PURE__*/require('./internal/_isNumber');

/**
 * Returns the number of elements in the array by returning `list.length`.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig [a] -> Number
 * @param {Array} list The array to inspect.
 * @return {Number} The length of the array.
 * @example
 *
 *      R.length([]); //=> 0
 *      R.length([1, 2, 3]); //=> 3
 */


var length = /*#__PURE__*/_curry1(function length(list) {
  return list != null && _isNumber(list.length) ? list.length : NaN;
});
module.exports = length;
  })();
});

require.register("ramda/src/lens.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var map = /*#__PURE__*/require('./map');

/**
 * Returns a lens for the given getter and setter functions. The getter "gets"
 * the value of the focus; the setter "sets" the value of the focus. The setter
 * should not mutate the data structure.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig (s -> a) -> ((a, s) -> s) -> Lens s a
 * @param {Function} getter
 * @param {Function} setter
 * @return {Lens}
 * @see R.view, R.set, R.over, R.lensIndex, R.lensProp
 * @example
 *
 *      const xLens = R.lens(R.prop('x'), R.assoc('x'));
 *
 *      R.view(xLens, {x: 1, y: 2});            //=> 1
 *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
 *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
 */


var lens = /*#__PURE__*/_curry2(function lens(getter, setter) {
  return function (toFunctorFn) {
    return function (target) {
      return map(function (focus) {
        return setter(focus, target);
      }, toFunctorFn(getter(target)));
    };
  };
});
module.exports = lens;
  })();
});

require.register("ramda/src/lensIndex.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var lens = /*#__PURE__*/require('./lens');

var nth = /*#__PURE__*/require('./nth');

var update = /*#__PURE__*/require('./update');

/**
 * Returns a lens whose focus is the specified index.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig Number -> Lens s a
 * @param {Number} n
 * @return {Lens}
 * @see R.view, R.set, R.over
 * @example
 *
 *      const headLens = R.lensIndex(0);
 *
 *      R.view(headLens, ['a', 'b', 'c']);            //=> 'a'
 *      R.set(headLens, 'x', ['a', 'b', 'c']);        //=> ['x', 'b', 'c']
 *      R.over(headLens, R.toUpper, ['a', 'b', 'c']); //=> ['A', 'b', 'c']
 */


var lensIndex = /*#__PURE__*/_curry1(function lensIndex(n) {
  return lens(nth(n), update(n));
});
module.exports = lensIndex;
  })();
});

require.register("ramda/src/lensPath.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var assocPath = /*#__PURE__*/require('./assocPath');

var lens = /*#__PURE__*/require('./lens');

var path = /*#__PURE__*/require('./path');

/**
 * Returns a lens whose focus is the specified path.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Object
 * @typedefn Idx = String | Int
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig [Idx] -> Lens s a
 * @param {Array} path The path to use.
 * @return {Lens}
 * @see R.view, R.set, R.over
 * @example
 *
 *      const xHeadYLens = R.lensPath(['x', 0, 'y']);
 *
 *      R.view(xHeadYLens, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
 *      //=> 2
 *      R.set(xHeadYLens, 1, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
 *      //=> {x: [{y: 1, z: 3}, {y: 4, z: 5}]}
 *      R.over(xHeadYLens, R.negate, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
 *      //=> {x: [{y: -2, z: 3}, {y: 4, z: 5}]}
 */


var lensPath = /*#__PURE__*/_curry1(function lensPath(p) {
  return lens(path(p), assocPath(p));
});
module.exports = lensPath;
  })();
});

require.register("ramda/src/lensProp.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var assoc = /*#__PURE__*/require('./assoc');

var lens = /*#__PURE__*/require('./lens');

var prop = /*#__PURE__*/require('./prop');

/**
 * Returns a lens whose focus is the specified property.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig String -> Lens s a
 * @param {String} k
 * @return {Lens}
 * @see R.view, R.set, R.over
 * @example
 *
 *      const xLens = R.lensProp('x');
 *
 *      R.view(xLens, {x: 1, y: 2});            //=> 1
 *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
 *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
 */


var lensProp = /*#__PURE__*/_curry1(function lensProp(k) {
  return lens(prop(k), assoc(k));
});
module.exports = lensProp;
  })();
});

require.register("ramda/src/lift.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var liftN = /*#__PURE__*/require('./liftN');

/**
 * "lifts" a function of arity > 1 so that it may "map over" a list, Function or other
 * object that satisfies the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Function
 * @sig (*... -> *) -> ([*]... -> [*])
 * @param {Function} fn The function to lift into higher context
 * @return {Function} The lifted function.
 * @see R.liftN
 * @example
 *
 *      const madd3 = R.lift((a, b, c) => a + b + c);
 *
 *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
 *
 *      const madd5 = R.lift((a, b, c, d, e) => a + b + c + d + e);
 *
 *      madd5([1,2], [3], [4, 5], [6], [7, 8]); //=> [21, 22, 22, 23, 22, 23, 23, 24]
 */


var lift = /*#__PURE__*/_curry1(function lift(fn) {
  return liftN(fn.length, fn);
});
module.exports = lift;
  })();
});

require.register("ramda/src/liftN.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _reduce = /*#__PURE__*/require('./internal/_reduce');

var ap = /*#__PURE__*/require('./ap');

var curryN = /*#__PURE__*/require('./curryN');

var map = /*#__PURE__*/require('./map');

/**
 * "lifts" a function to be the specified arity, so that it may "map over" that
 * many lists, Functions or other objects that satisfy the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Function
 * @sig Number -> (*... -> *) -> ([*]... -> [*])
 * @param {Function} fn The function to lift into higher context
 * @return {Function} The lifted function.
 * @see R.lift, R.ap
 * @example
 *
 *      const madd3 = R.liftN(3, (...args) => R.sum(args));
 *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
 */


var liftN = /*#__PURE__*/_curry2(function liftN(arity, fn) {
  var lifted = curryN(arity, fn);
  return curryN(arity, function () {
    return _reduce(ap, map(lifted, arguments[0]), Array.prototype.slice.call(arguments, 1));
  });
});
module.exports = liftN;
  })();
});

require.register("ramda/src/lt.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns `true` if the first argument is less than the second; `false`
 * otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @see R.gt
 * @example
 *
 *      R.lt(2, 1); //=> false
 *      R.lt(2, 2); //=> false
 *      R.lt(2, 3); //=> true
 *      R.lt('a', 'z'); //=> true
 *      R.lt('z', 'a'); //=> false
 */


var lt = /*#__PURE__*/_curry2(function lt(a, b) {
  return a < b;
});
module.exports = lt;
  })();
});

require.register("ramda/src/lte.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns `true` if the first argument is less than or equal to the second;
 * `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> Boolean
 * @param {Number} a
 * @param {Number} b
 * @return {Boolean}
 * @see R.gte
 * @example
 *
 *      R.lte(2, 1); //=> false
 *      R.lte(2, 2); //=> true
 *      R.lte(2, 3); //=> true
 *      R.lte('a', 'z'); //=> true
 *      R.lte('z', 'a'); //=> false
 */


var lte = /*#__PURE__*/_curry2(function lte(a, b) {
  return a <= b;
});
module.exports = lte;
  })();
});

require.register("ramda/src/map.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _map = /*#__PURE__*/require('./internal/_map');

var _reduce = /*#__PURE__*/require('./internal/_reduce');

var _xmap = /*#__PURE__*/require('./internal/_xmap');

var curryN = /*#__PURE__*/require('./curryN');

var keys = /*#__PURE__*/require('./keys');

/**
 * Takes a function and
 * a [functor](https://github.com/fantasyland/fantasy-land#functor),
 * applies the function to each of the functor's values, and returns
 * a functor of the same shape.
 *
 * Ramda provides suitable `map` implementations for `Array` and `Object`,
 * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.
 *
 * Dispatches to the `map` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * Also treats functions as functors and will compose them together.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Functor f => (a -> b) -> f a -> f b
 * @param {Function} fn The function to be called on every element of the input `list`.
 * @param {Array} list The list to be iterated over.
 * @return {Array} The new list.
 * @see R.transduce, R.addIndex
 * @example
 *
 *      const double = x => x * 2;
 *
 *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
 *
 *      R.map(double, {x: 1, y: 2, z: 3}); //=> {x: 2, y: 4, z: 6}
 * @symb R.map(f, [a, b]) = [f(a), f(b)]
 * @symb R.map(f, { x: a, y: b }) = { x: f(a), y: f(b) }
 * @symb R.map(f, functor_o) = functor_o.map(f)
 */


var map = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['fantasy-land/map', 'map'], _xmap, function map(fn, functor) {
  switch (Object.prototype.toString.call(functor)) {
    case '[object Function]':
      return curryN(functor.length, function () {
        return fn.call(this, functor.apply(this, arguments));
      });
    case '[object Object]':
      return _reduce(function (acc, key) {
        acc[key] = fn(functor[key]);
        return acc;
      }, {}, keys(functor));
    default:
      return _map(fn, functor);
  }
}));
module.exports = map;
  })();
});

require.register("ramda/src/mapAccum.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * The `mapAccum` function behaves like a combination of map and reduce; it
 * applies a function to each element of a list, passing an accumulating
 * parameter from left to right, and returning a final value of this
 * accumulator together with the new list.
 *
 * The iterator function receives two arguments, *acc* and *value*, and should
 * return a tuple *[acc, value]*.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category List
 * @sig ((acc, x) -> (acc, y)) -> acc -> [x] -> (acc, [y])
 * @param {Function} fn The function to be called on every element of the input `list`.
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.scan, R.addIndex, R.mapAccumRight
 * @example
 *
 *      const digits = ['1', '2', '3', '4'];
 *      const appender = (a, b) => [a + b, a + b];
 *
 *      R.mapAccum(appender, 0, digits); //=> ['01234', ['01', '012', '0123', '01234']]
 * @symb R.mapAccum(f, a, [b, c, d]) = [
 *   f(f(f(a, b)[0], c)[0], d)[0],
 *   [
 *     f(a, b)[1],
 *     f(f(a, b)[0], c)[1],
 *     f(f(f(a, b)[0], c)[0], d)[1]
 *   ]
 * ]
 */


var mapAccum = /*#__PURE__*/_curry3(function mapAccum(fn, acc, list) {
  var idx = 0;
  var len = list.length;
  var result = [];
  var tuple = [acc];
  while (idx < len) {
    tuple = fn(tuple[0], list[idx]);
    result[idx] = tuple[1];
    idx += 1;
  }
  return [tuple[0], result];
});
module.exports = mapAccum;
  })();
});

require.register("ramda/src/mapAccumRight.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * The `mapAccumRight` function behaves like a combination of map and reduce; it
 * applies a function to each element of a list, passing an accumulating
 * parameter from right to left, and returning a final value of this
 * accumulator together with the new list.
 *
 * Similar to [`mapAccum`](#mapAccum), except moves through the input list from
 * the right to the left.
 *
 * The iterator function receives two arguments, *acc* and *value*, and should
 * return a tuple *[acc, value]*.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category List
 * @sig ((acc, x) -> (acc, y)) -> acc -> [x] -> (acc, [y])
 * @param {Function} fn The function to be called on every element of the input `list`.
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.addIndex, R.mapAccum
 * @example
 *
 *      const digits = ['1', '2', '3', '4'];
 *      const appender = (a, b) => [b + a, b + a];
 *
 *      R.mapAccumRight(appender, 5, digits); //=> ['12345', ['12345', '2345', '345', '45']]
 * @symb R.mapAccumRight(f, a, [b, c, d]) = [
 *   f(f(f(a, d)[0], c)[0], b)[0],
 *   [
 *     f(a, d)[1],
 *     f(f(a, d)[0], c)[1],
 *     f(f(f(a, d)[0], c)[0], b)[1]
 *   ]
 * ]
 */


var mapAccumRight = /*#__PURE__*/_curry3(function mapAccumRight(fn, acc, list) {
  var idx = list.length - 1;
  var result = [];
  var tuple = [acc];
  while (idx >= 0) {
    tuple = fn(tuple[0], list[idx]);
    result[idx] = tuple[1];
    idx -= 1;
  }
  return [tuple[0], result];
});
module.exports = mapAccumRight;
  })();
});

require.register("ramda/src/mapObjIndexed.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _reduce = /*#__PURE__*/require('./internal/_reduce');

var keys = /*#__PURE__*/require('./keys');

/**
 * An Object-specific version of [`map`](#map). The function is applied to three
 * arguments: *(value, key, obj)*. If only the value is significant, use
 * [`map`](#map) instead.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Object
 * @sig ((*, String, Object) -> *) -> Object -> Object
 * @param {Function} fn
 * @param {Object} obj
 * @return {Object}
 * @see R.map
 * @example
 *
 *      const xyz = { x: 1, y: 2, z: 3 };
 *      const prependKeyAndDouble = (num, key, obj) => key + (num * 2);
 *
 *      R.mapObjIndexed(prependKeyAndDouble, xyz); //=> { x: 'x2', y: 'y4', z: 'z6' }
 */


var mapObjIndexed = /*#__PURE__*/_curry2(function mapObjIndexed(fn, obj) {
  return _reduce(function (acc, key) {
    acc[key] = fn(obj[key], key, obj);
    return acc;
  }, {}, keys(obj));
});
module.exports = mapObjIndexed;
  })();
});

require.register("ramda/src/match.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Tests a regular expression against a String. Note that this function will
 * return an empty array when there are no matches. This differs from
 * [`String.prototype.match`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match)
 * which returns `null` when there are no matches.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category String
 * @sig RegExp -> String -> [String | Undefined]
 * @param {RegExp} rx A regular expression.
 * @param {String} str The string to match against
 * @return {Array} The list of matches or empty array.
 * @see R.test
 * @example
 *
 *      R.match(/([a-z]a)/g, 'bananas'); //=> ['ba', 'na', 'na']
 *      R.match(/a/, 'b'); //=> []
 *      R.match(/a/, null); //=> TypeError: null does not have a method named "match"
 */


var match = /*#__PURE__*/_curry2(function match(rx, str) {
  return str.match(rx) || [];
});
module.exports = match;
  })();
});

require.register("ramda/src/mathMod.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _isInteger = /*#__PURE__*/require('./internal/_isInteger');

/**
 * `mathMod` behaves like the modulo operator should mathematically, unlike the
 * `%` operator (and by extension, [`R.modulo`](#modulo)). So while
 * `-17 % 5` is `-2`, `mathMod(-17, 5)` is `3`. `mathMod` requires Integer
 * arguments, and returns NaN when the modulus is zero or negative.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} m The dividend.
 * @param {Number} p the modulus.
 * @return {Number} The result of `b mod a`.
 * @see R.modulo
 * @example
 *
 *      R.mathMod(-17, 5);  //=> 3
 *      R.mathMod(17, 5);   //=> 2
 *      R.mathMod(17, -5);  //=> NaN
 *      R.mathMod(17, 0);   //=> NaN
 *      R.mathMod(17.2, 5); //=> NaN
 *      R.mathMod(17, 5.3); //=> NaN
 *
 *      const clock = R.mathMod(R.__, 12);
 *      clock(15); //=> 3
 *      clock(24); //=> 0
 *
 *      const seventeenMod = R.mathMod(17);
 *      seventeenMod(3);  //=> 2
 *      seventeenMod(4);  //=> 1
 *      seventeenMod(10); //=> 7
 */


var mathMod = /*#__PURE__*/_curry2(function mathMod(m, p) {
  if (!_isInteger(m)) {
    return NaN;
  }
  if (!_isInteger(p) || p < 1) {
    return NaN;
  }
  return (m % p + p) % p;
});
module.exports = mathMod;
  })();
});

require.register("ramda/src/max.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns the larger of its two arguments.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> a
 * @param {*} a
 * @param {*} b
 * @return {*}
 * @see R.maxBy, R.min
 * @example
 *
 *      R.max(789, 123); //=> 789
 *      R.max('a', 'b'); //=> 'b'
 */


var max = /*#__PURE__*/_curry2(function max(a, b) {
  return b > a ? b : a;
});
module.exports = max;
  })();
});

require.register("ramda/src/maxBy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Takes a function and two values, and returns whichever value produces the
 * larger result when passed to the provided function.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Relation
 * @sig Ord b => (a -> b) -> a -> a -> a
 * @param {Function} f
 * @param {*} a
 * @param {*} b
 * @return {*}
 * @see R.max, R.minBy
 * @example
 *
 *      //  square :: Number -> Number
 *      const square = n => n * n;
 *
 *      R.maxBy(square, -3, 2); //=> -3
 *
 *      R.reduce(R.maxBy(square), 0, [3, -5, 4, 1, -2]); //=> -5
 *      R.reduce(R.maxBy(square), 0, []); //=> 0
 */


var maxBy = /*#__PURE__*/_curry3(function maxBy(f, a, b) {
  return f(b) > f(a) ? b : a;
});
module.exports = maxBy;
  })();
});

require.register("ramda/src/mean.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var sum = /*#__PURE__*/require('./sum');

/**
 * Returns the mean of the given list of numbers.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category Math
 * @sig [Number] -> Number
 * @param {Array} list
 * @return {Number}
 * @see R.median
 * @example
 *
 *      R.mean([2, 7, 9]); //=> 6
 *      R.mean([]); //=> NaN
 */


var mean = /*#__PURE__*/_curry1(function mean(list) {
  return sum(list) / list.length;
});
module.exports = mean;
  })();
});

require.register("ramda/src/median.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var mean = /*#__PURE__*/require('./mean');

/**
 * Returns the median of the given list of numbers.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category Math
 * @sig [Number] -> Number
 * @param {Array} list
 * @return {Number}
 * @see R.mean
 * @example
 *
 *      R.median([2, 9, 7]); //=> 7
 *      R.median([7, 2, 10, 9]); //=> 8
 *      R.median([]); //=> NaN
 */


var median = /*#__PURE__*/_curry1(function median(list) {
  var len = list.length;
  if (len === 0) {
    return NaN;
  }
  var width = 2 - len % 2;
  var idx = (len - width) / 2;
  return mean(Array.prototype.slice.call(list, 0).sort(function (a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }).slice(idx, idx + width));
});
module.exports = median;
  })();
});

require.register("ramda/src/memoizeWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _arity = /*#__PURE__*/require('./internal/_arity');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _has = /*#__PURE__*/require('./internal/_has');

/**
 * Creates a new function that, when invoked, caches the result of calling `fn`
 * for a given argument set and returns the result. Subsequent calls to the
 * memoized `fn` with the same argument set will not result in an additional
 * call to `fn`; instead, the cached result for that set of arguments will be
 * returned.
 *
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Function
 * @sig (*... -> String) -> (*... -> a) -> (*... -> a)
 * @param {Function} fn The function to generate the cache key.
 * @param {Function} fn The function to memoize.
 * @return {Function} Memoized version of `fn`.
 * @example
 *
 *      let count = 0;
 *      const factorial = R.memoizeWith(R.identity, n => {
 *        count += 1;
 *        return R.product(R.range(1, n + 1));
 *      });
 *      factorial(5); //=> 120
 *      factorial(5); //=> 120
 *      factorial(5); //=> 120
 *      count; //=> 1
 */


var memoizeWith = /*#__PURE__*/_curry2(function memoizeWith(mFn, fn) {
  var cache = {};
  return _arity(fn.length, function () {
    var key = mFn.apply(this, arguments);
    if (!_has(key, cache)) {
      cache[key] = fn.apply(this, arguments);
    }
    return cache[key];
  });
});
module.exports = memoizeWith;
  })();
});

require.register("ramda/src/merge.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _objectAssign = /*#__PURE__*/require('./internal/_objectAssign');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Create a new object with the own properties of the first object merged with
 * the own properties of the second object. If a key exists in both objects,
 * the value from the second object will be used.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> {k: v} -> {k: v}
 * @param {Object} l
 * @param {Object} r
 * @return {Object}
 * @see R.mergeRight, R.mergeDeepRight, R.mergeWith, R.mergeWithKey
 * @deprecated
 * @example
 *
 *      R.merge({ 'name': 'fred', 'age': 10 }, { 'age': 40 });
 *      //=> { 'name': 'fred', 'age': 40 }
 *
 *      const withDefaults = R.merge({x: 0, y: 0});
 *      withDefaults({y: 2}); //=> {x: 0, y: 2}
 * @symb R.merge(a, b) = {...a, ...b}
 */


var merge = /*#__PURE__*/_curry2(function merge(l, r) {
  return _objectAssign({}, l, r);
});
module.exports = merge;
  })();
});

require.register("ramda/src/mergeAll.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _objectAssign = /*#__PURE__*/require('./internal/_objectAssign');

var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Merges a list of objects together into one object.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category List
 * @sig [{k: v}] -> {k: v}
 * @param {Array} list An array of objects
 * @return {Object} A merged object.
 * @see R.reduce
 * @example
 *
 *      R.mergeAll([{foo:1},{bar:2},{baz:3}]); //=> {foo:1,bar:2,baz:3}
 *      R.mergeAll([{foo:1},{foo:2},{bar:2}]); //=> {foo:2,bar:2}
 * @symb R.mergeAll([{ x: 1 }, { y: 2 }, { z: 3 }]) = { x: 1, y: 2, z: 3 }
 */


var mergeAll = /*#__PURE__*/_curry1(function mergeAll(list) {
  return _objectAssign.apply(null, [{}].concat(list));
});
module.exports = mergeAll;
  })();
});

require.register("ramda/src/mergeDeepLeft.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var mergeDeepWithKey = /*#__PURE__*/require('./mergeDeepWithKey');

/**
 * Creates a new object with the own properties of the first object merged with
 * the own properties of the second object. If a key exists in both objects:
 * - and both values are objects, the two values will be recursively merged
 * - otherwise the value from the first object will be used.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Object
 * @sig {a} -> {a} -> {a}
 * @param {Object} lObj
 * @param {Object} rObj
 * @return {Object}
 * @see R.merge, R.mergeDeepRight, R.mergeDeepWith, R.mergeDeepWithKey
 * @example
 *
 *      R.mergeDeepLeft({ name: 'fred', age: 10, contact: { email: 'moo@example.com' }},
 *                      { age: 40, contact: { email: 'baa@example.com' }});
 *      //=> { name: 'fred', age: 10, contact: { email: 'moo@example.com' }}
 */


var mergeDeepLeft = /*#__PURE__*/_curry2(function mergeDeepLeft(lObj, rObj) {
  return mergeDeepWithKey(function (k, lVal, rVal) {
    return lVal;
  }, lObj, rObj);
});
module.exports = mergeDeepLeft;
  })();
});

require.register("ramda/src/mergeDeepRight.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var mergeDeepWithKey = /*#__PURE__*/require('./mergeDeepWithKey');

/**
 * Creates a new object with the own properties of the first object merged with
 * the own properties of the second object. If a key exists in both objects:
 * - and both values are objects, the two values will be recursively merged
 * - otherwise the value from the second object will be used.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Object
 * @sig {a} -> {a} -> {a}
 * @param {Object} lObj
 * @param {Object} rObj
 * @return {Object}
 * @see R.merge, R.mergeDeepLeft, R.mergeDeepWith, R.mergeDeepWithKey
 * @example
 *
 *      R.mergeDeepRight({ name: 'fred', age: 10, contact: { email: 'moo@example.com' }},
 *                       { age: 40, contact: { email: 'baa@example.com' }});
 *      //=> { name: 'fred', age: 40, contact: { email: 'baa@example.com' }}
 */


var mergeDeepRight = /*#__PURE__*/_curry2(function mergeDeepRight(lObj, rObj) {
  return mergeDeepWithKey(function (k, lVal, rVal) {
    return rVal;
  }, lObj, rObj);
});
module.exports = mergeDeepRight;
  })();
});

require.register("ramda/src/mergeDeepWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var mergeDeepWithKey = /*#__PURE__*/require('./mergeDeepWithKey');

/**
 * Creates a new object with the own properties of the two provided objects.
 * If a key exists in both objects:
 * - and both associated values are also objects then the values will be
 *   recursively merged.
 * - otherwise the provided function is applied to associated values using the
 *   resulting value as the new value associated with the key.
 * If a key only exists in one object, the value will be associated with the key
 * of the resulting object.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Object
 * @sig ((a, a) -> a) -> {a} -> {a} -> {a}
 * @param {Function} fn
 * @param {Object} lObj
 * @param {Object} rObj
 * @return {Object}
 * @see R.mergeWith, R.mergeDeepWithKey
 * @example
 *
 *      R.mergeDeepWith(R.concat,
 *                      { a: true, c: { values: [10, 20] }},
 *                      { b: true, c: { values: [15, 35] }});
 *      //=> { a: true, b: true, c: { values: [10, 20, 15, 35] }}
 */


var mergeDeepWith = /*#__PURE__*/_curry3(function mergeDeepWith(fn, lObj, rObj) {
  return mergeDeepWithKey(function (k, lVal, rVal) {
    return fn(lVal, rVal);
  }, lObj, rObj);
});
module.exports = mergeDeepWith;
  })();
});

require.register("ramda/src/mergeDeepWithKey.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var _isObject = /*#__PURE__*/require('./internal/_isObject');

var mergeWithKey = /*#__PURE__*/require('./mergeWithKey');

/**
 * Creates a new object with the own properties of the two provided objects.
 * If a key exists in both objects:
 * - and both associated values are also objects then the values will be
 *   recursively merged.
 * - otherwise the provided function is applied to the key and associated values
 *   using the resulting value as the new value associated with the key.
 * If a key only exists in one object, the value will be associated with the key
 * of the resulting object.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Object
 * @sig ((String, a, a) -> a) -> {a} -> {a} -> {a}
 * @param {Function} fn
 * @param {Object} lObj
 * @param {Object} rObj
 * @return {Object}
 * @see R.mergeWithKey, R.mergeDeepWith
 * @example
 *
 *      let concatValues = (k, l, r) => k == 'values' ? R.concat(l, r) : r
 *      R.mergeDeepWithKey(concatValues,
 *                         { a: true, c: { thing: 'foo', values: [10, 20] }},
 *                         { b: true, c: { thing: 'bar', values: [15, 35] }});
 *      //=> { a: true, b: true, c: { thing: 'bar', values: [10, 20, 15, 35] }}
 */


var mergeDeepWithKey = /*#__PURE__*/_curry3(function mergeDeepWithKey(fn, lObj, rObj) {
  return mergeWithKey(function (k, lVal, rVal) {
    if (_isObject(lVal) && _isObject(rVal)) {
      return mergeDeepWithKey(fn, lVal, rVal);
    } else {
      return fn(k, lVal, rVal);
    }
  }, lObj, rObj);
});
module.exports = mergeDeepWithKey;
  })();
});

require.register("ramda/src/mergeLeft.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _objectAssign = /*#__PURE__*/require('./internal/_objectAssign');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Create a new object with the own properties of the first object merged with
 * the own properties of the second object. If a key exists in both objects,
 * the value from the first object will be used.
 *
 * @func
 * @memberOf R
 * @category Object
 * @sig {k: v} -> {k: v} -> {k: v}
 * @param {Object} l
 * @param {Object} r
 * @return {Object}
 * @see R.mergeRight, R.mergeDeepLeft, R.mergeWith, R.mergeWithKey
 * @example
 *
 *      R.mergeLeft({ 'age': 40 }, { 'name': 'fred', 'age': 10 });
 *      //=> { 'name': 'fred', 'age': 40 }
 *
 *      const resetToDefault = R.mergeLeft({x: 0});
 *      resetToDefault({x: 5, y: 2}); //=> {x: 0, y: 2}
 * @symb R.mergeLeft(a, b) = {...b, ...a}
 */


var mergeLeft = /*#__PURE__*/_curry2(function mergeLeft(l, r) {
  return _objectAssign({}, r, l);
});
module.exports = mergeLeft;
  })();
});

require.register("ramda/src/mergeRight.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _objectAssign = /*#__PURE__*/require('./internal/_objectAssign');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Create a new object with the own properties of the first object merged with
 * the own properties of the second object. If a key exists in both objects,
 * the value from the second object will be used.
 *
 * @func
 * @memberOf R
 * @category Object
 * @sig {k: v} -> {k: v} -> {k: v}
 * @param {Object} l
 * @param {Object} r
 * @return {Object}
 * @see R.mergeLeft, R.mergeDeepRight, R.mergeWith, R.mergeWithKey
 * @example
 *
 *      R.mergeRight({ 'name': 'fred', 'age': 10 }, { 'age': 40 });
 *      //=> { 'name': 'fred', 'age': 40 }
 *
 *      const withDefaults = R.mergeRight({x: 0, y: 0});
 *      withDefaults({y: 2}); //=> {x: 0, y: 2}
 * @symb R.mergeRight(a, b) = {...a, ...b}
 */


var mergeRight = /*#__PURE__*/_curry2(function mergeRight(l, r) {
  return _objectAssign({}, l, r);
});
module.exports = mergeRight;
  })();
});

require.register("ramda/src/mergeWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var mergeWithKey = /*#__PURE__*/require('./mergeWithKey');

/**
 * Creates a new object with the own properties of the two provided objects. If
 * a key exists in both objects, the provided function is applied to the values
 * associated with the key in each object, with the result being used as the
 * value associated with the key in the returned object.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Object
 * @sig ((a, a) -> a) -> {a} -> {a} -> {a}
 * @param {Function} fn
 * @param {Object} l
 * @param {Object} r
 * @return {Object}
 * @see R.mergeDeepWith, R.merge, R.mergeWithKey
 * @example
 *
 *      R.mergeWith(R.concat,
 *                  { a: true, values: [10, 20] },
 *                  { b: true, values: [15, 35] });
 *      //=> { a: true, b: true, values: [10, 20, 15, 35] }
 */


var mergeWith = /*#__PURE__*/_curry3(function mergeWith(fn, l, r) {
  return mergeWithKey(function (_, _l, _r) {
    return fn(_l, _r);
  }, l, r);
});
module.exports = mergeWith;
  })();
});

require.register("ramda/src/mergeWithKey.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var _has = /*#__PURE__*/require('./internal/_has');

/**
 * Creates a new object with the own properties of the two provided objects. If
 * a key exists in both objects, the provided function is applied to the key
 * and the values associated with the key in each object, with the result being
 * used as the value associated with the key in the returned object.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Object
 * @sig ((String, a, a) -> a) -> {a} -> {a} -> {a}
 * @param {Function} fn
 * @param {Object} l
 * @param {Object} r
 * @return {Object}
 * @see R.mergeDeepWithKey, R.merge, R.mergeWith
 * @example
 *
 *      let concatValues = (k, l, r) => k == 'values' ? R.concat(l, r) : r
 *      R.mergeWithKey(concatValues,
 *                     { a: true, thing: 'foo', values: [10, 20] },
 *                     { b: true, thing: 'bar', values: [15, 35] });
 *      //=> { a: true, b: true, thing: 'bar', values: [10, 20, 15, 35] }
 * @symb R.mergeWithKey(f, { x: 1, y: 2 }, { y: 5, z: 3 }) = { x: 1, y: f('y', 2, 5), z: 3 }
 */


var mergeWithKey = /*#__PURE__*/_curry3(function mergeWithKey(fn, l, r) {
  var result = {};
  var k;

  for (k in l) {
    if (_has(k, l)) {
      result[k] = _has(k, r) ? fn(k, l[k], r[k]) : l[k];
    }
  }

  for (k in r) {
    if (_has(k, r) && !_has(k, result)) {
      result[k] = r[k];
    }
  }

  return result;
});
module.exports = mergeWithKey;
  })();
});

require.register("ramda/src/min.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns the smaller of its two arguments.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> a
 * @param {*} a
 * @param {*} b
 * @return {*}
 * @see R.minBy, R.max
 * @example
 *
 *      R.min(789, 123); //=> 123
 *      R.min('a', 'b'); //=> 'a'
 */


var min = /*#__PURE__*/_curry2(function min(a, b) {
  return b < a ? b : a;
});
module.exports = min;
  })();
});

require.register("ramda/src/minBy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Takes a function and two values, and returns whichever value produces the
 * smaller result when passed to the provided function.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Relation
 * @sig Ord b => (a -> b) -> a -> a -> a
 * @param {Function} f
 * @param {*} a
 * @param {*} b
 * @return {*}
 * @see R.min, R.maxBy
 * @example
 *
 *      //  square :: Number -> Number
 *      const square = n => n * n;
 *
 *      R.minBy(square, -3, 2); //=> 2
 *
 *      R.reduce(R.minBy(square), Infinity, [3, -5, 4, 1, -2]); //=> 1
 *      R.reduce(R.minBy(square), Infinity, []); //=> Infinity
 */


var minBy = /*#__PURE__*/_curry3(function minBy(f, a, b) {
  return f(b) < f(a) ? b : a;
});
module.exports = minBy;
  })();
});

require.register("ramda/src/modulo.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Divides the first parameter by the second and returns the remainder. Note
 * that this function preserves the JavaScript-style behavior for modulo. For
 * mathematical modulo see [`mathMod`](#mathMod).
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} a The value to the divide.
 * @param {Number} b The pseudo-modulus
 * @return {Number} The result of `b % a`.
 * @see R.mathMod
 * @example
 *
 *      R.modulo(17, 3); //=> 2
 *      // JS behavior:
 *      R.modulo(-17, 3); //=> -2
 *      R.modulo(17, -3); //=> 2
 *
 *      const isOdd = R.modulo(R.__, 2);
 *      isOdd(42); //=> 0
 *      isOdd(21); //=> 1
 */


var modulo = /*#__PURE__*/_curry2(function modulo(a, b) {
  return a % b;
});
module.exports = modulo;
  })();
});

require.register("ramda/src/move.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Move an item, at index `from`, to index `to`, in a list of elements.
 * A new list will be created containing the new elements order.
 *
 * @func
 * @memberOf R
 * @category List
 * @sig Number -> Number -> [a] -> [a]
 * @param {Number} from The source index
 * @param {Number} to The destination index
 * @param {Array} list The list which will serve to realise the move
 * @return {Array} The new list reordered
 * @example
 *
 *      R.move(0, 2, ['a', 'b', 'c', 'd', 'e', 'f']); //=> ['b', 'c', 'a', 'd', 'e', 'f']
 *      R.move(-1, 0, ['a', 'b', 'c', 'd', 'e', 'f']); //=> ['f', 'a', 'b', 'c', 'd', 'e'] list rotation
 */


var move = /*#__PURE__*/_curry3(function (from, to, list) {
  var length = list.length;
  var result = list.slice();
  var positiveFrom = from < 0 ? length + from : from;
  var positiveTo = to < 0 ? length + to : to;
  var item = result.splice(positiveFrom, 1);

  return positiveFrom < 0 || positiveFrom >= list.length || positiveTo < 0 || positiveTo >= list.length ? list : [].concat(result.slice(0, positiveTo)).concat(item).concat(result.slice(positiveTo, list.length));
});

module.exports = move;
  })();
});

require.register("ramda/src/multiply.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Multiplies two numbers. Equivalent to `a * b` but curried.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} a The first value.
 * @param {Number} b The second value.
 * @return {Number} The result of `a * b`.
 * @see R.divide
 * @example
 *
 *      const double = R.multiply(2);
 *      const triple = R.multiply(3);
 *      double(3);       //=>  6
 *      triple(4);       //=> 12
 *      R.multiply(2, 5);  //=> 10
 */


var multiply = /*#__PURE__*/_curry2(function multiply(a, b) {
  return a * b;
});
module.exports = multiply;
  })();
});

require.register("ramda/src/nAry.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Wraps a function of any arity (including nullary) in a function that accepts
 * exactly `n` parameters. Any extraneous parameters will not be passed to the
 * supplied function.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig Number -> (* -> a) -> (* -> a)
 * @param {Number} n The desired arity of the new function.
 * @param {Function} fn The function to wrap.
 * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
 *         arity `n`.
 * @see R.binary, R.unary
 * @example
 *
 *      const takesTwoArgs = (a, b) => [a, b];
 *
 *      takesTwoArgs.length; //=> 2
 *      takesTwoArgs(1, 2); //=> [1, 2]
 *
 *      const takesOneArg = R.nAry(1, takesTwoArgs);
 *      takesOneArg.length; //=> 1
 *      // Only `n` arguments are passed to the wrapped function
 *      takesOneArg(1, 2); //=> [1, undefined]
 * @symb R.nAry(0, f)(a, b) = f()
 * @symb R.nAry(1, f)(a, b) = f(a)
 * @symb R.nAry(2, f)(a, b) = f(a, b)
 */


var nAry = /*#__PURE__*/_curry2(function nAry(n, fn) {
  switch (n) {
    case 0:
      return function () {
        return fn.call(this);
      };
    case 1:
      return function (a0) {
        return fn.call(this, a0);
      };
    case 2:
      return function (a0, a1) {
        return fn.call(this, a0, a1);
      };
    case 3:
      return function (a0, a1, a2) {
        return fn.call(this, a0, a1, a2);
      };
    case 4:
      return function (a0, a1, a2, a3) {
        return fn.call(this, a0, a1, a2, a3);
      };
    case 5:
      return function (a0, a1, a2, a3, a4) {
        return fn.call(this, a0, a1, a2, a3, a4);
      };
    case 6:
      return function (a0, a1, a2, a3, a4, a5) {
        return fn.call(this, a0, a1, a2, a3, a4, a5);
      };
    case 7:
      return function (a0, a1, a2, a3, a4, a5, a6) {
        return fn.call(this, a0, a1, a2, a3, a4, a5, a6);
      };
    case 8:
      return function (a0, a1, a2, a3, a4, a5, a6, a7) {
        return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7);
      };
    case 9:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
        return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8);
      };
    case 10:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
      };
    default:
      throw new Error('First argument to nAry must be a non-negative integer no greater than ten');
  }
});
module.exports = nAry;
  })();
});

require.register("ramda/src/negate.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Negates its argument.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Math
 * @sig Number -> Number
 * @param {Number} n
 * @return {Number}
 * @example
 *
 *      R.negate(42); //=> -42
 */


var negate = /*#__PURE__*/_curry1(function negate(n) {
  return -n;
});
module.exports = negate;
  })();
});

require.register("ramda/src/none.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _complement = /*#__PURE__*/require('./internal/_complement');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var all = /*#__PURE__*/require('./all');

/**
 * Returns `true` if no elements of the list match the predicate, `false`
 * otherwise.
 *
 * Dispatches to the `all` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> Boolean
 * @param {Function} fn The predicate function.
 * @param {Array} list The array to consider.
 * @return {Boolean} `true` if the predicate is not satisfied by every element, `false` otherwise.
 * @see R.all, R.any
 * @example
 *
 *      const isEven = n => n % 2 === 0;
 *      const isOdd = n => n % 2 === 1;
 *
 *      R.none(isEven, [1, 3, 5, 7, 9, 11]); //=> true
 *      R.none(isOdd, [1, 3, 5, 7, 8, 11]); //=> false
 */


var none = /*#__PURE__*/_curry2(function none(fn, input) {
  return all(_complement(fn), input);
});
module.exports = none;
  })();
});

require.register("ramda/src/not.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * A function that returns the `!` of its argument. It will return `true` when
 * passed false-y value, and `false` when passed a truth-y one.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig * -> Boolean
 * @param {*} a any value
 * @return {Boolean} the logical inverse of passed argument.
 * @see R.complement
 * @example
 *
 *      R.not(true); //=> false
 *      R.not(false); //=> true
 *      R.not(0); //=> true
 *      R.not(1); //=> false
 */


var not = /*#__PURE__*/_curry1(function not(a) {
  return !a;
});
module.exports = not;
  })();
});

require.register("ramda/src/nth.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _isString = /*#__PURE__*/require('./internal/_isString');

/**
 * Returns the nth element of the given list or string. If n is negative the
 * element at index length + n is returned.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Number -> [a] -> a | Undefined
 * @sig Number -> String -> String
 * @param {Number} offset
 * @param {*} list
 * @return {*}
 * @example
 *
 *      const list = ['foo', 'bar', 'baz', 'quux'];
 *      R.nth(1, list); //=> 'bar'
 *      R.nth(-1, list); //=> 'quux'
 *      R.nth(-99, list); //=> undefined
 *
 *      R.nth(2, 'abc'); //=> 'c'
 *      R.nth(3, 'abc'); //=> ''
 * @symb R.nth(-1, [a, b, c]) = c
 * @symb R.nth(0, [a, b, c]) = a
 * @symb R.nth(1, [a, b, c]) = b
 */


var nth = /*#__PURE__*/_curry2(function nth(offset, list) {
  var idx = offset < 0 ? list.length + offset : offset;
  return _isString(list) ? list.charAt(idx) : list[idx];
});
module.exports = nth;
  })();
});

require.register("ramda/src/nthArg.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var curryN = /*#__PURE__*/require('./curryN');

var nth = /*#__PURE__*/require('./nth');

/**
 * Returns a function which returns its nth argument.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Function
 * @sig Number -> *... -> *
 * @param {Number} n
 * @return {Function}
 * @example
 *
 *      R.nthArg(1)('a', 'b', 'c'); //=> 'b'
 *      R.nthArg(-1)('a', 'b', 'c'); //=> 'c'
 * @symb R.nthArg(-1)(a, b, c) = c
 * @symb R.nthArg(0)(a, b, c) = a
 * @symb R.nthArg(1)(a, b, c) = b
 */


var nthArg = /*#__PURE__*/_curry1(function nthArg(n) {
  var arity = n < 0 ? 1 : n + 1;
  return curryN(arity, function () {
    return nth(n, arguments);
  });
});
module.exports = nthArg;
  })();
});

require.register("ramda/src/o.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * `o` is a curried composition function that returns a unary function.
 * Like [`compose`](#compose), `o` performs right-to-left function composition.
 * Unlike [`compose`](#compose), the rightmost function passed to `o` will be
 * invoked with only one argument. Also, unlike [`compose`](#compose), `o` is
 * limited to accepting only 2 unary functions. The name o was chosen because
 * of its similarity to the mathematical composition operator ∘.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Function
 * @sig (b -> c) -> (a -> b) -> a -> c
 * @param {Function} f
 * @param {Function} g
 * @return {Function}
 * @see R.compose, R.pipe
 * @example
 *
 *      const classyGreeting = name => "The name's " + name.last + ", " + name.first + " " + name.last
 *      const yellGreeting = R.o(R.toUpper, classyGreeting);
 *      yellGreeting({first: 'James', last: 'Bond'}); //=> "THE NAME'S BOND, JAMES BOND"
 *
 *      R.o(R.multiply(10), R.add(10))(-4) //=> 60
 *
 * @symb R.o(f, g, x) = f(g(x))
 */


var o = /*#__PURE__*/_curry3(function o(f, g, x) {
  return f(g(x));
});
module.exports = o;
  })();
});

require.register("ramda/src/objOf.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Creates an object containing a single key:value pair.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category Object
 * @sig String -> a -> {String:a}
 * @param {String} key
 * @param {*} val
 * @return {Object}
 * @see R.pair
 * @example
 *
 *      const matchPhrases = R.compose(
 *        R.objOf('must'),
 *        R.map(R.objOf('match_phrase'))
 *      );
 *      matchPhrases(['foo', 'bar', 'baz']); //=> {must: [{match_phrase: 'foo'}, {match_phrase: 'bar'}, {match_phrase: 'baz'}]}
 */


var objOf = /*#__PURE__*/_curry2(function objOf(key, val) {
  var obj = {};
  obj[key] = val;
  return obj;
});
module.exports = objOf;
  })();
});

require.register("ramda/src/of.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var _of = /*#__PURE__*/require('./internal/_of');

/**
 * Returns a singleton array containing the value provided.
 *
 * Note this `of` is different from the ES6 `of`; See
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Function
 * @sig a -> [a]
 * @param {*} x any value
 * @return {Array} An array wrapping `x`.
 * @example
 *
 *      R.of(null); //=> [null]
 *      R.of([42]); //=> [[42]]
 */


var of = /*#__PURE__*/_curry1(_of);
module.exports = of;
  })();
});

require.register("ramda/src/omit.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns a partial copy of an object omitting the keys specified.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig [String] -> {String: *} -> {String: *}
 * @param {Array} names an array of String property names to omit from the new object
 * @param {Object} obj The object to copy from
 * @return {Object} A new object with properties from `names` not on it.
 * @see R.pick
 * @example
 *
 *      R.omit(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, c: 3}
 */


var omit = /*#__PURE__*/_curry2(function omit(names, obj) {
  var result = {};
  var index = {};
  var idx = 0;
  var len = names.length;

  while (idx < len) {
    index[names[idx]] = 1;
    idx += 1;
  }

  for (var prop in obj) {
    if (!index.hasOwnProperty(prop)) {
      result[prop] = obj[prop];
    }
  }
  return result;
});
module.exports = omit;
  })();
});

require.register("ramda/src/once.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _arity = /*#__PURE__*/require('./internal/_arity');

var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Accepts a function `fn` and returns a function that guards invocation of
 * `fn` such that `fn` can only ever be called once, no matter how many times
 * the returned function is invoked. The first value calculated is returned in
 * subsequent invocations.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (a... -> b) -> (a... -> b)
 * @param {Function} fn The function to wrap in a call-only-once wrapper.
 * @return {Function} The wrapped function.
 * @example
 *
 *      const addOneOnce = R.once(x => x + 1);
 *      addOneOnce(10); //=> 11
 *      addOneOnce(addOneOnce(50)); //=> 11
 */


var once = /*#__PURE__*/_curry1(function once(fn) {
  var called = false;
  var result;
  return _arity(fn.length, function () {
    if (called) {
      return result;
    }
    called = true;
    result = fn.apply(this, arguments);
    return result;
  });
});
module.exports = once;
  })();
});

require.register("ramda/src/or.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns `true` if one or both of its arguments are `true`. Returns `false`
 * if both arguments are `false`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig a -> b -> a | b
 * @param {Any} a
 * @param {Any} b
 * @return {Any} the first argument if truthy, otherwise the second argument.
 * @see R.either
 * @example
 *
 *      R.or(true, true); //=> true
 *      R.or(true, false); //=> true
 *      R.or(false, true); //=> true
 *      R.or(false, false); //=> false
 */


var or = /*#__PURE__*/_curry2(function or(a, b) {
  return a || b;
});
module.exports = or;
  })();
});

require.register("ramda/src/otherwise.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _assertPromise = /*#__PURE__*/require('./internal/_assertPromise');

/**
 * Returns the result of applying the onFailure function to the value inside
 * a failed promise. This is useful for handling rejected promises
 * inside function compositions.
 *
 * @func
 * @memberOf R
 * @category Function
 * @sig (e -> b) -> (Promise e a) -> (Promise e b)
 * @sig (e -> (Promise f b)) -> (Promise e a) -> (Promise f b)
 * @param {Function} onFailure The function to apply. Can return a value or a promise of a value.
 * @param {Promise} p
 * @return {Promise} The result of calling `p.then(null, onFailure)`
 * @see R.then
 * @example
 *
 *      var failedFetch = (id) => Promise.reject('bad ID');
 *      var useDefault = () => ({ firstName: 'Bob', lastName: 'Loblaw' })
 *
 *      //recoverFromFailure :: String -> Promise ({firstName, lastName})
 *      var recoverFromFailure = R.pipe(
 *        failedFetch,
 *        R.otherwise(useDefault),
 *        R.then(R.pick(['firstName', 'lastName'])),
 *      );
 *      recoverFromFailure(12345).then(console.log)
 */


var otherwise = /*#__PURE__*/_curry2(function otherwise(f, p) {
  _assertPromise('otherwise', p);

  return p.then(null, f);
});
module.exports = otherwise;
  })();
});

require.register("ramda/src/over.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

// `Identity` is a functor that holds a single value, where `map` simply
// transforms the held value with the provided function.


var Identity = function (x) {
  return { value: x, map: function (f) {
      return Identity(f(x));
    } };
};

/**
 * Returns the result of "setting" the portion of the given data structure
 * focused by the given lens to the result of applying the given function to
 * the focused value.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig Lens s a -> (a -> a) -> s -> s
 * @param {Lens} lens
 * @param {*} v
 * @param {*} x
 * @return {*}
 * @see R.prop, R.lensIndex, R.lensProp
 * @example
 *
 *      const headLens = R.lensIndex(0);
 *
 *      R.over(headLens, R.toUpper, ['foo', 'bar', 'baz']); //=> ['FOO', 'bar', 'baz']
 */
var over = /*#__PURE__*/_curry3(function over(lens, f, x) {
  // The value returned by the getter function is first transformed with `f`,
  // then set as the value of an `Identity`. This is then mapped over with the
  // setter function of the lens.
  return lens(function (y) {
    return Identity(f(y));
  })(x).value;
});
module.exports = over;
  })();
});

require.register("ramda/src/pair.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Takes two arguments, `fst` and `snd`, and returns `[fst, snd]`.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category List
 * @sig a -> b -> (a,b)
 * @param {*} fst
 * @param {*} snd
 * @return {Array}
 * @see R.objOf, R.of
 * @example
 *
 *      R.pair('foo', 'bar'); //=> ['foo', 'bar']
 */


var pair = /*#__PURE__*/_curry2(function pair(fst, snd) {
  return [fst, snd];
});
module.exports = pair;
  })();
});

require.register("ramda/src/partial.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _concat = /*#__PURE__*/require('./internal/_concat');

var _createPartialApplicator = /*#__PURE__*/require('./internal/_createPartialApplicator');

/**
 * Takes a function `f` and a list of arguments, and returns a function `g`.
 * When applied, `g` returns the result of applying `f` to the arguments
 * provided initially followed by the arguments provided to `g`.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Function
 * @sig ((a, b, c, ..., n) -> x) -> [a, b, c, ...] -> ((d, e, f, ..., n) -> x)
 * @param {Function} f
 * @param {Array} args
 * @return {Function}
 * @see R.partialRight, R.curry
 * @example
 *
 *      const multiply2 = (a, b) => a * b;
 *      const double = R.partial(multiply2, [2]);
 *      double(2); //=> 4
 *
 *      const greet = (salutation, title, firstName, lastName) =>
 *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
 *
 *      const sayHello = R.partial(greet, ['Hello']);
 *      const sayHelloToMs = R.partial(sayHello, ['Ms.']);
 *      sayHelloToMs('Jane', 'Jones'); //=> 'Hello, Ms. Jane Jones!'
 * @symb R.partial(f, [a, b])(c, d) = f(a, b, c, d)
 */


var partial = /*#__PURE__*/_createPartialApplicator(_concat);
module.exports = partial;
  })();
});

require.register("ramda/src/partialRight.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _concat = /*#__PURE__*/require('./internal/_concat');

var _createPartialApplicator = /*#__PURE__*/require('./internal/_createPartialApplicator');

var flip = /*#__PURE__*/require('./flip');

/**
 * Takes a function `f` and a list of arguments, and returns a function `g`.
 * When applied, `g` returns the result of applying `f` to the arguments
 * provided to `g` followed by the arguments provided initially.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Function
 * @sig ((a, b, c, ..., n) -> x) -> [d, e, f, ..., n] -> ((a, b, c, ...) -> x)
 * @param {Function} f
 * @param {Array} args
 * @return {Function}
 * @see R.partial
 * @example
 *
 *      const greet = (salutation, title, firstName, lastName) =>
 *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
 *
 *      const greetMsJaneJones = R.partialRight(greet, ['Ms.', 'Jane', 'Jones']);
 *
 *      greetMsJaneJones('Hello'); //=> 'Hello, Ms. Jane Jones!'
 * @symb R.partialRight(f, [a, b])(c, d) = f(c, d, a, b)
 */


var partialRight = /*#__PURE__*/_createPartialApplicator( /*#__PURE__*/flip(_concat));
module.exports = partialRight;
  })();
});

require.register("ramda/src/partition.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var filter = /*#__PURE__*/require('./filter');

var juxt = /*#__PURE__*/require('./juxt');

var reject = /*#__PURE__*/require('./reject');

/**
 * Takes a predicate and a list or other `Filterable` object and returns the
 * pair of filterable objects of the same type of elements which do and do not
 * satisfy, the predicate, respectively. Filterable objects include plain objects or any object
 * that has a filter method such as `Array`.
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig Filterable f => (a -> Boolean) -> f a -> [f a, f a]
 * @param {Function} pred A predicate to determine which side the element belongs to.
 * @param {Array} filterable the list (or other filterable) to partition.
 * @return {Array} An array, containing first the subset of elements that satisfy the
 *         predicate, and second the subset of elements that do not satisfy.
 * @see R.filter, R.reject
 * @example
 *
 *      R.partition(R.includes('s'), ['sss', 'ttt', 'foo', 'bars']);
 *      // => [ [ 'sss', 'bars' ],  [ 'ttt', 'foo' ] ]
 *
 *      R.partition(R.includes('s'), { a: 'sss', b: 'ttt', foo: 'bars' });
 *      // => [ { a: 'sss', foo: 'bars' }, { b: 'ttt' }  ]
 */


var partition = /*#__PURE__*/juxt([filter, reject]);
module.exports = partition;
  })();
});

require.register("ramda/src/path.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Retrieve the value at a given path.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig [Idx] -> {a} -> a | Undefined
 * @param {Array} path The path to use.
 * @param {Object} obj The object to retrieve the nested property from.
 * @return {*} The data at `path`.
 * @see R.prop
 * @example
 *
 *      R.path(['a', 'b'], {a: {b: 2}}); //=> 2
 *      R.path(['a', 'b'], {c: {b: 2}}); //=> undefined
 */


var path = /*#__PURE__*/_curry2(function path(paths, obj) {
  var val = obj;
  var idx = 0;
  while (idx < paths.length) {
    if (val == null) {
      return;
    }
    val = val[paths[idx]];
    idx += 1;
  }
  return val;
});
module.exports = path;
  })();
});

require.register("ramda/src/pathEq.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var equals = /*#__PURE__*/require('./equals');

var path = /*#__PURE__*/require('./path');

/**
 * Determines whether a nested path on an object has a specific value, in
 * [`R.equals`](#equals) terms. Most likely used to filter a list.
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Relation
 * @typedefn Idx = String | Int
 * @sig [Idx] -> a -> {a} -> Boolean
 * @param {Array} path The path of the nested property to use
 * @param {*} val The value to compare the nested property with
 * @param {Object} obj The object to check the nested property in
 * @return {Boolean} `true` if the value equals the nested object property,
 *         `false` otherwise.
 * @example
 *
 *      const user1 = { address: { zipCode: 90210 } };
 *      const user2 = { address: { zipCode: 55555 } };
 *      const user3 = { name: 'Bob' };
 *      const users = [ user1, user2, user3 ];
 *      const isFamous = R.pathEq(['address', 'zipCode'], 90210);
 *      R.filter(isFamous, users); //=> [ user1 ]
 */


var pathEq = /*#__PURE__*/_curry3(function pathEq(_path, val, obj) {
  return equals(path(_path, obj), val);
});
module.exports = pathEq;
  })();
});

require.register("ramda/src/pathOr.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var defaultTo = /*#__PURE__*/require('./defaultTo');

var path = /*#__PURE__*/require('./path');

/**
 * If the given, non-null object has a value at the given path, returns the
 * value at that path. Otherwise returns the provided default value.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig a -> [Idx] -> {a} -> a
 * @param {*} d The default value.
 * @param {Array} p The path to use.
 * @param {Object} obj The object to retrieve the nested property from.
 * @return {*} The data at `path` of the supplied object or the default value.
 * @example
 *
 *      R.pathOr('N/A', ['a', 'b'], {a: {b: 2}}); //=> 2
 *      R.pathOr('N/A', ['a', 'b'], {c: {b: 2}}); //=> "N/A"
 */


var pathOr = /*#__PURE__*/_curry3(function pathOr(d, p, obj) {
  return defaultTo(d, path(p, obj));
});
module.exports = pathOr;
  })();
});

require.register("ramda/src/pathSatisfies.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var path = /*#__PURE__*/require('./path');

/**
 * Returns `true` if the specified object property at given path satisfies the
 * given predicate; `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Logic
 * @typedefn Idx = String | Int
 * @sig (a -> Boolean) -> [Idx] -> {a} -> Boolean
 * @param {Function} pred
 * @param {Array} propPath
 * @param {*} obj
 * @return {Boolean}
 * @see R.propSatisfies, R.path
 * @example
 *
 *      R.pathSatisfies(y => y > 0, ['x', 'y'], {x: {y: 2}}); //=> true
 */


var pathSatisfies = /*#__PURE__*/_curry3(function pathSatisfies(pred, propPath, obj) {
  return propPath.length > 0 && pred(path(propPath, obj));
});
module.exports = pathSatisfies;
  })();
});

require.register("ramda/src/pick.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns a partial copy of an object containing only the keys specified. If
 * the key does not exist, the property is ignored.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig [k] -> {k: v} -> {k: v}
 * @param {Array} names an array of String property names to copy onto a new object
 * @param {Object} obj The object to copy from
 * @return {Object} A new object with only properties from `names` on it.
 * @see R.omit, R.props
 * @example
 *
 *      R.pick(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
 *      R.pick(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1}
 */


var pick = /*#__PURE__*/_curry2(function pick(names, obj) {
  var result = {};
  var idx = 0;
  while (idx < names.length) {
    if (names[idx] in obj) {
      result[names[idx]] = obj[names[idx]];
    }
    idx += 1;
  }
  return result;
});
module.exports = pick;
  })();
});

require.register("ramda/src/pickAll.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Similar to `pick` except that this one includes a `key: undefined` pair for
 * properties that don't exist.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig [k] -> {k: v} -> {k: v}
 * @param {Array} names an array of String property names to copy onto a new object
 * @param {Object} obj The object to copy from
 * @return {Object} A new object with only properties from `names` on it.
 * @see R.pick
 * @example
 *
 *      R.pickAll(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
 *      R.pickAll(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, e: undefined, f: undefined}
 */


var pickAll = /*#__PURE__*/_curry2(function pickAll(names, obj) {
  var result = {};
  var idx = 0;
  var len = names.length;
  while (idx < len) {
    var name = names[idx];
    result[name] = obj[name];
    idx += 1;
  }
  return result;
});
module.exports = pickAll;
  })();
});

require.register("ramda/src/pickBy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns a partial copy of an object containing only the keys that satisfy
 * the supplied predicate.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @sig ((v, k) -> Boolean) -> {k: v} -> {k: v}
 * @param {Function} pred A predicate to determine whether or not a key
 *        should be included on the output object.
 * @param {Object} obj The object to copy from
 * @return {Object} A new object with only properties that satisfy `pred`
 *         on it.
 * @see R.pick, R.filter
 * @example
 *
 *      const isUpperCase = (val, key) => key.toUpperCase() === key;
 *      R.pickBy(isUpperCase, {a: 1, b: 2, A: 3, B: 4}); //=> {A: 3, B: 4}
 */


var pickBy = /*#__PURE__*/_curry2(function pickBy(test, obj) {
  var result = {};
  for (var prop in obj) {
    if (test(obj[prop], prop, obj)) {
      result[prop] = obj[prop];
    }
  }
  return result;
});
module.exports = pickBy;
  })();
});

require.register("ramda/src/pipe.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _arity = /*#__PURE__*/require('./internal/_arity');

var _pipe = /*#__PURE__*/require('./internal/_pipe');

var reduce = /*#__PURE__*/require('./reduce');

var tail = /*#__PURE__*/require('./tail');

/**
 * Performs left-to-right function composition. The leftmost function may have
 * any arity; the remaining functions must be unary.
 *
 * In some libraries this function is named `sequence`.
 *
 * **Note:** The result of pipe is not automatically curried.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
 * @param {...Function} functions
 * @return {Function}
 * @see R.compose
 * @example
 *
 *      const f = R.pipe(Math.pow, R.negate, R.inc);
 *
 *      f(3, 4); // -(3^4) + 1
 * @symb R.pipe(f, g, h)(a, b) = h(g(f(a, b)))
 */


function pipe() {
  if (arguments.length === 0) {
    throw new Error('pipe requires at least one argument');
  }
  return _arity(arguments[0].length, reduce(_pipe, arguments[0], tail(arguments)));
}
module.exports = pipe;
  })();
});

require.register("ramda/src/pipeK.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var composeK = /*#__PURE__*/require('./composeK');

var reverse = /*#__PURE__*/require('./reverse');

/**
 * Returns the left-to-right Kleisli composition of the provided functions,
 * each of which must return a value of a type supported by [`chain`](#chain).
 *
 * `R.pipeK(f, g, h)` is equivalent to `R.pipe(f, R.chain(g), R.chain(h))`.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Function
 * @sig Chain m => ((a -> m b), (b -> m c), ..., (y -> m z)) -> (a -> m z)
 * @param {...Function}
 * @return {Function}
 * @see R.composeK
 * @deprecated since v0.26.0
 * @example
 *
 *      //  parseJson :: String -> Maybe *
 *      //  get :: String -> Object -> Maybe *
 *
 *      //  getStateCode :: Maybe String -> Maybe String
 *      const getStateCode = R.pipeK(
 *        parseJson,
 *        get('user'),
 *        get('address'),
 *        get('state'),
 *        R.compose(Maybe.of, R.toUpper)
 *      );
 *
 *      getStateCode('{"user":{"address":{"state":"ny"}}}');
 *      //=> Just('NY')
 *      getStateCode('[Invalid JSON]');
 *      //=> Nothing()
 * @symb R.pipeK(f, g, h)(a) = R.chain(h, R.chain(g, f(a)))
 */


function pipeK() {
  if (arguments.length === 0) {
    throw new Error('pipeK requires at least one argument');
  }
  return composeK.apply(this, reverse(arguments));
}
module.exports = pipeK;
  })();
});

require.register("ramda/src/pipeP.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _arity = /*#__PURE__*/require('./internal/_arity');

var _pipeP = /*#__PURE__*/require('./internal/_pipeP');

var reduce = /*#__PURE__*/require('./reduce');

var tail = /*#__PURE__*/require('./tail');

/**
 * Performs left-to-right composition of one or more Promise-returning
 * functions. The leftmost function may have any arity; the remaining functions
 * must be unary.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Function
 * @sig ((a -> Promise b), (b -> Promise c), ..., (y -> Promise z)) -> (a -> Promise z)
 * @param {...Function} functions
 * @return {Function}
 * @see R.composeP
 * @deprecated since v0.26.0
 * @example
 *
 *      //  followersForUser :: String -> Promise [User]
 *      const followersForUser = R.pipeP(db.getUserById, db.getFollowers);
 */


function pipeP() {
  if (arguments.length === 0) {
    throw new Error('pipeP requires at least one argument');
  }
  return _arity(arguments[0].length, reduce(_pipeP, arguments[0], tail(arguments)));
}
module.exports = pipeP;
  })();
});

require.register("ramda/src/pipeWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _arity = /*#__PURE__*/require('./internal/_arity');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var head = /*#__PURE__*/require('./head');

var _reduce = /*#__PURE__*/require('./internal/_reduce');

var tail = /*#__PURE__*/require('./tail');

var identity = /*#__PURE__*/require('./identity');

/**
 * Performs left-to-right function composition using transforming function. The leftmost function may have
 * any arity; the remaining functions must be unary.
 *
 * **Note:** The result of pipeWith is not automatically curried.
 *
 * @func
 * @memberOf R
 * @category Function
 * @sig ((* -> *), [((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)]) -> ((a, b, ..., n) -> z)
 * @param {...Function} functions
 * @return {Function}
 * @see R.composeWith, R.pipe
 * @example
 *
 *      const pipeWhileNotNil = R.pipeWith((f, res) => R.isNil(res) ? res : f(res));
 *      const f = pipeWhileNotNil([Math.pow, R.negate, R.inc])
 *
 *      f(3, 4); // -(3^4) + 1
 * @symb R.pipeWith(f)([g, h, i])(...args) = f(i, f(h, f(g, ...args)))
 */


var pipeWith = /*#__PURE__*/_curry2(function pipeWith(xf, list) {
  if (list.length <= 0) {
    return identity;
  }

  var headList = head(list);
  var tailList = tail(list);

  return _arity(headList.length, function () {
    return _reduce(function (result, f) {
      return xf.call(this, f, result);
    }, headList.apply(this, arguments), tailList);
  });
});
module.exports = pipeWith;
  })();
});

require.register("ramda/src/pluck.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var map = /*#__PURE__*/require('./map');

var prop = /*#__PURE__*/require('./prop');

/**
 * Returns a new list by plucking the same named property off all objects in
 * the list supplied.
 *
 * `pluck` will work on
 * any [functor](https://github.com/fantasyland/fantasy-land#functor) in
 * addition to arrays, as it is equivalent to `R.map(R.prop(k), f)`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Functor f => k -> f {k: v} -> f v
 * @param {Number|String} key The key name to pluck off of each object.
 * @param {Array} f The array or functor to consider.
 * @return {Array} The list of values for the given key.
 * @see R.props
 * @example
 *
 *      var getAges = R.pluck('age');
 *      getAges([{name: 'fred', age: 29}, {name: 'wilma', age: 27}]); //=> [29, 27]
 *
 *      R.pluck(0, [[1, 2], [3, 4]]);               //=> [1, 3]
 *      R.pluck('val', {a: {val: 3}, b: {val: 5}}); //=> {a: 3, b: 5}
 * @symb R.pluck('x', [{x: 1, y: 2}, {x: 3, y: 4}, {x: 5, y: 6}]) = [1, 3, 5]
 * @symb R.pluck(0, [[1, 2], [3, 4], [5, 6]]) = [1, 3, 5]
 */


var pluck = /*#__PURE__*/_curry2(function pluck(p, list) {
  return map(prop(p), list);
});
module.exports = pluck;
  })();
});

require.register("ramda/src/prepend.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _concat = /*#__PURE__*/require('./internal/_concat');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns a new list with the given element at the front, followed by the
 * contents of the list.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> [a]
 * @param {*} el The item to add to the head of the output list.
 * @param {Array} list The array to add to the tail of the output list.
 * @return {Array} A new array.
 * @see R.append
 * @example
 *
 *      R.prepend('fee', ['fi', 'fo', 'fum']); //=> ['fee', 'fi', 'fo', 'fum']
 */


var prepend = /*#__PURE__*/_curry2(function prepend(el, list) {
  return _concat([el], list);
});
module.exports = prepend;
  })();
});

require.register("ramda/src/product.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var multiply = /*#__PURE__*/require('./multiply');

var reduce = /*#__PURE__*/require('./reduce');

/**
 * Multiplies together all the elements of a list.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig [Number] -> Number
 * @param {Array} list An array of numbers
 * @return {Number} The product of all the numbers in the list.
 * @see R.reduce
 * @example
 *
 *      R.product([2,4,6,8,100,1]); //=> 38400
 */


var product = /*#__PURE__*/reduce(multiply, 1);
module.exports = product;
  })();
});

require.register("ramda/src/project.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _map = /*#__PURE__*/require('./internal/_map');

var identity = /*#__PURE__*/require('./identity');

var pickAll = /*#__PURE__*/require('./pickAll');

var useWith = /*#__PURE__*/require('./useWith');

/**
 * Reasonable analog to SQL `select` statement.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @category Relation
 * @sig [k] -> [{k: v}] -> [{k: v}]
 * @param {Array} props The property names to project
 * @param {Array} objs The objects to query
 * @return {Array} An array of objects with just the `props` properties.
 * @example
 *
 *      const abby = {name: 'Abby', age: 7, hair: 'blond', grade: 2};
 *      const fred = {name: 'Fred', age: 12, hair: 'brown', grade: 7};
 *      const kids = [abby, fred];
 *      R.project(['name', 'grade'], kids); //=> [{name: 'Abby', grade: 2}, {name: 'Fred', grade: 7}]
 */


var project = /*#__PURE__*/useWith(_map, [pickAll, identity]); // passing `identity` gives correct arity
module.exports = project;
  })();
});

require.register("ramda/src/prop.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var path = /*#__PURE__*/require('./path');

/**
 * Returns a function that when supplied an object returns the indicated
 * property of that object, if it exists.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig s -> {s: a} -> a | Undefined
 * @param {String} p The property name
 * @param {Object} obj The object to query
 * @return {*} The value at `obj.p`.
 * @see R.path
 * @example
 *
 *      R.prop('x', {x: 100}); //=> 100
 *      R.prop('x', {}); //=> undefined
 *      R.compose(R.inc, R.prop('x'))({ x: 3 }) //=> 4
 */

var prop = /*#__PURE__*/_curry2(function prop(p, obj) {
  return path([p], obj);
});
module.exports = prop;
  })();
});

require.register("ramda/src/propEq.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var equals = /*#__PURE__*/require('./equals');

/**
 * Returns `true` if the specified object property is equal, in
 * [`R.equals`](#equals) terms, to the given value; `false` otherwise.
 * You can test multiple properties with [`R.whereEq`](#whereEq).
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig String -> a -> Object -> Boolean
 * @param {String} name
 * @param {*} val
 * @param {*} obj
 * @return {Boolean}
 * @see R.whereEq, R.propSatisfies, R.equals
 * @example
 *
 *      const abby = {name: 'Abby', age: 7, hair: 'blond'};
 *      const fred = {name: 'Fred', age: 12, hair: 'brown'};
 *      const rusty = {name: 'Rusty', age: 10, hair: 'brown'};
 *      const alois = {name: 'Alois', age: 15, disposition: 'surly'};
 *      const kids = [abby, fred, rusty, alois];
 *      const hasBrownHair = R.propEq('hair', 'brown');
 *      R.filter(hasBrownHair, kids); //=> [fred, rusty]
 */


var propEq = /*#__PURE__*/_curry3(function propEq(name, val, obj) {
  return equals(val, obj[name]);
});
module.exports = propEq;
  })();
});

require.register("ramda/src/propIs.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var is = /*#__PURE__*/require('./is');

/**
 * Returns `true` if the specified object property is of the given type;
 * `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Type
 * @sig Type -> String -> Object -> Boolean
 * @param {Function} type
 * @param {String} name
 * @param {*} obj
 * @return {Boolean}
 * @see R.is, R.propSatisfies
 * @example
 *
 *      R.propIs(Number, 'x', {x: 1, y: 2});  //=> true
 *      R.propIs(Number, 'x', {x: 'foo'});    //=> false
 *      R.propIs(Number, 'x', {});            //=> false
 */


var propIs = /*#__PURE__*/_curry3(function propIs(type, name, obj) {
  return is(type, obj[name]);
});
module.exports = propIs;
  })();
});

require.register("ramda/src/propOr.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var pathOr = /*#__PURE__*/require('./pathOr');

/**
 * If the given, non-null object has an own property with the specified name,
 * returns the value of that property. Otherwise returns the provided default
 * value.
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category Object
 * @sig a -> String -> Object -> a
 * @param {*} val The default value.
 * @param {String} p The name of the property to return.
 * @param {Object} obj The object to query.
 * @return {*} The value of given property of the supplied object or the default value.
 * @example
 *
 *      const alice = {
 *        name: 'ALICE',
 *        age: 101
 *      };
 *      const favorite = R.prop('favoriteLibrary');
 *      const favoriteWithDefault = R.propOr('Ramda', 'favoriteLibrary');
 *
 *      favorite(alice);  //=> undefined
 *      favoriteWithDefault(alice);  //=> 'Ramda'
 */


var propOr = /*#__PURE__*/_curry3(function propOr(val, p, obj) {
  return pathOr(val, [p], obj);
});
module.exports = propOr;
  })();
});

require.register("ramda/src/propSatisfies.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Returns `true` if the specified object property satisfies the given
 * predicate; `false` otherwise. You can test multiple properties with
 * [`R.where`](#where).
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Logic
 * @sig (a -> Boolean) -> String -> {String: a} -> Boolean
 * @param {Function} pred
 * @param {String} name
 * @param {*} obj
 * @return {Boolean}
 * @see R.where, R.propEq, R.propIs
 * @example
 *
 *      R.propSatisfies(x => x > 0, 'x', {x: 1, y: 2}); //=> true
 */


var propSatisfies = /*#__PURE__*/_curry3(function propSatisfies(pred, name, obj) {
  return pred(obj[name]);
});
module.exports = propSatisfies;
  })();
});

require.register("ramda/src/props.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Acts as multiple `prop`: array of keys in, array of values out. Preserves
 * order.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig [k] -> {k: v} -> [v]
 * @param {Array} ps The property names to fetch
 * @param {Object} obj The object to query
 * @return {Array} The corresponding values or partially applied function.
 * @example
 *
 *      R.props(['x', 'y'], {x: 1, y: 2}); //=> [1, 2]
 *      R.props(['c', 'a', 'b'], {b: 2, a: 1}); //=> [undefined, 1, 2]
 *
 *      const fullName = R.compose(R.join(' '), R.props(['first', 'last']));
 *      fullName({last: 'Bullet-Tooth', age: 33, first: 'Tony'}); //=> 'Tony Bullet-Tooth'
 */


var props = /*#__PURE__*/_curry2(function props(ps, obj) {
  var len = ps.length;
  var out = [];
  var idx = 0;

  while (idx < len) {
    out[idx] = obj[ps[idx]];
    idx += 1;
  }

  return out;
});
module.exports = props;
  })();
});

require.register("ramda/src/range.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _isNumber = /*#__PURE__*/require('./internal/_isNumber');

/**
 * Returns a list of numbers from `from` (inclusive) to `to` (exclusive).
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Number -> Number -> [Number]
 * @param {Number} from The first number in the list.
 * @param {Number} to One more than the last number in the list.
 * @return {Array} The list of numbers in the set `[a, b)`.
 * @example
 *
 *      R.range(1, 5);    //=> [1, 2, 3, 4]
 *      R.range(50, 53);  //=> [50, 51, 52]
 */


var range = /*#__PURE__*/_curry2(function range(from, to) {
  if (!(_isNumber(from) && _isNumber(to))) {
    throw new TypeError('Both arguments to range must be numbers');
  }
  var result = [];
  var n = from;
  while (n < to) {
    result.push(n);
    n += 1;
  }
  return result;
});
module.exports = range;
  })();
});

require.register("ramda/src/reduce.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var _reduce = /*#__PURE__*/require('./internal/_reduce');

/**
 * Returns a single item by iterating through the list, successively calling
 * the iterator function and passing it an accumulator value and the current
 * value from the array, and then passing the result to the next call.
 *
 * The iterator function receives two values: *(acc, value)*. It may use
 * [`R.reduced`](#reduced) to shortcut the iteration.
 *
 * The arguments' order of [`reduceRight`](#reduceRight)'s iterator function
 * is *(value, acc)*.
 *
 * Note: `R.reduce` does not skip deleted or unassigned indices (sparse
 * arrays), unlike the native `Array.prototype.reduce` method. For more details
 * on this behavior, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
 *
 * Dispatches to the `reduce` method of the third argument, if present. When
 * doing so, it is up to the user to handle the [`R.reduced`](#reduced)
 * shortcuting, as this is not implemented by `reduce`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig ((a, b) -> a) -> a -> [b] -> a
 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
 *        current element from the array.
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.reduced, R.addIndex, R.reduceRight
 * @example
 *
 *      R.reduce(R.subtract, 0, [1, 2, 3, 4]) // => ((((0 - 1) - 2) - 3) - 4) = -10
 *      //          -               -10
 *      //         / \              / \
 *      //        -   4           -6   4
 *      //       / \              / \
 *      //      -   3   ==>     -3   3
 *      //     / \              / \
 *      //    -   2           -1   2
 *      //   / \              / \
 *      //  0   1            0   1
 *
 * @symb R.reduce(f, a, [b, c, d]) = f(f(f(a, b), c), d)
 */


var reduce = /*#__PURE__*/_curry3(_reduce);
module.exports = reduce;
  })();
});

require.register("ramda/src/reduceBy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curryN = /*#__PURE__*/require('./internal/_curryN');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _has = /*#__PURE__*/require('./internal/_has');

var _reduce = /*#__PURE__*/require('./internal/_reduce');

var _xreduceBy = /*#__PURE__*/require('./internal/_xreduceBy');

/**
 * Groups the elements of the list according to the result of calling
 * the String-returning function `keyFn` on each element and reduces the elements
 * of each group to a single value via the reducer function `valueFn`.
 *
 * This function is basically a more general [`groupBy`](#groupBy) function.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.20.0
 * @category List
 * @sig ((a, b) -> a) -> a -> (b -> String) -> [b] -> {String: a}
 * @param {Function} valueFn The function that reduces the elements of each group to a single
 *        value. Receives two values, accumulator for a particular group and the current element.
 * @param {*} acc The (initial) accumulator value for each group.
 * @param {Function} keyFn The function that maps the list's element into a key.
 * @param {Array} list The array to group.
 * @return {Object} An object with the output of `keyFn` for keys, mapped to the output of
 *         `valueFn` for elements which produced that key when passed to `keyFn`.
 * @see R.groupBy, R.reduce
 * @example
 *
 *      const groupNames = (acc, {name}) => acc.concat(name)
 *      const toGrade = ({score}) =>
 *        score < 65 ? 'F' :
 *        score < 70 ? 'D' :
 *        score < 80 ? 'C' :
 *        score < 90 ? 'B' : 'A'
 *
 *      var students = [
 *        {name: 'Abby', score: 83},
 *        {name: 'Bart', score: 62},
 *        {name: 'Curt', score: 88},
 *        {name: 'Dora', score: 92},
 *      ]
 *
 *      reduceBy(groupNames, [], toGrade, students)
 *      //=> {"A": ["Dora"], "B": ["Abby", "Curt"], "F": ["Bart"]}
 */


var reduceBy = /*#__PURE__*/_curryN(4, [], /*#__PURE__*/_dispatchable([], _xreduceBy, function reduceBy(valueFn, valueAcc, keyFn, list) {
  return _reduce(function (acc, elt) {
    var key = keyFn(elt);
    acc[key] = valueFn(_has(key, acc) ? acc[key] : valueAcc, elt);
    return acc;
  }, {}, list);
}));
module.exports = reduceBy;
  })();
});

require.register("ramda/src/reduceRight.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Returns a single item by iterating through the list, successively calling
 * the iterator function and passing it an accumulator value and the current
 * value from the array, and then passing the result to the next call.
 *
 * Similar to [`reduce`](#reduce), except moves through the input list from the
 * right to the left.
 *
 * The iterator function receives two values: *(value, acc)*, while the arguments'
 * order of `reduce`'s iterator function is *(acc, value)*.
 *
 * Note: `R.reduceRight` does not skip deleted or unassigned indices (sparse
 * arrays), unlike the native `Array.prototype.reduceRight` method. For more details
 * on this behavior, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight#Description
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig ((a, b) -> b) -> b -> [a] -> b
 * @param {Function} fn The iterator function. Receives two values, the current element from the array
 *        and the accumulator.
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.reduce, R.addIndex
 * @example
 *
 *      R.reduceRight(R.subtract, 0, [1, 2, 3, 4]) // => (1 - (2 - (3 - (4 - 0)))) = -2
 *      //    -               -2
 *      //   / \              / \
 *      //  1   -            1   3
 *      //     / \              / \
 *      //    2   -     ==>    2  -1
 *      //       / \              / \
 *      //      3   -            3   4
 *      //         / \              / \
 *      //        4   0            4   0
 *
 * @symb R.reduceRight(f, a, [b, c, d]) = f(b, f(c, f(d, a)))
 */


var reduceRight = /*#__PURE__*/_curry3(function reduceRight(fn, acc, list) {
  var idx = list.length - 1;
  while (idx >= 0) {
    acc = fn(list[idx], acc);
    idx -= 1;
  }
  return acc;
});
module.exports = reduceRight;
  })();
});

require.register("ramda/src/reduceWhile.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curryN = /*#__PURE__*/require('./internal/_curryN');

var _reduce = /*#__PURE__*/require('./internal/_reduce');

var _reduced = /*#__PURE__*/require('./internal/_reduced');

/**
 * Like [`reduce`](#reduce), `reduceWhile` returns a single item by iterating
 * through the list, successively calling the iterator function. `reduceWhile`
 * also takes a predicate that is evaluated before each step. If the predicate
 * returns `false`, it "short-circuits" the iteration and returns the current
 * value of the accumulator.
 *
 * @func
 * @memberOf R
 * @since v0.22.0
 * @category List
 * @sig ((a, b) -> Boolean) -> ((a, b) -> a) -> a -> [b] -> a
 * @param {Function} pred The predicate. It is passed the accumulator and the
 *        current element.
 * @param {Function} fn The iterator function. Receives two values, the
 *        accumulator and the current element.
 * @param {*} a The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.reduce, R.reduced
 * @example
 *
 *      const isOdd = (acc, x) => x % 2 === 1;
 *      const xs = [1, 3, 5, 60, 777, 800];
 *      R.reduceWhile(isOdd, R.add, 0, xs); //=> 9
 *
 *      const ys = [2, 4, 6]
 *      R.reduceWhile(isOdd, R.add, 111, ys); //=> 111
 */


var reduceWhile = /*#__PURE__*/_curryN(4, [], function _reduceWhile(pred, fn, a, list) {
  return _reduce(function (acc, x) {
    return pred(acc, x) ? fn(acc, x) : _reduced(acc);
  }, a, list);
});
module.exports = reduceWhile;
  })();
});

require.register("ramda/src/reduced.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var _reduced = /*#__PURE__*/require('./internal/_reduced');

/**
 * Returns a value wrapped to indicate that it is the final value of the reduce
 * and transduce functions. The returned value should be considered a black
 * box: the internal structure is not guaranteed to be stable.
 *
 * Note: this optimization is only available to the below functions:
 * - [`reduce`](#reduce)
 * - [`reduceWhile`](#reduceWhile)
 * - [`transduce`](#transduce)
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category List
 * @sig a -> *
 * @param {*} x The final value of the reduce.
 * @return {*} The wrapped value.
 * @see R.reduce, R.reduceWhile, R.transduce
 * @example
 *
 *     R.reduce(
 *       (acc, item) => item > 3 ? R.reduced(acc) : acc.concat(item),
 *       [],
 *       [1, 2, 3, 4, 5]) // [1, 2, 3]
 */


var reduced = /*#__PURE__*/_curry1(_reduced);
module.exports = reduced;
  })();
});

require.register("ramda/src/reject.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _complement = /*#__PURE__*/require('./internal/_complement');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var filter = /*#__PURE__*/require('./filter');

/**
 * The complement of [`filter`](#filter).
 *
 * Acts as a transducer if a transformer is given in list position. Filterable
 * objects include plain objects or any object that has a filter method such
 * as `Array`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Filterable f => (a -> Boolean) -> f a -> f a
 * @param {Function} pred
 * @param {Array} filterable
 * @return {Array}
 * @see R.filter, R.transduce, R.addIndex
 * @example
 *
 *      const isOdd = (n) => n % 2 === 1;
 *
 *      R.reject(isOdd, [1, 2, 3, 4]); //=> [2, 4]
 *
 *      R.reject(isOdd, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
 */


var reject = /*#__PURE__*/_curry2(function reject(pred, filterable) {
  return filter(_complement(pred), filterable);
});
module.exports = reject;
  })();
});

require.register("ramda/src/remove.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Removes the sub-list of `list` starting at index `start` and containing
 * `count` elements. _Note that this is not destructive_: it returns a copy of
 * the list with the changes.
 * <small>No lists have been harmed in the application of this function.</small>
 *
 * @func
 * @memberOf R
 * @since v0.2.2
 * @category List
 * @sig Number -> Number -> [a] -> [a]
 * @param {Number} start The position to start removing elements
 * @param {Number} count The number of elements to remove
 * @param {Array} list The list to remove from
 * @return {Array} A new Array with `count` elements from `start` removed.
 * @see R.without
 * @example
 *
 *      R.remove(2, 3, [1,2,3,4,5,6,7,8]); //=> [1,2,6,7,8]
 */


var remove = /*#__PURE__*/_curry3(function remove(start, count, list) {
  var result = Array.prototype.slice.call(list, 0);
  result.splice(start, count);
  return result;
});
module.exports = remove;
  })();
});

require.register("ramda/src/repeat.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var always = /*#__PURE__*/require('./always');

var times = /*#__PURE__*/require('./times');

/**
 * Returns a fixed list of size `n` containing a specified identical value.
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category List
 * @sig a -> n -> [a]
 * @param {*} value The value to repeat.
 * @param {Number} n The desired size of the output list.
 * @return {Array} A new array containing `n` `value`s.
 * @see R.times
 * @example
 *
 *      R.repeat('hi', 5); //=> ['hi', 'hi', 'hi', 'hi', 'hi']
 *
 *      const obj = {};
 *      const repeatedObjs = R.repeat(obj, 5); //=> [{}, {}, {}, {}, {}]
 *      repeatedObjs[0] === repeatedObjs[1]; //=> true
 * @symb R.repeat(a, 0) = []
 * @symb R.repeat(a, 1) = [a]
 * @symb R.repeat(a, 2) = [a, a]
 */


var repeat = /*#__PURE__*/_curry2(function repeat(value, n) {
  return times(always(value), n);
});
module.exports = repeat;
  })();
});

require.register("ramda/src/replace.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Replace a substring or regex match in a string with a replacement.
 *
 * The first two parameters correspond to the parameters of the
 * `String.prototype.replace()` function, so the second parameter can also be a
 * function.
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category String
 * @sig RegExp|String -> String -> String -> String
 * @param {RegExp|String} pattern A regular expression or a substring to match.
 * @param {String} replacement The string to replace the matches with.
 * @param {String} str The String to do the search and replacement in.
 * @return {String} The result.
 * @example
 *
 *      R.replace('foo', 'bar', 'foo foo foo'); //=> 'bar foo foo'
 *      R.replace(/foo/, 'bar', 'foo foo foo'); //=> 'bar foo foo'
 *
 *      // Use the "g" (global) flag to replace all occurrences:
 *      R.replace(/foo/g, 'bar', 'foo foo foo'); //=> 'bar bar bar'
 */


var replace = /*#__PURE__*/_curry3(function replace(regex, replacement, str) {
  return str.replace(regex, replacement);
});
module.exports = replace;
  })();
});

require.register("ramda/src/reverse.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var _isString = /*#__PURE__*/require('./internal/_isString');

/**
 * Returns a new list or string with the elements or characters in reverse
 * order.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a]
 * @sig String -> String
 * @param {Array|String} list
 * @return {Array|String}
 * @example
 *
 *      R.reverse([1, 2, 3]);  //=> [3, 2, 1]
 *      R.reverse([1, 2]);     //=> [2, 1]
 *      R.reverse([1]);        //=> [1]
 *      R.reverse([]);         //=> []
 *
 *      R.reverse('abc');      //=> 'cba'
 *      R.reverse('ab');       //=> 'ba'
 *      R.reverse('a');        //=> 'a'
 *      R.reverse('');         //=> ''
 */


var reverse = /*#__PURE__*/_curry1(function reverse(list) {
  return _isString(list) ? list.split('').reverse().join('') : Array.prototype.slice.call(list, 0).reverse();
});
module.exports = reverse;
  })();
});

require.register("ramda/src/scan.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Scan is similar to [`reduce`](#reduce), but returns a list of successively
 * reduced values from the left
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category List
 * @sig ((a, b) -> a) -> a -> [b] -> [a]
 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
 *        current element from the array
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {Array} A list of all intermediately reduced values.
 * @see R.reduce, R.mapAccum
 * @example
 *
 *      const numbers = [1, 2, 3, 4];
 *      const factorials = R.scan(R.multiply, 1, numbers); //=> [1, 1, 2, 6, 24]
 * @symb R.scan(f, a, [b, c]) = [a, f(a, b), f(f(a, b), c)]
 */


var scan = /*#__PURE__*/_curry3(function scan(fn, acc, list) {
  var idx = 0;
  var len = list.length;
  var result = [acc];
  while (idx < len) {
    acc = fn(acc, list[idx]);
    result[idx + 1] = acc;
    idx += 1;
  }
  return result;
});
module.exports = scan;
  })();
});

require.register("ramda/src/sequence.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var ap = /*#__PURE__*/require('./ap');

var map = /*#__PURE__*/require('./map');

var prepend = /*#__PURE__*/require('./prepend');

var reduceRight = /*#__PURE__*/require('./reduceRight');

/**
 * Transforms a [Traversable](https://github.com/fantasyland/fantasy-land#traversable)
 * of [Applicative](https://github.com/fantasyland/fantasy-land#applicative) into an
 * Applicative of Traversable.
 *
 * Dispatches to the `sequence` method of the second argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig (Applicative f, Traversable t) => (a -> f a) -> t (f a) -> f (t a)
 * @param {Function} of
 * @param {*} traversable
 * @return {*}
 * @see R.traverse
 * @example
 *
 *      R.sequence(Maybe.of, [Just(1), Just(2), Just(3)]);   //=> Just([1, 2, 3])
 *      R.sequence(Maybe.of, [Just(1), Just(2), Nothing()]); //=> Nothing()
 *
 *      R.sequence(R.of, Just([1, 2, 3])); //=> [Just(1), Just(2), Just(3)]
 *      R.sequence(R.of, Nothing());       //=> [Nothing()]
 */


var sequence = /*#__PURE__*/_curry2(function sequence(of, traversable) {
  return typeof traversable.sequence === 'function' ? traversable.sequence(of) : reduceRight(function (x, acc) {
    return ap(map(prepend, x), acc);
  }, of([]), traversable);
});
module.exports = sequence;
  })();
});

require.register("ramda/src/set.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var always = /*#__PURE__*/require('./always');

var over = /*#__PURE__*/require('./over');

/**
 * Returns the result of "setting" the portion of the given data structure
 * focused by the given lens to the given value.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig Lens s a -> a -> s -> s
 * @param {Lens} lens
 * @param {*} v
 * @param {*} x
 * @return {*}
 * @see R.prop, R.lensIndex, R.lensProp
 * @example
 *
 *      const xLens = R.lensProp('x');
 *
 *      R.set(xLens, 4, {x: 1, y: 2});  //=> {x: 4, y: 2}
 *      R.set(xLens, 8, {x: 1, y: 2});  //=> {x: 8, y: 2}
 */


var set = /*#__PURE__*/_curry3(function set(lens, v, x) {
  return over(lens, always(v), x);
});
module.exports = set;
  })();
});

require.register("ramda/src/slice.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _checkForMethod = /*#__PURE__*/require('./internal/_checkForMethod');

var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Returns the elements of the given list or string (or object with a `slice`
 * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
 *
 * Dispatches to the `slice` method of the third argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig Number -> Number -> [a] -> [a]
 * @sig Number -> Number -> String -> String
 * @param {Number} fromIndex The start index (inclusive).
 * @param {Number} toIndex The end index (exclusive).
 * @param {*} list
 * @return {*}
 * @example
 *
 *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
 *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
 *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
 *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
 *      R.slice(0, 3, 'ramda');                     //=> 'ram'
 */


var slice = /*#__PURE__*/_curry3( /*#__PURE__*/_checkForMethod('slice', function slice(fromIndex, toIndex, list) {
  return Array.prototype.slice.call(list, fromIndex, toIndex);
}));
module.exports = slice;
  })();
});

require.register("ramda/src/sort.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns a copy of the list, sorted according to the comparator function,
 * which should accept two values at a time and return a negative number if the
 * first value is smaller, a positive number if it's larger, and zero if they
 * are equal. Please note that this is a **copy** of the list. It does not
 * modify the original.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig ((a, a) -> Number) -> [a] -> [a]
 * @param {Function} comparator A sorting function :: a -> b -> Int
 * @param {Array} list The list to sort
 * @return {Array} a new array with its elements sorted by the comparator function.
 * @example
 *
 *      const diff = function(a, b) { return a - b; };
 *      R.sort(diff, [4,2,7,5]); //=> [2, 4, 5, 7]
 */


var sort = /*#__PURE__*/_curry2(function sort(comparator, list) {
  return Array.prototype.slice.call(list, 0).sort(comparator);
});
module.exports = sort;
  })();
});

require.register("ramda/src/sortBy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Sorts the list according to the supplied function.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord b => (a -> b) -> [a] -> [a]
 * @param {Function} fn
 * @param {Array} list The list to sort.
 * @return {Array} A new list sorted by the keys generated by `fn`.
 * @example
 *
 *      const sortByFirstItem = R.sortBy(R.prop(0));
 *      const pairs = [[-1, 1], [-2, 2], [-3, 3]];
 *      sortByFirstItem(pairs); //=> [[-3, 3], [-2, 2], [-1, 1]]
 *
 *      const sortByNameCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop('name')));
 *      const alice = {
 *        name: 'ALICE',
 *        age: 101
 *      };
 *      const bob = {
 *        name: 'Bob',
 *        age: -10
 *      };
 *      const clara = {
 *        name: 'clara',
 *        age: 314.159
 *      };
 *      const people = [clara, bob, alice];
 *      sortByNameCaseInsensitive(people); //=> [alice, bob, clara]
 */


var sortBy = /*#__PURE__*/_curry2(function sortBy(fn, list) {
  return Array.prototype.slice.call(list, 0).sort(function (a, b) {
    var aa = fn(a);
    var bb = fn(b);
    return aa < bb ? -1 : aa > bb ? 1 : 0;
  });
});
module.exports = sortBy;
  })();
});

require.register("ramda/src/sortWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Sorts a list according to a list of comparators.
 *
 * @func
 * @memberOf R
 * @since v0.23.0
 * @category Relation
 * @sig [(a, a) -> Number] -> [a] -> [a]
 * @param {Array} functions A list of comparator functions.
 * @param {Array} list The list to sort.
 * @return {Array} A new list sorted according to the comarator functions.
 * @example
 *
 *      const alice = {
 *        name: 'alice',
 *        age: 40
 *      };
 *      const bob = {
 *        name: 'bob',
 *        age: 30
 *      };
 *      const clara = {
 *        name: 'clara',
 *        age: 40
 *      };
 *      const people = [clara, bob, alice];
 *      const ageNameSort = R.sortWith([
 *        R.descend(R.prop('age')),
 *        R.ascend(R.prop('name'))
 *      ]);
 *      ageNameSort(people); //=> [alice, clara, bob]
 */


var sortWith = /*#__PURE__*/_curry2(function sortWith(fns, list) {
  return Array.prototype.slice.call(list, 0).sort(function (a, b) {
    var result = 0;
    var i = 0;
    while (result === 0 && i < fns.length) {
      result = fns[i](a, b);
      i += 1;
    }
    return result;
  });
});
module.exports = sortWith;
  })();
});

require.register("ramda/src/split.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var invoker = /*#__PURE__*/require('./invoker');

/**
 * Splits a string into an array of strings based on the given
 * separator.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category String
 * @sig (String | RegExp) -> String -> [String]
 * @param {String|RegExp} sep The pattern.
 * @param {String} str The string to separate into an array.
 * @return {Array} The array of strings from `str` separated by `str`.
 * @see R.join
 * @example
 *
 *      const pathComponents = R.split('/');
 *      R.tail(pathComponents('/usr/local/bin/node')); //=> ['usr', 'local', 'bin', 'node']
 *
 *      R.split('.', 'a.b.c.xyz.d'); //=> ['a', 'b', 'c', 'xyz', 'd']
 */


var split = /*#__PURE__*/invoker(1, 'split');
module.exports = split;
  })();
});

require.register("ramda/src/splitAt.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var length = /*#__PURE__*/require('./length');

var slice = /*#__PURE__*/require('./slice');

/**
 * Splits a given list or string at a given index.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig Number -> [a] -> [[a], [a]]
 * @sig Number -> String -> [String, String]
 * @param {Number} index The index where the array/string is split.
 * @param {Array|String} array The array/string to be split.
 * @return {Array}
 * @example
 *
 *      R.splitAt(1, [1, 2, 3]);          //=> [[1], [2, 3]]
 *      R.splitAt(5, 'hello world');      //=> ['hello', ' world']
 *      R.splitAt(-1, 'foobar');          //=> ['fooba', 'r']
 */


var splitAt = /*#__PURE__*/_curry2(function splitAt(index, array) {
  return [slice(0, index, array), slice(index, length(array), array)];
});
module.exports = splitAt;
  })();
});

require.register("ramda/src/splitEvery.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var slice = /*#__PURE__*/require('./slice');

/**
 * Splits a collection into slices of the specified length.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig Number -> [a] -> [[a]]
 * @sig Number -> String -> [String]
 * @param {Number} n
 * @param {Array} list
 * @return {Array}
 * @example
 *
 *      R.splitEvery(3, [1, 2, 3, 4, 5, 6, 7]); //=> [[1, 2, 3], [4, 5, 6], [7]]
 *      R.splitEvery(3, 'foobarbaz'); //=> ['foo', 'bar', 'baz']
 */


var splitEvery = /*#__PURE__*/_curry2(function splitEvery(n, list) {
  if (n <= 0) {
    throw new Error('First argument to splitEvery must be a positive integer');
  }
  var result = [];
  var idx = 0;
  while (idx < list.length) {
    result.push(slice(idx, idx += n, list));
  }
  return result;
});
module.exports = splitEvery;
  })();
});

require.register("ramda/src/splitWhen.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Takes a list and a predicate and returns a pair of lists with the following properties:
 *
 *  - the result of concatenating the two output lists is equivalent to the input list;
 *  - none of the elements of the first output list satisfies the predicate; and
 *  - if the second output list is non-empty, its first element satisfies the predicate.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> [[a], [a]]
 * @param {Function} pred The predicate that determines where the array is split.
 * @param {Array} list The array to be split.
 * @return {Array}
 * @example
 *
 *      R.splitWhen(R.equals(2), [1, 2, 3, 1, 2, 3]);   //=> [[1], [2, 3, 1, 2, 3]]
 */


var splitWhen = /*#__PURE__*/_curry2(function splitWhen(pred, list) {
  var idx = 0;
  var len = list.length;
  var prefix = [];

  while (idx < len && !pred(list[idx])) {
    prefix.push(list[idx]);
    idx += 1;
  }

  return [prefix, Array.prototype.slice.call(list, idx)];
});
module.exports = splitWhen;
  })();
});

require.register("ramda/src/startsWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var equals = /*#__PURE__*/require('./equals');

var take = /*#__PURE__*/require('./take');

/**
 * Checks if a list starts with the provided sublist.
 *
 * Similarly, checks if a string starts with the provided substring.
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category List
 * @sig [a] -> [a] -> Boolean
 * @sig String -> String -> Boolean
 * @param {*} prefix
 * @param {*} list
 * @return {Boolean}
 * @see R.endsWith
 * @example
 *
 *      R.startsWith('a', 'abc')                //=> true
 *      R.startsWith('b', 'abc')                //=> false
 *      R.startsWith(['a'], ['a', 'b', 'c'])    //=> true
 *      R.startsWith(['b'], ['a', 'b', 'c'])    //=> false
 */


var startsWith = /*#__PURE__*/_curry2(function (prefix, list) {
  return equals(take(prefix.length, list), prefix);
});
module.exports = startsWith;
  })();
});

require.register("ramda/src/subtract.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Subtracts its second argument from its first argument.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} a The first value.
 * @param {Number} b The second value.
 * @return {Number} The result of `a - b`.
 * @see R.add
 * @example
 *
 *      R.subtract(10, 8); //=> 2
 *
 *      const minus5 = R.subtract(R.__, 5);
 *      minus5(17); //=> 12
 *
 *      const complementaryAngle = R.subtract(90);
 *      complementaryAngle(30); //=> 60
 *      complementaryAngle(72); //=> 18
 */


var subtract = /*#__PURE__*/_curry2(function subtract(a, b) {
  return Number(a) - Number(b);
});
module.exports = subtract;
  })();
});

require.register("ramda/src/sum.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var add = /*#__PURE__*/require('./add');

var reduce = /*#__PURE__*/require('./reduce');

/**
 * Adds together all the elements of a list.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig [Number] -> Number
 * @param {Array} list An array of numbers
 * @return {Number} The sum of all the numbers in the list.
 * @see R.reduce
 * @example
 *
 *      R.sum([2,4,6,8,100,1]); //=> 121
 */


var sum = /*#__PURE__*/reduce(add, 0);
module.exports = sum;
  })();
});

require.register("ramda/src/symmetricDifference.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var concat = /*#__PURE__*/require('./concat');

var difference = /*#__PURE__*/require('./difference');

/**
 * Finds the set (i.e. no duplicates) of all elements contained in the first or
 * second list, but not both.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Relation
 * @sig [*] -> [*] -> [*]
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The elements in `list1` or `list2`, but not both.
 * @see R.symmetricDifferenceWith, R.difference, R.differenceWith
 * @example
 *
 *      R.symmetricDifference([1,2,3,4], [7,6,5,4,3]); //=> [1,2,7,6,5]
 *      R.symmetricDifference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5,1,2]
 */


var symmetricDifference = /*#__PURE__*/_curry2(function symmetricDifference(list1, list2) {
  return concat(difference(list1, list2), difference(list2, list1));
});
module.exports = symmetricDifference;
  })();
});

require.register("ramda/src/symmetricDifferenceWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var concat = /*#__PURE__*/require('./concat');

var differenceWith = /*#__PURE__*/require('./differenceWith');

/**
 * Finds the set (i.e. no duplicates) of all elements contained in the first or
 * second list, but not both. Duplication is determined according to the value
 * returned by applying the supplied predicate to two list elements.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Relation
 * @sig ((a, a) -> Boolean) -> [a] -> [a] -> [a]
 * @param {Function} pred A predicate used to test whether two items are equal.
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The elements in `list1` or `list2`, but not both.
 * @see R.symmetricDifference, R.difference, R.differenceWith
 * @example
 *
 *      const eqA = R.eqBy(R.prop('a'));
 *      const l1 = [{a: 1}, {a: 2}, {a: 3}, {a: 4}];
 *      const l2 = [{a: 3}, {a: 4}, {a: 5}, {a: 6}];
 *      R.symmetricDifferenceWith(eqA, l1, l2); //=> [{a: 1}, {a: 2}, {a: 5}, {a: 6}]
 */


var symmetricDifferenceWith = /*#__PURE__*/_curry3(function symmetricDifferenceWith(pred, list1, list2) {
  return concat(differenceWith(pred, list1, list2), differenceWith(pred, list2, list1));
});
module.exports = symmetricDifferenceWith;
  })();
});

require.register("ramda/src/tail.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _checkForMethod = /*#__PURE__*/require('./internal/_checkForMethod');

var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var slice = /*#__PURE__*/require('./slice');

/**
 * Returns all but the first element of the given list or string (or object
 * with a `tail` method).
 *
 * Dispatches to the `slice` method of the first argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a]
 * @sig String -> String
 * @param {*} list
 * @return {*}
 * @see R.head, R.init, R.last
 * @example
 *
 *      R.tail([1, 2, 3]);  //=> [2, 3]
 *      R.tail([1, 2]);     //=> [2]
 *      R.tail([1]);        //=> []
 *      R.tail([]);         //=> []
 *
 *      R.tail('abc');  //=> 'bc'
 *      R.tail('ab');   //=> 'b'
 *      R.tail('a');    //=> ''
 *      R.tail('');     //=> ''
 */


var tail = /*#__PURE__*/_curry1( /*#__PURE__*/_checkForMethod('tail', /*#__PURE__*/slice(1, Infinity)));
module.exports = tail;
  })();
});

require.register("ramda/src/take.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xtake = /*#__PURE__*/require('./internal/_xtake');

var slice = /*#__PURE__*/require('./slice');

/**
 * Returns the first `n` elements of the given list, string, or
 * transducer/transformer (or object with a `take` method).
 *
 * Dispatches to the `take` method of the second argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Number -> [a] -> [a]
 * @sig Number -> String -> String
 * @param {Number} n
 * @param {*} list
 * @return {*}
 * @see R.drop
 * @example
 *
 *      R.take(1, ['foo', 'bar', 'baz']); //=> ['foo']
 *      R.take(2, ['foo', 'bar', 'baz']); //=> ['foo', 'bar']
 *      R.take(3, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
 *      R.take(4, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
 *      R.take(3, 'ramda');               //=> 'ram'
 *
 *      const personnel = [
 *        'Dave Brubeck',
 *        'Paul Desmond',
 *        'Eugene Wright',
 *        'Joe Morello',
 *        'Gerry Mulligan',
 *        'Bob Bates',
 *        'Joe Dodge',
 *        'Ron Crotty'
 *      ];
 *
 *      const takeFive = R.take(5);
 *      takeFive(personnel);
 *      //=> ['Dave Brubeck', 'Paul Desmond', 'Eugene Wright', 'Joe Morello', 'Gerry Mulligan']
 * @symb R.take(-1, [a, b]) = [a, b]
 * @symb R.take(0, [a, b]) = []
 * @symb R.take(1, [a, b]) = [a]
 * @symb R.take(2, [a, b]) = [a, b]
 */


var take = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['take'], _xtake, function take(n, xs) {
  return slice(0, n < 0 ? Infinity : n, xs);
}));
module.exports = take;
  })();
});

require.register("ramda/src/takeLast.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var drop = /*#__PURE__*/require('./drop');

/**
 * Returns a new list containing the last `n` elements of the given list.
 * If `n > list.length`, returns a list of `list.length` elements.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig Number -> [a] -> [a]
 * @sig Number -> String -> String
 * @param {Number} n The number of elements to return.
 * @param {Array} xs The collection to consider.
 * @return {Array}
 * @see R.dropLast
 * @example
 *
 *      R.takeLast(1, ['foo', 'bar', 'baz']); //=> ['baz']
 *      R.takeLast(2, ['foo', 'bar', 'baz']); //=> ['bar', 'baz']
 *      R.takeLast(3, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
 *      R.takeLast(4, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
 *      R.takeLast(3, 'ramda');               //=> 'mda'
 */


var takeLast = /*#__PURE__*/_curry2(function takeLast(n, xs) {
  return drop(n >= 0 ? xs.length - n : 0, xs);
});
module.exports = takeLast;
  })();
});

require.register("ramda/src/takeLastWhile.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var slice = /*#__PURE__*/require('./slice');

/**
 * Returns a new list containing the last `n` elements of a given list, passing
 * each value to the supplied predicate function, and terminating when the
 * predicate function returns `false`. Excludes the element that caused the
 * predicate function to fail. The predicate function is passed one argument:
 * *(value)*.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> [a]
 * @sig (a -> Boolean) -> String -> String
 * @param {Function} fn The function called per iteration.
 * @param {Array} xs The collection to iterate over.
 * @return {Array} A new array.
 * @see R.dropLastWhile, R.addIndex
 * @example
 *
 *      const isNotOne = x => x !== 1;
 *
 *      R.takeLastWhile(isNotOne, [1, 2, 3, 4]); //=> [2, 3, 4]
 *
 *      R.takeLastWhile(x => x !== 'R' , 'Ramda'); //=> 'amda'
 */


var takeLastWhile = /*#__PURE__*/_curry2(function takeLastWhile(fn, xs) {
  var idx = xs.length - 1;
  while (idx >= 0 && fn(xs[idx])) {
    idx -= 1;
  }
  return slice(idx + 1, Infinity, xs);
});
module.exports = takeLastWhile;
  })();
});

require.register("ramda/src/takeWhile.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xtakeWhile = /*#__PURE__*/require('./internal/_xtakeWhile');

var slice = /*#__PURE__*/require('./slice');

/**
 * Returns a new list containing the first `n` elements of a given list,
 * passing each value to the supplied predicate function, and terminating when
 * the predicate function returns `false`. Excludes the element that caused the
 * predicate function to fail. The predicate function is passed one argument:
 * *(value)*.
 *
 * Dispatches to the `takeWhile` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> [a]
 * @sig (a -> Boolean) -> String -> String
 * @param {Function} fn The function called per iteration.
 * @param {Array} xs The collection to iterate over.
 * @return {Array} A new array.
 * @see R.dropWhile, R.transduce, R.addIndex
 * @example
 *
 *      const isNotFour = x => x !== 4;
 *
 *      R.takeWhile(isNotFour, [1, 2, 3, 4, 3, 2, 1]); //=> [1, 2, 3]
 *
 *      R.takeWhile(x => x !== 'd' , 'Ramda'); //=> 'Ram'
 */


var takeWhile = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['takeWhile'], _xtakeWhile, function takeWhile(fn, xs) {
  var idx = 0;
  var len = xs.length;
  while (idx < len && fn(xs[idx])) {
    idx += 1;
  }
  return slice(0, idx, xs);
}));
module.exports = takeWhile;
  })();
});

require.register("ramda/src/tap.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _dispatchable = /*#__PURE__*/require('./internal/_dispatchable');

var _xtap = /*#__PURE__*/require('./internal/_xtap');

/**
 * Runs the given function with the supplied object, then returns the object.
 *
 * Acts as a transducer if a transformer is given as second parameter.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (a -> *) -> a -> a
 * @param {Function} fn The function to call with `x`. The return value of `fn` will be thrown away.
 * @param {*} x
 * @return {*} `x`.
 * @example
 *
 *      const sayX = x => console.log('x is ' + x);
 *      R.tap(sayX, 100); //=> 100
 *      // logs 'x is 100'
 * @symb R.tap(f, a) = a
 */


var tap = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable([], _xtap, function tap(fn, x) {
  fn(x);
  return x;
}));
module.exports = tap;
  })();
});

require.register("ramda/src/test.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _cloneRegExp = /*#__PURE__*/require('./internal/_cloneRegExp');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _isRegExp = /*#__PURE__*/require('./internal/_isRegExp');

var toString = /*#__PURE__*/require('./toString');

/**
 * Determines whether a given string matches a given regular expression.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category String
 * @sig RegExp -> String -> Boolean
 * @param {RegExp} pattern
 * @param {String} str
 * @return {Boolean}
 * @see R.match
 * @example
 *
 *      R.test(/^x/, 'xyz'); //=> true
 *      R.test(/^y/, 'xyz'); //=> false
 */


var test = /*#__PURE__*/_curry2(function test(pattern, str) {
  if (!_isRegExp(pattern)) {
    throw new TypeError('‘test’ requires a value of type RegExp as its first argument; received ' + toString(pattern));
  }
  return _cloneRegExp(pattern).test(str);
});
module.exports = test;
  })();
});

require.register("ramda/src/then.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _assertPromise = /*#__PURE__*/require('./internal/_assertPromise');

/**
 * Returns the result of applying the onSuccess function to the value inside
 * a successfully resolved promise. This is useful for working with promises
 * inside function compositions.
 *
 * @func
 * @memberOf R
 * @category Function
 * @sig (a -> b) -> (Promise e a) -> (Promise e b)
 * @sig (a -> (Promise e b)) -> (Promise e a) -> (Promise e b)
 * @param {Function} onSuccess The function to apply. Can return a value or a promise of a value.
 * @param {Promise} p
 * @return {Promise} The result of calling `p.then(onSuccess)`
 * @see R.otherwise
 * @example
 *
 *      var makeQuery = (email) => ({ query: { email }});
 *
 *      //getMemberName :: String -> Promise ({firstName, lastName})
 *      var getMemberName = R.pipe(
 *        makeQuery,
 *        fetchMember,
 *        R.then(R.pick(['firstName', 'lastName']))
 *      );
 */


var then = /*#__PURE__*/_curry2(function then(f, p) {
  _assertPromise('then', p);

  return p.then(f);
});
module.exports = then;
  })();
});

require.register("ramda/src/thunkify.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var curryN = /*#__PURE__*/require('./curryN');

var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Creates a thunk out of a function. A thunk delays a calculation until
 * its result is needed, providing lazy evaluation of arguments.
 *
 * @func
 * @memberOf R
 * @category Function
 * @sig ((a, b, ..., j) -> k) -> (a, b, ..., j) -> (() -> k)
 * @param {Function} fn A function to wrap in a thunk
 * @return {Function} Expects arguments for `fn` and returns a new function
 *  that, when called, applies those arguments to `fn`.
 * @see R.partial, R.partialRight
 * @example
 *
 *      R.thunkify(R.identity)(42)(); //=> 42
 *      R.thunkify((a, b) => a + b)(25, 17)(); //=> 42
 */


var thunkify = /*#__PURE__*/_curry1(function thunkify(fn) {
  return curryN(fn.length, function createThunk() {
    var fnArgs = arguments;
    return function invokeThunk() {
      return fn.apply(this, fnArgs);
    };
  });
});

module.exports = thunkify;
  })();
});

require.register("ramda/src/times.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Calls an input function `n` times, returning an array containing the results
 * of those function calls.
 *
 * `fn` is passed one argument: The current value of `n`, which begins at `0`
 * and is gradually incremented to `n - 1`.
 *
 * @func
 * @memberOf R
 * @since v0.2.3
 * @category List
 * @sig (Number -> a) -> Number -> [a]
 * @param {Function} fn The function to invoke. Passed one argument, the current value of `n`.
 * @param {Number} n A value between `0` and `n - 1`. Increments after each function call.
 * @return {Array} An array containing the return values of all calls to `fn`.
 * @see R.repeat
 * @example
 *
 *      R.times(R.identity, 5); //=> [0, 1, 2, 3, 4]
 * @symb R.times(f, 0) = []
 * @symb R.times(f, 1) = [f(0)]
 * @symb R.times(f, 2) = [f(0), f(1)]
 */


var times = /*#__PURE__*/_curry2(function times(fn, n) {
  var len = Number(n);
  var idx = 0;
  var list;

  if (len < 0 || isNaN(len)) {
    throw new RangeError('n must be a non-negative number');
  }
  list = new Array(len);
  while (idx < len) {
    list[idx] = fn(idx);
    idx += 1;
  }
  return list;
});
module.exports = times;
  })();
});

require.register("ramda/src/toLower.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var invoker = /*#__PURE__*/require('./invoker');

/**
 * The lower case version of a string.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category String
 * @sig String -> String
 * @param {String} str The string to lower case.
 * @return {String} The lower case version of `str`.
 * @see R.toUpper
 * @example
 *
 *      R.toLower('XYZ'); //=> 'xyz'
 */


var toLower = /*#__PURE__*/invoker(0, 'toLowerCase');
module.exports = toLower;
  })();
});

require.register("ramda/src/toPairs.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var _has = /*#__PURE__*/require('./internal/_has');

/**
 * Converts an object into an array of key, value arrays. Only the object's
 * own properties are used.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.4.0
 * @category Object
 * @sig {String: *} -> [[String,*]]
 * @param {Object} obj The object to extract from
 * @return {Array} An array of key, value arrays from the object's own properties.
 * @see R.fromPairs
 * @example
 *
 *      R.toPairs({a: 1, b: 2, c: 3}); //=> [['a', 1], ['b', 2], ['c', 3]]
 */


var toPairs = /*#__PURE__*/_curry1(function toPairs(obj) {
  var pairs = [];
  for (var prop in obj) {
    if (_has(prop, obj)) {
      pairs[pairs.length] = [prop, obj[prop]];
    }
  }
  return pairs;
});
module.exports = toPairs;
  })();
});

require.register("ramda/src/toPairsIn.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Converts an object into an array of key, value arrays. The object's own
 * properties and prototype properties are used. Note that the order of the
 * output array is not guaranteed to be consistent across different JS
 * platforms.
 *
 * @func
 * @memberOf R
 * @since v0.4.0
 * @category Object
 * @sig {String: *} -> [[String,*]]
 * @param {Object} obj The object to extract from
 * @return {Array} An array of key, value arrays from the object's own
 *         and prototype properties.
 * @example
 *
 *      const F = function() { this.x = 'X'; };
 *      F.prototype.y = 'Y';
 *      const f = new F();
 *      R.toPairsIn(f); //=> [['x','X'], ['y','Y']]
 */


var toPairsIn = /*#__PURE__*/_curry1(function toPairsIn(obj) {
  var pairs = [];
  for (var prop in obj) {
    pairs[pairs.length] = [prop, obj[prop]];
  }
  return pairs;
});
module.exports = toPairsIn;
  })();
});

require.register("ramda/src/toString.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var _toString = /*#__PURE__*/require('./internal/_toString');

/**
 * Returns the string representation of the given value. `eval`'ing the output
 * should result in a value equivalent to the input value. Many of the built-in
 * `toString` methods do not satisfy this requirement.
 *
 * If the given value is an `[object Object]` with a `toString` method other
 * than `Object.prototype.toString`, this method is invoked with no arguments
 * to produce the return value. This means user-defined constructor functions
 * can provide a suitable `toString` method. For example:
 *
 *     function Point(x, y) {
 *       this.x = x;
 *       this.y = y;
 *     }
 *
 *     Point.prototype.toString = function() {
 *       return 'new Point(' + this.x + ', ' + this.y + ')';
 *     };
 *
 *     R.toString(new Point(1, 2)); //=> 'new Point(1, 2)'
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category String
 * @sig * -> String
 * @param {*} val
 * @return {String}
 * @example
 *
 *      R.toString(42); //=> '42'
 *      R.toString('abc'); //=> '"abc"'
 *      R.toString([1, 2, 3]); //=> '[1, 2, 3]'
 *      R.toString({foo: 1, bar: 2, baz: 3}); //=> '{"bar": 2, "baz": 3, "foo": 1}'
 *      R.toString(new Date('2001-02-03T04:05:06Z')); //=> 'new Date("2001-02-03T04:05:06.000Z")'
 */


var toString = /*#__PURE__*/_curry1(function toString(val) {
  return _toString(val, []);
});
module.exports = toString;
  })();
});

require.register("ramda/src/toUpper.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var invoker = /*#__PURE__*/require('./invoker');

/**
 * The upper case version of a string.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category String
 * @sig String -> String
 * @param {String} str The string to upper case.
 * @return {String} The upper case version of `str`.
 * @see R.toLower
 * @example
 *
 *      R.toUpper('abc'); //=> 'ABC'
 */


var toUpper = /*#__PURE__*/invoker(0, 'toUpperCase');
module.exports = toUpper;
  })();
});

require.register("ramda/src/transduce.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _reduce = /*#__PURE__*/require('./internal/_reduce');

var _xwrap = /*#__PURE__*/require('./internal/_xwrap');

var curryN = /*#__PURE__*/require('./curryN');

/**
 * Initializes a transducer using supplied iterator function. Returns a single
 * item by iterating through the list, successively calling the transformed
 * iterator function and passing it an accumulator value and the current value
 * from the array, and then passing the result to the next call.
 *
 * The iterator function receives two values: *(acc, value)*. It will be
 * wrapped as a transformer to initialize the transducer. A transformer can be
 * passed directly in place of an iterator function. In both cases, iteration
 * may be stopped early with the [`R.reduced`](#reduced) function.
 *
 * A transducer is a function that accepts a transformer and returns a
 * transformer and can be composed directly.
 *
 * A transformer is an an object that provides a 2-arity reducing iterator
 * function, step, 0-arity initial value function, init, and 1-arity result
 * extraction function, result. The step function is used as the iterator
 * function in reduce. The result function is used to convert the final
 * accumulator into the return type and in most cases is
 * [`R.identity`](#identity). The init function can be used to provide an
 * initial accumulator, but is ignored by transduce.
 *
 * The iteration is performed with [`R.reduce`](#reduce) after initializing the transducer.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category List
 * @sig (c -> c) -> ((a, b) -> a) -> a -> [b] -> a
 * @param {Function} xf The transducer function. Receives a transformer and returns a transformer.
 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
 *        current element from the array. Wrapped as transformer, if necessary, and used to
 *        initialize the transducer
 * @param {*} acc The initial accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.reduce, R.reduced, R.into
 * @example
 *
 *      const numbers = [1, 2, 3, 4];
 *      const transducer = R.compose(R.map(R.add(1)), R.take(2));
 *      R.transduce(transducer, R.flip(R.append), [], numbers); //=> [2, 3]
 *
 *      const isOdd = (x) => x % 2 === 1;
 *      const firstOddTransducer = R.compose(R.filter(isOdd), R.take(1));
 *      R.transduce(firstOddTransducer, R.flip(R.append), [], R.range(0, 100)); //=> [1]
 */


var transduce = /*#__PURE__*/curryN(4, function transduce(xf, fn, acc, list) {
  return _reduce(xf(typeof fn === 'function' ? _xwrap(fn) : fn), acc, list);
});
module.exports = transduce;
  })();
});

require.register("ramda/src/transpose.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Transposes the rows and columns of a 2D list.
 * When passed a list of `n` lists of length `x`,
 * returns a list of `x` lists of length `n`.
 *
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig [[a]] -> [[a]]
 * @param {Array} list A 2D list
 * @return {Array} A 2D list
 * @example
 *
 *      R.transpose([[1, 'a'], [2, 'b'], [3, 'c']]) //=> [[1, 2, 3], ['a', 'b', 'c']]
 *      R.transpose([[1, 2, 3], ['a', 'b', 'c']]) //=> [[1, 'a'], [2, 'b'], [3, 'c']]
 *
 *      // If some of the rows are shorter than the following rows, their elements are skipped:
 *      R.transpose([[10, 11], [20], [], [30, 31, 32]]) //=> [[10, 20, 30], [11, 31], [32]]
 * @symb R.transpose([[a], [b], [c]]) = [a, b, c]
 * @symb R.transpose([[a, b], [c, d]]) = [[a, c], [b, d]]
 * @symb R.transpose([[a, b], [c]]) = [[a, c], [b]]
 */


var transpose = /*#__PURE__*/_curry1(function transpose(outerlist) {
  var i = 0;
  var result = [];
  while (i < outerlist.length) {
    var innerlist = outerlist[i];
    var j = 0;
    while (j < innerlist.length) {
      if (typeof result[j] === 'undefined') {
        result[j] = [];
      }
      result[j].push(innerlist[j]);
      j += 1;
    }
    i += 1;
  }
  return result;
});
module.exports = transpose;
  })();
});

require.register("ramda/src/traverse.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var map = /*#__PURE__*/require('./map');

var sequence = /*#__PURE__*/require('./sequence');

/**
 * Maps an [Applicative](https://github.com/fantasyland/fantasy-land#applicative)-returning
 * function over a [Traversable](https://github.com/fantasyland/fantasy-land#traversable),
 * then uses [`sequence`](#sequence) to transform the resulting Traversable of Applicative
 * into an Applicative of Traversable.
 *
 * Dispatches to the `traverse` method of the third argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig (Applicative f, Traversable t) => (a -> f a) -> (a -> f b) -> t a -> f (t b)
 * @param {Function} of
 * @param {Function} f
 * @param {*} traversable
 * @return {*}
 * @see R.sequence
 * @example
 *
 *      // Returns `Maybe.Nothing` if the given divisor is `0`
 *      const safeDiv = n => d => d === 0 ? Maybe.Nothing() : Maybe.Just(n / d)
 *
 *      R.traverse(Maybe.of, safeDiv(10), [2, 4, 5]); //=> Maybe.Just([5, 2.5, 2])
 *      R.traverse(Maybe.of, safeDiv(10), [2, 0, 5]); //=> Maybe.Nothing
 */


var traverse = /*#__PURE__*/_curry3(function traverse(of, f, traversable) {
  return typeof traversable['fantasy-land/traverse'] === 'function' ? traversable['fantasy-land/traverse'](f, of) : sequence(of, map(f, traversable));
});
module.exports = traverse;
  })();
});

require.register("ramda/src/trim.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' + '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' + '\u2029\uFEFF';
var zeroWidth = '\u200b';
var hasProtoTrim = typeof String.prototype.trim === 'function';
/**
 * Removes (strips) whitespace from both ends of the string.
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category String
 * @sig String -> String
 * @param {String} str The string to trim.
 * @return {String} Trimmed version of `str`.
 * @example
 *
 *      R.trim('   xyz  '); //=> 'xyz'
 *      R.map(R.trim, R.split(',', 'x, y, z')); //=> ['x', 'y', 'z']
 */
var trim = !hasProtoTrim || /*#__PURE__*/ws.trim() || ! /*#__PURE__*/zeroWidth.trim() ? /*#__PURE__*/_curry1(function trim(str) {
  var beginRx = new RegExp('^[' + ws + '][' + ws + ']*');
  var endRx = new RegExp('[' + ws + '][' + ws + ']*$');
  return str.replace(beginRx, '').replace(endRx, '');
}) : /*#__PURE__*/_curry1(function trim(str) {
  return str.trim();
});
module.exports = trim;
  })();
});

require.register("ramda/src/tryCatch.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _arity = /*#__PURE__*/require('./internal/_arity');

var _concat = /*#__PURE__*/require('./internal/_concat');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * `tryCatch` takes two functions, a `tryer` and a `catcher`. The returned
 * function evaluates the `tryer`; if it does not throw, it simply returns the
 * result. If the `tryer` *does* throw, the returned function evaluates the
 * `catcher` function and returns its result. Note that for effective
 * composition with this function, both the `tryer` and `catcher` functions
 * must return the same type of results.
 *
 * @func
 * @memberOf R
 * @since v0.20.0
 * @category Function
 * @sig (...x -> a) -> ((e, ...x) -> a) -> (...x -> a)
 * @param {Function} tryer The function that may throw.
 * @param {Function} catcher The function that will be evaluated if `tryer` throws.
 * @return {Function} A new function that will catch exceptions and send then to the catcher.
 * @example
 *
 *      R.tryCatch(R.prop('x'), R.F)({x: true}); //=> true
 *      R.tryCatch(() => { throw 'foo'}, R.always('catched'))('bar') // => 'catched'
 *      R.tryCatch(R.times(R.identity), R.always([]))('s') // => []
 `` */


var tryCatch = /*#__PURE__*/_curry2(function _tryCatch(tryer, catcher) {
  return _arity(tryer.length, function () {
    try {
      return tryer.apply(this, arguments);
    } catch (e) {
      return catcher.apply(this, _concat([e], arguments));
    }
  });
});
module.exports = tryCatch;
  })();
});

require.register("ramda/src/type.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Gives a single-word string description of the (native) type of a value,
 * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
 * attempt to distinguish user Object types any further, reporting them all as
 * 'Object'.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Type
 * @sig (* -> {*}) -> String
 * @param {*} val The value to test
 * @return {String}
 * @example
 *
 *      R.type({}); //=> "Object"
 *      R.type(1); //=> "Number"
 *      R.type(false); //=> "Boolean"
 *      R.type('s'); //=> "String"
 *      R.type(null); //=> "Null"
 *      R.type([]); //=> "Array"
 *      R.type(/[A-z]/); //=> "RegExp"
 *      R.type(() => {}); //=> "Function"
 *      R.type(undefined); //=> "Undefined"
 */


var type = /*#__PURE__*/_curry1(function type(val) {
  return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
});
module.exports = type;
  })();
});

require.register("ramda/src/unapply.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Takes a function `fn`, which takes a single array argument, and returns a
 * function which:
 *
 *   - takes any number of positional arguments;
 *   - passes these arguments to `fn` as an array; and
 *   - returns the result.
 *
 * In other words, `R.unapply` derives a variadic function from a function which
 * takes an array. `R.unapply` is the inverse of [`R.apply`](#apply).
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Function
 * @sig ([*...] -> a) -> (*... -> a)
 * @param {Function} fn
 * @return {Function}
 * @see R.apply
 * @example
 *
 *      R.unapply(JSON.stringify)(1, 2, 3); //=> '[1,2,3]'
 * @symb R.unapply(f)(a, b) = f([a, b])
 */


var unapply = /*#__PURE__*/_curry1(function unapply(fn) {
  return function () {
    return fn(Array.prototype.slice.call(arguments, 0));
  };
});
module.exports = unapply;
  })();
});

require.register("ramda/src/unary.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var nAry = /*#__PURE__*/require('./nAry');

/**
 * Wraps a function of any arity (including nullary) in a function that accepts
 * exactly 1 parameter. Any extraneous parameters will not be passed to the
 * supplied function.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category Function
 * @sig (* -> b) -> (a -> b)
 * @param {Function} fn The function to wrap.
 * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
 *         arity 1.
 * @see R.binary, R.nAry
 * @example
 *
 *      const takesTwoArgs = function(a, b) {
 *        return [a, b];
 *      };
 *      takesTwoArgs.length; //=> 2
 *      takesTwoArgs(1, 2); //=> [1, 2]
 *
 *      const takesOneArg = R.unary(takesTwoArgs);
 *      takesOneArg.length; //=> 1
 *      // Only 1 argument is passed to the wrapped function
 *      takesOneArg(1, 2); //=> [1, undefined]
 * @symb R.unary(f)(a, b, c) = f(a)
 */


var unary = /*#__PURE__*/_curry1(function unary(fn) {
  return nAry(1, fn);
});
module.exports = unary;
  })();
});

require.register("ramda/src/uncurryN.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var curryN = /*#__PURE__*/require('./curryN');

/**
 * Returns a function of arity `n` from a (manually) curried function.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category Function
 * @sig Number -> (a -> b) -> (a -> c)
 * @param {Number} length The arity for the returned function.
 * @param {Function} fn The function to uncurry.
 * @return {Function} A new function.
 * @see R.curry
 * @example
 *
 *      const addFour = a => b => c => d => a + b + c + d;
 *
 *      const uncurriedAddFour = R.uncurryN(4, addFour);
 *      uncurriedAddFour(1, 2, 3, 4); //=> 10
 */


var uncurryN = /*#__PURE__*/_curry2(function uncurryN(depth, fn) {
  return curryN(depth, function () {
    var currentDepth = 1;
    var value = fn;
    var idx = 0;
    var endIdx;
    while (currentDepth <= depth && typeof value === 'function') {
      endIdx = currentDepth === depth ? arguments.length : idx + value.length;
      value = value.apply(this, Array.prototype.slice.call(arguments, idx, endIdx));
      currentDepth += 1;
      idx = endIdx;
    }
    return value;
  });
});
module.exports = uncurryN;
  })();
});

require.register("ramda/src/unfold.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Builds a list from a seed value. Accepts an iterator function, which returns
 * either false to stop iteration or an array of length 2 containing the value
 * to add to the resulting list and the seed to be used in the next call to the
 * iterator function.
 *
 * The iterator function receives one argument: *(seed)*.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category List
 * @sig (a -> [b]) -> * -> [b]
 * @param {Function} fn The iterator function. receives one argument, `seed`, and returns
 *        either false to quit iteration or an array of length two to proceed. The element
 *        at index 0 of this array will be added to the resulting array, and the element
 *        at index 1 will be passed to the next call to `fn`.
 * @param {*} seed The seed value.
 * @return {Array} The final list.
 * @example
 *
 *      const f = n => n > 50 ? false : [-n, n + 10];
 *      R.unfold(f, 10); //=> [-10, -20, -30, -40, -50]
 * @symb R.unfold(f, x) = [f(x)[0], f(f(x)[1])[0], f(f(f(x)[1])[1])[0], ...]
 */


var unfold = /*#__PURE__*/_curry2(function unfold(fn, seed) {
  var pair = fn(seed);
  var result = [];
  while (pair && pair.length) {
    result[result.length] = pair[0];
    pair = fn(pair[1]);
  }
  return result;
});
module.exports = unfold;
  })();
});

require.register("ramda/src/union.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _concat = /*#__PURE__*/require('./internal/_concat');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var compose = /*#__PURE__*/require('./compose');

var uniq = /*#__PURE__*/require('./uniq');

/**
 * Combines two lists into a set (i.e. no duplicates) composed of the elements
 * of each list.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig [*] -> [*] -> [*]
 * @param {Array} as The first list.
 * @param {Array} bs The second list.
 * @return {Array} The first and second lists concatenated, with
 *         duplicates removed.
 * @example
 *
 *      R.union([1, 2, 3], [2, 3, 4]); //=> [1, 2, 3, 4]
 */


var union = /*#__PURE__*/_curry2( /*#__PURE__*/compose(uniq, _concat));
module.exports = union;
  })();
});

require.register("ramda/src/unionWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _concat = /*#__PURE__*/require('./internal/_concat');

var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var uniqWith = /*#__PURE__*/require('./uniqWith');

/**
 * Combines two lists into a set (i.e. no duplicates) composed of the elements
 * of each list. Duplication is determined according to the value returned by
 * applying the supplied predicate to two list elements.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig ((a, a) -> Boolean) -> [*] -> [*] -> [*]
 * @param {Function} pred A predicate used to test whether two items are equal.
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The first and second lists concatenated, with
 *         duplicates removed.
 * @see R.union
 * @example
 *
 *      const l1 = [{a: 1}, {a: 2}];
 *      const l2 = [{a: 1}, {a: 4}];
 *      R.unionWith(R.eqBy(R.prop('a')), l1, l2); //=> [{a: 1}, {a: 2}, {a: 4}]
 */


var unionWith = /*#__PURE__*/_curry3(function unionWith(pred, list1, list2) {
  return uniqWith(pred, _concat(list1, list2));
});
module.exports = unionWith;
  })();
});

require.register("ramda/src/uniq.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var identity = /*#__PURE__*/require('./identity');

var uniqBy = /*#__PURE__*/require('./uniqBy');

/**
 * Returns a new list containing only one copy of each element in the original
 * list. [`R.equals`](#equals) is used to determine equality.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a]
 * @param {Array} list The array to consider.
 * @return {Array} The list of unique items.
 * @example
 *
 *      R.uniq([1, 1, 2, 1]); //=> [1, 2]
 *      R.uniq([1, '1']);     //=> [1, '1']
 *      R.uniq([[42], [42]]); //=> [[42]]
 */


var uniq = /*#__PURE__*/uniqBy(identity);
module.exports = uniq;
  })();
});

require.register("ramda/src/uniqBy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _Set = /*#__PURE__*/require('./internal/_Set');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns a new list containing only one copy of each element in the original
 * list, based upon the value returned by applying the supplied function to
 * each list element. Prefers the first item if the supplied function produces
 * the same value on two items. [`R.equals`](#equals) is used for comparison.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig (a -> b) -> [a] -> [a]
 * @param {Function} fn A function used to produce a value to use during comparisons.
 * @param {Array} list The array to consider.
 * @return {Array} The list of unique items.
 * @example
 *
 *      R.uniqBy(Math.abs, [-1, -5, 2, 10, 1, 2]); //=> [-1, -5, 2, 10]
 */


var uniqBy = /*#__PURE__*/_curry2(function uniqBy(fn, list) {
  var set = new _Set();
  var result = [];
  var idx = 0;
  var appliedItem, item;

  while (idx < list.length) {
    item = list[idx];
    appliedItem = fn(item);
    if (set.add(appliedItem)) {
      result.push(item);
    }
    idx += 1;
  }
  return result;
});
module.exports = uniqBy;
  })();
});

require.register("ramda/src/uniqWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _includesWith = /*#__PURE__*/require('./internal/_includesWith');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Returns a new list containing only one copy of each element in the original
 * list, based upon the value returned by applying the supplied predicate to
 * two list elements. Prefers the first item if two items compare equal based
 * on the predicate.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category List
 * @sig ((a, a) -> Boolean) -> [a] -> [a]
 * @param {Function} pred A predicate used to test whether two items are equal.
 * @param {Array} list The array to consider.
 * @return {Array} The list of unique items.
 * @example
 *
 *      const strEq = R.eqBy(String);
 *      R.uniqWith(strEq)([1, '1', 2, 1]); //=> [1, 2]
 *      R.uniqWith(strEq)([{}, {}]);       //=> [{}]
 *      R.uniqWith(strEq)([1, '1', 1]);    //=> [1]
 *      R.uniqWith(strEq)(['1', 1, 1]);    //=> ['1']
 */


var uniqWith = /*#__PURE__*/_curry2(function uniqWith(pred, list) {
  var idx = 0;
  var len = list.length;
  var result = [];
  var item;
  while (idx < len) {
    item = list[idx];
    if (!_includesWith(pred, item, result)) {
      result[result.length] = item;
    }
    idx += 1;
  }
  return result;
});
module.exports = uniqWith;
  })();
});

require.register("ramda/src/unless.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Tests the final argument by passing it to the given predicate function. If
 * the predicate is not satisfied, the function will return the result of
 * calling the `whenFalseFn` function with the same argument. If the predicate
 * is satisfied, the argument is returned as is.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category Logic
 * @sig (a -> Boolean) -> (a -> a) -> a -> a
 * @param {Function} pred        A predicate function
 * @param {Function} whenFalseFn A function to invoke when the `pred` evaluates
 *                               to a falsy value.
 * @param {*}        x           An object to test with the `pred` function and
 *                               pass to `whenFalseFn` if necessary.
 * @return {*} Either `x` or the result of applying `x` to `whenFalseFn`.
 * @see R.ifElse, R.when, R.cond
 * @example
 *
 *      let safeInc = R.unless(R.isNil, R.inc);
 *      safeInc(null); //=> null
 *      safeInc(1); //=> 2
 */


var unless = /*#__PURE__*/_curry3(function unless(pred, whenFalseFn, x) {
  return pred(x) ? x : whenFalseFn(x);
});
module.exports = unless;
  })();
});

require.register("ramda/src/unnest.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _identity = /*#__PURE__*/require('./internal/_identity');

var chain = /*#__PURE__*/require('./chain');

/**
 * Shorthand for `R.chain(R.identity)`, which removes one level of nesting from
 * any [Chain](https://github.com/fantasyland/fantasy-land#chain).
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig Chain c => c (c a) -> c a
 * @param {*} list
 * @return {*}
 * @see R.flatten, R.chain
 * @example
 *
 *      R.unnest([1, [2], [[3]]]); //=> [1, 2, [3]]
 *      R.unnest([[1, 2], [3, 4], [5, 6]]); //=> [1, 2, 3, 4, 5, 6]
 */


var unnest = /*#__PURE__*/chain(_identity);
module.exports = unnest;
  })();
});

require.register("ramda/src/until.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Takes a predicate, a transformation function, and an initial value,
 * and returns a value of the same type as the initial value.
 * It does so by applying the transformation until the predicate is satisfied,
 * at which point it returns the satisfactory value.
 *
 * @func
 * @memberOf R
 * @since v0.20.0
 * @category Logic
 * @sig (a -> Boolean) -> (a -> a) -> a -> a
 * @param {Function} pred A predicate function
 * @param {Function} fn The iterator function
 * @param {*} init Initial value
 * @return {*} Final value that satisfies predicate
 * @example
 *
 *      R.until(R.gt(R.__, 100), R.multiply(2))(1) // => 128
 */


var until = /*#__PURE__*/_curry3(function until(pred, fn, init) {
  var val = init;
  while (!pred(val)) {
    val = fn(val);
  }
  return val;
});
module.exports = until;
  })();
});

require.register("ramda/src/update.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

var adjust = /*#__PURE__*/require('./adjust');

var always = /*#__PURE__*/require('./always');

/**
 * Returns a new copy of the array with the element at the provided index
 * replaced with the given value.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category List
 * @sig Number -> a -> [a] -> [a]
 * @param {Number} idx The index to update.
 * @param {*} x The value to exist at the given index of the returned array.
 * @param {Array|Arguments} list The source array-like object to be updated.
 * @return {Array} A copy of `list` with the value at index `idx` replaced with `x`.
 * @see R.adjust
 * @example
 *
 *      R.update(1, '_', ['a', 'b', 'c']);      //=> ['a', '_', 'c']
 *      R.update(-1, '_', ['a', 'b', 'c']);     //=> ['a', 'b', '_']
 * @symb R.update(-1, a, [b, c]) = [b, a]
 * @symb R.update(0, a, [b, c]) = [a, c]
 * @symb R.update(1, a, [b, c]) = [b, a]
 */


var update = /*#__PURE__*/_curry3(function update(idx, x, list) {
  return adjust(idx, always(x), list);
});
module.exports = update;
  })();
});

require.register("ramda/src/useWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var curryN = /*#__PURE__*/require('./curryN');

/**
 * Accepts a function `fn` and a list of transformer functions and returns a
 * new curried function. When the new function is invoked, it calls the
 * function `fn` with parameters consisting of the result of calling each
 * supplied handler on successive arguments to the new function.
 *
 * If more arguments are passed to the returned function than transformer
 * functions, those arguments are passed directly to `fn` as additional
 * parameters. If you expect additional arguments that don't need to be
 * transformed, although you can ignore them, it's best to pass an identity
 * function so that the new function reports the correct arity.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((x1, x2, ...) -> z) -> [(a -> x1), (b -> x2), ...] -> (a -> b -> ... -> z)
 * @param {Function} fn The function to wrap.
 * @param {Array} transformers A list of transformer functions
 * @return {Function} The wrapped function.
 * @see R.converge
 * @example
 *
 *      R.useWith(Math.pow, [R.identity, R.identity])(3, 4); //=> 81
 *      R.useWith(Math.pow, [R.identity, R.identity])(3)(4); //=> 81
 *      R.useWith(Math.pow, [R.dec, R.inc])(3, 4); //=> 32
 *      R.useWith(Math.pow, [R.dec, R.inc])(3)(4); //=> 32
 * @symb R.useWith(f, [g, h])(a, b) = f(g(a), h(b))
 */


var useWith = /*#__PURE__*/_curry2(function useWith(fn, transformers) {
  return curryN(transformers.length, function () {
    var args = [];
    var idx = 0;
    while (idx < transformers.length) {
      args.push(transformers[idx].call(this, arguments[idx]));
      idx += 1;
    }
    return fn.apply(this, args.concat(Array.prototype.slice.call(arguments, transformers.length)));
  });
});
module.exports = useWith;
  })();
});

require.register("ramda/src/values.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

var keys = /*#__PURE__*/require('./keys');

/**
 * Returns a list of all the enumerable own properties of the supplied object.
 * Note that the order of the output array is not guaranteed across different
 * JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [v]
 * @param {Object} obj The object to extract values from
 * @return {Array} An array of the values of the object's own properties.
 * @see R.valuesIn, R.keys
 * @example
 *
 *      R.values({a: 1, b: 2, c: 3}); //=> [1, 2, 3]
 */


var values = /*#__PURE__*/_curry1(function values(obj) {
  var props = keys(obj);
  var len = props.length;
  var vals = [];
  var idx = 0;
  while (idx < len) {
    vals[idx] = obj[props[idx]];
    idx += 1;
  }
  return vals;
});
module.exports = values;
  })();
});

require.register("ramda/src/valuesIn.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry1 = /*#__PURE__*/require('./internal/_curry1');

/**
 * Returns a list of all the properties, including prototype properties, of the
 * supplied object.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category Object
 * @sig {k: v} -> [v]
 * @param {Object} obj The object to extract values from
 * @return {Array} An array of the values of the object's own and prototype properties.
 * @see R.values, R.keysIn
 * @example
 *
 *      const F = function() { this.x = 'X'; };
 *      F.prototype.y = 'Y';
 *      const f = new F();
 *      R.valuesIn(f); //=> ['X', 'Y']
 */


var valuesIn = /*#__PURE__*/_curry1(function valuesIn(obj) {
  var prop;
  var vs = [];
  for (prop in obj) {
    vs[vs.length] = obj[prop];
  }
  return vs;
});
module.exports = valuesIn;
  })();
});

require.register("ramda/src/view.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

// `Const` is a functor that effectively ignores the function given to `map`.


var Const = function (x) {
  return { value: x, 'fantasy-land/map': function () {
      return this;
    } };
};

/**
 * Returns a "view" of the given data structure, determined by the given lens.
 * The lens's focus determines which portion of the data structure is visible.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category Object
 * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
 * @sig Lens s a -> s -> a
 * @param {Lens} lens
 * @param {*} x
 * @return {*}
 * @see R.prop, R.lensIndex, R.lensProp
 * @example
 *
 *      const xLens = R.lensProp('x');
 *
 *      R.view(xLens, {x: 1, y: 2});  //=> 1
 *      R.view(xLens, {x: 4, y: 2});  //=> 4
 */
var view = /*#__PURE__*/_curry2(function view(lens, x) {
  // Using `Const` effectively ignores the setter function of the `lens`,
  // leaving the value returned by the getter function unmodified.
  return lens(Const)(x).value;
});
module.exports = view;
  })();
});

require.register("ramda/src/when.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Tests the final argument by passing it to the given predicate function. If
 * the predicate is satisfied, the function will return the result of calling
 * the `whenTrueFn` function with the same argument. If the predicate is not
 * satisfied, the argument is returned as is.
 *
 * @func
 * @memberOf R
 * @since v0.18.0
 * @category Logic
 * @sig (a -> Boolean) -> (a -> a) -> a -> a
 * @param {Function} pred       A predicate function
 * @param {Function} whenTrueFn A function to invoke when the `condition`
 *                              evaluates to a truthy value.
 * @param {*}        x          An object to test with the `pred` function and
 *                              pass to `whenTrueFn` if necessary.
 * @return {*} Either `x` or the result of applying `x` to `whenTrueFn`.
 * @see R.ifElse, R.unless, R.cond
 * @example
 *
 *      // truncate :: String -> String
 *      const truncate = R.when(
 *        R.propSatisfies(R.gt(R.__, 10), 'length'),
 *        R.pipe(R.take(10), R.append('…'), R.join(''))
 *      );
 *      truncate('12345');         //=> '12345'
 *      truncate('0123456789ABC'); //=> '0123456789…'
 */


var when = /*#__PURE__*/_curry3(function when(pred, whenTrueFn, x) {
  return pred(x) ? whenTrueFn(x) : x;
});
module.exports = when;
  })();
});

require.register("ramda/src/where.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var _has = /*#__PURE__*/require('./internal/_has');

/**
 * Takes a spec object and a test object; returns true if the test satisfies
 * the spec. Each of the spec's own properties must be a predicate function.
 * Each predicate is applied to the value of the corresponding property of the
 * test object. `where` returns true if all the predicates return true, false
 * otherwise.
 *
 * `where` is well suited to declaratively expressing constraints for other
 * functions such as [`filter`](#filter) and [`find`](#find).
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category Object
 * @sig {String: (* -> Boolean)} -> {String: *} -> Boolean
 * @param {Object} spec
 * @param {Object} testObj
 * @return {Boolean}
 * @see R.propSatisfies, R.whereEq
 * @example
 *
 *      // pred :: Object -> Boolean
 *      const pred = R.where({
 *        a: R.equals('foo'),
 *        b: R.complement(R.equals('bar')),
 *        x: R.gt(R.__, 10),
 *        y: R.lt(R.__, 20)
 *      });
 *
 *      pred({a: 'foo', b: 'xxx', x: 11, y: 19}); //=> true
 *      pred({a: 'xxx', b: 'xxx', x: 11, y: 19}); //=> false
 *      pred({a: 'foo', b: 'bar', x: 11, y: 19}); //=> false
 *      pred({a: 'foo', b: 'xxx', x: 10, y: 19}); //=> false
 *      pred({a: 'foo', b: 'xxx', x: 11, y: 20}); //=> false
 */


var where = /*#__PURE__*/_curry2(function where(spec, testObj) {
  for (var prop in spec) {
    if (_has(prop, spec) && !spec[prop](testObj[prop])) {
      return false;
    }
  }
  return true;
});
module.exports = where;
  })();
});

require.register("ramda/src/whereEq.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var equals = /*#__PURE__*/require('./equals');

var map = /*#__PURE__*/require('./map');

var where = /*#__PURE__*/require('./where');

/**
 * Takes a spec object and a test object; returns true if the test satisfies
 * the spec, false otherwise. An object satisfies the spec if, for each of the
 * spec's own properties, accessing that property of the object gives the same
 * value (in [`R.equals`](#equals) terms) as accessing that property of the
 * spec.
 *
 * `whereEq` is a specialization of [`where`](#where).
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category Object
 * @sig {String: *} -> {String: *} -> Boolean
 * @param {Object} spec
 * @param {Object} testObj
 * @return {Boolean}
 * @see R.propEq, R.where
 * @example
 *
 *      // pred :: Object -> Boolean
 *      const pred = R.whereEq({a: 1, b: 2});
 *
 *      pred({a: 1});              //=> false
 *      pred({a: 1, b: 2});        //=> true
 *      pred({a: 1, b: 2, c: 3});  //=> true
 *      pred({a: 1, b: 1});        //=> false
 */


var whereEq = /*#__PURE__*/_curry2(function whereEq(spec, testObj) {
  return where(map(equals, spec), testObj);
});
module.exports = whereEq;
  })();
});

require.register("ramda/src/without.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _includes = /*#__PURE__*/require('./internal/_includes');

var _curry2 = /*#__PURE__*/require('./internal/_curry2');

var flip = /*#__PURE__*/require('./flip');

var reject = /*#__PURE__*/require('./reject');

/**
 * Returns a new list without values in the first argument.
 * [`R.equals`](#equals) is used to determine equality.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig [a] -> [a] -> [a]
 * @param {Array} list1 The values to be removed from `list2`.
 * @param {Array} list2 The array to remove values from.
 * @return {Array} The new array without values in `list1`.
 * @see R.transduce, R.difference, R.remove
 * @example
 *
 *      R.without([1, 2], [1, 2, 1, 3, 4]); //=> [3, 4]
 */


var without = /*#__PURE__*/_curry2(function (xs, list) {
  return reject(flip(_includes)(xs), list);
});
module.exports = without;
  })();
});

require.register("ramda/src/xprod.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Creates a new list out of the two supplied by creating each possible pair
 * from the lists.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [b] -> [[a,b]]
 * @param {Array} as The first list.
 * @param {Array} bs The second list.
 * @return {Array} The list made by combining each possible pair from
 *         `as` and `bs` into pairs (`[a, b]`).
 * @example
 *
 *      R.xprod([1, 2], ['a', 'b']); //=> [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
 * @symb R.xprod([a, b], [c, d]) = [[a, c], [a, d], [b, c], [b, d]]
 */


var xprod = /*#__PURE__*/_curry2(function xprod(a, b) {
  // = xprodWith(prepend); (takes about 3 times as long...)
  var idx = 0;
  var ilen = a.length;
  var j;
  var jlen = b.length;
  var result = [];
  while (idx < ilen) {
    j = 0;
    while (j < jlen) {
      result[result.length] = [a[idx], b[j]];
      j += 1;
    }
    idx += 1;
  }
  return result;
});
module.exports = xprod;
  })();
});

require.register("ramda/src/zip.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Creates a new list out of the two supplied by pairing up equally-positioned
 * items from both lists. The returned list is truncated to the length of the
 * shorter of the two input lists.
 * Note: `zip` is equivalent to `zipWith(function(a, b) { return [a, b] })`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [b] -> [[a,b]]
 * @param {Array} list1 The first array to consider.
 * @param {Array} list2 The second array to consider.
 * @return {Array} The list made by pairing up same-indexed elements of `list1` and `list2`.
 * @example
 *
 *      R.zip([1, 2, 3], ['a', 'b', 'c']); //=> [[1, 'a'], [2, 'b'], [3, 'c']]
 * @symb R.zip([a, b, c], [d, e, f]) = [[a, d], [b, e], [c, f]]
 */


var zip = /*#__PURE__*/_curry2(function zip(a, b) {
  var rv = [];
  var idx = 0;
  var len = Math.min(a.length, b.length);
  while (idx < len) {
    rv[idx] = [a[idx], b[idx]];
    idx += 1;
  }
  return rv;
});
module.exports = zip;
  })();
});

require.register("ramda/src/zipObj.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry2 = /*#__PURE__*/require('./internal/_curry2');

/**
 * Creates a new object out of a list of keys and a list of values.
 * Key/value pairing is truncated to the length of the shorter of the two lists.
 * Note: `zipObj` is equivalent to `pipe(zip, fromPairs)`.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig [String] -> [*] -> {String: *}
 * @param {Array} keys The array that will be properties on the output object.
 * @param {Array} values The list of values on the output object.
 * @return {Object} The object made by pairing up same-indexed elements of `keys` and `values`.
 * @example
 *
 *      R.zipObj(['a', 'b', 'c'], [1, 2, 3]); //=> {a: 1, b: 2, c: 3}
 */


var zipObj = /*#__PURE__*/_curry2(function zipObj(keys, values) {
  var idx = 0;
  var len = Math.min(keys.length, values.length);
  var out = {};
  while (idx < len) {
    out[keys[idx]] = values[idx];
    idx += 1;
  }
  return out;
});
module.exports = zipObj;
  })();
});

require.register("ramda/src/zipWith.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ramda");
  (function() {
    var _curry3 = /*#__PURE__*/require('./internal/_curry3');

/**
 * Creates a new list out of the two supplied by applying the function to each
 * equally-positioned pair in the lists. The returned list is truncated to the
 * length of the shorter of the two input lists.
 *
 * @function
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig ((a, b) -> c) -> [a] -> [b] -> [c]
 * @param {Function} fn The function used to combine the two elements into one value.
 * @param {Array} list1 The first array to consider.
 * @param {Array} list2 The second array to consider.
 * @return {Array} The list made by combining same-indexed elements of `list1` and `list2`
 *         using `fn`.
 * @example
 *
 *      const f = (x, y) => {
 *        // ...
 *      };
 *      R.zipWith(f, [1, 2, 3], ['a', 'b', 'c']);
 *      //=> [f(1, 'a'), f(2, 'b'), f(3, 'c')]
 * @symb R.zipWith(fn, [a, b, c], [d, e, f]) = [fn(a, d), fn(b, e), fn(c, f)]
 */


var zipWith = /*#__PURE__*/_curry3(function zipWith(fn, a, b) {
  var rv = [];
  var idx = 0;
  var len = Math.min(a.length, b.length);
  while (idx < len) {
    rv[idx] = fn(a[idx], b[idx]);
    idx += 1;
  }
  return rv;
});
module.exports = zipWith;
  })();
});
require.alias(".pnpm/registry.npmjs.org/process/0.11.10/node_modules/process/browser.js", ".pnpm/registry.npmjs.org/process/0.11.10/node_modules/process");
require.alias("daggy/src/daggy.js", "daggy");
require.alias("data.either/lib/index.js", "data.either");
require.alias("data.maybe/lib/index.js", "data.maybe");
require.alias("data.task/lib/index.js", "data.task");
require.alias("data.validation/lib/index.js", "data.validation");
require.alias("mithril-stream/stream.js", "mithril-stream");
require.alias("moment/moment.js", "moment");
require.alias(".pnpm/registry.npmjs.org/process/0.11.10/node_modules/process/browser.js", "process");
require.alias("ramda/src/index.js", "ramda");process = require('process');require.register("___globals___", function(exports, require, module) {
  

// Auto-loaded modules from config.npm.globals.
window.m = require("mithril");
window.Stream = require("mithril-stream");


});})();require('___globals___');

"use strict";

/* jshint ignore:start */
(function () {
  var WebSocket = window.WebSocket || window.MozWebSocket;
  var br = window.brunch = window.brunch || {};
  var ar = br['auto-reload'] = br['auto-reload'] || {};
  if (!WebSocket || ar.disabled) return;
  if (window._ar) return;
  window._ar = true;

  var cacheBuster = function cacheBuster(url) {
    var date = Math.round(Date.now() / 1000).toString();
    url = url.replace(/(\&|\\?)cacheBuster=\d*/, '');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'cacheBuster=' + date;
  };

  var browser = navigator.userAgent.toLowerCase();
  var forceRepaint = ar.forceRepaint || browser.indexOf('chrome') > -1;
  var reloaders = {
    page: function page() {
      window.location.reload(true);
    },
    stylesheet: function stylesheet() {
      [].slice.call(document.querySelectorAll('link[rel=stylesheet]')).filter(function (link) {
        var val = link.getAttribute('data-autoreload');
        return link.href && val != 'false';
      }).forEach(function (link) {
        link.href = cacheBuster(link.href);
      }); // Hack to force page repaint after 25ms.

      if (forceRepaint) setTimeout(function () {
        document.body.offsetHeight;
      }, 25);
    },
    javascript: function javascript() {
      var scripts = [].slice.call(document.querySelectorAll('script'));
      var textScripts = scripts.map(function (script) {
        return script.text;
      }).filter(function (text) {
        return text.length > 0;
      });
      var srcScripts = scripts.filter(function (script) {
        return script.src;
      });
      var loaded = 0;
      var all = srcScripts.length;

      var onLoad = function onLoad() {
        loaded = loaded + 1;

        if (loaded === all) {
          textScripts.forEach(function (script) {
            eval(script);
          });
        }
      };

      srcScripts.forEach(function (script) {
        var src = script.src;
        script.remove();
        var newScript = document.createElement('script');
        newScript.src = cacheBuster(src);
        newScript.async = true;
        newScript.onload = onLoad;
        document.head.appendChild(newScript);
      });
    }
  };
  var port = ar.port || 9485;
  var host = br.server || window.location.hostname || 'localhost';

  var connect = function connect() {
    var connection = new WebSocket('ws://' + host + ':' + port);

    connection.onmessage = function (event) {
      if (ar.disabled) return;
      var message = event.data;
      var reloader = reloaders[message] || reloaders.page;
      reloader();
    };

    connection.onerror = function () {
      if (connection.readyState) connection.close();
    };

    connection.onclose = function () {
      window.setTimeout(connect, 1000);
    };
  };

  connect();
})();
/* jshint ignore:end */
;
//# sourceMappingURL=vendor.js.map