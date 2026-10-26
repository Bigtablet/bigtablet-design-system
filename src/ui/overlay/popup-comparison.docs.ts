/**
 * 떠오르는 패널 3종(Menu · Popover · Tooltip)을 고르는 기준 - Storybook meta 설명 전용 문자열.
 *
 * 세 스토리가 같은 표를 싣는다. 같은 패턴: `src/ui/feedback/loading-comparison.docs.ts`.
 * 런타임 코드가 아니다 - `src/index.ts` 에서 export 되지 않아 번들에 들어가지 않는다.
 */
export const POPUP_COMPARISON = [
	"#### 떠오르는 패널 3종 중 무엇을 쓰나",
	"",
	"| 상황 | 컴포넌트 |",
	"| --- | --- |",
	"| 누르면 **실행되는 액션 목록** (수정 · 복제 · 삭제, 케밥 메뉴) | `Menu` |",
	"| 클릭으로 여는 **조작 가능한 내용** (작은 폼 · 필터 · 미리보기 + 버튼) | `Popover` |",
	"| hover · focus 로 뜨는 **짧은 설명 텍스트** - 포커스를 옮기지 않는다 | `Tooltip` |",
	"",
	"값을 **고르는** 목록이면 셋이 아니라 `Dropdown` 입니다 (`Menu` 는 값을 들고 있지 않습니다).",
	"화면을 막고 답을 받아야 하면 `Modal` · `useAlert` 입니다.",
].join("\n");
