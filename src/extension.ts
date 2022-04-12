/**
 * file: extension.js
 * 
 * date: 08-Apr-22
 * 
 * author: AbdAlMoniem AlHifnawy
 * 
 * description: main extension file that executes extension functionalities
 */

import * as vscode from 'vscode';
import { Integers, generateCodebook, calculateHammingDistance } from './hammingNumberGenerator';

const enumRegex = /typedef\s*enum\s*{\s*(?:(?<memberName>\w+)\s*=?\s*(?<memberValue>(?:0b[01]+)|(?:0x[a-fA-F0-9]+)|(?:\d+))?,?\s*)+\s*}\s*\w+;/m;

export function activate(context: vscode.ExtensionContext) {
	const enumCompletionItemProvider = new EnumCompletionItemProvider();

	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider('c', enumCompletionItemProvider),
		vscode.languages.registerCompletionItemProvider('cpp', enumCompletionItemProvider),

		vscode.commands.registerCommand('enum-generator.convertEnum',
			async () => await convertEnum()),
		vscode.commands.registerCommand('enum-generator.generateEnum',
			async (bitWidth, memberCount, hammingDistance) => await generateEnum(bitWidth, memberCount, hammingDistance)),

		vscode.window.onDidChangeTextEditorSelection(event =>
			vscode.commands.executeCommand('setContext',
				'canConvert',
				enumRegex.test(
					event.textEditor.document.getText(
						event.textEditor.selection))))
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }

export async function convertEnum() {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const document = editor.document;
		const selection = editor.selection;
		const selectionText = document.getText(selection);

		if (enumRegex.test(selectionText)) {
			vscode.window.showInformationMessage('Valid Enum, Converting...');
			let selectionTextLines = selectionText.split(/[\r\n]/);

			if (selectionTextLines.length === 1) {
				const lineRegex = /(?<enumHeader>typedef\s*enum\s*{)(?<members>\s*(?:(?<memberName>\w+)\s*=?\s*(?<memberValue>(?:0b[01]+)|(?:0x[a-fA-F0-9]+)|(?:\d+))?,?\s*)+\s*)(?<enumFooter>}\s*\w+;)/;

				const match = lineRegex.exec(selectionTextLines[0]);
				const members = match!.groups?.members.split(',').filter(value => value.trim().length > 0);

				let convertedEnum = match!.groups?.enumHeader;

				const { hammingCodes, minHam } = await generateCodebook(16, members!.length, 3,
					Integers.HEXADECIMAL,
					3000,
					false,
					false,
					300);

				if (hammingCodes !== undefined) {
					members!.forEach((member, index) => {
						let groups = /(?<filler1>.*?)(?<memberName>\w+)(?<filler2>\s*=?\s*)(?<memberValue>(?:0b[01]+)|(?:0x[a-fA-F0-9]+)|(?:\d+))?(?<filler3>.*)/.exec(member)?.groups;

						convertedEnum += `${groups?.filler1}${groups?.memberName}${groups!.filler2.trim().length > 0 ? groups?.filler2 : '='}${hammingCodes[index]}${groups?.filler3}${index < members!.length - 1 ? ',' : ''}`;
					});

					convertedEnum! += match!.groups?.enumFooter;

					editor.edit(editBuilder => editBuilder.replace(selection, convertedEnum!));
				}
			}

			let memberCount = 0;
			for (let line of selectionTextLines) {
				if (/^(\s*)(?!typedef)(?<memberName>\w+)\s*=?\s*(?<memberValue>(?:0b[01]+)|(?:0x[a-fA-F0-9]+)|(?:\d+))?/.test(line)) {
					memberCount += 1;
				}
			}

			const { hammingCodes, minHam } = await generateCodebook(16, memberCount, 3,
				Integers.HEXADECIMAL,
				3000,
				false,
				false,
				300);

			if (hammingCodes !== undefined) {
				let convertedEnum = '';
				let codeIndex = 0;
				selectionTextLines.forEach((line, index) => {
					const lineRegex = /^(\s*)(?!typedef)(?<memberName>\w+)\s*=?\s*(?<memberValue>(?:0b[01]+)|(?:0x[a-fA-F0-9]+)|(?:\d+))?/;
					if (lineRegex.test(line)) {
						convertedEnum += `${line.replace(lineRegex, `$1$2 = ${hammingCodes[codeIndex]}`)}\n`;
						codeIndex += 1;
					} else {
						convertedEnum += `${line}${index < selectionTextLines.length - 1 ? '\n' : ''}`;
					}
				});
				editor.edit(editBuilder => editBuilder.replace(selection, convertedEnum));
			}
		} else {
			vscode.window.showInformationMessage('Invalid Enum');
		}
	}
}

