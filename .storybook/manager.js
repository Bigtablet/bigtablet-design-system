import { addons } from "storybook/manager-api";
import theme from "./theme";

addons.setConfig({
	theme,
	sidebar: {
		order: ["guide", "foundation", "components"],
	},
	showPanel: true,
	enableShortcuts: true,
	disableWhatsNewNotifications: true,
});
