(function() {

  'use strict';

  describe( 'jquery.hx' , function() {
    it('should exist', function() {
      expect( $.fn ).to.have.property( 'hx' );
    });
  });

  return;

  var ALL_SELECTOR = '.tgt0,.tgt1,.tgt2';

  var SKIP = [
    // 'should call done',
    // 'should execute in the right order',
    // 'should reset transition',
    // 'null transitions',
    // 'persistent transforms',
    // 'should reject',
    // 'should throw an error',
    // 'hx.start / hx.end',
    // 'hx.pause / hx.resume',
    // 'defineProperty',
    // 'resolve',
    // 'reject',
    // 'aggregate',
    // 'main',
    // 'individual',
    // 'array',
    // 'paint all',
    // 'should reset',
    // 'should get'
  ]

  var TEST_CASES = [
    {
      selector: ALL_SELECTOR,
      method: 'animate',
      duration: 400,
      easing: 'easeOutBack'
    },
    {
      selector: ALL_SELECTOR,
      method: 'iterate',
      duration: 400,
      easing: 'easeOutBack'
    },
    {
      selector: '.tgt1',
      method: 'animate',
      duration: 200,
      easing: 'linear'
    },
    {
      selector: '.tgt1',
      method: 'iterate',
      duration: 200,
      easing: 'linear'
    },
    {
      selector: ALL_SELECTOR,
      method: 'animate',
      duration: 50,
      easing: 'linear'
    },
    {
      selector: ALL_SELECTOR,
      method: 'iterate',
      duration: 50,
      easing: 'linear'
    },
    {
      selector: ALL_SELECTOR,
      method: 'animate',
      duration: 0,
      easing: 'linear'
    },
    {
      selector: ALL_SELECTOR,
      method: 'iterate',
      duration: 0,
      easing: 'linear'
    },
    {
      selector: ALL_SELECTOR,
      method: 'animate',
      duration: 300,
      easing: [ 0.25 , 0.1 , 0.25 , 1 ]
    },
    {
      selector: ALL_SELECTOR,
      method: 'iterate',
      duration: 300,
      easing: [ 0.25 , 0.1 , 0.25 , 1 ]
    }
  ];

// ================================================================================ //

   $.hx.defineProperty( 'blur' )
    .set( 'defaults' , 0 )
    .set( 'stringGetter' , blurStringGetter );

  $.hx.defineProperty( 'dropShadow' , 'drop-shadow' )
    .set( 'defaults' , [ 0 , 0 , 0 , 'transparent' ])
    .set( 'keymap' , [ 'x' , 'y' , 'blur' , 'color' ])
    .set( 'stringGetter' , dropShadowStringGetter );

  $.hx.defineProperty( 'clip' )
    .set( 'defaults' , [ 0 , 0 , 0 , 0 ])
    .set( 'keymap' , [ 'top' , 'right' , 'bottom' , 'left' ])
    .set( 'stringGetter' , clipStringGetter );

  function blurStringGetter( name , CSSProperty ) {
    return name + '(' + CSSProperty[0] + 'px)';
  }

  function dropShadowStringGetter( name , CSSProperty ) {
    return name + '(' + CSSProperty.join( 'px ' ) + ')';
  }

  function clipStringGetter( name , CSSProperty ) {
    return 'rect(' + CSSProperty.join( 'px,' ) + 'px)';
  }

// ================================================================================ //

  function beforeEachAndEvery() {
    var color = [
      '#FF59C7',
      '#97F224',
      '#F4AE29'
    ];
    for (var i = 0; i < 3; i++) {
      var target = $(document.createElement('div'));
      target.css({
        width: '100px',
        height: '100px',
        margin: '50px',
        'background-color': color[i]
      })
      .addClass('tgt'+i)
      .appendTo( container );
    };
  }

  function afterEachAndEvery() {
    container.empty();
  }

  var container = $(document.createElement('div'));
  container.addClass('tgt-container');
  $('body').prepend(container);


// ================================================================================ //
//                                          //
//               PROMISE DIGESTION                  //
//                                          //
// ================================================================================ //

  describe('Promise Digestion', function() {

    this.timeout(0);

    // hard reset DOM
    beforeEach(beforeEachAndEvery);
    afterEach(afterEachAndEvery);

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var msg = 'should call done';
      if (SKIP.indexOf(msg) != -1)
        return;

      it (i+' '+msg, function ( done ) {
        var selector = params.selector;
        var method = params.method;
        var duration = params.duration;
        var easing = params.easing;

        $(selector)
        .hx()
        [ method ]({
          type: 'transform',
          translate: {y: '+=20'},
          duration: duration,
          easing: easing
        })
        .done(function() {
          done();
        });
  
      });
    });

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var msg = 'should execute in the right order';
      if (SKIP.indexOf(msg) != -1)
        return;

      it (i+' '+msg, function ( done ) {
        var selector = params.selector;
        var method = params.method;
        var duration = params.duration;
        var easing = params.easing;

        var spy = sinon.spy();

        var expectedOrder = [
          [ 'translate3d' , 'scale3d' ],
          [ 'scale3d' , 'translate3d' ],
          [ 'translate3d' , 'rotateZ' ]
        ];

        $(selector)
        .hx()
        [ method ]({
          type: 'transform',
          translate: {y: '+=50'},
          scale: {x: '+=0.5', y: '+=0.5'},
          duration: duration,
          easing: easing
        })
        .then(function( resolve ) {
          checkOrder( this , 0 );
          spy();
          resolve();
        })
        [ method ]({
          type: 'transform',
          scale: {x: '+=0.5', y: '+=0.5'},
          order: [ 'scale' , 'translate' ],
          duration: duration,
          easing: easing
        })
        .then(function( resolve ) {
          checkOrder( this , 1 );
          spy();
          resolve();
        })
        [ method ]({
          type: 'transform',
          scale: null,
          translate: {y: '+=50'},
          rotateZ: '+=90',
          duration: duration,
          easing: easing
        })
        .then(function( resolve ) {
          checkOrder( this , 2 );
          spy();
          resolve();
        })
        .done(function() {
          expect(spy).to.have.callCount(3);
          done();
        });

        function checkOrder( context , i ) {
          var expected = expectedOrder.shift();
          var order = [], controlOrder = [];
          $(context).each(function() {
            order = order.concat(
              this.$hx.componentMOJO.order.transform
            );
            controlOrder = controlOrder.concat( expected );
          });
          expect(order).to.deep.equal(controlOrder);
        }
  
      });
    });

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var msg = 'should reset transition';
      if (SKIP.indexOf(msg) != -1)
        return;

      it (i+' '+msg, function ( done ) {
        var selector = params.selector;
        var method = params.method;
        var duration = params.duration;
        var easing = params.easing;

        $(selector)
        .hx()
        [ method ]({
          type: 'transform',
          translate: {y: '+=50'},
          scale: {x: '+=0.5', y: '+=0.5'},
          duration: duration,
          easing: easing
        })
        .then(function( resolve ) {
          $(this).each(function( i ) {
            var prefixed = hxManager.VendorPatch.prefix( 'transition' );
            var value = $(this).css( prefixed );
            var assertion = (value === 'all 0s ease 0s' || value === '' || value === 'none');
            expect(assertion).to.be.true;
          });
          resolve();
        })
        .done(function() {
          done();
        });
  
      });
    });

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var msg = 'null transitions';
      if (SKIP.indexOf(msg) != -1)
        return;

      it (i+' '+msg, function ( done ) {
        var selector = params.selector;
        var method = params.method;
        var duration = params.duration;
        var easing = params.easing;

        var BCR = $(selector).toArray().map(function( element ) {
          return element.getBoundingClientRect();
        });

        $(selector)
        .hx()
        [ method ]({
          type: 'transform',
          translate: {y: '+=50'},
          scale: {x: '+=0.5', y: '+=0.5'},
          duration: duration,
          easing: easing
        })
        [ method ]({
          type: 'transform',
          translate: null,
          scale: null,
          duration: 0
        })
        .done(function() {
          var that = this;
          BCR.forEach(function( bcr , i ) {
            var test = that[i].getBoundingClientRect();
            expect(test).to.deep.equal( bcr );
          });
          done();
        });
  
      });
    });

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var msg = 'persistent transforms';
      if (SKIP.indexOf(msg) != -1)
        return;

      it (i+' '+msg, function ( done ) {
        var selector = params.selector;
        var method = params.method;
        var duration = params.duration;
        var easing = params.easing;
        var sampleIndex = Math.floor( Math.random() * $(selector).length );

        var BCR = $(selector).toArray().map(function( element ) {
          return element.getBoundingClientRect();
        });

        $(selector)
        .hx()
        [ method ]({
          type: 'transform',
          translate: {x: '+=20'},
          duration: (duration / 4),
          easing: easing
        })
        .then(function( resolve ) {
          var t = this.get( 'translate' )[sampleIndex];
          expect(t).to.deep.equal({x: 20, y: 0, z: 0});
          resolve();
        })
        [ method ]({
          type: 'transform',
          translate: {y: '+=20'},
          duration: (duration / 4),
          easing: easing
        })
        .then(function( resolve ) {
          var t = this.get( 'translate' )[sampleIndex];
          expect(t).to.deep.equal({x: 20, y: 20, z: 0});
          resolve();
        })
        [ method ]({
          type: 'transform',
          translate: {z: '+=20'},
          duration: (duration / 4),
          easing: easing
        })
        .then(function( resolve ) {
          var t = this.get( 'translate' )[sampleIndex];
          expect(t).to.deep.equal({x: 20, y: 20, z: 20});
          resolve();
        })
        [ method ]({
          type: 'transform',
          translate: {x: 10},
          duration: (duration / 4),
          easing: easing
        })
        .then(function( resolve ) {
          var t = this.get( 'translate' )[sampleIndex];
          expect(t).to.deep.equal({x: 10, y: 20, z: 20});
          resolve();
        })
        [ method ]({
          type: 'transform',
          translate: {y: 10},
          duration: (duration / 4),
          easing: easing
        })
        .then(function( resolve ) {
          var t = this.get( 'translate' )[sampleIndex];
          expect(t).to.deep.equal({x: 10, y: 10, z: 20});
          resolve();
        })
        [ method ]({
          type: 'transform',
          translate: {z: 10},
          duration: (duration / 4),
          easing: easing
        })
        .then(function( resolve ) {
          var t = this.get( 'translate' )[sampleIndex];
          expect(t).to.deep.equal({x: 10, y: 10, z: 10});
          resolve();
        })
        .done(function() {
          done();
        });
  
      });
    });

