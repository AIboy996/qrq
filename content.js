function copyToClipboard(text, done) {
	var ta = document.createElement('textarea');
	ta.value = text;
	document.body.appendChild(ta);
	ta.select();

	// Method 1: doesn't seem to work in content scripts...
	document.execCommand('copy');

	// Method 2: keep the text in the textarea selected until the copy
	// trigger is done: the normal copy procedure will have copied the text
	requestAnimationFrame(function() {
		document.body.removeChild(ta);
		done && done();
	});
}


/**
 * Context menu item (background page)
 */

var lastElement, lastContext = {x: 0, y: 0};
document.addEventListener('contextmenu', function(e) {
	lastElement = e.target;
	lastContext.x = e.x;
	lastContext.y = e.y;
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (lastElement) {
		if (message.getLastElement) {
			const text = lastElement.textContent.trim();
			copyToClipboard(text);
			sendResponse(text);
		}

		if (message.getFirstImage) {
			var style = document.createElement('style');
			style.textContent = ':before, :after { visibility: hidden !important; }';
			document.head.insertBefore(style, document.head.firstChild);

			console.debug('[copyables] lastContext', lastContext);

			// Trigger reflow?
			var x = lastElement.offsetHeight;

			// Evaluate for all elements under the pointer
			var els = document.elementsFromPoint(lastContext.x, lastContext.y);
			var src = '';
			for (var i=0; i<els.length; i++) {
				var el = els[i];
				src = tryElementImage(el);
				if (src) {
					break;
				}
			}

			// Send result, empty or not, back to background script
			console.debug('[copyables] Found', '"' + src + '"');
			sendResponse(src);

			style.remove();
		}
	}
});

function tryElementImage(el) {
	if (el.nodeName == 'HTML') {
		var src = tryElementImage(document.body);
		if (src) {
			return src;
		}
	}

	console.debug('[copyables] Trying', el);

	var styles = getComputedStyle(el);
	var opacity = styles.opacity;
	var visibility = styles.visibility;

	if (parseFloat(opacity) === 0 || visibility === 'hidden') {
		return '';
	}

	// @todo Catch `[srcset]`, `<picture>` etc

	if (el.nodeName == 'VIDEO' && el.currentSrc) {
		return el.currentSrc;
	}

	if (el.nodeName == 'IMG' && el.src) {
		return el.src;
	}

	var src = tryElementBackgroundImage(styles.backgroundImage);
	if (src) {
		return src;
	}

	var styles = getComputedStyle(el, '::before');
	src = tryElementBackgroundImage(styles.backgroundImage);
	if (src) {
		return src;
	}

	var styles = getComputedStyle(el, '::after');
	src = tryElementBackgroundImage(styles.backgroundImage);
	if (src) {
		return src;
	}

	return '';
}

function tryElementBackgroundImage(bgImage) {
	if (bgImage && bgImage != 'none') {
		var match = bgImage.match(/url\(['"]?(.+?)['"]?\)/);
		if (match) {
			return match[1];
		}

		if (bgImage.substr(0, 5) === 'data:') {
			return bgImage;
		}
	}

	return '';
}



/**
 * CTRL + V on links
 */

document.addEventListener('copy', function(e) {
	if ( document.activeElement.nodeName == 'A' ) {
		const el = document.activeElement;
		copyToClipboard(el.textContent.trim(), function() {
			el.focus();
		});
	}
});