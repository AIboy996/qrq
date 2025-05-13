"use strict";

// 当扩展安装或更新时创建右键菜单
chrome.runtime.onInstalled.addListener(function () {
	// 创建文本选择的右键菜单
	chrome.contextMenus.create({
		id: "generateQRFromText",
		title: "生成文本二维码",
		contexts: ["selection"]
	});

	// 创建图片的右键菜单
	chrome.contextMenus.create({
		id: "generateQRFromImage",
		title: "生成图片链接二维码",
		contexts: ["image"]
	});

	// 创建链接的右键菜单
	chrome.contextMenus.create({
		id: "generateQRFromLink",
		title: "生成链接二维码",
		contexts: ["link"]
	});

	// 创建页面的右键菜单
	chrome.contextMenus.create({
		id: "generateQRFromPage",
		title: "生成当前页面二维码",
		contexts: ["page"]
	});
});

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener(function (info, tab) {
	// 根据不同的菜单项准备不同的消息数据
	let messageData = null;

	if (info.menuItemId === "generateQRFromText" && info.selectionText) {
		messageData = {
			text: info.selectionText
		};
	} else if (info.menuItemId === "generateQRFromImage" && info.srcUrl) {
		messageData = {
			text: info.srcUrl,
			isImageUrl: true
		};
	} else if (info.menuItemId === "generateQRFromLink" && info.linkUrl) {
		messageData = {
			text: info.linkUrl,
			isLink: true
		};
	} else if (info.menuItemId === "generateQRFromPage") {
		messageData = {
			text: tab.url,
			isPageUrl: true
		};
	}

	// 如果有有效的消息数据，发送消息
	if (messageData) {
		messageData.action = "generateQR";
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			const activeTab = tabs[0];
			chrome.tabs.sendMessage(activeTab.id, messageData, function(response) {
				if (chrome.runtime.lastError) {
					console.log('Error:', chrome.runtime.lastError.message);
					return;
				}
				if (response && response.error) {
					console.error('QR code generation failed:', response.error);
				}
			});
		});
	}
});

