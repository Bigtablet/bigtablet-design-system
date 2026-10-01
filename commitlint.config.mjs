/**
 * @description 커밋 헤더에 한글이 있으면 실패시킨다.
 *
 * 조직 가이드(Bigtablet/.github `COMMIT_GUIDELINE.md`)가 "All commit messages must be
 * written in English" 라고 적어 두었지만 문서에만 있었다 - 어떤 훅도 검사하지 않아
 * 한글 헤더가 그대로 통과했다(최근 300 커밋에 7건).
 *
 * **본문은 보지 않는다.** 배경을 한글로 적는 것은 이 규칙이 노리는 바가 아니다.
 */
const HANGUL_PATTERN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;

/** @type {import('@commitlint/types').UserConfig} */
export default {
	plugins: [
		{
			rules: {
				"header-english-only": ({ header }) => [
					!HANGUL_PATTERN.test(header ?? ""),
					"커밋 헤더는 영어로 작성합니다 (Bigtablet/.github COMMIT_GUIDELINE.md). 본문은 제한하지 않습니다.",
				],
			},
		},
	],
	rules: {
		"header-english-only": [2, "always"],
		// git-workflow.md 기준 허용 라벨
		"type-enum": [
			2,
			"always",
			[
				"feat",
				"fix",
				"bug",
				"merge",
				"deploy",
				"docs",
				"delete",
				"note",
				"style",
				"config",
				"refactor",
				"etc",
				"tada",
			],
		],
		"type-empty": [2, "never"],
		"subject-empty": [2, "never"],
		"subject-case": [0], // 대소문자 제한 없음 (camelCase 허용)
		"header-max-length": [2, "always", 100],
	},
	// "type: subject" 형식 파싱
	parserPreset: {
		parserOpts: {
			headerPattern: /^(\w+):\s(.+)$/,
			headerCorrespondence: ["type", "subject"],
		},
	},
};
