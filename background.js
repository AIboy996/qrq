"use strict";

// 当扩展安装或更新时创建右键菜单
chrome.runtime.onInstalled.addListener(function () {
	chrome.contextMenus.create({
		id: "generateQRCode",
		title: "生成二维码",
		contexts: ["selection"]
	});
});

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener(function (info, tab) {
	if (info.menuItemId === "generateQRCode" && info.selectionText) {
		// 注入content script
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			const activeTab = tabs[0];
			chrome.tabs.sendMessage(activeTab.id, {
				action: "generateQR",
				text: info.selectionText
			}, function(response) {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError.message);
					return;
				}
				if (response && response.error) {
					console.error('QR code generation failed:', response.error);
				}
			});
		});
	}
});

