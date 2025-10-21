<template>
	<view class="xPrint-container">
		<uni-my-navbar :options="{title: '打印设置'}"></uni-my-navbar>
		<view class="content">
			<view class="subsection">
				<u-subsection :list="list" mode="button" :current="current" @change="typeChange"></u-subsection>
			</view>
			<!-- 蓝牙 -->
			<view v-if="current == 0">
				<view class="current-box" v-if="Object.keys(printerInfo).length">
					<view class="title">当前连接设备</view>
					<view class="line-item card">
						<view>
							{{printerInfo.name}}
						</view>
						<view @click="closePrinter">断开</view>
					</view>
					<view class="detail">
						<van-cell-group>
							<van-cell title="名称">{{printerInfo.name}}</van-cell>
							<van-cell title="id">{{printerInfo.deviceId}}</van-cell>
							<van-cell title="分辨率">{{printerInfo.printerDPI}}</van-cell>
							<van-cell title="打印头宽">{{printerInfo.printerWidth}}</van-cell>
						</van-cell-group>
					</view>
				</view>
				<view class="history-box">
					<view class="title">连接过的设备</view>
					<view class="history-item card" v-for="(item,index) in historyList" :key="index" @click="onConnect(item)">
						<view>
							{{item.name}}
						</view>
					</view>
				</view>
				<view class="find-box">
					<view class="title">
						<view>
							共搜索到{{findList.length || 0}}个设备
						</view>
						<u-icon name="reload" @click="findHandler"></u-icon>
					</view>
					<view class="find-item card" v-for="(item,index) in findList" :key="index" @click="onConnect(item)">
						{{item.name}}
					</view>
				</view>
			</view>
			<!-- wifi -->
			<view v-else>
				<view class="current-wifi">
					<u--input clearable placeholder="请输入IP地址(例:192.168.xx.xx:9100)" border="surround"
						v-model="ipAddress"></u--input>
					<view class="lianjie" @click="onConnectWifi()">连接</view>
				</view>
				<view class="title">连接过的设备</view>
				<view class="wifi-item card" v-for="(item,index) in historyWifiList" :key="index" @click="onConnectWifi(item)">
					{{item}}
				</view>

			</view>
		</view>
		<debug-panel></debug-panel>
	</view>
</template>

