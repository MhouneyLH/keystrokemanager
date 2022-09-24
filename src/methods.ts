import * as vscode from 'vscode';

import { KEYSTROKE_DEFAULT_VALUE,
         KEYBOARD_ICON, FIRST_ICON, SECOND_ICON, THIRD_ICON } from "./constants";
import { statusBarItem, pressedKeyMap, amountsOfKeystrokes, wpmWords, wordsPerMinute } from "./extension";

export function updateStatusBarItem(event: vscode.TextDocumentChangeEvent): void {
	// the last check is because of the first change in the document at the beginning 
	// -> counted instantly to 2 before
	if(event &&
	   event.contentChanges &&
	   event.contentChanges[0].text !== undefined) {
		amountsOfKeystrokes.forEach((value, key, map) => map.set(key, value + 1));	
		statusBarItem.text = `${KEYBOARD_ICON} Keystrokes: ${amountsOfKeystrokes.get('total')} | ${wordsPerMinute} WPM`;

		collectPressedKey(event);
	}
}

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

export const printMostOftenPressedKeysMessage = (keyMap: Map<string, number>) => {
	const messageBeginning = new String('You pressed');
	let result = messageBeginning;

	// @todo: beautify this code-piece!!! disgusting!
	const placementIcons = new Map<number, string>([
		[1, FIRST_ICON],
		[2, SECOND_ICON],
		[3, THIRD_ICON],
	]);
	let placement = 1;
	
	keyMap.forEach((value, key, map) => {
		const placementLine = new String(` ${placementIcons.get(placement++)} '${key}' ${value} times`);
		result += placementLine.toString();
	});
	result += '!';

	return result.toString();
}

export const getPraisingWord = () => {
	const WORDS = ['Awesome', 'Wonderful', 'Great', 'Fantastic', 'Cool'];
	return WORDS[Math.floor(Math.random() * WORDS.length)];
};

export const resetOneAmountOfKeystrokes = (key: string) => {
	amountsOfKeystrokes.set(key, KEYSTROKE_DEFAULT_VALUE);
};

export const getAverageWordsPerMinute = () => {
    const keystrokesPerSecond = amountsOfKeystrokes.get('second');
    if(keystrokesPerSecond === undefined) {
        return 0;
    }

    // keystrokesPerSecond / 5 -> one word is on average 5 chars long
    // [...] * 60 -> estimation, that this rate is for the next 60 seconds
    const tempWordsPerMinute = (keystrokesPerSecond / 5) * 60;
    if(wpmWords.length === 60) {
        wpmWords.shift();
    }
    wpmWords.push(tempWordsPerMinute);

    return wpmWords.reduce((prev, curr) => prev + curr) / wpmWords.length;        
};