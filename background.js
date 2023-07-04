"use strict";

chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({
		id: 'copyImage',
		title: 'Open image in new tab',
		contexts: ['all'],
	});

	chrome.contextMenus.create({
		id: 'copyElement',
		title: 'Copy element text',
		contexts: ['all'],
	});
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	if (info.menuItemId == 'copyImage') {
		chrome.tabs.sendMessage(tab.id, {"getFirstImage": true}, function(response) {
			if (response) {
				chrome.tabs.create({
					url: response,
					active: true,
					index: tab.index + 1,
				});
			}
		});
	}

	if (info.menuItemId == 'copyElement') {
		chrome.tabs.sendMessage(tab.id, {"getLastElement": true});
	}
});

