// 处理来自background的消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	// 处理生成二维码的请求
	if (message.action === "generateQR") {
		try {
			// 检查文本长度限制（对于图片URL和链接URL不检查长度）
			if (!message.isImageUrl && !message.isLink && message.text.length > 2000) {
				alert('文本内容过长，请选择少于2000个字符的内容');
				sendResponse({ success: false, error: 'Text too long' });
				return true;
			}

			// 移除已存在的元素
			['qrcode-container', 'qrcode-overlay'].forEach(id => {
				const element = document.getElementById(id);
				if (element) {
					document.body.removeChild(element);
				}
			});

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
			overlay.addEventListener('click', () => {
				document.body.removeChild(overlay);
				document.body.removeChild(qrContainer);
			});

			// 阻止点击二维码容器时关闭
			qrContainer.addEventListener('click', e => e.stopPropagation());

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
				
				// 根据不同类型显示不同的提示文本
				const tipText = {
					isImageUrl: '扫描二维码查看图片',
					isLink: '扫描二维码访问链接',
				}[Object.keys(message).find(key => message[key] === true)] || '扫描二维码查看内容';
				
				tipDiv.textContent = tipText;
				qrContainer.appendChild(tipDiv);

				// 如果是图片，添加预览
				if (message.isImageUrl) {
					const previewContainer = document.createElement('div');
					previewContainer.style.cssText = `
						margin-top: 10px;
						border-top: 1px solid #eee;
						padding-top: 10px;
					`;
					
					const previewImg = document.createElement('img');
					previewImg.src = message.text;
					previewImg.style.cssText = `
						max-width: 200px;
						max-height: 100px;
						object-fit: contain;
					`;
					
					previewContainer.appendChild(previewImg);
					qrContainer.appendChild(previewContainer);
				}
				
				// 添加预览内容（适用于所有类型）
				const previewContainer = document.createElement('div');
				previewContainer.style.cssText = `
					margin-top: 10px;
					border-top: 1px solid #eee;
					padding-top: 10px;
					word-break: break-all;
					font-size: 12px;
					color: #666;
					max-width: 250px;
					max-height: 100px;
					overflow-y: auto;
				`;

				// 如果是图片，显示图片链接
				if (message.isImageUrl) {
					previewContainer.textContent = message.text;
				}
				// 如果是链接，显示链接
				else if (message.isLink) {
					previewContainer.textContent = message.text;
				}
				// 如果是普通文本，显示文本内容
				else {
					previewContainer.textContent = message.text;
				}

				qrContainer.appendChild(previewContainer);
				
				sendResponse({ success: true });
			};
			
			img.onerror = function () {
				loadingDiv.textContent = '生成二维码失败，请重试';
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
	// 处理识别二维码的请求
	else if (message.action === "decodeQR") {
		try {
			// 移除已存在的元素
			['qrcode-container', 'qrcode-overlay'].forEach(id => {
				const element = document.getElementById(id);
				if (element) {
					document.body.removeChild(element);
				}
			});

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

			// 创建容器
			const container = document.createElement('div');
			container.id = 'qrcode-container';
			container.style.cssText = `
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
				min-width: 300px;
			`;

			// 创建加载提示
			const loadingDiv = document.createElement('div');
			loadingDiv.textContent = '正在识别二维码...';
			loadingDiv.style.cssText = `
				color: #666;
				margin-bottom: 10px;
			`;
			container.appendChild(loadingDiv);

			// 添加到页面
			document.body.appendChild(overlay);
			document.body.appendChild(container);

			// 点击遮罩层关闭
			overlay.addEventListener('click', () => {
				document.body.removeChild(overlay);
				document.body.removeChild(container);
			});

			// 阻止点击容器时关闭
			container.addEventListener('click', e => e.stopPropagation());

			// 创建一个Image对象来加载图片
			const img = new Image();
			
			const loadImage = () => {
				// 为所有图片设置跨域属性
				img.crossOrigin = "anonymous";
				
				if (message.imageUrl.startsWith('data:')) {
					// 对于data URL，直接设置src
					img.src = message.imageUrl;
				} else if (message.imageUrl.startsWith('http')) {
					// 对于网络图片，尝试通过代理加载
					img.src = `https://cors-anywhere.herokuapp.com/${message.imageUrl}`;
					
					// 如果代理加载失败，提供备选方案
					img.onerror = function() {
						loadingDiv.innerHTML = `
							<div style="color: #f44336;">
								无法加载网络图片。<br>
								请尝试以下方法：<br>
								1. 将图片保存到本地后拖拽到浏览器中再识别<br>
								2. 复制图片后在新标签页粘贴再识别
							</div>
						`;
						sendResponse({ success: false, error: 'Cannot load cross-origin image' });
					};
				} else {
					// 对于本地图片，尝试直接加载
					img.src = message.imageUrl;
					
					// 添加错误处理
					img.onerror = function() {
						loadingDiv.innerHTML = `
							<div style="color: #f44336;">
								无法读取本地图片。<br>
								请尝试以下方法：<br>
								1. 将图片拖拽到浏览器中后再识别<br>
								2. 将图片上传到网页后再识别<br>
								3. 复制图片后在新标签页粘贴再识别
							</div>
						`;
						sendResponse({ success: false, error: 'Cannot access local image' });
					};
				}
			};

			img.onload = function() {
				// 创建canvas来处理图片
				const canvas = document.createElement('canvas');
				const context = canvas.getContext('2d');
				
				// 设置canvas大小为图片的实际大小
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
				
				try {
					// 绘制图片到canvas
					context.drawImage(img, 0, 0);
					
					// 获取图片数据
					const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
					
					// 使用jsQR解码
					const code = jsQR(imageData.data, imageData.width, imageData.height);
					
					// 移除加载提示
					container.removeChild(loadingDiv);

					// 显示识别结果
					const resultDiv = document.createElement('div');
					resultDiv.style.cssText = `
						margin-bottom: 15px;
					`;

					if (code) {
						const decodedText = code.data;
						
						// 添加标题
						const titleDiv = document.createElement('div');
						titleDiv.textContent = '识别结果';
						titleDiv.style.cssText = `
							font-weight: bold;
							margin-bottom: 10px;
							color: #333;
						`;
						resultDiv.appendChild(titleDiv);

						// 添加内容
						const contentDiv = document.createElement('div');
						contentDiv.style.cssText = `
							word-break: break-all;
							margin: 10px 0;
							padding: 10px;
							background: #f5f5f5;
							border-radius: 4px;
							max-height: 200px;
							overflow-y: auto;
							text-align: left;
						`;
						contentDiv.textContent = decodedText;
						resultDiv.appendChild(contentDiv);

						// 如果是URL，添加访问链接按钮
						if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
							const linkButton = document.createElement('a');
							linkButton.href = decodedText;
							linkButton.target = '_blank';
							linkButton.textContent = '访问链接';
							linkButton.style.cssText = `
								display: inline-block;
								padding: 8px 16px;
								background: #4CAF50;
								color: white;
								text-decoration: none;
								border-radius: 4px;
								margin-top: 10px;
							`;
							resultDiv.appendChild(linkButton);
						}

						// 添加复制按钮
						const copyButton = document.createElement('button');
						copyButton.textContent = '复制内容';
						copyButton.style.cssText = `
							padding: 8px 16px;
							background: #2196F3;
							color: white;
							border: none;
							border-radius: 4px;
							margin-top: 10px;
							margin-left: 10px;
							cursor: pointer;
						`;
						copyButton.onclick = () => {
							navigator.clipboard.writeText(decodedText).then(() => {
								copyButton.textContent = '已复制';
								setTimeout(() => {
									copyButton.textContent = '复制内容';
								}, 2000);
							});
						};
						resultDiv.appendChild(copyButton);
					} else {
						resultDiv.innerHTML = `
							<div style="color: #f44336;">
								未能识别出二维码，请确保图片包含有效的二维码
							</div>
						`;
					}

					container.appendChild(resultDiv);
				} catch (error) {
					console.error('Error processing image:', error);
					loadingDiv.innerHTML = `
						<div style="color: #f44336;">
							处理图片时出错。<br>
							如果是网络图片，请尝试：<br>
							1. 将图片保存到本地后拖拽到浏览器中再识别<br>
							2. 复制图片后在新标签页粘贴再识别
						</div>
					`;
				}
				
				sendResponse({ success: true });
			};
			
			loadImage();

		} catch (error) {
			console.error('Error decoding QR code:', error);
			sendResponse({ success: false, error: error.message });
		}
		return true;
	}
	return true;
});