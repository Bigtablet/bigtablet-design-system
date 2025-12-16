import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming/create";

addons.setConfig({
    theme: create({
        base: "light",

        brandTitle: "Bigtablet Design System",
        brandUrl: "https://bigtablet.com",
        brandImage: "/images/logo/bigtablet.png",
        brandTarget: "_self",
    }),
});