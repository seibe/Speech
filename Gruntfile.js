"use strict"

var LIVERELOAD_PORT = 35729;

module.exports = function (grunt) {
	var LISTEN_PORT_HTTP = grunt.option('port') || 8000;

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),        

        // クライアント側サーバー
        connect: {
			client: {
				options: {
					port: LISTEN_PORT_HTTP,
					livereload: true,
					base: 'out/client',
					open: ['http://localhost:' + LISTEN_PORT_HTTP + '/']
				}
			}
        },
		
		// HAXE自動コンパイル
		haxe: {
			client: {
				hxml: "compile_client.hxml"
			},
			server: {
				hxml: "compile_server.hxml"
			}
		},

        /* CSS自動プリフィックス付加
        autoprefixer: {
			options: {
				browsers: ['last 2 version']
			},
            def: {
                src: "bin_client/origin.css",
                dest: "bin_client/style.css"
            }
		},
		
		// JS結合
		uglify: {
			zepto : {
				files: {'bin_client/zepto.min.js': [
					'bin_client/zepto/zepto.js',
					'bin_client/zepto/event.js'
				]}
			}
		},*/
		
        // ファイル監視
        watch: {
            options: {
                livereload: true
            },
            js: {
            	files: [ 'Gruntfile.js' ]
            },
			html: {
				files: [ '*.html' ]
			},
			haxe: {
				files: [ 'src/**/*.hx' ],
				tasks: [ 'haxe:client', 'haxe:server' ]
			}
        }
    });
    
    require('jit-grunt')(grunt);
    grunt.registerTask("default", ["connect", "watch"]);
};