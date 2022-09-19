import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let totalKeystrokes : number = 0;

export function activate({ subscriptions }: vscode.ExtensionContext) {
	const commandId = 'keystrokemanager.showTotalKeystrokes';
	subscriptions.push(vscode.commands.registerCommand(commandId, () => {
		vscode.window.showInformationMessage(`Total Keystrokes: ${totalKeystrokes}`);
	}));
	
	const ITEM_PRIORITY = 1000;
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, ITEM_PRIORITY);
	statusBarItem.command = commandId;
	subscriptions.push(statusBarItem);

	subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem));

	updateStatusBarItem();
}

function updateStatusBarItem(): void {
	statusBarItem.text = `Keystrokes: ${++totalKeystrokes}`;
	statusBarItem.show();
}