import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Tooltip } from "@/components/ui/Tooltip";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerCloseButton, DrawerTrigger } from "@/components/ui/Drawer";
import { useState } from "react";

function DrawerHarness() {
  const [open, setOpen] = useState(true);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button aria-label="open">Open</button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerCloseButton />
        </DrawerHeader>
        <div data-testid="drawer-body">Hello drawer</div>
      </DrawerContent>
    </Drawer>
  );
}

describe("UI primitives", () => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error jsdom global override
  global.ResizeObserver = ResizeObserverMock;

  it("renders Input and TextArea", () => {
    render(
      <div>
        <Input placeholder="Email" />
        <TextArea placeholder="Notes" />
      </div>
    );
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Notes")).toBeInTheDocument();
  });

  it("switches tabs with Radix Tabs wrapper", async () => {
    render(
      <TabsRoot defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">Tab one content</TabsContent>
        <TabsContent value="two">Tab two content</TabsContent>
      </TabsRoot>
    );
    expect(screen.getByText("Tab one content")).toBeVisible();
    await userEvent.click(screen.getByText("Two"));
    expect(screen.getByText("Tab two content")).toBeVisible();
  });

  it("shows tooltip on hover", async () => {
    render(
      <Tooltip content="Tip text">
        <button>Hover me</button>
      </Tooltip>
    );
    await userEvent.hover(screen.getByText("Hover me"));
    const tips = await screen.findAllByText("Tip text");
    expect(tips.length).toBeGreaterThan(0);
  });

  it("opens and closes drawer", async () => {
    render(<DrawerHarness />);
    expect(screen.getByTestId("drawer-body")).toBeInTheDocument();
    await userEvent.click(screen.getByText("×"));
    expect(screen.queryByTestId("drawer-body")).not.toBeInTheDocument();
  });
});
