# Bigtablet Design System

Bigtablet의 공통 UI 컴포넌트 라이브러리입니다.  
Storybook 기반으로 컴포넌트 개발 및 문서화를 진행하며,  
`Chromatic`을 통해 미리보기와 시각적 테스트,  
`npm`을 통해 실제 프로젝트 배포를 관리합니다.

---

## Tech Stack

| 구분              | 기술                  |
|-----------------|---------------------|
| Framework       | React 19            |
| Styling         | SCSS (모듈 단위 스타일 분리) |
| Documentation   | Storybook 8         |
| Preview Hosting | Chromatic           |
| Build           | tsup                |
| Package Manager | pnpm                |
| CI/CD           | GitHub Actions      |

---

## 프로젝트 구조
src/
├── ui/
│   ├── form/         # TextField, Checkbox, Switch, Radio, FileInput
│   ├── feedback/     # Alert, Toast, Loading
│   ├── navigation/   # Sidebar, Pagination
│   ├── overlay/      # Modal
│   ├── display/      # Card
│   ├── general/      # Button, Select
│   └── styles/       # variables, typography 등 글로벌 스타일
└── index.ts          # 컴포넌트 export 집약
```

---

## 🧩 Storybook 로컬 실행

```bash
pnpm install
pnpm storybook
```
브라우저에서 http://localhost:6006 접속.

---

## Storybook 배포 (Chromatic)

### Chromatic Dashboard
- 관리용 빌드 페이지: https://www.chromatic.com/build?appId=690c033dff711a9fd70fc757￼
- 실제 공개 Storybook:
- 빌드 상세 페이지 내 “View build” 버튼 클릭 →
예시: https://bigtablet-design-system-abcdef.chromatic.com

## Chromatic 배포 방식
- **main** 브랜치에 push하면 자동으로 Chromatic이 Storybook을 빌드 후 배포.
- GitHub Actions 워크플로우 파일: **.github/workflows/stotybook.yml** 참고

## CHROMATIC_TOKEN은 GitHub Secrets에 등록되어 있어야 합니다.
발급: Chromatic → Manage → Project Token → Copy

## pnpm 배포

자동 배포 (GitHub Actions)

package.json의 버전을 업데이트 후,
v0.2.0 같은 태그를 push하면 자동으로 배포됩니다.

```bash
pnpm version patch  # or minor / major
git push --follow-tags
```

Actions 파일: .github/workflows/publish.yml

PNPM_TOKEN은 npm Access Token을 GitHub Secrets에 등록해야 합니다.

## 개발 가이드

### 새 컴포넌트 생성
1.	src/ui/<category>/<component> 폴더 생성
2.	index.tsx + style.scss + stories.tsx 작성
3.	src/index.ts에서 export 추가

### Storybook 작성 가이드
•	title 경로 구조: Components/<Category>/<Component>
•	기본 args, variant, docs description 포함 권장

⸻

### 빌드
```bash
pnpm build
```

- 결과물: dist/
- ESM + CJS + Type Definitions + CSS 포함

## 주로 발생하는 에러

| 문제                                    | 원인 / 해결책                                              |
|---------------------------------------|-------------------------------------------------------|
| Chromatic 에러: “Found only one commit” | Actions에서 fetch-depth: 0 추가 필요                        |
| npm 404 오류                            | npm Organization 이름이 다를 수 있음. package.json의 "name" 확인 |