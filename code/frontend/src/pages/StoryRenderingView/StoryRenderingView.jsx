import React, { useEffect, useState, useRef } from "react";
import { Play, Pause, Square, Download } from 'lucide-react';
import "./StoryRenderingView.css";

const StoryRenderingView = ({ onBackToSettings }) => {
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // OpenAI TTS states
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState([]);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Audio refs
  const audioRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);

  // VARIANT A: Placeholder (for UI work)
  useEffect(() => {
    const fakeData = {
      success: true,
      metadata: {
        character: "Bunny",
        theme: "Animals",
        setting: "City",
      },
      story: `Once upon a time, in a bustling city far, far away, there lived a small, soft bunny named Benny. Even though he was surrounded by tall buildings and busy streets, Benny had made his home in a quiet, green park, right in the middle of the city.

Every morning, Benny would bounce around the park, greeting his friends. There were squirrels, birds, and even a few friendly dogs. Benny loved his city life, but there was one thing he wished for - he wanted to meet other bunnies like him.

One sunny afternoon, Benny noticed a group of children nearby. They were giggling and pointing at a picture book. Being a curious bunny, Benny hopped a little closer. He peeped into the book and saw pictures of bunnies just like him. Benny's heart leaped with joy.

That night, Benny looked around at his new bunny friends, cuddled up in their burrows. He felt a warmth in his heart. He had learned that no matter where you are, you can create your own happiness.

So, my dear little ones, wherever you are, remember, you can always find happiness, just like Benny the Bunny. Now close your eyes, cuddle up, and drift off to dreamland. Good night.`,
      imageUrl: "/characters/bunny.png",
      title: "Benny the City Bunny"
    };

    setStoryData(fakeData);
    setLoading(false);
    
    // Prepare words for highlighting
    const cleanStory = fakeData.story.replace(/\n\n/g, ' ').replace(/\n/g, ' ');
    setWords(cleanStory.split(' '));
  }, []);

  // Generate audio using OpenAI TTS
  // const generateAudio = async () => {
  //   if (!storyData || audioLoading) return;
    
  //   setAudioLoading(true);
    
  //   try {
  //     // Replace with your actual OpenAI API endpoint
  //     const response = await fetch('/api/openai/tts', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         text: storyData.story.replace(/\n\n/g, ' ').replace(/\n/g, ' '),
  //         voice: 'nova', // OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
  //         model: 'tts-1', // or 'tts-1-hd' for higher quality
  //         response_format: 'mp3'
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to generate audio');
  //     }

  //     const audioBlob = await response.blob();
  //     const url = URL.createObjectURL(audioBlob);
  //     setAudioUrl(url);
      
  //     // Load audio to get duration
  //     if (audioRef.current) {
  //       audioRef.current.src = url;
  //       audioRef.current.load();
  //     }
      
  //   } catch (error) {
  //     console.error('Error generating audio:', error);
  //     alert('Failed to generate audio. Please try again.');
  //   } finally {
  //     setAudioLoading(false);
  //   }
  // };

  // Alternative: Direct OpenAI API call (if you have API key on frontend)
  const generateAudio = async () => {
    if (!storyData || audioLoading) return;
    
    setAudioLoading(true);
    
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_APP_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: storyData.story.replace(/\n\n/g, ' ').replace(/\n/g, ' '),
          voice: 'nova',
          response_format: 'mp3',
          speed:0.9
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      console.log('Generated audio :',response);
      setAudioUrl(url);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
      
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Failed to generate audio. Please check your API key.');
    } finally {
      setAudioLoading(false);
    }
  };

  // Calculate word timing based on audio progress
  const calculateWordTiming = () => {
    if (!audioDuration || !words.length) return;
    
    // Estimate words per second
    const wordsPerSecond = words.length / audioDuration;
    const currentWordIndex = Math.floor(currentTime * wordsPerSecond);
    
    setCurrentWordIndex(Math.min(currentWordIndex, words.length - 1));
  };

  // Audio event handlers
  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      calculateWordTiming();
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    setCurrentTime(0);
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  // Playback controls
  const startReading = async () => {
    if (!audioUrl) {
      await generateAudio(); // Use generateAudioDirect() if using direct API
      return;
    }
    
    if (audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const pauseReading = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stopReading = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentWordIndex(-1);
    setCurrentTime(0);
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `${storyData.title || 'story'}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [audioUrl]);

  const renderStoryWithHighlighting = (story) => {
    const paragraphs = story.split('\n\n');
    let globalWordIndex = 0;
    
    return paragraphs.map((paragraph, paraIndex) => {
      const paraWords = paragraph.split(' ');
      const highlightedParagraph = paraWords.map((word, wordIndex) => {
        const isCurrentWord = globalWordIndex === currentWordIndex;
        const isReadWord = globalWordIndex < currentWordIndex;
        
        globalWordIndex++;
        
        return (
          <span
            key={`${paraIndex}-${wordIndex}`}
            className={`story-word ${
              isCurrentWord ? 'current-word' : 
              isReadWord ? 'read-word' : 'unread-word'
            }`}
          >
            {word}{' '}
          </span>
        );
      });
      
      return <p key={paraIndex}>{highlightedParagraph}</p>;
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="story-loading">Loading your magical story...</div>;
  }

  if (!storyData) {
    return (
      <div className="story-error">
        Oops! Failed to load story. Please try again.
      </div>
    );
  }

  const { metadata, story, imageUrl, title } = storyData;

  return (
    <div className="rendered-story-container">
      <div className="story-header">
        <h1>{title || "Your Magical Story"}</h1>
        <p>
          Character: {metadata.character} | Theme: {metadata.theme} | Setting:{" "}
          {metadata.setting}
        </p>
      </div>

      <div className="story-illustration">
        <img src={imageUrl} alt="Story Illustration" />
      </div>

      {/* OpenAI TTS Controls */}
      <div className="read-aloud-controls">
        {!audioUrl ? (
          <button
            onClick={() => generateAudio()} // Use generateAudioDirect() if using direct API
            className="read-control-btn generate-audio"
            disabled={audioLoading}
          >
            {audioLoading ? (
              <>⏳ Generating Audio...</>
            ) : (
              <>🎵 Generate Audio</>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={isPlaying ? pauseReading : startReading}
              className={`read-control-btn ${isPlaying ? 'playing' : ''}`}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Play Story'}
            </button>
            
            <button
              onClick={stopReading}
              className="read-control-btn"
              disabled={!isPlaying && currentTime === 0}
            >
              <Square size={16} />
              Stop
            </button>

            <button
              onClick={downloadAudio}
              className="read-control-btn download-btn"
              title="Download Audio"
            >
              <Download size={16} />
              Download
            </button>
          </>
        )}

        {isPlaying && audioDuration > 0 && (
          <div className="reading-progress">
            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(audioDuration)}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(currentTime / audioDuration) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        style={{ display: 'none' }}
      />

      <div className="story-text">
        {renderStoryWithHighlighting(story)}
      </div>
      
      <button onClick={onBackToSettings} className="back-btn">
        Back to story settings
      </button>
    </div>
  );
};

export default StoryRenderingView;

/** @ai-generated 
Base code of this component was AI generated
Tool: ChatGPT
Link: https://chatgpt.com/share/683cc78b-78ac-8002-b4ee-7ab15bd48502
Prompt, short version: "I need to create a StoryRenderingView component. Code it based on this info from the backend developer (I am responsible for the frontend part)" 
Generated on: 2025-06-01
Modified by: Tetiana Korchynska
Modifications: made changes in css mainly, added OpenAI TTS integration with word highlighting
Verified: Yes, the code met my expectations */