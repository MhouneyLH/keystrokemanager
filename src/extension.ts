import * as vscode from 'vscode';
import * as moment from 'moment';

const KEYBOARD_ICON = '$(keyboard)';
const KEYSTROKE_DEFAULT_VALUE = 0;

class Test {
	date: Date;
	keystrokeCount: number;

	constructor(date: Date, keystrokeCount: number) {
		this.date = date;
		this. keystrokeCount = keystrokeCount;
	}
}

let statusBarItem: vscode.StatusBarItem;
let totalKeystrokes = KEYSTROKE_DEFAULT_VALUE; // -1 instead of 0, because otherwise it starts with 2, when one key was pressed
let pressedKeyMap = new Map<string, number>();
// @todo: add totalKeystrokes in this map
let amountOfKeystrokesInTimespanMap = new Map<string, Test>([
	['second', new Test(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	['minute', new Test(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	['hour', new Test(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	['day', new Test(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	['week', new Test(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	['month', new Test(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	['year', new Test(new Date(), KEYSTROKE_DEFAULT_VALUE)],
	// ['total', KEYSTROKE_DEFAULT_VALUE],
]);

let hourTimer = new Date();

export function activate({ subscriptions }: vscode.ExtensionContext) {
	const showTotalKeystrokesCommandId = 'keystrokemanager.showTotalKeystrokes';
	subscriptions.push(vscode.commands.registerCommand(showTotalKeystrokesCommandId, () => {
		vscode.window.showInformationMessage(`😊 ${getPraisingWord()}! You typed ${totalKeystrokes} characters already!`);
	}));

	const mostOftenPressedKeysCommandId = 'keystrokemanager.mostOftenPressedKeys';
	subscriptions.push(vscode.commands.registerCommand(mostOftenPressedKeysCommandId, () => {
		const mostOftenPressedKeys = getMostOftenPressedKeys();
		const message = printMostOftenPressedKeysMessage(mostOftenPressedKeys);

		vscode.window.showInformationMessage(message);
	}));
	
	const ITEM_PRIORITY = 101;
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, ITEM_PRIORITY);
	statusBarItem.command = showTotalKeystrokesCommandId;
	statusBarItem.text = `${KEYBOARD_ICON} Keystrokes: ${totalKeystrokes}`;
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
		totalKeystrokes++;
		statusBarItem.text = `${KEYBOARD_ICON} Keystrokes: ${totalKeystrokes}`;

		amountOfKeystrokesInTimespanMap.forEach((value, key, map) => {
			map.set(key, new Test(value.date, value.keystrokeCount + 1));

			if(isTimespanAgo(value.date, key)) {
				map.set(key, new Test(new Date(), KEYSTROKE_DEFAULT_VALUE));
			}
			console.log(`${key}: ${value.keystrokeCount}; `);
		});
		
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

	const placementIcons = new Map<number, string>([
		[1, '🥇'],
		[2, '🥈'],
		[3, '🥉'],
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