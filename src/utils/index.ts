// 줄바꿈 규칙은 src/text 로 옮겼다 (#1079) - 컴포넌트가 쓰던 경로를 그대로 둔다
export {
	renderPhrases,
	renderSentences,
	Sentences,
	type SentencesProps,
	sentenceText,
	splitSentences,
} from "../text";
export { cn } from "./cn";
export {
	isFromInnerControl,
	type KeyActivationOptions,
	type KeyActivationProps,
	keyActivationProps,
} from "./key-activation";
export { registerOverlay, useOverlayEscape } from "./overlay-stack";
export type { PolymorphicProps, PolymorphicRef } from "./polymorphic";
export { revealInline } from "./reveal-inline";
export type { SafeHTMLProps } from "./safe-html";
export {
	lockBodyScroll,
	unlockBodyScroll,
} from "./scroll-lock";
export { splitAriaProps } from "./split-aria-props";
export {
	type AnchoredOptions,
	type AnchoredResult,
	type AnchoredSide,
	type AnchoredState,
	type AnchorRect,
	computeAnchoredPosition,
	type FloatingSize,
	type UseAnchoredPositionArgs,
	useAnchoredPosition,
	type Viewport,
} from "./use-anchored-position";
export {
	type ClipboardStatus,
	copyText,
	type UseClipboardOptions,
	type UseClipboardResult,
	useClipboard,
} from "./use-clipboard";
export { type FocusTrapOptions, useFocusTrap } from "./use-focus-trap";
export { useFormReset } from "./use-form-reset";
export { useIsMounted } from "./use-is-mounted";
export { usePresence } from "./use-presence";
export { useReducedMotion } from "./use-reduced-motion";
export { useSafeLayoutEffect } from "./use-safe-layout-effect";
