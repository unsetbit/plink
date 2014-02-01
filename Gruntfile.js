module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy'); 
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-browserify');
  
  var config = {
    properties: {
      buildDir: './build',
      distDir: './dist',
      libDir: './lib',
      devDir: './dev',
      testDir: './test',
      devServerDir: '<%= properties.buildDir %>/dev'
    },
    clean: {
      build: ['<%= properties.buildDir %>'],
      dist: ['<%= properties.distDir %>']
    },
    
    browserify: {
      plink: {
        files: {
          '<%= properties.buildDir %>/plink.js': '<%= properties.libDir %>/init.js'
        }
      }
    },

    copy: {
      dev:{
        files: [{
            dest: '<%= properties.devServerDir %>/plink.js',
            src: '<%= properties.buildDir %>/plink.js'
        },{
            dest: '<%= properties.devServerDir %>',
            src: 'examples/**',
            expand: true
        }
        ]
      }
    },

    uglify: {
      plink: {
        files: {
          'dist/plink.js': ['<%= properties.buildDir %>/plink.js']
        }
      }
    },

    watch: {
      plink: {
        files: ['<%= properties.libDir %>/**', 'examples/**'],
        tasks: ["browserify:plink", "copy:dev"]
      }
    },

    connect: {
      plink: {
        options: {
          hostname: "*",
          port:20501,
          base: './build/dev'
        }
      }
    },

    jshint: {
      plink: ['./lib/**/*.js'],
      options: {
        camelcase: true,
        strict: false,
        trailing: false,
        curly: false,
        eqeqeq: false,
        immed: true,
        latedef: false,
        newcap: true,
        noarg: true,
        sub: true,
        evil:true,
        undef: true,
        boss: true,
        eqnull: true,
        smarttabs: true,
        browser:true,
        es5: true,
        globals: {
          module: true,
          exports: true,
          require: true
        }
      }
    },

    jasmine: {
      test: {
        src: '<%= properties.buildDir %>/plink-test.js',
        options: {
          keepRunner: true,
          specs: 'test/specs/*.js',
          helpers: ['node_modules/sinon/pkg/sinon.js']
        }
      }
    }
  };

  grunt.registerTask('default', 'release');

  grunt.registerTask('dev', [
    'browserify:plink', 
    'copy:dev', 
    'connect', 
    'watch'
  ]);


  grunt.registerTask('release', [
    'jshint:plink',
    'browserify:plink', 
    'uglify:plink'
  ]);

  grunt.initConfig(config);
};
