---
name: release
description: "@bigtablet/design-system 릴리즈 - 버전 등급 판단, develop 에 `deploy: X.Y.Z` 커밋(package.json · CHANGELOG), develop→main 릴리즈 PR, merge commit 확인, 태그 푸시, npm · GitHub Release 확인. \"릴리즈\", \"배포\", \"버전 올려\", \"태그 달아\", \"main 에 올려\" 같은 요청에 쓴다."
---

# 릴리즈

규칙의 원본은 CLAUDE.md `### Release & Changelog` 다 (버전 등급 · `(렌더 변경)` · CHANGELOG 양식).
이 스킬은 순서와 명령만 담는다. 둘이 다르면 CLAUDE.md 가 맞다.

**흐름**: develop 에 `deploy: X.Y.Z` 커밋 하나 → develop→main PR 하나(`merge: release`) → 사람 approve →
merge commit 머지 → main 에 태그 → `release.yml` 이 npm publish + GitHub Release.
`release/X.Y.Z` 브랜치 · `deploy/` PR 은 만들지 않는다.

## 0. 시작 전

- **미결 항목을 먼저 꺼낸다.** 보류한 것 · 설계 판단이 남은 것 · 리뷰가 남긴 후속 항목이 있으면 이 단계에서
  사용자에게 알리고 이번 릴리즈에 넣을지 묻는다. 태그를 푸시한 뒤에는 꺼내지 않는다.
- 열린 릴리즈 PR 이 이미 있는지: `gh pr list --base main --head develop --state open`. 있으면 새로 만들지 않는다 -
  head 가 develop 이라 2번의 deploy 커밋이 그 PR 에 실린다. 그 PR 을 이어 쓸지(제목 · 본문 갱신) 사용자에게 확인한다
- main 에 develop 에 없는 내용이 없는지 - 출력이 비어야 한다. 있으면 먼저 `merge: main` 동기화 PR(head `main` → base `develop`)
  ```bash
  git fetch -q && git log --oneline --no-merges origin/develop..origin/main
  ```

## 1. 담길 변경 보기 · 등급 정하기

```bash
git log --oneline --no-merges origin/main..origin/develop
git diff --stat origin/main origin/develop
```

- 공개 표면(`src/index.ts` export · `/vanilla` · `/text` · SCSS 토큰 · CSS 변수 · `style.css` · `tailwind.css`)에서
  제거 · 이름 변경 · 시그니처 변경 → major. 새 export · prop · 토큰 → minor. 그 밖(버그 · 문서 · 내부) → patch
- 렌더가 바뀌면: 결함 수정이면 patch, 의도적 디자인 변경이면 minor. 어느 쪽이든 CHANGELOG 줄 앞에 `(렌더 변경)`
- 한 주기에 모인 변경은 릴리즈 하나로, 가장 높은 등급으로 낸다. patch 를 따로 쪼개자고 먼저 권하지 않는다
- 문서 · 사이트 · `.claude` 만 바뀌어도 npm README 가 바뀌면 patch 로 낸다
- 등급이 애매하면(prop 제거인데 minor 로 갈지 등) 근거를 들어 사용자에게 묻는다

## 2. develop 에 `deploy: X.Y.Z` 커밋

바꾸는 파일은 `package.json` `version` 과 `CHANGELOG.md` 둘뿐이다. 커버리지 수치는 손대지 않는다 (3번 CI 가 갱신).

CHANGELOG 는 머리말 바로 아래, 기존 첫 버전 섹션 위에 넣는다. 날짜는 오늘.

```text
## [X.Y.Z](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/vX.Y.Z) - YYYY-MM-DD
- 소비자가 알아야 할 변경 한 줄씩 (커밋 나열 · 이슈 링크 · Co-Authored-By 금지)
- (렌더 변경) 화면이 바뀌는 항목
```

이 섹션이 그대로 GitHub Release 노트가 된다 (`release.yml` 이 잘라 쓴다) - 한국어로, 소비자 관점으로 쓴다.
저장소 문서 링크는 `https://github.com/Bigtablet/bigtablet-design-system/blob/main/docs/...` 절대 URL 로 쓴다 -
Release 본문에서는 `docs/X.md` 같은 상대 링크가 깨진다.
내부 전용 변경(CI · `.claude` · 테스트)은 소비자에게 영향이 없으면 빼거나 한 줄로 묶는다.

