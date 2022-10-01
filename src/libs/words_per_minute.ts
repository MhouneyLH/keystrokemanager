const wordsPerMinuteEstimations = new Array<number>();

// calculates a wpm-value based on an array, that remembers every value of the last 60 seconds
export function getAverageWordsPerMinute(keystrokes: Map<string, number>): number {
    const keystrokesPerSecond = keystrokes.get('second');
    if(keystrokesPerSecond === undefined) {
        return 0;
    }

    const wordsPerMinuteEstimation = getEstimatedWordsPerMinuteBasedOnOneSecond(keystrokesPerSecond);
    handleWordsPerMinuteEstimations(wordsPerMinuteEstimation);

    const averageWordsPerMinute = wordsPerMinuteEstimations.reduce((prev, curr) => prev + curr) / wordsPerMinuteEstimations.length;
    const roundedAverageWordsPerMinute = Number(averageWordsPerMinute.toFixed(2));
    
    return roundedAverageWordsPerMinute;
}

// calculates an estimation for the whole minute based on the second
// keystrokesPerSecond / 5 -> one word is on average 5 chars long
// [...] * 60 -> estimation, that this rate is for the next 60 seconds
export function getEstimatedWordsPerMinuteBasedOnOneSecond(keystrokesPerSecond: number): number {    
    return (keystrokesPerSecond / 5) * 60;
}

// checks if there are too much estimations in the array
// -> only allowed to keep the last 60 seconds
export function handleWordsPerMinuteEstimations(estimation: number): void {
    const REMEMBER_COUNT = 60;

    if(wordsPerMinuteEstimations.length === REMEMBER_COUNT) {
        wordsPerMinuteEstimations.shift();
    }
    wordsPerMinuteEstimations.push(estimation);
}