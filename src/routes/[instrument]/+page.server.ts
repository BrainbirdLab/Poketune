import { instrumentNames } from '$lib/tuner.js';
import { redirect } from '@sveltejs/kit';

export function load({params}){
    //if the instrument is not in the list, then return 404
    if (!instrumentNames.includes(params.instrument)) {
        return redirect(302, '/');
    } 

    //if the instrument is in the list, then redirect to the instrument page
    return {
        instrument: params.instrument,
    }
}