import React, { useState } from "react";
import "./Settings.css";
import Dalle2Img from "../../assets/dalle2.png";
import Dalle3Img from "../../assets/dalle3.png";
import GPTImg1 from "../../assets/gptimg1.png";

const Settings = () => {
  const voices = [
    "alloy",
    "ash",
    "ballad",
    "coral",
    "echo",
    "fable",
    "nova",
    "onyx",
    "sage",
    "shimmer",
  ];
  const ttsModels = ["tts-1", "tts-1-hd", "gpt-4o-mini-tts"];
  const imageModels = [
    { name: "dall-e-2", img: Dalle2Img },
    { name: "dall-e-3", img: Dalle3Img },
    { name: "gpt-image-1", img: GPTImg1 },
  ];

  const themes = [
    "Friendship",
    "Adventure",
    "Kindness",
    "Animals",
    "Magic",
    "Helping Others",
    "Bravery",
    "Imagination",
    "Bedtime",
    "Learning",
    "Sharing",
    "Curiosity",
    "Nature",
    "Superheroes",
    "Creativity",
  ];
  const blockableTopics = [
    "Violence",
    "Scary Elements",
    "Dark Magic",
    "Bullying",
    "Sad Endings",
    "Loneliness",
    "Dangerous Adventures",
    "Inappropriate Humor",
    "Loss / Death",
    "Nightmares",
    "Strong Emotions",
    "Complex Relationships",
    "Conflict",
    "Stereotypes",
    "Fear of Monsters",
  ];

  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [selectedTTSModel, setSelectedTTSModel] = useState("tts-1");
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [selectedImageModel, setSelectedImageModel] = useState("dall-e-2");
  const [wordCount, setWordCount] = useState(300);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [blockedTopics, setBlockedTopics] = useState([]);

  const handlePreview = () => {
    console.log({
      voice: selectedVoice,
      ttsModel: selectedTTSModel,
      speed: speechSpeed,
    });
  };

  const handleImageSave = () => {
    console.log({
      imageModel: selectedImageModel,
    });
  };

  const toggleTheme = (theme) => {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  const toggleBlockedTopic = (topic) => {
    setBlockedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const selectAllThemes = () => setSelectedThemes([...themes]);
  const deselectAllThemes = () => setSelectedThemes([]);

  const selectAllBlocked = () => setBlockedTopics([...blockableTopics]);
  const deselectAllBlocked = () => setBlockedTopics([]);

  return (
    <section className="DashboardPage">
      {/* Text-to-Speech Configuration */}
      <div className="dashboard-container">
        <h3>Text-to-Speech Configuration</h3>

        <div className="tts-section">
          <div className="tts-group">
            <label>Voice Selection:</label>
            <select
              className="voice-select"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              {voices.map((voice) => (
                <option key={voice} value={voice}>
                  {voice}
                </option>
              ))}
            </select>
          </div>

          <div className="tts-group">
            <label>Model Selection:</label>
            <div className="tts-button-group">
              {ttsModels.map((model) => (
                <button
                  key={model}
                  className={`model-btn ${
                    selectedTTSModel === model ? "active" : ""
                  }`}
                  onClick={() => setSelectedTTSModel(model)}
                  type="button"
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          <div className="tts-group">
            <label>Speech Speed: {speechSpeed.toFixed(2)}x</label>
            <input
              type="range"
              min="0.7"
              max="1.0"
              step="0.01"
              value={speechSpeed}
              onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
            />
          </div>

          <div className="save-button-group">
            <button className="preview-btn" onClick={handlePreview}>
              Preview Voice
            </button>
            <button className="save-btn" onClick={handlePreview}>
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Image Generation Controls */}
      <div className="dashboard-container">
        <h3>Image Generation Controls</h3>
        <div className="tts-section">
          <div className="tts-group">
            <label className="label-img">Image Model Selection:</label>
            <div className="image-button-group">
              {imageModels.map((model) => (
                <button
                  key={model.name}
                  className={`image-btn ${
                    selectedImageModel === model.name ? "active" : ""
                  }`}
                  onClick={() => setSelectedImageModel(model.name)}
                  type="button"
                >
                  <img src={model.img} alt={model.name} />
                </button>
              ))}
            </div>
          </div>

          <button
            className="save-btn save-btn-single"
            onClick={handleImageSave}
          >
            Save
          </button>
        </div>
      </div>

      {/* Story Generation Parameters */}
      <div className="dashboard-container">
        <h3>Story Generation Parameters</h3>

        <div className="tts-section">
          {/* Word Count */}
          <div className="tts-group">
            <label>Word Count: {wordCount} words</label>
            <input
              type="range"
              min="150"
              max="1000"
              step="10"
              value={wordCount}
              onChange={(e) => setWordCount(parseInt(e.target.value))}
            />
          </div>

          {/* Themes */}
          <div className="themes-group">
            <label>Appropriate Themes:</label>
            <div className="checkbox-controls">
              <button className="small-btn" onClick={selectAllThemes}>
                Select All
              </button>
              <button className="small-btn" onClick={deselectAllThemes}>
                Deselect All
              </button>
            </div>
            <div className="checkbox-grid">
              {themes.map((theme) => (
                <label key={theme}>
                  <input
                    type="checkbox"
                    checked={selectedThemes.includes(theme)}
                    onChange={() => toggleTheme(theme)}
                  />
                  {theme}
                </label>
              ))}
            </div>
          </div>

          {/* Blocked Topics */}
          <div className="blocked-group">
            <label>Blocked Topics:</label>
            <div className="checkbox-controls">
              <button className="small-btn" onClick={selectAllBlocked}>
                Select All
              </button>
              <button className="small-btn" onClick={deselectAllBlocked}>
                Deselect All
              </button>
            </div>
            <div className="checkbox-grid">
              {blockableTopics.map((topic) => (
                <label key={topic}>
                  <input
                    type="checkbox"
                    checked={blockedTopics.includes(topic)}
                    onChange={() => toggleBlockedTopic(topic)}
                  />
                  {topic}
                </label>
              ))}
            </div>
          </div>

          <button
            className="save-btn save-btn-single"
            onClick={() => {
              console.log({
                wordCount,
                selectedThemes,
                blockedTopics,
              });
            }}
          >
            Save
          </button>
        </div>
      </div>
    </section>
  );
};

export default Settings;
