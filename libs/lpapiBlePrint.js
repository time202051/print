import {
	LPAPIFactory,
	LPAPI,
	LPA_Result,
	LPAUtils
} from "@/uni_modules/dothan-lpapi-ble/js_sdk/index.js";

let labelWidth = 70;
let labelHeight = 50;


const getJobName = (index) => {
	if (index === 1) {
		return "#!#preview#!#";
	} else if (index === 2) {
		return "#!#transparent#!#";
	} else {
		return "lpapi-ble";
	}
}

export const carBodyTemplateByLpApi = (data = {}) => {
	var device = uni.getStorageSync('printerInfo')
	if (device) {
		const lpapi = LPAPIFactory.getInstance({
			showLog: 4,
			canvasId: 'lpapi-ble-uni'
		})

		// 检测打印机是否已启用
		if (!lpapi.isPrinterOpened()) {
			uni.showToast({
				title: '请连接打印机',
				duration: 2000
			});
		}

		const margin = 1;
		const fontHeight = 2.6
		const measureOptimizeStep = 10
		const unitW2 = (labelWidth - margin * 2) / 2;
		const unitH = (labelHeight - 1 * 2) / 7;
		const unitW3 = (labelWidth - margin * 2) / 3;
		const QRSize = unitW2 > unitH * 4 - 2 ? unitH * 4 - 2 : unitW2
		lpapi.print({
			jobInfo: {
				jobWidth: labelWidth,
				jobHeight: labelHeight,
				jobName: getJobName(0),
				orientation: 90,
				gapType: 255,
				printDarkness: 6,
				printSpeed: 3,
			},
			printerInfo: {
				name: device?.name,
				deviceId: device?.deviceId,
			},
			jobPage: [
				// {
				// 	type: "rect",
				// 	x: margin,
				// 	y: margin,
				// 	width: labelWidth - margin * 2,
				// 	height: labelHeight - margin * 2,
				// 	lineWidth: 0.3,
				// },
				{
					type: "text",
					columnName: "carBodyTagNumber",
					x: margin,
					y: margin,
					width: labelWidth - QRSize,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "frameNumber",
					x: margin,
					y: margin + unitH * 1,
					width: labelWidth - QRSize,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "bodyWorkTypeStr",
					x: margin,
					y: margin + unitH * 2,
					width: labelWidth - QRSize,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "projectCode",
					x: margin,
					y: margin + unitH * 3,
					width: labelWidth - QRSize,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},


				{
					type: "text",
					columnName: "statusDescription1Str",
					x: margin,
					y: margin + unitH * 4,
					width: unitW2,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "projectName",
					x: margin + unitW2,
					y: margin + unitH * 4,
					width: unitW2,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},

				{
					type: "text",
					columnName: "statusDescription2",
					x: margin + unitW2 * 0,
					y: margin + unitH * 5,
					width: unitW2,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "projectStatusStr",
					x: margin + unitW2 * 1,
					y: margin + unitH * 5,
					width: unitW2,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},

				{
					type: "text",
					columnName: "receivedUser",
					x: margin + unitW3 * 0,
					y: margin + unitH * 6,
					width: unitW3,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "employeePhoneNumber",
					x: margin + unitW3 * 1,
					y: margin + unitH * 6,
					width: unitW3,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "admissionDate",
					x: margin + unitW3 * 2,
					y: margin + unitH * 6,
					width: unitW3,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},

				{
					type: "qrcode",
					columnName: "carBodyTagNumberQR",
					x: labelWidth - margin - QRSize,
					y: margin,
					width: QRSize,
					height: QRSize,
					measureOptimizeStep: measureOptimizeStep,
				},
			],
			jobArguments: [{
				carBodyTagNumber: `标签号：${data.carBodyTagNumber}`,
				frameNumber: `车架号: ${data.frameNumber}`,
				bodyWorkTypeStr: `车身类型: ${data.bodyWorkTypeStr}`,
				projectCode: `项目号: ${data.projectCode}`,

				statusDescription1Str: `状态1: ${data.statusDescription1Str}`,
				projectName: `项目名称: ${data.projectName}`,

				statusDescription2: `状态2: ${data.statusDescription2}`,
				projectStatusStr: `项目状态: ${data.projectStatusStr}`,

				receivedUser: `PE: ${data.receivedUser}`,
				employeePhoneNumber: `电话: ${data.employeePhoneNumber}`,
				admissionDate: `入场: ${data.admissionDate}`,

				carBodyTagNumberQR: data.carBodyTagNumber, //二维码
			}],
			onJobCreated: (info) => {
				// return updateCanvas(info);
			},
			onPageComplete: (res) => {
				// 通过 pageComplete可以监控打印或者预览的进度。
				console.log('lp打印完成！！！！');
			},
			onJobComplete: (res) => {
				console.warn(`----- onJobComplete:`);
				console.log(res);
			},
		}).then((resp) => {
			uni.showModal({
				title: '提示',
				content: resp.statusCode,
				showCancel: false
			})
			if (resp.statusCode !== 0) {
				console.warn(`---- 打印失败，statusCode = ${resp.statusCode}`);
			} else {
				console.log(`---- 打印成功！`);
			}
		});
	} else {
		uni.showModal({
			title: '提示',
			content: '蓝牙打印机未连接',
			showCancel: false
		})
	}
}

