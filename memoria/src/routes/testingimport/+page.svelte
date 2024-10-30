<script lang="ts">
    // Importaciones de módulos
    import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
    import { writable } from "svelte/store";

    let files: FileList | undefined;
    let xmlContext: string = "";
    let xmlBpmn: string = "";

    let attributesContext: any[] = [];
    let taskNames = writable([]);

    // Creando una instancia del parser y del builder
    const parserOptions = {
        ignoreAttributes: false, // Asegúrate de que los atributos no se ignoren
        attributeNamePrefix: "", // Elimina cualquier prefijo en los nombres de atributos
        allowBooleanAttributes: true, // Permite atributos booleanos
        parseNodeValue: true,
        parseAttributeValue: true,
    };

    const parser = new XMLParser(parserOptions);
    const builder = new XMLBuilder();

    // Función para manejar la carga de archivos contexto organizacional
    async function handleFileUploadContext(event: Event) {
        // Lectura de archivos
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            xmlContext = await file.text();

            // Backend para procesar el archivo XML
            const jsonObj = parser.parse(xmlContext);
            console.log(jsonObj);
            const dimensions = Array.isArray(
                jsonObj["spcm:Context"].myDimensions,
            )
                ? jsonObj["spcm:Context"].myDimensions
                : [jsonObj["spcm:Context"].myDimensions];

            let newAttributesContext: any[] = []; // Usar una variable temporal para almacenar los nuevos datos

            dimensions.forEach((dim: any) => {
                const contextAttributes = Array.isArray(dim.myContextAttributes)
                    ? dim.myContextAttributes
                    : [dim.myContextAttributes];

                contextAttributes.forEach((attr: any) => {
                    const values = Array.isArray(attr.posibleValues)
                        ? attr.posibleValues
                        : attr.posibleValues
                          ? [attr.posibleValues]
                          : [];
                    const attributeData = {
                        Attribute: attr.name,
                        values: values.map((val: any) =>
                            val.name ? val.name : "Unknown",
                        ),
                    };
                    newAttributesContext.push(attributeData); // Agregar a la variable temporal
                });
            });

            attributesContext = newAttributesContext; // Reasignar a la variable original
            // RETURN del backend (EMULADO)
            console.log(JSON.stringify(attributesContext, null, 2));
        }
    }

    // Función para manejar la carga de archivos BPMN
    async function handleFileUploadBpmn(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            xmlBpmn = await file.text();
            const jsonObj = parser.parse(xmlBpmn);
            const rootElements = jsonObj["bpmn2:Definitions"].rootElements;
            const flowElements = Array.isArray(rootElements.flowElements)
                ? rootElements.flowElements
                : [rootElements.flowElements];

            const newTaskNames = flowElements
                .filter(
                    (fe: { [x: string]: string }) =>
                        fe["xsi:type"] === "bpmn2:Task",
                )
                .map((task: any) => task.name);

            // Actualiza el store con los nuevos nombres de las tareas
            taskNames.set(newTaskNames);
        }
    }
</script>

<h1 class="flex justify-center mt-10 text-2xl bold-text">
    Contexto organizacional
</h1>
<div class="flex flex-row">
    <div
        class="h-[500px] mr-2 w-1/2 border border-black mx-10 mt-10 overflow-y-auto rounded-md"
    >
        <h1 class="flex justify-center mt-5 text-2xl bold-text">
            Importar Modelo
        </h1>
        <input
            class="ml-5 mt-5"
            type="file"
            on:change={handleFileUploadContext}
        />
        <div class="w-full h-[2px] mx-auto bg-black my-7"></div>
        <pre>{xmlContext}</pre>
    </div>
    <div
        class="h-[500px] w-1/2 border border-black mx-10 mt-10 overflow-y-auto rounded-md"
    >
        <h1 class="flex justify-center mt-5 text-2xl bold-text">
            Listar actividades
        </h1>
        <div class="w-full h-[2px] mx-auto bg-black my-7"></div>
        <pre>{JSON.stringify(attributesContext, null, 2)}</pre>
    </div>
</div>
<h1 class="flex justify-center mt-10 text-2xl bold-text">
    Procesos de negocios en BPMN
</h1>
<div class="flex flex-row">
    <div
        class="h-[500px] mr-2 w-1/2 border border-black mx-10 mt-10 overflow-y-auto rounded-md"
    >
        <h1 class="flex justify-center mt-5 text-2xl bold-text">
            Importar Modelo
        </h1>
        <input class="ml-5 mt-5" type="file" on:change={handleFileUploadBpmn} />
        <div class="w-full h-[2px] mx-auto bg-black my-7"></div>
        <pre>{xmlBpmn}</pre>
    </div>
    <div
        class="h-[500px] w-1/2 border border-black mx-10 mt-10 mb-10 overflow-y-auto rounded-md"
    >
        <h1 class="flex justify-center mt-5 text-2xl bold-text">
            Listar actividades
        </h1>
        <div class="w-full h-[2px] mx-auto bg-black my-7"></div>
        <pre>
            {#each $taskNames as task}
                <p class="ml-10 ">{task}</p>
            {/each}
        </pre>
    </div>
</div>