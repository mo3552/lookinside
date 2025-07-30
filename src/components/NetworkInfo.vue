<template>
	<div class="network-info">
		<div v-if="loading" class="loading-spinner">
			네트워크 정보를 불러오는 중...
		</div>

		<div v-else-if="networkInfo" class="info-container">
			<!-- 네트워크 인터페이스 목록 -->
			<div class="info-card">
				<h3>네트워크 인터페이스</h3>
				<div class="network-list">
					<div
						v-for="iface in networkInfo"
						:key="iface.iface"
						class="network-item"
					>
						<div class="network-header">
							<h4>{{ iface.iface }}</h4>
							<div class="network-badges">
								<span v-if="iface.type" class="network-type">{{
									iface.type
								}}</span>
								<span
									class="network-status"
									:class="{
										active: iface.operstate === 'up',
									}"
								>
									{{
										iface.operstate === 'up'
											? '활성'
											: '비활성'
									}}
								</span>
							</div>
						</div>

						<div class="network-details">
							<div class="detail-row">
								<div class="detail-item">
									<span class="detail-label">MAC 주소</span>
									<span class="detail-value">{{
										iface.mac || 'N/A'
									}}</span>
								</div>
								<div class="detail-item">
									<span class="detail-label">IP 주소</span>
									<span class="detail-value">{{
										iface.ip || 'N/A'
									}}</span>
								</div>
							</div>

							<div class="detail-row">
								<div class="detail-item">
									<span class="detail-label">넷마스크</span>
									<span class="detail-value">{{
										iface.netmask || 'N/A'
									}}</span>
								</div>
								<div class="detail-item">
									<span class="detail-label">게이트웨이</span>
									<span class="detail-value">{{
										iface.gateway || 'N/A'
									}}</span>
								</div>
							</div>

							<div class="detail-row">
								<div class="detail-item">
									<span class="detail-label">DNS</span>
									<span class="detail-value">{{
										iface.dns || 'N/A'
									}}</span>
								</div>
								<div class="detail-item">
									<span class="detail-label">DHCP</span>
									<span class="detail-value">{{
										iface.dhcp ? '예' : '아니오'
									}}</span>
								</div>
							</div>

							<div class="detail-row">
								<div class="detail-item">
									<span class="detail-label">속도</span>
									<span class="detail-value">{{
										formatSpeed(iface.speed)
									}}</span>
								</div>
								<div class="detail-item">
									<span class="detail-label">MTU</span>
									<span class="detail-value">{{
										iface.mtu || 'N/A'
									}}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 네트워크 통계 -->
			<div class="info-card">
				<h3>네트워크 통계</h3>
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-icon">📡</div>
						<div class="stat-content">
							<div class="stat-title">활성 인터페이스</div>
							<div class="stat-value">{{ activeInterfaces }}</div>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-icon">🌐</div>
						<div class="stat-content">
							<div class="stat-title">네트워크 유형</div>
							<div class="stat-value">
								{{ networkTypes.join(', ') }}
							</div>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-icon">🔗</div>
						<div class="stat-content">
							<div class="stat-title">총 인터페이스</div>
							<div class="stat-value">
								{{ networkInfo.length }}개
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div v-else class="error-message">
			네트워크 정보를 불러올 수 없습니다.
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface NetworkInterface {
	iface: string;
	type: string;
	operstate: string;
	mac: string;
	ip: string;
	netmask: string;
	gateway: string;
	dns: string;
	dhcp: boolean;
	speed: number;
	mtu: number;
}

interface Props {
	networkInfo: NetworkInterface[];
	loading: boolean;
}

const props = defineProps<Props>();

// 활성 인터페이스 수
const activeInterfaces = computed(() => {
	if (!props.networkInfo) return 0;
	return props.networkInfo.filter((iface) => iface.operstate === 'up').length;
});

// 네트워크 유형 목록
const networkTypes = computed(() => {
	if (!props.networkInfo) return [];
	const types = new Set(props.networkInfo.map((iface) => iface.type));
	return Array.from(types);
});

// 속도 포맷팅
const formatSpeed = (speed: number): string => {
	if (!speed || speed === 0) return 'N/A';

	if (speed >= 1000000000) {
		return `${(speed / 1000000000).toFixed(1)} Gbps`;
	} else if (speed >= 1000000) {
		return `${(speed / 1000000).toFixed(1)} Mbps`;
	} else if (speed >= 1000) {
		return `${(speed / 1000).toFixed(1)} Kbps`;
	} else {
		return `${speed} bps`;
	}
};
</script>

<style scoped>
.network-info {
	width: 100%;
}

.info-container {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.network-list {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.network-item {
	background: #f8f9fa;
	border-radius: 8px;
	padding: 1rem;
	border: 1px solid #e9ecef;
}

.network-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.network-header h4 {
	margin: 0;
	color: #495057;
	font-size: 1rem;
	font-weight: 600;
}

.network-badges {
	display: flex;
	gap: 0.5rem;
	align-items: center;
}

.network-type {
	background: #667eea;
	color: white;
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	font-size: 0.8rem;
	font-weight: 500;
}

.network-status {
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	font-size: 0.8rem;
	font-weight: 500;
	background: #dc3545;
	color: white;
}

.network-status.active {
	background: #28a745;
}

.network-details {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.detail-row {
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.5rem;
}

.detail-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.5rem;
	background: white;
	border-radius: 4px;
	border: 1px solid #dee2e6;
}

.detail-label {
	font-size: 0.8rem;
	color: #6c757d;
	font-weight: 500;
}

.detail-value {
	font-size: 0.8rem;
	color: #495057;
	font-weight: 600;
	text-align: right;
	word-break: break-all;
	font-family: 'Courier New', monospace;
}

.stats-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.5rem;
}

.stat-card {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem;
	background: #f8f9fa;
	border-radius: 8px;
	border: 1px solid #e9ecef;
}

.stat-icon {
	font-size: 2rem;
	width: 50px;
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: white;
	border-radius: 8px;
	border: 1px solid #dee2e6;
}

.stat-content {
	flex: 1;
}

.stat-title {
	font-size: 0.8rem;
	color: #6c757d;
	font-weight: 500;
	margin-bottom: 0.25rem;
}

.stat-value {
	font-size: 1rem;
	color: #495057;
	font-weight: 600;
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
