import { useState, useEffect } from 'react';
import { getSimplifiedText } from '../services/ai/tutor';

export const useSimplify = (originalText: string) => {
    const [displayText, setDisplayText] = useState(originalText);
    const [isSimplifying, setIsSimplifying] = useState(false);
    const [isSimplified, setIsSimplified] = useState(false);

    useEffect(() => {
        setDisplayText(originalText);
        setIsSimplified(false);
    }, [originalText]);

    const toggleSimplify = async () => {
        if (isSimplified) {
            setDisplayText(originalText);
            setIsSimplified(false);
            return;
        }

        setIsSimplifying(true);
        try {
            const simple = await getSimplifiedText(originalText);
            if (simple) {
                setDisplayText(simple);
                setIsSimplified(true);
            }
        } catch (e) {
            console.error("Simplification failed", e);
        } finally {
            setIsSimplifying(false);
        }
    };

    return { displayText, isSimplifying, isSimplified, toggleSimplify };
};
