import Construction from "../../components/Construction/Construction";

// const Contact = () => {
//   return <Construction pageName="Contact" />;
// };

// export default Contact;
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, BookOpen } from 'lucide-react';

const Contact = () => {


  const [story, setStory] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState([]);
  const utteranceRef = useRef(null);
  const timeoutRef = useRef(null);

  const stories = [
    "The old lighthouse keeper climbed the spiral staircase one final time. For forty years, he had guided ships safely to shore through fog and storm. Tonight, the automated beacon would take over his duty. As he reached the top, memories flooded back - the merchant vessel he saved during the hurricane of '98, the grateful fishermen who brought him fresh catch, the children who visited during summer tours. He lit the great lamp manually, watching its beam sweep across the dark ocean. A ship's horn echoed in the distance, three long blasts - the traditional sailor's farewell. Tears mixed with salt air as he descended, knowing his lighthouse would still protect travelers, but his watch had ended. The next morning, townspeople found a small plaque by the door: 'Thank you for bringing us all home safely.' The keeper had vanished with the dawn, but locals swear they sometimes see a figure in the lamp room during the fiercest storms, still watching over those who brave the treacherous waters. The lighthouse continues its eternal vigil, automated but somehow still carrying the spirit of the man who devoted his life to others' safe passage through the darkness.",

    "Maria discovered the peculiar garden behind her grandmother's house after the funeral. Overgrown with weeds, it seemed abandoned until she noticed something extraordinary - every plant grew in perfect geometric patterns. Roses formed spirals, sunflowers arranged in hexagons, and ivy traced mathematical equations along the fence. Her grandmother's journal revealed the secret: each seed was planted during moments of intense emotion. Joy created the cheerful marigolds, sorrow birthed the weeping willows, and love manifested as intertwining morning glories. The garden was a living map of her grandmother's feelings throughout sixty years of marriage. Maria began tending it, adding her own plantings. When she felt lonely, she sowed forget-me-nots. During anxious nights, she planted calming lavender. The garden responded, creating new patterns that seemed to anticipate her needs. Neighbors began visiting, drawn by the unusual beauty and inexplicable sense of peace. Without knowing the secret, they would sit among the plants and leave feeling somehow understood. Maria realized her grandmother had created more than a garden - she had grown a sanctuary where human emotions could take root and flourish, connecting generations through the universal language of growing things and the soil that holds our deepest feelings.",

    "The antique music box played a melody no one could identify. Thomas inherited it from his great-aunt's estate, along with a cryptic note: 'Wind it only when you need to remember.' Curious, he turned the tiny key, and the delicate ballerina began to spin. The haunting tune filled his apartment, and suddenly he was eight years old again, standing in his great-aunt's parlor, watching her demonstrate the very same music box. But this memory was impossible - he had never visited her house as a child. More visions followed: family gatherings he had never attended, conversations with relatives he had never met, holidays celebrated in rooms he had never seen. Each time he wound the music box, new memories surfaced, all feeling absolutely real yet completely foreign. Research revealed the truth: his great-aunt had been documenting family history through an old recording technique, somehow embedding experiences into the music box's mechanism. The melody was a key that unlocked stored memories, preserved moments from generations of his family. Thomas realized he wasn't just inheriting an antique - he was receiving his entire family's legacy, their joys and sorrows crystallized in song, waiting for someone to wind the key and remember what had been forgotten, connecting past and present through the mysterious power of music and memory."
  ];

  const generateStory = () => {
    const randomStory = stories[Math.floor(Math.random() * stories.length)];
    setStory(randomStory);
    setWords(randomStory.split(' '));
    setCurrentWordIndex(-1);
    setIsPlaying(false);
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }
  };

  const startReading = () => {
    if (!story) return;
    
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(story);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utteranceRef.current = utterance;
    
    // Calculate approximate timing for word highlighting
    const wordsPerMinute = 150;
    const millisecondsPerWord = (60 / wordsPerMinute) * 1000;
    
    let wordIndex = 0;
    const highlightWords = () => {
      if (wordIndex < words.length && isPlaying) {
        setCurrentWordIndex(wordIndex);
        wordIndex++;
        timeoutRef.current = setTimeout(highlightWords, millisecondsPerWord);
      } else {
        setCurrentWordIndex(-1);
        setIsPlaying(false);
      }
    };

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentWordIndex(0);
      setTimeout(highlightWords, millisecondsPerWord);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
      clearTimeout(timeoutRef.current);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
      clearTimeout(timeoutRef.current);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseReading = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
    clearTimeout(timeoutRef.current);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    generateStory();
    
    return () => {
      window.speechSynthesis.cancel();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '24px',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      padding: '32px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    headerTitle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1a1a1a',
      margin: '0 0 0 12px'
    },
    subtitle: {
      color: '#666',
      fontSize: '16px',
      margin: 0
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      marginBottom: '32px',
      flexWrap: 'wrap'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      minWidth: '120px',
      justifyContent: 'center'
    },
    buttonNew: {
      backgroundColor: '#3f51b5',
      color: 'white'
    },
    buttonNewHover: {
      backgroundColor: '#303f9f'
    },
    buttonPlay: {
      backgroundColor: '#4caf50',
      color: 'white'
    },
    buttonPlayHover: {
      backgroundColor: '#388e3c'
    },
    buttonStop: {
      backgroundColor: '#f44336',
      color: 'white'
    },
    buttonStopHover: {
      backgroundColor: '#d32f2f'
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    },
    storyContainer: {
      backgroundColor: '#f5f5f5',
      borderRadius: '12px',
      padding: '24px',
      lineHeight: '1.8',
      fontSize: '18px',
      marginBottom: '24px'
    },
    word: {
      transition: 'all 0.2s ease'
    },
    currentWord: {
      backgroundColor: '#ffeb3b',
      color: '#1a1a1a',
      padding: '2px 4px',
      borderRadius: '4px',
      fontWeight: '600',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    readWord: {
      color: '#999'
    },
    unreadWord: {
      color: '#333'
    },
    footer: {
      textAlign: 'center'
    },
    footerText: {
      fontSize: '14px',
      color: '#666',
      margin: 0
    },
    progress: {
      marginLeft: '8px',
      color: '#3f51b5',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <BookOpen size={32} color="#3f51b5" />
            <h1 style={styles.title}>Story Reader</h1>
          </div>
          <p style={styles.subtitle}>Generate a story and listen while the text highlights</p>
        </div>

        <div style={styles.buttonContainer}>
          <button
            onClick={generateStory}
            style={{
              ...styles.button,
              ...styles.buttonNew
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = styles.buttonNewHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = styles.buttonNew.backgroundColor}
          >
            <BookOpen size={20} />
            New Story
          </button>
          
          <button
            onClick={isPlaying ? pauseReading : startReading}
            disabled={!story}
            style={{
              ...styles.button,
              ...(story ? styles.buttonPlay : styles.buttonDisabled)
            }}
            onMouseOver={(e) => {
              if (story) e.target.style.backgroundColor = styles.buttonPlayHover.backgroundColor;
            }}
            onMouseOut={(e) => {
              if (story) e.target.style.backgroundColor = styles.buttonPlay.backgroundColor;
            }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <button
            onClick={stopReading}
            disabled={!isPlaying && currentWordIndex === -1}
            style={{
              ...styles.button,
              ...((isPlaying || currentWordIndex >= 0) ? styles.buttonStop : styles.buttonDisabled)
            }}
            onMouseOver={(e) => {
              if (isPlaying || currentWordIndex >= 0) {
                e.target.style.backgroundColor = styles.buttonStopHover.backgroundColor;
              }
            }}
            onMouseOut={(e) => {
              if (isPlaying || currentWordIndex >= 0) {
                e.target.style.backgroundColor = styles.buttonStop.backgroundColor;
              }
            }}
          >
            <Square size={20} />
            Stop
          </button>
        </div>

        {story && (
          <div style={styles.storyContainer}>
            <div>
              {words.map((word, index) => (
                <span
                  key={index}
                  style={{
                    ...styles.word,
                    ...(index === currentWordIndex ? styles.currentWord :
                        index < currentWordIndex ? styles.readWord : styles.unreadWord)
                  }}
                >
                  {word}{' '}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Word count: {words.length}
            {isPlaying && currentWordIndex >= 0 && (
              <span style={styles.progress}>
                | Reading word {currentWordIndex + 1} of {words.length}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
