

<script lang="ts">

    import {selectedInstrument} from '$lib/store';


    //Instrument can have many kinds of tunings and strings like 4 string bass, 6 string bass, standard tuning, drop D tuning, etc.
    //This is a list of all the instruments and their tunings

    const TuningNotes = {
        'Guitar': {
            '6': {
                'Standard': {
                    'E2': { 'freq': 82.41, 'note': 'E' },
                    'A2': { 'freq': 110.00, 'note': 'A' },
                    'D3': { 'freq': 146.83, 'note': 'D' },
                    'G3': { 'freq': 196.00, 'note': 'G' },
                    'B3': { 'freq': 246.94, 'note': 'B' },
                    'E4': { 'freq': 329.63, 'note': 'E' }
                },
                'Drop D': {
                    'D2': { 'freq': 73.42, 'note': 'D' },
                    'A2': { 'freq': 110.00, 'note': 'A' },
                    'D3': { 'freq': 146.83, 'note': 'D' },
                    'G3': { 'freq': 196.00, 'note': 'G' },
                    'B3': { 'freq': 246.94, 'note': 'B' },
                    'E4': { 'freq': 329.63, 'note': 'E' }
                },
            }
        }
    }

</script>

