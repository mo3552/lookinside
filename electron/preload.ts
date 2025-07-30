import { contextBridge, ipcRenderer } from 'electron';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
	// 시스템 정보 조회 API
	getCpuInfo: () => ipcRenderer.invoke('get-cpu-info'),
	getMemoryInfo: () => ipcRenderer.invoke('get-memory-info'),
	getOsInfo: () => ipcRenderer.invoke('get-os-info'),
	getDiskInfo: () => ipcRenderer.invoke('get-disk-info'),
	getNetworkInfo: () => ipcRenderer.invoke('get-network-info'),
	getMotherboardInfo: () => ipcRenderer.invoke('get-motherboard-info'),
	getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
	getCpuUsage: () => ipcRenderer.invoke('get-cpu-usage'),
	getSystemUptime: () => ipcRenderer.invoke('get-system-uptime'),

	// 메뉴 이벤트 수신
	onRefreshSystemInfo: (callback: () => void) => {
		ipcRenderer.on('refresh-system-info', () => callback());
	},

	onSwitchTab: (callback: (tab: string) => void) => {
		ipcRenderer.on('switch-tab', (_event, tab) => callback(tab));
	},

	// 메인 프로세스 메시지 수신
	onMainProcessMessage: (callback: (message: string) => void) => {
		ipcRenderer.on('main-process-message', (_event, message) =>
			callback(message)
		);
	},

	// 리스너 제거
	removeAllListeners: (channel: string) => {
		ipcRenderer.removeAllListeners(channel);
	},
});

// --------- Preload scripts are loaded before every page load ---------
// You can safely use Node.js APIs in the preload script.
// e.g. window.readConfig = () => readFileSync('/path/to/config.json')

console.log(
	'👋 This message is being logged by the "preload.js" script, being executed in the context of the Renderer process, before the page loads.'
);
