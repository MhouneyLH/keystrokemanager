import * as vscode from 'vscode';

import { KEYSTROKE_DEFAULT_VALUE,
         FIRST_ICON, SECOND_ICON, THIRD_ICON, } from "../constants";

export interface IKeystrokeManager {
	second: number;
	minute: number;
	hour: number;
	day: number;
	week: number;
	month: number;
	year: number;
	total: number;
}

export var keystrokeManager: IKeystrokeManager = {
	second: KEYSTROKE_DEFAULT_VALUE,
	minute: KEYSTROKE_DEFAULT_VALUE,
	hour: KEYSTROKE_DEFAULT_VALUE,
	day: KEYSTROKE_DEFAULT_VALUE,
	week: KEYSTROKE_DEFAULT_VALUE,
	month: KEYSTROKE_DEFAULT_VALUE,
	year: KEYSTROKE_DEFAULT_VALUE,
	total: KEYSTROKE_DEFAULT_VALUE,
};
const pressedKeys = new Map<string, number>();

// message for the keystrokeCountAnalyticsCommand
export function getKeystrokeCountAnalyticsMessage(): string {
    const keystrokes = keystrokeManager;
    const message = `You collected so far ${keystrokes.total} keystrokes in total.
					${keystrokes.year} of them this year, 
					${keystrokes.month} this month, 
					${keystrokes.week} this week, 
					${keystrokes.day} today, 
					${keystrokes.hour} this hour and 
					${keystrokes.minute} this minute!`;

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
	++keystrokeManager.total;
	++keystrokeManager.year;
	++keystrokeManager.month;
	++keystrokeManager.week;
	++keystrokeManager.day;
	++keystrokeManager.hour;
	++keystrokeManager.minute;
	++keystrokeManager.second;
}

// the count of one specific map-item is resetted based on the key
export function resetOneTimespanKeystrokesAmount(key: string): void {
	switch(key) {
		case 'total':
			keystrokeManager.total = KEYSTROKE_DEFAULT_VALUE;
			break;
		case 'year':
			keystrokeManager.year = KEYSTROKE_DEFAULT_VALUE;
			break;
		case 'month':
			keystrokeManager.month = KEYSTROKE_DEFAULT_VALUE;
			break;
		case 'week':
			keystrokeManager.week = KEYSTROKE_DEFAULT_VALUE;
			break;
		case 'day':
			keystrokeManager.day = KEYSTROKE_DEFAULT_VALUE;
			break;
		case 'hour':
			keystrokeManager.hour = KEYSTROKE_DEFAULT_VALUE;
			break;
		case 'minute':
			keystrokeManager.minute = KEYSTROKE_DEFAULT_VALUE;
			break;
		case 'second':
			keystrokeManager.second = KEYSTROKE_DEFAULT_VALUE;
			break;
		default:
			break;
	}
}

export function updateInterface(configuration: string): void {
	keystrokeManager = JSON.parse(configuration);
}