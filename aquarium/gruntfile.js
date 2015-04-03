module.exports = function(grunt){
	grunt.initConfig({
		autoprefixer:{
			options:{
				browsers: ["last 2 versions", "ie8", "ie9"]
			},
			aquarium:{
				src: "style.source.css",
				dest: "style.css"
			}
		}
	});
	grunt.loadNpmTasks("grunt-autoprefixer");
	grunt.registerTask("default", ["autoprefixer"]);
}