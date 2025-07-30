<template>
	<div class="memory-info">
		<div v-if="loading" class="loading-spinner">
			메모리 정보를 불러오는 중...
		</div>

		<div v-else-if="memoryInfo" class="info-container">
			<!-- 메모리 사용량 -->
			<div class="info-card">
				<h3>메모리 사용량</h3>
				<div class="memory-usage">
					<div class="usage-bar">
						<div
							class="usage-fill"
							:style="{ width: memoryUsagePercent + '%' }"
						></div>
					</div>
					<div class="usage-stats">
						<div class="usage-stat">
							<span class="stat-label">사용 중</span>
							<span class="stat-value">{{
								formatBytes(memoryInfo.used)
							}}</span>
						</div>
						<div class="usage-stat">
							<span class="stat-label">사용 가능</span>
							<span class="stat-value">{{
								formatBytes(memoryInfo.available)
							}}</span>
						</div>
						<div class="usage-stat">
							<span class="stat-label">전체</span>
							<span class="stat-value">{{
								formatBytes(memoryInfo.total)
							}}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- 메모리 상세 정보 -->
			<div class="info-card">
				<h3>메모리 상세 정보</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">전체 메모리</span>
						<span class="info-value">{{
							formatBytes(memoryInfo.total)
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">사용 중</span>
						<span class="info-value">{{
							formatBytes(memoryInfo.used)
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">사용 가능</span>
						<span class="info-value">{{
							formatBytes(memoryInfo.available)
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">여유 메모리</span>
						<span class="info-value">{{
							formatBytes(memoryInfo.free)
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">활성 메모리</span>
						<span class="info-value">{{
							formatBytes(memoryInfo.active)
						}}</span>
					</div>
				</div>
			</div>

			<!-- 스왑 메모리 정보 -->
			<div class="info-card">
				<h3>스왑 메모리</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">전체 스외</span>
						<span class="info-value">{{
							formatBytes(memoryInfo.swaptotal)
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">사용 중 스외</span>
						<span class="info-value">{{
							formatBytes(memoryInfo.swapused)
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">여유 스외</span>
						<span class="info-value">{{
							formatBytes(memoryInfo.swapfree)
						}}</span>
					</div>
				</div>
			</div>
		</div>

		<div v-else class="error-message">
			메모리 정보를 불러올 수 없습니다.
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface MemoryInfo {
	total: number;
	used: number;
	free: number;
	active: number;
	available: number;
	swaptotal: number;
	swapused: number;
	swapfree: number;
}

interface Props {
	memoryInfo: MemoryInfo | null;
	loading: boolean;
}

const props = defineProps<Props>();

// 메모리 사용률 계산
const memoryUsagePercent = computed(() => {
	if (!props.memoryInfo) return 0;
	return (props.memoryInfo.used / props.memoryInfo.total) * 100;
});

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
.memory-info {
	width: 100%;
}

.info-container {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.memory-usage {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.usage-bar {
	height: 24px;
	background: #e9ecef;
	border-radius: 12px;
	overflow: hidden;
	position: relative;
}

.usage-fill {
	height: 100%;
	background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
	border-radius: 12px;
	transition: width 0.3s ease;
}

.usage-stats {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: 0.75rem;
}

.usage-stat {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem;
	background: #f8f9fa;
	border-radius: 8px;
	border: 1px solid #e9ecef;
}

.stat-label {
	font-weight: 500;
	color: #6c757d;
	font-size: 0.9rem;
}

.stat-value {
	font-weight: 600;
	color: #495057;
	font-size: 0.9rem;
}

.error-message {
	text-align: center;
	color: #dc3545;
	padding: 2rem;
	background: #f8d7da;
	border: 1px solid #f5c6cb;
	border-radius: 8px;
}

@media (max-width: 768px) {
	.usage-stats {
		grid-template-columns: 1fr;
	}
}
</style>
