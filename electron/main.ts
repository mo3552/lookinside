import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import { join } from 'path';
import si from 'systeminformation';
import path from 'path';
import fs from 'fs';

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main.js
// │ └─┬ preload.js
// └─┬ dist
//   └─┬ index.html

process.env.DIST = join(__dirname, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
	? join(process.env.DIST, '../public')
	: process.env.DIST;

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
	win = new BrowserWindow({
		width: 600,
		height: 800,
		resizable: true,
		fullscreenable: false,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.js'),
			webSecurity: true,
			allowRunningInsecureContent: false,
		},
		icon: join(process.env.VITE_PUBLIC || '', 'favicon.ico'),
		backgroundColor: '#f8f9fa',
		minimizable: true,
		maximizable: false,
		show: false,
		titleBarStyle: 'default',
		frame: true,
		transparent: false,
		skipTaskbar: false,
		autoHideMenuBar: false,
		closable: true,
	});

	win.once('ready-to-show', () => {
		win?.show();
		win?.focus();
	});

	// Content Security Policy 설정
	win.webContents.session.webRequest.onHeadersReceived(
		(details, callback) => {
			callback({
				responseHeaders: {
					...details.responseHeaders,
					'Content-Security-Policy': [
						"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self' https://cdn.jsdelivr.net; img-src 'self' data:;",
					],
				},
			});
		}
	);

	// Test active push message to Renderer-process.
	win.webContents.on('did-finish-load', () => {
		win?.webContents.send(
			'main-process-message',
			new Date().toLocaleString()
		);
	});

	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
	} else {
		win.loadFile(join(process.env.DIST || '', 'index.html'));
	}
}

function createMenu() {
	const template: Electron.MenuItemConstructorOptions[] = [
		{
			label: '파일',
			submenu: [
				{
					label: '저장',
					accelerator: 'CmdOrCtrl+S',
					click: async () => {
						try {
							const systemInfo = await getAllSystemInfo();
							const result = await dialog.showSaveDialog(win!, {
								title: '시스템 정보 저장',
								defaultPath: `system_info_${new Date()
									.toISOString()
									.slice(0, 19)
									.replace(/:/g, '-')}.txt`,
								filters: [
									{
										name: '텍스트 파일',
										extensions: ['txt'],
									},
									{ name: '모든 파일', extensions: ['*'] },
								],
							});

							if (!result.canceled && result.filePath) {
								const content =
									formatSystemInfoForSave(systemInfo);
								fs.writeFileSync(
									result.filePath,
									content,
									'utf8'
								);
								dialog.showMessageBox(win!, {
									type: 'info',
									title: '저장 완료',
									message:
										'시스템 정보가 성공적으로 저장되었습니다.',
									buttons: ['확인'],
									defaultId: 0,
								});
							}
						} catch (error) {
							console.error('파일 저장 실패:', error);
							dialog.showErrorBox(
								'저장 오류',
								'시스템 정보 저장 중 오류가 발생했습니다.'
							);
						}
					},
				},
				{ type: 'separator' },
				{
					label: '종료',
					accelerator:
						process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
					click: () => {
						app.quit();
					},
				},
			],
		},
		{
			label: '보기',
			submenu: [
				{
					label: 'CPU 정보',
					click: () => {
						win?.webContents.send('switch-tab', 'cpu');
					},
				},
				{
					label: '메모리 정보',
					click: () => {
						win?.webContents.send('switch-tab', 'memory');
					},
				},
				{
					label: '운영체제 정보',
					click: () => {
						win?.webContents.send('switch-tab', 'os');
					},
				},
				{
					label: '메인보드 정보',
					click: () => {
						win?.webContents.send('switch-tab', 'motherboard');
					},
				},
				{
					label: '디스크 정보',
					click: () => {
						win?.webContents.send('switch-tab', 'disk');
					},
				},
				{
					label: '네트워크 정보',
					click: () => {
						win?.webContents.send('switch-tab', 'network');
					},
				},
			],
		},
		{
			label: '도구',
			submenu: [
				{
					label: '새로고침',
					accelerator: 'CmdOrCtrl+R',
					click: () => {
						win?.webContents.send('refresh-system-info');
					},
				},
			],
		},
		{
			label: '도움말',
			submenu: [
				{
					label: '정보',
					click: () => {
						dialog.showMessageBox(win!, {
							type: 'info',
							title: 'LookInside',
							message: 'LookInside',
							detail: `버전: 1.0.0\n제작자: Mario\n이메일: mo3552@gmail.com`,
							buttons: ['확인'],
							defaultId: 0,
						});
					},
				},
			],
		},
	];

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
		win = null;
	}
});

