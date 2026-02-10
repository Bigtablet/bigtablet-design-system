/**
 * 커버리지 리포트를 한글로 출력하는 스크립트
 * Usage: node scripts/coverage-report.mjs
 */

import fs from 'fs';
import path from 'path';

const summaryPath = path.resolve('coverage/coverage-summary.json');

if (!fs.existsSync(summaryPath)) {
    console.error('❌ 커버리지 파일이 없습니다. 먼저 pnpm test:coverage를 실행하세요.');
    process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

const formatPercent = (pct) => {
    if (pct >= 80) return `🟢 ${pct.toFixed(1)}%`;
    if (pct >= 50) return `🟡 ${pct.toFixed(1)}%`;
    return `🔴 ${pct.toFixed(1)}%`;
};

const total = summary.total;

console.log('');
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║               📊 테스트 커버리지 리포트                  ║');
console.log('╠════════════════════════════════════════════════════════╣');
console.log(`║  구문(Statements)  │ ${formatPercent(total.statements.pct).padEnd(12)} (${total.statements.covered}/${total.statements.total})`);
console.log(`║  분기(Branches)    │ ${formatPercent(total.branches.pct).padEnd(12)} (${total.branches.covered}/${total.branches.total})`);
console.log(`║  함수(Functions)   │ ${formatPercent(total.functions.pct).padEnd(12)} (${total.functions.covered}/${total.functions.total})`);
console.log(`║  라인(Lines)       │ ${formatPercent(total.lines.pct).padEnd(12)} (${total.lines.covered}/${total.lines.total})`);
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');

// 파일별 상세 (커버리지 낮은 순)
const files = Object.entries(summary)
    .filter(([key]) => key !== 'total')
    .map(([file, data]) => ({
        file: file.replace(process.cwd() + '/', ''),
        lines: data.lines.pct,
        covered: data.lines.covered,
        total: data.lines.total,
    }))
    .sort((a, b) => a.lines - b.lines);

console.log('📁 파일별 커버리지 (낮은 순)');
console.log('─'.repeat(60));

for (const f of files.slice(0, 10)) {
    const bar = '█'.repeat(Math.floor(f.lines / 10)) + '░'.repeat(10 - Math.floor(f.lines / 10));
    console.log(`${bar} ${f.lines.toFixed(0).padStart(3)}% │ ${f.file}`);
}

if (files.length > 10) {
    console.log(`... 그 외 ${files.length - 10}개 파일`);
}

console.log('');
console.log('💡 상세 리포트: open coverage/index.html');
console.log('');

// GitHub Actions용 마크다운 출력
if (process.env.GITHUB_ACTIONS) {
    const markdown = `## 📊 테스트 커버리지 리포트

| 항목 | 커버리지 | 커버됨/전체 |
|------|----------|-------------|
| 구문(Statements) | ${formatPercent(total.statements.pct)} | ${total.statements.covered}/${total.statements.total} |
| 분기(Branches) | ${formatPercent(total.branches.pct)} | ${total.branches.covered}/${total.branches.total} |
| 함수(Functions) | ${formatPercent(total.functions.pct)} | ${total.functions.covered}/${total.functions.total} |
| 라인(Lines) | ${formatPercent(total.lines.pct)} | ${total.lines.covered}/${total.lines.total} |

<details>
<summary>📁 커버리지 낮은 파일 (상위 10개)</summary>

| 커버리지 | 파일 |
|----------|------|
${files.slice(0, 10).map(f => `| ${formatPercent(f.lines)} | \`${f.file}\` |`).join('\n')}

</details>
`;

    // GitHub Actions output
    fs.writeFileSync('coverage-report.md', markdown);
    console.log('📝 coverage-report.md 생성됨');
}
