import * as vscode from 'vscode';

import { KEYSTROKE_DEFAULT_VALUE,
         FIRST_ICON, SECOND_ICON, THIRD_ICON, } from "../constants";

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

export function incrementKeystrokes(): void {
	amountsOfKeystrokes.forEach((value, key, map) => map.set(key, value + 1));	
}

export function resetOneAmountOfKeystrokes(key: string): void {
	amountsOfKeystrokes.set(key, KEYSTROKE_DEFAULT_VALUE);
}
