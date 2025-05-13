// 确保QRCode库已加载
let qrcodeScript = document.createElement('script');
qrcodeScript.src = chrome.runtime.getURL('qrcode.min.js');
qrcodeScript.onload = function() {
	console.log('QRCode library loaded successfully');
};
document.head.appendChild(qrcodeScript);

// 处理来自background的消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log('Received message:', message);
	
	// 处理生成二维码的请求
	if (message.action === "generateQR") {
		console.log('Generating QR code for text:', message.text);
		try {
			// 移除已存在的二维码容器
			const existingContainer = document.getElementById('qrcode-container');
			if (existingContainer) {
				document.body.removeChild(existingContainer);
			}

			// 创建二维码容器
			const qrContainer = document.createElement('div');
			qrContainer.id = 'qrcode-container';
			qrContainer.style.cssText = `
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				background: white;
				padding: 20px;
				border-radius: 8px;
				box-shadow: 0 0 10px rgba(0,0,0,0.3);
				z-index: 999999;
			`;

			// 创建关闭按钮
			const closeButton = document.createElement('div');
			closeButton.innerHTML = '×';
			closeButton.style.cssText = `
				position: absolute;
				top: 5px;
				right: 10px;
				cursor: pointer;
				font-size: 20px;
				color: #666;
			`;
			closeButton.onclick = () => document.body.removeChild(qrContainer);
			qrContainer.appendChild(closeButton);

			// 创建二维码
			const qrDiv = document.createElement('div');
			qrDiv.id = 'qrcode';
			qrContainer.appendChild(qrDiv);

			// 添加到页面
			document.body.appendChild(qrContainer);

			console.log('QR container added to page');

			// 使用qrcode.js生成二维码
			if (typeof QRCode === 'undefined') {
				console.error('QRCode library not loaded!');
				qrDiv.textContent = 'Error: QRCode library not loaded';
				sendResponse({ success: false, error: 'QRCode library not loaded' });
				return true;
			}

			new QRCode(qrDiv, {
				text: message.text,
				width: 256,
				height: 256,
				colorDark: "#000000",
				colorLight: "#ffffff",
				correctLevel: QRCode.CorrectLevel.H
			});

			console.log('QR code generated successfully');
			sendResponse({ success: true });
		} catch (error) {
			console.error('Error generating QR code:', error);
			sendResponse({ success: false, error: error.message });
		}
		return true;
	}
	return true;
});