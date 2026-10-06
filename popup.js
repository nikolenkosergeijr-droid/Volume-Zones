const slider = document.getElementById("volumeSlider");
const volumeText = document.getElementById("volume");
const resetButton = document.getElementById("reset");
const siteText = document.getElementById("site");

let currentTabId = null;

chrome.tabs.query(
  { active: true, currentWindow: true },
  (tabs) => {
    if (!tabs[0]) return;

    currentTabId = tabs[0].id;

    try {
      const url = new URL(tabs[0].url);
      siteText.textContent = url.hostname;
    } catch {
      siteText.textContent = "Current tab";
    }
  }
);

slider.addEventListener("input", () => {
  const volume = Number(slider.value);

  volumeText.textContent = volume + "%";

  if (currentTabId !== null) {
    chrome.runtime.sendMessage({
      type: "SET_VOLUME",
      volume: volume,
      tabId: currentTabId
    });
  }
});

resetButton.addEventListener("click", () => {
  slider.value = 100;
  volumeText.textContent = "100%";

  if (currentTabId !== null) {
    chrome.runtime.sendMessage({
      type: "SET_VOLUME",
      volume: 100,
      tabId: currentTabId
    });
  }
});
