import * as vscode from 'vscode';

import { KEYSTROKE_DEFAULT_VALUE,
		 KEYBOARD_ICON,
		 SECOND_AS_MILLISECONDS, MINUTE_AS_MILLISECONDS, HOUR_AS_MILLISECONDS, DAY_AS_MILLISECONDS, WEEK_AS_MILLISECONDS, MONTH_AS_MILLISECONDS, YEAR_AS_MILLISECONDS } from "./constants";
import { updateStatusBarItem, getMostOftenPressedKeys, getPraisingWord, printMostOftenPressedKeysMessage, resetOneAmountOfKeystrokes, getAverageWordsPerMinute, isValidChangedContent, collectPressedKey, incrementKeystrokes} from './methods';
import { setLongInterval } from './utils';

export let statusBarItem: vscode.StatusBarItem;
export const pressedKeyMap = new Map<string, number>();
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

// interface für Datenstruktur von map verwenden
// damit kann ich das auch in json speichern
// test = {
// 	key: 5;
// };
// test['key'];

// json für Konstanten

export function activate({ subscriptions }: vscode.ExtensionContext): void {
	const keystrokeCountAnalyticsCommandId = 'keystrokemanager.keystrokeCountAnalytics';
	const mostOftenPressedKeysCommandId = 'keystrokemanager.mostOftenPressedKeys';
	
	subscriptions.push(vscode.commands.registerCommand(keystrokeCountAnalyticsCommandId, keystrokeCountAnalyticsCommand));
	subscriptions.push(vscode.commands.registerCommand(mostOftenPressedKeysCommandId, mostOftenPressedKeysCommand));
	
	const STATUS_BAR_ITEM_PRIORITY = 101;
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, STATUS_BAR_ITEM_PRIORITY);
	statusBarItem.command = keystrokeCountAnalyticsCommandId;
	statusBarItem.text = `${KEYBOARD_ICON} Keystrokes: ${amountsOfKeystrokes.get('total')}`;
	// @todo: add this in future
	statusBarItem.tooltip = 'Select Timespan';
	statusBarItem.show();

	subscriptions.push(statusBarItem);
	
	subscriptions.push(vscode.workspace.onDidChangeTextDocument(update));
	
	setInterval(() => {
		const wordsPerMinute = getAverageWordsPerMinute();
		updateStatusBarItem(amountsOfKeystrokes.get('total'), wordsPerMinute);
		
		resetOneAmountOfKeystrokes('second');
	}, SECOND_AS_MILLISECONDS);
	setInterval(() => resetOneAmountOfKeystrokes('minute'), MINUTE_AS_MILLISECONDS);
	setInterval(() => resetOneAmountOfKeystrokes('hour'), HOUR_AS_MILLISECONDS);
	setInterval(() => resetOneAmountOfKeystrokes('day'), DAY_AS_MILLISECONDS);
	setInterval(() => resetOneAmountOfKeystrokes('week'), WEEK_AS_MILLISECONDS);
	setLongInterval(() => resetOneAmountOfKeystrokes('month'), MONTH_AS_MILLISECONDS);
	setLongInterval(() => resetOneAmountOfKeystrokes('year'), YEAR_AS_MILLISECONDS);
}

export function keystrokeCountAnalyticsCommand(): void {
	const map = amountsOfKeystrokes;
	const message = `You collected so far ${map.get('total')} keystrokes in total.
					${map.get('year')} of them this year, 
					${map.get('month')} this month, 
					${map.get('week')} this week, 
					${map.get('day')} today, 
					${map.get('hour')} this hour and 
					${map.get('minute')} this minute!`;

	vscode.window.showInformationMessage(`😊 ${getPraisingWord()}! ${message}`);
}

export function mostOftenPressedKeysCommand(): void {
	const mostOftenPressedKeys = getMostOftenPressedKeys();	
	const message = printMostOftenPressedKeysMessage(mostOftenPressedKeys);

	vscode.window.showInformationMessage(message);
}

export function update(event: vscode.TextDocumentChangeEvent): void {
	if(isValidChangedContent(event)) {
		incrementKeystrokes();
		updateStatusBarItem(amountsOfKeystrokes.get('total'));
		collectPressedKey(event);
	}
}

export function updateStatusBarItem(keystrokesValue: number = KEYSTROKE_ERROR_VALUE, wordsPerMinute: number = lastWordsPerMinuteValue): void {
    statusBarItem.text = `${KEYBOARD_ICON} Keystrokes: ${keystrokesValue} | ${wordsPerMinute} WPM`;
    lastWordsPerMinuteValue = wordsPerMinute;
}

export function isValidChangedContent(event: vscode.TextDocumentChangeEvent): boolean {
    // the last check is because of the first change in the document at the beginning 
	// -> counted instantly to 2 before
    return event &&
           event.contentChanges &&
           event.contentChanges[0].text !== undefined;
};