module.exports = function(grunt) {
	/*
	   Notes: regarder du coté de "jshint" comme module à ajouter.
	*/

	/*
	   Les imports des taches que peut gérer Grunt.
	   Les modules correspondant ont été préalablement téléchargé via
	   "npm" et enregistré dans le "package.json".
	   Les dépendances peuvent être installées grâce à "npm install"
   */
	grunt.loadNpmTasks('grunt-contrib-sass') // /!\ Pour que "sass" soit opérationnel, il faut installer "Ruby" et "sass" avec "gem".
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
		prefix + 'ContextMenu.js',
		prefix + 'ListTitle.js',
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
		concat: { // Concaténe les scripts en un seul.
			options: {
				separator: ';'
			},
			compile: { // On renomme vu qu'on a pas de mode dev/dist. Dist étant une autre tâche : uglify
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
		watch: { // Permet de surveiller les fichiers, au moindre changement il lance la tâche attachée au fichier.
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

	grunt.registerTask('default', ['dev', 'watch']) // C'est la tache lancée par défaut en tapant juste "grunt" en ligne de commande.
	grunt.registerTask('dev', ['styles:dev', 'scripts:dev']) // C'est la tâche lancée en tapant "grunt dev" en ligne de commande.
	grunt.registerTask('dist', ['styles:dist', 'scripts:dist']) // C'est la tâche lancer en tapant "grunt dist" en ligne de commande.
	grunt.registerTask('doc', ['jsdoc:generate'])

	// Des commandes et tâches plus spécifiques
	grunt.registerTask('scripts:dev', ['concat:compile'])
	grunt.registerTask('scripts:dist', ['uglify:compile'])

	grunt.registerTask('styles:dev', ['sass:dev'])
	grunt.registerTask('styles:dist', ['sass:dist'])
}
