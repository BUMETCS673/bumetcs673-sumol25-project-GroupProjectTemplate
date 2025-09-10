import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CounterButton from './CounterButton';

describe('CounterButton', () => {
  it('increments count on button click', () => {
    const { getByRole } = render(<CounterButton />);
    const button = getByRole('button');
    expect(button).toHaveTextContent('Clicked 0 times');
    fireEvent.click(button);
    expect(button).toHaveTextContent('Clicked 1 times');
  });
});
