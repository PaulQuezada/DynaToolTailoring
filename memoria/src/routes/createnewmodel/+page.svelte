<!-- src/routes/index.svelte -->
<script lang="ts">
    // Importaciones de módulos
    import { goto } from "$app/navigation";
    import { writable } from "svelte/store";
    import { themeStore } from "../../stores";
    import "../../app.css";
    import {
        fileUploadContext,
        fileUploadBpmn,
        nameFileUpload,
        fileUpload,
    } from "../../functions/importdata";

    // Variable para saber si dropearan un archivo
    let dropFile = writable(false);
    // Estado de la etapa actual
    let currentStage = writable(1);

    // Variables que contendran los contenidos del contexto organizacional y del BPMN
    let nameFileContex: string = "";
    let nameFileBpmn: string = "";
    let xmlContext: string = "";
    let xmlBpmn: string = "";

    // Variable para saber que etapas estan listas
    let stageImportContext: boolean = false;
    let stageImportBpmn: boolean = false;

    // Variables en donde se almacenaran los datos extraidos de los archivos
    let extractAttributes: any[] = [];
    let extractTask: any = [];

    // Variables que indicaran si estan verificados los archivos XMI
    let verifyContext = writable(false);
    let verifyBpmn = writable(false);

    // Función para manejar el avance a la siguiente etapa
    function handleNext() {
        currentStage.update((stage) => (stage < 3 ? stage + 1 : stage));
        if($currentStage == 1) {
            stageImportContext = false;
            stageImportBpmn = false;
        } else if ($currentStage == 2) {
            stageImportContext = true;
            stageImportBpmn = false;
        } else if ($currentStage == 3) {
            stageImportContext = true;
            stageImportBpmn = true;
        }
        $dropFile = false;
    }

    // Función para manejar el retroceso a la etapa anterior
    function handleBack() {
        currentStage.update((stage) => (stage > 1 ? stage - 1 : stage));
        if ($currentStage == 1) {
            stageImportContext = false;
            stageImportBpmn = false;
        } else if ($currentStage == 2) {
            stageImportContext = true;
            stageImportBpmn = false;
        } else if ($currentStage == 3) {
            stageImportContext = true;
            stageImportBpmn = true;
        }
        $dropFile = false;
    }

    // Variable reactiva para el título
    $: stageTitle = getStageTitle($currentStage);

    function getStageTitle(stage: number): string {
        switch (stage) {
            case 1:
                return "Import the organizational context model";
            case 2:
                return "Import your business process model in BPMN notation";
            case 3:
                return "Make sure your file is correct";
            default:
                return "";
        }
    }

    // Función para manejar la carga de archivos contexto organizacional
    async function uploadContext(event: Event) {
        nameFileContex = await nameFileUpload(event);
        xmlContext = JSON.parse(JSON.stringify(await fileUpload(event))); // Extraer el contenido del archivo XMI
        try {
            extractAttributes = JSON.parse(
                JSON.stringify(await fileUploadContext(xmlContext)),
            ); // Extraer los atributos del archivo XMI
            //console.log(nameFileContex);
            //console.log(xmlContext);
            //console.log(JSON.stringify(extractAttributes, null, 2));
            verifyContext.set(extractAttributes.length > 0); // Verificar si el attributeContext tiene datos, entonces es correcto
        } catch (error) {
            console.log(error);
        }
    }

    // Función para manejar la carga de archivos BPMN
    async function uploadBpmn(event: Event) {
        nameFileBpmn = await nameFileUpload(event);
        xmlBpmn = JSON.parse(JSON.stringify(await fileUpload(event))); // Extraer el contenido del archivo BPMN
        try {
            extractTask = JSON.parse(JSON.stringify(await fileUploadBpmn(xmlBpmn))); // Extraer las tareas del archivo BPMN
            //console.log(nameFileBpmn);
            //console.log(xmlBpmn);
            //console.log(JSON.stringify(extractTask, null, 2));
            verifyBpmn.set(extractTask.length > 0); // Verificar si el attributeContext tiene datos entonces, es correcto
        } catch (error) {
            console.log(error);
        }
    }
