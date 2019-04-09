(function() {
	const out$ = typeof exports != 'undefined' && exports || typeof define != 'undefined' && {} || this || window;
	if (typeof define !== 'undefined') define('save-svg-as-png', [], () => out$);
	out$.default = out$;

	const xhtmlNs = 'http://www.w3.org/2000/xmlns/';
	const svgNs = 'http://www.w3.org/2000/svg';
	const xhtmlNs2 = 'http://www.w3.org/1999/xhtml/';
	const doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [<!ENTITY nbsp "&#160;">]>';
	const urlRegex = /url\(["']?(.+?)["']?\)/;
	const fontFormats = {
		woff2: 'font/woff2',
		woff: 'font/woff',
		otf: 'application/x-font-opentype',
		ttf: 'application/x-font-ttf',
		eot: 'application/vnd.ms-fontobject',
		sfnt: 'application/font-sfnt',
		svg: 'image/svg+xml'
	};

	const isElement = obj => obj instanceof HTMLElement || obj instanceof SVGElement;
	const requireDomNode = el => {
		if (!isElement(el)) throw new Error(`an HTMLElement or SVGElement is required; got ${el}`);
	};
	const requireDomNodePromise = el =>
		  new Promise((resolve, reject) => {
			  if (isElement(el)) resolve(el)
			  else reject(new Error(`an HTMLElement or SVGElement is required; got ${el}`));
		  })
	const isExternal = url => url && url.lastIndexOf('http',0) === 0 && url.lastIndexOf(window.location.host) === -1;

	const getFontMimeTypeFromUrl = fontUrl => {
		const formats = Object.keys(fontFormats)
			  .filter(extension => fontUrl.indexOf(`.${extension}`) > 0)
			  .map(extension => fontFormats[extension]);
		if (formats) return formats[0];
		console.error(`Unknown font format for ${fontUrl}. Fonts may not be working correctly.`);
		return 'application/octet-stream';
	};

	const arrayBufferToBase64 = buffer => {
		let binary = '';
		const bytes = new Uint8Array(buffer);
		for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
		return window.btoa(binary);
	}

	const getDimension = (el, clone, dim) => {
		const v =
			  (el.viewBox && el.viewBox.baseVal && el.viewBox.baseVal[dim]) ||
			  (clone.getAttribute(dim) !== null && !clone.getAttribute(dim).match(/%$/) && parseInt(clone.getAttribute(dim))) ||
			  el.getBoundingClientRect()[dim] ||
			  parseInt(clone.style[dim]) ||
			  parseInt(window.getComputedStyle(el).getPropertyValue(dim));
		return typeof v === 'undefined' || v === null || isNaN(parseFloat(v)) ? 0 : v;
	};

	const getDimensions = (el, clone, width, height) => {
		if (el.tagName === 'svg') return {
			width: width || getDimension(el, clone, 'width'),
			height: height || getDimension(el, clone, 'height')
		};
		else if (el.getBBox) {
			const {x, y, width, height} = el.getBBox();
			return {
				width: x + width,
				height: y + height
			};
		}
	};

	const reEncode = data =>
		  decodeURIComponent(
			  encodeURIComponent(data)
				  .replace(/%([0-9A-F]{2})/g, (match, p1) => {
					  const c = String.fromCharCode(`0x${p1}`);
					  return c === '%' ? '%25' : c;
				  })
		  );

	const uriToBlob = uri => {
		const byteString = window.atob(uri.split(',')[1]);
		const mimeString = uri.split(',')[0].split(':')[1].split(';')[0]
		const buffer = new ArrayBuffer(byteString.length);
		const intArray = new Uint8Array(buffer);
		for (let i = 0; i < byteString.length; i++) {
			intArray[i] = byteString.charCodeAt(i);
		}
		return new Blob([buffer], {type: mimeString});
	};

	const query = (el, selector) => {
		if (!selector) return;
		try {
			return el.querySelector(selector) || el.parentNode && el.parentNode.querySelector(selector);
		} catch(err) {
			console.warn(`Invalid CSS selector "${selector}"`, err);
		}
	};

	const detectCssFont = (rule, href) => {
		// Match CSS font-face rules to external links.
		// @font-face {
		//   src: local('Abel'), url(https://fonts.gstatic.com/s/abel/v6/UzN-iejR1VoXU2Oc-7LsbvesZW2xOQ-xsNqO47m55DA.woff2);
		// }
		const match = rule.cssText.match(urlRegex);
		const url = (match && match[1]) || '';
		if (!url || url.match(/^data:/) || url === 'about:blank') return;
		const fullUrl =
			  url.startsWith('../') ? `${href}/../${url}`
			  : url.startsWith('./') ? `${href}/.${url}`
			  : url;
		return {
			text: rule.cssText,
			format: getFontMimeTypeFromUrl(fullUrl),
			url: fullUrl
		};
	};


	const inlineImages = el => Promise.all(
		Array.from(el.querySelectorAll('img')).map(image => {
			//let href = image.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || image.getAttribute('href');
			let href = image.getAttributeNS('http://www.w3.org/1999/xlink', 'src') || image.getAttribute('src');
			if (!href) return Promise.resolve(null);
			if (isExternal(href)) {
				href += (href.indexOf('?') === -1 ? '?' : '&') + 't=' + new Date().valueOf();
			}

			return new Promise((resolve, reject) => {
				const canvas = document.createElement('canvas');
				const img = new Image();
				img.crossOrigin = 'anonymous';
				img.src = href;
				img.onerror = () => reject(new Error(`Could not load ${href}`));
				img.onload = () => {
					canvas.width = img.width;
					canvas.height = img.height;
					canvas.getContext('2d').drawImage(img, 0, 0);
					image.setAttributeNS('http://www.w3.org/1999/xlink', 'src', canvas.toDataURL('image/png'));
					image.src = canvas.toDataURL('image/png');
					image.xmlns = "http://www.w3.org/1999/xhtml";
					resolve(true);
				};
			});
		})
	);

	function fileToBase64(url, callback) {
		//console.log("converting " + url + " to image.");
		var image = new Image();
		image.onload = function () {
			var canvas = document.createElement('canvas');
			canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
			canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size
			canvas.getContext('2d').drawImage(this, 0, 0);
			// Get raw image data
			callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));
			// ... or get as Data URI
			callback(canvas.toDataURL('image/png'));
		};
		image.src = url;
	}
	
	const cachedFonts = {};
	const inlineFonts = fonts => Promise.all(
		fonts.map(font =>
				  new Promise((resolve, reject) => {
					  if (cachedFonts[font.url]) return resolve(cachedFonts[font.url]);

					  const req = new XMLHttpRequest();
					  req.addEventListener('load', () => {
						  // TODO: it may also be worth it to wait until fonts are fully loaded before
						  // attempting to rasterize them. (e.g. use https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet)
						  const fontInBase64 = arrayBufferToBase64(req.response);
						  const fontUri = font.text.replace(urlRegex, `url("data:${font.format};base64,${fontInBase64}")`)+'\n';
						  cachedFonts[font.url] = fontUri;
						  resolve(fontUri);
					  });
					  req.addEventListener('error', e => {
						  console.warn(`Failed to load font from: ${font.url}`, e);
						  cachedFonts[font.url] = null;
						  resolve(null);
					  });
					  req.addEventListener('abort', e => {
						  console.warn(`Aborted loading font from: ${font.url}`, e);
						  resolve(null);
					  });
					  req.open('GET', font.url);
					  req.responseType = 'arraybuffer';
					  req.send();
				  })
				 )
	).then(fontCss => fontCss.filter(x => x).join(''));

	let cachedRules = null;
	const styleSheetRules = () => {
		if (cachedRules) return cachedRules;
		return cachedRules = Array.from(document.styleSheets).map(sheet => {
			try {
				return {rules: sheet.cssRules, href: sheet.href};
			} catch (e) {
				console.warn(`Stylesheet could not be loaded: ${sheet.href}`, e);
				return {};
			}
		});
	};

	const inlineCss = (el, options) => {
		const {
			selectorRemap,
			modifyStyle,
			modifyCss,
			fonts
		} = options || {};
		const generateCss = modifyCss || ((selector, properties) => {
			const sel = selectorRemap ? selectorRemap(selector) : selector;
			const props = modifyStyle ? modifyStyle(properties) : properties;
			return `${sel}{${props}}\n`;
		});
		const css = [];
		const detectFonts = typeof fonts === 'undefined';
		const fontList = fonts || [];
		styleSheetRules().forEach(({rules, href}) => {
			if (!rules) return;
			Array.from(rules).forEach(rule => {
				if (typeof rule.style != 'undefined') {
					if (query(el, rule.selectorText)) css.push(generateCss(rule.selectorText, rule.style.cssText));
					else if (detectFonts && rule.cssText.match(/^@font-face/)) {
						const font = detectCssFont(rule, href);
						if (font) fontList.push(font);
					} else css.push(rule.cssText);
				}
			});
		});
		return inlineFonts(fontList).then(fontCss => css.join('\n') + fontCss);
	};

	out$.prepareSvg = (el, options, done) => {
		requireDomNode(el);
		const {
			left = 0,
			top = 0,
			width: w,
			height: h,
			scale = 1,
			responsive = false,
		} = options || {};
		
		return inlineImages(el).then(() => {
			Array.from(el.querySelectorAll('foreignObject > *')).forEach(fo => {
				fo.xmlns = "http://www.w3.org/1999/xhtml"
				fo.setAttribute('xmlns', "http://www.w3.org/1999/xhtml");
			})
			let clone = el.cloneNode(true);
			clone.style.backgroundColor = (options || {}).backgroundColor || el.style.backgroundColor;
			const {width, height} = getDimensions(el, clone, w, h);

			if (el.tagName !== 'svg') {
				if (el.getBBox) {
					if (clone.getAttribute('transform') != null) {
						clone.setAttribute('transform', clone.getAttribute('transform').replace(/translate\(.*?\)/, ''));
					}
					const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
					svg.appendChild(clone);
					clone = svg;
				} else {
					console.error('Attempted to render non-SVG element', el);
					return;
				}
			}

			clone.setAttribute('version', '1.1');
			clone.setAttribute('viewBox', [left, top, width, height].join(' '));
			if (!clone.getAttribute('xmlns')) clone.setAttributeNS(xhtmlNs, 'xmlns', svgNs);
			if (!clone.getAttribute('xmlns:xlink')) clone.setAttributeNS(xhtmlNs, 'xmlns:xlink', 'http://www.w3.org/1999/xlink');

			if (responsive) {
				clone.removeAttribute('width');
				clone.removeAttribute('height');
				clone.setAttribute('preserveAspectRatio', 'xMinYMin meet');
			} else {
				clone.setAttribute('width', width * scale);
				clone.setAttribute('height', height * scale);
			}

			Array.from(clone.querySelectorAll('foreignObject > *')).forEach(foreignObject => {
				if (foreignObject.tagName === 'svg')
					foreignObject.setAttributeNS(xhtmlNs, 'xmlns', svgNs);
				else if (!foreignObject.getAttribute('xmlns')) {
					foreignObject.setAttributeNS(xhtmlNs, 'xmlns', xhtmlNs2);
				} 
			});

			return inlineCss(el, options).then(css => {
				const style = document.createElement('style');
				style.setAttribute('type', 'text/css');
				style.innerHTML = `<![CDATA[\n${css}\n]]>`;

				const defs = document.createElement('defs');
				defs.appendChild(style);
				clone.insertBefore(defs, clone.firstChild);

				const outer = document.createElement('div');
				outer.appendChild(clone);
				const src = outer.innerHTML.replace(/NS\d+:href/gi, 'xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href');

				if (typeof done === 'function') done(src, width, height);
				else return {src, width, height};
			});
		});
	};

	out$.svgAsDataUri = function(el, options, done) {
		requireDomNode(el);
		var result = out$.prepareSvg(el, options).then(function(_ref5) {
			var src = _ref5.src;
			//src = src.replace(/(?<!<svg[^>]+)xmlns[^ >]+/gi, "")
			src = src.replace(/(<img[^>]+)>/gi, "$1 ></img>");
			let url = src.match(/(?<=<img[^>]+src=")[^"]+/);
			let imagedata = "data:image/png;base64,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";
			//src = src.replace(/\.\.\/\.\.\/images\/profile\.png/g,imagedata);
			/*
			function loadImage(href) {
				return new Promise((resolve, reject) => {
					const canvas = document.createElement('canvas');
					const img = new Image();
					img.crossOrigin = 'anonymous';
					img.src = href;
					img.onerror = () => reject(new Error(`Could not load ${href}`));
					img.onload = () => {
						canvas.width = img.width;
						canvas.height = img.height;
						canvas.getContext('2d').drawImage(img, 0, 0);
						img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', canvas.toDataURL('image/png'));
						resolve(true);
					}
				});
			}
			url.forEach(function (d){
				loadImage(d).then(img => {
					console.log("done");
					console.log(img);
					src = src.replace(d, img);
				})
			});
			*/

			
			console.log("All done");
			//console.log("src: ", src);
			console.log("src printed.");
			//console.log("data:image/svg+xml;base64," +
			//		window.btoa(reEncode(doctype + src)));
			return (
				"data:image/svg+xml;base64," +
					window.btoa(reEncode(doctype + src))
			);
		});
		if (typeof done === "function") return result.then(done);
		return result;
	};
	
	out$.svgAsPngUri = (el, options, done) => {
		requireDomNode(el);
		const {
			encoderType = 'image/png',
			encoderOptions = 0.8,
			canvg
		} = options || {};

		const convertToPng = ({src, width, height}) => {
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			const pixelRatio = window.devicePixelRatio || 1;

			canvas.width = width * pixelRatio;
			canvas.height = height * pixelRatio;
			canvas.style.width = `${canvas.width}px`;
			canvas.style.height = `${canvas.height}px`;
			context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

			if (canvg) canvg(canvas, src);
			else context.drawImage(src, 0, 0);

			let png;
			try {
				png = canvas.toDataURL(encoderType, encoderOptions);
			} catch (e) {
				if ((typeof SecurityError !== 'undefined' && e instanceof SecurityError) || e.name === 'SecurityError') {
					console.error('Rendered SVG images cannot be downloaded in this browser.');
					return;
				} else throw e;
			}
			if (typeof done === 'function') done(png, canvas.width, canvas.height);
			return Promise.resolve(png);
		}

		if (canvg) return out$.prepareSvg(el, options).then(convertToPng);
		else return out$.svgAsDataUri(el, options).then(uri => {
			return new Promise((resolve, reject) => {
				const image = new Image();
				image.onload = () => resolve(convertToPng({
					src: image,
					width: image.width,
					height: image.height
				}));
				image.onerror = () => {
					reject(`There was an error loading the data URI as an image on the following SVG\n${window.atob(uri.slice(26))}Open the following link to see browser's diagnosis\n${uri}`);
				}
				image.src = uri;
			})
		});
	};

	out$.download = (name, uri) => {
		if (navigator.msSaveOrOpenBlob) navigator.msSaveOrOpenBlob(uriToBlob(uri), name);
		else {
			const saveLink = document.createElement('a');
			if ('download' in saveLink) {
				saveLink.download = name;
				saveLink.style.display = 'none';
				document.body.appendChild(saveLink);
				try {
					const blob = uriToBlob(uri);
					const url = URL.createObjectURL(blob);
					saveLink.href = url;
					saveLink.onclick = () => requestAnimationFrame(() => URL.revokeObjectURL(url));
				} catch (e) {
					console.error(e);
					console.warn('Error while getting object URL. Falling back to string URL.');
					saveLink.href = uri;
				}
				saveLink.click();
				document.body.removeChild(saveLink);
			} else {
				window.open(uri, '_temp', 'menubar=no,toolbar=no,status=no');
			}
		}
	};

	out$.saveSvg = (el, name, options) => {
		return requireDomNodePromise(el)
			.then(el => out$.svgAsDataUri(el, options || {}))
			.then(uri => out$.download(name, uri));
	};

	out$.saveSvgAsPng = (el, name, options) => {
		return requireDomNodePromise(el)
			.then(el => out$.svgAsPngUri(el, options || {}))
			.then(uri => out$.download(name, uri));
	};
})();
