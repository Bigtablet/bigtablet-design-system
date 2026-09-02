/**
 * DS 가 스스로 렌더하는 모든 사용자 노출 문구. 컴포넌트 안에 흩어져 있던 기본값을 한곳에 모은다.
 *
 * 왜 한곳이어야 하나 - 소비자가 영어 화면을 만들려면 지금은 컴포넌트 **인스턴스마다** prop 을
 * 넘겨야 한다. `Modal` 을 40번 쓰는 앱이면 `closeLabel` 을 40번 적는다. 하나라도 빠지면 그
 * 화면만 한국어로 남는다.
 *
 * `{name}` 은 자리표시자다. 값은 `t(key, { name: … })` 로 채운다.
 */
export interface LocaleMessages {
	// ── display ─────────────────────────────────────────────────────────────
	"chip.remove": string; // {label}
	"dataView.clearSelection": string;
	"dataView.empty": string;
	"dataView.errorTitle": string;
	"dataView.retry": string;
	"dataView.search": string;
	"dataView.selectionSummary": string; // {count}
	"table.empty": string;
	"table.rowClickHint": string;
	"table.selectAll": string;
	"table.selectRow": string; // {index}

	// ── feedback ────────────────────────────────────────────────────────────
	"alert.cancel": string;
	"alert.confirm": string;
	"errorState.title": string;
	"spinner.label": string;
	"toast.close": string;
	"toast.region": string;
	"topLoading.label": string;

	// ── forms ───────────────────────────────────────────────────────────────
	"combobox.empty": string;
	"combobox.idle": string;
	"combobox.loading": string;
	"combobox.placeholder": string;
	"datePicker.day": string;
	"datePicker.minDateSr": string; // {date}
	"datePicker.month": string;
	"datePicker.rangeUntilTodaySr": string;
	"datePicker.year": string;
	"dateRange.end": string;
	"dateRange.start": string;
	"dropdown.empty": string;
	"dropdown.placeholder": string;
	"dropdown.searchPlaceholder": string;
	"dropdown.selectedSummary": string; // {count}
	"fileInput.label": string;
	"fileInput.removeImage": string;
	"imageCropper.hint": string;
	"imageCropper.label": string;
	"imageCropper.noPanHint": string;
	"imageCropper.zoom": string;
	"imageCropper.zoomIn": string;
	"imageCropper.zoomOut": string;
	"otpInput.digit": string; // {index}
	"otpInput.label": string;
	"tagInput.added": string; // {names}
	"tagInput.addedWithNotes": string; // {names} {notes}
	"tagInput.atCap": string; // {max}
	"tagInput.duplicate": string; // {names}
	"tagInput.placeholder": string;
	"tagInput.removed": string; // {name}
	"textField.clear": string;
	"textField.passwordHide": string;
	"textField.passwordShow": string;
	"timePicker.hour": string;
	"timePicker.minute": string;
	"timePicker.rangeSr": string;

	// ── navigation ──────────────────────────────────────────────────────────
	"bottomNav.label": string;
	"breadcrumb.label": string;
	"pagination.label": string;
	"pagination.next": string;
	"pagination.prev": string;
	"sidebar.toggle": string;

	// ── overlay ─────────────────────────────────────────────────────────────
	"drawer.close": string;
	"modal.close": string;
}

export type LocaleKey = keyof LocaleMessages;

