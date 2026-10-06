const audioContexts = new Map();

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!sender.tab || !sender.tab.id) return;

  const tabId = sender.tab.id;

  if (message.type === "SET_VOLUME") {
    setTabVolume(tabId, message.volume);
  }
});

async function setTabVolume(tabId, percent) {
  try {
    if (!audioContexts.has(tabId)) {
      const streamId = await chrome.tabCapture.getMediaStreamId({
        targetTabId: tabId
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: "tab",
            chromeMediaSourceId: streamId
          }
        },
        video: false
      });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const gain = audioContext.createGain();

      source.connect(gain);
      gain.connect(audioContext.destination);

      audioContexts.set(tabId, {
        stream: stream,
        context: audioContext,
        gain: gain
      });
    }

    const audio = audioContexts.get(tabId);

    await audio.context.resume();

    audio.gain.gain.value = percent / 100;

  } catch (error) {
    console.error("Volume Zones error:", error);
  }
}

chrome.tabs.onRemoved.addListener((tabId) => {
  const audio = audioContexts.get(tabId);

  if (audio) {
    audio.stream.getTracks().forEach(track => track.stop());
    audio.context.close();
    audioContexts.delete(tabId);
  }
});
