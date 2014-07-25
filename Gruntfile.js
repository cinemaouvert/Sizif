module.exports = function(grunt) {
	/*
	   Notes: regarder du coté de "jshint" comme module � ajouter.
	*/

	/*
	   Les imports des taches que peut g�rer Grunt.
	   Les modules correspondant ont �taient pr�alablement t�l�charg� via
	   "npm" et enregistr� dans le "package.json".
	   Exemple de commandes de telechargement: "npm install grunt-contrib-sass --save-dev".
   */
	grunt.loadNpmTasks('grunt-contrib-sass') // /!\ Pour que "sass" soit op�rationnel, il faut installer "Ruby" et "sass" avec "gem".
	grunt.loadNpmTasks('grunt-jsdoc') // Allows to generate html documentation. It needs Java, on windows Java must be append in the PATH
	grunt.loadNpmTasks('grunt-contrib-concat')
	grunt.loadNpmTasks('grunt-contrib-watch')

	/*
	    On met le tableau des fichiers � concat�ner dans une variable.
	*/
	var prefix = "dev/js/";
	var jsSrc = [
		prefix + 'Util.js',
		prefix + 'Setting.js',
		prefix + 'Translate.js',
		prefix + 'Label.js',
		prefix + 'ContextMenu.js',
		prefix + 'List.js',
		prefix + 'Card.js',
		prefix + "main.js"
		],
		jsDist = 'dist/js/built.js';

	// Configuration de Grunt
	grunt.initConfig({
		sass: { // Compile les .scss
			dist: {
				options: {
					style: 'expanded'
				},
				files: [{
					"expand": true,
					"cwd": "scss/",
					"src": ["*.scss"],
					"dest": "dist/css/",
					"ext": ".css"
				}]
			},
			dev: {
				options: {
					style: 'expanded'
				},
				files: [{
					"expand": true,
					"cwd": "dev/scss/",
					"src": ["*.scss"],
					"dest": "dist/css/",
					"ext": ".css"
				}]
			}
		},
		concat: { // Concat�ne les scripts en un seul.
			options: {
				separator: ';'
			},
			compile: { // On renomme vu qu'on a pas de mode dev/dist. Dist �tant une autre t�che : uglify
				src: jsSrc,
				dest: jsDist
			}
		},
		uglify: { // Minifie les scripts
			options: {
				separator: ';'
			},
			compile: {
				src: jsSrc,
				dest: jsDist
			}
		},
		jsdoc: { // G�n�re la documentation
			generate: {
				src: jsSrc,
				options: {
					destination: 'doc'
				}
			}
		},
		watch: { // Permet de surveiller les fichiers, au moindre changement il lance la t�che attach�e au fichier.
			scripts: {
				files: '**/*.js',
				tasks: ['scripts:dev']
			},
			styles: {
				files: '**/*.scss',
				tasks: ['styles:dev']
			}
		}
	})

	grunt.registerTask('default', ['dev', 'watch']) // C'est la tache lanc�e par d�faut en tapant juste "grunt" en ligne de commande.
	grunt.registerTask('dev', ['styles:dev', 'scripts:dev']) // C'est la t�che lancer en tapant "grunt dev" en ligne de commande.
	grunt.registerTask('dist', ['styles:dist', 'scripts:dist']) // C'est la t�che lancer en tapant "grunt dist" en ligne de commande.
	grunt.registerTask('doc', ['jsdoc:generate'])

	// Des commandes et t�ches plus sp�cifiques
	grunt.registerTask('scripts:dev', ['concat:compile'])
	grunt.registerTask('scripts:dist', ['uglify:compile'])

	grunt.registerTask('styles:dev', ['sass:dev'])
	grunt.registerTask('styles:dist', ['sass:dist'])
}