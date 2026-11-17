import React from 'react';
import { smartFormatScienceText } from '../../utils/sanitize';

/**
 * Component to render HTML with scientific text formatting
 */
export const RenderHTML: React.FC<{ text: string }> = ({ text }) => (
  <span
    className="block whitespace-pre-wrap"
    dangerouslySetInnerHTML={{ __html: smartFormatScienceText(text) }}
  />
);