// ================================================================================ //


  });

// ================================================================================ //
//                                          //
//                 EVENTS                       //
//                                          //
// ================================================================================ //

  describe('Events', function() {

    this.timeout(0);

    // hard reset DOM
    beforeEach(beforeEachAndEvery);
    afterEach(afterEachAndEvery);

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var msg = 'should reject';
      if (SKIP.indexOf(msg) != -1)
        return;

      it (i+' '+msg, function ( done ) {
        var selector = params.selector;
        var method = params.method;
        var duration = params.duration;
        var easing = params.easing;

        var spy = sinon.spy();

        $(window).once( 'hx.reject' , function( e , args ) {
          expect(e.namespace).to.equal('reject');
          expect(args[0]).to.equal('test0');
          expect(args[1]).to.equal('test1');
        });

        async(function() {
          expect(spy).to.not.have.been.called;
          done();
        }, 100)

        $(selector)
        .hx()
        .then(function( resolve , reject ) {
          reject([ 'test0' , 'test1' ]);
        })
        .done(function() {
          spy();
        });
  
      });
    });

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var msg = 'should throw an error';
      if (SKIP.indexOf(msg) != -1)
        return;

      it (i+' '+msg, function ( done ) {
        var selector = params.selector;
        var method = params.method;
        var duration = params.duration;
        var easing = params.easing;

        var spy = sinon.spy();

        var temp = $.hx.error;
        $.hx.error = function() {};

        $(window).once( 'hx.error' , function( e , data ) {
          expect(e.namespace).to.equal('error');
          expect( data instanceof Error ).to.be.ok;
          spy('Good Spy');
          $.hx.error = temp;
        });

        async(function() {
          expect(spy).to.not.have.been.calledWith('Bad Spy');
          expect(spy).to.have.been.calledWith('Good Spy');
          done();
        }, duration);

        $(selector)
        .hx()
        .then(function( resolve , reject ) {
          var a = null;
          a.b = true;
        })
        .done(function() {
          spy('Bad Spy');
        });
  
      });
    });

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var msg = 'hx.start / hx.end';
      if (SKIP.indexOf(msg) != -1)
        return;

      it (i+' '+msg, function ( done ) {
        var selector = params.selector;
        var method = params.method;
        var duration = params.duration;
        var easing = params.easing;

        var spy = sinon.spy();

        var bean0 = {
          type: 'transform',
          translate: {y: '+=20'},
          duration: function( element , i ) {
            return (( duration * ( i + 1 )) / 2 );
          },
          easing: easing,
          ref: '#hx.start'
        };

        var bean1 = {
          type: 'transform',
          translate: {y: '-=20'},
          duration: duration,
          easing: easing,
          ref: '#hx.end'
        };

        $(selector)
        .hx()
        .then(function( resolve ) {

          $(selector).once( 'hx.start' , function( e , data ) {
            expect( e.namespace ).to.equal( 'start' );
            expect( data.ref ).to.equal( '#hx.start' )
            expect( data.bean ).to.deep.equal( bean0 );
            spy();
          });

          resolve();
        })
        [ method ]( bean0 )
        .then(function( resolve ) {

          $(selector).once( 'hx.end' , function( e , data ) {
            expect( e.namespace ).to.equal( 'end' );
            expect( data.ref ).to.equal( '#hx.end' );
            expect( data.bean ).to.deep.equal( bean1 );
            spy();
          });

          resolve();
        })
        [ method ]( bean1 )
        .done(function() {
          expect(spy).to.have.been.calledTwice;
          done();
        });
  
      });
    });

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var msg = 'hx.pause / hx.resume';
      if (SKIP.indexOf(msg) != -1)
        return;

      it ( i+' '+msg , function ( done ) {
        var selector = params.selector;
        var method = params.method;
        var duration = params.duration;
        var easing = params.easing;

        if (method !== 'iterate' || duration === 0) {
          done();
          return;
        }

        var spy = sinon.spy();

        $(selector).once( 'hx.pause' , function( e , data ) {
          expect( e.namespace ).to.equal( 'pause' );
          expect( data.progress.length ).to.equal( 1 );
          spy();
        });

        $(selector).once( 'hx.resume' , function( e , data ) {
          expect( e.namespace ).to.equal( 'resume' );
          expect( data.progress.length ).to.equal( 1 );
          spy();
        });

        $(selector)
        .hx()
        [ method ]({
          type: 'transform',
          translate: {y: '+=50'},
          duration: function( element , i ) {
            return (( duration * ( i + 1 )) / 2 );
          },
          easing: easing
        })
        .done(function() {
          expect(spy).to.have.been.calledTwice;
          done();
        });

        async(function() {
          $(selector).hx( 'pause' );
        }, (duration / 2));

        async(function() {
          $(selector).hx( 'resume' );
        }, (duration * 2));
  
      });
    });

