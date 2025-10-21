import {
	print
} from '@/libs/print.js'
import {
	carBodyTemplateByLpApi,
	sampleTemplateByLpApi
} from '@/libs/lpapiBlePrint.js'
import {
	printMultipleIp
} from '@/libs/printListById.js'
import {
	LPAPIFactory
} from "@/uni_modules/dothan-lpapi-ble/js_sdk/index.js";

import Request from '@/common/js/request.js'
import {
	printIp,
} from '@/libs/printIp.js'

// import {
// 	printTest,
// 	printSocket,
// 	printIpTD,
// 	printIpRunnable,
// 	testPrinterConnection,
// 	printIpZXC
// } from '@/libs/printTest.js'
let isModalShow = false;

const TypeEnum = {
	1: '蓝牙',
	2: "IP"
}



//蓝牙或者ip打印机是否连接状态 返回 true false
export const isConnect = () => {
	const type = uni.getStorageSync('print_type')
	if (type == TypeEnum[2]) {
		return !!uni.getStorageSync('ip_address');
	} else {
		const lpapi = LPAPIFactory.getInstance({
			showLog: 4,
			canvasId: 'lpapi-ble-uni'
		})
		return lpapi.isPrinterOpened()
	}
}


// 车身 3e87ae59-a428-693d-c276-3a18a5c1dfa3
export const carBodyTemplatePrint = async (admissionInfoId = "") => {
	const res = await Request(`/api/app/admission-info/print-label/${admissionInfoId}`, 'POST', {
		admissionInfoId: admissionInfoId
	})
	if (res.code !== 200) return uni.showToast({
		icon: 'error',
		title: res.error.message
	})

	//type = 蓝牙,IP
	const type = uni.getStorageSync('print_type')
	if (type == TypeEnum[2]) {
		carBodyTemplateByIP(res.result)
	} else {
		// carBodyTemplateByBluetooth(res.result)
		carBodyTemplateByLpApi(res.result)
	}
}

// 样件 d2dc83c8-5bff-635f-6e91-3a18c3330a4c
export const sampleTemplatePrint = async (stockInId = "") => {
	const res = await Request(`/api/app/stock-in/print-label/${stockInId}`, 'POST', {
		stockInId: stockInId
	})
	if (res.code !== 200) return uni.showToast({
		title: res.error.message
	})
	//type = 蓝牙,IP
	const type = uni.getStorageSync('print_type')
	if (type == TypeEnum[2]) {
		sampleTemplateByIP(res.result)
	} else {
		// sampleTemplateByBluetooth(res.result)
		sampleTemplateByLpApi(res.result)
	}
}
export const tsListTemplateByIP = (tsStrings) => {
	const type = uni.getStorageSync('print_type')
	if (isModalShow) return;
	if (type != TypeEnum[2]) {
		isModalShow = true
		uni.showModal({
			title: '提示',
			content: '请选择并连接IP打印机',
			complete: () => {
				isModalShow = false
			}
		});
		return
	}
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要+1
	const day = String(now.getDate()).padStart(2, '0');
	const currentTime = `${year}${month}${day}`;
	const ZPLStrings = tsStrings.reduce((acc, ts) => {
		const ZPLString = `^XA
		^CI28
		^PW320
		^LL120
		^CW1,E:SIMHEI.FNT
		
		^FO20,10
		^BQN,4,4
		^FDQA,${ts}^FS
		
		^FO110,45
		^A0N,23,23
		^FB160,1,0,L,0
		^FD${ts}^FS
		
		^FO110,85
		^A0N,23,23
		^FB210,1,0,L,0
		^FDCTC-Proto ${currentTime}^FS
		
		^XZ`
		acc.push(ZPLString)
		return acc;
	}, [])
	if (ZPLStrings && Array.isArray(ZPLStrings)) {
		printMultipleIp(ZPLStrings)
	}
}

// ts号IP打印
export const tsTemplateByIP = (ts) => {
	//type = 蓝牙,IP
	const type = uni.getStorageSync('print_type')
	if (isModalShow) return;
	if (type != TypeEnum[2]) {
		isModalShow = true
		uni.showModal({
			title: '提示',
			content: '请选择并连接IP打印机',
			complete: () => {
				isModalShow = false
			}
		});
		return
	}

	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要+1
	const day = String(now.getDate()).padStart(2, '0');
	const currentTime = `${year}${month}${day}`;
	// const ZPLString = `^XA
	// ^PW160
	// ^LL320
	// ^CW1,E:SIMHEI.FNT
	// ^CI28
	// ^FO150,20^A1N,13,13^FD标签号: ${ts}^FS
	// ^FO150,126^A1N,13,13^FD车架号:CTC-Warehouse^FS
	// ^FO150,232^A1N,13,13^FD车身类型: ${currentTime}^FS
	// ^FO20,20
	// ^BQN,2,13
	// ^FDQA,${ts}^FS
	// ^XZ`
	const ZPLString = `^XA
^CI28
^PW320
^LL120
^CW1,E:SIMHEI.FNT

^FO20,10
^BQN,4,4
^FDQA,${ts}^FS

^FO110,45
^A0N,23,23
^FB160,1,0,L,0
^FD${ts}^FS

^FO110,85
^A0N,23,23
^FB210,1,0,L,0
^FDCTC-Proto ${currentTime}^FS

^XZ`
	printIp(ZPLString)
}


