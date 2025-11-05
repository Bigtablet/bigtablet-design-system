import type { Meta, StoryObj } from "@storybook/react";
import {Button} from "../src/button";

const meta: Meta<typeof Button> = {
    title: "Components/Button",
    component: Button,
    argTypes: { onClick: { action: "clicked" } },
};
export default meta;

type Story = StoryObj<typeof Button>;
export const Primary: Story = { args: { children: "Primary" } };
export const Ghost: Story = { args: { children: "Ghost", variant: "ghost" } };