<!-- src/routes/index.svelte -->
<script lang="ts">
    import "../../app.css";
    import { themeStore } from "../../stores";
    import {
        downloadXMIFile,
        createCompleteModel,
    } from "../../functions/exportdata";
    import { downloadATL, baseATL } from "../../functions/atlcreation";

    // Variables
    let showModalData = false;
    let titledatashow = "";
    let datashow: string = "";
    let code_copy: boolean = false;

    function copyToClipboard() {
        code_copy = true;
        navigator.clipboard.writeText(datashow);

        // Después de 2 segundos, volver a mostrar el icono original
        setTimeout(() => {
            code_copy = false;
        }, 2000); // 2 segundos
    }
</script>

<div
    class="flex flex-col h-full w-full ${showModalData ? 'filter blur-md' : ''}"
>
    <h1
        class="flex mt-3 mb-2 mx-auto text-4xl font-bold {$themeStore ===
        'Light'
            ? 'text-[#454753]'
            : 'text-[#e7ebf1]'}"
    >
        <strong class="text-[#7442c0]">Stage 3: &nbsp;</strong> Save files
    </h1>
    <div
        class="mx-auto w-2/3 mt-10 flex flex-col rounded-lg shadow-lg border-2 {$themeStore ===
        'Light'
            ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
            : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'} transition duration-300"
    >
        <!-- Titulo -->
        <h1
            class="mt-10 mb-2 mx-auto text-3xl font-bold {$themeStore ===
            'Light'
                ? 'text-[#14111b]'
                : 'text-[#b498df]'}"
        >
            Save the tailoring rules model
        </h1>
        <div
            class="mx-auto w-1/2 h-[2px] my-auto {$themeStore === 'Light'
                ? 'bg-[#14111b]'
                : 'bg-[#b498df]'}"
        ></div>
        <!-- Apartado para descargar el Modelo -->
        <div
            class="relative my-10 mx-auto w-2/3 border-2 border-dashed border-[#858b98] rounded-xl"
        >
            <div class="p-10 flex flex-row text-center items-center mx-auto">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="70px"
                    viewBox="0 -960 960 960"
                    width="70px"
                    fill="#7442bf"
                    ><path
                        d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"
                    /></svg
                >
                <div class="flex flex-col">
                    <h1 class="font-bold text-2xl text-[#7442bf]">
                        Tailoring rules model
                    </h1>
                    <div class="flex flex-row">
                        <h1 class="text-[#7442bf]">OCM_Dynatool.xmi</h1>
                        <button
                            class="mx-2 rounded-xl border-2 {$themeStore ===
                            'Light'
                                ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                        >
                            <span
                                class="text-xs mx-2 material-symbols-outlined"
                            >
                                edit
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div
                class="absolute flex top-0 right-0 -mt-4 -mr-4 rounded-md p-2 border-dashed border-2 {$themeStore ===
                'Light'
                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
            >
                <button
                    class="mx-3"
                    on:click={() => {
                        downloadXMIFile();
                    }}
                >
                    <span class="my-auto material-symbols-outlined"
                        >download</span
                    >
                </button>
                <div
                    class="m-auto h-[30px] border-dashed border-2 {$themeStore ===
                    'Light'
                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                ></div>
                <button
                    class="mx-3"
                    on:click={() => {
                        titledatashow = "Tailoring rules model";
                        datashow = createCompleteModel();
                        showModalData = true;
                    }}
                >
                    <span class="material-symbols-outlined"> visibility </span>
                </button>
            </div>
        </div>
        <!-- Apartado para descargar el ATL -->
        <div
            class="relative mb-10 mx-auto w-2/3 border-2 border-dashed border-[#858b98] rounded-xl"
        >
            <div class="p-10 flex flex-row text-center items-center mx-auto">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="70px"
                    viewBox="0 -960 960 960"
                    width="70px"
                    fill="#7442bf"
                    ><path
                        d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"
                    /></svg
                >
                <div class="flex flex-col">
                    <h1 class="font-bold text-2xl text-[#7442bf]">
                        Tailoring rules code
                    </h1>
                    <div class="flex flex-row">
                        <h1 class="text-[#7442bf]">RULES.atl</h1>
                        <button
                            class="mx-2 rounded-xl border-2 {$themeStore ===
                            'Light'
                                ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                        >
                            <span
                                class="text-xs mx-2 material-symbols-outlined"
                            >
                                edit
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div
                class="absolute flex top-0 right-0 -mt-4 -mr-4 rounded-md p-2 border-dashed border-2 {$themeStore ===
                'Light'
                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
            >
                <button
                    class="mx-3"
                    on:click={() => {
                        downloadATL();
                    }}
                >
                    <span class="my-auto material-symbols-outlined"
                        >download</span
                    >
                </button>
                <div
                    class="m-auto h-[30px] border-dashed border-2 {$themeStore ===
                    'Light'
                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                ></div>
                <button
                    class="mx-3"
                    on:click={() => {
                        titledatashow = "Tailoring rules code";
                        datashow = baseATL();
                        showModalData = true;
                    }}
                >
                    <span class="material-symbols-outlined"> visibility </span>
                </button>
            </div>
        </div>

        <!-- Botones para seguir avanzando o no -->
        <div class="mt-10 flex justify-between mx-10 mb-4">
            <button
                class="font-bold border rounded-md p-2 hover:shadow-2xl transition duration-300 {$themeStore ===
                'Light'
                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
            >
                <div class="flex my-auto">
                    <span class="material-symbols-outlined text-lg mr-1">
                        arrow_back_ios
                    </span>
                    <h1 class="my-auto text-sm mx-2">Back</h1>
                </div>
            </button>
            <button
                class="font-bold border rounded-md p-2 hover:shadow-2xl transition duration-300 {$themeStore ===
                'Light'
                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
            >
                <div class="flex my-auto">
                    <h1 class="my-auto text-sm mx-2">Next</h1>
                    <span class="material-symbols-outlined text-lg ml-1">
                        arrow_forward_ios
                    </span>
                </div>
            </button>
        </div>
    </div>
