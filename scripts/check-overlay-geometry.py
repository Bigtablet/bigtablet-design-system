#!/usr/bin/env python3
"""오버레이(Modal·Drawer)의 close 버튼 기하가 패널 패딩에서 파생되는지 빌드 CSS 로 검사한다.

close 버튼은 `position: absolute` 로 패널 모서리에 붙는데, 그 inset 은 패널 패딩과 **합의해야
하는 값**이다. 손으로 고정하면 패딩만 바뀌었을 때(Modal 은 `from_medium` 에서 24 -> 32) close 가
내용 열 밖으로 혼자 튀어나간다 - 실제로 그 상태로 배포됐다.

32px 박스에 18px 아이콘이라 내부 여백이 7px 이고, spacing 스케일에 17/25 가 없어 8 을 뺀다.
그래서 규칙은 `close inset = 패널 패딩 - 8` 이다. 제목의 겹침 방지 `padding-right` 도 같은
기하에서 나온다: `inset + 박스 - 패널 패딩`.

jsdom 은 스타일시트를 계산하지 않아 단위 테스트로는 잡을 수 없다. 그래서 빌드 산출물을 읽는다.

exit 1 이면 위반이 있다.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

CSS = Path("dist/index.css")
ICON_INSET = 8  # (32 - 18) / 2 = 7 이지만 토큰 스케일에 맞춰 8 을 뺀다
CLOSE_BOX = 32


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
        inset = px(find(parsed, close_sel, "right", media))
        clearance = px(shorthand_side(find(parsed, clear_sel, "padding-right", media), "right"))
        if inset is None or clearance is None:
            problems.append(f"{label}: {clear_sel} 의 padding-right 를 읽지 못했다")
            continue
        checked += 1
        # 헤더가 자체 패딩을 갖는 Drawer 는 패널 패딩만큼 이미 안쪽이라 그만큼 뺄 필요가 없다.
        expected = inset + CLOSE_BOX - (padding if clear_sel == ".modal_title" else 0)
        if clearance != expected:
            problems.append(
                f"{label}: {clear_sel} padding-right={clearance}px 인데 close 기하"
                f"(inset {inset} + 박스 {CLOSE_BOX}) 기준이면 {expected}px 이어야 한다"
            )

    # 오버플로 가드 - 암묵 grid 트랙(auto)이면 패널의 max-width 백분율이 뷰포트가 아니라
    # 패널 자신의 max-content 로 풀려 clamp 가 전혀 걸리지 않는다(기본 width=480 이 375 화면에서
    # 잘리고 close 가 화면 밖으로 나갔다).
    track = find(parsed, ".modal", "grid-template-columns")
    checked += 1
    if track is None or "minmax(0" not in track:
        problems.append(
            f".modal 의 grid-template-columns 가 {track!r} - minmax(0, ...) 로 트랙을"
            " 컨테이너에 묶어야 패널 max-width 의 100% 가 뷰포트 폭이 된다"
        )

    if checked < 8:
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

    print(f"오버레이 close 기하 {checked}건 - 전부 패널 패딩에서 파생됩니다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
