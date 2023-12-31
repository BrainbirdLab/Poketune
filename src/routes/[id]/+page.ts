import { instrumentNames, sentenceCase } from '$lib/store';
import { redirect } from '@sveltejs/kit';

export function load({params}){

    console.log('params.id: ' + params.id);

    const instrumentName = sentenceCase(params.id as string);
    console.log('instrumentName: ' + instrumentName);
    //if params.id is in InstrumentTypes type
    if (instrumentNames.includes(instrumentName)) {
        return {
            name: instrumentName
        }
    }

    console.log('redirecting to /');
    return redirect(302, '/');
}