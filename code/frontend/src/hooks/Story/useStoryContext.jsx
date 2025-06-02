import StoryContext from '../../context/StoryContext';
import { useContext } from 'react';

export const useStoryContext = () => {
  const context = useContext(StoryContext);

  if (!context) {
    throw Error('useStoryContext must be used inside a StoryContextProvider');
  }

  return context;
}