</script>

<div class="flex flex-col h-full w-full">
    <h1
        class="flex mt-3 mb-2 mx-auto text-4xl font-bold {$themeStore ===
        'Light'
            ? 'text-[#454753]'
            : 'text-[#e7ebf1]'}"
    >
        <strong class="text-[#7442c0]">Stage 1: &nbsp;</strong> Import of the models
    </h1>
    <div
        class="mx-auto w-2/3 mt-10 flex flex-col rounded-lg shadow-lg border-2 {$themeStore ===
        'Light'
            ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
            : 'bg-[#14111c] border-[#14111c] shadow-[0_0_30px_#31214c]'} transition duration-300"
    >
        <!-- Etapas -->
        <div class="mt-8 flex justify-center">
            {#each [1, 2, 3] as stage}
                {#if $themeStore === "Light"}
                    <div
                        class="flex w-[40px] h-[40px] border {$currentStage ==
                        stage
                            ? 'border-[#454752] border-[1.5px]'
                            : 'border-[#7f5fc1]'} bg-[#f1e9f9] text-[#7a60bb] rounded-full p-2"
                    >
                        {#if stage == 1 && stageImportContext}<span
                                class="material-symbols-outlined"
                            >
                                check
                            </span>{:else if stage == 2 && stageImportBpmn}<span
                                class="material-symbols-outlined"
                            >
                                check
                            </span>{:else}
                            <h1 class="my-auto mx-auto">{stage}</h1>
                        {/if}
                    </div>
                    {#if stage < 3}
                        <div
                            class="bg-[#f1e9f9] w-[20px] h-[2px] my-auto"
                        ></div>
                    {/if}
                {:else}
                    <div
                        class="flex w-[40px] h-[40px] border {$currentStage ==
                        stage
                            ? 'border-[#ffffff] border-[1.5px]'
                            : 'border-[#523085]'} bg-[#251835] text-[#523085] rounded-full p-2"
                    >
                        {#if stage == 1 && stageImportContext}<span
                                class="material-symbols-outlined"
                            >
                                check
                            </span>{:else if stage == 2 && stageImportBpmn}<span
                                class="material-symbols-outlined"
                            >
                                check
                            </span>{:else}
                            <h1 class="my-auto mx-auto">{stage}</h1>
                        {/if}
                    </div>
                    {#if stage < 3}
                        <div
                            class="bg-[#523085] w-[20px] h-[2px] my-auto"
                        ></div>
                    {/if}
                {/if}
            {/each}
        </div>
        <!-- Titulo -->
        <h1
            class="flex mt-10 mb-2 mx-auto text-2xl font-bold {$themeStore ===
            'Light'
                ? 'text-[#14111b]'
                : 'text-[#b498df]'}"
        >
            {stageTitle}
        </h1>
        <div
            class="mx-auto w-1/2 h-[5px] my-auto {$themeStore === 'Light'
                ? 'bg-[#14111b]'
                : 'bg-[#b498df]'}"
        ></div>
        <!-- Importar modelo del contexto XMI -->
        {#if $currentStage === 1}
            <!-- Apartado para importar arrastrando o manualmente -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="relative z-99 flex justify-center mt-5 w-2/3 h-[250px] mb-10 mx-auto rounded-xl {$themeStore ===
                'Light'
                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'} border-2 border-dashed"
                on:dragover={(e) => {
                    e.preventDefault();
                    $dropFile = true;
                }}
                on:dragleave={(e) => {
                    e.preventDefault();
                    $dropFile = false;
                }}
                on:durationchange={(e) => {
                    e.preventDefault();
                    $dropFile = false;
                }}
            >
                <!-- Input oculto para cargar el archivo -->
                <input
                    type="file"
                    id="fileUploadContext"
                    class="absolute h-full w-full bg-red border opacity-0 cursor-pointer top-0 left-0 z-10"
                    on:change={async (e) => {
                        await uploadContext(e);
                        if($verifyContext) $dropFile = true;
                    }}
                />
                <div
                    class="absolute mt-10 p-10 flex flex-col text-center items-center mx-auto {$dropFile
                        ? 'animate-pulse'
                        : ''}"
                >
                    {#if $verifyContext}
                        <svg
                            height="48px"
                            width="48px"
                            viewBox="0 0 24 24"
                            fill={$themeStore === "Light"
                                ? "#7f5fc0"
                                : "#6746b4"}
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H10M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V12.8125"
                                stroke="#000000"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                            <path
                                d="M13 19L15 21L20 16"
                                stroke="#000000"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <h1
                            class="font-black {$themeStore === 'Light'
                                ? 'text-[#7f5fc0]'
                                : 'text-[#6746b4]'} 
                        "
                        >
                            Imported model!
                        </h1>
                    {:else}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="48px"
                            viewBox="0 -960 960 960"
                            width="48px"
                            fill={$themeStore === "Light"
                                ? "#7f5fc0"
                                : "#6746b4"}
                        >
                            <path
                                d="M280-280h400v-60H280v60Zm197-126 158-157-42-42-85 84v-199h-60v199l-85-84-42 42 156 157Zm3 326q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z"
                            />
                        </svg>
                        <h1
                            class="font-black {$themeStore === 'Light'
                                ? 'text-[#7f5fc0]'
                                : 'text-[#6746b4]'} 
                        "
                        >
                            Drag your file here
                        </h1>
                    {/if}
                </div>
            </div>

            <!-- Botones para seguir avanzando o no -->
            <div class="flex justify-between mx-10 mb-4">
                <button
                    class="font-bold border rounded-md p-2 hover:shadow-2xl transition duration-300 {$themeStore ===
                    'Light'
                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                    on:click={handleBack}
                >
                    <div class="flex my-auto">
                        <span class="material-symbols-outlined text-lg mr-1">
                            arrow_back_ios
                        </span>
                        <h1 class="my-auto text-sm mx-2">Back</h1>
                    </div>
                </button>
                {#if nameFileContex != ""}
                    <button
                        class="font-bold border rounded-md p-2 hover:shadow-2xl transition duration-300 {$themeStore ===
                        'Light'
                            ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                            : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                        on:click={handleNext}
                    >
                        <div class="flex my-auto">
                            <h1 class="my-auto text-sm mx-2">Next</h1>
                            <span
                                class="material-symbols-outlined text-lg ml-1"
                            >
                                arrow_forward_ios
                            </span>
                        </div>
                    </button>
                {:else}
                    <button
                        class="font-bold border rounded-md p-2 disabled:opacity-50 transition duration-300 {$themeStore ===
                        'Light'
                            ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                            : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                        disabled
                    >
                        <div class="flex my-auto">
                            <h1 class="my-auto text-sm mx-2">Next</h1>
                            <span
                                class="material-symbols-outlined text-lg ml-1"
                            >
                                arrow_forward_ios
                            </span>
                        </div>
                    </button>
                {/if}
            </div>
        {/if}
        <!-- Importar proceso de negocio hecho en BPMN en .XMI -->
        {#if $currentStage === 2}
            <!-- Apartado para importar arrastrando o manualmente -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="relative z-99 flex justify-center mt-5 w-2/3 h-[250px] mb-10 mx-auto rounded-xl {$themeStore ===
                'Light'
                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'} border-2 border-dashed"
                on:dragover={(e) => {
                    e.preventDefault();
                    $dropFile = true;
                }}
                on:dragleave={(e) => {
                    e.preventDefault();
                    $dropFile = false;
                }}
                on:durationchange={(e) => {
                    e.preventDefault();
                    $dropFile = false;
                }}
            >
                <!-- Input oculto para cargar el archivo -->
                <input
                    type="file"
                    id="fileUploadContext"
                    class="absolute h-full w-full bg-red border opacity-0 cursor-pointer top-0 left-0 z-10"
                    on:change={async (e) => {
                        await uploadBpmn(e);
                        if(verifyBpmn) {$dropFile = true;}
                    }}
                />
                <div
                    class="absolute mt-10 p-10 flex flex-col text-center items-center mx-auto {$dropFile
                        ? 'animate-pulse'
                        : ''}"
                >
                    {#if $verifyBpmn}
                        <svg
                            height="48px"
                            width="48px"
                            viewBox="0 0 24 24"
                            fill={$themeStore === "Light"
                                ? "#7f5fc0"
                                : "#6746b4"}
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H10M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V12.8125"
                                stroke="#000000"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                            <path
                                d="M13 19L15 21L20 16"
                                stroke="#000000"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>{:else}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="48px"
                            viewBox="0 -960 960 960"
                            width="48px"
                            fill={$themeStore === "Light"
                                ? "#7f5fc0"
                                : "#6746b4"}
                        >
                            <path
                                d="M280-280h400v-60H280v60Zm197-126 158-157-42-42-85 84v-199h-60v199l-85-84-42 42 156 157Zm3 326q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z"
                            />
                        </svg>
                    {/if}
                    <h1
                        class="font-black {$themeStore === 'Light'
                            ? 'text-[#7f5fc0]'
                            : 'text-[#6746b4]'} 
                        "
                    >
                        Drag your file here
                    </h1>
                </div>
            </div>

            <!-- Botones para seguir avanzando o no -->
            <div class="flex justify-between mx-10 mb-4">
                <button
                    class="font-bold border rounded-md p-2 hover:shadow-2xl transition duration-300 {$themeStore ===
                    'Light'
                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                    on:click={handleBack}
                >
                    <div class="flex my-auto">
                        <span class="material-symbols-outlined text-lg mr-1">
                            arrow_back_ios
                        </span>
                        <h1 class="my-auto text-sm mx-2">Back</h1>
                    </div>
                </button>
                {#if nameFileBpmn != ""}
                    <button
                        class="font-bold border rounded-md p-2 hover:shadow-2xl transition duration-300 {$themeStore ===
                        'Light'
                            ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                            : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                        on:click={handleNext}
                    >
                        <div class="flex my-auto">
                            <h1 class="my-auto text-sm mx-2">Next</h1>
                            <span
                                class="material-symbols-outlined text-lg ml-1"
                            >
                                arrow_forward_ios
                            </span>
                        </div>
                    </button>
                {:else}
                    <button
                        class="font-bold border rounded-md p-2 disabled:opacity-50 transition duration-300 {$themeStore ===
                        'Light'
                            ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                            : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                        disabled
                    >
                        <div class="flex my-auto">
                            <h1 class="my-auto text-sm mx-2">Next</h1>
                            <span
                                class="material-symbols-outlined text-lg ml-1"
                            >
                                arrow_forward_ios
                            </span>
                        </div>
                    </button>
                {/if}
            </div>
        {/if}
        <!-- Verificar los datos de los datos importados -->
        {#if $currentStage === 3}
            <!-- Apartado para verificar el conexto organizacional -->
            <div
                class="relative my-10 mx-auto w-2/3 h-1/2 border-2 border-dashed rounded-xl {$themeStore ===
                'Light'
                    ? 'border-[#b8a2de]'
                    : 'border-[#6746b4]'}"
            >
                <div
                    class="absolute top-0 right-0 -mt-4 -mr-4 rounded-full p-2 border {$themeStore ===
                    'Light'
                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                >
                    {#if $verifyContext}
                        <div class="flex flex-row">
                            <span
                                class="mx-2 my-auto text-3xl material-symbols-outlined"
                            >
                                verified
                            </span>
                            <h1 class="my-auto mr-2 text-sm">Verified data</h1>
                        </div>
                    {:else}
                        <div class="flex flex-row">
                            <span
                                class="mx-2 my-auto text-3xl material-symbols-outlined bg-[#f1e9f9] text-[#855dc7]"
                            >
                                error
                            </span>
                            <h1 class="my-auto mr-2 text-sm">Data error</h1>
                        </div>
                    {/if}
                </div>
                <div class="p-10 flex flex-row mx-auto">
                    <span
                        class="my-auto mr-4 text-[50px] {$themeStore === 'Light'
                            ? 'text-[#7f5fc0]'
                            : 'text-[#6746b4]'} material-symbols-outlined"
                    >
                        draft
                    </span>
                    <div class="my-auto flex flex-col">
                        <h1
                            class="text-2xl font-black {$themeStore === 'Light'
                                ? 'text-[#7f5fc0]'
                                : 'text-[#6746b4]'}"
                        >
                            Organizational context model
                        </h1>
                        <h1
                            class="text-sm {$themeStore === 'Light'
                                ? 'text-[#7f5fc0]'
                                : 'text-[#6746b4]'}"
                        >
                            Filename: {nameFileContex}
                        </h1>
                    </div>
                </div>
            </div>
            <!-- Apartado para verificar el proceso de negocio en BPMN -->
            <div
                class="relative mb-10 mx-auto w-2/3 h-1/2 border-2 border-dashed rounded-xl {$themeStore ===
                'Light'
                    ? 'border-[#b8a2de]'
                    : 'border-[#6746b4]'}"
            >
                <div
                    class="absolute top-0 right-0 -mt-4 -mr-4 rounded-full p-2 border {$themeStore ===
                    'Light'
                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                >
                    {#if $verifyBpmn}
                        <div class="flex flex-row">
                            <span
                                class="mx-2 my-auto text-3xl material-symbols-outlined"
                            >
                                verified
                            </span>
                            <h1 class="my-auto mr-2 text-sm">Verified data</h1>
                        </div>
                    {:else}
                        <div class="flex flex-row">
                            <span
                                class="mx-2 my-auto text-3xl material-symbols-outlined bg-[#f1e9f9] text-[#855dc7]"
                            >
                                error
                            </span>
                            <h1 class="my-auto mr-2 text-sm">Data error</h1>
                        </div>
                    {/if}
                </div>
                <div class="p-10 flex flex-row mx-auto">
                    <span
                        class="my-auto mr-4 text-[50px] {$themeStore === 'Light'
                            ? 'text-[#7f5fc0]'
                            : 'text-[#6746b4]'} material-symbols-outlined"
                    >
                        draft
                    </span>
                    <div class="my-auto flex flex-col">
                        <h1
                            class="text-2xl font-black {$themeStore === 'Light'
                                ? 'text-[#7f5fc0]'
                                : 'text-[#6746b4]'}"
                        >
                            Business context model
                        </h1>
                        <h1
                            class="text-sm {$themeStore === 'Light'
                                ? 'text-[#7f5fc0]'
                                : 'text-[#6746b4]'}"
                        >
                            Filename: {nameFileBpmn}
                        </h1>
                    </div>
                </div>
            </div>
            <!-- Botones para seguir avanzando o no -->
            <div class="flex justify-between mx-10 mb-4">
                <button
                    class="font-bold border rounded-md p-2 hover:shadow-2xl transition duration-300 {$themeStore ===
                    'Light'
                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                    on:click={handleBack}
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
                    on:click={() => {
                        localStorage.setItem("xmlContext", xmlContext);
                        localStorage.setItem("xmlBpmn", xmlBpmn);
                        goto("/listofrules");
                    }}
                >
                    <div class="flex my-auto">
                        <h1 class="my-auto text-sm mx-2">Next Stage</h1>
                        <span class="material-symbols-outlined text-lg ml-1">
                            arrow_forward_ios
                        </span>
                    </div>
                </button>
            </div>
        {/if}
    </div>
</div>
