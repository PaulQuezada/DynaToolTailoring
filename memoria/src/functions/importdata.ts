import { XMLParser } from "fast-xml-parser";


// ********** Importar datos BPMN y el contexto en formato XMI **********

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

// Función para extraer los datos de un archivo XMI
export async function fileUpload(event: Event) {
    let xml: string = ""; // Variable para almacenar los datos del archivo
    const input = event.target as HTMLInputElement; // Lectura del archivo
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        xml = await file.text();
    }
    return xml;
}

// Función para extraer los datos del archivo contexto organizacional
export async function fileUploadContext(xmlContext: string) {
    let attributesContext: any[] = []; // Variable para almacenar los datos del contexto organizacional
    if (xmlContext !== "") {
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
    return attributesContext;
}

// Función para extraer los datos del archivo BPMN
export async function fileUploadBpmn(xmlBpmn: string) {
    let task: any = []; // Variable para almacenar los nombres de las tareas
    if (xmlBpmn !== "") {
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
    return task;
}

// ********** Importar modelo con reglas de transformación **********

// Función para extraer los datos del archivo de reglas de transformación
export function fileUploadTailoringModel(xmlModel: string) {
    let isSuccessful: boolean = false; // Variable para almacenar si la carga del archivo fue exitosa
    if (xmlModel !== "") {
        // Variables para almacenar los datos extraidos del archivo
        let attributesAndValues: any[] = [];
        let onlyAttributes: any[] = [];
        let activities: activity[] = [];
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlModel, "text/xml");

        // Extraer los modelos de contexto, bpmn y reglas
        const contextModelNode = xmlDoc.querySelector("ContextModel");
        const bpmnModelNode = xmlDoc.querySelector("BPMNModel");
        const rulesModelNode = xmlDoc.querySelector("RulesModel");

        let contextModel = contextModelNode
            ? contextModelNode.innerHTML.trim()
            : "";
        let bpmnModel = bpmnModelNode ? bpmnModelNode.innerHTML.trim() : "";
        let rulesModel = rulesModelNode
            ? rulesModelNode.innerHTML.trim()
            : "";

        // Le agregamos el encabezado a los modelos
        contextModel = contextModel
            ? `<?xml version="1.0" encoding="UTF-8"?>\n${contextModel}`
            : "";
        bpmnModel = bpmnModel
            ? `<?xml version="1.0" encoding="UTF-8"?>\n${bpmnModel}`
            : "";
        rulesModel = rulesModel
            ? `<?xml version="1.0" encoding="UTF-8"?>\n<RulesModel>${rulesModel}</RulesModel>`
            : "";

        // Verificar si el archivo tiene datos y si los tiene lo agregamos al localStorage
        if (contextModel && bpmnModel && rulesModel) {
            localStorage.setItem("xmlContext", contextModel);
            localStorage.setItem("xmlBpmn", bpmnModel);
            attributesAndValues = loadAtributtes()[0];
            onlyAttributes = loadAtributtes()[1];
            activities = convertRulesModel(rulesModel, onlyAttributes, attributesAndValues);
            console.log("activities 2");
            console.log(activities);
            isSuccessful = true;
        } else {
            isSuccessful = false;
        }

        return [isSuccessful, activities];
    }else{
        return undefined;
    }
}


// Función para extraer los atributos y valores de cada dimensión del archivo de reglas de transformación
export function loadAtributtes(): any[] {
    let xmlContext = localStorage.getItem("xmlContext")!;
    const jsonObj = parser.parse(xmlContext);
    console.log(jsonObj);
    const dimensions = Array.isArray(jsonObj["spcm:Context"].myDimensions)
        ? jsonObj["spcm:Context"].myDimensions
        : [jsonObj["spcm:Context"].myDimensions];

    // Usar una variable temporal para almacenar los atributos y valores de cada dimensión
    let attributesAndValues: any[] = [];

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
            attributesAndValues.push(attributeData);
        });
    });

    // Extraer solo los atributos de la variable
    let onlyAttributes: any[] = [];
    attributesAndValues.forEach((data) => {
        onlyAttributes.push(data.Attribute);
    });

    return [attributesAndValues, onlyAttributes];
}

// Función para convertir el XML de RulesModel a la variable "task" la cual se utiliza para mostrar todos los datos dentro de la herramienta
export function convertRulesModel(xml: string, onlyAttributes: any[], attributesAndValues: any[]): activity[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    const contentRules = xmlDoc.querySelectorAll("ContentRule");
    let activities: activity[] = [];
    console.log(xml);
    contentRules.forEach((contentRule, index) => {
        console.log(contentRule);
        const activity: activity = {
            id: index,
            name: contentRule.getAttribute("name") || "",
            subname: contentRule.getAttribute("subname") || "",
            rules: parseRules(contentRule, onlyAttributes, attributesAndValues),
            deleted: contentRule.getAttribute("deleted") === "true" ? true : contentRule.getAttribute("deleted") === "false" ? false : undefined,
            replaced: contentRule.getAttribute("replace") ? true : undefined,
            replaceActivity: contentRule.getAttribute("replace") || undefined,
        };
        activities.push(activity);
    });
    //taskNames.set(activities);
    //localStorage.setItem("taskNames", JSON.stringify(activities));
    console.log("activities 1");
    console.log(activities);
    return activities;
}

// Función para transformar las reglas descritas en el XML a un objeto de reglas que puede ser procesada por la herramienta
function parseRules(element: Element, onlyAttributes: any[], attributesAndValues: any[]): Rule[] {
    const rules: Rule[] = [];

    // Iterar sobre todos los nodos Rule y ComplexRule directos de este elemento
    element.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const ruleElement = node as Element;
            const ruleType = ruleElement.tagName;

            const id = ruleElement.getAttribute("id") || "";
            const typeAttribute = ruleElement.getAttribute("type") || "";

            console.log(ruleType);

            if (ruleType === "Rule" || ruleType === "ComplexRule") {
                if (typeAttribute === "Simple") {
                    const simpleRule: SimpleRule = {
                        id: id,
                        type: "Simple",
                        numberRule: 1,
                        attribute:
                            ruleElement.getAttribute("attribute") || "",
                        value: ruleElement.getAttribute("value") || "",
                        attributes: onlyAttributes,
                        values: searchValues(
                            ruleElement.getAttribute("attribute") || "", attributesAndValues
                        )
                    };
                    rules.push(simpleRule);
                } else if (typeAttribute === "Conector") {
                    const connectorRule: ConnectorRule = {
                        id: id,
                        type: "Conector",
                        logical_operator: ruleElement.getAttribute("attribute") || "Or", // Asumir un valor por defecto o ajustar según el XML
                        logicals: ["And", "Or"],
                    };
                    rules.push(connectorRule);
                } else if (ruleType === "ComplexRule") {
                    const complexRule: ComplexRule = {
                        id: id,
                        type: "Complex",
                        numberRule: 2,
                        rules: parseRules(ruleElement, onlyAttributes, attributesAndValues), // Recursividad para manejar reglas anidadas
                    };
                    rules.push(complexRule);
                }
            }
        }
    });

    return rules;
}

function searchValues(value: String, attributesAndValues: any[]): any[] {
    return attributesAndValues.filter((attr) => attr.Attribute === value)[0]
        .values;
}