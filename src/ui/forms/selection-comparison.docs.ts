/**
 * 선택 컨트롤을 고르는 기준 - Storybook meta 설명 전용 문자열.
 *
 * `Checkbox`·`Radio`/`RadioGroup`·`Toggle`·`Dropdown` 은 모두 "고르게 하는" 컨트롤이라
 * 처음 보면 어느 것을 써야 하는지가 가장 먼저 막히는 지점이다. 네 스토리가 같은 표를 실어
 * 어느 컴포넌트로 들어와도 비교가 되게 한다.
 *
 * 런타임 코드가 아니다 - `src/index.ts` 에서 export 되지 않아 번들에 들어가지 않는다.
 * 그래서 파일명에 `.docs.ts` 를 붙였다. (같은 패턴: `src/ui/feedback/loading-comparison.docs.ts`)
 *
 * 백틱을 쓰지 않는 일반 문자열 배열이다 - meta 의 template literal 안에서 필요한
 * `` \` `` escape 규칙이 여기서는 없어 표를 그대로 읽을 수 있다.
 */
export const SELECTION_COMPARISON = [
	"#### 선택 컨트롤 넷 중 무엇을 쓰나",
	"",
	"| 상황 | 컴포넌트 |",
	"| --- | --- |",
	"| 여러 개를 **각각** 켜고 끌 때 (약관 동의, 필터) | `Checkbox` |",
	"| 몇 개 중 **하나만** 고를 때 (배송 방법, 성별) | `RadioGroup` + `Radio` |",
	"| 켜는 **즉시 반영**되는 설정 하나 (알림 on/off) | `Toggle` |",
	"| 후보가 많아 나열하면 화면을 먹을 때 | `Dropdown` |",
	"",
	"`Toggle` 과 `Checkbox` 의 갈림길은 **저장 버튼**입니다 - 누르는 즉시 적용되면 `Toggle`,",
	"폼을 제출해야 반영되면 `Checkbox` 입니다.",
	"",
	"`Radio` 를 단독으로 쓰면 `name` 을 손으로 맞춰야 합니다. 묶음이 있으면 `RadioGroup` 이",
	"`name`·`value`·`size`·`disabled` 를 대신 흘려 줍니다.",
	"",
	"라벨·필수 표시·에러 문구가 필요하면 각 입력의 prop 대신 `Field` 로 감싸세요 -",
	"`Form` 이 `errors` 맵을 각 `Field` 로 흘립니다 (Cookbook/Form Patterns 참고).",
].join("\n");
