/**
 * @jest-environment jsdom
 */

/*import { applySettingsToForm, collectFormData, setupFormListener } from "../../../src/frontend/scripts/settings.js";

describe("Settings Page Form", () => {
  let alertMock;

  beforeAll(() => {
    // Mock alert
    alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    // Fake HTML structure for settings form
    document.body.innerHTML = `
      <form id="settingsForm">
        <input id="language">
        <input id="region">
        <input id="timezone">
        <input id="ageRange">
        <input id="hobbies">
        <input id="bio">
        <input id="matchWith">
        <input id="profileVisibility">
        <input id="matchPreferences">
        <input id="notifications">
        <input id="funFact">
        <button type="submit">Save</button>
      </form>
    `;
  });

  afterAll(() => {
    alertMock.mockRestore();
  });

  it("applies settings to form correctly", () => {
    const form = document.getElementById("settingsForm");
    const fakeData = {
      language: "English",
      region: "Europe (Western)",
      timezone: "Europe/London",
      ageRange: "18-25",
      hobbies: "coding,reading",
      bio: "Hello",
      matchWith: "friends",
      profileVisibility: "public",
      matchPreferences: "any",
      notifications: "enabled",
      funFact: "I love chess"
    };

    applySettingsToForm(fakeData, form);

    expect(form.querySelector("#language").value).toBe("English");
    expect(form.querySelector("#region").value).toBe("Europe (Western)");
    expect(form.querySelector("#funFact").value).toBe("I love chess");
  });

  it("collects form data correctly", () => {
    const form = document.getElementById("settingsForm");
    form.querySelector("#language").value = "Spanish";
    form.querySelector("#region").value = "Asia (Eastern)";
    form.querySelector("#bio").value = "Hola";

    const data = collectFormData(form);
    expect(data.language).toBe("Spanish");
    expect(data.region).toBe("Asia (Eastern)");
    expect(data.bio).toBe("Hola");
    expect(data.secret).toBe("groupBKPTN9");
  });

  it("calls saveSettings when form is submitted", async () => {
    const form = document.getElementById("settingsForm");

    // Mock saveSettings to just resolve
    const fakeSave = jest.fn().mockResolvedValue();

    // Override original saveSettings
    const originalSave = global.saveSettings;
    global.saveSettings = fakeSave;

    setupFormListener(form);

    // Trigger submit
    const submitEvent = new Event("submit");
    await form.dispatchEvent(submitEvent);

    expect(fakeSave).toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith(" Changes saved successfully!");

    // Restore
    global.saveSettings = originalSave;
  });

  it("settings.js script loads successfully", () => {
    expect(true).toBe(true);
  });
});*/
