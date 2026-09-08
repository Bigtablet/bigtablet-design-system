/**
 * 날짜·시간 컨트롤을 고르는 기준 - Storybook meta 설명 전용 문자열.
 *
 * `DatePicker`·`DateRangePicker`·`TimePicker` 는 서로를 감싸거나 나란히 쓰는 관계라
 * 어느 것으로 들어와도 셋을 한 번에 비교할 수 있어야 한다.
 *
 * 런타임 코드가 아니다 - `src/index.ts` 에서 export 되지 않아 번들에 들어가지 않는다.
 * (같은 패턴: `selection-comparison.docs.ts`, `../feedback/loading-comparison.docs.ts`)
 */
export const DATETIME_COMPARISON = [
	"#### 날짜·시간 컨트롤 셋 중 무엇을 쓰나",
	"",
	"| 받아야 하는 값 | 컴포넌트 | 돌려주는 형식 |",
	"| --- | --- | --- |",
	'| 날짜 하나 | `DatePicker` | `YYYY-MM-DD` (`mode="year-month"` 면 `YYYY-MM`) |',
	"| 시작일·종료일 한 쌍 | `DateRangePicker` | 두 값을 각각 |",
	"| 시·분 | `TimePicker` | 24시간 `HH:mm` |",
	"",
	"**날짜와 시간을 함께 받아야 하면 두 개를 나란히 둡니다** - DS 에 `DateTimePicker` 는 없습니다.",
	"두 값을 하나로 합치는 규칙(ISO 문자열이든 타임존이든)은 화면이 정할 일이라 DS 가 정하지 않습니다.",
	"",
	"셋 모두 값을 화면이 들고 있는 **controlled 전용**입니다. 라벨·필수 표시·에러 문구가",
	"필요하면 `Field` 로 감싸세요 (Cookbook/Form Patterns 참고).",
].join("\n");
