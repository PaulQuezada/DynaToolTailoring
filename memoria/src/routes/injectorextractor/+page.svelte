<!-- src/routes/index.svelte -->
<script lang="ts">
    // Importaciones de módulos
    import { goto } from "$app/navigation";
    import "../../app.css";
    import { writable } from "svelte/store";
    import { themeStore } from "../../stores";
    import "../../functions/datamanager";
    import { setDataProcess } from "../../functions/datamanager";
    import { fileUpload } from "../../functions/importdata";
    // Variable para saber si dropearan un archivo
    let dropFile = writable(false);

    // Función para agregar el archivo importado a la carpeta ImportedFiles
    async function saveToFileSystem(event: Event) {
        try {
            // Obtener el contenido del archivo como string
            const bpmnContent = await fileUpload(event); // Aquí debes obtener el contenido como string
            if (!bpmnContent) {
                console.error(
                    "No se ha seleccionado un archivo o el archivo está vacío.",
                );
                return;
            }

            // Crear un Blob a partir del contenido del archivo
            const blob = new Blob([bpmnContent], { type: "text/xml" }); // Especifica el tipo MIME como 'text/xml'

            // Crear un objeto File a partir del Blob (opcional si necesitas un archivo)
            const file = new File([blob], "file.bpmn", { type: "text/xml" });

            // Crear un objeto FormData y añadir el archivo
            const formData = new FormData();
            formData.append("file", file); // Añadir el archivo al formData

            // Enviar el archivo al servidor utilizando fetch
            const response = await fetch("http://localhost:3000/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Error al subir el archivo al servidor");
            }

            console.log("Archivo subido con éxito.");
        } catch (error) {
            console.error("Hubo un error al subir el archivo:", error);
        }
    }

    // Función para ejecutar el JAR que realiza la transformación de BPMN a un MODELO XMI
    async function executeTransformation() {
        const response = await fetch("http://localhost:3000/run-jar");
        const result = await response.text();
        console.log(result);
        setDataProcess(result);
    }
</script>

<div class="flex flex-col h-full w-full">
    <h1
        class="flex mt-3 mb-2 mx-auto text-4xl font-bold {$themeStore ===
        'Light'
            ? 'text-[#454753]'
            : 'text-[#e7ebf1]'}"
    >
        <strong class="text-[#7442c0]">Stage 1: &nbsp;</strong> Import the model
    </h1>
    <div
        class="mx-auto w-2/3 mt-10 flex flex-col rounded-lg shadow-lg border-2 {$themeStore ===
        'Light'
            ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
            : 'bg-[#14111c] border-[#14111c] shadow-[0_0_30px_#31214c]'} transition duration-300"
    >
        <!-- Titulo -->
        <h1
            class="flex mt-10 mb-2 mx-auto text-2xl font-bold {$themeStore ===
            'Light'
                ? 'text-[#14111b]'
                : 'text-[#b498df]'}"
        >
            Upload your BPMN file
        </h1>
        <div
            class="mx-auto w-1/2 h-[5px] my-auto {$themeStore === 'Light'
                ? 'bg-[#14111b]'
                : 'bg-[#b498df]'}"
        ></div>
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
                    await saveToFileSystem(e);
                    $dropFile = true;
                }}
            />
            <div
                class="absolute mt-10 p-10 flex flex-col text-center items-center mx-auto {$dropFile
                    ? 'animate-pulse'
                    : ''}"
            >
                {#if $dropFile}
                    <svg
                        height="48px"
                        width="48px"
                        viewBox="0 0 24 24"
                        fill={$themeStore === "Light" ? "#7f5fc0" : "#6746b4"}
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
                        fill={$themeStore === "Light" ? "#7f5fc0" : "#6746b4"}
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
                on:click={() => {
                    goto("/");
                }}
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
                    executeTransformation();
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
    </div>
</div>
