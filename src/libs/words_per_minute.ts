var lastWordsPerMinuteValue = 0;
// hier vielleicht so machen, das restliche Sachen mit average aufgefüllt werden
const wpmWords = new Array<number>();

export function getAverageWordsPerMinute(): number {
    const keystrokesPerSecond = amountsOfKeystrokes.get('second');
    if(keystrokesPerSecond === undefined) {
        return 0;
    }

    // keystrokesPerSecond / 5 -> one word is on average 5 chars long
    // [...] * 60 -> estimation, that this rate is for the next 60 seconds
    // @todo: dafür eigene Funktion schreiben mit lokalen Parameter
    const tempWordsPerMinute = (keystrokesPerSecond / 5) * 60;
    if(wpmWords.length === 60) {
        wpmWords.shift();
    }
    wpmWords.push(tempWordsPerMinute);

    const averageWordsPerMinute = wpmWords.reduce((prev, curr) => prev + curr) / wpmWords.length;
    return averageWordsPerMinute;
}