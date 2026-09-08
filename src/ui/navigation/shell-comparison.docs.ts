/**
 * 내비게이션 셸 셋을 고르는 기준 - Storybook meta 설명 전용 문자열.
 *
 * `NavBar`·`Sidebar`·`BottomNav` 는 "화면의 이동 수단" 이라 역할이 겹쳐 보인다. 특히
 * `Sidebar` 는 `mode="auto"`(기본)에서 600px 밑이면 스스로 하단 bar 가 되므로
 * (`sidebar/style.scss` 의 compact 미디어 쿼리) `BottomNav` 와 언제 갈리는지가 헷갈린다.
 * 그 답을 셋 어디로 들어와도 볼 수 있게 한다.
 *
 * 런타임 코드가 아니다 - `src/index.ts` 에서 export 되지 않아 번들에 들어가지 않는다.
 * (같은 패턴: `../forms/selection-comparison.docs.ts`)
 */
export const SHELL_COMPARISON = [
	"#### 내비게이션 셸 셋 중 무엇을 쓰나",
	"",
	"| 화면 | 컴포넌트 |",
	"| --- | --- |",
	"| 공개 페이지·마케팅의 **상단 가로** 내비 | `NavBar` |",
	"| admin·dashboard 의 **좌측** 내비 (좁은 화면에서 하단 bar 로 자동 변신) | `Sidebar` |",
	"| 좌측 내비가 아예 없는 **모바일 전용** 화면 | `BottomNav` |",
	"",
	'**`Sidebar` 와 `BottomNav` 를 같이 두지 마세요.** `Sidebar` 의 기본값 `mode="auto"` 가',
	"600px 밑에서 스스로 하단 bar 가 되므로, 둘을 함께 두면 모바일에서 하단 크롬이 두 개가 됩니다.",
	'데스크탑 좌측 내비가 필요하면 `Sidebar` 하나로 양쪽을 덮고, `mode="static"` 은 변신을',
	"끄고 싶은 desktop 전용 admin 에만 씁니다.",
	"",
	'셋 모두 `active` 를 준 항목에 `aria-current="page"` 를 붙입니다 - 색만으로 현재 위치를',
	"알리지 않습니다. 하단 고정 크롬(`Sidebar` 변신형·`BottomNav`)은 본문 끝을 가리므로",
	"스페이서나 `--bt-*-total-height` 로 여백을 확보해야 합니다.",
	"",
	"셸 배치까지 한 번에 필요하면 `AppShell` 이 `Sidebar` + 헤더 + 본문 열을 갖습니다.",
].join("\n");