// ================================================================================ //

  });

// ================================================================================ //
//                                          //
//                 #$hx                       //
//                                          //
// ================================================================================ //

  describe('#$hx', function() {

    this.timeout(0);

    // hard reset DOM
    beforeEach(beforeEachAndEvery);
    afterEach(afterEachAndEvery);

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var msg = 'defineProperty';
      if (SKIP.indexOf(msg) != -1)
        return;

      it ( i+' '+msg , function () {

        var selector = params.selector;
        var method = params.method;
        var duration = params.duration;
        var easing = params.easing;

        var blur = hxManager.StyleDefinition.retrieve( 'blur' );

        expect( blur.name ).to.equal('blur');
        expect( blur.defaults ).to.deep.equal([ 0 ]);
        expect( blur.keymap ).to.deep.equal([ 0 ]);
        expect( blur.stringGetter ).to.equal( blurStringGetter );

        var dropShadow = hxManager.StyleDefinition.retrieve( 'drop-shadow' );

        expect( dropShadow.name ).to.equal( 'drop-shadow' );
        expect( dropShadow.pName ).to.equal( 'dropShadow' );
        expect( dropShadow.defaults ).to.deep.equal( [ 0 , 0 , 0 , 'transparent' ] );
        expect( dropShadow.keymap ).to.deep.equal([ 'x' , 'y' , 'blur' , 'color' ]);
        expect( dropShadow.stringGetter ).to.equal( dropShadowStringGetter );

        var clip = hxManager.StyleDefinition.retrieve( 'clip' );

        expect( clip.name ).to.equal( 'clip' );
        expect( clip.pName ).to.equal( 'clip' );
        expect( clip.defaults ).to.deep.equal( [ 0 , 0 , 0 , 0 ] );
        expect( clip.keymap ).to.deep.equal( [ 'top' , 'right' , 'bottom' , 'left' ] );
        expect( clip.stringGetter ).to.equal( clipStringGetter );
  
      });
    });

