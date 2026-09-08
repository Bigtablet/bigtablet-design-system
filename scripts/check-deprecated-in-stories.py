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
# prop 이 아닌 선언 - 여기 붙은 `@deprecated` 는 별칭·함수·상수의 폐기다.
TYPE_DECL = re.compile(r"^\s*(?:export\s+)?(?:type|interface|function|const|let|class|enum)\b")


def strip_strings_and_comments(source: str) -> str:
    """문자열·템플릿·주석을 같은 길이의 공백으로 바꾼다(줄 번호 보존).

    템플릿 리터럴의 `${...}` 안은 **코드**다 - 거기서 다시 백틱이 열릴 수 있다
    (`` `outer ${`inner`} rest` ``). 같은 종류의 따옴표를 만나면 무조건 닫혔다고 보면
    안쪽 백틱에서 잘못 닫혀 그 뒤 코드와 문자열이 뒤바뀐다. 그래서 백틱 안에서는
    `${` 를 만날 때마다 중괄호 깊이를 세며 코드 모드로 돌아간다.
    """
    out: list[str] = []
    # 스택의 각 항목: ("code", 0) 또는 ("str", quote) 또는 ("tpl", brace_depth)
    stack: list[tuple[str, object]] = [("code", 0)]
    i = 0
    n = len(source)

    def blank(text: str) -> str:
        return "".join(ch if ch == "\n" else " " for ch in text)

    while i < n:
        mode, extra = stack[-1]
        c = source[i]

        if mode == "code":
            if c == "/" and i + 1 < n and source[i + 1] == "/":
                j = source.find("\n", i)
                j = n if j == -1 else j
                out.append(blank(source[i:j]))
                i = j
                continue
            if c == "/" and i + 1 < n and source[i + 1] == "*":
                j = source.find("*/", i + 2)
                j = n if j == -1 else j + 2
                out.append(blank(source[i:j]))
                i = j
                continue
            if c in "\"'":
                stack.append(("str", c))
                out.append(" ")
                i += 1
                continue
            if c == "`":
                stack.append(("tpl", 0))
                out.append(" ")
                i += 1
                continue
            # `${` 로 들어온 코드 구간의 끝
            if c == "}" and len(stack) > 1:
                stack.pop()
                out.append(" ")
                i += 1
                continue
            out.append(c)
            i += 1
            continue

        if mode == "str":
            if c == "\\":
                out.append(blank(source[i : i + 2]))
                i += 2
                continue
            out.append(" " if c != "\n" else "\n")
            if c == extra:
                stack.pop()
            i += 1
            continue

        # mode == "tpl"
        if c == "\\":
            out.append(blank(source[i : i + 2]))
            i += 2
            continue
        if c == "$" and i + 1 < n and source[i + 1] == "{":
            stack.append(("code", 0))
            out.append("  ")
            i += 2
            continue
        out.append(" " if c != "\n" else "\n")
        if c == "`":
            stack.pop()
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


def deprecated_props(component: Path) -> tuple[dict[str, str], list[str]]:
    """({prop: 권장 대안}, 해결하지 못한 `@deprecated` 위치) 를 돌려준다.

    두 가지 선언 형태를 본다.

        /** @deprecated `onCheckedChange` 를 쓰세요. */
        onChange?: (checked: boolean) => void;          ← 다음 줄

        | { onValueChange: (v: string) => void; /** @deprecated */ onChange?: (v: string) => void }
                                                          ← 같은 줄, `*/` 뒤

    **해결하지 못하면 조용히 넘기지 않는다.** 초판이 그렇게 만들어져서, union 타입으로
    선언된 `DatePicker`·`Pagination` 의 deprecated `onChange` 를 통째로 놓쳤고
    스토리 5곳의 실사용을 통과시켰다(#603 리뷰). 못 읽은 자리는 실패로 알린다.
    """
    lines = component.read_text(encoding="utf-8").splitlines()
    found: dict[str, str] = {}
    unresolved: list[str] = []
    for index, line in enumerate(lines):
        if "@deprecated" not in line:
            continue
        note = line.split("@deprecated", 1)[1].strip(" */")

        # (a) 같은 줄의 `*/` 뒤에 prop 선언이 있는가 - union 멤버의 인라인 JSDoc
        tail = line.split("@deprecated", 1)[1]
        if "*/" in tail:
            inline = re.search(r"\*/\s*(\w+)\??\s*:", tail)
            if inline:
                found[inline.group(1)] = note.split("*/")[0].strip() or "대안 prop 을 쓰세요."
                continue

        # (b) 뒤따르는 주석 줄을 건너뛰고 첫 코드 줄
        for follow in lines[index + 1 : index + 6]:
            stripped = follow.strip()
            if not stripped or stripped.startswith(("*", "//", "/*")):
                continue
            decl = PROP_DECL.match(follow)
            if decl:
                found[decl.group(1)] = note
            elif TYPE_DECL.match(follow):
                # 타입 선언이다. 두 경우로 갈린다.
                #   `export type ButtonAsButton = ButtonProps<"button">;`
                #       → prop 이 아니라 **별칭** 의 폐기다. tsc 가 직접 알려주니 넘긴다.
                #   `type DatePickerCallbacks = | { …; onChange?: … }`
                #       → 본문이 멤버를 선언한다. 어느 멤버가 폐기됐는지 산문으로는 알 수 없다.
                #         멤버에 인라인 JSDoc 이 없으면 검사가 통째로 비므로 실패로 알린다.
                body = "\n".join(lines[index + 1 : index + 12])
                declares_members = bool(re.search(r"\{[^}]*\w+\??\s*:", body))
                if declares_members and "@deprecated" not in body:
                    unresolved.append(f"{component}:{index + 1}")
            else:
                unresolved.append(f"{component}:{index + 1}")
            break
        else:
            unresolved.append(f"{component}:{index + 1}")
    return found, unresolved


def violations() -> tuple[list[str], int, int]:
    problems: list[str] = []
    checked_props = 0
    checked_files = 0
    for story in sorted(UI.rglob("*.stories.tsx")):
        component = story.parent / "index.tsx"
        if not component.exists():
            continue
        props, unresolved = deprecated_props(component)
        for where in unresolved:
            problems.append(
                f"{where}: `@deprecated` 를 prop 선언에 연결하지 못했다 - 이 컴포넌트의"
                " deprecated prop 이 검사에서 통째로 빠진다. 주석 안에서만 폐기를 말하지 말고"
                " 선언에 JSDoc `@deprecated` 를 붙여라 (union 멤버면 그 멤버에 인라인으로)"
            )
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
