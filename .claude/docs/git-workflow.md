# Git Workflow Guide

Git 컨벤션, 브랜치 전략, PR 워크플로우 가이드입니다.

## Commit Message Format

```
label: message

Co-Authored-By: Claude <noreply@anthropic.com>
```

- 라벨을 앞에, 커밋 내용을 뒤에 작성
- 모두 소문자 사용, 필요시 camelCase 허용
- 메시지는 영문으로 작성
- 어디서 무엇을 어떻게 했는지 알 수 있도록 작성
  - 예) `feat: add auth service`

## Co-Authored-By 규칙

- Claude와 함께 작업한 모든 커밋에는 `Co-Authored-By: Claude <noreply@anthropic.com>` 트레일러를 추가합니다
- 커밋 메시지 본문과 트레일러 사이에는 빈 줄을 하나 추가합니다

## Commit Labels

| Label | Description |
| --- | --- |
| `feat` | 추가 기능 개발 / 새로운 코드 추가 |
| `fix` | 기능/코드 수정 |
| `bug` | 버그/에러 수정 |
| `merge` | 브랜치 병합 |
| `deploy` | 프로젝트 배포 / 관련 문서 작업 |
| `docs` | 문서 추가/수정 |
| `delete` | 코드/파일/문서 삭제 |
| `note` | 주석 추가/제거 |
| `style` | 코드 스타일/구조 수정 |
| `config` | 설정 파일 / 의존성 / 라이브러리 수정 |
| `etc` | 기타 위에 해당하지 않는 경우 |
| `tada` | 프로젝트 생성 |

## Branch Naming

```
label/domain
```

- 라벨을 앞에, 작업 도메인을 뒤에 작성
- 예) `fix/auth`, `feat/member-table`

## Branch Merge Rules

- 병합 시 반드시 코드 리뷰어가 approve 후 브랜치 생성자가 병합
- 병합 커밋 메시지: `merge: branch-name`
  - 예) `merge: fix/auth`
- Develop → Main 배포: `merge: release [version]`

## Claude Workflow

사용자가 기능 개발이나 수정을 요청하면 아래 워크플로우를 따릅니다.

### 1. Issue 생성

기능 단위로 Issue를 생성합니다. Issue 본문은 한글로 작성합니다.

```bash
gh issue create --title "제목제목제목" --body "$(cat <<'EOF'
## 제목
제목제목제목

## 작업한 내용
- [ ] 작업1
- [ ] 작업2

## 전달할 추가 이슈
- 이슈1 (없으면 "없음")
EOF
)"
```

### 2. Branch 생성

```bash
git checkout -b feat/domain-name
```

### 3. 구현

- CSS Modules 컨벤션 준수 (`style.module.scss`)
- 디자인 토큰 사용 (`@bigtablet/design-system/scss/token`)
- Feature-Sliced Design 아키텍처 준수

### 4. Commit

```bash
git add -A && git commit -m "$(cat <<'EOF'
feat: add feature description

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 5. PR 생성

- **Base branch**: `develop` (main 아님!)
- **PR title**: 브랜치 이름과 동일
- **PR body**: 한글로 작성

```bash
gh pr create --base develop --title "feat/domain-name" --body "$(cat <<'EOF'
## 제목
feat/domain-name

## 작업한 내용
- [x] 작업1
- [x] 작업2
- [x] 작업3

## 전달할 추가 이슈
- 이슈1 (없으면 "없음")
EOF
)"
```

## Important Notes

- PR은 항상 `develop` 브랜치를 타겟으로 생성
- Issue와 PR 본문은 한글로 작성
- 커밋 메시지는 영문 소문자 사용
- Approve 없이 병합 금지
