#!/usr/bin/env python3
"""컴포넌트 prop 기본값을 세 축으로 검사한다.

1. 화면·스크린리더에 노출되는 기본 문구는 로케일 카탈로그(`ko`)에 있고 한글이어야 한다.
   컴포넌트 안에 문구를 다시 박으면 `<LocaleProvider>` 로 바꿀 수 없는 문구가 생긴다 -
   영어 화면을 만드는 소비자에게 그 자리만 한국어로 남는다.

   **prop 이름으로 고르지 않는다.** 예전에는 `*Label`/`*Text`/`placeholder` 이름만 봤는데,
   그 패턴을 벗어난 `rowClickHint`·`hint`·`label`·`searchPlaceholder` 여섯 개가 그대로 새어
   나갔다. 이제 `src/ui` 안의 **한글이 든 문자열 전부**를 본다 - 기본값이든 JSX 안이든.

4. 카탈로그 키와 `t("...")` 호출이 양방향으로 맞아야 한다. 키만 추가하고 배선을 잊으면 그
   문구는 아무도 쓰지 않고, 없는 키를 부르면 `undefined` 가 화면에 나간다. 이관을 스크립트로
   돌리다 절반만 적용되는 사고가 실제로 났다 - 그걸 사람이 눈으로 확인하지 않게 한다.
2. JSDoc `@default` 가 실제 destructuring 기본값과 일치해야 한다. 값을 바꾸고 JSDoc 을 잊으면
   Storybook autodocs 와 소비자 문서가 조용히 거짓말을 한다.
3. `docs/COMPONENTS.md` prop 표의 Default 열이 소스 기본값과 일치해야 한다. 소비자가 읽는
   문서라 어긋나면 그대로 잘못된 코드를 쓴다.

exit 1 이면 위반이 있다.
"""

import re
import sys
from pathlib import Path

UI = Path("src/ui")
CATALOG = Path("src/ui/system/locale-provider/messages.ts")

# `	const placeholder = placeholderProp ?? t("combobox.placeholder");`
LOCALE_BACKED = re.compile(
    r'^\s*const ([a-z][A-Za-z0-9]*) =\s*[a-zA-Z0-9]*Prop \?\? t\("([^"]+)"\)'
)


def catalog_ko() -> dict[str, str]:
    """`ko` 카탈로그를 {키: 문구} 로 읽는다. 컴포넌트 기본값의 원본이다."""
    text = CATALOG.read_text(encoding="utf-8")
    body = text.split("export const ko:", 1)[1].split("export const en:", 1)[0]
    return dict(re.findall(r'"([^"]+)":\s*"([^"]*)"', body))


def locale_defaults(path: Path, catalog: dict[str, str]) -> dict[str, str]:
    """컴포넌트가 카탈로그에서 받는 기본값. `prop ?? t("key")` 를 카탈로그 문구로 바꾼다."""
    out: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        m = LOCALE_BACKED.match(line)
        if m and m.group(2) in catalog:
            out.setdefault(m.group(1), catalog[m.group(2)])
    return out

HANGUL = re.compile(r"[가-힣]")

# 개발자 콘솔로만 나가는 문구. 사용자가 아니라 이 저장소를 쓰는 개발자가 읽으므로 로케일 대상이
# 아니다. 표식으로 고르는 이유 - 파일 단위로 빼면 그 파일의 실제 노출 문구까지 놓친다.
DEV_MESSAGE_MARKERS = ("[Bigtablet DS]", "올바른 사용 예", "앱 최상단에", "  <")

# `  someLabel = "값",` 형태의 destructuring 기본값
DEFAULT_STR = re.compile(r'^\s*([a-z][A-Za-z0-9]*)\s*=\s*"([^"]*)"\s*,?\s*$')
# 문자열이 아닌 기본값도 포함 (JSDoc 대조용)
DEFAULT_ANY = re.compile(r'^\s*([a-z][A-Za-z0-9]*)\s*=\s*([^,=][^,]*?)\s*,?\s*$')

JSDOC_DEFAULT = re.compile(r"^\s*\*\s*@default\s+(.+?)\s*$")
PROP_DECL = re.compile(r"^\s*([a-z][A-Za-z0-9]*)\??\s*:")


