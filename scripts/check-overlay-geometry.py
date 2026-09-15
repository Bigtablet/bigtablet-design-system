#!/usr/bin/env python3
"""오버레이(Modal·Drawer·AlertModal)의 두 가지 불변식을 검사한다.

## 1. close 버튼 기하 (빌드 CSS)

close 버튼은 `position: absolute` 로 패널 모서리에 붙는데, 그 inset 은 패널 패딩과 **합의해야
하는 값**이다. 손으로 고정하면 패딩만 바뀌었을 때(Modal 은 `from_medium` 에서 24 -> 32) close 가
내용 열 밖으로 혼자 튀어나간다 - 실제로 그 상태로 배포됐다.

32px 박스에 18px 아이콘이라 내부 여백이 7px 이고, spacing 스케일에 17/25 가 없어 8 을 뺀다.
그래서 규칙은 `close inset = 패널 패딩 - 8` 이다. 제목의 겹침 방지 `padding-right` 도 같은
기하에서 나온다: `inset + 박스 - 패널 패딩`.

jsdom 은 스타일시트를 계산하지 않아 단위 테스트로는 잡을 수 없다. 그래서 빌드 산출물을 읽는다.

## 2. 스크롤 잠금 수명 (소스)

잠금 effect 는 **마운트 게이트와 같은 값**(`shouldRender`)에 묶여야 한다. `open` / `isOpen` 에
묶으면 닫기 시작 즉시 cleanup 이 돌아 `scrollbar-gutter` 와 `padding-right` 보정이 풀리는데,
오버레이는 퇴출 애니메이션이 끝날 때까지 계속 렌더된다 - 그 구간에 거터가 빈 띠로 보이고 배경이
튄다. AlertModal 만 처음부터 `shouldRender` 를 썼고 Modal·Drawer 가 `open` 을 써서 같은 증상이
두 번 재발했다.

## 3. 잠금이 오른쪽에 띠를 남기지 않는지 (두 번들 소스)

잠금은 스크롤바 자리(또는 앱이 예약해 둔 거터)를 **회수해야** 한다 - `scrollbar-gutter: auto` 로
풀고 그 폭만큼 `body` 에 `padding-right`. 남기면 그 자리는 캔버스가 칠하는 영역이라 딤이 덮지
못하고, 색으로 흉내내면 배경이 단색일 때만 맞아 표·카드 경계에 세로선이 남는다(#635).

회수로 ICB 가 넓어지는 만큼은 오버레이 CSS 가 `padding-right: var(--bt-scrollbar-width)` 로
상쇄한다(#574). 루트 배경색은 건드리지 않는다.

React 와 Vanilla 두 번들이 같은 판정을 해야 한다. 이 저장소에서 "형제 구현 한쪽만 고침" 이
다섯 번 났다.

exit 1 이면 위반이 있다.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

CSS = Path("dist/index.css")
VANILLA_CSS = Path("dist/vanilla/bigtablet.css")
ICON_INSET = 8  # (32 - 18) / 2 = 7 이지만 토큰 스케일에 맞춰 8 을 뺀다


def rules(css: str) -> list[tuple[str, str, dict[str, str]]]:
    """(media, selector, declarations) 목록. 한 단계 @media 만 다룬다 - 이 파일에 그 이상 없다."""
    out: list[tuple[str, str, dict[str, str]]] = []
    for media, block in _blocks(css):
        for selector, body in re.findall(r"([^{}]+)\{([^{}]*)\}", block):
            decls: dict[str, str] = {}
            for decl in body.split(";"):
                if ":" in decl:
                    prop, _, value = decl.partition(":")
                    decls[prop.strip()] = value.strip()
            out.append((media, selector.strip(), decls))
    return out


def _blocks(css: str) -> list[tuple[str, str]]:
    """@media 블록을 분리해 (media, 내용) 으로 돌려준다. media 가 없으면 빈 문자열."""
    out: list[tuple[str, str]] = []
    pos = 0
    while True:
        at = css.find("@media", pos)
        if at == -1:
            out.append(("", css[pos:]))
            return out
        out.append(("", css[pos:at]))
        head_end = css.index("{", at)
        depth, i = 1, head_end + 1
        while depth:
            if css[i] == "{":
                depth += 1
            elif css[i] == "}":
                depth -= 1
            i += 1
        out.append((css[at:head_end].strip(), css[head_end + 1 : i - 1]))
        pos = i


def px(value: str | None) -> int | None:
    if value is None:
        return None
    m = re.fullmatch(r"(-?\d+(?:\.\d+)?)px", value.strip())
    return int(float(m.group(1))) if m else None


def find(parsed, selector: str, prop: str, media_contains: str | None = None):
    """마지막에 선언된 값을 돌려준다 (CSS 캐스케이드와 같은 방향)."""
    hit = None
    for media, sel, decls in parsed:
        if sel != selector or prop not in decls:
            continue
        if media_contains is None and media != "":
            continue
        if media_contains is not None and media_contains not in media:
            continue
        hit = decls[prop]
    return hit


def shorthand_side(value: str | None, side: str) -> str | None:
    """`padding: 20px 24px` 같은 축약에서 한 변을 뽑는다."""
    if value is None:
        return None
    parts = value.split()
    if len(parts) == 1:
        return parts[0]
    if len(parts) == 2:
        return parts[0] if side in ("top", "bottom") else parts[1]
    if len(parts) == 3:
        return {"top": parts[0], "right": parts[1], "bottom": parts[2], "left": parts[1]}[side]
    if len(parts) == 4:
        return dict(zip(("top", "right", "bottom", "left"), parts))[side]
    return None


# ── 스크롤 잠금 수명 (소스) ───────────────────────────────────────────────────

# 잠금 소비처는 하드코딩하지 않고 소스에서 찾는다. 목록으로 두면 새 오버레이가 같은 패턴을
# 쓰기 시작했을 때 검사가 조용히 놓친다 - 이 검사가 막으려는 바로 그 재발이 검사 자체에 남는다.
UI = Path("src/ui")
LOCK_CALL = "lockBodyScroll()"
# 소비처가 이 수 아래로 떨어지면 탐색이 깨진 것으로 본다 (현재 Modal·Drawer·AlertModal).
MIN_LOCK_OWNERS = 3


def _balanced_block(source: str, open_index: int) -> tuple[str, int]:
    """`{` 위치에서 시작해 짝이 맞는 `}` 까지의 본문과 그 닫는 괄호의 인덱스를 돌려준다.

    정규식으로는 안 된다 - effect cleanup 이 `return () => { ... }` 블록이면 `[^}]*` 가
    첫 `}` 에서 끊긴다(그래서 소비처를 0개로 세고 검사가 조용히 사라졌다).
    """
    depth = 0
    for i in range(open_index, len(source)):
        if source[i] == "{":
            depth += 1
        elif source[i] == "}":
            depth -= 1
            if depth == 0:
                return source[open_index + 1 : i], i
    return "", -1


def lock_effect(source: str) -> tuple[str, str] | None:
    """`lockBodyScroll()` 을 부르는 `useEffect` 의 (본문, deps). 없으면 None."""
    for match in re.finditer(r"useEffect\(\(\)\s*=>\s*\{", source):
        body, end = _balanced_block(source, match.end() - 1)
        if end == -1 or LOCK_CALL not in body:
            continue
        deps = re.match(r"\s*,\s*\[([^\]]*)\]", source[end + 1 :])
        return body, (deps.group(1).strip() if deps else "(deps 를 못 찾았다)")
    return None


def lock_owners() -> list[Path]:
    return sorted(p for p in UI.rglob("index.tsx") if LOCK_CALL in p.read_text(encoding="utf-8"))


def check_lock_lifecycle() -> tuple[list[str], int]:
    problems: list[str] = []
    owners = lock_owners()
    if len(owners) < MIN_LOCK_OWNERS:
        problems.append(
            f"잠금 소비처를 {len(owners)}개만 찾았다 (최소 {MIN_LOCK_OWNERS}) -"
            f" `{LOCK_CALL}` 탐색이 소스와 어긋났는지 보라"
        )
    for path in owners:
        source = path.read_text(encoding="utf-8")
        found = lock_effect(source)
        if found is None:
            problems.append(f"{path}: lockBodyScroll 을 부르는 useEffect 를 못 찾았다")
            continue
        body, deps = found
        if deps != "shouldRender":
            problems.append(
                f"{path}: 잠금 effect 의 deps 가 [{deps}] 다 - [shouldRender] 여야 한다."
                " open/isOpen 에 묶으면 퇴출 애니메이션 동안 보정이 풀려 거터에 빈 띠가 보인다"
            )
        if "if (!shouldRender) return" not in body:
            problems.append(f"{path}: 잠금 effect 의 가드가 shouldRender 기준이 아니다")
        # cleanup 이 없으면 unmount·shouldRender=false 후에도 잠금이 남아 페이지가 잠긴다.
        if "unlockBodyScroll" not in body:
            problems.append(
                f"{path}: 잠금 effect 가 unlockBodyScroll cleanup 을 반환하지 않는다"
            )
        # 거터를 색으로 칠하던 배선이 돌아오지 않게 한다 - 잠금이 오버레이로 덮으므로 오버레이가
        # 자기 딤 진행도를 보고할 이유가 없다(#635).
        if "reportOverlayDim" in source or "unregisterOverlayDim" in source:
            problems.append(
                f"{path}: 딤 진행도를 잠금에 보고한다 - 거터를 색으로 칠하던 배선이다(#635)."
                " 지금은 오버레이가 그 자리를 직접 덮는다"
            )
    return problems, len(owners)


# 트리거에 붙는 팝업들. 조상의 `overflow: hidden` 은 `z-index` 로 넘을 수 없어서(#586 - 카드
# 안에서 170px 목록 중 46px 만 보였다) 포탈로 띄우고 fixed 좌표를 받아야 한다.
ANCHORED_POPUPS = (
    (Path("src/ui/forms/dropdown/index.tsx"), Path("src/ui/forms/dropdown/style.scss"), "dropdown_list"),
    (Path("src/ui/forms/combobox/index.tsx"), Path("src/ui/forms/combobox/style.scss"), "combobox_panel"),
    (Path("src/ui/navigation/menu/index.tsx"), Path("src/ui/navigation/menu/style.scss"), "menu"),
)


def check_popups_escape_clipping() -> list[str]:
    """트리거 옆 팝업이 포탈 + fixed 인지. `position: absolute` 로 돌아가면 조상이 자른다."""
    problems: list[str] = []
    for component, styles, block in ANCHORED_POPUPS:
        source = component.read_text(encoding="utf-8")
        if "createPortal(" not in source:
            problems.append(
                f"{component}: 팝업을 포탈로 띄우지 않는다 - 조상의 `overflow: hidden` 이"
                " 잘라내고 `z-index` 로는 넘지 못한다 (#586)"
            )
        css = styles.read_text(encoding="utf-8")
        # 팝업 블록만 본다 - 같은 파일의 다른 절대 배치(아이콘 등)는 대상이 아니다.
        marker = f"&_{block.split('_', 1)[1]} {{" if "_" in block else ".menu {"
        index = css.find(marker)
        if index == -1:
            problems.append(f"{styles}: `{marker}` 블록을 못 찾았다 - 클래스가 바뀌었는지 보라")
            continue
        body, _ = _balanced_block(css, css.index("{", index))
        if "position: absolute" in body:
            problems.append(
                f"{styles}: `{block}` 이 `position: absolute` 다 - 포탈에서는 좌표가 body"
                " 기준이 되고 조상 클리핑도 그대로 남는다. `fixed` + 인라인 좌표여야 한다"
            )
    return problems


# 트리거 폭을 물려받는 팝업들 - (컴포넌트, 스타일, 블록, 인라인에 쓰는 표현식).
# Menu 는 트리거 폭과 무관하게 내용 폭으로 열리므로 대상이 아니다.
ANCHOR_WIDTH_POPUPS = (
    (
        Path("src/ui/forms/dropdown/index.tsx"),
        Path("src/ui/forms/dropdown/style.scss"),
        "dropdown_list",
        "position.width",
    ),
    (
        Path("src/ui/forms/combobox/index.tsx"),
        Path("src/ui/forms/combobox/style.scss"),
        "combobox_panel",
        "popup.position.width",
    ),
)

ANCHOR_WIDTH_PINNED = re.compile(r"(?<![\w.])width:\s*(?:popup\.)?position\.width")


def check_popup_width_has_a_floor() -> list[str]:
    """트리거 폭이 팝업의 하한이어야 한다. `width` 로 못박으면 좁은 트리거에서 목록이
    자기 옵션 라벨을 ellipsis 로 접는다(#596 - 48px 트리거에서 `02` 가 `0.` 로 보였다)."""
    problems: list[str] = []
    for component, styles, block, expression in ANCHOR_WIDTH_POPUPS:
        source = component.read_text(encoding="utf-8")
        if ANCHOR_WIDTH_PINNED.search(source):
            problems.append(
                f"{component}: 팝업 폭을 `width: {expression}` 로 못박았다 - 트리거가 좁으면"
                " 목록이 자기 옵션 라벨을 잘라낸다(#596). `minWidth` 로 하한만 줘야 한다"
            )
        elif f"minWidth: {expression}" not in source:
            problems.append(
                f"{component}: 팝업에 `minWidth: {expression}` 이 없다 - 트리거보다 좁게"
                " 열리면 목록이 컨트롤의 연장으로 읽히지 않는다"
            )

        css = styles.read_text(encoding="utf-8")
        marker = f"&_{block.split('_', 1)[1]} {{"
        index = css.find(marker)
        if index == -1:
            problems.append(f"{styles}: `{marker}` 블록을 못 찾았다 - 클래스가 바뀌었는지 보라")
            continue
        body, _ = _balanced_block(css, css.index("{", index))
        if "width: max-content" not in body:
            problems.append(
                f"{styles}: `{block}` 에 `width: max-content` 가 없다 - 인라인 min/max-width"
                " 사이에서 내용 기준으로 넓어질 근거가 사라진다(#596)"
            )
    return problems


SCROLL_LOCK_SOURCES = (
    Path("src/utils/scroll-lock.ts"),
    Path("src/vanilla/bigtablet.js"),
)


DIM_SOURCES = (
    Path("src/ui/overlay/modal/style.scss"),
    Path("src/ui/overlay/drawer/style.scss"),
    Path("src/ui/feedback/alert/style.scss"),
    Path("src/vanilla/bigtablet.scss"),
)
NEGATIVE_OFFSET = "-1 * var(--bt-scrollbar-width"

# 가운데 정렬 오버레이 - 회수된 폭을 상쇄해야 패널이 제자리에 남는다. Drawer 는 가장자리에
# 붙으므로 빠진다.
CENTERED_OVERLAY_STYLES = (
    Path("src/ui/overlay/modal/style.scss"),
    Path("src/ui/feedback/alert/style.scss"),
    Path("src/vanilla/bigtablet.scss"),
)


def check_dim_does_not_chase_the_gutter() -> list[str]:
    """dim 이 음수 오프셋으로 예약된 거터를 쫓지 않는지.

    예약된 거터는 캔버스(루트 배경)가 칠하는 영역이라 `html` 의 자손은 거기에 페인트할 수
    없다. 음수 오프셋은 박스만 넓히고 페인트는 거터 앞에서 잘린다 - 실측으로
    `getBoundingClientRect().right` 는 1280 인데 `elementFromPoint(1266, 250)` 이 `null`
    이었다(#580). 그 띠는 잠금이 루트 배경색에 딤을 합성해 어둡게 한다.
    """
    problems: list[str] = []
    for path in DIM_SOURCES:
        if NEGATIVE_OFFSET in path.read_text(encoding="utf-8"):
            problems.append(
                f"{path}: dim 이 음수 오프셋으로 거터를 쫓는다 - 박스만 넓어지고 페인트는"
                " 거터 앞에서 잘린다(#580). 잠금의 캔버스 합성에 맡겨라"
            )
    return problems


def check_lock_width_invariants() -> list[str]:
    """잠금이 거터를 회수하는지, 회수 실패를 되돌리는지, 루트 배경을 건드리지 않는지."""
    problems: list[str] = []
    for path in SCROLL_LOCK_SOURCES:
        source = path.read_text(encoding="utf-8")
        # 주석에는 옛 방식을 설명해 두므로 코드 줄만 본다.
        code = "\n".join(
            line for line in source.splitlines() if not line.strip().startswith(("//", "*", "/*"))
        )
        lock_body = ""
        for name in ("lockBodyScroll", "lockScroll"):
            found = re.search(rf"function {name}\s*\([^)]*\)\s*(?::\s*\w+\s*)?\{{", source)
            if found:
                lock_body, _ = _balanced_block(source, found.end() - 1)
                break
        if not lock_body:
            problems.append(f"{path}: 잠금 함수를 못 찾았다 - 이름이 바뀌었는지 보라")
            continue

        if 'scrollbarGutter = "auto"' not in lock_body:
            problems.append(
                f"{path}: 잠금이 거터를 회수하지 않는다 - 남기면 그 띠를 딤이 덮지 못한다(#635)."
                ' `scrollbarGutter = "auto"` 로 풀어라'
            )
        if "paddingRight" not in lock_body:
            problems.append(
                f"{path}: 회수한 폭을 `body` padding 으로 지키지 않는다 - 콘텐츠가 그만큼 움직인다"
            )
        # 회수됐는지 다시 재야 한다. 앱이 `html { overflow-y: scroll }` 로 스크롤바를 못박아
        # 두면 자리가 그대로 남는데, 그때 padding 까지 주면 콘텐츠만 안쪽으로 밀린다.
        if lock_body.count("measureViewportInset(") < 2:
            problems.append(
                f"{path}: 잠금 뒤에 다시 재지 않는다 - 스크롤바가 못박힌 앱에서 회수되지 않은 채"
                " padding 만 남아 콘텐츠가 밀린다"
            )
        # 루트 배경색을 칠하던 옛 방식이 돌아오지 않게 한다. 배경이 단색일 때만 맞는다(#635).
        if "backgroundColor" in code:
            problems.append(
                f"{path}: 루트 배경색을 건드린다 - 띠를 색으로 흉내내는 방식은 배경이 단색일 때만"
                " 맞아 표·카드 경계에 세로선이 남는다(#635). 오버레이가 덮게 하라"
            )
        if "data-bt-scroll-locked" not in code:
            problems.append(
                f"{path}: 잠금 표식(`data-bt-scroll-locked`)을 남기지 않는다 - 소비자가 잠금"
                " 상태를 CSS 로 알 수단이 사라진다"
            )
    return problems


def check_overlays_offset_the_reclaimed_width() -> list[str]:
    """가운데 정렬 오버레이가 회수된 폭을 상쇄하는지.

    회수로 ICB 가 스크롤바 폭만큼 넓어지므로, 상쇄하지 않으면 패널이 그 절반만큼 움직인다(#574).
    Drawer 는 화면 가장자리에 붙어 상쇄할 것이 없으므로 제외한다.
    """
    problems: list[str] = []
    offset = "padding-right: var(--bt-scrollbar-width"
    for path in CENTERED_OVERLAY_STYLES:
        if offset not in path.read_text(encoding="utf-8"):
            problems.append(
                f"{path}: 회수된 폭을 상쇄하지 않는다 - 패널이 스크롤바 폭의 절반만큼 움직인다"
                f" (#574). `{offset})` 를 줘라"
            )
    return problems


# 전면 오버레이(딤) 컴포넌트 - 오버레이 요소에 transform 이 붙으면 안 된다.
FULLSCREEN_OVERLAY_SOURCES = (
    Path("src/ui/overlay/modal/index.tsx"),
    Path("src/ui/overlay/drawer/index.tsx"),
    Path("src/ui/feedback/alert/index.tsx"),
)


def check_overlay_has_no_transform() -> list[str]:
    """전면 오버레이의 스프링이 transform 을 쓰지 않는지.

    항등값(`translateY(0px)`)이라도 transform 이 붙으면 그 요소가 `position: fixed` 자손의
    containing block 이 되고, 뷰포트 전체 크기의 합성 레이어가 하나 생긴다. 이 규칙은
    `springEnterFrom` JSDoc 에 적혀 있었는데도 Drawer 가 `useSpringPresence` 를 쓰면서
    다시 깨졌다 - 그래서 검사로 고정한다. 패널(`panelStyle`)은 실제로 움직이므로 대상이 아니다.
    """
    problems: list[str] = []
    for path in FULLSCREEN_OVERLAY_SOURCES:
        source = path.read_text(encoding="utf-8")
        match = re.search(r"const overlayStyle = (\w+)\(\{", source)
        if match is None:
            problems.append(f"{path}: `const overlayStyle = ...({{` 를 찾지 못했다 - 검사가 조용히 비었다")
            continue
        if match.group(1) == "useSpringPresence":
            problems.append(
                f"{path}: 오버레이에 useSpringPresence 를 쓰면 `to.transform` 이 항상 붙는다"
                " - opacity 만 보간하는 useSpring 을 써라"
            )
            continue
        body, end = _balanced_block(source, match.end() - 1)
        if end == -1:
            problems.append(f"{path}: overlayStyle 블록의 짝이 맞는 `}}` 를 못 찾았다")
            continue
        if "transform" in body:
            problems.append(
                f"{path}: 오버레이 스프링에 transform 이 있다 - 항등값이어도 `position: fixed`"
                " 자손의 containing block 이 되고 전체 화면 합성 레이어가 생긴다"
            )
    return problems


def main() -> int:
    if not CSS.exists():
        print(f"{CSS} 가 없다 - `pnpm build` 를 먼저 실행하라", file=sys.stderr)
        return 1

    parsed = rules(CSS.read_text(encoding="utf-8"))
    problems: list[str] = []
    checked = 0

    # (라벨, 패딩을 읽을 선택자, close 선택자, 겹침 방지 선택자, media)
    cases = [
        ("Modal (compact)", ".modal_panel", "padding", ".modal_close", ".modal_title", None),
        ("Modal (medium)", ".modal_panel", "padding", ".modal_close", None, "min-width"),
        ("Drawer", ".drawer_body", "padding", ".drawer_close", ".drawer_header", None),
    ]

    for label, panel_sel, panel_prop, close_sel, clear_sel, media in cases:
        padding = px(shorthand_side(find(parsed, panel_sel, panel_prop, media), "right"))
        if padding is None:
            problems.append(f"{label}: {panel_sel} 의 {panel_prop} 을 읽지 못했다")
            continue

        for side in ("top", "right"):
            inset = px(find(parsed, close_sel, side, media))
            if inset is None:
                problems.append(f"{label}: {close_sel} 의 {side} 을 읽지 못했다")
                continue
            checked += 1
            if inset != padding - ICON_INSET:
                problems.append(
                    f"{label}: {close_sel} {side}={inset}px 인데 패딩 {padding}px"
                    f" 기준이면 {padding - ICON_INSET}px 이어야 한다"
                )

        if clear_sel is None:
            continue
        # 박스 크기는 CSS 에서 읽는다 - 상수로 박아두면 $tap_target_dense 가 바뀔 때 검사가
        # 조용히 틀린 기준을 쓴다.
        box = px(find(parsed, close_sel, "width")) or px(find(parsed, close_sel, "width", media))
        if box is None:
            problems.append(f"{label}: {close_sel} 의 width 를 읽지 못했다")
            continue
        inset = px(find(parsed, close_sel, "right", media))
        clearance = px(shorthand_side(find(parsed, clear_sel, "padding-right", media), "right"))
        if inset is None or clearance is None:
            problems.append(f"{label}: {clear_sel} 의 padding-right 를 읽지 못했다")
            continue
        checked += 1
        # 헤더가 자체 패딩을 갖는 Drawer 는 패널 패딩만큼 이미 안쪽이라 그만큼 뺄 필요가 없다.
        expected = inset + box - (padding if clear_sel == ".modal_title" else 0)
        if clearance != expected:
            problems.append(
                f"{label}: {clear_sel} padding-right={clearance}px 인데 close 기하"
                f"(inset {inset} + 박스 {box}) 기준이면 {expected}px 이어야 한다"
            )

    lock_problems, owner_count = check_lock_lifecycle()
    problems += lock_problems
    checked += owner_count

    problems += check_lock_width_invariants()
    problems += check_dim_does_not_chase_the_gutter()
    problems += check_overlays_offset_the_reclaimed_width()
    problems += check_overlay_has_no_transform()
    problems += check_popups_escape_clipping()
    problems += check_popup_width_has_a_floor()
    checked += len(SCROLL_LOCK_SOURCES) + len(DIM_SOURCES) + len(ANCHORED_POPUPS)
    checked += len(ANCHOR_WIDTH_POPUPS)

    # 오버플로 가드 - 암묵 grid 트랙(auto)이면 패널의 max-width 백분율이 뷰포트가 아니라
    # 패널 자신의 max-content 로 풀려 clamp 가 전혀 걸리지 않는다(기본 width=480 이 375 화면에서
    # 잘리고 close 가 화면 밖으로 나갔다).
    for label, css_path, selector in (
        ("React", CSS, ".modal"),
        ("Vanilla", VANILLA_CSS, ".bt-modal.is-open"),
    ):
        checked += 1
        if not css_path.exists():
            problems.append(f"{label}: {css_path} 가 없다 - `pnpm build` 를 먼저 실행하라")
            continue
        track = find(rules(css_path.read_text(encoding="utf-8")), selector, "grid-template-columns")
        if track is None or "minmax(0" not in track:
            problems.append(
                f"{label}: {selector} 의 grid-template-columns 가 {track!r} - minmax(0, ...) 로"
                " 트랙을 컨테이너에 묶어야 패널 max-width 의 100% 가 뷰포트 폭이 된다"
            )

    if checked < 9:
        print(
            f"검사 대상이 사라졌다 (확인 {checked}건) - 선택자나 빌드 구조가 바뀌었는지 보라",
            file=sys.stderr,
        )
        return 1

    if problems:
        print("오버레이 기하 검사 실패:\n", file=sys.stderr)
        for p in problems:
            print(f"  {p}", file=sys.stderr)
        return 1

    close_checks = (
        checked
        - owner_count
        - len(SCROLL_LOCK_SOURCES)
        - len(DIM_SOURCES)
        - len(ANCHORED_POPUPS)
        - len(ANCHOR_WIDTH_POPUPS)
    )
    print(f"오버레이 close 기하 {close_checks}건 - 전부 패널 패딩에서 파생됩니다.")
    print(f"스크롤 잠금 수명 {owner_count}건 - shouldRender 에 묶이고 cleanup 을 반환합니다.")
    print(
        f"잠금 폭 불변식 {len(SCROLL_LOCK_SOURCES)}개 번들 - 거터를 회수하고"
        " 회수 실패를 되돌리고 표식을 남깁니다."
    )
    print(f"dim {len(DIM_SOURCES)}개 파일 - 음수 오프셋으로 거터를 쫓지 않습니다.")
    print(
        f"가운데 정렬 오버레이 {len(CENTERED_OVERLAY_STYLES)}개 - 회수된 스크롤바 폭을 상쇄합니다."
    )
    print(
        f"전면 오버레이 {len(FULLSCREEN_OVERLAY_SOURCES)}개 - 딤에 transform 을 주지 않습니다."
    )
    print(f"트리거 팝업 {len(ANCHORED_POPUPS)}개 - 포탈 + fixed 로 조상 클리핑을 벗어납니다.")
    print(
        f"팝업 폭 {len(ANCHOR_WIDTH_POPUPS)}개 - 트리거 폭은 하한이고 내용 기준으로 넓어집니다."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
