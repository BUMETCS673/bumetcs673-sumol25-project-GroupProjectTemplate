<<<<<<< HEAD
import { useContext } from "react";
import { StoryContext } from "../../context/StoryContext";
=======
import StoryContext from '../../context/StoryContext';
import { useContext } from 'react';
>>>>>>> origin/main

export const useStoryContext = () => {
  const context = useContext(StoryContext);

  if (!context) {
<<<<<<< HEAD
    throw new Error("useStoryContext must be used within a StoryContextProvider");
  }

  return context;
};
=======
    throw Error('useStoryContext must be used inside a StoryContextProvider');
  }

  return context;
}

>>>>>>> origin/main
