<template>
	<div class="motherboard-info">
		<div v-if="loading" class="loading-spinner">
			메인보드 정보를 불러오는 중...
		</div>

		<div v-else-if="motherboardInfo" class="info-container">
			<!-- 메인보드 기본 정보 -->
			<div class="info-card">
				<h3>메인보드 기본 정보</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">제조사</span>
						<span class="info-value">{{
							motherboardInfo.baseboard?.manufacturer || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">모델</span>
						<span class="info-value">{{
							motherboardInfo.baseboard?.model || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">시리얼 번호</span>
						<span class="info-value">{{
							motherboardInfo.baseboard?.serial || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">버전</span>
						<span class="info-value">{{
							motherboardInfo.baseboard?.version || 'N/A'
						}}</span>
					</div>
				</div>
			</div>

			<!-- BIOS 정보 -->
			<div class="info-card">
				<h3>BIOS 정보</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">제조사</span>
						<span class="info-value">{{
							motherboardInfo.bios?.vendor || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">버전</span>
						<span class="info-value">{{
							motherboardInfo.bios?.version || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">릴리즈 날짜</span>
						<span class="info-value">{{
							motherboardInfo.bios?.releaseDate || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">ROM 크기</span>
						<span class="info-value">{{
							motherboardInfo.bios?.romSize || 'N/A'
						}}</span>
					</div>
				</div>
			</div>

			<!-- 케이스 정보 -->
			<div class="info-card">
				<h3>케이스 정보</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">제조사</span>
						<span class="info-value">{{
							motherboardInfo.chassis?.manufacturer || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">모델</span>
						<span class="info-value">{{
							motherboardInfo.chassis?.model || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">시리얼 번호</span>
						<span class="info-value">{{
							motherboardInfo.chassis?.serial || 'N/A'
						}}</span>
					</div>
					<div class="info-item">
						<span class="info-label">타입</span>
						<span class="info-value">{{
							motherboardInfo.chassis?.type || 'N/A'
						}}</span>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="error-message">
			메인보드 정보를 불러올 수 없습니다.
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	motherboardInfo: any;
	loading: boolean;
}>();
</script>

<style scoped>
.motherboard-info {
	width: 100%;
}

.loading-spinner {
	text-align: center;
	padding: 2rem;
	color: #6c757d;
}

.info-container {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.info-card {
	background: white;
	border-radius: 8px;
	padding: 1rem;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	border: 1px solid #e9ecef;
}

.info-card h3 {
	margin: 0 0 1rem 0;
	color: #495057;
	font-size: 1.1rem;
	font-weight: 600;
	border-bottom: 2px solid #667eea;
	padding-bottom: 0.5rem;
}

.info-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.5rem;
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
