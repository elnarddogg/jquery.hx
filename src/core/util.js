import { getPrototype } from 'core/class';

export function $_defineProperties( subject , descriptors ) {
  Object.defineProperties( subject , descriptors );
}

export function $_defineGetters( subject , getters ) {
  getters.$each(function( key , val ) {
    getters[key] = { get: val, configurable: true, enumerable: false };
  });
  $_defineProperties( subject , getters );
}

/*export function $_guid() {
  return ('xxxxxxxxxxxx').replace( /[xy]/g , function( c ) {
    var r = Math.random() * 16|0,
    v = c == 'x' ? r : r&0x3|0x8;
    return v.toString( 16 );
  });
}*/

/*export function $_freeze( subject ) {
  return Object.freeze( subject );
}*/

export function $_clone( subject ) {
  return $.extend( true , new getPrototype( subject ).constructor() , subject );
}

export function $_is( subject , test ) {
  if (typeof test == 'string') {
    return typeof subject == test;
  }
  else if (test === Array) {
    return Array.isArray( subject );
  }
  else {
    return subject instanceof test;
  }
}

export function $_defined( subject ) {
  return !$_is( subject , 'undefined' );
}

export function $_reportErr( err ) {
  if ($_is( err , Error )) {
    console.error( err.stack );
  }
  return err;
}