module.exports = function( grunt ) {


    var fs = require( 'fs-extra' );


    var Script = [
        'js/hxManager.js',
        'js/shared/helper.js',
        'js/shared/config.js',
        'js/shared/vendorPatch.js',
        'js/shared/bezier.js',
        'js/shared/easing.js',
        'js/domNode/styleDefinition.js',
        'js/domNode/cssProperty.js',
        'js/domNode/componentMOJO.js',
        'js/domNode/transitionMOJO.js',
        'js/domNode/queue.js',
        'js/domNode/domNodeFactory.js',
        'js/pod/timingMOJO.js',
        'js/pod/subscriberMOJO.js',
        'js/pod/bean.js',
        'js/pod/iteratorMOJO.js',
        'js/pod/animationPod.js',
        'js/pod/precisionPod.js',
        'js/pod/promisePod.js',
        'js/pod/podFactory.js',
        'js/hx.js',
        'js/init/init.js'
    ];


    var Lib = [
        'js/lib/promise-1.0.0.min.js',
        'js/lib/mojo-0.1.4.min.js',
        'js/lib/bezier-easing-0.4.1.js'
    ];


    var All = Lib.concat( Script );


    grunt.initConfig({

        pkg: grunt.file.readJSON( 'package.json' ),

        'git-describe': {
            'options': {
                prop: 'git-version'
            },
            dist : {}
        },

        jshint: {
            all: [ 'Gruntfile.js' ].concat( Script )
        },

        clean: {
            build: [ 'hx-*.js' ],
            live: [ 'live' ]
        },

        replace: {
            dev: {
                options: {
                    patterns: [{
                        match: /<\!(\-){2}\s\[scripts\]\s(\-){2}>/,
                        replacement: '<script src=\"../hx-<%= pkg.version %>.js\"></script>'
                    }]
                },
                files: [{
                    src: 'live/index.html',
                    dest: 'live/index.html'
                }]
            },
            prod: {
                options: {
                    patterns: [{
                        match: /<\!(\-){2}\s\[scripts\]\s(\-){2}>/,
                        replacement: '<script src=\"../hx-<%= pkg.version %>.min.js\"></script>'
                    }]
                },
                files: [{
                    src: 'live/index.html',
                    dest: 'live/index.html'
                }]
            },
            live: {
                options: {
                    patterns: [{
                        match: /<\!(\-){2}\s\[scripts\]\s(\-){2}>/,
                        replacement: function() {
                            var template = '<script src=\"../[src]\"></script>';
                            return All.map(function( src , i ) {
                                return (i > 0 ? '\t\t' : '') + template.replace( /\[src\]/ , src );
                            })
                            .join( '\n' );
                        }
                    }]
                },
                files: [{
                    src: 'live/index.html',
                    dest: 'live/index.html'
                }]
            },
            bower: {
                options: {
                    patterns: [
                        {
                            match: /(\"name\")(.*?)(\")(.{1,}?)(\")/i,
                            replacement: '\"name\": \"<%= pkg.name %>\"'
                        },
                        {
                            match: /(\"version\")(.*?)(\")(.{1,}?)(\")/i,
                            replacement: '\"version\": \"<%= pkg.version %>\"'
                        },
                        {
                            match: /(\"homepage\")(.*?)(\")(.{1,}?)(\")/i,
                            replacement: '\"homepage\": \"<%= pkg.repository.url %>\"'
                        },
                        {
                            match: /(\"description\")(.*?)(\")(.{1,}?)(\")/i,
                            replacement: '\"description\": \"<%= pkg.description %>\"'
                        },
                        {
                            match: /(\"main\")(.*?)(\")(.{1,}?)(\")/i,
                            replacement: '\"main\": \"hx-<%= pkg.version %>.min.js\"'
                        }
                    ]
                },
                files: [{
                    src: 'bower.json',
                    dest: 'bower.json'
                }]
            }
        },

        watch: {
            debugProd: {
                files: ([ 'Gruntfile.js' , 'package.json' , 'test/*' ]).concat( All ),
                tasks: [ '_debugProd' ]
            },
            src: {
                files: ([ 'Gruntfile.js' , 'package.json' , 'test/*' ]).concat( All ),
                tasks: [ 'dev' ]
            },
            test: {
                files: [ 'Gruntfile.js' , 'package.json' , 'test/*' ],
                tasks: [ '_live' ]
            }
        },

        concat: {
            options: {
                banner: (function() {
                    var banner = '/*\n\n';
                    banner += '<%= pkg.name %> - <%= pkg.version %> - <%= grunt.config.get( \'git-hash\' ) %> - <%= grunt.template.today("yyyy-mm-dd") %>';
                    banner += '\n\n';
                    banner += fs.readFileSync( 'LICENSE.txt' , 'utf8' );
                    banner += '\n\n*/\n\n';
                    return banner;
                }())
            },
            build: {
                src: All,
                dest: 'hx-<%= pkg.version %>.js'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - <%= pkg.version %> - <%= pkg.author.name %> - <%= grunt.config.get( \'git-hash\' ) %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            release: {
                files: {
                    'hx-<%= pkg.version %>.min.js' : All
                }
            }
        }
    });


    [
        'grunt-contrib-jshint',
        'grunt-contrib-clean',
        'grunt-git-describe',
        'grunt-replace',
        'grunt-contrib-concat',
        'grunt-contrib-uglify',
        'grunt-contrib-watch'
    ]
    .forEach( grunt.loadNpmTasks );


    grunt.registerTask( 'createLive' , function() {
        var src = __dirname + '/test';
        var dest = __dirname + '/live';
        fs.copySync( src , dest );
    });


    grunt.registerTask( 'createHash' , function() {

        grunt.task.requires( 'git-describe' );

        var rev = grunt.config.get( 'git-version' );
        var matches = rev.match( /(\-{0,1})+([A-Za-z0-9]{7})+(\-{0,1})/ );

        var hash = matches
            .filter(function( match ) {
                return match.length === 7;
            })
            .pop();

        if (matches && matches.length > 1) {
            grunt.config.set( 'git-hash' , hash );
        }
        else{
            grunt.config.set( 'git-hash' , rev );
        }
    });


    grunt.registerTask( 'default' , [
        'jshint',
        'git-describe',
        'createHash',
        'clean',
        'replace:bower',
        'uglify'
    ]);


    grunt.registerTask( 'dev' , [
        'jshint',
        'git-describe',
        'createHash',
        'clean',
        'createLive',
        'replace:dev',
        'concat'
    ]);


    grunt.registerTask( 'debug' , [
        'dev',
        'watch:src'
    ]);

    grunt.registerTask( '_debugProd' , [
        'jshint',
        'clean',
        'createLive',
        'replace:prod',
        'uglify'
    ]);

    grunt.registerTask( 'debugProd' , [
        '_debugProd',
        'watch:debugProd'
    ]);


    grunt.registerTask( '_live' , [
        'clean:live',
        'createLive',
        'replace:live'
    ]);


    grunt.registerTask( 'live' , [
        '_live',
        'watch:test'
    ]);
};


















