export const printIp = (ZPLString) => {
	const printerIp = uni.getStorageSync('ip_address');
	if (!printerIp) {
		uni.showModal({ title: '提示', content: '本次打印失败,请设置IP打印机地址', showCancel: false });
		return;
	}
	const { ipAddress, port } = splitAddress(printerIp);

	if (plus.os.name == 'Android') {
		var Socket = plus.android.importClass('java.net.Socket');
		var PrintWriter = plus.android.importClass('java.io.PrintWriter');
		var BufferedWriter = plus.android.importClass('java.io.BufferedWriter');
		var OutputStreamWriter = plus.android.importClass('java.io.OutputStreamWriter');

		var StrictMode = plus.android.importClass('android.os.StrictMode');
		var Build = plus.android.importClass('android.os.Build');
		if (Build.VERSION.SDK_INT > 9) {
			var policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
			StrictMode.setThreadPolicy(policy);
		}

		let socket = null;
		let socketWriter = null;

		try {
			console.log('连接服务器中...');
			socket = new Socket(`${ipAddress}`, port * 1);
			// 如果你不读取数据，这行可省略或设很小，如 500ms
			// socket.setSoTimeout(500);

			var outputStreamWriter = new OutputStreamWriter(socket.getOutputStream());
			var bufferWriter = new BufferedWriter(outputStreamWriter);
			socketWriter = new PrintWriter(bufferWriter, true);

			socketWriter.println(ZPLString);
			console.log('ZPL 指令已发送', ZPLString);

			if (socketWriter.checkError()) {
				uni.showModal({ title: '提示', content: '打印任务发送失败，请检查打印机状态', showCancel: false });
				return;
			}

			// 关键：不要读取响应，很多打印机不会回。
			// 不要：var response = socketReader.readLine();

		} catch (e) {
			uni.showModal({ title: '提示', content: '打印过程中发生错误：' + e.message, showCancel: false });
		} finally {
			try { if (socketWriter) socketWriter.close(); } catch (_) { }
			try { if (socket && !socket.isClosed()) socket.close(); } catch (_) { }
			socket = null; socketWriter = null;
		}
	}
};

function splitAddress(input) {
	const sep = input.includes('：') ? '：' : ':';
	const [address, port] = input.split(sep);
	return { ipAddress: address.trim(), port: port ? port.trim() : null };
}