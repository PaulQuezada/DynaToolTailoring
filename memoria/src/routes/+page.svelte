<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import "../app.css";
    import { themeStore } from "../stores";
    import Loader from "../routes/loader.svelte";

    let showLoader = true;

    onMount(() => {
        // Eliminamos todo del localStorage
        localStorage.clear();
        setTimeout(() => {
            showLoader = false;
        }, 1000); // Oculta el loader después de 1000 milisegundos (1 segundos)
    });
</script>

{#if showLoader}
    <Loader />
{:else}
    <div class="mt-5 flex flex-col">
        <svg
            class="mx-auto"
            width="100px"
            height="100px"
            viewBox="0 0 32 32"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient
                    id="gradientePersonalizado"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                >
                    <stop
                        offset="0%"
                        style="stop-color:#291549; stop-opacity:1"
                    />
                    <stop
                        offset="100%"
                        style="stop-color:#8630d3; stop-opacity:1"
                    />
                </linearGradient>
            </defs>
            <title>cube</title>
            <path
                d="M15.452 3.006l-13.362 5.757 13.375 5.712 13.513-5.725-13.526-5.744zM16 15.194v13.8l12.995-6.169v-13.151l-12.995 5.52zM2.005 22.825l13.039 6.169v-13.8l-13.039-5.52v13.151z"
                fill="url(#gradientePersonalizado)"
            ></path>
        </svg>

        <h1
            class="flex mt-3 mb-2 mx-auto text-4xl font-bold
        {$themeStore === 'Light' ? 'text-[#14111b]' : 'text-[#6f3fb6]'}"
        >
            Welcome to&nbsp;<strong
                class=" {$themeStore === 'Light'
                    ? 'text-[#6f3fb6]'
                    : 'text-[#997bc5]'}">DynaToolTailoring</strong
            >
        </h1>
        <div
            class="my-5 mx-auto w-1/2 h-[2px] {$themeStore === 'Light'
                ? 'bg-[#cbc0e1]'
                : 'bg-[#2b1f4b]'}"
        ></div>
    </div>
    <div class="flex justify-center">
        <button
            class="w-1/4 h-[400px] {$themeStore === 'Light'
                ? 'bg-[#ffffff] border-[#f3ecfa] shadow-[0_0_30px_#f3ecfa] hover:shadow-[0_0_2px_#812fc9]'
                : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c] hover:shadow-[0_0_2px_#f3ecfa]'} border-2 mr-2 rounded-lg transition duration-300"
            on:click={() => {
                goto("/createnewmodel");
            }}
        >
            <div
                class="flex flex-col items-center mx-auto justify-center text-center"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="120px"
                    viewBox="0 -960 960 960"
                    width="120px"
                    fill="#812fc9"
                >
                    <path
                        d="M510-378h60v-132h132v-60H570v-132h-60v132H378v60h132v132ZM260-200q-24 0-42-18t-18-42v-560q0-24 18-42t42-18h560q24 0 42 18t18 42v560q0 24-18 42t-42 18H260Zm0-60h560v-560H260v560ZM140-80q-24 0-42-18t-18-42v-620h60v620h620v60H140Zm120-740v560-560Z"
                    />
                </svg>
                <h1 class="mt-10 text-[#812fc9] text-2xl font-bold">
                    New model of tailoring rules
                </h1>
            </div>
        </button>

        <button
            class="w-1/4 h-[400px] {$themeStore === 'Light'
                ? 'bg-[#ffffff] border-[#f3ecfa] shadow-[0_0_30px_#f3ecfa] hover:shadow-[0_0_2px_#812fc9]'
                : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c] hover:shadow-[0_0_2px_#f3ecfa]'} border-2 mr-2 rounded-lg transition duration-300"
            on:click={() => {
                goto("/importmodel");
            }}
        >
            <div
                class="flex flex-col items-center mx-auto justify-center text-center"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="120px"
                    viewBox="0 -960 960 960"
                    width="120px"
                    fill="#812fc9"
                >
                    <path
                        d="M450-280h60v-227l74 74 42-42-146-146-146 146 42 42 74-74v227ZM140-160q-24 0-42-18.5T80-220v-520q0-23 18-41.5t42-18.5h281l60 60h339q23 0 41.5 18.5T880-680v460q0 23-18.5 41.5T820-160H140Zm0-60h680v-460H456l-60-60H140v520Zm0 0v-520 520Z"
                    />
                </svg>
                <h1 class="mt-10 text-[#812fc9] text-2xl font-bold">
                    Import model of tailoring rules
                </h1>
            </div>
        </button>
    </div>
{/if}