// ====================================

//车身模板打印100mm*70mm
const carBodyTemplateByBluetooth = (data = {}) => {
	var printerid = uni.getStorageSync('ble_printerId')
	if (printerid) {
		if (printerid != null && printerid.length > 0) {
			var str = " ! 0 200 200 560 1 " + '\r\n';
			str += "PAGE-WIDTH 800" + '\r\n';
			// str += "BOX 1 1 799 559 2" + '\r\n';
			str += "TEXT 56 0 20 30 标签号: " + data.carBodyTagNumber + "\r\n";

			str += "TEXT 56 0 20 110 车架号: " + data.frameNumber + "\r\n";

			str += "TEXT 56 0 20 190 车身类型: " + data.bodyWorkTypeStr + "\r\n";

			str += "TEXT 56 0 20 270 项目号: " + data.projectCode + "\r\n";

			str += "TEXT 56 0 20 350 电话号码: " + data.employeePhoneNumber + "\r\n";
			str += "TEXT 56 0 400 350 项目名称: " + data.projectName + "\r\n";

			str += "TEXT 56 0 20 430 状态1: " + data.statusDescription1Str + "\r\n";
			str += "TEXT 56 0 400 430 项目状态: " + data.projectStatusStr + "\r\n";

			str += "TEXT 56 0 20 510 状态2: " + data.statusDescription2 + "\r\n";
			str += "TEXT 56 0 286 510 PE: " + data.receivedUser + "\r\n";
			str += "TEXT 56 0 552 510 入场: " + data.admissionDate + "\r\n";

			// 二维码 (放在右上角)
			str += "B QR 500 30 M 2 U 10" + '\r\n';
			str += "MA," + data.carBodyTagNumber + "\r\n";
			str += "ENDQR" + '\r\n';

			// 标签结束
			str += "GAP-SENSE" + '\r\n';
			str += "FORM " + '\r\n';
			str += "PRINT " + '\r\n';

			// 调用打印插件打印方法进行打印
			print(printerid, str);
		}
	} else {
		uni.showModal({
			title: '提示',
			content: '请先选择已配对的蓝牙打印机, 再进行打印.',
			showCancel: false
		})
	}
}

// 样件模板打印100mm*70mm
const sampleTemplateByBluetooth = (data = {}) => {
	var printerid = uni.getStorageSync('ble_printerId')
	if (printerid) {
		if (printerid != null && printerid.length > 0) {
			var str = " ! 0 200 200 560 1 " + '\r\n';
			str += "PAGE-WIDTH 800" + '\r\n';
			// str += "BOX 1 1 799 559 2" + '\r\n';
			str += "TEXT 56 0 20 30 标签号: " + data.tagNumber + "\r\n";

			// str += "TEXT 56 0 20 110 入库单号: " + data.billNo + "\r\n";

			// 车身类型和状态信息
			str += "TEXT 56 0 20 123 样件名称: " + data.productName + "\r\n";

			str += "TEXT 56 0 20 216 项目号: " + data.projectCode + "\r\n";

			str += "TEXT 56 0 20 309 电话号码: " + data.employeePhoneNumber + "\r\n";
			str += "TEXT 56 0 400 309 项目名称: " + data.projectName + "\r\n";

			str += "TEXT 56 0 20 402 批次: " + data.receivedBatch + "\r\n";
			str += "TEXT 56 0 400 402 项目状态: " + data.projectStatusStr + "\r\n";

			str += "TEXT 56 0 20 495 数量: " + data.qty + "\r\n";
			str += "TEXT 56 0 286 495 PE: " + data.receivedUser + "\r\n";
			str += "TEXT 56 0 552 495 入场: " + data.createdTime + "\r\n";

			// 二维码 (放在右上角)
			str += "B QR 500 30 M 2 U 10" + '\r\n';
			str += "MA," + data.tagNumber + "\r\n";
			str += "ENDQR" + '\r\n';

			// 标签结束
			str += "GAP-SENSE" + '\r\n';
			str += "FORM " + '\r\n';
			str += "PRINT " + '\r\n';

			// 调用打印插件打印方法进行打印
			print(printerid, str);
		}
	} else {
		uni.showModal({
			title: '提示',
			content: '请先选择已配对的蓝牙打印机, 再进行打印.',
			showCancel: false
		})
	}
}

