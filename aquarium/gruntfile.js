module.exports = function(grunt){
	grunt.initConfig({
		autoprefixer:{
			options:{

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