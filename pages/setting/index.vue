<template>
	<view class="setting-container">
		<uni-my-navbar :options="options"></uni-my-navbar>
		<van-cell-group>
			<van-cell title="设备类型:">{{typeName}}</van-cell>
			<u--input v-if="typeName == 'IP'" placeholder="请输入IP地址(例:192.168.xx.xx:9100)" border="surround"
				v-model="ipAddress" @blur="onIpAddress"></u--input>
			<template v-if="typeName == '蓝牙'">
				<van-cell title="设备名称">{{printerInfo.name}}</van-cell>
				<van-cell title="设备id">{{printerInfo.deviceId}}</van-cell>
				<van-cell title="分辨率">{{printerInfo.printerDPI}}</van-cell>
				<van-cell title="打印头宽">{{printerInfo.printerWidth}}</van-cell>
			</template>
		</van-cell-group>
		<view class="btn-container">
			<div class="btn-box">
				<!-- 		<view @click="typeChange('蓝牙')" class="ly-container">
					<PrintModel /> 
				</view> -->
				<!-- 				<view @click="typeChange('蓝牙')" class="ly-container">
					<LpPrintModel />
				</view> -->
				<van-button type="info" block @click="typeChange('蓝牙')">蓝牙</van-button>
				</van-row>
				<van-button type="info" block @click="typeChange('IP')">IP</van-button>
				</van-row>
			</div>
		</view>
		<!-- 		<view class="btns-box">
			<van-button type="primary" block @click="printTest">打印测试</van-button>
			<van-button type="primary" block @click="printSampleTest">打印样件测试</van-button>
			<van-button type="primary" block @click="ipTest">ip直接打印测试</van-button>
		</view> -->
		<u-picker :show="show" :title="`已连接：${currentBlePrintName}`" :columns="[pairedList]" keyName="name"
			@confirm="onConfirm" @cancel="onClose" @close="onClose" closeOnClickOverlay></u-picker>
	</view>
</template>

<script>
	// import PrintModel from '@/components/printModel/printModel.vue'
	import LpPrintModel from '@/components/printModel/lpPrintModel.vue'
	import {
		carBodyTemplatePrint,
		sampleTemplatePrint
	} from '@/libs/templatePrint.js'
	import {
		printIpTest
	} from '@/libs/printIp.js'
	import {
		LPAPIFactory,
		LPAPI,
		LPA_Result,
		LPAUtils
	} from "@/uni_modules/dothan-lpapi-ble/js_sdk/index.js";

	export default {
		name: "setting",
		components: {
			// PrintModel,
			LpPrintModel
		},
		props: {

		},
		data() {
			return {
				options: {
					title: '打印设置'
				},
				typeName: '',
				addressName: '',
				ipAddress: "", //192.168.101.250:9100
				lpapi: null,
				show: false,
				currentBlePrintName: '',
				pairedList: [],
				printerInfo: {}
			};
		},
		created() {
			this.typeName = uni.getStorageSync('print_type')
			this.ipAddress = uni.getStorageSync('ip_address')
			this.printerInfo = uni.getStorageSync('printerInfo')
		},
		methods: {
			resetBluetooth() {
				this.printerInfo = {},
					this.pairedList = []
				this.currentBlePrintName = ''
				this.lpapi = null
				uni.setStorage({
					key: 'printerInfo',
					data: {},
				})
			},
			typeChange(val) {
				uni.setStorage({
					key: 'print_type',
					data: val,
					success: () => {
						this.typeName = val
						if (val == '蓝牙') {
							this.setPrintConnection()
						} else if (val == 'IP') {
							// 关闭蓝牙连接
							this.lpapi.closePrinter()
							this.resetBluetooth()
						}
					},
					fail: () => {}
				})
			},
			onIpAddress(e) {
				// const {
				// 	detail
				// } = e
				// console.log(2223, e, detail, this.ipAddress);
				uni.setStorage({
					key: 'ip_address',
					data: e,
					success: () => {
						this.ipAddress = e
					},
					fail: () => {}
				})
			},
			async setPrintConnection() {
				this.lpapi = LPAPIFactory.getInstance({
					showLog: 4,
					canvasId: 'lpapi-ble-uni'
				});
				await this.lpapi.startBleDiscovery({
					timeout: 0,
					deviceFound: (devices) => {
						this.pairedList = devices
					},
					success: (res) => {
						this.show = true
					},
					fail: (err) => {
						uni.showToast({
							title: '扫描打印机失败',
							duration: 2000
						});
					},
					complete: () => {

					}
				});
			},
			onConfirm({
				value: item
			}) {
				item[0] && this.onConn(item[0])
				// this.globalData.lpapi = this.lpapi
				// if (this.lpapi) {
				// 	this.globalData.lpapi = this.lpapi
				// 	uni.setStorage({
				// 		key: 'lpapi',
				// 		data: this.lpapi,
				// 		success: () => {},
				// 		fail: () => {}
				// 	})
				// } else {
				// 	uni.setStorage({
				// 		key: 'lpapi',
				// 		data: {},
				// 		success: () => {},
				// 		fail: () => {}
				// 	})
				// }
				this.show = false
				// carBodyTemplatePrint()
			},
			onConn(item) {
				const {
					deviceId,
					name
				} = item
				uni.showLoading({
					title: "正在链接...",
				});
				// 连接
				this.lpapi.openPrinter({
					name: name,
					deviceId: deviceId,
					success: (resp) => {
						console.log(`---- 【打印机链接成功】`);
						this.printerInfo = this.lpapi.getPrinterInfo()
						console.log('333333', this.printerInfo);

						uni.hideLoading();
						uni.showToast({
							title: "链接成功!",
						});
						uni.setStorage({
							key: 'printerInfo',
							data: this.printerInfo,
						})
					},
					fail: (resp) => {
						console.warn(`---- 【打印机链接失败】`);
						console.warn(JSON.stringify(resp));
						uni.hideLoading();
						uni.showToast({
							title: "链接失败！",
						});
					},
				});


				uni.setStorage({
					key: 'current-device',
					data: item,
					success: () => {
						this.currentBlePrint = deviceId;
						uni.setStorage({
							key: 'ble_printerName',
							data: name,
							success: () => {
								this.currentBlePrintName = name
							},
							fail: () => {}
						})

						// uni.showToast({
						// 	title: '蓝牙打印机设置成功',
						// 	icon: 'none'
						// })
					},
					fail: () => {
						// uni.showToast({
						// 	title: '设置打印机失败',
						// 	icon: 'none'
						// })
					}
				})
			},
			onClose() {
				this.show = false
			},


			printTest() {
				carBodyTemplatePrint()
			},
			printSampleTest() {
				sampleTemplatePrint()
			},
			ipTest() {
				printIpTest()
			},

		},
	};
</script>

<style lang="less" scoped>
	.body-container {
		padding: 10rpx;
		box-sizing: border-box;
		height: calc(100% - 84rpx);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.btn-container {
		padding: 15rpx;
		box-sizing: border-box;
		width: 100%;
		position: fixed;
		bottom: 0;

		.btn-box {
			display: flex;
			gap: 20px;

			.ly-container,
			.vant-button-index {
				width: 50%;
			}
		}
	}

	.btns-box {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	// .ly-container {
	// 	margin-right: 20px;
	// 	box-sizing: border-box;
	// }
</style>