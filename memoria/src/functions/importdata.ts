import { XMLParser } from "fast-xml-parser";
import { writable, type Writable } from "svelte/store";

// Creando la instancia del parser y del builder que se utilizará para procesar los archivos XML
const parserOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "",
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
};
const parser = new XMLParser(parserOptions);

// Función para extraer el nombre del archivo
export async function nameFileUpload(event: Event) {
    const input = event.target as HTMLInputElement; // Lectura del archivo
    let nameFileContex: string = input.files![0].name; // Actualiza el nombre del archivo para saber el nombre del archivo importado
    return nameFileContex;
}

// Función para manejar la carga de archivos contexto organizacional
export async function fileUploadContext(event: Event) {
    let xmlContext: string = ""; // Variable para almacenar los datos del archivo de contexto organizacional
    let attributesContext: any[] = []; // Variable para almacenar los datos del contexto organizacional
    const input = event.target as HTMLInputElement; // Lectura del archivo
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        xmlContext = await file.text();
        const jsonObj = parser.parse(xmlContext);
        // se obtienen los datos que nos interesan del contexto organizacional
        const dimensions = Array.isArray(
            jsonObj["spcm:Context"].myDimensions,
        )
            ? jsonObj["spcm:Context"].myDimensions
            : [jsonObj["spcm:Context"].myDimensions];

       
        // Recorrer las dimensiones del contexto organizacional y obtener los atributos
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
                attributesContext.push(attributeData); // almacenar los datos de los atributos a la variable
            });
        });
    }
    // Retorna los datos del contexto organizacional y los datos extraidos del archivo
    return [attributesContext, xmlContext];
}

// Función para manejar la carga de archivos BPMN
export async function fileUploadBpmn(event: Event) {
    let task: any = []; // Variable para almacenar los nombres de las tareas
    let xmlBpmn: string = ""; // Variable para almacenar los datos del archivo BPMN
    const input = event.target as HTMLInputElement;// Lectura del archivo
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
        task = newTaskNames;
    }
    // Retorna los datos del archivo BPMN y los datos extraidos del archivo
    return [task, xmlBpmn];
}
