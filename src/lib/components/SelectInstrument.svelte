<script lang="ts">
    //import animation libs to fly in the instrument buttons
    import { fly } from "svelte/transition";
    import { instrumentNames } from "$lib/store";
    import { onMount } from "svelte";
    
    import Logo from "$lib/components/logo.svelte";
    import InstrumentIcon from "$lib/components/InstrumentIcon.svelte";
    import { pushState } from "$app/navigation";
    import { page } from "$app/stores";

    let mounted = false;

    const version = __VERSION__;

    onMount(() => {
        mounted = true;
    });

    function handler(node: HTMLElement) {
        node.onclick = (e) => {
            if (e.target === node) {
                history.back();
            }
        };

        return {
            destroy() {
                node.onclick = null;
            },
        };
    }

</script>

{#if mounted}
    <div class="wrapper">
        <div class="topbar">
            <div class="title">
                PokeTune
                <Logo size={35} />
            </div>
            <button on:click={() => {
                pushState('', { credits: true });
            }}><i class="fa-solid fa-circle-info"></i></button>
        </div>
        <div class="instruments">
            {#each instrumentNames as instrument, i}
                <a
                    class="instrument"
                    in:fly|global={{ y: 100 * (i + 1) }}
                    href="/{instrument.toLocaleLowerCase()}"
                >
                    <InstrumentIcon name={instrument} />
                    <span>{instrument}</span>
                </a>
            {/each}
        </div>
    </div>
{/if}
{#if $page.state.credits}    
<div class="creditsWrapper" use:handler>
    <div class="credits" transition:fly={{y: 10, duration: 200}}>
        <div class="info">
            <div class="title">
                PokeTune
                <Logo size={35} />
            </div>
            <div class="more">Musical instrument tuner. v{version}</div>
        </div>
        <div class="dev">Developed by Fuad Hasan</div>
        <div class="src">
            <a href="https://github.com/BrainbirdLab/Poketune" target="_blank"
                >Source Code <i class="fa-solid fa-up-right-from-square"></i></a
            >
        </div>
        <div class="images">
            <a href="https://www.flaticon.com" target="_blank"
                >Icons & Images <i class="fa-solid fa-up-right-from-square"
                ></i></a
            >
        </div>
        <button on:click={() => {
            history.back();
        }}>Close</button>
    </div>
</div>
{/if}

<style lang="scss">
    .creditsWrapper {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }

    .credits {
        background-color: #0b1d37;
        padding: 20px 30px;
        border-radius: 10px;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.688);
        text-align: center;
        max-width: 95vw;
        width: max-content;
        color: ghostwhite;

        .info {
            font-size: 1.6rem;
            font-weight: bold;
            margin-bottom: 10px;

            .more {
                font-size: 0.7rem;
                font-weight: normal;
                color: #c9c9c9;
            }
        }

        .dev,
        .src,
        .images {
            margin-top: 10px;
            font-size: 0.8rem;

            a {
                text-decoration: none;
                color: #007bff;
                i {
                    color: currentColor;
                }
                &:hover {
                    text-decoration: underline;
                }
            }
        }

        button {
            margin-top: 20px;
            padding: 8px 10px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 10px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background-color 0.1s;

            &:hover {
                background-color: #0056b3;
            }
        }
    }

    .title {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .topbar {
        font-size: 1.3rem;
        color: #fff;
        font-weight: 700;
        display: flex;
        flex-direction: row;
        padding: 0 10px;
        align-items: center;
        justify-content: space-between;
        position: fixed;
        gap: 10px;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        right: 0;
        z-index: 1;
        width: min(100vw, 850px);
        height: 50px;
        background: var(--primary);

        button {
            margin-right: -5px;
            padding: 10px;
            cursor: pointer;
            border-radius: 50%;
            border: none;
            outline: none;
            background: none;
            height: 35px;
            width: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;

            &:hover {
                background: #607d8b28;
            }
        }
    }

    .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        align-content: center;
        height: 100%;
        width: min(100vw, 850px);
        overflow: hidden;
    }

    .instruments {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: center;
        align-items: flex-start;
        gap: 10px 50px;
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

        * {
            pointer-events: none;
        }
    }

    .instrument:has(input[type="radio"]:checked) {
        transform: scale(0.95);
        transition: 100ms ease-in-out;
    }
</style>
