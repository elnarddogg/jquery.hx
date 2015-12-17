import {
  $_map,
  $_last,
  $_each,
  $_is,
  $_defineValues,
  $_defineGetters,
  $_string,
  $_extend,
  $_precision
} from 'core/util';

function defaultGetter( initial , eventual , pct , precision ){
  return $_precision( initial + (eventual - initial) * pct , precision );
}

export default class Property {
  constructor( options ){
    var that = this;
    var initial = $_string.interpret( options.template , options.initial );
    options = $_extend({ precision: 2, getters: [] }, options );

    (function( getters ){
      var arr, getter, i, key;
      /* jshint -W084 */
      while (arr = getters.shift()) {
        getter = $_last( arr );
        for (i = 0; i < arr.length - 1; i++) {
          key = arr[i];
          getters[key] = getter;
        }
      }
      for (key in initial) {
        if (!getters[key]) {
          getters[key] = defaultGetter;
        }
      }
    }( options.getters ));

    if (Object.keys( options.getters ).indexOf( 'undefined' ) >= 0) {
      throw new Error( 'Properties may not contain numeric keys.' );
    }

    $_defineValues( that , options );
    $_defineGetters( that , {
      plain: function(){
        return $_extend( {} , that );
      }
    });
    that.from( initial );
  }
  _crunch( key , pct ){
    var that = this;
    return that.getters[key]( that.initial[key] , that.eventual[key] , pct , that.precision );
  }
  fork( options ){
    var that = this;
    options = $_extend({
      name: that.name,
      template: that.template,
      initial: that.plain,
      getters: that.getters
    }, options );
    options.ancestor = that;
    return new Property( options );
  }
  from( initial ){
    return $_extend( this , initial );
  }
  to( eventual ){
    var that = this;
    $_defineValues( that , { eventual: $_extend( {} , eventual )});
    $_extend( that.initial , that.plain );
    return that;
  }
  at( pct ){
    var that = this;
    $_each( that.eventual , function( value , key ){
      that[key] = that._crunch( key , pct );
    });
  }
  toString(){
    var that = this;
    return $_string.compile( that.template , that );
  }
}
