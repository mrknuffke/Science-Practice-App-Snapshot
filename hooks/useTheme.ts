import { useMemo } from 'react';
import { CourseType, SubjectType } from '../types';

export interface Theme {
  primary: string;
  hover: string;
  light: string;
  border: string;
  text: string;
  textLight: string;
  accent: string;
  dark: string;
  icon: string;
}

export const getSubject = (course: CourseType | null): SubjectType => {
  if (!course) return 'Biology'; // Default
  if (course === 'Custom Practice') return 'Custom';
  if (course.includes('Elementary School')) return 'Elementary School';
  if (course.includes('Chemistry')) return 'Chemistry';
  if (course.includes('Physics') && !course.includes('Physical Science')) return 'Physics';
  if (course.includes('Environmental')) return 'Environmental';
  if (course.includes('Middle School')) return 'Middle School';
  if (['Physical Science', 'Anatomy and Physiology', 'Marine Biology', 'Biotechnology', 'Forensic Science'].includes(course)) return 'Elective';
  return 'Biology';
};

export const getTheme = (subject: SubjectType): Theme => {
  switch (subject) {
    case 'Custom':
      return {
        primary: 'bg-lavender text-slate-900',
        hover: 'hover:bg-indigo-400 dark:hover:bg-indigo-500',
        light: 'bg-indigo-50/50 dark:bg-indigo-950/20',
        border: 'border-indigo-100 dark:border-indigo-950/50',
        text: 'text-indigo-800 dark:text-indigo-300',
        textLight: 'text-indigo-600 dark:text-indigo-400',
        accent: 'border-lavender',
        dark: 'bg-indigo-950/40',
        icon: '✨'
      };
    case 'Chemistry':
      return {
        primary: 'bg-skyBlue text-slate-900',
        hover: 'hover:bg-sky-400 dark:hover:bg-sky-500',
        light: 'bg-sky-50/50 dark:bg-sky-950/20',
        border: 'border-sky-100 dark:border-sky-950/50',
        text: 'text-sky-800 dark:text-sky-300',
        textLight: 'text-sky-600 dark:text-sky-400',
        accent: 'border-skyBlue',
        dark: 'bg-sky-950/40',
        icon: '⚗️'
      };
    case 'Physics':
      return {
        primary: 'bg-coral text-white',
        hover: 'hover:bg-rose-400 dark:hover:bg-rose-500',
        light: 'bg-rose-50/50 dark:bg-rose-950/20',
        border: 'border-rose-100 dark:border-rose-950/50',
        text: 'text-rose-800 dark:text-rose-300',
        textLight: 'text-rose-600 dark:text-rose-400',
        accent: 'border-coral',
        dark: 'bg-rose-950/40',
        icon: '⚛️'
      };
    case 'Environmental':
      return {
        primary: 'bg-teal-500 text-white',
        hover: 'hover:bg-teal-600 dark:hover:bg-teal-700',
        light: 'bg-teal-50/50 dark:bg-teal-950/20',
        border: 'border-teal-100 dark:border-teal-950/50',
        text: 'text-teal-800 dark:text-teal-300',
        textLight: 'text-teal-600 dark:text-teal-400',
        accent: 'border-teal-500',
        dark: 'bg-teal-950/40',
        icon: '🌍'
      };
    case 'Middle School':
      return {
        primary: 'bg-amber-500 text-white',
        hover: 'hover:bg-amber-600 dark:hover:bg-amber-700',
        light: 'bg-amber-50/50 dark:bg-amber-950/20',
        border: 'border-amber-100 dark:border-amber-950/50',
        text: 'text-amber-800 dark:text-amber-300',
        textLight: 'text-amber-600 dark:text-amber-400',
        accent: 'border-amber-500',
        dark: 'bg-amber-950/40',
        icon: '🎒'
      };
    case 'Elementary School':
      return {
        primary: 'bg-orange-500 text-white',
        hover: 'hover:bg-orange-600 dark:hover:bg-orange-700',
        light: 'bg-orange-50/50 dark:bg-orange-950/20',
        border: 'border-orange-100 dark:border-orange-950/50',
        text: 'text-orange-800 dark:text-orange-300',
        textLight: 'text-orange-600 dark:text-orange-400',
        accent: 'border-orange-500',
        dark: 'bg-orange-950/40',
        icon: '🌟'
      };
    case 'Elective':
      return {
        primary: 'bg-slate-600 text-white',
        hover: 'hover:bg-slate-700 dark:hover:bg-slate-800',
        light: 'bg-slate-50/50 dark:bg-slate-900/20',
        border: 'border-slate-100 dark:border-slate-950/50',
        text: 'text-slate-800 dark:text-slate-300',
        textLight: 'text-slate-600 dark:text-slate-400',
        accent: 'border-slate-500',
        dark: 'bg-slate-950/40',
        icon: '🔬'
      };
    default: // Biology
      return {
        primary: 'bg-mint text-slate-900',
        hover: 'hover:bg-emerald-400 dark:hover:bg-emerald-500',
        light: 'bg-emerald-50/50 dark:bg-emerald-950/20',
        border: 'border-emerald-100 dark:border-emerald-950/50',
        text: 'text-emerald-800 dark:text-emerald-300',
        textLight: 'text-emerald-600 dark:text-emerald-400',
        accent: 'border-mint',
        dark: 'bg-emerald-950/40',
        icon: '🧬'
      };
  }
};;

/**
 * Hook to get theme colors based on the selected course
 * @param selectedCourse - The currently selected course
 * @returns Theme object with color classes and subject information
 */
export const useTheme = (selectedCourse: CourseType | null) => {
  const subject = useMemo(() => getSubject(selectedCourse), [selectedCourse]);
  const theme = useMemo(() => getTheme(subject), [subject]);

  return { subject, theme };
};