// ================================================================================ //

  });

// ================================================================================ //
//                                          //
//                 #then                      //
//                                          //
// ================================================================================ //

  describe('#then', function() {

    this.timeout(0);

    // hard reset DOM
    beforeEach(beforeEachAndEvery);
    afterEach(afterEachAndEvery);

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var selector = params.selector;
      var method = params.method;
      var duration = params.duration;
      var easing = params.easing;

      var msg = 'resolve';
      if (SKIP.indexOf(msg) != -1)
        return;

      var spy = sinon.spy();

      it ( i+' '+msg , function ( done ) {

        $(selector)
        .hx()
        .then(function( resolve , reject ) {
          spy();
          resolve();
        })
        .done(function() {
          expect(spy).to.have.been.called;
          done();
        });
  
      });
    });

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var selector = params.selector;
      var method = params.method;
      var duration = params.duration;
      var easing = params.easing;

      var msg = 'reject';
      if (SKIP.indexOf(msg) != -1)
        return;

      var spy = sinon.spy();

      it ( i+' '+msg , function ( done ) {

        $(selector)
        .hx()
        .then(function( resolve , reject ) {
          spy('Good Spy');
          reject();
        })
        .done(function() {
          spy('Bad Spy');
        });

        async(function() {
          expect(spy).to.have.been.calledWith('Good Spy');
          expect(spy).to.not.have.been.calledWith('Bad Spy');
          done();
        });
  
      });
    });

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var selector = params.selector;
      var method = params.method;
      var duration = params.duration;
      var easing = params.easing;

      var msg = 'aggregate';
      if (SKIP.indexOf(msg) != -1)
        return;

      var spy = sinon.spy();

      it ( i+' '+msg , function ( done ) {

        $(selector)
        .hx()
        [ method ]([
          {
            type: 'opacity',
            value: 0.5,
            duration: duration,
            delay: function( element , i ) {
              return (duration * i);
            },
            easing: easing
          },
          {
            type: 'transform',
            translate: {y: 40},
            rotateZ: 360,
            duration: duration,
            delay: function( element , i ) {
              return (duration * i);
            },
            easing: easing
          }
        ])
        .then(function( resolve ) {
          this.each(function( i ) {
            spy();
            expect( this.$hx.queue.length ).to.equal( 3 );
          });
          resolve();
        })
        [ method ]([
          {
            type: 'opacity',
            value: null,
            duration: duration,
            easing: easing
          },
          {
            type: 'transform',
            translate: null,
            rotateZ: null,
            duration: duration,
            easing: easing
          }
        ])
        .done(function() {
          expect(spy).to.have.been.called;
          done();
        });
  
      });
    });

