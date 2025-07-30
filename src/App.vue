<template>
	<div id="app">
		<header class="header">
			<h1>LookInside</h1>
		</header>

		<main class="main-content">
			<div class="header-controls">
				<button
					@click="refreshAll"
					class="refresh-btn"
					:disabled="loading"
				>
					새로고침
				</button>
				<label class="auto-refresh">
					<input type="checkbox" v-model="autoRefresh" />
					자동 새로고침 (30초)
				</label>
			</div>

			<div class="content">
				<!-- CPU 정보 -->
				<div v-if="activeSection === 'cpu'" class="section">
					<CpuInfo :cpu-info="systemInfo.cpu" :loading="loading" />
				</div>

				<!-- 메모리 정보 -->
				<div v-if="activeSection === 'memory'" class="section">
					<MemoryInfo
						:memory-info="systemInfo.memory"
						:loading="loading"
					/>
				</div>

				<!-- 운영체제 정보 -->
				<div v-if="activeSection === 'os'" class="section">
					<OsInfo :os-info="systemInfo.os" :loading="loading" />
				</div>

				<!-- 디스크 정보 -->
				<div v-if="activeSection === 'disk'" class="section">
					<DiskInfo
						:disk-info="systemInfo.diskLayout"
						:fs-info="systemInfo.fsSize"
						:loading="loading"
					/>
				</div>

				<!-- 네트워크 정보 -->
				<div v-if="activeSection === 'network'" class="section">
					<NetworkInfo
						:network-info="systemInfo.networkInterfaces"
						:loading="loading"
					/>
				</div>

				<!-- 메인보드 정보 -->
				<div v-if="activeSection === 'motherboard'" class="section">
					<MotherboardInfo
						:motherboard-info="systemInfo.motherboard"
						:loading="loading"
					/>
				</div>
			</div>
		</main>

		<!-- 초기 로딩 화면 -->
		<div v-if="loading && !systemInfo.cpu" class="initial-loading">
			<div class="loading-center">
				<div class="loading-dots">
					<div class="dot"></div>
					<div class="dot"></div>
					<div class="dot"></div>
				</div>
				<div class="loading-text">CPU 정보를 불러오는 중...</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import CpuInfo from './components/CpuInfo.vue';
import MemoryInfo from './components/MemoryInfo.vue';
import OsInfo from './components/OsInfo.vue';
import MotherboardInfo from './components/MotherboardInfo.vue';
import DiskInfo from './components/DiskInfo.vue';
import NetworkInfo from './components/NetworkInfo.vue';

// 타입 정의
interface SystemInfo {
	cpu: any;
	memory: any;
	os: any;
	diskLayout: any[];
	fsSize: any[];
	networkInterfaces: any[];
	motherboard: any;
}

// 반응형 데이터
const loading = ref(false);
const autoRefresh = ref(false);
const activeSection = ref('cpu');
const systemInfo = ref<SystemInfo>({
	cpu: null,
	memory: null,
	os: null,
	diskLayout: [],
	fsSize: [],
	networkInterfaces: [],
	motherboard: null,
});

let autoRefreshInterval: number | null = null;

// 시스템 정보 조회
const fetchSystemInfo = async () => {
	try {
		loading.value = true;
		const info = await (window as any).electronAPI.getSystemInfo();
		systemInfo.value = info;
	} catch (error) {
		console.error('시스템 정보 조회 실패:', error);
	} finally {
		loading.value = false;
	}
};

// 모든 정보 새로고침
const refreshAll = () => {
	fetchSystemInfo();
};

// 스크롤을 최상위로 이동
const scrollToTop = () => {
	const contentElement = document.querySelector('.content');
	if (contentElement) {
		contentElement.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	}
};

// 자동 새로고침 설정
watch(autoRefresh, (newValue) => {
	if (newValue) {
		autoRefreshInterval = window.setInterval(fetchSystemInfo, 30000); // 30초마다
	} else {
		if (autoRefreshInterval) {
			clearInterval(autoRefreshInterval);
			autoRefreshInterval = null;
		}
	}
});

// 메뉴 이벤트 처리
onMounted(() => {
	fetchSystemInfo();

	// 새로고침 메뉴 이벤트
	(window as any).electronAPI.onRefreshSystemInfo(() => {
		fetchSystemInfo();
		// 새로고침 시에도 스크롤을 최상위로 이동
		scrollToTop();
	});

	// 섹션 전환 메뉴 이벤트
	(window as any).electronAPI.onSwitchTab((section: string) => {
		activeSection.value = section;
		// 섹션 변경 시 스크롤을 최상위로 이동
		scrollToTop();
	});
});

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
	if (autoRefreshInterval) {
		clearInterval(autoRefreshInterval);
	}
	(window as any).electronAPI.removeAllListeners('refresh-system-info');
	(window as any).electronAPI.removeAllListeners('switch-tab');
});
</script>

<style scoped>
#app {
	height: 100vh;
	display: flex;
	flex-direction: column;
	font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI',
		Roboto, sans-serif;
}

.header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	padding: 1rem 2rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header h1 {
	margin: 0;
	font-size: 1.5rem;
	font-weight: 600;
}

.main-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.header-controls {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	gap: 1rem;
	padding: 1rem 2rem;
	background: #f8f9fa;
	border-bottom: 1px solid #e9ecef;
}

.refresh-btn {
	padding: 0.5rem 1rem;
	background: #667eea;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-weight: 500;
	transition: background 0.2s;
}

.refresh-btn:hover:not(:disabled) {
	background: #5a6fd8;
}

.refresh-btn:disabled {
	background: #6c757d;
	cursor: not-allowed;
}

.auto-refresh {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.9rem;
	color: #6c757d;
}

.content {
	flex: 1;
	overflow: auto;
	padding: 1rem;
	background: white;
	height: calc(100vh - 120px);
}

.section {
	width: 100%;
	margin-bottom: 1rem;
}

.loading-message {
	text-align: center;
	padding: 4rem 2rem;
	color: #6c757d;
	font-size: 1.1rem;
	background: #f8f9fa;
	border-radius: 8px;
	margin: 2rem auto;
	max-width: 600px;
}

/* 초기 로딩 화면 스타일 */
.initial-loading {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: white;
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 999;
}

.loading-center {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
}

.loading-dots {
	display: flex;
	gap: 8px;
	justify-content: center;
	align-items: center;
}

.dot {
	width: 12px;
	height: 12px;
	background: #667eea;
	border-radius: 50%;
	animation: dot-pulse 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
	animation-delay: -0.32s;
}

.dot:nth-child(2) {
	animation-delay: -0.16s;
}

.dot:nth-child(3) {
	animation-delay: 0s;
}

.loading-text {
	color: #6c757d;
	font-size: 1.1rem;
	font-weight: 500;
}

@keyframes dot-pulse {
	0%,
	80%,
	100% {
		transform: scale(0.8);
		opacity: 0.5;
	}
	40% {
		transform: scale(1);
		opacity: 1;
	}
}
</style>
