import type { Content } from '@google/genai';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMascotAdvisorResponse } from '../ai/tutor';
import * as coreAI from '../ai/core';

describe('getMascotAdvisorResponse', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('includes conversation history when provided', async () => {
    const callAISpy = vi.spyOn(coreAI, 'callAI').mockResolvedValue({
      text: "Great! Let's practice with [quiz]! [[METADATA: {\"course\": \"AP Biology\", \"topic\": \"Photosynthesis\"}]]"
    });

    const history = [
      { role: 'user', text: 'Hi, I need help studying biology.' },
      { role: 'model', text: 'Hello! What topic in biology are you working on?' }
    ];

    const result = await getMascotAdvisorResponse(
      'I want to study Photosynthesis for AP Bio',
      'Alex',
      'robot',
      history
    );

    expect(callAISpy).toHaveBeenCalledTimes(1);
    const contents = callAISpy.mock.calls[0][1] as Content[];
    
    // History should be included in contents + the new user prompt
    expect(contents).toHaveLength(3);
    expect(contents[0]).toEqual({ role: 'user', parts: [{ text: 'Hi, I need help studying biology.' }] });
    expect(contents[1]).toEqual({ role: 'model', parts: [{ text: 'Hello! What topic in biology are you working on?' }] });
    expect(contents[2]).toEqual({ role: 'user', parts: [{ text: 'I want to study Photosynthesis for AP Bio' }] });
    
    expect(result).toContain('[quiz]');
  });

  it('works without conversation history (one-shot)', async () => {
    const callAISpy = vi.spyOn(coreAI, 'callAI').mockResolvedValue({
      text: 'Beep boop! Let us check [settings]!'
    });

    const result = await getMascotAdvisorResponse(
      'How do I change dark mode?',
      'Sam',
      'robot'
    );

    expect(callAISpy).toHaveBeenCalledTimes(1);
    const contents = callAISpy.mock.calls[0][1] as Content[];
    expect(contents).toHaveLength(1);
    expect(contents[0]).toEqual({ role: 'user', parts: [{ text: 'How do I change dark mode?' }] });
    expect(result).toBe('Beep boop! Let us check [settings]!');
  });

  it('caps history to last 20 messages', async () => {
    const callAISpy = vi.spyOn(coreAI, 'callAI').mockResolvedValue({
      text: 'Here you go!'
    });

    const longHistory = Array.from({ length: 30 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'model',
      text: `Message ${i}`
    }));

    await getMascotAdvisorResponse(
      'New message',
      'Jordan',
      'plant',
      longHistory
    );

    const contents = callAISpy.mock.calls[0][1] as Content[];
    // 20 from history + 1 current = 21
    expect(contents).toHaveLength(21);
    expect(contents[0].parts?.[0].text).toBe('Message 10');
  });

  it('falls back gracefully on error', async () => {
    vi.spyOn(coreAI, 'callAI').mockRejectedValue(new Error('Network error'));

    const result = await getMascotAdvisorResponse(
      'Hello',
      'Taylor',
      'beaker'
    );

    expect(result).toContain("Let's study some science together!");
  });
});
