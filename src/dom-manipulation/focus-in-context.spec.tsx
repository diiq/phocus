import {
  focusInContext
} from "./focus-in-context";

describe("focus-in-context", () => {
  it("Focuses on a thing with a phocus-id", () => {
    document.body.innerHTML = `
    <div data-phocus-context-name="baby">
      <button id="button" data-phocus-id="goo" />
      <button id="other" />
    </div>`;
    const button = document.getElementById('button');
    const other = document.getElementById('other');
    other.focus();
    focusInContext("goo");
    expect(document.activeElement).toBe(button);
  });

  it("Focuses on the thing with a phocus-id in the current context", () => {
    document.body.innerHTML = `
    <div data-phocus-context-name="bobby">
      <button data-phocus-id="goo" />
    </div>
    <div data-phocus-context-name="baby">
      <button id="button" data-phocus-id="goo" />
      <button id="other" />
    </div>`;
    const button = document.getElementById('button');
    const other = document.getElementById('other');
    other.focus();
    focusInContext("goo");
    expect(document.activeElement).toBe(button);
  });

  it("Focuses on the thing with a phocus-id in the context of a given elt", () => {
    document.body.innerHTML = `
    <div data-phocus-context-name="bobby">
      <button data-phocus-id="goo" />
    </div>
    <div data-phocus-context-name="baby">
      <button id="button" data-phocus-id="goo" />
      <button id="other" />
    </div>`;
    const button = document.getElementById('button');
    const other = document.getElementById('other');
    focusInContext("goo", other);
    expect(document.activeElement).toBe(button);
  });
});
