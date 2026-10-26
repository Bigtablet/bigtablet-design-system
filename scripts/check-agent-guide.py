#!/usr/bin/env python3
"""`docs/AGENT_GUIDE.md` 의 Component Catalog 에 적힌 prop 이 소스에 있는지 검사한다.

AI 코딩 에이전트가 이 표를 보고 코드를 만든다. 표에 소스에 없는 prop 이 있으면 타입 에러가 나는
코드가 생긴다. 실제로 5개 컴포넌트가 틀어져 있었다 (#878):

    MediaCard  `description` · `media`   → 실제는 `image` 객체
    Divider    `orientation`              → 없음 (`weight` 만)
    Accordion  items 의 `id` · `trigger`   → `key` · `title`
    Pagination `pageCount` · `siblingCount` → `totalPages`
    Container  `padding`                  → 없음

COMPONENTS.md 의 props 표는 `check:defaults` 가 보지만 AGENT_GUIDE 는 아무도 보지 않았다.

**읽는 법**: 카탈로그 표의 행 `` | `Component` | 설명 | props | `` 에서 props 칸의 백틱 식별자를
꺼내, `src/ui/*/{component}/index.tsx` 에 `name:` · `name?:` 선언이나 이름 자체가 있는지 본다.
items 의 `key` 처럼 같은 파일의 보조 타입에 선언된 필드도 그래서 잡힌다.

- 괄호 안은 값 설명이라 보지 않는다 - `submitMode` (`submit` default …) 의 `submit`
- 대문자로 시작하면 컴포넌트 참조라 보지 않는다
- 네이티브 속성(`disabled`, `children` …)은 HTML 속성 상속이라 소스에 선언이 없어도 된다
- 소스 폴더가 없는 행(`useConfirm` 같은 훅)은 건너뛴다

**한계**: 워크플로 `paths-ignore` 가 `docs/**` 를 빼므로 문서만 고친 PR 에서는 CI 가 돌지 않는다.
이 검사가 잡는 것은 "소스의 prop 을 바꾸고 가이드를 안 고친" 방향이다 - 이번에 틀어진 것도 그 방향이었다.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

GUIDE = Path("docs/AGENT_GUIDE.md")
UI = Path("src/ui")

# 카탈로그 이름 → 소스 폴더 이름이 다른 경우
ALIASES = {"fileinput": "file"}

# HTML 속성 상속이나 React 공통 prop - 컴포넌트 파일에 선언이 없어도 된다
NATIVE = {
    "children", "className", "style", "id", "disabled", "onClick", "href", "type", "name",
    "value", "placeholder", "required", "ref", "title", "open", "checked", "defaultValue",
    "defaultChecked", "multiple", "accept", "as",
}  # fmt: skip

ROW = re.compile(r"^\| `([A-Za-z]+)`[^|]*\|[^|]*\|(.*)\|\s*$")
TICK = re.compile(r"`([a-z][a-zA-Z0-9]*)`")


def sources() -> dict[str, str]:
    out: dict[str, str] = {}
    for index in UI.glob("*/*/index.tsx"):
        out[index.parent.name.replace("-", "").lower()] = index.read_text(encoding="utf-8")
    return out


def main() -> int:
    src = sources()
    if not src:
        print("src/ui 에서 컴포넌트를 찾지 못했다 - 구조가 바뀌었는지 보라", file=sys.stderr)
        return 1

    lines = GUIDE.read_text(encoding="utf-8").splitlines()
    try:
        start = next(i for i, line in enumerate(lines) if line.startswith("## Component Catalog"))
    except StopIteration:
        print(f"{GUIDE} 에 '## Component Catalog' 섹션이 없다 - 이 검사를 고칠 것", file=sys.stderr)
        return 1
    end = next((i for i in range(start + 1, len(lines)) if lines[i].startswith("## ")), len(lines))

    problems: list[str] = []
    checked = 0
    for number in range(start, end):
        match = ROW.match(lines[number])
        if not match:
            continue
        name = match.group(1)
        key = name.lower()
        code = src.get(ALIASES.get(key, key))
        if code is None:
            continue
        cell = re.sub(r"\([^)]*\)", "", match.group(2))
        for prop in TICK.findall(cell):
            if prop in NATIVE:
                continue
            checked += 1
            if not re.search(rf"\b{re.escape(prop)}\b", code):
                problems.append(f"{GUIDE}:{number + 1}  {name}.{prop} - 소스에 없다")

    if checked == 0:
        print("검사한 prop 이 0개다 - 카탈로그 표 형식이 바뀌었는지 보라", file=sys.stderr)
        return 1
    if problems:
        print("AGENT_GUIDE 카탈로그에 소스에 없는 prop 이 있다:\n", file=sys.stderr)
        for problem in problems:
            print(f"  {problem}", file=sys.stderr)
        print(
            "\n  소스(src/ui/**/index.tsx)의 props 이름으로 고친다. 값 설명은 괄호 안에 두면 검사하지 않는다.",
            file=sys.stderr,
        )
        return 1

    print(f"AGENT_GUIDE 카탈로그 prop {checked}개 - 전부 소스에 있습니다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