```bash
git checkout develop && git fetch -q && git merge -q --ff-only origin/develop
# package.json version · CHANGELOG.md 수정 후
git add package.json CHANGELOG.md
git commit -m "deploy: X.Y.Z" -m "Co-Authored-By: ..."
```

push 는 커밋과 **따로** 실행한다. 훅은 명령 문자열을 보므로, 미커밋 상태의 rebase 나 같은 명령 안의 `gh api -f` 가
있으면 막힌다.

```bash
git fetch -q && git rebase -q origin/develop
git push -q origin develop
```

## 3. 릴리즈 PR

```bash
gh pr create --base main --head develop --title "merge: release" --label Deploy --assignee @me --body-file <파일>
```

본문은 PR 규칙 네 섹션(`## 작업 개요` · `## 작업한 내용` · `## 검증` · `## 전달할 추가 이슈`).
`## 작업 개요` 에 버전과 이번에 담긴 이슈 번호를 나열한다 (기록용 - 이슈는 각 PR 머지 때 이미 닫혀 있다).
prop 제거를 minor 로 내는 경우 사내 저장소 사용처 grep 결과를 `## 검증` 에 적는다.

- PR 이 열리면 `coverage-docs.yml` 이 `docs: refresh coverage figures` 커밋을 develop 에 올린다 - 그대로 PR 에 실린다.
  (수치가 같으면 커밋하지 않는다). 그 워크플로가 끝난 뒤 `git fetch -q && git merge -q --ff-only origin/develop` 로
  로컬 develop 을 맞춘다 - fetch 없이는 `origin/develop` 이 예전 그대로다
- 리뷰에서 고칠 게 나오면 develop 에 커밋하면 PR 에 따라온다

## 4. 머지 - 사람 approve 뒤에만

릴리즈 PR 은 Claude 가 스스로 머지하지 않는다. 사용자가 머지하거나, approve 후 머지하라고 할 때만 한다.

```bash
gh pr merge <N> --merge --match-head-commit "$(gh pr view <N> --json headRefOid --jq .headRefOid)"
```

- squash · rebase 금지. GitHub UI 로 머지하면 버튼이 "Create a merge commit" 인지 본다 (rebase merging 은 설정상 켜져 있다)
- `--delete-branch` 를 붙이지 않는다 - head 가 develop 이다
- 머지 뒤 확인 - 출력이 비어야 한다 (rebase 로 머지됐으면 develop 커밋이 새 SHA 로 잡힌다):
  ```bash
  git fetch -q && git log --oneline --no-merges origin/develop..origin/main
  ```

## 5. 태그

main 을 체크아웃하지 않고 `origin/main` 머지 커밋에 바로 단다.

```bash
git fetch -q
git show -s --format='%h %s' origin/main   # merge: release 인지
git show origin/main:package.json | grep '"version"'   # X.Y.Z 인지
git tag -a vX.Y.Z -m "vX.Y.Z" origin/main
git push origin vX.Y.Z
```

## 6. 배포 확인 · 보고

```bash
gh run list --workflow release.yml --limit 1      # 끝날 때까지 - completed success
npm view @bigtablet/design-system version         # X.Y.Z
gh release view vX.Y.Z --json name,body --jq '.name, .body'
```

- 릴리즈 노트 머리가 `## Design System of Bigtablet, Inc.` + `#### 주요 업데이트` 이고 CHANGELOG 섹션과 같은지
- README 가 바뀐 릴리즈면 npm 페이지에서 이미지가 뜨는지 (README 이미지는 `main` 절대 URL)

**보고에는 검증 결과와 이번 릴리즈로 닫힌 이슈만 쓴다.** 남은 후속 항목 · 열린 이슈 · 다음 작업 제안은 넣지 않는다 -
그런 건 0번에서 꺼냈어야 한다.

hotfix 로 main 에 직접 넣은 변경이 있었다면 배포 직후 head `main` → base `develop` PR(`merge: main`)로 되돌려 넣는다.
