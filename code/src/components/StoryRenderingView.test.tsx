import React from 'react';
import { render, screen } from '@testing-library/react';
import StoryRenderingView from './StoryRenderingView';

describe('StoryRenderingView', () => {
  test('renders with default text', () => {
    render(<StoryRenderingView />);
    const element = screen.getByText(/your personalized story/i);
    expect(element).toBeInTheDocument();
  });

  test('displays story content when props are passed', () => {
    const story = 'Once upon a time in a magical forest...';
    render(<StoryRenderingView storyText={story} />);
    expect(screen.getByText(story)).toBeInTheDocument();
  });
});
