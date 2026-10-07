// Adapts the Obsidian vault to the VaultWriter interface the library writes
// through. The path and content builders live in mekorot.ts, which stays free
// of Obsidian imports so the build tools and the tests can use them too.
import { App, normalizePath } from "obsidian";
import { VaultWriter } from "./mekorot";

export function vaultWriter(app: App): VaultWriter {
	return {
		exists(path) {
			// Anything already at that path counts as taken — including a folder,
			// where Obsidian could not create a note anyway.
			return app.vault.getAbstractFileByPath(normalizePath(path)) !== null;
		},
		async mkdir(folder) {
			await app.vault.adapter.mkdir(normalizePath(folder));
		},
		async create(path, content) {
			await app.vault.create(normalizePath(path), content);
		},
	};
}
