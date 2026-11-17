import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { UniversalInputView } from '../../components/UniversalInputView';
import { AppConfig } from '../../types';

describe('UniversalInputView Multi-Topic Input', () => {
  const mockConfig: AppConfig = {
    difficulty: 'Medium',
    mcqCount: 5,
    saCount: 0,
    errorCount: 0,
  };

  const defaultProps = {
    level: 'High School',
    availableCourses: ['Honors Biology', 'AP Biology'],
    getTopicsForCourse: (course: string) =>
      course === 'Honors Biology'
        ? ['Photosynthesis', 'Cellular Respiration', 'Mitosis', 'DNA Structure']
        : ['Enzyme Kinetics'],
    onBack: vi.fn(),
    onBrowse: vi.fn(),
    config: mockConfig,
    onUpdateConfig: vi.fn(),
    mode: 'quiz',
    onUpdateMode: vi.fn(),
    initialCourse: 'Honors Biology',
    initialTopic: null,
    onStart: vi.fn(),
  };

  it('allows typing spaces between words and commas without dropping them', () => {
    render(<UniversalInputView {...defaultProps} />);

    // Switch to multi-topic mode
    const multiToggle = screen.getByText(/Multiple Topics/i);
    fireEvent.click(multiToggle);

    const textarea = screen.getByPlaceholderText(/Enter topics separated by commas/i) as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();

    // Type first word followed by space
    fireEvent.change(textarea, { target: { value: 'Cellular ' } });
    expect(textarea.value).toBe('Cellular ');

    // Type second word and comma followed by space
    fireEvent.change(textarea, { target: { value: 'Cellular Respiration, ' } });
    expect(textarea.value).toBe('Cellular Respiration, ');

    // Type another multi-word topic
    fireEvent.change(textarea, { target: { value: 'Cellular Respiration, Calvin Cycle' } });
    expect(textarea.value).toBe('Cellular Respiration, Calvin Cycle');

    // Check chips
    expect(screen.getByText('Cellular Respiration')).toBeTruthy();
    expect(screen.getByText('Calvin Cycle')).toBeTruthy();
  });

  it('passes selected topics array to onStart upon launch', () => {
    const onStartMock = vi.fn();
    render(<UniversalInputView {...defaultProps} onStart={onStartMock} />);

    // Switch to multi-topic mode
    fireEvent.click(screen.getByText(/Multiple Topics/i));

    const textarea = screen.getByPlaceholderText(/Enter topics separated by commas/i);
    fireEvent.change(textarea, { target: { value: 'Photosynthesis, Cellular Respiration' } });

    // Launch button
    const launchButton = screen.getByRole('button', { name: /Launch.*2 Topics/i });
    fireEvent.click(launchButton);

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onStartMock).toHaveBeenCalledWith(
      'Honors Biology',
      ['Photosynthesis', 'Cellular Respiration'],
      'quiz'
    );
  });

  it('removes topic when chip remove button is clicked and synchronizes textarea', () => {
    render(<UniversalInputView {...defaultProps} />);

    fireEvent.click(screen.getByText(/Multiple Topics/i));
    const textarea = screen.getByPlaceholderText(/Enter topics separated by commas/i) as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: 'Photosynthesis, Cellular Respiration' } });
    expect(screen.getByText('Photosynthesis')).toBeTruthy();
    expect(screen.getByText('Cellular Respiration')).toBeTruthy();

    // Remove Photosynthesis chip
    const removeButtons = screen.getAllByRole('button', { name: '×' });
    fireEvent.click(removeButtons[0]);

    expect(textarea.value).toBe('Cellular Respiration');
    expect(screen.queryByText('Photosynthesis')).toBeNull();
    expect(screen.getAllByText('Cellular Respiration').length).toBeGreaterThanOrEqual(1);
  });
});
