import * as vscode from 'vscode';

import { statusBarItem } from './extension';
import { KEYSTROKE_ERROR_VALUE,
         KEYBOARD_ICON, } from './constants';

var lastWordsPerMinuteValue = 0;

// updates the keystroke- and wordsPerMinute-value of the statusBarItem
// if there is no wordsPerMinute-value, then it just uses the last one, that was fetched
export function updateStatusBarItem(keystrokesValue: number = KEYSTROKE_ERROR_VALUE, wordsPerMinute: number = lastWordsPerMinuteValue): void {
    statusBarItem.text = `${KEYBOARD_ICON} Keystrokes: ${keystrokesValue} | ${wordsPerMinute} WPM`;
    lastWordsPerMinuteValue = wordsPerMinute;
}

// checks if the changes in the active document of vscode are valid
// the last check is because of the first change in the document at the beginning 
// -> otherwise the keystrokeCount is 'instantly' counting to 2
export function isValidChangedContent(event: vscode.TextDocumentChangeEvent): boolean {
    return event &&
           event.contentChanges &&
           event.contentChanges[0].text !== undefined;
};