def string_literals(line: str, in_block: bool) -> tuple[list[str], bool]:
    """한 줄에서 문자열 리터럴만 뽑고, 블록 주석이 이어지는지 함께 돌려준다.

    정규식 한 방으로는 안 된다 - 닫는 따옴표에서 시작해 뒤에 붙은 `// 주석` 까지 물고,
    JSX 블록 주석(`{/* ... */}`)의 둘째 줄은 `//` 로 시작하지 않아 걸러지지 않는다.
    두 실수를 실제로 했다.
    """
    out: list[str] = []
    i, n = 0, len(line)
    while i < n:
        if in_block:
            end = line.find("*/", i)
            if end == -1:
                return out, True
            i, in_block = end + 2, False
            continue
        ch = line[i]
        if line.startswith("//", i):
            break
        if line.startswith("/*", i):
            in_block = True
            i += 2
            continue
        if ch in "\"'`":
            j = i + 1
            buf = []
            while j < n:
                if line[j] == "\\":
                    j += 2
                    continue
                if line[j] == ch:
                    break
                buf.append(line[j])
                j += 1
            out.append("".join(buf))
            # 여는 따옴표가 이 줄에서 닫히지 않으면(여러 줄 문자열) 나머지는 포기한다
            i = j + 1 if j < n else n
            continue
        i += 1
    return out, in_block


def normalize(value: str) -> str:
    value = value.strip().rstrip(";")
    # 문서 표는 값을 백틱으로 감싼다 - `'filled'` -> 'filled'
    if len(value) >= 2 and value.startswith("`") and value.endswith("`"):
        value = value[1:-1].strip()
    if len(value) >= 2 and value[0] in "\"'" and value[-1] == value[0]:
        return value[1:-1]
    return value


def check_file(path: Path) -> list[str]:
    lines = path.read_text(encoding="utf-8").splitlines()
    problems: list[str] = []

    # ── 1. 컴포넌트에 한글 문구를 박지 않았는지 (prop 이름과 무관하게)
    in_block = False
    for i, line in enumerate(lines, start=1):
        literals, in_block = string_literals(line, in_block)
        if not any(HANGUL.search(v) for v in literals):
            continue
        stripped = line.strip()
        if any(allowed in line for allowed in DEV_MESSAGE_MARKERS):
            continue
        m = DEFAULT_STR.match(line)
        if m:
            name = m.group(1)
            problems.append(
                f'{path}:{i}  {name} = "{m.group(2)}" - 노출 문구는 로케일 카탈로그에 두고'
                f' `{name}Prop ?? t("...")` 로 받아야 한다'
            )
        else:
            problems.append(
                f"{path}:{i}  {stripped[:70]} - 박아 넣은 한글 문구다."
                ' 카탈로그에 키를 만들고 `t("...")` 로 받아야 한다'
            )

    # ── 2. JSDoc @default vs 실제 기본값
    actual: dict[str, str] = {}
    for line in lines:
        m = DEFAULT_ANY.match(line)
        if m:
            actual.setdefault(m.group(1), normalize(m.group(2)))

    for i, line in enumerate(lines, start=1):
        m = JSDOC_DEFAULT.match(line)
        if not m:
            continue
        documented = normalize(m.group(1))
        # 태그 다음에 오는 첫 prop 선언이 그 태그의 대상이다
        prop = next(
            (d.group(1) for d in (PROP_DECL.match(l) for l in lines[i:i + 6]) if d),
            None,
        )
        if prop is None:
            problems.append(f"{path}:{i}  @default {documented} - 대상 prop 을 찾지 못했다")
            continue
        if prop not in actual:
            # 기본값 없이 문서만 있는 경우 (구조분해에 없음)
            problems.append(f"{path}:{i}  {prop} - JSDoc 은 @default {documented} 인데 실제 기본값이 없다")
            continue
        if actual[prop] != documented:
            problems.append(
                f"{path}:{i}  {prop} - JSDoc @default {documented} != 실제 {actual[prop]}"
            )

    return problems


# ── docs/COMPONENTS.md prop 표 대조 ──────────────────────────────────────────

DOC = Path("docs/COMPONENTS.md")
# 표 셀 구분자. 타입 열의 `\|`(escape 된 union 파이프)는 구분자가 아니다.
CELL_SPLIT = re.compile(r"(?<!\\)\|")
DEFAULT_HEADER = re.compile(r"^(?:Default|기본값)$", re.IGNORECASE)
# destructuring 기본값 한 줄. `({` 시그니처와 `const { ... } = props` 두 형태를 모두 잡으려고
# 블록 경계를 찾지 않고 "탭 들여쓰기 + 이름 = 값 + 쉼표"인 줄만 받는다. JSX 속성은 `=` 양쪽에
# 공백이 없고, 객체 리터럴은 `:` 를 쓰고, 일반 대입은 `const` 로 시작하므로 섞이지 않는다.
DESTRUCTURED = re.compile(r"^\t+([a-z][A-Za-z0-9]*)\s+=\s+(.+),$")


