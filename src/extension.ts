import * as vscode from 'vscode';
import * as moment from 'moment';

const KEYBOARD_ICON = '$(keyboard)';
const FIRST_PLACE_ICON = '🥇';
const SECOND_PLACE_ICON = '🥈';
const THIRD_PLACE_ICON = '🥉';
const KEYSTROKE_DEFAULT_VALUE = 0;

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

class KeystrokeData {
	date: Date;
	keystrokeCount: number;

	constructor(date: Date, keystrokeCount: number) {
		this.date = date;
		this. keystrokeCount = keystrokeCount;
	}
}

let statusBarItem: vscode.StatusBarItem;
let pressedKeyMap = new Map<string, number>();
let amountOfKeystrokesInTimespanMap = new Map<string, KeystrokeData>([
	['second', new KeystrokeData(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	['minute', new KeystrokeData(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	['hour', new KeystrokeData(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	['day', new KeystrokeData(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	['week', new KeystrokeData(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	['month', new KeystrokeData(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	['year', new KeystrokeData(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	['total', new KeystrokeData(new Date(), KEYSTROKE_DEFAULT_VALUE)],
]);

export function activate({ subscriptions }: vscode.ExtensionContext) {
	const showKeystrokecountAnalyticsCommandId = 'keystrokemanager.showKeystrokecountAnalytics';
	subscriptions.push(vscode.commands.registerCommand(showKeystrokecountAnalyticsCommandId, () => {
		vscode.window.showInformationMessage(`😊 ${getPraisingWord()}! You typed ${amountOfKeystrokesInTimespanMap.get('total')} characters already!`);
	}));

	const mostOftenPressedKeysCommandId = 'keystrokemanager.mostOftenPressedKeys';
	subscriptions.push(vscode.commands.registerCommand(mostOftenPressedKeysCommandId, () => {
		const mostOftenPressedKeys = getMostOftenPressedKeys();
		const message = printMostOftenPressedKeysMessage(mostOftenPressedKeys);

		vscode.window.showInformationMessage(message);
	}));
	
	const ITEM_PRIORITY = 101;
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, ITEM_PRIORITY);
	statusBarItem.command = showKeystrokecountAnalyticsCommandId;
	statusBarItem.text = `${KEYBOARD_ICON} Keystrokes: ${amountOfKeystrokesInTimespanMap.get('total')}`;
	statusBarItem.tooltip = 'Select Timespan';
	statusBarItem.show();
	subscriptions.push(statusBarItem);

	subscriptions.push(vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => updateStatusBarItem(event)));
}

function updateStatusBarItem(event: vscode.TextDocumentChangeEvent): void {
	// the last check is because of the first change in the document at the beginning 
	// -> counted instantly to 2 before
	if(event &&
	   event.contentChanges &&
	   event.contentChanges[0].text !== undefined) {
		amountOfKeystrokesInTimespanMap.forEach((value, key, map) => 	
			isTimespanAgo(value.date, key) && key !== 'total' ? map.set(key, new KeystrokeData(new Date(), KEYSTROKE_DEFAULT_VALUE))
															  : map.set(key, new KeystrokeData(value.date, value.keystrokeCount + 1))
		);  
		statusBarItem.text = `${KEYBOARD_ICON} Keystrokes: ${amountOfKeystrokesInTimespanMap.get('total')}`;

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
	const messageBeginning = new String('You pressed ');
	let result = messageBeginning;

	// @todo: beautify this code-piece!!! disgusting!
	const placementIcons = new Map<number, string>([
		[1, FIRST_PLACE_ICON],
		[2, SECOND_PLACE_ICON],
		[3, THIRD_PLACE_ICON],
	]);
	let placement = 1;
	
	keyMap.forEach((value, key, map) => {
		const placementLine = new String(`${placementIcons.get(placement++)} '${key}' ${value} times  `);
		result += placementLine.toString();
	});

	return result.toString();
}

function getPraisingWord(): string {
	const WORDS = ['Awesome', 'Wonderful', 'Great', 'Fantastic', 'Cool'];
	return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function isTimespanAgo(date: Date, timespan: string) {
	// here it is everytime 1 hour, 1 day, etc.
	const AMOUNT_OF_TIMESPAN = 1;
	const timeSpanConvertedIntoCorrectFormat: moment.unitOfTime.DurationConstructor = timespan as moment.DurationInputArg2; 
	
	return moment(date).isBefore(moment().subtract(AMOUNT_OF_TIMESPAN, timeSpanConvertedIntoCorrectFormat));
}