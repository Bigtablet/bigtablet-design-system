import { act, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { stubPendingAnimation } from "../test/stub-animation";
import { usePresence } from "./use-presence";

function Probe({ open, onExited }: { open: boolean; onExited?: () => void }) {
	const ref = React.useRef<HTMLDivElement>(null);
	const mounted = usePresence(open, [ref], onExited);
	if (!mounted) return null;
	return <div ref={ref} data-testid="probe" data-state={open ? "open" : "closed"} />;
}

describe("usePresence", () => {
	it("mounts on the render that opens", () => {
		const { rerender } = render(<Probe open={false} />);
		expect(screen.queryByTestId("probe")).toBeNull();
		rerender(<Probe open />);
		expect(screen.getByTestId("probe")).toHaveAttribute("data-state", "open");
	});

	it("unmounts right away when nothing is animating (reduced motion, jsdom)", () => {
		const onExited = vi.fn();
		const { rerender } = render(<Probe open onExited={onExited} />);
		rerender(<Probe open={false} onExited={onExited} />);
		expect(screen.queryByTestId("probe")).toBeNull();
		expect(onExited).toHaveBeenCalledTimes(1);
	});

	it("waits for the exit animation before unmounting", async () => {
		const anim = stubPendingAnimation();
		const onExited = vi.fn();
		const { rerender } = render(<Probe open onExited={onExited} />);
		rerender(<Probe open={false} onExited={onExited} />);
		expect(screen.getByTestId("probe")).toHaveAttribute("data-state", "closed");
		expect(onExited).not.toHaveBeenCalled();

		await act(async () => anim.finish());
		expect(screen.queryByTestId("probe")).toBeNull();
		expect(onExited).toHaveBeenCalledTimes(1);
	});

	it("drops the pending exit when reopened mid-way", async () => {
		const anim = stubPendingAnimation();
		const onExited = vi.fn();
		const { rerender } = render(<Probe open onExited={onExited} />);
		rerender(<Probe open={false} onExited={onExited} />);
		rerender(<Probe open onExited={onExited} />);

		await act(async () => anim.finish());
		expect(screen.getByTestId("probe")).toHaveAttribute("data-state", "open");
		expect(onExited).not.toHaveBeenCalled();
	});

	it("never reports onExited for something that never opened", () => {
		const onExited = vi.fn();
		const { rerender } = render(<Probe open={false} onExited={onExited} />);
		rerender(<Probe open={false} onExited={onExited} />);
		expect(onExited).not.toHaveBeenCalled();
	});
});
