import * as vscode from 'vscode';

import { KEYSTROKE_DEFAULT_VALUE,
		 KEYBOARD_ICON,
		 SECOND_AS_MILLISECONDS, MINUTE_AS_MILLISECONDS, HOUR_AS_MILLISECONDS, DAY_AS_MILLISECONDS, WEEK_AS_MILLISECONDS, MONTH_AS_MILLISECONDS, YEAR_AS_MILLISECONDS } from "./constants";
import { updateStatusBarItem, getMostOftenPressedKeys, getPraisingWord, printMostOftenPressedKeysMessage, resetOneAmountOfKeystrokes, getAverageWordsPerMinute } from './methods';
import { setLongInterval } from './utils';

export let statusBarItem: vscode.StatusBarItem;
export let pressedKeyMap = new Map<string, number>();
export let amountsOfKeystrokes = new Map<string, number>([
	['second', KEYSTROKE_DEFAULT_VALUE],
	['minute', KEYSTROKE_DEFAULT_VALUE],
	['hour', KEYSTROKE_DEFAULT_VALUE],
	['day', KEYSTROKE_DEFAULT_VALUE],
	['week', KEYSTROKE_DEFAULT_VALUE],
	['month', KEYSTROKE_DEFAULT_VALUE],
	['year', KEYSTROKE_DEFAULT_VALUE],
	['total', KEYSTROKE_DEFAULT_VALUE],
]);
export let wpmWords = new Array<number>();
export let wordsPerMinute = 0;

export function activate({ subscriptions }: vscode.ExtensionContext) {
	const showKeystrokeCountAnalyticsCommandId = 'keystrokemanager.showKeystrokeCountAnalytics';
	subscriptions.push(vscode.commands.registerCommand(showKeystrokeCountAnalyticsCommandId, () => {
		const map = amountsOfKeystrokes;
		const message = `You collected so far ${map.get('total')} keystrokes in total.
						 ${map.get('year')} of them this year, 
						 ${map.get('month')} this month, 
						 ${map.get('week')} this week, 
						 ${map.get('day')} today, 
						 ${map.get('hour')} this hour and 
						 ${map.get('minute')} this minute!`;

		vscode.window.showInformationMessage(`😊 ${getPraisingWord()}! ${message}`);
	}));

	const mostOftenPressedKeysCommandId = 'keystrokemanager.mostOftenPressedKeys';
	subscriptions.push(vscode.commands.registerCommand(mostOftenPressedKeysCommandId, () => {
		const mostOftenPressedKeys = getMostOftenPressedKeys();
		const message = printMostOftenPressedKeysMessage(mostOftenPressedKeys);

		vscode.window.showInformationMessage(message);
	}));
	
	const ITEM_PRIORITY = 101;
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, ITEM_PRIORITY);
	statusBarItem.command = showKeystrokeCountAnalyticsCommandId;
	statusBarItem.text = `${KEYBOARD_ICON} Keystrokes: ${amountsOfKeystrokes.get('total')}`;
	statusBarItem.tooltip = 'Select Timespan';
	statusBarItem.show();
	subscriptions.push(statusBarItem);

	setInterval(() => {
		wordsPerMinute = getAverageWordsPerMinute();
		statusBarItem.text = `${KEYBOARD_ICON} Keystrokes: ${amountsOfKeystrokes.get('total')} | ${wordsPerMinute} WPM`;

		resetOneAmountOfKeystrokes('second');
	}, SECOND_AS_MILLISECONDS);

	setInterval(() => resetOneAmountOfKeystrokes('minute'), MINUTE_AS_MILLISECONDS);
	setInterval(() => resetOneAmountOfKeystrokes('hour'), HOUR_AS_MILLISECONDS);
	setInterval(() => resetOneAmountOfKeystrokes('day'), DAY_AS_MILLISECONDS);
	setInterval(() => resetOneAmountOfKeystrokes('week'), WEEK_AS_MILLISECONDS);
	setLongInterval(() => resetOneAmountOfKeystrokes('month'), MONTH_AS_MILLISECONDS);
	setLongInterval(() => resetOneAmountOfKeystrokes('year'), YEAR_AS_MILLISECONDS);
	
	subscriptions.push(vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => updateStatusBarItem(event)));
}