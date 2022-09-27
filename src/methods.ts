import * as vscode from 'vscode';

import { KEYSTROKE_DEFAULT_VALUE, KEYSTROKE_ERROR_VALUE,
         KEYBOARD_ICON, FIRST_ICON, SECOND_ICON, THIRD_ICON } from "./constants";
import { statusBarItem, pressedKeyMap, amountsOfKeystrokes, wpmWords } from "./extension";

// das file hier aufspalten in mehrere Dateien innerhalb eines Unterordners
var lastWordsPerMinuteValue = 0;

export function updateStatusBarItem(keystrokesValue: number = KEYSTROKE_ERROR_VALUE, wordsPerMinute: number = lastWordsPerMinuteValue): void {
    statusBarItem.text = `${KEYBOARD_ICON} Keystrokes: ${keystrokesValue} | ${wordsPerMinute} WPM`;
    lastWordsPerMinuteValue = wordsPerMinute;
}

export function incrementKeystrokes(): void {
	amountsOfKeystrokes.forEach((value, key, map) => map.set(key, value + 1));	
}

export function isValidChangedContent(event: vscode.TextDocumentChangeEvent): boolean {
    // the last check is because of the first change in the document at the beginning 
	// -> counted instantly to 2 before
    return event &&
           event.contentChanges &&
           event.contentChanges[0].text !== undefined;
};

export function collectPressedKey(event: vscode.TextDocumentChangeEvent): void {
	const pressedKey = event.contentChanges[0].text;
	const prevCount = pressedKeyMap.get(pressedKey) ?? KEYSTROKE_DEFAULT_VALUE;

	pressedKeyMap.set(pressedKey, prevCount + 1);
}

export function getMostOftenPressedKeys(): Map<string, number> {
	const pressedKeysSortedDescending = new Map([...pressedKeyMap].sort((prev, curr) => prev[1] - curr[1]).reverse());

	const targetSize = 3;
	const mostOftenPressedKeys = new Map([...pressedKeysSortedDescending].slice(0, targetSize));

	return mostOftenPressedKeys;
}

export function printMostOftenPressedKeysMessage(keyMap: Map<string, number>): string {
	const messageBeginning = new String('You pressed ');
	let result = messageBeginning;

	const placementIcons = [ FIRST_ICON, SECOND_ICON, THIRD_ICON ];
    let placement = 1;
	
    // map.iterator    

	keyMap.forEach((value, key) => {
		result += `${placementIcons[placement]} '${key}' ${value} times `;
        placement++;
	});

	return result.toString();
};

export function getPraisingWord(): string {
	const WORDS = ['Awesome', 'Wonderful', 'Great', 'Fantastic', 'Cool'];

	return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function resetOneAmountOfKeystrokes(key: string): void {
	amountsOfKeystrokes.set(key, KEYSTROKE_DEFAULT_VALUE);
}

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