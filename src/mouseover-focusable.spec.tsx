import { makeMouseoverFocusable, setMoving } from "./mouseover-focusable";

describe("makeMouseoverFocusable", () => {
  it("Sets the tab index", () => {
    document.body.innerHTML = `
    <div>
      <div id="button" />
    </div>`;
    const button = document.getElementById("button");
    makeMouseoverFocusable(button);
    expect(button.tabIndex).toBe(0);
  });

  it("Doesn't set the tab index if already present", () => {
    document.body.innerHTML = `
    <div>
      <button id="button" tabindex="-1" />
    </div>`;
    const button = document.getElementById("button");
    makeMouseoverFocusable(button);
    expect(button.tabIndex).toBe(-1);
  });

  it("Doesn't focus on mouseover if mouse doesn't move", () => {
    document.body.innerHTML = `
    <div>
      <button data-phocus-on-mouseover="true" id="button" />
    </div>`;
    const oldFocus = document.activeElement
    const button = document.getElementById("button");
    makeMouseoverFocusable(button);
    const mouseoverEvent = new Event("mouseenter");
    button.dispatchEvent(mouseoverEvent);
    expect(document.activeElement).toBe(oldFocus);
  });

  it("Focuses on mouseover", () => {
    document.body.innerHTML = `
    <div>
      <button data-phocus-on-mouseover="true" id="button" />
    </div>`;
    setMoving();
    const button = document.getElementById("button");
    makeMouseoverFocusable(button);
    const mouseoverEvent = new Event("mouseenter");
    button.dispatchEvent(mouseoverEvent);
    expect(document.activeElement).toBe(button);
  });
});