export async function generateEnum(bitWidth: number, memberCount: number, hammingDistance: number): Promise<void> {
	if (bitWidth === undefined) {
		let answer = await vscode.window.showInputBox(
			{
				prompt: 'Bit Width',
				title: 'Enter Bit Width',
				placeHolder: 'Enter Bit Width (ex. 128, 64, 32, etc...)',
				ignoreFocusOut: true,
				validateInput: text => /^\d+$/.test(text) ? null : 'not a valid number!'
			});

		if (answer) {
			bitWidth = parseInt(answer);
		}
	}

	if (memberCount === undefined) {
		let answer = await vscode.window.showInputBox(
			{
				prompt: 'Member Count',
				title: 'Enter Number of Members',
				ignoreFocusOut: true,
				placeHolder: 'Enter Number of Members (ex. 4, 5, 6, etc...)',
				validateInput: text => /^\d+$/.test(text) ? null : 'not a valid number!'
			});

		if (answer) {
			memberCount = parseInt(answer);
		}
	}

	if (hammingDistance === undefined) {
		let answer = await vscode.window.showInputBox(
			{
				prompt: 'Hamming Distance',
				title: 'Enter Hamming Distance',
				ignoreFocusOut: true,
				placeHolder: 'Enter Hamming Distance (ex. 2, 3, 4, etc...)',
				validateInput: text => /^\d+$/.test(text) ? null : 'not a valid number!'
			});

		if (answer) {
			hammingDistance = parseInt(answer);
		}
	}

	const editor = vscode.window.activeTextEditor;

	if (editor) {
		const { hammingCodes, minHam } = await generateCodebook(bitWidth, memberCount, hammingDistance,
			Integers.HEXADECIMAL,
			3000,
			false,
			false,
			300);

		// console.log({ hammingCodes, minHam });
		if (hammingCodes !== undefined) {
			let snippet = '';
			for (let i = 0; i < memberCount; i++) {
				snippet += `\t\${${i + 1}:MEMBER_${i + 1}} = ${hammingCodes[i] !== undefined ? hammingCodes[i] : 0x00}${i < memberCount - 1 ? ',' : ''}\n`;
				if ((hammingCodes[i] !== undefined) && (hammingCodes[i + 1] !== undefined)) {
					if (i < memberCount - 1) {
						snippet += `\t/* hamming distance is ${await calculateHammingDistance(
							BigInt(hammingCodes[i]).toString(2),
							BigInt(hammingCodes[i + 1]).toString(2))} */\n`;
					}
				}
			}
			snippet += `} \${${memberCount + 1}:ENUM_NAME};`;

			await editor.insertSnippet(new vscode.SnippetString(snippet));
		}
	}
}

export class EnumCompletionItemProvider implements vscode.CompletionItemProvider {
	async provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext): Promise<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> {
		const completionItems: vscode.CompletionList<vscode.CompletionItem> = new vscode.CompletionList();
		const linePrefix = document.lineAt(position).text.substring(0, position.character);

		const regex = /e(?<bitWidth>\d+)(?:c(?<memberCount>\d+)?(?:h(?<hammingDistance>\d+)?)?)?/;

		if (regex.test(linePrefix)) {
			const match = regex.exec(linePrefix);
			const bitWidth = parseInt(match?.groups?.bitWidth!);
			const memberCount = parseInt(match?.groups?.memberCount!);
			const hammingDistance = parseInt(match?.groups?.hammingDistance!);

			if (isNaN(memberCount)) {
				for (let mc = 2; mc < 5; mc++) {
					for (let hd = 2; hd < (10 > bitWidth ? bitWidth - 1 : 10); hd++) {
						completionItems.items.push.apply(completionItems.items, await this.getSnippets(bitWidth, mc, hd, match!.input));
					}
				}
			} else if (isNaN(hammingDistance)) {
				for (let hd = 2; hd < (10 > bitWidth ? bitWidth - 1 : 10); hd++) {
					completionItems.items.push.apply(completionItems.items, await this.getSnippets(bitWidth, memberCount, hd, match!.input));
				}
			} else {
				completionItems.items.push.apply(completionItems.items, await this.getSnippets(bitWidth, memberCount, hammingDistance, match!.input));
			}

			completionItems.isIncomplete = true;
		}

		// return all completion items as an array
		return completionItems;
	}

	private async getSnippets(bitWidth: number, memberCount: number, hammingDistance: number, filterText: string): Promise<Array<vscode.CompletionItem>> {
		const completionItems: Array<vscode.CompletionItem> = new Array();

		const enumSnippet = new vscode.CompletionItem(`${bitWidth}-bit enum count ${memberCount}, dis ${hammingDistance}`);
		enumSnippet.detail = `${memberCount} member ${bitWidth}-bit Enum`;
		enumSnippet.insertText = 'typedef enum {\n';
		enumSnippet.filterText = filterText;
		enumSnippet.kind = vscode.CompletionItemKind.Snippet;
		enumSnippet.documentation =
			new vscode.MarkdownString(`Inserts a ${bitWidth}-bit enum snippet with
						${memberCount} members and minimum hamming distance of ${hammingDistance} between them.`);
		enumSnippet.command = { command: 'enum-generator.generateEnum', title: 'hello', arguments: [bitWidth, memberCount, hammingDistance, enumSnippet] };

		completionItems.push(enumSnippet);

		return completionItems;
	}
}