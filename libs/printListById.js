// 控制模态框显示状态，防止重复弹窗
let isModalShow = false;

// 网络套接字连接对象，用于与打印机建立TCP连接
let socket = null;

// 打印输出流对象，用于向打印机发送ZPL指令
let socketWriter = null;

// 打印输入流对象，用于接收打印机的响应信息
let socketReader = null;

// 通过wifi打印多个任务
export const printMultipleIp = async (ZPLStrings) => {
	const printerIp = uni.getStorageSync('ip_address');
	if (isModalShow) return;

	if (!printerIp) {
		isModalShow = true;
		uni.showModal({
			title: '提示',
			content: '本次打印失败,请设置IP打印机地址',
			showCancel: false,
			complete: () => {
				isModalShow = false;
			}
		});
		return;
	}
	const {
		ipAddress,
		port
	} = splitAddress(printerIp);
	if (plus.os.name == 'Android') {
		try {
			// 建立连接
			if (!socket || socket.isClosed()) {
				await establishConnection(ipAddress, port);
			}

			// 批量发送打印任务
			for (let i = 0; i < ZPLStrings.length; i++) {
				const ZPLString = ZPLStrings[i];
				try {
					socketWriter.println(ZPLString);
					console.log(`ZPL 指令 ${i + 1} 已发送`, ZPLString);

					if (socketWriter.checkError() === false) {
						console.log(`打印任务 ${i + 1} 已成功发送`);
					} else {
						throw new Error('打印任务发送失败');
					}

					// 可选：在任务之间添加短暂延迟
					if (i < ZPLStrings.length - 1) {
						await new Promise(resolve => setTimeout(resolve, 100));
					}

				} catch (e) {
					console.error(`打印任务 ${i + 1} 失败:`, e);
					throw e;
				}
			}

			console.log('所有打印任务已成功发送');

		} catch (e) {
			if (!isModalShow) {
				isModalShow = true;
				uni.showModal({
					title: '提示',
					content: '打印过程中发生错误：' + e.message,
					showCancel: false,
					complete: () => {
						isModalShow = false;
					}
				});
			}
		} finally {
			// 关闭连接
			closeConnection();
		}
	}
};

// 建立连接
const establishConnection = async (ipAddress, port) => {
	var Socket = plus.android.importClass('java.net.Socket');
	var PrintWriter = plus.android.importClass('java.io.PrintWriter');
	var BufferedWriter = plus.android.importClass('java.io.BufferedWriter');
	var OutputStreamWriter = plus.android.importClass('java.io.OutputStreamWriter');
	var BufferedReader = plus.android.importClass('java.io.BufferedReader');
	var InputStreamReader = plus.android.importClass('java.io.InputStreamReader');
	var StrictMode = plus.android.importClass('android.os.StrictMode');
	var Build = plus.android.importClass('android.os.Build');

	if (Build.VERSION.SDK_INT > 9) {
		var policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
		StrictMode.setThreadPolicy(policy);
	}

	console.log('连接服务器中...');
	socket = new Socket(`${ipAddress}`, port * 1);
	socket.setSoTimeout(10000);

	var inputStreamReader = new InputStreamReader(socket.getInputStream());
	socketReader = new BufferedReader(inputStreamReader);
	var outputStreamWriter = new OutputStreamWriter(socket.getOutputStream());
	var bufferWriter = new BufferedWriter(outputStreamWriter);
	socketWriter = new PrintWriter(bufferWriter, true);

	console.log('连接建立成功');
};

// 关闭连接
const closeConnection = () => {
	if (socket && !socket.isClosed()) {
		try {
			socket.close();
			socket = null;
			socketWriter = null;
			socketReader = null;
			console.log('连接已关闭');
		} catch (e) {
			console.error('关闭连接时发生错误:', e);
		}
	}
};

function splitAddress(input) {
	// 处理中英文冒号
	const separator = input.includes('：') ? '：' : ':';

	// 拆分地址和端口
	const [address, port] = input.split(separator);

	return {
		ipAddress: address.trim(), // 返回地址
		port: port ? port.trim() : null // 返回端口，如果没有端口则返回null
	};
}