/* global SpeechSynthesisVoice */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  cleanTextForSpeech,
  scoreVoice,
  getBestVoice,
  getAvailableNaturalVoices,
  chunkTextIntoSentences,
  getStoredTTSSettings,
  setStoredTTSSettings,
  DEFAULT_RATE
} from '../speech';

describe('speech utilities', () => {
  describe('cleanTextForSpeech', () => {
    it('handles null, undefined, or empty string safely', () => {
      expect(cleanTextForSpeech(null)).toBe('');
      expect(cleanTextForSpeech(undefined)).toBe('');
      expect(cleanTextForSpeech('')).toBe('');
    });

    it('strips HTML tags and preserves sentence breaks from paragraphs', () => {
      const input = '<p>What is the rate of reaction?</p><p>Option A: It doubles.</p>';
      const output = cleanTextForSpeech(input);
      expect(output).not.toContain('<p>');
      expect(output).not.toContain('</p>');
      expect(output).toBe('What is the rate of reaction? Option A: It doubles.');
    });

    it('converts chemical formulas with <sub> tags to spaced readable speech', () => {
      const input = 'Calculate the moles of H<sub>2</sub>O and CO<sub>2</sub> produced.';
      const output = cleanTextForSpeech(input);
      expect(output).not.toContain('<sub>');
      expect(output).toContain('H 2 O');
      expect(output).toContain('CO 2');
    });

    it('converts Unicode subscript digits in chemical formulas', () => {
      const input = 'The combustion of CH₄ produces CO₂ and H₂O.';
      const output = cleanTextForSpeech(input);
      expect(output).toContain('CH 4');
      expect(output).toContain('CO 2');
      expect(output).toContain('H 2 O');
    });

    it('converts ionic charges with <sup> tags and Unicode', () => {
      const input = 'Ca<sup>2+</sup> reacts with 2 Cl<sup>-</sup> to form CaCl2.';
      const output = cleanTextForSpeech(input);
      expect(output).not.toContain('<sup>');
      expect(output).toContain('Ca 2 plus');
      expect(output).toContain('Cl minus');
    });

    it('converts scientific symbols and Greek letters to spoken English', () => {
      const input = 'The change in enthalpy ΔH is negative, so the reaction at 25 °C is exothermic.';
      const output = cleanTextForSpeech(input);
      expect(output).toContain('delta H');
      expect(output).toContain('25 degrees Celsius');
      expect(output).not.toContain('Δ');
      expect(output).not.toContain('°C');
    });

    it('converts equilibrium and reaction arrows', () => {
      const input = 'N₂ + 3H₂ ⇌ 2NH₃';
      const output = cleanTextForSpeech(input);
      expect(output).toContain('is in equilibrium with');
    });

    it('converts scientific units cleanly', () => {
      const input = 'The energy released is 450 kJ/mol with velocity 9.8 m/s² in 250 mL of water.';
      const output = cleanTextForSpeech(input);
      expect(output).toContain('450 kilojoules per mole');
      expect(output).toContain('9.8 meters per second squared');
      expect(output).toContain('250 milliliters');
    });

    it('strips markdown formatting syntax cleanly', () => {
      const input = '**Key Concept:** The reaction is *spontaneous* because `ΔG < 0`.';
      const output = cleanTextForSpeech(input);
      expect(output).not.toContain('**');
      expect(output).not.toContain('*');
      expect(output).not.toContain('`');
      expect(output).toContain('Key Concept: The reaction is spontaneous because delta G');
    });
  });

  describe('scoreVoice', () => {
    it('penalizes non-English voices', () => {
      const spanishVoice = { name: 'Mónica', lang: 'es-ES' } as SpeechSynthesisVoice;
      expect(scoreVoice(spanishVoice)).toBeLessThan(0);
    });

    it('penalizes known robotic legacy voices', () => {
      const fredVoice = { name: 'Fred', lang: 'en-US' } as SpeechSynthesisVoice;
      const zarvoxVoice = { name: 'Zarvox', lang: 'en-US' } as SpeechSynthesisVoice;
      expect(scoreVoice(fredVoice)).toBeLessThan(0);
      expect(scoreVoice(zarvoxVoice)).toBeLessThan(0);
    });

    it('gives high scores to natural online voices', () => {
      const naturalVoice = {
        name: 'Microsoft Jenny Online (Natural) - English (United States)',
        lang: 'en-US'
      } as SpeechSynthesisVoice;
      expect(scoreVoice(naturalVoice)).toBeGreaterThan(100);
    });

    it('gives high scores to Google Chrome and Apple enhanced voices', () => {
      const googleVoice = { name: 'Google US English', lang: 'en-US' } as SpeechSynthesisVoice;
      const samanthaEnhanced = { name: 'Samantha (Enhanced)', lang: 'en-US' } as SpeechSynthesisVoice;

      expect(scoreVoice(googleVoice)).toBeGreaterThan(70);
      expect(scoreVoice(samanthaEnhanced)).toBeGreaterThan(80);
    });
  });

  describe('getBestVoice & getAvailableNaturalVoices', () => {
    const mockVoices = [
      { name: 'Fred', lang: 'en-US', voiceURI: 'fred-uri' },
      { name: 'Google US English', lang: 'en-US', voiceURI: 'google-us' },
      { name: 'Microsoft Jenny Online (Natural)', lang: 'en-US', voiceURI: 'ms-jenny' },
      { name: 'Jorge', lang: 'es-ES', voiceURI: 'jorge-es' },
    ] as SpeechSynthesisVoice[];

    it('selects the highest scoring natural voice by default', () => {
      const best = getBestVoice(mockVoices);
      expect(best?.name).toBe('Microsoft Jenny Online (Natural)');
    });

    it('honors user preferred voiceURI if present in available voices', () => {
      const best = getBestVoice(mockVoices, 'google-us');
      expect(best?.name).toBe('Google US English');
    });

    it('filters out negative-scoring voices in getAvailableNaturalVoices', () => {
      const available = getAvailableNaturalVoices(mockVoices);
      const names = available.map(v => v.name);
      expect(names).toContain('Microsoft Jenny Online (Natural)');
      expect(names).toContain('Google US English');
      expect(names).not.toContain('Fred');
      expect(names).not.toContain('Jorge');
    });
  });

  describe('chunkTextIntoSentences', () => {
    it('returns empty array for empty text', () => {
      expect(chunkTextIntoSentences('')).toEqual([]);
    });

    it('leaves single short sentences as one chunk', () => {
      const text = 'This is a single short sentence.';
      expect(chunkTextIntoSentences(text)).toEqual([text]);
    });

    it('splits multiple sentences cleanly', () => {
      const text = 'First sentence. Second sentence! Third sentence?';
      const chunks = chunkTextIntoSentences(text);
      expect(chunks.length).toBe(3);
      expect(chunks[0]).toBe('First sentence.');
      expect(chunks[1]).toBe('Second sentence!');
      expect(chunks[2]).toBe('Third sentence?');
    });
  });

  describe('TTS Settings persistence', () => {
    let mockStorage: Record<string, string> = {};

    beforeEach(() => {
      mockStorage = {};
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key: string) => mockStorage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
        removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
        clear: vi.fn(() => { mockStorage = {}; }),
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('returns default settings when nothing is stored', () => {
      const settings = getStoredTTSSettings();
      expect(settings.voiceUri).toBeNull();
      expect(settings.rate).toBe(DEFAULT_RATE);
    });

    it('persists and retrieves updated settings', () => {
      setStoredTTSSettings({ voiceUri: 'test-voice', rate: 1.1 });
      const settings = getStoredTTSSettings();
      expect(settings.voiceUri).toBe('test-voice');
      expect(settings.rate).toBe(1.1);
    });
  });
});
