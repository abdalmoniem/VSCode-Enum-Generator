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

export function activate(context: vscode.ExtensionContext) {
	const enumCompletionItemProvider = new EnumCompletionItemProvider();

	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider('c', enumCompletionItemProvider),
		vscode.languages.registerCompletionItemProvider('cpp', enumCompletionItemProvider),
		vscode.commands.registerCommand('enum-generator.generateEnum',
			async (bitWidth, memberCount, hammingDistance) => await generateEnum(bitWidth, memberCount, hammingDistance))
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }

export async function generateEnum(bitWidth: number, memberCount: number, hammingDistance: number) {
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
			let snippet = 'typedef enum {\n';
			for (let i = 0; i < memberCount; i++) {
				snippet += `\${${i + 1}:MEMBER_${i + 1}} = ${hammingCodes[i] !== undefined ? hammingCodes[i] : 0x00}${i < memberCount - 1 ? ',' : ''}\n`;
				if ((hammingCodes[i] !== undefined) && (hammingCodes[i + 1] !== undefined)) {
					if (i < memberCount - 1) {
						snippet += `/* hamming distance is ${await calculateHammingDistance(
							parseInt(hammingCodes[i], Integers.HEXADECIMAL).toString(2),
							parseInt(hammingCodes[i + 1], Integers.HEXADECIMAL).toString(2))} */\n`;
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
		enumSnippet.insertText = '';
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