// ================================================================================ //

  });

// ================================================================================ //
//                                          //
//                  #update                     //
//                                          //
// ================================================================================ //

  describe('#update', function() {

    this.timeout(0);

    // hard reset DOM
    beforeEach(beforeEachAndEvery);
    afterEach(afterEachAndEvery);

    var beans = [
      {
        type: 'transform',
        translate: {x: 20, y: 20, z: 20},
        rotate: {x: 1, y: 1, z: 1, a: 60},
        scale: {x: 1.2, y: 1.2, z: 1.2},
        rotateX: 20,
        rotateY: 20,
        rotateZ: 20,
        translate2d: {x: 20, y: 20},
        scale2d: {x: 1.2, y: 1.2}
      },
      {
        type: 'opacity',
        value: 0.5
      },
      {
        type: 'filter',
        blur: 2,
        dropShadow: { x: 10, y: 10, color: 'blue'}
      },
      {
        type: 'clip',
        value: {
          top: 0,
          right: 25,
          bottom: 25,
          left: 0
        }
      }
    ]

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var selector = params.selector;
      var method = params.method;
      var duration = params.duration;
      var easing = params.easing;

      var msg = 'main';
      if (SKIP.indexOf(msg) != -1)
        return;

      beans.forEach(function( bean ) {
        it ( i+' '+msg , function ( done ) {

          $(selector)
          .hx()
          .update( bean )
          .paint()
          .done(function() {
            done();
          });

        });
  
      });
    });