/** 기본 카탈로그. 이 값이 각 컴포넌트의 기본 문구다 */
export const ko: LocaleMessages = {
	"chip.remove": "{label} 제거",
	"dataView.clearSelection": "선택 해제",
	"dataView.empty": "데이터가 없습니다",
	"dataView.errorTitle": "불러오지 못했습니다",
	"dataView.retry": "다시 시도",
	"dataView.search": "검색",
	"dataView.selectionSummary": "{count}개 선택됨",
	"table.empty": "데이터가 없습니다",
	"table.rowClickHint": "클릭 가능한 행",
	"table.selectAll": "전체 선택",
	"table.selectRow": "{index}번째 행 선택",

	"alert.cancel": "취소",
	"alert.confirm": "확인",
	"errorState.title": "문제가 발생했습니다",
	"spinner.label": "로딩 중",
	"toast.close": "닫기",
	"toast.region": "알림",
	"topLoading.label": "페이지 로딩 중",

	"combobox.empty": "일치하는 항목이 없습니다",
	"combobox.idle": "검색어를 입력하세요",
	"combobox.loading": "검색 중",
	"combobox.placeholder": "검색해서 선택",
	"datePicker.day": "일",
	"datePicker.minDateSr": "최소 날짜: {date}",
	"datePicker.month": "월",
	"datePicker.rangeUntilTodaySr": "오늘까지 선택 가능",
	"datePicker.year": "년",
	"dateRange.end": "종료일",
	"dateRange.start": "시작일",
	"dropdown.empty": "결과 없음",
	"dropdown.placeholder": "선택…",
	"dropdown.searchPlaceholder": "검색…",
	"dropdown.selectedSummary": "{count}개 선택",
	"fileInput.label": "파일 선택",
	"fileInput.removeImage": "이미지 제거",
	"imageCropper.hint": "드래그(또는 방향키)로 위치, 휠·슬라이더로 배율을 맞추세요.",
	"imageCropper.label": "이미지 위치와 배율 조정",
	"imageCropper.noPanHint": "이미지가 뷰포트를 딱 채워 이동 여유가 없습니다.",
	"imageCropper.zoom": "배율",
	"imageCropper.zoomIn": "확대",
	"imageCropper.zoomOut": "축소",
	"otpInput.digit": "{index}번째 자리",
	"otpInput.label": "OTP 입력",
	"tagInput.added": "{names} 추가됨",
	"tagInput.addedWithNotes": "{names} 추가됨 ({notes})",
	"tagInput.atCap": "최대 {max}개까지 추가할 수 있습니다",
	"tagInput.duplicate": "{names} 이미 있음",
	"tagInput.placeholder": "입력 후 Enter",
	"tagInput.removed": "{name} 제거됨",
	"textField.clear": "지우기",
	"textField.passwordHide": "비밀번호 숨기기",
	"textField.passwordShow": "비밀번호 표시",
	"timePicker.hour": "시",
	"timePicker.minute": "분",
	"timePicker.rangeSr": "{min} 부터 {max} 까지 선택 가능",

	"bottomNav.label": "주요 메뉴",
	"breadcrumb.label": "현재 위치",
	"pagination.label": "페이지 이동",
	"pagination.next": "다음 페이지",
	"pagination.prev": "이전 페이지",
	"sidebar.toggle": "사이드바 토글",

	"drawer.close": "닫기",
	"modal.close": "닫기",
};

/** 영어 카탈로그. `<LocaleProvider locale="en">` 로 고른다 */
export const en: LocaleMessages = {
	"chip.remove": "Remove {label}",
	"dataView.clearSelection": "Clear selection",
	"dataView.empty": "No data",
	"dataView.errorTitle": "Could not load",
	"dataView.retry": "Try again",
	"dataView.search": "Search",
	"dataView.selectionSummary": "{count} selected",
	"table.empty": "No data",
	"table.rowClickHint": "Clickable row",
	"table.selectAll": "Select all",
	"table.selectRow": "Select row {index}",

	"alert.cancel": "Cancel",
	"alert.confirm": "OK",
	"errorState.title": "Something went wrong",
	"spinner.label": "Loading",
	"toast.close": "Close",
	"toast.region": "Notifications",
	"topLoading.label": "Loading page",

	"combobox.empty": "No matches",
	"combobox.idle": "Type to search",
	"combobox.loading": "Searching",
	"combobox.placeholder": "Search to select",
	"datePicker.day": "Day",
	"datePicker.minDateSr": "Earliest date: {date}",
	"datePicker.month": "Month",
	"datePicker.rangeUntilTodaySr": "Selectable up to today",
	"datePicker.year": "Year",
	"dateRange.end": "End date",
	"dateRange.start": "Start date",
	"dropdown.empty": "No results",
	"dropdown.placeholder": "Select…",
	"dropdown.searchPlaceholder": "Search…",
	"dropdown.selectedSummary": "{count} selected",
	"fileInput.label": "Choose file",
	"fileInput.removeImage": "Remove image",
	"imageCropper.hint": "Drag (or use arrow keys) to move, wheel or slider to zoom.",
	"imageCropper.label": "Adjust image position and zoom",
	"imageCropper.noPanHint": "The image fills the viewport exactly, so there is no room to move it.",
	"imageCropper.zoom": "Zoom",
	"imageCropper.zoomIn": "Zoom in",
	"imageCropper.zoomOut": "Zoom out",
	"otpInput.digit": "Digit {index}",
	"otpInput.label": "One-time code",
	"tagInput.added": "{names} added",
	"tagInput.addedWithNotes": "{names} added ({notes})",
	"tagInput.atCap": "You can add up to {max}",
	"tagInput.duplicate": "{names} already added",
	"tagInput.placeholder": "Type and press Enter",
	"tagInput.removed": "{name} removed",
	"textField.clear": "Clear",
	"textField.passwordHide": "Hide password",
	"textField.passwordShow": "Show password",
	"timePicker.hour": "Hour",
	"timePicker.minute": "Minute",
	"timePicker.rangeSr": "Selectable from {min} to {max}",

	"bottomNav.label": "Main menu",
	"breadcrumb.label": "Breadcrumb",
	"pagination.label": "Pagination",
	"pagination.next": "Next page",
	"pagination.prev": "Previous page",
	"sidebar.toggle": "Toggle sidebar",

	"drawer.close": "Close",
	"modal.close": "Close",
};

export const catalogs = { ko, en } as const;

export type LocaleName = keyof typeof catalogs;
