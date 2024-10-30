<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import "../app.css";
    import { themeStore } from "../stores";
    import CreateProjectModal from '../components/config/CreateProjectModal.svelte';
    import { deleteAll } from "../functions/datamanager"
	let showCreateModal = false;
    let projectName = "";
    onMount(() => {
        // Obtenemos el nombre del proyecto en base64
        projectName = localStorage.getItem("projectName")!;
        // Eliminamos todo lo del sistema
        deleteAll();
    });
</script>

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
                <stop offset="0%" style="stop-color:#291549; stop-opacity:1" />
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
        on:click={() => (showCreateModal = true)}
    >
        <div
            class="flex flex-col items-center mx-auto justify-center text-center"
        >
            <svg
                width="120px"
                height="120px"
                viewBox="0 0 32 32"
                fill="none"
                stroke="#812fc9"
                stroke-linejoin="round"
                stroke-width="2"
            >
                <path d="M30 18 L16 5 2 18Z M2 25 L30 25" />
            </svg>
            <h1 class="mt-10 text-[#812fc9] text-2xl font-bold">Get started</h1>
        </div>
    </button>

    <button
        class="w-1/4 h-[400px] {$themeStore === 'Light'
            ? 'bg-[#ffffff] border-[#f3ecfa] shadow-[0_0_30px_#f3ecfa] hover:shadow-[0_0_2px_#812fc9]'
            : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c] hover:shadow-[0_0_2px_#f3ecfa]'} border-2 mr-2 rounded-lg transition duration-300"
        on:click={() => {
            goto(`/importmodel`);
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

<CreateProjectModal bind:toggle={showCreateModal} />