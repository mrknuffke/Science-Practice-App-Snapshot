import { describe, it, expect } from 'vitest';
import {
  getAllTopicsForCourse,
  getRandomTopicForCourse,
  getRandomCourseAndTopic,
} from '../../constants';

describe('random topic helpers in constants.ts', () => {
  it('extracts topics for AP Biology', () => {
    const topics = getAllTopicsForCourse('AP Biology');
    expect(topics.length).toBeGreaterThan(10);
    expect(topics).toContain('Structure of Water and Hydrogen Bonding');
  });

  it('extracts topics for AP Chemistry and General Chemistry', () => {
    const apChem = getAllTopicsForCourse('AP Chemistry');
    expect(apChem.length).toBeGreaterThan(10);

    const genChem = getAllTopicsForCourse('General Chemistry');
    expect(genChem.length).toBeGreaterThan(10);
    expect(genChem).toContain('The Periodic Table and Trends');
  });

  it('getRandomTopicForCourse returns a member of that course topic list', () => {
    const topic = getRandomTopicForCourse('AP Physics 1');
    expect(topic).not.toBeNull();
    const all = getAllTopicsForCourse('AP Physics 1');
    expect(all).toContain(topic);
  });

  it('getRandomCourseAndTopic picks a valid course and topic pair', () => {
    const pair = getRandomCourseAndTopic(['AP Biology', 'General Chemistry']);
    expect(pair).not.toBeNull();
    expect(['AP Biology', 'General Chemistry']).toContain(pair!.course);
    const topics = getAllTopicsForCourse(pair!.course);
    expect(topics).toContain(pair!.topic);
  });

  it('handles empty candidates gracefully', () => {
    const pair = getRandomCourseAndTopic([]);
    expect(pair).toBeNull();
  });
});
