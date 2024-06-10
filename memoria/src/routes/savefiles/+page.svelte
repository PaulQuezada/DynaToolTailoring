<!-- src/routes/index.svelte -->
<script lang="ts">
    import "../../app.css";
    import { themeStore } from "../../stores";
</script>

<div class="flex flex-col h-full w-full">
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
            <button
                class="absolute top-0 right-0 -mt-4 -mr-4 rounded-full p-3 border-dashed border-2 {$themeStore ===
                'Light'
                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
            >
                <span class="my-auto material-symbols-outlined">download</span>
            </button>
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
            <button
                class="absolute top-0 right-0 -mt-4 -mr-4 rounded-full p-3 border-dashed border-2 {$themeStore ===
                'Light'
                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
            >
                <span class="my-auto material-symbols-outlined">download</span>
            </button>
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