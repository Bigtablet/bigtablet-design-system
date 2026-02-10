import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar, SidebarItem } from "./index";
import { Home, Settings } from "lucide-react";

// Mock next/link
vi.mock("next/link", () => ({
    default: ({ children, href, className, onClick }: {
        children: React.ReactNode;
        href: string;
        className?: string;
        onClick?: () => void;
    }) => (
        <a href={href} className={className} onClick={onClick}>
            {children}
        </a>
    ),
}));

// Mock next/image
vi.mock("next/image", () => ({
    default: ({ src, alt, onClick }: {
        src: string;
        alt: string;
        width: number;
        height: number;
        priority?: boolean;
        onClick?: () => void;
    }) => (
        <img src={src} alt={alt} onClick={onClick} />
    ),
}));

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Sidebar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const basicItems: SidebarItem[] = [
        { href: "/home", label: "Home", icon: Home },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    const groupItems: SidebarItem[] = [
        { href: "/home", label: "Home" },
        {
            type: "group",
            id: "admin",
            label: "Admin",
            icon: Settings,
            children: [
                { href: "/admin/users", label: "Users" },
                { href: "/admin/roles", label: "Roles" },
            ],
        },
    ];

    it("renders sidebar", () => {
        render(<Sidebar items={basicItems} />);
        expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("renders link items", () => {
        render(<Sidebar items={basicItems} />);
        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("renders group items", () => {
        render(<Sidebar items={groupItems} />);
        expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    it("toggles group on click", () => {
        render(<Sidebar items={groupItems} />);

        const adminButton = screen.getByText("Admin");
        const subContainer = adminButton.closest(".sidebar_group")?.querySelector(".sidebar_sub");

        // Group should be collapsed initially (no open class)
        expect(subContainer).not.toHaveClass("sidebar_sub_open");

        // Click to expand
        fireEvent.click(adminButton);
        expect(subContainer).toHaveClass("sidebar_sub_open");

        // Click to collapse
        fireEvent.click(adminButton);
        expect(subContainer).not.toHaveClass("sidebar_sub_open");
    });

    it("marks active item based on activePath with startsWith", () => {
        render(<Sidebar items={basicItems} activePath="/home/details" />);
        const homeLink = screen.getByText("Home").closest("a");
        expect(homeLink).toHaveClass("sidebar_item_active");
    });

    it("marks active item based on activePath with exact match", () => {
        render(<Sidebar items={basicItems} activePath="/home" match="exact" />);
        const homeLink = screen.getByText("Home").closest("a");
        expect(homeLink).toHaveClass("sidebar_item_active");
    });

    it("does not mark item active with exact match if path differs", () => {
        render(<Sidebar items={basicItems} activePath="/home/details" match="exact" />);
        const homeLink = screen.getByText("Home").closest("a");
        expect(homeLink).not.toHaveClass("sidebar_item_active");
    });

    it("calls onItemSelect when link is clicked", () => {
        const onItemSelect = vi.fn();
        render(<Sidebar items={basicItems} onItemSelect={onItemSelect} />);

        fireEvent.click(screen.getByText("Home"));
        expect(onItemSelect).toHaveBeenCalledWith("/home");
    });

    it("auto-opens group containing active path", () => {
        render(<Sidebar items={groupItems} activePath="/admin/users" />);
        const adminButton = screen.getByText("Admin");
        const subContainer = adminButton.closest(".sidebar_group")?.querySelector(".sidebar_sub");
        expect(subContainer).toHaveClass("sidebar_sub_open");
    });

    it("applies custom className", () => {
        const { container } = render(<Sidebar items={basicItems} className="custom-sidebar" />);
        expect(container.firstChild).toHaveClass("custom-sidebar");
    });

    it("applies custom style", () => {
        const { container } = render(<Sidebar items={basicItems} style={{ width: "300px" }} />);
        expect(container.firstChild).toHaveStyle({ width: "300px" });
    });

    it("renders brand link with default href", () => {
        render(<Sidebar items={basicItems} />);
        const brandLink = screen.getByAltText("Bigtablet").closest("a");
        expect(brandLink).toHaveAttribute("href", "/main");
    });

    it("renders brand link with custom href", () => {
        render(<Sidebar items={basicItems} brandHref="/dashboard" />);
        const brandLink = screen.getByAltText("Bigtablet").closest("a");
        expect(brandLink).toHaveAttribute("href", "/dashboard");
    });

    it("toggles sidebar closed when close button is clicked", () => {
        render(<Sidebar items={basicItems} />);

        // Initially open
        expect(screen.getByRole("navigation")).toBeInTheDocument();

        // Click close button
        fireEvent.click(screen.getByAltText("Close"));

        // Sidebar should be closed (nav hidden)
        expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });

    it("toggles sidebar open when menu button is clicked", () => {
        render(<Sidebar items={basicItems} />);

        // Close sidebar first
        fireEvent.click(screen.getByAltText("Close"));
        expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

        // Click menu button to open
        fireEvent.click(screen.getByAltText("Open"));
        expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("saves sidebar state to localStorage", () => {
        render(<Sidebar items={basicItems} />);

        fireEvent.click(screen.getByAltText("Close"));
        expect(localStorageMock.setItem).toHaveBeenCalledWith("isOpen", "false");
    });

    it("renders without items", () => {
        render(<Sidebar />);
        expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("renders icons for items with icon prop", () => {
        render(<Sidebar items={basicItems} />);
        // Icons are rendered via lucide-react
        const sidebarIcons = document.querySelectorAll(".sidebar_icon");
        expect(sidebarIcons.length).toBeGreaterThan(0);
    });
});
