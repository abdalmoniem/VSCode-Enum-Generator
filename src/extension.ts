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
		vscode.languages.registerCompletionItemProvider('c', enumCompletionItemProvider/* , ' ' */),
		vscode.languages.registerCompletionItemProvider('cpp', enumCompletionItemProvider/* , ' ' */)
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }

export class EnumCompletionItemProvider implements vscode.CompletionItemProvider {
	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext): vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[] {
		const completionItems: vscode.CompletionList<vscode.CompletionItem> = new vscode.CompletionList();
		const linePrefix = document.lineAt(position).text.substring(0, position.character);

		if (/ech/gi.test(linePrefix)) {
			const memberCount = 3;
			const hammingDistance = 2;

			for (let bitWidth = 8; bitWidth < 128; bitWidth *= 2) {
				const { hammingCodes, minHam } = generateCodebook(bitWidth, memberCount, hammingDistance,
					Integers.HEXADECIMAL,
					3000,
					false,
					false,
					300);

				// console.log({ hammingCodes, minHam });

				if (hammingCodes !== undefined) {
					let snippet = 'typedef enum {\n';
					for (let i = 0; i < memberCount; i++) {
						snippet += `\${${i + 1}:member_${i + 1}} = ${hammingCodes[i] !== undefined ? hammingCodes[i] : 0x00}${i < memberCount - 1 ? ',' : ''}\n`;
						if ((hammingCodes[i] !== undefined) && (hammingCodes[i + 1] !== undefined)) {
							if (i < memberCount - 1) {
								snippet += `/* hamming distance is ${calculateHammingDistance(
									parseInt(hammingCodes[i], Integers.HEXADECIMAL).toString(2),
									parseInt(hammingCodes[i + 1], Integers.HEXADECIMAL).toString(2))} */\n`;
							}
						}
					}
					snippet += `} \${${memberCount + 1}:enum_name};`;

					const enumSnippet = new vscode.CompletionItem(`${bitWidth}-bit enum with 5 memebers and hamming distance 3`);
					enumSnippet.detail = `${bitWidth}-bit Enum`;
					enumSnippet.insertText = new vscode.SnippetString(snippet);
					enumSnippet.kind = vscode.CompletionItemKind.Snippet;
					enumSnippet.documentation =
						new vscode.MarkdownString(`Inserts an ${bitWidth}-bit enum snippet with 5 members and minimum hamming distance of 3 between them.`);

					completionItems.items.push(enumSnippet);
				}
			}
		}

		if (/e(\d+)c(\d+)h(\d+)/.test(linePrefix)) {
			const match = /e(\d+)c(\d+)h(\d+)/.exec(linePrefix);
			const bitWidth = parseInt(match![1]);
			const memberCount = parseInt(match![2]);
			const hammingDistance = parseInt(match![3]);

			if (memberCount <= 100) {
				const { hammingCodes, minHam } = generateCodebook(bitWidth, memberCount, hammingDistance,
					Integers.HEXADECIMAL,
					3000,
					false,
					false,
					300);

				// console.log({ hammingCodes, minHam });

				if (hammingCodes !== undefined) {
					let snippet = 'typedef enum {\n';
					for (let i = 0; i < memberCount; i++) {
						snippet += `\${${i + 1}:member_${i + 1}} = ${hammingCodes[i] !== undefined ? hammingCodes[i] : 0x00}${i < memberCount - 1 ? ',' : ''}\n`;
						if ((hammingCodes[i] !== undefined) && (hammingCodes[i + 1] !== undefined)) {
							if (i < memberCount - 1) {
								snippet += `/* hamming distance is ${calculateHammingDistance(
									parseInt(hammingCodes[i], Integers.HEXADECIMAL).toString(2),
									parseInt(hammingCodes[i + 1], Integers.HEXADECIMAL).toString(2))} */\n`;
							}
						}
					}
					snippet += `} \${${memberCount + 1}:enum_name};`;

					const enumSnippet = new vscode.CompletionItem(`${bitWidth}-bit enum with ${memberCount} and hamming distance ${hammingDistance}`);
					enumSnippet.detail = `${memberCount} member Enum`;
					enumSnippet.insertText = new vscode.SnippetString(snippet);
					enumSnippet.kind = vscode.CompletionItemKind.Snippet;
					enumSnippet.documentation =
						new vscode.MarkdownString(`Inserts an enum snippet with ${memberCount} members and minimum hamming distance of ${hammingDistance} between them.`);

					completionItems.items.push(enumSnippet);
				}
			}
		}

		// return all completion items as an array
		return completionItems;
	}
}