import { makeFocusable } from "./make-focusable";

describe("makeFocusable", () => {
  it("Sets the tab index", () => {
    document.body.innerHTML = `
    <div>
      <div id="button" />
    </div>`;
    const button = document.getElementById("button");
    makeFocusable(button);
    expect(button.tabIndex).toBe(0);
  });

  it("Doesn't set the tab index if already present", () => {
    document.body.innerHTML = `
    <div>
      <button id="button" tabindex="-1" />
    </div>`;
    const button = document.getElementById("button");
    makeFocusable(button);
    expect(button.tabIndex).toBe(-1);
  });
});
