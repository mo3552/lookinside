# LookInside

CPU-Z와 유사한 기능을 제공하는 데스크탑 시스템 정보 뷰어 애플리케이션입니다.

## 🚀 주요 기능

-   **CPU 정보**: 모델명, 클럭 속도, 코어 수, 쓰레드 수, 실시간 사용률
-   **메모리 정보**: 전체 메모리, 사용 중 메모리, 사용 가능 메모리, 스왑 메모리
-   **운영체제 정보**: 플랫폼, 버전, 아키텍처, 호스트명, 시스템 업타임
-   **디스크 정보**: 드라이브 이름, 총 용량, 사용 중 용량, 파일 시스템 종류
-   **네트워크 정보**: 활성화된 네트워크 어댑터, IP 주소, MAC 주소 등
-   **메인보드 정보**: 베이스보드, BIOS, 케이스 정보
-   **실시간 정보 갱신**: 자동 새로고침 기능 (30초 간격)
-   **메뉴 시스템**: 키보드 단축키 지원

## 🛠️ 기술 스택

-   **Electron**: 데스크탑 애플리케이션 런타임
-   **Vue 3**: 프론트엔드 프레임워크 (Composition API)
-   **Vite**: 빌드 도구
-   **TypeScript**: 타입 안전성
-   **systeminformation**: 시스템 정보 수집 라이브러리
-   **Pretendard**: 한글 최적화 폰트

## 📦 설치 및 실행

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# Electron 개발 모드 실행
npm run electron:serve
```

### 프로덕션 빌드

```bash
# 애플리케이션 빌드
npm run electron:build

# 플랫폼별 빌드
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
npm run electron:build:all    # 모든 플랫폼
```

## 🏗️ 프로젝트 구조

```
cpuz/
├── electron/           # Electron 메인 프로세스
│   ├── main.ts        # 메인 프로세스 진입점
│   └── preload.ts     # Preload 스크립트
├── src/               # Vue 애플리케이션
│   ├── components/    # Vue 컴포넌트
│   │   ├── CpuInfo.vue
│   │   ├── MemoryInfo.vue
│   │   ├── OsInfo.vue
│   │   ├── DiskInfo.vue
│   │   ├── NetworkInfo.vue
│   │   └── MotherboardInfo.vue
│   ├── App.vue        # 메인 Vue 컴포넌트
│   ├── main.ts        # Vue 애플리케이션 진입점
│   └── style.css      # 전역 스타일
├── dist-electron/     # 빌드된 Electron 파일
├── release/          # 배포 파일
├── package.json      # 프로젝트 설정
├── vite.config.ts    # Vite 설정
├── tsconfig.json     # TypeScript 설정
└── index.html        # HTML 템플릿
```

## 🔧 주요 컴포넌트

### CPU 정보 (CpuInfo.vue)

-   CPU 기본 정보 (제조사, 모델명, 소켓, 캐시)
-   성능 정보 (물리적/논리적 코어 수, 현재/최대/최소 클럭)
-   실시간 CPU 사용률 시각화 (1초마다 업데이트)

### 메모리 정보 (MemoryInfo.vue)

-   메모리 사용량 시각화
-   상세 메모리 정보 (전체, 사용 중, 사용 가능)
-   스왑 메모리 정보

### 운영체제 정보 (OsInfo.vue)

-   OS 기본 정보 (플랫폼, 배포판, 릴리즈)
-   상세 정보 (빌드 번호, 서비스 팩, UEFI 지원)
-   시스템 업타임

### 디스크 정보 (DiskInfo.vue)

-   파일 시스템 정보 및 사용률
-   디스크 레이아웃 정보 (모델, 크기, 인터페이스)
-   용량 및 인터페이스 정보

### 네트워크 정보 (NetworkInfo.vue)

-   네트워크 인터페이스 목록
-   IP 주소, MAC 주소, 게이트웨이
-   네트워크 통계

### 메인보드 정보 (MotherboardInfo.vue)

-   베이스보드 정보 (제조사, 모델, 버전)
-   BIOS 정보 (제조사, 버전, 릴리즈 날짜)
-   케이스 정보 (제조사, 모델, 타입)

## 🎨 UI/UX 특징

-   **모던한 디자인**: 깔끔하고 직관적인 인터페이스
-   **반응형 레이아웃**: 다양한 화면 크기에 대응
-   **실시간 업데이트**: 자동 새로고침 기능 (30초 간격)
-   **시각적 피드백**: 로딩 상태 및 사용률 바
-   **한글 최적화**: Pretendard 폰트 사용
-   **메뉴 시스템**: 키보드 단축키 지원 (Ctrl+R: 새로고침)

## 🔒 보안 고려사항

-   **Context Isolation**: 렌더러 프로세스와 메인 프로세스 분리
-   **Preload 스크립트**: 안전한 IPC 통신
-   **Node.js 통합 제한**: 보안 강화
-   **Content Security Policy**: XSS 방지

## 🌍 크로스 플랫폼 지원

-   **Windows**: NSIS 인스톨러 (600x800 기본 창 크기)
-   **macOS**: DMG 패키지
-   **Linux**: AppImage

## 📋 메뉴 시스템

### 파일 메뉴

-   종료 (Ctrl+Q)

### 보기 메뉴

-   CPU 정보
-   메모리 정보
-   운영체제 정보
-   메인보드 정보
-   디스크 정보
-   네트워크 정보

### 도구 메뉴

-   새로고침 (Ctrl+R)

### 도움말 메뉴

-   정보 (버전, 제작자 정보)

## 🔧 개발 환경

### 필수 요구사항

-   Node.js 16+
-   npm 또는 yarn

### 개발 명령어

```bash
npm run dev              # Vite 개발 서버
npm run build            # 프로덕션 빌드
npm run electron:serve   # Electron 개발 모드
npm run electron:build   # Electron 빌드
npm run electron:preview # 빌드된 앱 미리보기
```

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

**제작자**: Mario  
**이메일**: mo3552@gmail.com  
**버전**: 1.0.0  
**프로젝트명**: LookInside