<script>
	import {
		LPAPIFactory
	} from "@/uni_modules/dothan-lpapi-ble/js_sdk/index.js"; // 插件lpapi-ble
	export default {
		data() {
			return {
				list: ['蓝牙', 'IP'],
				current: 0,
				historyList: [],
				findList: [], //
				printerInfo: {}, //当前已连接设备信息
				historyWifiList: [],
				ipAddress: ''
			}
		},
		async created() {
			this.lpapi = LPAPIFactory.getInstance({
				showLog: 4,
				canvasId: 'lpapi-ble-uni'
			});
			const res = await uni.getStorage({
				key: 'printerInfo'
			})
			if (res && Array.isArray(res) && res[1]) {
				this.printerInfo = res[1]?.data || {}
			}
			const res1 = await uni.getStorage({
				key: 'historyList'
			})
			if (res1 && Array.isArray(res1) && res1[1]) {
				this.historyList = res1[1]?.data || {}
			}

			const res3 = await uni.getStorage({
				key: 'ip_address'
			})
			if (res3 && Array.isArray(res3) && res3[1]) {
				this.ipAddress = res3[1].data || ""
			}
			const res2 = await uni.getStorage({
				key: 'historyWifiList'
			})
			if (res2 && Array.isArray(res2) && res2[1]) {
				this.historyWifiList = res2[1]?.data || {}
			}

			const res4 = await uni.getStorage({
				key: 'print_type'
			})
			if (res4 && Array.isArray(res4) && res4[1]) {
				this.current = res4[1]?.data == '蓝牙' ? 0 : 1
			}
		},
		mounted() {
			setInterval(() => {
				const bool = this.lpapi.isPrinterOpened()
				if (!bool) {
					this.resetBluetooth()
				}
			}, 1000)
		},
		methods: {
			resetBluetooth() {
				this.printerInfo = {}
				uni.setStorage({
					key: 'printerInfo',
					data: {},
				})
			},
			resetWifiBluetooth() {
				this.ipAddress = ''
				uni.setStorage({
					key: 'ip_address',
					data: '',
				})
			},
			typeChange(index) {
				if (Object.keys(this.printerInfo).length) return;
				// if (this.ipAddress) return
				if (this.historyWifiList.includes(this.ipAddress)) return
				this.current = index
				const val = this.list[index]
				uni.setStorage({
					key: 'print_type',
					data: val,
					success: () => {
						if (val == '蓝牙') {
							this.resetWifiBluetooth()
						} else {
							this.resetBluetooth()
							this.lpapi.closePrinter()
						}
					},
					fail: () => {}
				})

			},
			// 搜索设备
			async findHandler() {
				uni.showLoading({
					title: "正在搜索...",
				});
				this.findList = []
				await this.lpapi.startBleDiscovery({
					timeout: 8000,
					deviceFound: (devices) => {
						this.findList = devices
					},
					success: (res) => {},
					fail: (err) => {
						uni.showToast({
							icon: 'error',
							title: '扫描打印机失败',
							duration: 2000
						});
					},
					complete: (err) => {
						uni.hideLoading();
					}
				});
			},
			// 连接设备
			onConnect(item) {
				const {
					deviceId,
					name
				} = item
				uni.showLoading({
					title: "正在连接...",
				});
				// 连接
				this.lpapi.openPrinter({
					name: name,
					deviceId: deviceId,
					success: (resp) => {
						this.printerInfo = this.lpapi.getPrinterInfo()
						console.log(`---- 【打印机链接成功】`, this.printerInfo);
						const tempIndex = this.historyList.findIndex((e) => e.deviceId == deviceId)
						if (tempIndex == -1) {
							this.historyList.unshift(this.printerInfo)
							uni.setStorage({
								key: 'historyList',
								data: this.historyList,
							})
						}
						uni.hideLoading();
						uni.showToast({
							title: "连接成功!",
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
							icon: 'none',
							title: "连接失败,请检查打印机",
						});
						this.closePrinter()
					},
					complete: () => {
						uni.hideLoading();
					}
				});
			},
			//断开连接
			async closePrinter() {
				const isDisconnect = await this.lpapi.closePrinter()
				if (isDisconnect) this.resetBluetooth()
			},

			// wifi连接
			onConnectWifi(val) {
				if (val) this.ipAddress = val
				const regex =
					/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;

				if (!regex.test(this.ipAddress)) return uni.showToast({
					icon: 'none',
					title: "蓝牙地址格式错误，请检查",
				});
				uni.setStorage({
					key: 'ip_address',
					data: this.ipAddress,
					success: () => {
						if (!this.historyWifiList.includes(this.ipAddress)) {
							this.historyWifiList.unshift(this.ipAddress)
							uni.setStorage({
								key: 'historyWifiList',
								data: this.historyWifiList,
							})
						}
						uni.showToast({
							title: "IP设置成功",
						});
					},
					fail: () => {}
				})
			},
		}
	}
</script>

<style lang="less" scoped>
	.xPrint-container {
		width: 100%;
		padding: 15px;
		box-sizing: border-box;

		.content {
			display: flex;
			flex-direction: column;
			gap: 10px;
		}

		.line-item {
			background-color: #2979ff !important;
			color: #fff;
		}

		.history-box {
			max-height: 500px;
			overflow: auto;
		}

		.current-wifi {
			padding: 15px;
			box-sizing: border-box;
			background-color: #f9fafe;
			border: 1px solid #f2f5fb;
			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 10px;

			.lianjie {
				color: #4387f7;
			}
		}


	}

	.subsection {
		// padding: 15px;
	}

	// /deep/ .u-subsection--button {
	// 	height: 40px !important;

	// 	.u-subsection--button__bar {
	// 		height: 34px !important;
	// 	}
	// }


	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		// font-weight: bold;
		font-size: 18px;
		margin: 10px 0;

	}

	.card {
		padding: 10px;
		background-color: #f9fafe;
		border: 1px solid #f2f5fb;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 8px 0;
		border-radius: 6px;
	}

	.test-btn {
		margin-bottom: 20px;
	}
</style>