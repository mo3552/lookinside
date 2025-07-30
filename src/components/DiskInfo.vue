<template>
	<div class="disk-info">
		<div v-if="loading" class="loading-spinner">
			디스크 정보를 불러오는 중...
		</div>

		<div v-else-if="diskInfo && fsInfo" class="info-container">
			<!-- 파일 시스템 정보 -->
			<div class="info-card">
				<h3>파일 시스템</h3>
				<div class="fs-list">
					<div v-for="fs in fsInfo" :key="fs.fs" class="fs-item">
						<div class="fs-header">
							<h4>{{ fs.fs }}</h4>
							<span class="fs-type">{{ fs.type }}</span>
						</div>
						<div class="fs-usage">
							<div class="usage-bar">
								<div
									class="usage-fill"
									:style="{
										width: getUsagePercent(fs) + '%',
									}"
								></div>
							</div>
							<div class="fs-stats">
								<div class="fs-stat">
									<span class="stat-label">총 용량</span>
									<span class="stat-value">{{
										formatBytes(fs.size)
									}}</span>
								</div>
								<div class="fs-stat">
									<span class="stat-label">사용 중</span>
									<span class="stat-value">{{
										formatBytes(fs.used)
									}}</span>
								</div>
								<div class="fs-stat">
									<span class="stat-label">여유 공간</span>
									<span class="stat-value">{{
										formatBytes(fs.available)
									}}</span>
								</div>
								<div class="fs-stat">
									<span class="stat-label">사용률</span>
									<span class="stat-value"
										>{{
											getUsagePercent(fs).toFixed(1)
										}}%</span
									>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 디스크 레이아웃 정보 -->
			<div class="info-card">
				<h3>디스크 레이아웃</h3>
				<div class="disk-list">
					<div
						v-for="disk in diskInfo"
						:key="disk.device"
						class="disk-item"
					>
						<div class="disk-header">
							<h4>{{ disk.device }}</h4>
							<span class="disk-type">{{ disk.type }}</span>
						</div>
						<div class="disk-details">
							<div class="disk-detail">
								<span class="detail-label">제조사</span>
								<span class="detail-value">{{
									disk.vendor || 'N/A'
								}}</span>
							</div>
							<div class="disk-detail">
								<span class="detail-label">모델</span>
								<span class="detail-value">{{
									disk.name || 'N/A'
								}}</span>
							</div>
							<div class="disk-detail">
								<span class="detail-label">시리얼 번호</span>
								<span class="detail-value">{{
									disk.serial || 'N/A'
								}}</span>
							</div>
							<div class="disk-detail">
								<span class="detail-label">크기</span>
								<span class="detail-value">{{
									formatBytes(disk.size)
								}}</span>
							</div>
							<div class="disk-detail">
								<span class="detail-label">인터페이스</span>
								<span class="detail-value">{{
									disk.interfaceType || 'N/A'
								}}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div v-else class="error-message">
			디스크 정보를 불러올 수 없습니다.
		</div>
	</div>
</template>

<script setup lang="ts">
interface FsInfo {
	fs: string;
	type: string;
	size: number;
	used: number;
	available: number;
	use: number;
	mount: string;
}

interface DiskInfo {
	device: string;
	type: string;
	name: string;
	vendor: string;
	size: number;
	serial: string;
	interfaceType: string;
}

interface Props {
	diskInfo: DiskInfo[];
	fsInfo: FsInfo[];
	loading: boolean;
}

const props = defineProps<Props>();

// 사용률 계산
const getUsagePercent = (fs: FsInfo): number => {
	if (fs.size === 0) return 0;
	return (fs.used / fs.size) * 100;
};

// 바이트 포맷팅
const formatBytes = (bytes: number): string => {
	if (!bytes || bytes === 0) return '0 B';

	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.disk-info {
	width: 100%;
}

.info-container {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.fs-list,
.disk-list {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.fs-item,
.disk-item {
	background: #f8f9fa;
	border-radius: 8px;
	padding: 1rem;
	border: 1px solid #e9ecef;
}

.fs-header,
.disk-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.fs-header h4,
.disk-header h4 {
	margin: 0;
	color: #495057;
	font-size: 1rem;
	font-weight: 600;
}

.fs-type,
.disk-type {
	background: #667eea;
	color: white;
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	font-size: 0.8rem;
	font-weight: 500;
}

.fs-usage {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.usage-bar {
	height: 16px;
	background: #e9ecef;
	border-radius: 8px;
	overflow: hidden;
}

.usage-fill {
	height: 100%;
	background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
	border-radius: 8px;
	transition: width 0.3s ease;
}

.fs-stats {
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.5rem;
}

.fs-stat {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.5rem;
	background: white;
	border-radius: 4px;
	border: 1px solid #dee2e6;
}

.stat-label {
	font-size: 0.8rem;
	color: #6c757d;
	font-weight: 500;
}

.stat-value {
	font-size: 0.8rem;
	color: #495057;
	font-weight: 600;
}

.disk-details {
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.5rem;
}

.disk-detail {
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