// ================================================================================ //

  });

// ================================================================================ //
//                                          //
//                   #paint                     //
//                                          //
// ================================================================================ //

  describe('#paint', function() {

    this.timeout(0);

    // hard reset DOM
    beforeEach(beforeEachAndEvery);
    afterEach(afterEachAndEvery);

    var beans = [
      {
        type: 'transform',
        translate: {x: 20, y: 20, z: 20},
        rotate: {x: 1, y: 1, z: 1, a: 60},
        scale: {x: 1.2, y: 1.2, z: 1.2},
        rotateX: 20,
        rotateY: 20,
        rotateZ: 20,
        translate2d: {x: 20, y: 20},
        scale2d: {x: 1.2, y: 1.2}
      },
      {
        type: 'opacity',
        value: 0.5
      },
      {
        type: 'filter',
        blur: 2,
        dropShadow: { x: 10, y: 10, color: 'blue' }
      },
      {
        type: 'clip',
        value: {
          top: 0,
          right: 25,
          bottom: 25,
          left: 0
        }
      }
    ];

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var selector = params.selector;
      var method = params.method;
      var duration = params.duration;
      var easing = params.easing;

      var msg = 'individual';
      if (SKIP.indexOf(msg) != -1)
        return;

      beans.forEach(function( bean ) {
        it ( i+' '+msg , function () {
        
          var type = bean.type;

          $(selector)
          .hx()
          .update( bean )
          .paint( bean.type );

          var style = $(selector).attr( 'style' );
          var prefixed = hxManager.VendorPatch.prefix( type );
          var re = new RegExp( '(' + prefixed + '|' + type + ')' );

          expect(style).to.match(re);

        });
      });

    });

