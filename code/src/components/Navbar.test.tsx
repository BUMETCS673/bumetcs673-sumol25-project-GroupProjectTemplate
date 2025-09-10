import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar', () => {
  test('renders logo and navigation links', () => {
    render(<Navbar />);

    // 检查 logo 是否存在
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();

    // 检查链接是否存在
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/about/i)).toBeInTheDocument();
    expect(screen.getByText(/contact/i)).toBeInTheDocument();
  });
});