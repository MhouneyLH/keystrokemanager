import * as vscode from 'vscode';

// General
const KEYSTROKE_DEFAULT_VALUE = 0;

// Icons
const KEYBOARD_ICON = '$(keyboard)';
const FIRST_PLACE_ICON = '🥇';
const SECOND_PLACE_ICON = '🥈';
const THIRD_PLACE_ICON = '🥉';

// Time
const SECOND_AS_MILLISECONDS = 1000;
const MINUTE_AS_MILLISECONDS = SECOND_AS_MILLISECONDS * 60;
const HOUR_AS_MILLISECONDS = MINUTE_AS_MILLISECONDS * 60;
const DAY_AS_MILLISECONDS = HOUR_AS_MILLISECONDS * 24;
const WEEK_AS_MILLISECONDS = DAY_AS_MILLISECONDS * 7;
const MONTH_AS_MILLISECONDS = DAY_AS_MILLISECONDS * 30; // @todo: could be problematic
const YEAR_AS_MILLISECONDS = MONTH_AS_MILLISECONDS * 12;

/// general @todos:
// - comment functions
// - refactor code (with Neo for the best result I guess)
// - create project-structure
// - write read-me
// - write changelog
// - add cicd to project on github
// - add keystrokes per min / hour, etc. feature
// - add feature to display the whole analytics of which keys were pressed in a json-file or something like this
// - add feature to the keystroke-counts, etc.

let statusBarItem: vscode.StatusBarItem;
let pressedKeyMap = new Map<string, number>();
let amountsOfKeystrokes = new Map<string, number>([
	['second', KEYSTROKE_DEFAULT_VALUE],
	['minute', KEYSTROKE_DEFAULT_VALUE],
	['hour', KEYSTROKE_DEFAULT_VALUE],
	['day', KEYSTROKE_DEFAULT_VALUE],
	['week', KEYSTROKE_DEFAULT_VALUE],
	['month', KEYSTROKE_DEFAULT_VALUE],
	['year', KEYSTROKE_DEFAULT_VALUE],
	['total', KEYSTROKE_DEFAULT_VALUE],
]);
let wpmWords = new Array<number>();
let wordsPerMinute = 0;

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
		const keystrokesPerSecond = amountsOfKeystrokes.get('second');

		if(keystrokesPerSecond !== undefined) {
			// keystrokesPerSecond / 5 -> one word is on average 5 chars long
			// [...] * 60 -> estimation, that this rate is for the next 60 seconds
			const tempWordsPerMinute = (keystrokesPerSecond / 5) * 60;
			if(wpmWords.length === 60) {
				wpmWords.shift();
			}
			wpmWords.push(tempWordsPerMinute);
	
			wordsPerMinute = wpmWords.reduce((prev, curr) => prev + curr) / wpmWords.length;
			statusBarItem.text = `${KEYBOARD_ICON} Keystrokes: ${amountsOfKeystrokes.get('total')} | ${wordsPerMinute} WPM`;
		}

		resetOneAmountOfKeystrokes('second');
	}, SECOND_AS_MILLISECONDS);

	setInterval(() => resetOneAmountOfKeystrokes('minute'), MINUTE_AS_MILLISECONDS);
	setInterval(() => resetOneAmountOfKeystrokes('hour'), HOUR_AS_MILLISECONDS);
	setInterval(() => resetOneAmountOfKeystrokes('day'), DAY_AS_MILLISECONDS);
	setInterval(() => resetOneAmountOfKeystrokes('week'), WEEK_AS_MILLISECONDS);
	setInterval(() => resetOneAmountOfKeystrokes('month'), MONTH_AS_MILLISECONDS);
	setInterval(() => resetOneAmountOfKeystrokes('year'), YEAR_AS_MILLISECONDS);

	subscriptions.push(vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => updateStatusBarItem(event)));
}

function updateStatusBarItem(event: vscode.TextDocumentChangeEvent): void {
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

function collectPressedKey(event: vscode.TextDocumentChangeEvent): void {
	const pressedKey = event.contentChanges[0].text;
	const prevCount = pressedKeyMap.get(pressedKey) ?? KEYSTROKE_DEFAULT_VALUE;

	pressedKeyMap.set(pressedKey, prevCount + 1);
}

function getMostOftenPressedKeys(): Map<string, number> {
	const pressedKeysSortedDescending = new Map([...pressedKeyMap].sort((prev, curr) => prev[1] - curr[1]).reverse());

	const targetSize = 3;
	const mostOftenPressedKeys = new Map([...pressedKeysSortedDescending].slice(0, targetSize));

	return mostOftenPressedKeys;
}

function printMostOftenPressedKeysMessage(keyMap: Map<string, number>): string {
	const messageBeginning = new String('You pressed');
	let result = messageBeginning;

	// @todo: beautify this code-piece!!! disgusting!
	const placementIcons = new Map<number, string>([
		[1, FIRST_PLACE_ICON],
		[2, SECOND_PLACE_ICON],
		[3, THIRD_PLACE_ICON],
	]);
	let placement = 1;
	
	keyMap.forEach((value, key, map) => {
		const placementLine = new String(` ${placementIcons.get(placement++)} '${key}' ${value} times`);
		result += placementLine.toString();
	});
	result += '!';

	return result.toString();
}

function getPraisingWord(): string {
	const WORDS = ['Awesome', 'Wonderful', 'Great', 'Fantastic', 'Cool'];
	return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function resetOneAmountOfKeystrokes(key: string): void {
	amountsOfKeystrokes.set(key, KEYSTROKE_DEFAULT_VALUE);
}