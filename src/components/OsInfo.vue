<template>
	<div class="os-info">
		<div v-if="loading" class="loading-spinner">
			운영체제 정보를 불러오는 중...
		</div>

		<div v-else-if="osInfo" class="info-container">
			<!-- OS 기본 정보 -->
			<div class="info-card">
				<h3>운영체제 기본 정보</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">플랫폼</span>
						<span class="info-value">{{
							osInfo.platform || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">배포판</span>
						<span class="info-value">{{
							osInfo.distro || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">릴리즈</span>
						<span class="info-value">{{
							osInfo.release || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">코드명</span>
						<span class="info-value">{{
							osInfo.codename || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">아키텍처</span>
						<span class="info-value">{{
							osInfo.arch || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">호스트명</span>
						<span class="info-value">{{
							osInfo.hostname || 'N/A'
						}}</span>
					</div>
				</div>
			</div>

			<!-- OS 상세 정보 -->
			<div class="info-card">
				<h3>상세 정보</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">빌드 번호</span>
						<span class="info-value">{{
							osInfo.build || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">서비스 팩</span>
						<span class="info-value">{{
							osInfo.servicepack || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">코드페이지</span>
						<span class="info-value">{{
							osInfo.codepage || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">시리얼 번호</span>
						<span class="info-value">{{
							osInfo.serial || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">UEFI</span>
						<span class="info-value">{{
							osInfo.uefi ? '예' : '아니오'
						}}</span>
					</div>
				</div>
			</div>

			<!-- 시스템 업타임 -->
			<div class="info-card">
				<h3>시스템 정보</h3>
				<div class="uptime-info">
					<div class="uptime-item">
						<span class="uptime-label">시스템 시작 시간</span>
						<span class="uptime-value">{{ systemStartTime }}</span>
					</div>
					<div class="uptime-item">
						<span class="uptime-label">업타임</span>
						<span class="uptime-value">{{ uptime }}</span>
					</div>
				</div>
			</div>
		</div>

		<div v-else class="error-message">
			운영체제 정보를 불러올 수 없습니다.
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface OsInfo {
	platform?: string;
	distro?: string;
	release?: string;
	codename?: string;
	arch?: string;
	hostname?: string;
	codepage?: string;
	logofile?: string;
	serial?: string;
	build?: string;
	servicepack?: string;
	uefi?: boolean;
}

interface Props {
	osInfo: OsInfo | null;
	loading: boolean;
}

const props = defineProps<Props>();

const systemStartTime = ref('');
const uptime = ref('');
let uptimeInterval: number | null = null;

// 실제 시스템 업타임 조회
const fetchSystemUptime = async () => {
	try {
		const uptimeData = await (window as any).electronAPI.getSystemUptime();
		const uptimeSeconds = uptimeData.uptime;

		// 시스템 시작 시간 계산
		const now = new Date();
		const startTime = new Date(now.getTime() - uptimeSeconds * 1000);
		systemStartTime.value = startTime.toLocaleString('ko-KR');

		// 업타임 포맷팅
		const days = Math.floor(uptimeSeconds / 86400);
		const hours = Math.floor((uptimeSeconds % 86400) / 3600);
		const minutes = Math.floor((uptimeSeconds % 3600) / 60);
		const seconds = Math.floor(uptimeSeconds % 60);

		if (days > 0) {
			uptime.value = `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
		} else if (hours > 0) {
			uptime.value = `${hours}시간 ${minutes}분 ${seconds}초`;
		} else {
			uptime.value = `${minutes}분 ${seconds}초`;
		}
	} catch (error) {
		console.error('시스템 업타임 조회 실패:', error);
		uptime.value = 'N/A';
		systemStartTime.value = 'N/A';
	}
};

// 업타임 업데이트
const updateUptime = () => {
	fetchSystemUptime();
};

onMounted(() => {
	fetchSystemUptime();

	// 업타임 업데이트 (1초마다)
	uptimeInterval = window.setInterval(updateUptime, 1000);
});

onUnmounted(() => {
	if (uptimeInterval) {
		clearInterval(uptimeInterval);
	}
});
</script>

<style scoped>
.os-info {
	width: 100%;
}

.info-container {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.uptime-info {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.uptime-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem;
	background: #f8f9fa;
	border-radius: 8px;
	border: 1px solid #e9ecef;
}

.uptime-label {
	font-weight: 500;
	color: #6c757d;
	font-size: 0.9rem;
}

.uptime-value {
	font-weight: 600;
	color: #495057;
	font-size: 0.9rem;
	font-family: 'Courier New', monospace;
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
