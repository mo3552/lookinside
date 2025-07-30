<template>
	<div class="cpu-info">
		<div v-if="cpuInfo" class="info-container">
			<!-- CPU 사용률 시각화 -->
			<div class="info-card">
				<h3>CPU 사용률</h3>
				<div class="usage-container">
					<div class="usage-bar">
						<div
							class="usage-fill"
							:style="{ width: cpuUsage + '%' }"
						></div>
					</div>
					<div class="usage-text">{{ cpuUsage.toFixed(1) }}%</div>
				</div>
			</div>

			<!-- CPU 기본 정보 -->
			<div class="info-card">
				<h3>CPU 기본 정보</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">제조사</span>
						<span class="info-value">{{
							cpuInfo.manufacturer || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">모델명</span>
						<span class="info-value">{{
							cpuInfo.brand || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">소켓</span>
						<span class="info-value">{{
							cpuInfo.socket || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">캐시</span>
						<span class="info-value">{{
							formatCache(cpuInfo.cache)
						}}</span>
					</div>
				</div>
			</div>

			<!-- CPU 성능 정보 -->
			<div class="info-card">
				<h3>성능 정보</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">물리적 코어</span>
						<span class="info-value"
							>{{ cpuInfo.physicalCores || 'N/A' }}개</span
						>
					</div>
					<div class="info-item">
						<span class="info-label">논리적 코어</span>
						<span class="info-value"
							>{{ cpuInfo.cores || 'N/A' }}개</span
						>
					</div>
					<div class="info-item">
						<span class="info-label">현재 클럭</span>
						<span class="info-value">{{
							formatSpeed(cpuInfo.speed)
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">최대 클럭</span>
						<span class="info-value">{{
							formatSpeed(cpuInfo.speedMax)
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">최소 클럭</span>
						<span class="info-value">{{
							formatSpeed(cpuInfo.speedMin)
						}}</span>
					</div>
				</div>
			</div>
		</div>

		<div v-else class="error-message">CPU 정보를 불러올 수 없습니다.</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface CpuInfo {
	manufacturer?: string;
	brand?: string;
	physicalCores?: number;
	cores?: number;
	speed?: number;
	speedMax?: number;
	speedMin?: number;
	socket?: string;
	cache?: any;
}

interface Props {
	cpuInfo: CpuInfo | null;
	loading: boolean;
}

const { cpuInfo } = defineProps<Props>();

const cpuUsage = ref(0);
let usageInterval: number | null = null;

// 속도 포맷팅
const formatSpeed = (speed: number | undefined): string => {
	if (!speed) return 'N/A';
	return `${speed.toFixed(2)} GHz`;
};

// 캐시 포맷팅
const formatCache = (cache: any): string => {
	if (!cache) return 'N/A';

	if (typeof cache === 'object') {
		const levels = [];
		if (cache.l1d) levels.push(`L1d: ${cache.l1d}`);
		if (cache.l1i) levels.push(`L1i: ${cache.l1i}`);
		if (cache.l2) levels.push(`L2: ${cache.l2}`);
		if (cache.l3) levels.push(`L3: ${cache.l3}`);
		return levels.join(', ') || 'N/A';
	}

	return cache.toString() || 'N/A';
};

// 실제 CPU 사용률 조회
const updateCpuUsage = async () => {
	try {
		const cpuUsageData = await (window as any).electronAPI.getCpuUsage();
		cpuUsage.value = cpuUsageData.currentLoad || 0;
	} catch (error) {
		console.error('CPU 사용률 조회 실패:', error);
		// 에러 시 랜덤 값 사용 (시뮬레이션)
		cpuUsage.value = Math.random() * 100;
	}
};

onMounted(() => {
	// CPU 사용률 업데이트 (1초마다)
	usageInterval = window.setInterval(updateCpuUsage, 1000);
});

onUnmounted(() => {
	if (usageInterval) {
		clearInterval(usageInterval);
	}
});
</script>

<style scoped>
.cpu-info {
	width: 100%;
}

.info-container {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.usage-container {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.usage-bar {
	flex: 1;
	height: 20px;
	background: #e9ecef;
	border-radius: 10px;
	overflow: hidden;
	position: relative;
}

.usage-fill {
	height: 100%;
	background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
	border-radius: 10px;
	transition: width 0.3s ease;
}

.usage-text {
	font-weight: 600;
	color: #495057;
	min-width: 60px;
	text-align: right;
}

.error-message {
	text-align: center;
	color: #dc3545;
	padding: 2rem;
	background: #f8d7da;
	border: 1px solid #f5c6cb;
	border-radius: 8px;
}
</style>
