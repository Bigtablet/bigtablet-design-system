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

## 3. 잠금이 ICB 폭을 바꾸지 않는지 (두 번들 소스)

잠금은 거터를 **예약**해야 한다(`scrollbar-gutter: stable`). 놓으면(`auto`) ICB 폭이 변해
`position: fixed; left: 50%` 요소가 스크롤바 폭의 절반만큼 움직인다 - 실측 592.5 → 600 (#574).
그리고 문서가 스크롤되지 않을 때는 아무것도 하지 않아야 한다 - 예약된 거터를 스크롤바로 오인해
없는 스크롤바를 없애느라 레이아웃이 흔들렸다.

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


# `lockBodyScroll()` 을 부르는 effect 의 본문과 deps 배열
LOCK_EFFECT = re.compile(
    r"useEffect\(\(\)\s*=>\s*\{(?P<body>[^}]*?lockBodyScroll\(\)[^}]*?)\}\s*,\s*\[(?P<deps>[^\]]*)\]\)",
    re.DOTALL,
)


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
        matches = LOCK_EFFECT.findall(source)
        if len(matches) != 1:
            problems.append(
                f"{path}: lockBodyScroll effect 를 {len(matches)}개 찾았다 - 1개여야 한다"
            )
            continue
        body, deps = matches[0]
        deps = deps.strip()
        if deps != "shouldRender":
            problems.append(
                f"{path}: 잠금 effect 의 deps 가 [{deps}] 다 - [shouldRender] 여야 한다."
                " open/isOpen 에 묶으면 퇴출 애니메이션 동안 보정이 풀려 거터에 빈 띠가 보인다"
            )
        if "if (!shouldRender) return" not in body:
            problems.append(f"{path}: 잠금 effect 의 가드가 shouldRender 기준이 아니다")
        # cleanup 이 없으면 unmount·shouldRender=false 후에도 잠금이 남아 페이지가 잠긴다.
        if not re.search(r"\breturn\s+unlockBodyScroll\s*;", body):
            problems.append(
                f"{path}: 잠금 effect 가 unlockBodyScroll cleanup 을 반환하지 않는다"
            )
    return problems, len(owners)


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
    """잠금이 거터를 놓지 않고 예약하는지, 스크롤 여부로 분기하는지."""
    problems: list[str] = []
    for path in SCROLL_LOCK_SOURCES:
        source = path.read_text(encoding="utf-8")
        # 주석에는 옛 방식을 설명해 두므로 코드 줄만 본다.
        code = "\n".join(
            line for line in source.splitlines() if not line.strip().startswith(("//", "*", "/*"))
        )
        if 'scrollbarGutter = "auto"' in code:
            problems.append(
                f"{path}: 잠금이 거터를 놓는다(`auto`) - ICB 폭이 변해 fixed 요소가"
                " 스크롤바 폭의 절반만큼 움직인다 (#574). `stable` 로 예약하라"
            )
        if 'scrollbarGutter = "stable"' not in code:
            problems.append(f"{path}: 잠금이 거터를 예약하지 않는다 - `stable` 이 없다")
        # 딤 색은 오버레이가 실제로 페인트에 쓰는 프로퍼티에서 읽어야 한다. 번들마다 이름이
        # 다르고, 선언만 있고 아무도 참조하지 않는 유사 이름이 양쪽에 있다 - 그걸 읽으면
        # 소비자가 딤을 오버라이드했을 때 거터 색만 옛 값에 남는다.
        dim_var = "--bt-color-overlay" if path.name.endswith(".js") else "--bt-color-bg-overlay"
        if dim_var not in code:
            problems.append(
                f"{path}: 딤 색을 `{dim_var}` 에서 읽지 않는다 - 오버레이가 페인트에 쓰는"
                " 프로퍼티와 달라지면 거터 색이 실제 딤을 따라가지 못한다"
            )
        if "compositeCanvasDim" not in code:
            problems.append(
                f"{path}: 예약된 거터를 어둡게 하지 않는다 - 캔버스(루트 배경색)에 딤을"
                " 합성해야 dim 옆에 밝은 띠가 남지 않는다 (#580)"
            )
        if "data-bt-scroll-locked" not in code:
            problems.append(
                f"{path}: 잠금 표식(`data-bt-scroll-locked`)을 남기지 않는다 - 소비자가 잠금"
                " 상태를 CSS 로 알 수단이 사라진다"
            )
        if "scrollHeight > " not in code:
            problems.append(
                f"{path}: 문서가 스크롤되는지 보지 않는다 - 예약된 거터만 있는 앱에서"
                " 없는 스크롤바를 없애느라 레이아웃이 흔들린다"
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
    checked += len(SCROLL_LOCK_SOURCES) + len(DIM_SOURCES)

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

    close_checks = checked - owner_count - len(SCROLL_LOCK_SOURCES) - len(DIM_SOURCES)
    print(f"오버레이 close 기하 {close_checks}건 - 전부 패널 패딩에서 파생됩니다.")
    print(f"스크롤 잠금 수명 {owner_count}건 - shouldRender 에 묶이고 cleanup 을 반환합니다.")
    print(f"잠금 폭 불변식 {len(SCROLL_LOCK_SOURCES)}개 번들 - 거터를 예약하고 칠하고 표식을 남깁니다.")
    print(f"dim {len(DIM_SOURCES)}개 파일 - 예약된 거터를 쫓지 않습니다(캔버스 합성에 맡김).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