const carBodyTemplateByIP = (data = {}) => {
	// 指令解析
	// 1. ^XA
	// 开始一个标签格式。
	// ^PW560  // 设置标签宽度为560点（70mm）
	// ^LL800  // 设置标签长度为800点（100mm）
	// 2. ^CW1,E:SIMHEI.FNT
	// 定义字体SIMHEI.FNT，并将其分配给变量1，后续可以使用^A1调用该字体。
	// ^CI28
	// 设置字符编码为UTF-8，支持中文字符。
	// ^FO20,20^A0N,30,30^FD标签号: XXXXXXXX^FS
	// ^FO20,20：将光标定位到坐标(20,20)。
	// ^A0N,30,30：使用默认字体0，字体高度30，宽度30。
	// ^FD标签号: XXXXXXXX^FS：打印文本“标签号: XXXXXXXX”。
	// ^FO20,60^A0N,30,30^FD车架号号: XXXXXXXX^FS
	// 在坐标(20,60)打印“车架号号: XXXXXXXX”。
	// ^FO20,100^A0N,30,30^FD车身类型: 白车身^FS
	// 在坐标(20,100)打印“车身类型: 白车身”。
	// 7. ^FO20,140^A0N,30,30^FD状态1: 白车身碰撞^FS
	// 在坐标(20,140)打印“状态1: 白车身碰撞”。
	// ^FO20,180^A0N,30,30^FD状态2: 自行录入^FS
	// 在坐标(20,180)打印“状态2: 自行录入”。
	// 9. ^FO300,100^A0N,30,30^FD项目号: 26254023^FS
	// 在坐标(300,100)打印“项目号: 26254023”。
	// ^FO300,140^A0N,30,30^FD项目状态: 保密^FS
	// 在坐标(300,140)打印“项目状态: 保密”。
	// 11. ^FO300,180^A0N,30,30^FDPE: 老三^FS
	// 在坐标(300,180)打印“PE: 老三”。
	// ^FO450,20
	// 将光标定位到坐标(450,20)。
	// ^BQN,2,5
	// 生成一个二维码，二维码模型为2，放大倍数为5。
	// ^FDQA,2025/02/01^FS
	// 二维码内容为QA,2025/02/01。
	// ^FO20,220^GB550,1,1^FS
	// 在坐标(20,220)绘制一条宽度为550，高度为1的实线。
	// 16. ^FO20,260^A0N,25,25^FD入场: 2025/02/01^FS
	// 在坐标(20,260)打印“入场: 2025/02/01”，字体高度25，宽度25。
	// ^XZ
	// 结束标签格式，开始打印。
	// data = {
	// 	carBodyTagNumber: '标签号',
	// 	frameNumber: '车架号',
	// 	bodyWorkTypeStr: "车身类型",
	// 	projectCode: '项目号',
	// 	statusDescription1: '状态1',
	// 	statusDescription2: "状态2",
	// 	projectStatusStr: '项目状态',
	// 	auditUser: 'pe',
	// 	createdTime: '入场',
	// 	phone: '12345678900',
	// 	projectName: '项目名称',
	// 	admissionInfoId: '入场信息Id'
	// }
	const ZPLString = `^XA
	^PW560
	^LL800
	^CW1,E:SIMHEI.FNT
	^CI28
	^FO20,30^A1N,17,17^FD标签号: ${data.tagNumber}^FS
	^FO20,110^A1N,17,17^FD车架号:${data.frameNumber}^FS
	^FO20,190^A1N,17,17^FD车身类型: ${data.bodyWorkTypeStr}^FS
	^FO20,270^A1N,17,17^FD项目号: ${data.projectCode}^FS
	^FO20,350^A1N,17,17^FD电话号码: ${data.employeePhoneNumber}^FS
	^FO490,350^A1N,17,17^FD项目名称: ${data.projectName}^FS
	^FO20,430^A1N,17,17^FD状态1: ${data.statusDescription1}^FS
	^FO400,430^A1N,17,17^FD项目状态: ${data.projectStatusStr}^FS
	^FO20,510^A1N,17,17^FD状态2: ${data.statusDescription2}^FS
	^FO286,510^A1N,17,17^FDPE: ${data.receivedUser}^FS
	^FO552,510^A0N,25,25^FD入场: ${data.admissionDate}^FS
	^FO500,30
	^BQN,2,24
	^FDQA,${data.carBodyTagNumber }^FS
	^XZ`
	printIp(ZPLString)
}

const sampleTemplateByIP = (data = {}) => {
	const ZPLString = `^XA
	^PW560
	^LL800
	^CW1,E:SIMHEI.FNT
	^CI28
	^FO20,30^A1N,17,17^FD标签号: ${data.tagNumber}^FS
	^FO20,123^A1N,17,17^FD样件名称: ${data.productName}^FS
	^FO20,216^A1N,17,17^FD项目号: ${data.projectCode}^FS
	^FO20,309^A1N,17,17^FD电话号码: ${data.employeePhoneNumber}^FS
	^FO490,209^A1N,17,17^FD项目名称: ${data.projectName}^FS
	^FO20,402^A1N,17,17^FD批次: ${data.receivedBatch}^FS
	^FO400,402^A1N,17,17^FD项目状态: ${data.projectStatusStr}^FS
	^FO20,495^A1N,17,17^FD数量: ${data.qty}^FS
	^FO286,495^A1N,17,17^FDPE: ${data.receivedUser}^FS
	^FO552,495^A0N,25,25^FD入场: ${data.createdTime}^FS
	^FO500,30
	^BQN,2,24
	^FDQA,${data.tagNumber}^FS
	^XZ`
	printIp(ZPLString)
}