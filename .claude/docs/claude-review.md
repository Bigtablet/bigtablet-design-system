# Claude PR Review - 운영 메모 / 스모크 테스트

`.github/workflows/claude-review.yml` 은 PR 을 자동 리뷰하는 Claude 워크플로다.
GitHub App 없이 레포 secret 으로 Claude(OAuth 토큰)를 호출해 요약 + 라인별 인라인 코멘트를 남기고,
심각도에 따라 approve / request-changes 정식 리뷰를 제출한다.

CodeRabbit(`.coderabbit.yaml`) / Gemini Code Assist 는 그대로 병행한다 (중복 리뷰 허용).
중복이 부담되면 나중에 하나로 정리한다.

## 사전 준비 (1회, 사람 작업)

1. 로컬에서 OAuth 토큰 발급:
   ```
   claude setup-token
   ```
   -> `sk-ant-oat...` 토큰 출력.
2. 레포 secret 등록:
   ```
   gh secret set CLAUDE_CODE_REVIEW_API_KEY -R Bigtablet/bigtablet-design-system
   ```
   (프롬프트에 위 토큰 붙여넣기. GitHub UI Settings -> Secrets -> Actions 로도 가능.)
   - secret 이름에 `API_KEY` 가 들어가지만 값은 위 **OAuth 토큰**(`sk-ant-oat...`)이다.
     워크플로는 이를 `anthropic_api_key`(x-api-key) 가 아니라 `claude_code_oauth_token`(Bearer) 으로 넘긴다.

- 이 토큰은 **발급자 개인 Claude 구독 사용량**을 소모한다.
- `GITHUB_TOKEN` 은 Actions 기본 제공 - 별도 등록 불필요.

## 트리거

| 상황 | 동작 |
| --- | --- |
| PR 열림 / 재오픈 / draft->ready | 자동 리뷰 1회 |
| PR 코멘트에 `@claude review` / `@claude re-review` | 재리뷰 |
| 인라인 리뷰 스레드에 `@claude` 멘션 | 그 스레드에만 답글 (전체 리뷰 X) |
| 푸시(synchronize) | **자동 리뷰 안 함**(비용) - 재리뷰는 코멘트로 |

- draft PR / 포크 PR 은 자동 경로에서 제외.
- 코멘트 트리거는 author_association(OWNER/MEMBER/COLLABORATOR) 로 제한 - 외부 트리거 차단.
- `issue_comment`(멘션 재리뷰)는 GitHub 제약상 **워크플로가 기본 브랜치(main)에 올라간 뒤**부터 동작한다.
  PR-open 자동 리뷰는 워크플로가 그 PR 브랜치에 있으면 바로 동작.

## 판정 (approve / request-changes)

리뷰는 요약을 본문으로 실어 **정식 리뷰 상태**를 제출한다.

- 🔴 High / 🟡 Medium 이슈가 하나라도 있으면 -> `request-changes`
- 이슈 없음 / 🟢 Low 만 -> `approve` (레포가 Actions 승인을 막으면 폴백으로 요약 코멘트만)
- 변경 요청 후 수정하고 `@claude review` 로 재리뷰하면, 이슈가 없어진 경우 `approve` 로 재제출.

> 머지 게이트로 쓰려면 브랜치 보호에서 "리뷰 승인 필요"를 켠다. 단 github-actions 봇 리뷰가
> required-approval 카운트에 잡히는지는 설정에 따라 다르니, 첫 PR 로 실제 게이트 동작을
> 확인한 뒤 의존할 것.

## 리뷰 기준

프롬프트가 우리 컨벤션을 직접 참조한다: 루트 `CLAUDE.md`, `.claude/docs/*`.
우선 지적 대상 - Global SCSS / className 패턴, 디자인 토큰 강제(하드코딩/raw hex 금지),
motion 토큰 + `prefers-reduced-motion`, WCAG AA / ARIA / 키보드 / focus, additive(비파괴) 공개 API.
사소한 포매팅은 Biome 가 강제하므로 지적하지 않는다.

## 보안 설계

- **리뷰 모드**: 도구는 읽기(Read/Grep/Glob/git) + `gh pr review/comment/diff/view` + 인라인 코멘트 MCP 만.
  `gh api` / Write / Edit 없음 -> 임의 REST 호출 / 파일 수정 원천 차단.
- **대화형 답글 모드**: 신뢰 불가한 코멘트 본문을 다루므로 에이전트에 게시 도구를 아예 주지 않는다.
  답변 텍스트만 `--json-schema` 구조화 출력으로 만들고, 실제 게시는 워크플로의 고정 단계가
  하드코딩된 엔드포인트로만 POST 한다 (프롬프트 인젝션이 게시 대상/명령을 바꿀 수 없음).

## 스모크 테스트 순서

1. secret 등록 후 이 워크플로가 든 PR 을 연다 -> `pull_request: opened` 로 **자동 리뷰가 이 PR 에
   붙는지** 확인 (요약 코멘트 `## 코드 리뷰 (Claude)` + 인라인).
2. develop->main 까지 머지된 뒤, 아무 PR 에 `@claude review` 코멘트 -> 👀 리액션 후 재리뷰 확인.
3. 인라인 리뷰 스레드에 `@claude 이거 왜 이래?` 답글 -> 그 스레드에 답글만 붙는지 확인.
