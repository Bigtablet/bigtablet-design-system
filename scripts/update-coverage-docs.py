#!/usr/bin/env python3
"""커버리지 수치를 문서에 써 넣는다 - `pnpm coverage:docs` 로 돌린다.

`pnpm coverage:docs` 가 unit 테스트를 커버리지와 함께 돌려 아래 두 파일을 만든 뒤 이 스크립트를 부른다.

- coverage/coverage-summary.json  - 파일별 covered/total (vitest v8 json-summary)
- coverage/test-results.json      - 테스트 파일·통과·skip 수 (vitest json reporter)

고치는 곳:
- CLAUDE.md          `- **Coverage**: …` 한 줄
- docs/TESTING.md    "현재 커버리지 현황" 의 테스트 수, All files 행, 100% 미만 표

`--check` 를 주면 쓰지 않고, 문서가 실측과 다르면 실패한다(CI 에 걸 때).
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
METRICS = ("statements", "branches", "functions", "lines")


def load(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return json.load(f)


def pct(covered, total):
    if covered == total:
        return "100%"
    # 반올림이 100 으로 올라가면 덜 덮인 것이 100% 로 보인다 - 그때는 99.99 에서 멈춘다
    value = min(round(covered / total * 100, 2), 99.99)
    return f"{value:.2f}".rstrip("0").rstrip(".") + "%"


def build():
    summary = load("coverage/coverage-summary.json")
    results = load("coverage/test-results.json")

    # ui 는 컴포넌트 폴더(ui/<category>/<name>) 단위로 합산하고, utils 는 파일 단위로 둔다.
    src = os.path.join(ROOT, "src") + os.sep
    groups = {}
    for path, data in summary.items():
        if path == "total":
            continue
        rel = path.replace(src, "").replace(os.sep, "/")
        parts = rel.split("/")
        key = "/".join(parts[:3]) if parts[0] == "ui" else rel
        group = groups.setdefault(key, {m: [0, 0] for m in METRICS})
        for m in METRICS:
            group[m][0] += data[m]["covered"]
            group[m][1] += data[m]["total"]

    rows, full = [], 0
    for key in sorted(groups):
        values = [pct(*groups[key][m]) for m in METRICS]
        # 100% 판정은 표기값이 아니라 covered == total 로 한다
        if all(groups[key][m][0] == groups[key][m][1] for m in METRICS):
            full += 1
            continue
        rows.append(f"| {key} | " + " | ".join(values) + " |")

    total = [summary["total"][m]["pct"] for m in METRICS]
    return {
        "total": total,
        "rows": rows,
        "full": full,
        # numTotalTestSuites 는 describe 블록 수다 - 파일 수는 testResults 길이
        "files": len(results["testResults"]),
        "passed": results["numPassedTests"],
        "skipped": results["numPendingTests"] + results.get("numTodoTests", 0),
    }


def sub(text, pattern, repl, where):
    new, count = re.subn(pattern, repl, text, count=1, flags=re.M)
    if count != 1:
        sys.exit(f"update-coverage-docs: {where} 에서 갱신할 자리를 찾지 못했다 ({pattern})")
    return new


def render(data):
    s, b, f, l = data["total"]
    out = {}

    path = "CLAUDE.md"
    text = open(os.path.join(ROOT, path), encoding="utf-8").read()
    out[path] = sub(
        text,
        r"^- \*\*Coverage\*\*: [\d.]+% stmts / [\d.]+% branch / [\d.]+% funcs / [\d.]+% lines",
        f"- **Coverage**: {s}% stmts / {b}% branch / {f}% funcs / {l}% lines",
        path,
    )

    path = "docs/TESTING.md"
    text = open(os.path.join(ROOT, path), encoding="utf-8").read()
    text = sub(
        text,
        r"기준 - \d+ test files / \d+ passed · \d+ skipped\.",
        f"기준 - {data['files']} test files / {data['passed']} passed · {data['skipped']} skipped.",
        path,
    )
    text = sub(
        text,
        r"^\| \*\*All files\*\* \|.*\|$",
        f"| **All files** | **{s}%** | **{b}%** | **{f}%** | **{l}%** |",
        path,
    )
    text = sub(text, r"\(\d+개는 전 지표 100% 라 빠져 있다\)", f"({data['full']}개는 전 지표 100% 라 빠져 있다)", path)
    header = "| 파일 | Stmts | Branch | Funcs | Lines |\n|------|-------|--------|-------|-------|\n"
    start = text.find(header)
    end = text.find("\n\n> 이 절의 수치와 표는 `pnpm coverage:docs`", start)
    if start < 0 or end < 0:
        sys.exit("update-coverage-docs: docs/TESTING.md 에서 100% 미만 표를 찾지 못했다")
    start += len(header)
    out[path] = text[:start] + "\n".join(data["rows"]) + text[end:]
    return out


def main():
    check = "--check" in sys.argv
    stale = []
    for path, text in render(build()).items():
        full = os.path.join(ROOT, path)
        current = open(full, encoding="utf-8").read()
        if current == text:
            continue
        stale.append(path)
        if not check:
            with open(full, "w", encoding="utf-8") as f:
                f.write(text)
    if check and stale:
        sys.exit("커버리지 문서가 실측과 다르다 - `pnpm coverage:docs` 로 갱신: " + ", ".join(stale))
    print("updated: " + ", ".join(stale) if stale else "커버리지 문서가 이미 최신이다")


if __name__ == "__main__":
    main()