// GPU 하드웨어 가속 비활성화
app.disableHardwareAcceleration();

app.whenReady().then(() => {
	createWindow();
	createMenu();
});

app.on('activate', () => {
	const allWindows = BrowserWindow.getAllWindows();
	if (allWindows.length) {
		allWindows[0].focus();
	} else {
		createWindow();
	}
});

// IPC 핸들러들
ipcMain.handle('get-cpu-info', async () => {
	try {
		const cpu = await si.cpu();
		return {
			manufacturer: cpu.manufacturer,
			brand: cpu.brand,
			physicalCores: cpu.physicalCores,
			cores: cpu.cores,
			speed: cpu.speed,
			speedMax: cpu.speedMax,
			speedMin: cpu.speedMin,
			socket: cpu.socket || 'N/A',
			cache: cpu.cache,
		};
	} catch (error) {
		console.error('CPU 정보 조회 실패:', error);
		throw error;
	}
});

ipcMain.handle('get-memory-info', async () => {
	try {
		const mem = await si.mem();
		return {
			total: mem.total,
			used: mem.used,
			free: mem.free,
			active: mem.active,
			available: mem.available,
			swaptotal: mem.swaptotal,
			swapused: mem.swapused,
			swapfree: mem.swapfree,
		};
	} catch (error) {
		console.error('메모리 정보 조회 실패:', error);
		throw error;
	}
});

ipcMain.handle('get-os-info', async () => {
	try {
		const os = await si.osInfo();
		return {
			platform: os.platform,
			distro: os.distro,
			release: os.release,
			codename: os.codename,
			arch: os.arch,
			hostname: os.hostname,
			codepage: os.codepage,
			logofile: os.logofile,
			serial: os.serial,
			build: os.build,
			servicepack: os.servicepack,
			uefi: os.uefi,
		};
	} catch (error) {
		console.error('OS 정보 조회 실패:', error);
		throw error;
	}
});

ipcMain.handle('get-disk-info', async () => {
	try {
		const diskLayout = await si.diskLayout();
		const fsSize = await si.fsSize();

		return {
			diskLayout,
			fsSize,
		};
	} catch (error) {
		console.error('디스크 정보 조회 실패:', error);
		throw error;
	}
});

ipcMain.handle('get-network-info', async () => {
	try {
		const networkInterfaces = await si.networkInterfaces();
		return networkInterfaces;
	} catch (error) {
		console.error('네트워크 정보 조회 실패:', error);
		throw error;
	}
});

ipcMain.handle('get-motherboard-info', async () => {
	try {
		const baseboard = await si.baseboard();
		const bios = await si.bios();
		const chassis = await si.chassis();

		return {
			baseboard,
			bios,
			chassis,
		};
	} catch (error) {
		console.error('메인보드 정보 조회 실패:', error);
		throw error;
	}
});

ipcMain.handle('get-system-info', async () => {
	try {
		const [
			cpu,
			mem,
			os,
			diskLayout,
			fsSize,
			networkInterfaces,
			baseboard,
			bios,
			chassis,
		] = await Promise.all([
			si.cpu(),
			si.mem(),
			si.osInfo(),
			si.diskLayout(),
			si.fsSize(),
			si.networkInterfaces(),
			si.baseboard(),
			si.bios(),
			si.chassis(),
		]);

		return {
			cpu,
			memory: mem,
			os,
			diskLayout,
			fsSize,
			networkInterfaces,
			motherboard: {
				baseboard,
				bios,
				chassis,
			},
		};
	} catch (error) {
		console.error('시스템 정보 조회 실패:', error);
		throw error;
	}
});

// CPU 사용률 조회
ipcMain.handle('get-cpu-usage', async () => {
	try {
		const cpuLoad = await si.currentLoad();
		return {
			avgLoad: cpuLoad.avgLoad,
			currentLoad: cpuLoad.currentLoad,
			currentLoadUser: cpuLoad.currentLoadUser,
			currentLoadSystem: cpuLoad.currentLoadSystem,
			currentLoadNice: cpuLoad.currentLoadNice,
			currentLoadIdle: cpuLoad.currentLoadIdle,
			currentLoadIrq: cpuLoad.currentLoadIrq,
			currentLoadSteal: cpuLoad.currentLoadSteal,
			currentLoadGuest: cpuLoad.currentLoadGuest,
		};
	} catch (error) {
		console.error('CPU 사용률 조회 실패:', error);
		throw error;
	}
});

