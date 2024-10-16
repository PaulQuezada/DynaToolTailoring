<!-- src/routes/index.svelte -->
<script lang="ts">
    // Importaciones de módulos
    import { goto } from "$app/navigation";
    import { writable } from "svelte/store";
    import { themeStore } from "../../stores";
    import { getNotificationsContext } from "svelte-notifications";
    import ContextView from "../../components/context/Context.svelte";
    import ProcessView from "../../components/process/Process.svelte";
    import TransformView from "../../components/transform/Transform.svelte";
    import "../types";
    import "../../app.css";
    const { addNotification } = getNotificationsContext();
    let successContext: boolean = false;
    let successProcess: boolean = false;
    let successTransform: boolean = false;

    // Estado de la etapa actual
    let currentStage = writable(1);

    // Variable para saber que etapas estan listas
    let stageImportContext: boolean = false;
    let stageImportBpmn: boolean = false;

    // Función para manejar el avance a la siguiente etapa
    function handleNext() {
        currentStage.update((stage) => (stage < 3 ? stage + 1 : stage));
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
    }

    // Variable reactiva para cuando cambie successTransform
    $: {
        if(successContext){
            addNotification({
                text: "The context was correctly saved in the system.",
                position: "top-right",
                type: "success",
                removeAfter: 2000,
            });
        }
        if(successProcess){
            addNotification({
                text: "The process was correctly saved in the system.",
                position: "top-right",
                type: "success",
                removeAfter: 2000,
            });
        }
        if (successTransform) {
            addNotification({
                text: "The data has been correctly saved in the system.",
                position: "top-right",
                type: "success",
                removeAfter: 2000,
            });
            goto("/listofrules");
        }
    }

    // Variable reactiva para el título
    $: stageTitle = getStageTitle($currentStage);

    function getStageTitle(stage: number): string {
        switch (stage) {
            case 1:
                return "Create your project context model in XMI notation";
            case 2:
                return "Import your business process model in BPMN notation";
            case 3:
                return "Make sure your file is correct";
            default:
                return "";
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
        <strong class="text-[#7442c0]">Stage 1: &nbsp;</strong> Creating the files
    </h1>
    <div
        class="mx-auto w-2/3 overflow-y-auto mt-10 flex flex-col rounded-lg shadow-lg border-2 {$themeStore ===
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
            <div class="mx-10 my-2">
                <ContextView bind:successContext />
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
                    class="font-bold border rounded-md p-2 hover:shadow-2xl disabled:opacity-50 transition duration-300 {$themeStore ===
                    'Light'
                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                    on:click={handleNext}
                    disabled={!successContext}
                >
                    <div class="flex my-auto">
                        <h1 class="my-auto text-sm mx-2">Next</h1>
                        <span class="material-symbols-outlined text-lg ml-1">
                            arrow_forward_ios
                        </span>
                    </div>
                </button>
            </div>
        {/if}
        <!-- Importar proceso de negocio hecho en BPMN en .XMI -->
        {#if $currentStage === 2}
            <!-- Apartado para importar arrastrando o manualmente -->
            <ProcessView bind:successProcess />
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
                    class="font-bold border rounded-md p-2 hover:shadow-2xl disabled:opacity-50 transition duration-300 {$themeStore ===
                    'Light'
                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                    type="submit"
                    disabled={!successProcess}
                    on:click={() => {
                        handleNext();
                    }}
                >
                    <div class="flex my-auto">
                        <h1 class="my-auto text-sm mx-2">Next</h1>
                        <span class="material-symbols-outlined text-lg ml-1">
                            arrow_forward_ios
                        </span>
                    </div>
                </button>
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
                    {#if successContext}
                        <div class="flex flex-row">
                            <span
                                class="mx-2 my-auto text-3xl material-symbols-outlined"
                            >
                                verified
                            </span>
                            <h1 class="my-auto mr-2 text-sm">Correct data</h1>
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
                            Filename in system: context.xmi
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
                    {#if successProcess}
                        <div class="flex flex-row">
                            <span
                                class="mx-2 my-auto text-3xl material-symbols-outlined"
                            >
                                verified
                            </span>
                            <h1 class="my-auto mr-2 text-sm">Correct data</h1>
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
                            Process in BPMN notation
                        </h1>
                        <h1
                            class="text-sm {$themeStore === 'Light'
                                ? 'text-[#7f5fc0]'
                                : 'text-[#6746b4]'}"
                        >
                            Filename in system: process.bpmn
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
                {#if successContext && successProcess}
                    <TransformView bind:successTransform />
                {:else}
                    <h1>DATA PROBLEM</h1>
                {/if}
            </div>
        {/if}
    </div>
</div>
