#!/usr/bin/env python3
"""컴포넌트 폴더의 테스트·스토리 파일 이름이 폴더명과 같은 kebab-case 인지 검사한다.

한동안 두 규칙이 섞여 있었다 - 테스트는 PascalCase 62개(`Button.test.tsx`)와
kebab-case 14개로 갈렸고, 스토리는 폴더명 규칙을 지키고 있었다. 한 폴더 안에서 셋이
같은 이름을 공유하면 목록에서 짝이 바로 보이고 폴더를 옮길 때 파일명을 따로 고칠 일이 없다:

    src/ui/display/data-view/
    ├── index.tsx
    ├── data-view.test.tsx
    └── data-view.stories.tsx

**허용하는 두 형태**

  {폴더명}.test.tsx / {폴더명}.stories.tsx   컴포넌트 자신의 테스트·스토리
  {소스파일명}.test.ts                        옆에 같은 이름의 소스가 있는 경우
                                             (`crop.util.ts` ↔ `crop.util.test.ts`)

**대상**: `src/ui/{category}/{component}/` 안의 파일만. 카테고리 폴더에 바로 놓인
테스트(`src/ui/overlay/overlay-escape.test.tsx` - 여러 오버레이가 공유하는 동작)와
`src/utils/**`(폴더가 아니라 모듈 단위라 파일명이 소스를 따른다)는 대상이 아니다.

파일명 규약은 리뷰 diff 에서 눈에 잘 안 띄어 조용히 다시 갈라진다 - 그래서 정적으로 본다.
"""

from __future__ import annotations

import sys
from pathlib import Path

UI = Path("src/ui")
SUFFIXES = (".test.tsx", ".test.ts", ".stories.tsx", ".stories.ts")


def stem_and_kind(name: str) -> tuple[str, str] | None:
    for suffix in SUFFIXES:
        if name.endswith(suffix):
            return name[: -len(suffix)], suffix
    return None


def check() -> tuple[list[str], int]:
    problems: list[str] = []
    checked = 0
    # 컴포넌트 폴더 = src/ui/{category}/{component}
    for folder in sorted(p for p in UI.glob("*/*") if p.is_dir()):
        for path in sorted(folder.iterdir()):
            parsed = stem_and_kind(path.name)
            if not parsed:
                continue
            stem, suffix = parsed
            checked += 1

            if stem == folder.name:
                continue
            # 옆에 같은 이름의 소스가 있으면 그 모듈의 테스트다.
            if (folder / f"{stem}.ts").exists() or (folder / f"{stem}.tsx").exists():
                continue

            expected = f"{folder.name}{suffix}"
            hint = (
                "폴더명과 같게 두어라"
                if stem.lower().replace("-", "") != folder.name.replace("-", "")
                else "대소문자·하이픈까지 폴더명과 같아야 한다"
            )
            problems.append(f"{path}: `{expected}` 여야 한다 - {hint}")
    return problems, checked


def main() -> int:
    if not UI.is_dir():
        print(f"{UI} 가 없다 - 디렉터리 구조가 바뀌었는지 보라", file=sys.stderr)
        return 1

    problems, checked = check()
    if checked == 0:
        print("검사 대상 파일이 없다 - 구조가 바뀌었는지 보라", file=sys.stderr)
        return 1
    if problems:
        print("테스트·스토리 파일 이름이 규약과 다르다:\n", file=sys.stderr)
        for problem in problems:
            print(f"  {problem}", file=sys.stderr)
        print(
            "\n  이름을 바꿀 때는 `git mv` 를 쓴다. 대소문자만 다른 경우"
            "(`Card.test.tsx` → `card.test.tsx`)는 이 리포가 `core.ignorecase=true` 라"
            "\n  임시 이름을 거친 2단계 `git mv` 가 필요하다.",
            file=sys.stderr,
        )
        return 1

    print(f"테스트·스토리 파일 {checked}개 - 전부 폴더명과 같은 kebab-case 입니다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
