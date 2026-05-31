import { useEffect, useState } from 'react';
import Typo from 'typo-js';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useSpellChecker = () => {
    const [dictionary, setDictionary] = useState<Typo | null>(null);

    useEffect(() => {
        const load = async (): Promise<void> => {
            const [aff, dic] = await Promise.all([
                fetch('/dictionaries/en_US.aff').then((r) => r.text()),
                fetch('/dictionaries/en_US.dic').then((r) => r.text()),
            ]);

            setDictionary(
                new Typo('en_US', aff, dic)
            );
        };

        void load();
    }, []);

    return dictionary;
};