export const sampleTemplateByLpApi = (data = {}) => {
	var device = uni.getStorageSync('printerInfo')
	if (device) {
		const lpapi = LPAPIFactory.getInstance({
			showLog: 4,
			canvasId: 'lpapi-ble-uni'
		})

		const margin = 1;
		const fontHeight = 2.5
		const measureOptimizeStep = 10
		const unitW2 = (labelWidth - margin * 2) / 2;
		const unitH = (labelHeight - 1 * 2) / 7;
		const unitW3 = (labelWidth - margin * 2) / 3;
		const QRSize = unitW2 > unitH * 5 - 2 ? unitH * 5 - 2 : unitW2

		lpapi.print({
			jobInfo: {
				jobWidth: labelWidth,
				jobHeight: labelHeight,
				jobName: getJobName(0),
				orientation: 90,
				gapType: 255,
				printDarkness: 6,
				printSpeed: 3,
			},
			printerInfo: {
				name: device?.name,
				deviceId: device?.deviceId,
			},
			jobPage: [{
					type: "text",
					columnName: "tagNumber",
					x: margin,
					y: margin,
					width: labelWidth - QRSize,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "productCode",
					x: margin,
					y: margin + unitH * 1,
					width: labelWidth - QRSize,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},



				{
					type: "text",
					columnName: "billNo",
					x: margin,
					y: margin + unitH * 2,
					width: labelWidth - QRSize,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "productName",
					x: margin,
					y: margin + unitH * 3,
					width: labelWidth - QRSize,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "projectCode",
					x: margin,
					y: margin + unitH * 4,
					width: labelWidth - QRSize,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},


				{
					type: "text",
					columnName: "projectName",
					x: margin + unitW3 * 0,
					y: margin + unitH * 5,
					width: labelWidth - QRSize,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "customProductCode",
					x: margin + unitW3 * 1,
					y: margin + unitH * 5,
					width: labelWidth - QRSize,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "statusDescription",
					x: margin + unitW3 * 2,
					y: margin + unitH * 5,
					width: labelWidth - QRSize,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},



				{
					type: "text",
					columnName: "qty",
					x: margin + unitW3 * 0,
					y: margin + unitH * 6,
					width: unitW3,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "receivedUser",
					x: margin + unitW3 * 1,
					y: margin + unitH * 6,
					width: unitW3,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "projectStatusStr",
					x: margin + unitW3 * 2,
					y: margin + unitH * 6,
					width: unitW3,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},

				{
					type: "text",
					columnName: "receivedBatch",
					x: margin + unitW2 * 0,
					y: margin + unitH * 7,
					width: unitW3,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},
				{
					type: "text",
					columnName: "createdTime",
					x: margin + unitW2 * 1,
					y: margin + unitH * 7,
					width: unitW3,
					height: unitH,
					fontHeight: fontHeight,
					verticalAlignment: 1,
					measureOptimizeStep: measureOptimizeStep,
				},

				//因为样件名称字段很长导致换行，所有给3的距离
				{
					type: "qrcode",
					columnName: "tagNumberQR",
					x: labelWidth - margin - QRSize + 3,
					y: margin,
					width: QRSize - 3,
					height: QRSize - 3,
					measureOptimizeStep: measureOptimizeStep,
				},
			],
			jobArguments: [{
				tagNumber: `标签号：${data.tagNumber}`,

				productCode: `ALV零件号：${data.productCode}`,

				billNo: `入库单号：${data.billNo}`,

				productName: `样件名称: ${data.productName}`,

				projectCode: `项目号: ${data.projectCode}`,

				projectName: `项目名称: ${data.projectName}`,
				customProductCode: `客户件号：${data.customProductCode}`,
				statusDescription: `状态描述：${data.statusDescription}`,


				qty: `数量: ${data.qty}`,
				receivedUser: `PE: ${data.receivedUser}`,
				projectStatusStr: `项目状态: ${data.projectStatusStr}`,

				receivedBatch: `批次: ${data.receivedBatch}`,
				// employeePhoneNumber: `电话: ${data.employeePhoneNumber}`,
				createdTime: `入场: ${data.createdTime}`,

				// employeePhoneNumber: `电话号码: ${data.employeePhoneNumber}`,

				// receivedBatch: `批次: ${data.receivedBatch}`,
				// projectStatusStr: `项目状态: ${data.projectStatusStr}`,

				// productCode: `ALV零件号：${data.productCode}`,


				// qty: `数量: ${data.qty}`,
				// receivedUser: `PE: ${data.receivedUser}`,
				// createdTime: `入场: ${data.createdTime}`,

				tagNumberQR: data.tagNumber, //二维码
			}],
			onJobCreated: (info) => {},
			onPageComplete: (res) => {
				// 通过 pageComplete可以监控打印或者预览的进度。
				console.log('lp打印完成！！！！');
			},
			onJobComplete: (res) => {
				console.warn(`----- onJobComplete:`);
				console.log(res);
			},
		}).then((resp) => {
			uni.showModal({
				title: '提示',
				content: resp.statusCode,
				showCancel: false
			})
			if (resp.statusCode !== 0) {
				console.warn(`---- 打印失败，statusCode = ${resp.statusCode}`);
			} else {
				console.log(`---- 打印成功！`);
			}
		});
	} else {
		uni.showModal({
			title: '提示',
			content: '蓝牙打印机未连接',
			showCancel: false
		})
	}
}