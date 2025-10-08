import React from "react";
import { Button, ButtonGroup } from "@chakra-ui/react";

interface LanguageToggleProps {
  currentLanguage: string;
  onLanguageChange: (lang: 'en' | 'rw') => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLanguage, onLanguageChange }) => {
  return (
    <ButtonGroup isAttached size="sm" variant="outline">
      <Button
        onClick={() => onLanguageChange('en')}
        colorScheme={currentLanguage === 'en' ? 'green' : 'gray'}
        variant={currentLanguage === 'en' ? 'solid' : 'outline'}
      >
        EN
      </Button>
      <Button
        onClick={() => onLanguageChange('rw')}
        colorScheme={currentLanguage === 'rw' ? 'green' : 'gray'}
        variant={currentLanguage === 'rw' ? 'solid' : 'outline'}
      >
        RW
      </Button>
    </ButtonGroup>
  );
};

export default LanguageToggle;
