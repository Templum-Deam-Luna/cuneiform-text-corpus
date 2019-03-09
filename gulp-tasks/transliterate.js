const fs = require('fs')
const path = require('path');
module.exports = (gulp, plugins, options) => gulp.series(
	() => {
		const logs = false;

		// Correct Markup in ETCSL Texts
		return gulp.src([
			`src/etcsl/**/*.html`,
		])
			.pipe(plugins.replaceString(
				new RegExp(`<!DOCTYPE html[^>]*>`, 'gi'),
				'<!DOCTYPE html>',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp(`<meta[^>]*charset=[^>]*>`, 'gi'),
				'<meta charset="utf-8"/>',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp(`(<link[^>]*>\s*)+`, 'gi'),
				'<link rel="stylesheet" href="style.css"/>',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp(`<body\s[^>]*>`, 'gi'),
				'<body>',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp(`<table[^>]*>\s*(<tbody[^>]*>\s*)?`, 'g'),
				'<ol>\n',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp(`<tr><td[^>]*>(<a[^>]*>[^<]*</a>)+</td><td[^>]*>\s*`, 'g'),
				'\t<li>',
				{ logs },
			))
			.pipe(plugins.replaceString(
				new RegExp(`<span onMouseover=[^']+'([^']+)'[^>]*>`, 'g'),
					'<span title="$1">',
					{ logs },
				))
				.pipe(plugins.replaceString(
					new RegExp(`\s*</td></tr>`, 'g'),
					'</li>',
					{ logs },
				))
				.pipe(plugins.replaceString(
					new RegExp(`(</tbody>\s*)?</table>`, 'g'),
					'</ol>',
					{ logs },
				))
				.pipe(gulp.dest('build/etcsl'));
	},
	(done) => {
		// Convert pattern to RegExp
		const patternToRegExp = (pattern) => {
			if (typeof pattern === 'string') {
				pattern = pattern.replace(/-/g, '\-')
				pattern = pattern.replace(/(^|[^\\])\w$/i, '$&\\b')
				pattern = pattern.replace(/^\w/i, '\\b$&')
				pattern = new RegExp(pattern, 'g')
			}
			return pattern
		}
		const logs = false;

		// Now Transliterate!
		Object.entries({
			etcsl: 'cuneiform',
		}).forEach(([folder, script]) => {
			const json = JSON.parse(fs.readFileSync(`./src/${script}.json`));
			let stream = gulp.src([
				`build/${folder}/**/*.html`,
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
			if (Array.isArray(json.unicode)) {
				json.unicode = json.unicode.reverse().filter((d) => {
					d = d.pattern || d[0];
					// Don't replace numbers yet
					if (d.match(/^[0-9,]+$/)) return false;
					if (d.match(/\b(or|one|two|three|four|five|six|seven|eight|nine)\b/)) return false;
					return true;
				});
				// Break up compounds and search for constituent characters
				// e.g., ed3-de3-a-ba => [ ed3, de3, a, ba ] => [ &#x12313;&#x1207a;, &#x12248;, &#x12000;, &#x12040; ]
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
				json.ruby.forEach((ruby) => {
					stream = stream.pipe(plugins.dom((document) => {
						document.querySelectorAll(ruby.query).forEach((el) => {
							let html = ` <ruby class="${el.getAttribute('class') || ''}" lang="${ruby['@lang'] || 'en'}">${eval(ruby.rb)}`;
							const rt = [];
							if (!Array.isArray(ruby.rt)) {
								ruby.rt = [ruby.rt];
							}
							ruby.rt.forEach((rt) => {
								const txt = eval(rt.eval);
								if (txt && txt !== 'X' && txt !== '…') html += `<rt lang="${rt['@lang'] || 'en'}">${txt}`;
							});
							html += `</ruby> `;
							el.outerHTML = html;
						});
					}))
						.pipe(plugins.replaceString(
							new RegExp(`<\/?(!DOCTYPE html|html|body|head)[^>]*>`, 'gi'),
							'',
						));
				});
			}
			// Output Results
			stream.pipe(gulp.dest(path.join(options.dest, folder)))
		});
		done();
	},
);