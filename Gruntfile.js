module.exports = function(grunt) {
	/**
	   Les imports des taches que peut gerer Grunt.
	   Les modules correspondant ont étaient préalablement téléchargé via
	   "npm" et enregistré dans le "package.json".
	   Exemple de commandes de telechargement: "npm install grunt-contrib-sass --save-dev". ("--save-dev": enregistre dans les dépendances)
	*/
	grunt.loadNpmTasks('grunt-contrib-sass'); // /!\ Pour que "sass" soit opérationnel, il faut installer "Ruby" et "sass" avec "gem".
	grunt.loadNpmTasks('grunt-jsdoc'); // Allows to generate html documentation. It needs Java, on windows Java must be append in the PATH
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browser-sync'); // Allows to synchronize the browsers during the development 

	/** On met la liste des fichiers à concaténer dans une variable. */
	var app = "dev/js/";
	var module = "dev/js/module/";
	
	var jsSrc = [
		module + 'util.js',
		module + 'app.js',
		module + 'key.js',
		module + 'Shortcut.js',
		module + 'RichTextArea.js',
		module + 'Translate.js',
		module + 'ContextMenu.js',
		app + 'ListTitle.js',
		app + 'List.js',
		app + 'Card.js',
		app + "main.js"
		],
		jsDist = 'dist/js/built.js';

	/** Configuration de Grunt */
	grunt.initConfig({
		watch: { /** Permet de surveiller les fichiers, au moindre changement il lance la t�che attach�e au fichier. */
			scripts: {
				files: '**/*.js',
				tasks: ['scripts:dev']
			},
			styles: {
				files: '**/*.scss',
				tasks: ['styles:dev']
			}
		},
		sass: { /** Compile les .scss */
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
		concat: { /** Concatène les scripts en un seul. */
			options: {
				separator: ';'
			},
			compile: { /** On renomme vu qu'on a pas de mode dev/dist. Dist �tant une autre tache : uglify */
				src: jsSrc,
				dest: jsDist
			}
		},
		uglify: { /** Minifie les scripts */
			options: {
				separator: ';'
			},
			compile: {
				src: jsSrc,
				dest: jsDist
			}
		},
		jsdoc: { /** Génère la documentation */
			generate: {
				src: jsSrc,
				options: {
					destination: 'doc'
				}
			}
		},
		browserSync: {
            dev: {
                bsFiles: {
                    src : ['dist/css/*.css', 'dist/js/*.js']
                },
                options: {
					server: {
						baseDir: "./"
					},
                    watchTask: true /** VERY important */
                }
            }
        }
	})

	grunt.registerTask('default', ['browserSync', 'dev', 'watch']) // C'est la tache lancée par défaut en tapant juste "grunt" en ligne de commande.
	grunt.registerTask('dev', ['styles:dev', 'scripts:dev']) // C'est la tache lancer en tapant "grunt dev" en ligne de commande.
	grunt.registerTask('dist', ['styles:dist', 'scripts:dist']) // C'est la t�che lancer en tapant "grunt dist" en ligne de commande.
	grunt.registerTask('doc', ['jsdoc:generate'])

	/** Des commandes et tâches plus spécifiques */
	grunt.registerTask('scripts:dev', ['concat:compile'])
	grunt.registerTask('scripts:dist', ['uglify:compile'])

	grunt.registerTask('styles:dev', ['sass:dev'])
	grunt.registerTask('styles:dist', ['sass:dist'])
}
