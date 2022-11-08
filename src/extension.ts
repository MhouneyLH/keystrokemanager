import * as vscode from 'vscode';

import { KEYBOARD_ICON,
		 SECOND_AS_MILLISECONDS, MINUTE_AS_MILLISECONDS, HOUR_AS_MILLISECONDS, DAY_AS_MILLISECONDS, WEEK_AS_MILLISECONDS, MONTH_AS_MILLISECONDS, YEAR_AS_MILLISECONDS, } from "./constants";
import { getPraisingWord, setLongInterval, } from './utils';
import { updateStatusBarItem, isValidChangedContent, } from './vscode_utils';
import { getAverageWordsPerMinute, } from './libs/words_per_minute';
import { keystrokeManager,
		 resetOneTimespanKeystrokesAmount, getThreeMostOftenPressedKeys, getMostOftenPressedKeysMessage, getKeystrokeCountAnalyticsMessage, incrementKeystrokesOfEveryTimespan, collectPressedKey, IKeystrokeManager, updateInterface, } from './libs/keystrokes_analytics';

export var statusBarItem: vscode.StatusBarItem;

export function activate({ subscriptions }: vscode.ExtensionContext): void {
	loadingFromConfigurationCommand();
	
	// commands
	const keystrokeCountAnalyticsCommandId = 'keystrokemanager.keystrokeCountAnalytics';
	const mostOftenPressedKeysCommandId = 'keystrokemanager.mostOftenPressedKeys';
	const savingToConfigurationCommandId = 'keystrokemanager.savingToConfiguration';
	const loadingFromConfigurationCommandId = 'keystrokemanager.loadingFromConfiguration';
	
	subscriptions.push(vscode.commands.registerCommand(keystrokeCountAnalyticsCommandId, keystrokeCountAnalyticsCommand));
	subscriptions.push(vscode.commands.registerCommand(mostOftenPressedKeysCommandId, mostOftenPressedKeysCommand));
	subscriptions.push(vscode.commands.registerCommand(savingToConfigurationCommandId, savingToConfigurationCommand));
	subscriptions.push(vscode.commands.registerCommand(loadingFromConfigurationCommandId, loadingFromConfigurationCommand));
	
	// statusBarItem
	const STATUS_BAR_ITEM_PRIORITY = 101;
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, STATUS_BAR_ITEM_PRIORITY);
	statusBarItem.command = keystrokeCountAnalyticsCommandId;
	statusBarItem.text = `${KEYBOARD_ICON} Keystrokes: ${keystrokeManager.total} | 0 WPM`;
	statusBarItem.tooltip = 'Select Timespan';
	statusBarItem.show();
	subscriptions.push(statusBarItem);
	
	// change-detections
	subscriptions.push(vscode.workspace.onDidChangeTextDocument(updateKeystrokes));
	
	// intervals
	setInterval(() => {
		const wordsPerMinute = getAverageWordsPerMinute(keystrokeManager);
		updateStatusBarItem(keystrokeManager.total, wordsPerMinute);
		
		resetOneTimespanKeystrokesAmount('second');
		//savingToConfigurationCommand();
	}, SECOND_AS_MILLISECONDS);
	setInterval(() => resetOneTimespanKeystrokesAmount('minute'), MINUTE_AS_MILLISECONDS);
	setInterval(() => resetOneTimespanKeystrokesAmount('hour'), HOUR_AS_MILLISECONDS);
	setInterval(() => resetOneTimespanKeystrokesAmount('day'), DAY_AS_MILLISECONDS);
	setInterval(() => resetOneTimespanKeystrokesAmount('week'), WEEK_AS_MILLISECONDS);
	setLongInterval(() => resetOneTimespanKeystrokesAmount('month'), MONTH_AS_MILLISECONDS);
	setLongInterval(() => resetOneTimespanKeystrokesAmount('year'), YEAR_AS_MILLISECONDS);
}

function keystrokeCountAnalyticsCommand(): void {
	const message = getKeystrokeCountAnalyticsMessage();

	vscode.window.showInformationMessage(`😊 ${getPraisingWord()}! ${message}`);
}

function mostOftenPressedKeysCommand(): void {
	const mostOftenPressedKeys = getThreeMostOftenPressedKeys();	
	const message = getMostOftenPressedKeysMessage(mostOftenPressedKeys);

	vscode.window.showInformationMessage(message);
}

function loadingFromConfigurationCommand(): void {
	const configuration = JSON.stringify(vscode.workspace.getConfiguration('keystrokeManager').get('keystrokes'));
	updateInterface(configuration);
	console.log("Loading:");
	console.log(vscode.workspace.getConfiguration('keystrokeManager').get('keystrokes'));
}

function savingToConfigurationCommand(): void {
	vscode.workspace.getConfiguration('keystrokeManager').update('keystrokes', keystrokeManager);
	console.log("Saving:");
	console.log(vscode.workspace.getConfiguration('keystrokeManager').get('keystrokes'));
}
 
function updateKeystrokes(event: vscode.TextDocumentChangeEvent): void {
	if(isValidChangedContent(event)) {
		incrementKeystrokesOfEveryTimespan();
		updateStatusBarItem(keystrokeManager.total);
		collectPressedKey(event);
	}
}