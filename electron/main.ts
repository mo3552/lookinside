import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import { join } from 'path';
import si from 'systeminformation';
import path from 'path';

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
