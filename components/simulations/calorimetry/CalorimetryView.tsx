import React from 'react';
import ThermalStudioView from '../thermalStudio/ThermalStudioView';

interface CalorimetryViewProps {
  onBack: () => void;
}

export const CalorimetryView: React.FC<CalorimetryViewProps> = ({ onBack }) => {
  return <ThermalStudioView onBack={onBack} />;
};

export default CalorimetryView;