</div>

<!-- Modal para la visualización previa -->
{#if showModalData}
    <div
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
        <div
            class="relative border rounded-lg shadow-lg p-8 h-[600px] w-1/2 {$themeStore ===
            'Light'
                ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
                : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'}"
        >
            <button
                on:click={() => {
                    showModalData = false;
                    code_copy = false;
                }}
                class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
                <svg
                    class="fill-current h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M10 8.586l4.293-4.293 1.414 1.414L11.414 10l4.293 4.293-1.414 1.414L10 11.414l-4.293 4.293-1.414-1.414L8.586 10 4.293 5.707l1.414-1.414L10 8.586z"
                    />
                </svg>
            </button>
            <div class="flex flex-col relative">
                <h2
                    class="mx-auto text-2xl font-bold mb-4 {$themeStore ===
                    'Light'
                        ? 'text-[#14111b]'
                        : 'text-[#b498df]'}"
                >
                    {titledatashow}
                </h2>
                <div class="absolute top-0 right-0 mt-[49px] mr-2 z-20">
                    <button
                        class="flex bg-[#b4b4b4] ml-2 rounded transition-transform duration-300 p-1"
                        on:click={copyToClipboard}
                    >
                        {#if code_copy}
                            <!-- Icono de check que crece -->
                            <span class="my-auto material-symbols-outlined">
                                check
                            </span>
                            <h1 class="my-auto">Copied!</h1>
                        {:else}
                            <!-- Icono de content_copy que se encoge -->
                            <span class="my-auto material-symbols-outlined">
                                content_copy
                            </span>
                        {/if}
                    </button>
                </div>
                <code
                    class="mx-auto w-full h-[500px] overflow-y-auto p-4 bg-[#2a2d3d] text-[#bbbed6] rounded-md font-mono text-sm relative"
                >
                    {#each datashow.split("\n") as line, index}
                        <div class="flex flex-col">
                            <div class="flex text-right">
                                <span class="text-gray-500 mr-2">
                                    {index + 1}
                                </span>
                                {#if titledatashow === "Tailoring rules code"}
                                    <span class="whitespace-pre">
                                        {@html line.replace(
                                            /helper\sdef:/g,
                                            '<span class="text-[#9cdbfb]">helper def:</span>',
                                        )}
                                    </span>
                                {:else}
                                    <span class="whitespace-pre text-[#bbbed6]">
                                        {line}
                                    </span>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </code>
            </div>
        </div>
    </div>
{/if}