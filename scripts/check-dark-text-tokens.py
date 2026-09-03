#!/usr/bin/env python3
"""다크에서 재정의되지 않는 **표면 색 토큰**을 텍스트로 쓰지 않는지 검사한다.

`--bt-color-status-*`(bare) 나 `--bt-color-brand-primary` 는 양 테마에서 같은 값이다. 배경과
테두리에는 맞지만 **테마에 따라 바뀌는 표면 위의 텍스트**로 쓰면 다크에서 대비가 무너진다.
실측(Chromium, `data-theme="dark"`):

    토큰      다크 페이지(#0A0A0A)   다크 패널(#141414)   `_on_surface`(페이지)
    error            3.06                 2.85                 7.16
    success          3.61                 3.36                11.36
    warning          3.94                 3.67                11.86
    info             2.95                 2.75                 7.79

같은 목적의 dark-aware 토큰이 이미 있다 - `_on_surface` 쪽이 다크에서 400 계열로 바뀐다.
`danger` Button(React·Vanilla)과 Vanilla 의 TextField helper·Alert 제목·필수 표시가 이 결함이었다.

**고정 표면 위의 텍스트는 예외다.** DS 는 그런 텍스트 토큰을 이름으로 구분한다 - `_on_primary`
(brand 표면), `_on_dark`(스크림·glass), `_on_default`·`_on_container`(status 표면). 그 표면 자체가
테마와 무관하므로 대비도 일정하다.

a11y 스토리 러너는 라이트 테마만 돌아 axe 가 이 결함을 잡지 못한다 - 그래서 정적으로 본다.
"""

import re
import sys
from pathlib import Path

THEME = Path("src/styles/theme.scss")
REACT_SCSS = sorted(Path("src/ui").rglob("*.scss"))
VANILLA_SCSS = Path("src/vanilla/bigtablet.scss")

# 고정 표면과 짝지어진 텍스트 토큰 - 이름이 그 표면을 밝힌다.
PAIRED_SUFFIXES = ("-on-primary", "-on-dark", "-on-default", "-on-container", "-on-surface")
# `_on_dark_body` 처럼 뒤에 역할이 더 붙는 경우도 있다.
PAIRED_MARKERS = ("-on-dark",)


def theme_token_sets() -> tuple[set[str], set[str]]:
    """(라이트에서 선언된 CSS 변수, 다크 mixin 에서 재정의되는 변수)."""
    text = THEME.read_text(encoding="utf-8")

    def vars_in(start: int) -> set[str]:
        i = text.index("{", start)
        depth, j = 0, i
        while j < len(text):
            if text[j] == "{":
                depth += 1
            elif text[j] == "}":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        return set(re.findall(r"(--bt-[a-z0-9-]+)\s*:", text[i:j]))

    light: set[str] = set()
    for match in re.finditer(r"(?m)^:root \{", text):
        light |= vars_in(match.start())

    dark_match = re.search(r"@mixin dark-theme", text)
    return light, (vars_in(dark_match.start()) if dark_match else set())


def css_var_of(token: str) -> str:
    """SCSS 토큰(`$color_status_error`) → CSS 변수(`--bt-color-status-error`)."""
    return "--bt-" + token.lstrip("$").replace("_", "-")


def is_paired(name: str) -> bool:
    """이름이 고정 표면과의 짝을 밝히는가."""
    return name.endswith(PAIRED_SUFFIXES) or any(m in name for m in PAIRED_MARKERS)


def main() -> int:
    light, dark = theme_token_sets()
    if not light or not dark:
        print("theme.scss 에서 토큰 블록을 못 찾았다 - 구조가 바뀌었는지 보라", file=sys.stderr)
        return 1

    # 양 테마 공통값인 색 토큰 중, 이름으로 고정 표면과 짝지어지지 않은 것 = 표면 색.
    surface_only = {v for v in light - dark if "color" in v and not is_paired(v)}

    problems: list[str] = []
    checked = 0

    for path in REACT_SCSS:
        for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            match = re.match(r"\s*color:\s*token\.(\$[a-z0-9_]+)\s*;", line)
            if not match:
                continue
            checked += 1
            if css_var_of(match.group(1)) in surface_only:
                problems.append(
                    f"{path}:{line_no}: `{match.group(1)}` 은 표면 색이고 다크에서 재정의되지"
                    " 않는다 - 텍스트로 쓰면 다크에서 AA 미달이다. `_on_surface` 쪽을 써라"
                )

    vanilla = VANILLA_SCSS.read_text(encoding="utf-8")
    for line_no, line in enumerate(vanilla.splitlines(), 1):
        match = re.match(r"\s*color:\s*var\((--bt-[a-z0-9-]+)\)\s*;", line)
        if not match:
            continue
        checked += 1
        # Vanilla 는 자기 이름의 별칭을 둔다 - 그 별칭이 가리키는 토큰까지 따라간다.
        alias = re.search(rf"{re.escape(match.group(1))}:\s*#\{{token\.(\$[a-z0-9_]+)\}}", vanilla)
        target = css_var_of(alias.group(1)) if alias else match.group(1)
        if target in surface_only and not is_paired(match.group(1)):
            problems.append(
                f"{VANILLA_SCSS}:{line_no}: `{match.group(1)}` 이 가리키는 `{target}` 은 표면"
                " 색이고 다크에서 재정의되지 않는다 - 텍스트로 쓰면 다크에서 AA 미달이다"
            )

    if checked == 0:
        problems.append("검사 대상이 사라졌다 (텍스트 색 선언 0건) - 패턴이 바뀌었는지 보라")

    if problems:
        print("다크 텍스트 토큰 검사 실패:\n", file=sys.stderr)
        for problem in problems:
            print(f"  {problem}", file=sys.stderr)
        return 1

    print(f"텍스트 색 선언 {checked}건 - 표면 전용 색 토큰을 텍스트로 쓰지 않습니다.")
    print(f"(양 테마 고정 표면 색 {len(surface_only)}개는 배경·테두리 전용)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