// ================================================================================ //

    TEST_CASES.forEach(function( params ) {

      var selector = params.selector;
      var method = params.method;
      var duration = params.duration;
      var easing = params.easing;

      var msg = 'array';
      if (SKIP.indexOf(msg) != -1)
        return;

      var types = [];

      it ( msg , function () {
        beans.forEach(function( bean ) {

          var type = bean.type;
          var rand = Math.round( Math.random() );

          $(selector).hx( 'update' , bean );

          if (rand) {
            types.push( type );
          }
        });
      });

      $(selector).hx( 'paint' , types );

      var style = $(selector).attr( 'style' );

      types.forEach(function( type ) {
        var prefixed = hxManager.VendorPatch.prefix( type );
        var re = new RegExp( '(' + prefixed + '|' + type + ')' );
        expect(type).to.match(re);
      });

    });

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var selector = params.selector;
      var method = params.method;
      var duration = params.duration;
      var easing = params.easing;

      var msg = 'paint all';
      if (SKIP.indexOf(msg) != -1)
        return;

      var types = [];
      beans.forEach(function( bean ) {
        it (i+' '+ msg , function () {
        
          var type = bean.type;

          $(selector)
          .hx()
          .update( bean )
          .paint( type );

          var style = $(selector).attr( 'style' );
          var prefixed = hxManager.VendorPatch.prefix( type );
          var re = new RegExp( '(' + prefixed + '|' + type + ')' );

          expect(style).to.match(re);

        });
      });

    });

// ================================================================================ //

  });

// ================================================================================ //
//                                          //
//                   #reset                     //
//                                          //
// ================================================================================ //

  describe('#reset', function() {

    this.timeout(0);

    // hard reset DOM
    beforeEach(beforeEachAndEvery);
    afterEach(afterEachAndEvery);

    var beans = [
      {
        type: 'transform',
        translate: {x: 20, y: 20, z: 20},
        rotate: {x: 1, y: 1, z: 1, a: 60},
        scale: {x: 1.2, y: 1.2, z: 1.2},
        rotateX: 20,
        rotateY: 20,
        rotateZ: 20,
        translate2d: {x: 20, y: 20},
        scale2d: {x: 1.2, y: 1.2}
      },
      {
        type: 'opacity',
        value: 0.5
      },
      {
        type: 'filter',
        blur: 2,
        dropShadow: {x: 10, y: 10, color: 'blue'}
      },
      {
        type: 'clip',
        value: {
          top: 0,
          right: 25,
          bottom: 25,
          left: 0
        }
      }
    ]

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var selector = params.selector;
      var method = params.method;
      var duration = params.duration;
      var easing = params.easing;

      var msg = 'should reset';
      if (SKIP.indexOf(msg) != -1)
        return;

      beans.forEach(function( bean ) {

        var type = bean.type;

        it (i+' '+msg, function() {

          var initStyle;

          var type = bean.type;

          $(selector)
          .hx()
          .update( bean )
          .reset()
          .paint( type );

          var style = $(selector).attr( 'style' );
          var prefixed = hxManager.VendorPatch.prefix( type );
          var re = new RegExp( '(' + prefixed + '|' + type + ')' );

          expect(style).to.not.match(re);

        });

      });
      

    });

// ================================================================================ //

  });