def destructured_defaults(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        m = DESTRUCTURED.match(line)
        if m:
            out.setdefault(m.group(1), normalize(m.group(2)))
    return out


def cells_of(line: str) -> list[str]:
    parts = CELL_SPLIT.split(line.strip())
    if parts and parts[0] == "":
        parts = parts[1:]
    if parts and parts[-1] == "":
        parts = parts[:-1]
    return [c.strip() for c in parts]


# `t("modal.close")` - `it("...")` 같은 테스트 함수에 걸리지 않게 앞 문자를 막는다
T_CALL = re.compile(r'(?<![A-Za-z0-9_])t\(\s*"([^"]+)"')


def check_catalog_wiring(files: list[Path], catalog: dict[str, str]) -> list[str]:
    """카탈로그 키와 `t("...")` 호출을 양방향으로 대조한다.

    한쪽만 맞으면 조용히 깨진다 - 키만 넣고 배선을 잊으면 그 문구는 아무도 안 쓰고, 없는 키를
    부르면 `undefined` 가 화면에 나간다. 이관을 스크립트로 돌리다 절반만 적용된 적이 있어
    사람 눈으로 확인하지 않게 한다.
    """
    used: dict[str, Path] = {}
    for f in files:
        for key in T_CALL.findall(f.read_text(encoding="utf-8")):
            used.setdefault(key, f)

    problems = [
        f"{CATALOG}  {key} - 카탈로그에만 있고 컴포넌트가 쓰지 않는다 (배선 누락)"
        for key in sorted(set(catalog) - set(used))
    ]
    problems += [
        f'{used[key]}  t("{key}") - 카탈로그에 없는 키다 (화면에 undefined 가 나간다)'
        for key in sorted(set(used) - set(catalog))
    ]
    return problems


def check_docs(files: list[Path], catalog: dict[str, str]) -> tuple[list[str], int]:
    by_name = {f.parent.name.replace("-", "").lower(): f for f in files}
    problems: list[str] = []
    compared = 0
    component: Path | None = None
    default_col: int | None = None

    for i, line in enumerate(DOC.read_text(encoding="utf-8").splitlines(), start=1):
        if line.startswith("#"):
            key = re.sub(r"[^A-Za-z0-9]", "", line.lstrip("# ")).lower()
            component, default_col = by_name.get(key), None
            continue
        if not line.startswith("|"):
            default_col = None
            continue

        cells = cells_of(line)
        header = next((n for n, c in enumerate(cells) if DEFAULT_HEADER.match(c)), None)
        if header is not None:
            default_col = header
            continue
        if default_col is None or component is None or len(cells) <= default_col:
            continue
        if set(line.replace("|", "").strip()) <= set("-: "):
            continue

        prop = normalize(cells[0])
        if not re.fullmatch(r"[a-z][A-Za-z0-9]*", prop):
            continue
        documented = normalize(cells[default_col])
        # 값이 없거나 산문(`자동 생성`)이거나 함수인 경우는 문자 비교가 의미 없다.
        if documented in ("", "-", "—", "자동 생성") or "=>" in documented:
            continue

        actual = {**destructured_defaults(component), **locale_defaults(component, catalog)}
        if prop not in actual or "=>" in actual[prop]:
            continue

        compared += 1
        if actual[prop] != documented:
            problems.append(
                f"{DOC}:{i}  {component.parent.name}.{prop} - 문서 {documented!r}"
                f" != 소스 {actual[prop]!r}"
            )

    return problems, compared


def main() -> int:
    files = sorted(UI.rglob("index.tsx"))
    if not files:
        print("검사할 컴포넌트를 찾지 못했다 - 실행 위치가 repo 루트인지 확인하라", file=sys.stderr)
        return 1

    problems = [p for f in files for p in check_file(f)]
    catalog = catalog_ko()
    problems += [
        f"{CATALOG}  {key} = {value!r} - 한글이 없다"
        for key, value in catalog.items()
        if not HANGUL.search(value)
    ]
    problems += check_catalog_wiring(files, catalog)
    doc_problems, doc_compared = check_docs(files, catalog)
    problems += doc_problems

    exposed = len(catalog)
    documented = sum(
        1
        for f in files
        for line in f.read_text(encoding="utf-8").splitlines()
        if JSDOC_DEFAULT.match(line)
    )

    if exposed == 0 or documented == 0 or doc_compared == 0:
        print(
            f"검사 대상이 사라졌다 (카탈로그 {exposed}, @default {documented},"
            f" 문서 표 {doc_compared})"
            " - 정규식이나 파일 구조가 바뀌었는지 확인하라",
            file=sys.stderr,
        )
        return 1

    if problems:
        print("prop 기본값 검사 실패:\n", file=sys.stderr)
        for p in problems:
            print(f"  {p}", file=sys.stderr)
        return 1

    print(f"로케일 카탈로그 {exposed}개 - 전부 한글입니다.")
    print(f"JSDoc @default {documented}개 - 전부 실제 기본값과 일치합니다.")
    print(f"docs/COMPONENTS.md prop 표 기본값 {doc_compared}개 - 전부 소스와 일치합니다.")
    print(f"카탈로그 키 {exposed}개 - 전부 컴포넌트에 배선돼 있습니다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
