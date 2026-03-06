export const LIGHT_BAD_WORDS = [
    'aptal', 'gerizekalı', 'salak', 'manyak', 'enayi', 'mal', 'sapık', 'ergen',
    'stupid', 'idiot', 'fool', 'dumb'
];

export const HEAVY_BAD_WORDS = [
    'ananı', 'avradını', 'sik', 'göt', 'oç', 'piç', 'yavşak', 'amk', 'aq', 'oğlan', 'kahpe',
    'fuck', 'shit', 'bitch', 'asshole', 'dick', 'bastard'
];

export function filterProfanity(text: string): { censoredText: string, hasHeavyProfanity: boolean } {
    let censoredText = text;
    let hasHeavyProfanity = false;

    // Check and censor heavy bad words (requires admin approval)
    HEAVY_BAD_WORDS.forEach(word => {
        // Use word boundaries for short heavy words to avoid false positives
        const regex = word.length <= 3
            ? new RegExp(`\\b${word}\\b`, 'gi')
            : new RegExp(word, 'gi');

        if (regex.test(censoredText)) {
            hasHeavyProfanity = true;
            censoredText = censoredText.replace(regex, '*'.repeat(word.length));
        }
    });

    // Censor light bad words (replaces with ***)
    LIGHT_BAD_WORDS.forEach(word => {
        // Use word boundaries for short words like 'mal' to avoid censoring 'normal'
        const regex = word.length <= 3
            ? new RegExp(`\\b${word}\\b`, 'gi')
            : new RegExp(word, 'gi');

        censoredText = censoredText.replace(regex, '***');
    });

    return { censoredText, hasHeavyProfanity };
}
