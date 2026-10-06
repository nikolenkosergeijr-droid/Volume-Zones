let audioContext = null;
let gainNode = null;
let sourceNodes = [];

function setupAudio() {
  if (audioContext) return;

  audioContext = new AudioContext();

  const mediaElements = document.querySelectorAll("audio, video");

  mediaElements.forEach((media) => {
    try {
      const source = audioContext.createMediaElementSource(media);
      const gain = audioContext.createGain();

      source.connect(gain);
      gain.connect(audioContext.destination);

      sourceNodes.push({
        media: media,
        gain: gain
      });
    } catch (error) {
      console.log("Could not connect audio:", error);
    }
  });
}

function setVolume(percent) {
  setupAudio();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const multiplier = percent / 100;

  sourceNodes.forEach((item) => {
    item.gain.gain.value = multiplier;
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SET_VOLUME") {
    setVolume(message.volume);
  }
});

setInterval(() => {
  if (!audioContext) return;

  const mediaElements = document.querySelectorAll("audio, video");

  mediaElements.forEach((media) => {
    const alreadyConnected = sourceNodes.some(
      (item) => item.media === media
    );

    if (!alreadyConnected) {
      try {
        const source = audioContext.createMediaElementSource(media);
        const gain = audioContext.createGain();

        source.connect(gain);
        gain.connect(audioContext.destination);

        sourceNodes.push({
          media: media,
          gain: gain
        });
      } catch (error) {
        console.log("New audio connection failed:", error);
      }
    }
  });
}, 1000);
