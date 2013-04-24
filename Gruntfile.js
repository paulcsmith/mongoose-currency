module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.initConfig({
    jshint: {
      all: ['Gruntfile.js', 'index.js', 'test/**/*.js'],
      options: {
        es5: true,
        quotmark: 'single',
        unused: true,
        trailing: true,
        proto: true,
        curly: true,
        eqeqeq: true,
        maxcomplexity: 6,
        maxdepth: 2,
        maxparams: 4
      }
    }
  });
};