// 시스템 업타임 조회
ipcMain.handle('get-system-uptime', async () => {
	try {
		const time = await si.time();
		return {
			uptime: time.uptime,
			timezone: time.timezone,
			timezoneName: time.timezoneName,
		};
	} catch (error) {
		console.error('시스템 업타임 조회 실패:', error);
		throw error;
	}
});

// 모든 시스템 정보를 가져오는 함수
async function getAllSystemInfo() {
	try {
		const [
			cpu,
			mem,
			os,
			diskLayout,
			fsSize,
			networkInterfaces,
			baseboard,
			bios,
			chassis,
			cpuLoad,
			time,
		] = await Promise.all([
			si.cpu(),
			si.mem(),
			si.osInfo(),
			si.diskLayout(),
			si.fsSize(),
			si.networkInterfaces(),
			si.baseboard(),
			si.bios(),
			si.chassis(),
			si.currentLoad(),
			si.time(),
		]);

		return {
			cpu,
			memory: mem,
			os,
			diskLayout,
			fsSize,
			networkInterfaces,
			motherboard: {
				baseboard,
				bios,
				chassis,
			},
			cpuLoad,
			time,
		};
	} catch (error) {
		console.error('전체 시스템 정보 조회 실패:', error);
		throw error;
	}
}

// 시스템 정보를 텍스트 형식으로 포맷하는 함수
function formatSystemInfoForSave(systemInfo: any): string {
	const formatBytes = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const formatUptime = (seconds: number) => {
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${days}일 ${hours}시간 ${minutes}분`;
	};

	let content = '=== LookInside 시스템 정보 보고서 ===\n';
	content += `생성 시간: ${new Date().toLocaleString('ko-KR')}\n\n`;

	// CPU 정보
	content += '=== CPU 정보 ===\n';
	content += `제조사: ${systemInfo.cpu.manufacturer}\n`;
	content += `모델: ${systemInfo.cpu.brand}\n`;
	content += `물리적 코어: ${systemInfo.cpu.physicalCores}\n`;
	content += `논리적 코어: ${systemInfo.cpu.cores}\n`;
	content += `현재 속도: ${systemInfo.cpu.speed} GHz\n`;
	content += `최대 속도: ${systemInfo.cpu.speedMax} GHz\n`;
	content += `최소 속도: ${systemInfo.cpu.speedMin} GHz\n`;
	content += `소켓: ${systemInfo.cpu.socket || 'N/A'}\n`;
	content += `캐시: ${systemInfo.cpu.cache}\n`;
	content += `현재 사용률: ${systemInfo.cpuLoad.currentLoad.toFixed(2)}%\n\n`;

	// 메모리 정보
	content += '=== 메모리 정보 ===\n';
	content += `총 메모리: ${formatBytes(systemInfo.memory.total)}\n`;
	content += `사용 중: ${formatBytes(systemInfo.memory.used)}\n`;
	content += `사용 가능: ${formatBytes(systemInfo.memory.available)}\n`;
	content += `여유 메모리: ${formatBytes(systemInfo.memory.free)}\n`;
	content += `활성 메모리: ${formatBytes(systemInfo.memory.active)}\n`;
	content += `총 스왑: ${formatBytes(systemInfo.memory.swaptotal)}\n`;
	content += `사용된 스왑: ${formatBytes(systemInfo.memory.swapused)}\n\n`;

	// 운영체제 정보
	content += '=== 운영체제 정보 ===\n';
	content += `플랫폼: ${systemInfo.os.platform}\n`;
	content += `배포판: ${systemInfo.os.distro}\n`;
	content += `릴리즈: ${systemInfo.os.release}\n`;
	content += `코드네임: ${systemInfo.os.codename}\n`;
	content += `아키텍처: ${systemInfo.os.arch}\n`;
	content += `호스트명: ${systemInfo.os.hostname}\n`;
	content += `코드페이지: ${systemInfo.os.codepage}\n`;
	content += `시리얼: ${systemInfo.os.serial}\n`;
	content += `빌드: ${systemInfo.os.build}\n`;
	content += `서비스팩: ${systemInfo.os.servicepack}\n`;
	content += `UEFI: ${systemInfo.os.uefi ? '예' : '아니오'}\n\n`;

	// 메인보드 정보
	content += '=== 메인보드 정보 ===\n';
	content += `제조사: ${
		systemInfo.motherboard.baseboard.manufacturer || 'N/A'
	}\n`;
	content += `모델: ${systemInfo.motherboard.baseboard.model || 'N/A'}\n`;
	content += `버전: ${systemInfo.motherboard.baseboard.version || 'N/A'}\n`;
	content += `시리얼: ${systemInfo.motherboard.baseboard.serial || 'N/A'}\n`;
	content += `BIOS 제조사: ${
		systemInfo.motherboard.bios.manufacturer || 'N/A'
	}\n`;
	content += `BIOS 버전: ${systemInfo.motherboard.bios.version || 'N/A'}\n`;
	content += `BIOS 릴리즈: ${
		systemInfo.motherboard.bios.releaseDate || 'N/A'
	}\n\n`;

	// 디스크 정보
	content += '=== 디스크 정보 ===\n';
	systemInfo.diskLayout.forEach((disk: any, index: number) => {
		content += `디스크 ${index + 1}:\n`;
		content += `  제조사: ${disk.manufacturer || 'N/A'}\n`;
		content += `  모델: ${disk.name || 'N/A'}\n`;
		content += `  시리얼: ${disk.serialNum || 'N/A'}\n`;
		content += `  크기: ${formatBytes(disk.size)}\n`;
		content += `  인터페이스: ${disk.interfaceType || 'N/A'}\n`;
		content += `  타입: ${disk.type || 'N/A'}\n\n`;
	});

	// 파일 시스템 정보
	content += '=== 파일 시스템 정보 ===\n';
	systemInfo.fsSize.forEach((fs: any, index: number) => {
		content += `파티션 ${index + 1}:\n`;
		content += `  마운트: ${fs.mount}\n`;
		content += `  타입: ${fs.type}\n`;
		content += `  크기: ${formatBytes(fs.size)}\n`;
		content += `  사용: ${formatBytes(fs.used)}\n`;
		content += `  여유: ${formatBytes(fs.size - fs.used)}\n`;
		content += `  사용률: ${((fs.used / fs.size) * 100).toFixed(2)}%\n\n`;
	});

	// 네트워크 정보
	content += '=== 네트워크 정보 ===\n';
	systemInfo.networkInterfaces.forEach((iface: any, index: number) => {
		content += `인터페이스 ${index + 1}:\n`;
		content += `  이름: ${iface.iface}\n`;
		content += `  타입: ${iface.type}\n`;
		content += `  MAC 주소: ${iface.mac}\n`;
		content += `  IPv4: ${iface.ip4 || 'N/A'}\n`;
		content += `  IPv6: ${iface.ip6 || 'N/A'}\n`;
		content += `  내부: ${iface.internal ? '예' : '아니오'}\n`;
		content += `  가상: ${iface.virtual ? '예' : '아니오'}\n\n`;
	});

	// 시스템 업타임
	content += '=== 시스템 업타임 ===\n';
	content += `업타임: ${formatUptime(systemInfo.time.uptime)}\n`;
	content += `타임존: ${systemInfo.time.timezone}\n`;
	content += `타임존 이름: ${systemInfo.time.timezoneName}\n\n`;

	content += '=== 보고서 끝 ===\n';
	return content;
}

// 파일 저장 IPC 핸들러
ipcMain.handle('save-system-info', async () => {
	try {
		const systemInfo = await getAllSystemInfo();
		const result = await dialog.showSaveDialog(win!, {
			title: '시스템 정보 저장',
			defaultPath: `system_info_${new Date()
				.toISOString()
				.slice(0, 19)
				.replace(/:/g, '-')}.txt`,
			filters: [
				{ name: '텍스트 파일', extensions: ['txt'] },
				{ name: '모든 파일', extensions: ['*'] },
			],
		});

		if (!result.canceled && result.filePath) {
			const content = formatSystemInfoForSave(systemInfo);
			fs.writeFileSync(result.filePath, content, 'utf8');
			return {
				success: true,
				message: '시스템 정보가 성공적으로 저장되었습니다.',
			};
		}
		return { success: false, message: '저장이 취소되었습니다.' };
	} catch (error) {
		console.error('파일 저장 실패:', error);
		throw error;
	}
});
