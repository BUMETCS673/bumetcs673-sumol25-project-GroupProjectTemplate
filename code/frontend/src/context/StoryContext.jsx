import { createContext, useReducer } from "react";

export const StoryContext = createContext();

export const StoryReducer = (state, action) => {
  switch (action.type) {
    case "GENERATE_STORY":
      return {
        ...state,
<<<<<<< HEAD
        generatedStory: [action.payload, ...state.stories],
=======
>>>>>>> origin/main
        stories: [action.payload, ...state.stories],
        loading: false,
        error: null,
      };
<<<<<<< HEAD

    case "GET_STORY":
      return {
        ...state,
        currentStory: action.payload,
        loading: false,
        error: null,
      }
=======
>>>>>>> origin/main
    case "GET_STORIES":
      return {
        ...state,
        stories: action.payload,
        loading: false,
        error: null,
      };

    case "DELETE_STORY":
      return {
        ...state,
        stories: state.stories.filter((story) => story._id !== action.payload),
        loading: false,
        error: null,
      };

    case "TOGGLE_FAVORITE":
      return {
        ...state,
        stories: state.stories.map((story) =>
          story._id === action.payload.id
            ? { ...story, isFavorite: action.payload.isFavorite }
            : story
        ),
        currentStory:
          state.currentStory?._id === action.payload.id
            ? { ...state.currentStory, isFavorite: action.payload.isFavorite }
            : state.currentStory,
      };

<<<<<<< HEAD
=======
    case "INCREMENT_READ_COUNT":
      return {
        ...state,
        stories: state.stories.map((story) =>
          story._id === action.payload
            ? { ...story, readCount: (story.readCount || 0) + 1 }
            : story
        ),
        currentStory:
          state.currentStory?._id === action.payload
            ? {
                ...state.currentStory,
                readCount: (state.currentStory.readCount || 0) + 1,
              }
            : state.currentStory,
      };

   
    
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

>>>>>>> origin/main
    default:
      return state;
  }
};

export const StoryContextProvider = ({ children }) => {
  const initialState = {
<<<<<<< HEAD
    generatedStory: null,
    stories: [],
    currentStory: null,
=======
    stories: [],
    currentStory: null,
    generationParams: {
      characters: [],
      setting: "",
      theme: "",
      ageGroup: "3-5",
      style: "watercolor",
    },
    filters: {
      childId: null,
      theme: "",
      favorites: false,
      page: 1,
      limit: 10,
    },
    stats: {
      totalStories: 0,
      favoriteStories: 0,
      totalReads: 0,
      themes: [],
    },
>>>>>>> origin/main
    loading: false,
    error: null,
  };

  const [state, dispatch] = useReducer(StoryReducer, initialState);

<<<<<<< HEAD
=======

>>>>>>> origin/main
  return (
    <StoryContext.Provider value={{ ...state, dispatch }}>
      {children}
    </StoryContext.Provider>
  );
};
<<<<<<< HEAD
=======


// ============================================

// Example usage in a component:

/*
import { useStoryContext, storyActions } from '../context/StoryContext';

const StoryComponent = () => {
  const { stories, currentStory, loading, error, dispatch } = useStoryContext();

  // Load stories
  const loadStories = async () => {
    dispatch(storyActions.setLoading(true));
    try {
      const response = await fetch('/api/stories');
      const data = await response.json();
      dispatch(storyActions.setStories(data.stories));
    } catch (error) {
      dispatch(storyActions.setError(error.message));
    }
  };

  // Generate new story
  const generateStory = async (params) => {
    dispatch(storyActions.setLoading(true));
    try {
      const response = await fetch('/api/stories/generate-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await response.json();
      dispatch(storyActions.addStory(data.story));
    } catch (error) {
      dispatch(storyActions.setError(error.message));
    }
  };

  // Toggle favorite
  const toggleFavorite = async (storyId) => {
    try {
      const response = await fetch(`/api/stories/${storyId}/favorite`, {
        method: 'PATCH'
      });
      const data = await response.json();
      dispatch(storyActions.toggleFavorite(storyId, data.isFavorite));
    } catch (error) {
      dispatch(storyActions.setError(error.message));
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {stories.map(story => (
        <div key={story._id}>
          <h3>{story.title}</h3>
          <button onClick={() => toggleFavorite(story._id)}>
            {story.isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
      ))}
    </div>
  );
};
*/
>>>>>>> origin/main
