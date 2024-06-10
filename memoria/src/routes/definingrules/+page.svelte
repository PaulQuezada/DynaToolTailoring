<script lang="ts">
    import "../../app.css";
    import { goto } from "$app/navigation";
    import { themeStore } from "../../stores";
    import "../types";
    import { onMount } from "svelte";
    import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
    import { writable, type Writable } from "svelte/store";
    let searchQuery = "";
    let xmlBpmn: string = "";
    let taskNames: Writable<activity[]> = writable([]);

    // cuando montamos la pagina recolectamos los datos y los guardamos en el store
    onMount(async () => {
        // Verificamos si taskNames existe en el localStorage
        var taskLocalStorage = localStorage.getItem("taskNames")!;
        console.log(taskLocalStorage);
        if (taskLocalStorage != null) {
            const jsonTask = JSON.parse(taskLocalStorage);
            console.log(jsonTask);
            // Ahora igualamos taskNames con jsonTask
            taskNames.set(jsonTask);
        } else {
            xmlBpmn = localStorage.getItem("xmlBpmn")!;
            await handleFileUploadBpmn();
        }
    });

    // Creando una instancia del parser y del builder
    const parserOptions = {
        ignoreAttributes: false,
        attributeNamePrefix: "",
        allowBooleanAttributes: true,
        parseNodeValue: true,
        parseAttributeValue: true,
    };
    const parser = new XMLParser(parserOptions);

    // Función para manejar la carga de archivos BPMN
    async function handleFileUploadBpmn() {
        const jsonObj = parser.parse(xmlBpmn);
        const rootElements = jsonObj["bpmn2:Definitions"].rootElements;
        const flowElements = Array.isArray(rootElements.flowElements)
            ? rootElements.flowElements
            : [rootElements.flowElements];

        // Filtrar las actividades
        const newTaskNames = flowElements
            .filter(
                (fe: { [x: string]: string }) =>
                    fe["xsi:type"] === "bpmn2:Task",
            )
            .map((task: any) => task.name);

        // Convertir los nombres de las actividades en un objeto
        let id = 0;
        var taskNameConverted: activity[] = newTaskNames.map((task: any) => {
            return {
                id: id++,
                name: task,
                rules: [],
            };
        });
        // Guardar las actividades en el store
        taskNames.set(taskNameConverted);
        // Almacenar en el localStorage
        localStorage.setItem("taskNames", JSON.stringify(taskNameConverted));
    }

    // Filtrar actividades
    $: filteredActivities = $taskNames.filter((activity: { name: string }) => {
        var name = (activity as { name: string }).name || "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    function eliminarDeclaracionXML(xmlString: string): string {
        return xmlString.replace(/<\?xml.*\?>\s*/, ""); // Elimina la declaración XML y cualquier espacio adicional al inicio
    }

    function renderizarReglas(reglas: any[]): string {
        return reglas
            .map((regla) => {
                // Cada regla es una ContentRule y se verifica si tiene subreglas para decidir su contenido
                const detallesRegla =
                    regla.rules && regla.rules.length > 0
                        ? regla.rules
                              .map((subRegla: { rules: string | any[]; id: any; name: any; type: any; attribute: any; value: any; }) => {
                                  if (
                                      subRegla.rules &&
                                      subRegla.rules.length > 0
                                  ) {
                                      // Si tiene subreglas, es una ComplexRule y se manejan sus subreglas recursivamente
                                      return `<ComplexRule xsi:type="ComplexRule" id="${subRegla.id}" name="${subRegla.name}">
                    ${renderizarSubReglas(subRegla.rules)}
                </ComplexRule>`;
                                  } else {
                                      // Si no tiene subreglas, es una Rule simple
                                      return `<Rule xsi:type="Rule" id="${subRegla.id}" name="${subRegla.name}" type="${subRegla.type}" attribute="${subRegla.attribute}" value="${subRegla.value || ""}"></Rule>`;
                                  }
                              })
                              .join("")
                        : "";
                return `<ContentRule xsi:type="ContentRule" id="${regla.id}" name="${regla.name}">
            ${detallesRegla}
        </ContentRule>`;
            })
            .join("");
    }

    function renderizarSubReglas(subReglas: any[] | string): string {
        if (Array.isArray(subReglas)) {
            return subReglas
                .map((subRegla) => {
                    if (subRegla.rules && subRegla.rules.length > 0) {
                        // ComplexRule puede tener más reglas dentro
                        return `<ComplexRule xsi:type="ComplexRule" id="${subRegla.id}" name="${subRegla.name}">
                    ${renderizarSubReglas(subRegla.rules)}
                </ComplexRule>`;
                    } else {
                        // Simple Rule sin subreglas
                        return `<Rule xsi:type="Rule" id="${subRegla.id}" name="${subRegla.name}" type="${subRegla.type}" attribute="${subRegla.attribute}" value="${subRegla.value || ""}"></Rule>`;
                    }
                })
                .join("");
        } else {
            // Handle the case when subReglas is a string
            return subReglas;
        }
    }

    function crearModeloIntegrado() {
        let contextoXML = localStorage.getItem("xmlContext")!;
        let actividadesBPMN = localStorage.getItem("xmlBpmn")!;
        const reglas = JSON.parse(localStorage.getItem("taskNames")!);

        contextoXML = eliminarDeclaracionXML(contextoXML);
        actividadesBPMN = eliminarDeclaracionXML(actividadesBPMN);

        const documentoXML = `<?xml version="1.0" encoding="UTF-8"?>
<IntegratedModel xmlns:xmi="http://www.omg.org/XMI" xmlns:spcm="http://contextmetamodel/1.0" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL-XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <ContextModel>
        ${contextoXML}
    </ContextModel>
    <BPMNModel>
        ${actividadesBPMN}
    </BPMNModel>
    <RulesModel>
        ${renderizarReglas(reglas)}
    </RulesModel>
</IntegratedModel>`;

        console.log(documentoXML);
        localStorage.setItem("xmiModelRules", documentoXML);
        return documentoXML;
    }

    function descargarArchivoXMI() {
        const contenidoXMI = crearModeloIntegrado();
        const blob = new Blob([contenidoXMI], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "modelo-integrado.xmi";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
</script>

<div class="flex flex-col h-full w-full">
    <h1
        class="flex mt-3 mb-2 mx-auto text-4xl font-bold {$themeStore ===
        'Light'
            ? 'text-[#454753]'
            : 'text-[#e7ebf1]'}"
    >
        <strong class="text-[#7442c0]">Stage 2: &nbsp;</strong> Defining rules
    </h1>
    <div
        class="mx-auto w-2/3 mt-10 flex flex-col rounded-lg shadow-lg {$themeStore ===
        'Light'
            ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
            : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'} transition duration-300"
    >
        <!-- Buscador -->
        <input
            type="text"
            bind:value={searchQuery}
            placeholder="     Search by activity..."
            class="text-[#6f40b8] mx-auto mt-5 h-[50px] w-3/4 rounded-tl-lg rounded-tr-lg border {$themeStore ===
            'Light'
                ? 'border-[#875fc7] bg-[#ffffff]'
                : 'border-[#462a72] bg-[#14111b]'}"
        />
        <!-- Tabla donde estaran las actividades -->
        <div
            class="w-3/4 h-[400px] mb-5 overflow-y-auto mx-auto rounded-bl-lg rounded-br-lg border-r border-l border-b {$themeStore ===
            'Light'
                ? 'border-[#875fc7] bg-[#ffffff]'
                : 'border-[#462a72] bg-[#14111b]'}"
        >
            <div
                class="mx-10 rounded-md flex flex-col font-bold p-2 text-[#7546c1]"
            >
                <div class="flex flex-row justify-between">
                    <div class="flex mx-10">
                        <span class="material-symbols-outlined">
                            deployed_code
                        </span>
                        <h1 class="my-auto">Activity</h1>
                    </div>
                    <div class="flex mx-10">
                        <span class="material-symbols-outlined"> gavel </span>
                        <h1 class="my-auto">Rule</h1>
                    </div>
                </div>
                <div
                    class="w-full mx-auto mt-2 h-[2px] my-auto bg-[#7546c1]"
                ></div>
            </div>
            <div class="mx-auto text-center">
                {#each filteredActivities as activity (activity.name)}
                    <div class="flex justify-between my-5 mx-auto item-center">
                        <div class="text-[#7546c1]">
                            <div class="flex mx-10">
                                {#if activity.rules.length > 0}
                                    <span
                                        class="mr-2 material-symbols-outlined"
                                    >
                                        check_circle
                                    </span>
                                    <h1 class="my-auto">
                                        {activity.name}
                                    </h1>
                                {:else}
                                    <span
                                        class="mr-2 material-symbols-outlined"
                                    >
                                        pending
                                    </span>
                                    <h1 class="my-auto">
                                        {activity.name}
                                    </h1>
                                {/if}
                            </div>
                        </div>
                        <div class="flex w-[300px]">
                            {#if activity.rules.length > 0}
                                <!-- Si la actividad tiene reglas, se muestra el boton de editar reglas -->
                                <button
                                    class="my-auto mx-auto mr-2 w-1/3 h-[40px] border rounded-md {$themeStore ===
                                    'Light'
                                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                    on:click={() => {
                                        goto("/createrules");
                                    }}
                                >
                                    <div class="flex mx-10 text-sm">
                                        <h1 class="mx-auto">Edit rule</h1>
                                    </div>
                                </button>
                                <!-- Tambien el boton de eliminar -->
                                <button
                                    class="my-auto mx-auto w-1/3 h-[40px] border rounded-md {$themeStore ===
                                    'Light'
                                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                    on:click={() => {
                                        goto("/createrules");
                                    }}
                                >
                                    <div class="flex mx-10 text-sm">
                                        <h1 class="mx-auto">Delete rule</h1>
                                    </div>
                                </button>
                            {:else}
                                <button
                                    class="border w-4/5 h-[40px] mx-auto rounded-md {$themeStore ===
                                    'Light'
                                        ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                        : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                    on:click={() => {
                                        localStorage.setItem(
                                            "activitySelect",
                                            JSON.stringify(activity),
                                        );
                                        goto("/createrules");
                                    }}
                                >
                                    <div class="flex mx-10">
                                        <h1 class="my-auto mx-auto">
                                            Create rule
                                        </h1>
                                    </div>
                                </button>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        <!-- Botones para seguir avanzando o no -->
        <div class="flex justify-between mx-10 mb-4">
            <button
                class="border font-bold rounded-md p-2 hover:shadow-2xl transition duration-300 {$themeStore ===
                'Light'
                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
            >
                <div class="flex my-auto">
                    <span class="material-symbols-outlined text-lg mr-1"
                        >arrow_back_ios</span
                    >
                    <h1 class="my-auto text-sm mx-2">Back Stage</h1>
                </div>
            </button>
            <button
                class="border font-bold rounded-md p-2 hover:shadow-2xl transition duration-300 {$themeStore ===
                'Light'
                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                on:click={() => {
                    crearModeloIntegrado();
                    descargarArchivoXMI();
                }}
            >
                <div class="flex my-auto">
                    <h1 class="my-auto text-sm mx-2">Next Stage</h1>
                    <span class="material-symbols-outlined text-lg ml-1"
                        >arrow_forward_ios</span
                    >
                </div>
            </button>
        </div>
    </div>
</div>