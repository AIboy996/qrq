// 确保QRCode库已加载
let qrcodeScript = document.createElement('script');
qrcodeScript.src = chrome.runtime.getURL('qrcode.min.js');
qrcodeScript.onload = function () {
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
			// 检查文本长度限制
			if (message.text.length > 2000) {
				alert('文本内容过长，请选择少于2000个字符的内容');
				sendResponse({ success: false, error: 'Text too long' });
				return true;
			}

			// 移除已存在的二维码容器
			const existingContainer = document.getElementById('qrcode-container');
			if (existingContainer) {
				document.body.removeChild(existingContainer);
			}

			// 移除已存在的遮罩层
			const existingOverlay = document.getElementById('qrcode-overlay');
			if (existingOverlay) {
				document.body.removeChild(existingOverlay);
			}

			// 创建遮罩层
			const overlay = document.createElement('div');
			overlay.id = 'qrcode-overlay';
			overlay.style.cssText = `
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: rgba(0, 0, 0, 0.5);
				z-index: 999998;
			`;

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
				cursor: default;
				text-align: center;
			`;

			// 创建加载提示
			const loadingDiv = document.createElement('div');
			loadingDiv.textContent = '正在生成二维码...';
			loadingDiv.style.cssText = `
				color: #666;
				margin-bottom: 10px;
			`;
			qrContainer.appendChild(loadingDiv);

			// 添加到页面
			document.body.appendChild(overlay);
			document.body.appendChild(qrContainer);

			// 点击遮罩层关闭
			overlay.addEventListener('click', function (e) {
				document.body.removeChild(overlay);
				document.body.removeChild(qrContainer);
			});

			// 阻止点击二维码容器时关闭
			qrContainer.addEventListener('click', function (e) {
				e.stopPropagation();
			});

			// 使用QR Code Generator API生成二维码
			const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(message.text)}`;

			// 创建图片元素
			const img = document.createElement('img');
			img.style.cssText = `
				max-width: 256px;
				height: auto;
				display: block;
				margin: 0 auto;
			`;

			img.onload = function () {
				// 移除加载提示
				qrContainer.removeChild(loadingDiv);

				// 添加提示文本
				const tipDiv = document.createElement('div');
				tipDiv.style.cssText = `
					text-align: center;
					margin-top: 10px;
					color: #666;
					font-size: 14px;
				`;
				tipDiv.textContent = '扫描二维码查看内容';
				qrContainer.appendChild(tipDiv);

				console.log('QR code generated successfully');
				sendResponse({ success: true });
			};

			img.onerror = function () {
				loadingDiv.textContent = '生成二维码失败，请重试';
				console.error('Error loading QR code image');
				sendResponse({ success: false, error: 'Failed to load QR code image' });
			};

			img.src = apiUrl;
			qrContainer.appendChild(img);

		} catch (error) {
			console.error('Error generating QR code:', error);
			sendResponse({ success: false, error: error.message });
		}
		return true;
	}
	return true;
});