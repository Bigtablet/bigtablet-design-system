#!/usr/bin/env python3
"""스토리가 `@deprecated` prop 을 **쓰고 있지** 않은지 검사한다.

문서는 코드보다 늦는다. 이번 문서 작업에서 손으로 찾은 것만 넷이다:

    Dropdown.fullWidth      타입 선언에만 남은 no-op 인데 `args: { fullWidth: true }` 로 시연
    Toggle.onChange         canonical 은 `onCheckedChange` 인데 메타·설명·렌더 셋이 이쪽
    Textarea.onChangeAction canonical 은 `onValueChange` 인데 렌더 3곳이 이쪽
    Menu 포탈 문단          (문서 문장 - 이 검사 범위 밖)

스토리는 소비자가 복사해 가는 자리라, deprecated prop 을 쓰면 그걸 가르치는 셈이다.

**무엇을 위반으로 보는가**

  위반   JSX 속성 (`<Toggle onChange={...} />`) 과 객체 값 (`args: { fullWidth: true }`)
  허용   `argTypes` 블록의 키 - deprecated 임을 props 표에 적어 두는 것이 오히려 옳다
  허용   문자열·주석 안의 언급 - 설명이 "이 prop 은 deprecated 다" 라고 말하는 경우

그래서 검사 전에 **문자열·주석을 지우고 `argTypes` 블록을 통째로 떼어낸다.** 정규식으로
이 셋을 구분하려다 이번 세션에 네 번 잘못 셌다(escape 된 백틱, Storybook 의 `component:`
필드, `[].join()` 형태, 고정 창 크기). 지우고 보는 쪽이 짧고 틀리지 않는다.

**범위**: 컴포넌트와 같은 디렉터리의 스토리만 본다(`src/ui/x/y/y.stories.tsx` ↔ `y/index.tsx`).
`src/stories/` 의 cookbook 은 여러 컴포넌트를 섞어 쓰고 네이티브 요소도 있어서, prop 이름만으로는
`<input onChange>` 와 `<Toggle onChange>` 를 가를 수 없다 - 잘못 잡기보다 안 보는 쪽을 골랐다.

**예외**: 마이그레이션 시연처럼 일부러 써야 하면 그 줄이나 바로 윗줄에 이유를 적는다.

    // deprecated-ok: 구 prop 이 아직 동작함을 보여주는 스토리
"""

import re
import sys
from pathlib import Path

UI = Path("src/ui")
OPT_OUT = re.compile(r"deprecated-ok:\s*\S")

# `@deprecated` JSDoc 바로 뒤의 prop 선언. 인터페이스 멤버라 들여쓰기가 있다.
PROP_DECL = re.compile(r"^\s+(\w+)\??\s*:")


def strip_strings_and_comments(source: str) -> str:
    """문자열·템플릿·주석을 같은 길이의 공백으로 바꾼다(줄 번호 보존)."""
    out = []
    i = 0
    n = len(source)
    while i < n:
        c = source[i]
        if c == "/" and i + 1 < n and source[i + 1] == "/":
            j = source.find("\n", i)
            j = n if j == -1 else j
            out.append(" " * (j - i))
            i = j
            continue
        if c == "/" and i + 1 < n and source[i + 1] == "*":
            j = source.find("*/", i + 2)
            j = n if j == -1 else j + 2
            out.append("".join(ch if ch == "\n" else " " for ch in source[i:j]))
            i = j
            continue
        if c in "\"'`":
            quote = c
            j = i + 1
            while j < n:
                if source[j] == "\\":
                    j += 2
                    continue
                if source[j] == quote:
                    j += 1
                    break
                j += 1
            out.append("".join(ch if ch == "\n" else " " for ch in source[i:j]))
            i = j
            continue
        out.append(c)
        i += 1
    return "".join(out)


def strip_block(source: str, key: str) -> str:
    """`key: { ... }` 블록을 중괄호 짝을 맞춰 공백으로 지운다. 없으면 그대로."""
    result = source
    while True:
        match = re.search(rf"(?<![\w.]){re.escape(key)}\s*:\s*\{{", result)
        if not match:
            return result
        depth = 0
        i = result.index("{", match.start())
        start = match.start()
        while i < len(result):
            if result[i] == "{":
                depth += 1
            elif result[i] == "}":
                depth -= 1
                if depth == 0:
                    i += 1
                    break
            i += 1
        segment = result[start:i]
        result = result[:start] + "".join(c if c == "\n" else " " for c in segment) + result[i:]


def deprecated_props(component: Path) -> dict[str, str]:
    """{prop 이름: 권장 대안 문장} - `@deprecated` JSDoc 뒤에 오는 prop 선언만."""
    lines = component.read_text(encoding="utf-8").splitlines()
    found: dict[str, str] = {}
    for index, line in enumerate(lines):
        if "@deprecated" not in line:
            continue
        note = line.split("@deprecated", 1)[1].strip(" */")
        # 뒤따르는 주석 줄을 건너뛰고 첫 코드 줄을 본다.
        for follow in lines[index + 1 : index + 6]:
            stripped = follow.strip()
            if not stripped or stripped.startswith(("*", "//", "/*")):
                continue
            decl = PROP_DECL.match(follow)
            if decl:
                found[decl.group(1)] = note
            break
    return found


def violations() -> tuple[list[str], int, int]:
    problems: list[str] = []
    checked_props = 0
    checked_files = 0
    for story in sorted(UI.rglob("*.stories.tsx")):
        component = story.parent / "index.tsx"
        if not component.exists():
            continue
        props = deprecated_props(component)
        checked_files += 1
        if not props:
            continue
        checked_props += len(props)

        raw = story.read_text(encoding="utf-8")
        raw_lines = raw.splitlines()
        # argTypes 는 deprecated 를 **적어 두는** 자리다 - 떼어낸 뒤 본다.
        body = strip_block(strip_strings_and_comments(raw), "argTypes")

        for prop, note in sorted(props.items()):
            # JSX 속성(`prop=`) 과 객체 값(`prop:`) 둘 다 실제 사용이다.
            for match in re.finditer(rf"(?<![\w.$]){re.escape(prop)}\s*[=:]", body):
                line_no = body[: match.start()].count("\n") + 1
                line = raw_lines[line_no - 1]
                above = raw_lines[line_no - 2] if line_no >= 2 else ""
                if OPT_OUT.search(line) or OPT_OUT.search(above):
                    continue
                problems.append(
                    f"{story}:{line_no}: `{prop}` 은 deprecated 다 - {note}\n"
                    f"    {line.strip()}\n"
                    "    스토리는 복사해 가는 자리라 이걸 쓰면 그대로 퍼진다."
                    " 일부러라면 `deprecated-ok: <이유>` 를 그 줄이나 윗줄에 적어라"
                )
    return problems, checked_props, checked_files


def main() -> int:
    problems, checked_props, checked_files = violations()
    if checked_files == 0:
        print("검사 대상 스토리가 없다 - 디렉터리 구조가 바뀌었는지 보라", file=sys.stderr)
        return 1
    if problems:
        print("스토리가 deprecated prop 을 쓰고 있다:\n", file=sys.stderr)
        for problem in problems:
            print(f"  {problem}", file=sys.stderr)
        return 1
    exempt = sum(
        1
        for story in UI.rglob("*.stories.tsx")
        for line in story.read_text(encoding="utf-8").splitlines()
        if OPT_OUT.search(line)
    )
    print(
        f"스토리 {checked_files}개 - deprecated prop {checked_props}개를 아무도 쓰지 않습니다."
        + (f" (이유를 적은 예외 {exempt}건)" if exempt else "")
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
