import { instrumentNames, sentenceCase, type InstrumentTypes } from '$lib/store.svelte';
import { redirect } from '@sveltejs/kit';

export function load({params}){
    
    const instrumentName = sentenceCase(params.id as string);
    //if params.id is in InstrumentTypes type
    if (instrumentNames.includes(instrumentName)) {
        return {
            name: instrumentName as InstrumentTypes
        }
    }

    console.log('redirecting to /');
    return redirect(302, '/');
}