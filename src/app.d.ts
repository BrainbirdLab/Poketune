// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface PageState {
			credits: boolean;
		}
	}

	//define __VERSION__ as a global variable
	const __VERSION__: string;
}

export {};
