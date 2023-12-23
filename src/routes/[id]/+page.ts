import { instrumentNames } from '$lib/tuner.js';
import { redirect } from '@sveltejs/kit';

export function load({params}){

    //if params.id is in InstrumentTypes type
    if (instrumentNames.includes((params.id as string).toLowerCase())) {
        return {
            name: params.id
        }
    }

    console.log('redirecting to /');
    return redirect(302, '/');
}