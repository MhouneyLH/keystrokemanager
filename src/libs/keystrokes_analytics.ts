import * as vscode from 'vscode';

import { KEYSTROKE_DEFAULT_VALUE,
         FIRST_ICON, SECOND_ICON, THIRD_ICON, } from "../constants";

// todo: using interfaces instead of maps
// interface für Datenstruktur von map verwenden
// damit kann ich das auch in json speichern
// test = {
// 	key: 5;
// };
// test['key'];

export const amountsOfKeystrokes = new Map<string, number>([
    ['second', KEYSTROKE_DEFAULT_VALUE],
    ['minute', KEYSTROKE_DEFAULT_VALUE],
    ['hour', KEYSTROKE_DEFAULT_VALUE],
    ['day', KEYSTROKE_DEFAULT_VALUE],
    ['week', KEYSTROKE_DEFAULT_VALUE],
    ['month', KEYSTROKE_DEFAULT_VALUE],
    ['year', KEYSTROKE_DEFAULT_VALUE],
    ['total', KEYSTROKE_DEFAULT_VALUE],
]);
const pressedKeys = new Map<string, number>();

// message for the keystrokeCountAnalyticsCommand
export function getKeystrokeCountAnalyticsMessage(): string {
    const keystrokes = amountsOfKeystrokes;
    const message = `You collected so far ${keystrokes.get('total')} keystrokes in total.
					${keystrokes.get('year')} of them this year, 
					${keystrokes.get('month')} this month, 
					${keystrokes.get('week')} this week, 
					${keystrokes.get('day')} today, 
					${keystrokes.get('hour')} this hour and 
					${keystrokes.get('minute')} this minute!`;

    return message;
}

// message for the mostOftenPressedKeysCommand
export function getMostOftenPressedKeysMessage(keyMap: Map<string, number>): string {
	var message = 'You pressed ';

	const placementIcons = [ FIRST_ICON, SECOND_ICON, THIRD_ICON ];
    let placement = 1;
	
    // todo map.iterator    

	keyMap.forEach((value, key) => {
		message += `${placementIcons[placement]} '${key}' ${value} times `;
        placement++;
	});

	return message.toString();
}

// increments the count of the pressed key
export function collectPressedKey(event: vscode.TextDocumentChangeEvent): void {
	const pressedKey = event.contentChanges[0].text;
	const prevCount = pressedKeys.get(pressedKey) ?? KEYSTROKE_DEFAULT_VALUE;

	pressedKeys.set(pressedKey, prevCount + 1);
}

// takes the 3 keys, that have the highest count and returns them
export function getThreeMostOftenPressedKeys(): Map<string, number> {
	const pressedKeysSortedDescending = new Map([...pressedKeys].sort((prev, curr) => prev[1] - curr[1]).reverse());

	const targetSize = 3;
	const mostOftenPressedKeys = new Map([...pressedKeysSortedDescending].slice(0, targetSize));

	return mostOftenPressedKeys;
}

// the count of every map-item is incremented
export function incrementKeystrokesOfEveryTimespan(): void {
	amountsOfKeystrokes.forEach((value, key, map) => map.set(key, value + 1));	
}

// the count of one specific map-item is resetted based on the key
export function resetOneTimespanKeystrokesAmount(key: string): void {
	amountsOfKeystrokes.set(key, KEYSTROKE_DEFAULT_VALUE);
}
