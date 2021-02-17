const fs = require('fs')
const path = require('path');
const logs = false;
module.exports = (gulp, plugins, options, argv) => gulp.series(
	gulp.parallel(
		// Correct Markup in ETCSL Texts
		(done) => {
			return gulp.src([
				`src/etcsl/**/*.html`,
			])
				.pipe(plugins.replaceString(
					new RegExp('<\/?(!DOCTYPE html|html|meta|link|head\\b|title|body)[^>]*>', 'gi'),
					'',
					{ logs },
				))
				.pipe(plugins.replaceString(
					new RegExp('<table[^>]*>\\s*(<tbody[^>]*>\\s*)?', 'g'),
					'<ol>\n',
					{ logs },
				))
				.pipe(plugins.replaceString(
					new RegExp('<tr><td[^>]*>(<a[^>]*>[^<]*</a>)+</td><td[^>]*>\\s*', 'g'),
					'\t<li>',
					{ logs },
				))
				.pipe(plugins.replaceString(
					new RegExp(`<span onMouseover=[^']+'([^']+)'[^>]*>`, 'g'),
					'<span title="$1">',
					{ logs },
				))
				.pipe(plugins.replaceString(
					new RegExp('\\s*</td></tr>', 'g'),
					'</li>',
					{ logs },
				))
				.pipe(plugins.replaceString(
					new RegExp('(</tbody>\\s*)?</table>', 'g'),
					'</ol>',
					{ logs },
				))
				.pipe(gulp.dest('build/etcsl'));
		},
		// Correct Markup in CDLI Texts
		() => gulp.src([
			'src/cdli/**/*.html',
		])
			.pipe(plugins.replaceString(
				new RegExp('<(!DOCTYPE html)[^>]*>(.|\n)*?<table>', 'gi'),
				'<ol>',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp('\\s*(<tr\\b[^>]*>|<\/tr>)(\\s|\n)*', 'gi'),
				'',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp('\\s*<td>(\&nbsp;|Q\\d{6}).*?<\/td>(\\s|\n)*', 'gi'),
				'',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp('\\s*<\/td>(\\s|\n)*', 'g'),
				'</span></li>',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp('\\s*<td[^>]*>(\\s|\n)*', 'g'),
				'\n\t<li><span>',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp('<\/table>(.|\n)*?</html>', 'gi'),
				'\n</ol>',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp('&amp;', 'g'),
				' / ',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp('[[\\]#\\|]', 'gi'),
				'',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp('{', 'g'),
				'<sup>',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp('}', 'g'),
				'</sup>',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp(' ', 'g'),
				'</span> <span>',
				{ logs },
			))
			.pipe(gulp.dest('build/cdli')),
		// Correct markup in Enuma Elish
		() => gulp.src([
			'src/enuma-elish.html',
		])
			.pipe(plugins.replaceString(
				new RegExp('&#x20;', 'g'),
				' ',
				{ logs },
			))
					/*
			.pipe(plugins.replaceString(
				new RegExp('<br\\s*\/?>(\\s|\n)*', 'g'),
				'</li>\n<li>',
				{ logs },
			))
			/**/
			.pipe(plugins.replaceString(
				new RegExp('<strong>([a-z0-9.-]+)</strong>', 'g'),
				'<span title="$1">$1</span>',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp('-', 'g'),
				'<wbr>',
				{ logs },
			))
			.pipe(gulp.dest('build')),
	),
	(done) => {
		// Convert pattern to RegExp
		const patternToRegExp = (pattern) => {
			if (typeof pattern === 'string') {
				pattern = pattern.replace(/-/g, '\-');
				pattern = pattern.replace(/(^|[^\\])\w$/i, '$&\\b');
				pattern = pattern.replace(/^\w/i, '\\b$&');
				pattern = new RegExp(pattern, 'g');
			}
			return pattern;
		};

		// Now Transliterate!
		(argv.file || [
			'etcsl/{1,2,3,4,5,6}.*',
			'cdli/Q*.html',
			'enuma-elish.html',
		]).map(file => {
			let folder = '';
			if (file.includes('/')) {
				[folder, file] = file.split('/', 2);
			}
			return {
				folder,
				selection: `${file}{,.html}`,
				script: 'cuneiform',
			};
		}).forEach((obj) => {
			const json = JSON.parse(fs.readFileSync(`./src/${obj.script}.json`));
			let stream = gulp.src([
				path.join('build', obj.folder, obj.selection),
			]);

			if (Array.isArray(json.remove)) {
				stream = stream.pipe(plugins.replaceString(new RegExp(`(?:${json.remove.join('|')})`, 'g'), '', { logs }));
			}

			if (Array.isArray(json['special-chars'])) {
				json['special-chars'].forEach((d) => {
					stream = stream.pipe(plugins.replaceString(patternToRegExp(d[0]), d[1], { logs }));
				});
			}

			// Transliterate special/peculiar words
			if (Array.isArray(json.dictionary)) {
				json.dictionary.forEach((d) => {
					stream = stream.pipe(plugins.replaceString({
						pattern: patternToRegExp(`>\\s?${d.pattern || d[0]}\\s?<`),
						replacement: `>${d.replacement || d[1]}<`,
						logs: d.logs || logs,
					}));
				});
			}

			// Transliterate individual cuneiform signs
			if (Array.isArray(json.unicode)) {
				json.unicode = json.unicode.reverse().filter((d) => {
					d = d.pattern || d[0];
					// Don't replace numbers yet
					if (d.match(/^[0-9,]+$/)) return false;
					if (d.match(/\b(or|one|two|three|four|five|six|seven|eight|nine)\b/)) return false;
					return true;
				});
				// Break up compounds and search for constituent characters
				// e.g., ed3-de3-a-ba => [ ed3, de3, a, ba ] => [ &#x12313;&#x200D;&#x1207a;, &#x12248;, &#x12000;, &#x12040; ]
				stream = stream.pipe(plugins.replaceString(/>\s*(&#x12[0-9a-f]{3};)?(?:|[a-z0-9ÀàÁáÉéĜĝḪḫÍíŠšÙùÚúÛû×]+)(?:&#x12[0-9a-f]{3};|[-\.](&#x12[0-9a-f]{3};)?(?:[a-z0-9ÀàÁáÉéĜĝḪḫÍíŠšÙùÚúÛû×]+))*\s*</gi, (word) => {
					word = word.replace(/^>\s*|\s*<$/g, '');
					const r = word.split(/[-\.]|(&#x12[0-9a-f]{3};)/i).map((p) => {
						let sym;
						json.unicode.forEach((d) => {
							if (sym) return;
							if (new RegExp(`^${d.pattern || d[0]}$`).test(p)) {
								sym = d.replacement || d[1];
							}
						});
						return sym || p;
					}).join('');
					return `>${r}<`;
				}, { logs }));
			}

			// Transliterate Number Codes
			if (Array.isArray(json.numbers)) {
				stream = stream.pipe(plugins.replaceString(/>NU:([^<]*)+</gi, (str, signs) => {
					const r = signs.split(/-|(&#x12[0-9a-f]{3};)/i).map((s) => {
						let sym;
						json.numbers.forEach((d) => {
							if (sym) return;
							if (new RegExp(`^${d.pattern || d[0]}$`).test(s)) {
								sym = d.replacement || d[1];
							}
						});
						return sym || s;
					}).join('');
					return `>${r}<`;
				}, { logs }));
			}

			// Remove superscript around cuneiform
			stream.pipe(plugins.replaceString(/<sup>((?:&#x12[0-9a-f]{3};)+)<\/sup>/gi, (str, signs) => signs, { logs }))

			// Now to wrap our cuneiform in ruby
			if (json.ruby) {
				if (!Array.isArray(json.ruby)) {
					json.ruby = [json.ruby];
				}

				function rubyReplace(ruby) {
					return function () {
						this.querySelectorAll(ruby.query).forEach((el) => {
							let html = ` <ruby class="${el.getAttribute('class') || ''}" lang="${ruby['@lang'] || 'en'}" translate="no">${eval(ruby.rb)}`;
							[
								'rt',
								'rtc',
							].forEach((tag) => {
								if (!Array.isArray(ruby[tag])) {
									ruby[tag] = [ruby[tag]];
								}
								ruby[tag].forEach((val) => {
									const txt = eval(val.eval);
									if (txt && txt !== 'X' && txt !== '…') {
										html += `<${tag} lang="${val['@lang'] || 'en'}" translate="${tag === 'rt' ? 'no' : 'yes'}">${txt}`;
									}
								});
							});
							html += `</ruby> `;
							el.outerHTML = html;
						});
					}
				}

				json.ruby.forEach((ruby) => {
					stream = stream.pipe(plugins.dom(rubyReplace(ruby)))
						.pipe(plugins.replaceString(
							new RegExp(`<\/?(!DOCTYPE html|html|body|head\\b)[^>]*>`, 'gi'),
							'',
						));
				});
			}

			// Output Results
			stream.pipe(gulp.dest(path.join(options.dest, obj.folder !== '**' ? obj.folder : '')))
		});
		done();
	},
);
