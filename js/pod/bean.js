hxManager.Bean = (function( Object , MOJO , Config , Helper , SubscriberMOJO ) {


    var TOLERANCE = ( 1000 / 240 );
    var TIMING = 'timing';
    var PROGRESS = 'progress';
    var BEAN_START = 'beanStart';
    var BEAN_PAINT = 'beanPaint';
    var BEAN_COMPLETE = 'beanComplete';


    var MOJO_Each = MOJO.Each;
    var OptionKeys = Config.optionKeys;
    var PropertyMap = Config.properties;
    var isFunction = Helper.isFunc;
    var Del = Helper.del;


    function Bean( seed , node , index ) {

        if (!seed.type) {
            throw new TypeError( 'Bean type is required.' );
        }

        var that = this;

        that.running = false;
        that.buffer = 0;
        that.progress = 0;

        MOJO.Construct( that );
        
        $.extend( that , getCompiledData( seed , node , index ));
    }


    var Bean_prototype = Bean.prototype = MOJO.Create({

        run: function( node_hx ) {

            var that = this;

            if (that.running) {
                return false;
            }

            that.running = true;

            that.when( PROGRESS , that );
            that.once( BEAN_PAINT , node_hx , that );
            that.happen( BEAN_START );

            return true;
        },

        handleMOJO: function( e ) {
            
            var that = this;
            var args = arguments;
            var progress, node_hx;

            switch (e.type) {

                case TIMING:
                    that._timing.apply( that , args );
                break;

                case PROGRESS:
                    progress = args[1];
                    if (that.running && progress > 0) {
                        that.dispel( PROGRESS , that );
                        that.happen( BEAN_PAINT );
                    }
                break;

                case BEAN_PAINT:
                    node_hx = args[1];
                    node_hx.setTransition( that );
                    node_hx.updateComponent( that );
                break;
            }
        },

        _timing: function( e , elapsed , diff ) {

            var that = this;
            var duration = that.options.duration;
            var delay = that.options.delay;

            if (!that.running) {
                that.buffer += diff;
            }

            var progress = calcProgress(( elapsed - that.buffer) , duration , delay );

            if (isWithinTolerance( progress , 1 , TOLERANCE , duration )) {
                progress = 1;
            }

            that.happen( PROGRESS , progress );

            if (progress === 1) {
                that.happen( BEAN_COMPLETE );
            }
        },

        getOrder: function( seed ) {

            var passed = (seed.order || []).map( mapCallback );
            
            var computed = Object.keys( seed )
                .filter(function( key , i ) {
                    return OptionKeys.indexOf( key ) < 0;
                })
                .map( mapCallback );

            function mapCallback( key ) {
                return PropertyMap[key] || key;
            }

            return {
                passed: passed,
                computed: computed
            };
        },

        getOptions: function( seed , node , index ) {

            var defaults = Config.defaults;
            var options = $.extend( {} , defaults , seed );

            MOJO_Each( options , function( val , key ) {
                if (!defaults.hasOwnProperty( key )) {
                    Del( options , key );
                }
                else if (key === 'done') {
                    // make sure we don't execute the done function just yet
                    options[key] = val.bind( null , node , index );
                }
                else {
                    options[key] = getBeanProperty( val , node , index );
                }
            });

            return options;
        },

        getStyles: function( seed , node , index ) {

            var styles = {};

            MOJO_Each( seed , function( val , key ) {
                var mappedKey = PropertyMap[key] || key;
                if (OptionKeys.indexOf( mappedKey ) < 0) {
                    styles[mappedKey] = getBeanProperty( val , node , index );
                }
            });

            return styles;
        }
    });


    function getBeanProperty( property , node , index ) {
        return (isFunction( property ) ? property( node , index ) : property);
    }


    function getCompiledData( seed , node , index ) {

        var getOrder = Bean_prototype.getOrder;
        var getOptions = Bean_prototype.getOptions;
        var getStyles = Bean_prototype.getStyles;

        return {
            seed: seed,
            type: seed.type,
            order: getOrder( seed ),
            options: getOptions( seed , node , index ),
            styles: getStyles( seed , node , index )
        };
    }




    function calcProgress( elapsed , duration , delay ) {
        elapsed = elapsed - delay;
        elapsed = elapsed < 0 ? 0 : elapsed;
        return duration > 0 ? (elapsed / duration) : 1;
    }


    function isWithinTolerance( subject , target , tolerance , duration ) {
        return (target - subject) <= (tolerance / duration);
    }




    return Bean;

    
}(
    Object,
    MOJO,
    hxManager.Config,
    hxManager.Helper,
    hxManager.SubscriberMOJO
));



























