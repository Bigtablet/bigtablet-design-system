/**
 * Figma 디자인 시스템에 정의된 57개 아이콘을 @material-symbols/svg-* 패키지에서
 * 읽어와 src/ui/icon/icon-data.ts 를 자동 생성한다.
 *
 * 실행: node scripts/generate-icons.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Figma 정의 아이콘 이름 → Material Symbols 파일 이름 매핑
// 존재하지 않는 이름은 가장 가까운 아이콘으로 대체
const ICON_MAP = {
  add_a_photo: "add_a_photo",
  add_circle: "add_circle",
  add_lg: "add",        // Figma 커스텀 크기 변형 → add로 대체
  add_md: "add",        // Figma 커스텀 크기 변형 → add로 대체
  apartment: "apartment",
  arrow_back: "arrow_back",
  calendar_today: "calendar_today",
  check: "check",
  check_box: "check_box",
  check_circle: "check_circle",
  close: "close",
  close_small: "close_small",
  cloud_download: "cloud_download",
  cloud_upload: "cloud_upload",
  content_copy: "content_copy",
  delete_forever: "delete_forever",
  edit: "edit",
  edit_note: "edit_note",
  error: "error",
  event: "event",
  fiber_manual_record: "fiber_manual_record",
  forward_5: "forward_5",
  group: "group",
  groups: "groups",
  help: "help",
  id: "badge",          // Material Symbols에 없음 → badge로 대체
  id_card: "id_card",
  image: "image",
  indeterminate_check_box: "indeterminate_check_box",
  info: "info",
  keyboard_arrow_down: "keyboard_arrow_down",
  keyboard_arrow_left: "keyboard_arrow_left",
  keyboard_arrow_right: "keyboard_arrow_right",
  keyboard_arrow_up: "keyboard_arrow_up",
  location_on: "location_on",
  login: "login",
  logout: "logout",
  more_vert: "more_vert",
  open_in_browser: "open_in_browser",
  open_in_new: "open_in_new",
  pause: "pause",
  person: "person",
  photo_camera: "photo_camera",
  photo_library: "photo_library",
  play_arrow: "play_arrow",
  replay_5: "replay_5",
  search: "search",
  settings: "settings",
  share: "share",
  speed_1_2x: "speed_1_2x",
  speed_1_5x: "speed_1_5x",
  speed_1_7x: "speed_1_7x",
  speed_1x: "speed",    // speed_1x 없음 → speed로 대체
  speed_2x: "speed_2x",
  stop: "stop",
  visibility: "visibility",
  visibility_off: "visibility_off",
};

/** SVG 파일에서 <path d="..."> 내용을 추출한다 */
function extractPaths(svgContent) {
  // path 태그를 모두 추출해 하나의 문자열로 합친다
  const matches = [...svgContent.matchAll(/<path[^>]*\bd="([^"]+)"/g)];
  return matches.map((m) => m[1]).join(" ");
}

/** 아이콘 하나의 4가지 변형 경로 데이터를 읽는다 */
function readIconPaths(iconKey) {
  const fileName = ICON_MAP[iconKey];
  const result = {};

  for (const weight of [300, 400]) {
    const base = path.join(
      root,
      "node_modules",
      `@material-symbols/svg-${weight}`,
      "outlined",
    );

    const noFillFile = path.join(base, `${fileName}.svg`);
    const fillFile = path.join(base, `${fileName}-fill.svg`);

    if (!fs.existsSync(noFillFile)) {
      console.warn(`⚠️  Missing: svg-${weight}/outlined/${fileName}.svg`);
      return null;
    }

    result[weight] = {
      noFill: extractPaths(fs.readFileSync(noFillFile, "utf8")),
      fill: fs.existsSync(fillFile)
        ? extractPaths(fs.readFileSync(fillFile, "utf8"))
        : extractPaths(fs.readFileSync(noFillFile, "utf8")), // fill 없으면 noFill로 대체
    };
  }

  return result;
}

// 모든 아이콘 데이터 수집
const iconData = {};
let successCount = 0;

for (const iconKey of Object.keys(ICON_MAP)) {
  const paths = readIconPaths(iconKey);
  if (paths) {
    iconData[iconKey] = paths;
    successCount++;
  }
}

console.log(`✓ ${successCount}/${Object.keys(ICON_MAP).length} icons processed`);

// TypeScript 파일 생성
const iconNames = Object.keys(iconData);

const output = `/**
 * ⚠️  AUTO-GENERATED — DO NOT EDIT MANUALLY
 * Run \`node scripts/generate-icons.mjs\` to regenerate.
 *
 * Source: @material-symbols/svg-300, @material-symbols/svg-400 (outlined)
 * Icons: ${iconNames.length} icons × 4 variants (weight 300/400 × fill/no-fill)
 * ViewBox: "0 -960 960 960" (Material Symbols standard)
 */

export type IconName =
${iconNames.map((n) => `  | "${n}"`).join("\n")};

export type IconWeight = 300 | 400;

type IconVariants = {
  noFill: string;
  fill: string;
};

type IconEntry = {
  300: IconVariants;
  400: IconVariants;
};

export const ICON_DATA: Record<IconName, IconEntry> = {
${iconNames
  .map(
    (name) => `  ${name}: {
    300: {
      noFill: "${iconData[name][300].noFill}",
      fill: "${iconData[name][300].fill}",
    },
    400: {
      noFill: "${iconData[name][400].noFill}",
      fill: "${iconData[name][400].fill}",
    },
  },`,
  )
  .join("\n")}
};
`;

const outPath = path.join(root, "src", "ui", "icon", "icon-data.ts");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, output, "utf8");

console.log(`✓ Generated: src/ui/icon/icon-data.ts`);
