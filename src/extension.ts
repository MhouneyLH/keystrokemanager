import * as vscode from 'vscode';

const KEYBOARD_ICON = '$(keyboard)';

let statusBarItem: vscode.StatusBarItem;
let totalKeystrokes = 0; // -1 instead of 0, because otherwise it starts with 2, when one key was pressed
let pressedKeyMap = new Map<string, number>();

export function activate({ subscriptions }: vscode.ExtensionContext) {
	const showTotalKeystrokesCommandId = 'keystrokemanager.showTotalKeystrokes';
	subscriptions.push(vscode.commands.registerCommand(showTotalKeystrokesCommandId, () => {
		vscode.window.showInformationMessage(`😊 ${getPraisingWord()} You typed ${totalKeystrokes} characters already!`);
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
		
		collectPressedKey(event);
	}
}

function collectPressedKey(event: vscode.TextDocumentChangeEvent): void {
	const pressedKey = event.contentChanges[0].text;
	// 0, as default value, when key was not pressed yet
	const prevCount = pressedKeyMap.get(pressedKey) ?? 0;

	pressedKeyMap.set(pressedKey, prevCount + 1);
}

function getMostOftenPressedKeys(): Map<string, number> {
	let pressedKeysSortedDescending = new Map([...pressedKeyMap].sort((prev, curr) => prev[1] - curr[1]).reverse());

	const targetSize = 3;
	let mostOftenPressedKeys = new Map([...pressedKeysSortedDescending].slice(0, targetSize));

	return mostOftenPressedKeys;
}

function printMostOftenPressedKeysMessage(keyMap: Map<string, number>): string {
	const messageBeginning = new String('Most often pressed keys: ');
	let result = messageBeginning;

	const placementIcons = new Map<number, string>([
		[1, '🥇'],
		[2, '🥈'],
		[3, '🥉'],
	]);
	let placement = 1;
	
	keyMap.forEach((value, key, map) => {
		const placementLine = new String(`${placementIcons.get(placement++)} '${key}' pressed ${value} times  `);
		result += placementLine.toString();
	});

	return result.toString();
}

function getPraisingWord(): string {
	const words = ['Awesome!', 'Wonderful!', 'Great!', 'Fantastic!', 'Cool!'];
	return words[Math.floor(Math.random() * words.length)];
}