<script lang="ts">
    //import animation libs to fly in the instrument buttons
    import { fade, fly } from 'svelte/transition';;
    import { sentenceCase, instrumentNames } from '$lib/store';
    //import version of the app
    import { version } from '$app/environment';

</script>

<div class="title" in:fly|global={{x: 10, delay: 100}}>
    <div class="t">
        PokeTune
    </div>
    <img src="/images/icon (Icon).png" alt="Logo" class="logo" width="50px" />
</div>
<div class="wrapper">
    <div class="instruments">
        {#each instrumentNames as instrument, i}
            <a class="instrument" in:fly|global={{y: 100*(i+1)}} href="/{instrument}">
                <!--img src="/images/{instrument}.png" alt="{instrument}"-->
                <!-- use srcset -->
                <img srcset="/images/{instrument}.png 1x, /images/{instrument} (Icon).png 2x" alt="{instrument}" />
                <span>{sentenceCase(instrument)}</span>
            </a>
        {/each}
    </div>
</div>

<footer class="footer">
    <div class="source"><a href="https://github.com/itsfuad/Poketune">Source code <i class="fa-solid fa-code"></i></a></div>
    ・
    <a href="https://www.flaticon.com/free-icons/course" title="course icons">Icon by Freepik - Flaticon</a>
</footer>

<style lang="scss">

    .footer{
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 10px;
		gap: 5px;
		font-size: 0.6rem;
        position: relative;
		*{
			padding: 0;
			color: ghostwhite;
		}

		a{
			text-decoration: underline;
		}
		i{
			font-size: 0.7rem;
		}
	}

    .title {
        font-size: 1.3rem;
        color: #fff;
        font-weight: 700;
        display: flex;
        flex-direction: row;
        padding: 0 10px;
        width: min(100vw, 500px);
        align-items: center;
        justify-content: flex-start;
        position: fixed;
        gap: 10px;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1;
        width: 100%;
        height: 60px;
        background: var(--primary);

        .t{
            display: flex;
            align-items: center;
            gap: 10px;
        }
    }

    .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        align-content: center;
        height: 100vh;
        overflow: hidden;
    }

    .instruments {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: center;
        align-items: flex-start;
        gap: 25px;
        padding: 30px 10px;
        overflow: scroll;
        align-content: flex-start;
    }

    .instrument {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: clamp(100px, 20vw, 160px);
        aspect-ratio: 1/1.3;
        align-items: center;
        border-radius: 10px;
        transition: 100ms ease-in-out;
        color: #fff;
        font-weight: 700;
        cursor: pointer;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 5px;
        text-decoration: none;

        *{
            pointer-events: none;
        }

        img{
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
            transition: 100ms;
        }

        &:hover img{
            filter:
            drop-shadow(3px 3px 5px #000000);
            //drop-shadow(3px 3px 5px #000000)
        }
    }

    .instrument:has(input[type=radio]:checked) {
    
        transform: scale(0.95);
        transition: 100ms ease-in-out;
    }

</style>
