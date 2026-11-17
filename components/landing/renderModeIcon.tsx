import React from 'react';
import { 
  Target, 
  PenTool, 
  BarChart2, 
  Zap, 
  Calculator, 
  Clock, 
  FlaskConical, 
  Camera, 
  Brain, 
  Layers, 
  Gamepad2, 
  Sparkles, 
  Search, 
  MessageSquare,
  Play,
  ClipboardList,
  Network,
  Image as ImageIcon,
  Scale,
  GraduationCap,
  HelpCircle,
  Award
} from 'lucide-react';

export const renderModeIcon = (iconKey: string, className = "w-5 h-5") => {
  switch (iconKey) {
    case 'target': return <Target className={className} />;
    case 'pen-tool': return <PenTool className={className} />;
    case 'bar-chart': return <BarChart2 className={className} />;
    case 'clock': return <Clock className={className} />;
    case 'message-square': return <MessageSquare className={className} />;
    case 'calculator': return <Calculator className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'layers': return <Layers className={className} />;
    case 'brain': return <Brain className={className} />;
    case 'flask': return <FlaskConical className={className} />;
    case 'camera': return <Camera className={className} />;
    case 'search': return <Search className={className} />;
    case 'play': return <Play className={className} />;
    case 'gamepad': return <Gamepad2 className={className} />;
    case 'clipboard-list': return <ClipboardList className={className} />;
    case 'sparkles': return <Sparkles className={className} />;
    case 'network': return <Network className={className} />;
    case 'image': return <ImageIcon className={className} />;
    case 'scale': return <Scale className={className} />;
    case 'graduation-cap': return <GraduationCap className={className} />;
    case 'help-circle': return <HelpCircle className={className} />;
    case 'award': return <Award className={className} />;
    default: return null;
  }
};