// ================================================================================ //
//                                          //
//                   #get                       //
//                                          //
// ================================================================================ //

  describe('#get', function() {

    this.timeout(0);

    // hard reset DOM
    beforeEach(function() {
      beforeEachAndEvery();

    });
    afterEach(afterEachAndEvery);

// ================================================================================ //

    TEST_CASES.forEach(function( params, i ) {

      var selector = params.selector;
      var method = params.method;
      var duration = params.duration;
      var easing = params.easing;

      var msg = 'should get';
      if (SKIP.indexOf(msg) != -1)
        return;

      it (i+' '+msg, function( done ) {

        var Expected = [];

        Expected.push({
          opacity: 0.8,
          rotateZ: 45,
          translate: { x: 0, y: 135, z: 0 },
          blur: 10,
          dropShadow: { x: 10, y: 10, blur: 0, color: '#512eff' },
          clip: {
            left: 0,
            top: 0,
            right: 100,
            bottom: 100
          }
        });

        Expected.push({
          opacity: 1,
          rotateZ: 0,
          translate: { x: 0, y: 0, z: 0 },
          blur: 0,
          dropShadow: { x: 0, y: 0, blur: 0, color: 'transparent' },
          clip: { left: 0, top: 0, right: 0, bottom: 0 }
        });

        var count = Expected.reduce(function( prev , current ) {
          return prev + Object.keys( current ).length;
        }, 0);

        $(selector)
        .hx()
        .update([
          {
            type: 'opacity',
            value: 0.8
          },
          {
            type: 'transform',
            translate: {y: '+=135'},
            rotateZ: '+=45'
          },
          {
            type: 'filter',
            blur: 10,
            dropShadow: {x: 10, y: 10, color: '#512eff'}
          },
          {
            type: 'clip',
            value: function( element , i ) {
              return {
                right: $(element).width(),
                bottom: $(element).height()
              };
            }
          }
        ])
        .paint()
        .then(function( resolve ) {
          expect( $(selector).hx( 'get' ).length ).to.equal( $(selector).length );
          compareSample();
          resolve();
        })
        [ method ]([
          {
            type: 'opacity',
            value: null,
            duration: duration,
            easing: easing
          },
          {
            type: 'transform',
            translate: null,
            rotateZ: null,
            duration: duration,
            easing: easing
          },
          {
            type: 'filter',
            blur: null,
            dropShadow: null,
            duration: duration,
            easing: easing
          },
          {
            type: 'clip',
            value: null,
            duration: duration,
            easing: easing
          }
        ])
        .done(function() {
          compareSample();
          done();
        });

        function compareSample() {

          var expected = Expected.shift();

          for ( var key in expected ) {
            var expval = expected[key];
            var stored = $(selector).hx( 'get' , key )[0];
            expect( stored ).to.deep.equal( expval );
          }
        }

        function stringify( expected ) {
          return typeof expected === 'object' ? JSON.stringify( expected ) : expected;
        }

      });
      

    });

// ================================================================================ //

  });

// ================================================================================ //
//                                          //
//                   #reset                     //
//                                          //
// ================================================================================ //

  describe('#defer', function() {

    this.timeout(0);

    // hard reset DOM
    beforeEach(beforeEachAndEvery);
    afterEach(afterEachAndEvery);

// ================================================================================ //

     /* TEST_CASES.forEach(function( params, i ) {

      var selector = params.selector;
      var method = params.method;
      var duration = params.duration;
      var easing = params.easing;

      var msg = 'timed';
      if (SKIP.indexOf(msg) != -1)
        return;

      if (!duration) {
        it (i+" doesn't apply", function() {});
        return;
      }

      it (i+' '+msg, function( done ) {

        $(selector).each(function( j ) {

          //if (j > 0) {
            //$(this).hx( 'defer' , ((j + 1) * duration) );
          //}

          $(this)
          .hx()
          .hx( 'defer' , ((j + 1) * duration) )
          .then(function( resolve ) {
            console.log(this[0].$hx.queue.length);
            //expect( this[0].$hx.queue.length ).to.equal( 4 );
            resolve();
          })
          [ method ]({
            type: 'transform',
            rotateZ: '+=360',
            duration: duration,
            easing: easing
          })
          .done(function() {
            done();
          });

          console.log($(this)[0].$hx.queue.length);
        });

      });
    
    });*/

// ================================================================================ //

  });

  function async( callback , delay ) {
    delay = delay || 30;
    var unsubscribe = $.hx.subscribe(function( elapsed ) {
      if (elapsed >= delay) {
        callback( elapsed );
        unsubscribe();
      }
    });
    return unsubscribe;
  }

}());






















