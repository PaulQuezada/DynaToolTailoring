import "../routes/types";
import { createCompleteModel } from "./exportdata";
import { loadAtributtes, parseRules } from "./importdata";

export function generateATL() {
    // Función para obtener las reglas de transformación a través del modelo completo
    const taskActivities = obtainTransformationRules();
    // Buscamos las reglas opcionales(las que se eliminan o no) y las reglas de reemplazo
    const optionalRules = obtainOptionalRules(taskActivities); // Filtramos solo las reglas opcionales(se eliminan o no)
    const replaceRules = obtainReplaceRules(taskActivities);  // Filtramos solo las reglas de reemplazo
    // Generamos el contenido del archivo
    const atlContent: string = `
module BPMNTailoringRules;
-- @path MM=/TestPaulTesis/BPMN20.ecore
-- @path MM2=/TestPaulTesis/CMM.ecore
-- @path MM1=/TestPaulTesis/BPMN20.ecore

create OUT : MM1 from IN : MM, IN1 : MM2;

-- To obtain the context elements

helper def: getContextAttributeConfiguration (nameAttribute: String) :
	                 MM2!ContextAttributeConfiguration = MM2!ContextAttributeConfiguration.allInstances()->asSequence()->select(a | a.myContextElement.name =nameAttribute )->first();
helper def: getValue(nameAttribute: String):
	                 String = thisModule.getContextAttributeConfiguration(nameAttribute).myContextAttributeValue.value;

helper def:getTaskDefinition(taskDefinitionName:String): MM!TaskDefinition =
			  MM!TaskDefinition.allInstances()->asSequence()->select(t|t.name = taskDefinitionName)->first();

-- To obtain the next WorkBreakDownElement

helper def:nextElement(a:MM!WorkBreakDownElement): MM!WorkBreakDownElement = MM!WorkBreakDownElement.allInstances()->select(t|t=a.next)->first();
helper def:next(a:MM!WorkBreakDownElement): MM!WorkBreakDownElement = if(thisModule.optionalRule(thisModule.nextElement(a).name)) then a else thisModule.next(thisModule.nextElement(a)) endif;

helper def: selectTaskRule(tu:MM!TaskUse): MM!TaskDefinition = tu.linkTask; 

-- To make changes in the tasks

-- Rules for delete the activity or not
helper def: optionalRule(name:String): Boolean =
${generateOptionalRule(optionalRules)}

-- Rules for replace the activity to another activity
helper def: replaceRules(dd: MM!Task): String =
${generateReplaceRule(replaceRules)}

-- User-created rules to delete or keep
${generateOptFunction(optionalRules)}

-- User-created rules to replace
${generateRepFunction(replaceRules)}

rule Definitions {
from	d:MM!Definitions
to		dd:MM1!Definitions(
        --exporter <- d.exporter,
		exporterVersion <- d.exporterVersion,
		--expressionLanguage<- d.expressionLanguage,
		name <- d.name,
		targetNamespace <- d.targetNamespace,
		typeLanguage <- d.typeLanguage,
		id <- d.id,
		rootElements <- d.rootElements,		
		diagrams <- d.diagrams
		--extensionDefinitions <- d.extensionDefinitions
        )
}

rule Collaboration {
from	d:MM!Collaboration
to		dd:MM1!Collaboration(
		--artifacts <- d.artifacts,
		--choreographyRef <- d.choreographyRef,
		--conversationAssociations <- d.conversationAssociations,
		isClosed <- d.isClosed,
		--messageFlows <- d. messageFlows,
		name <- d.name,
		participants <- d.participants,
		id <-d.id
        )
}

rule Participant {
from	d:MM!Participant(
		 thisModule.optionalRuleParticipant(d.name)	
)
to		dd:MM1!Participant(
        name <- d.name,
		--participantMultiplicity <- d.participantMultiplicity,
		--processRef <- d.processRef,
		id <- d.id
        )
}

rule Process {
from	d:MM!Process
to		dd:MM1!Process(
		isClosed <- d.isClosed,
		isExecutable <- d.isExecutable,
		processType <- d.processType,
		id <- d.id,
		name <- d.name,
		flowElements <- d.flowElements,
		documentation <- d.documentation
        )
}

rule DataObject {
from	d:MM!DataObject
to		dd:MM1!DataObject(
		name <- d.name
        )
}


rule DataObjectReference {
    from	d:MM!DataObjectReference
    to		dd:MM1!DataObjectReference(
            name <- d.name
            )
    }
            
rule Documentation {
from	d:MM!Documentation
to		dd:MM1!Documentation(
		text <- d.text
        )
}
	
rule ExclusiveGateway {
from	d:MM!ExclusiveGateway
to		dd:MM1!ExclusiveGateway(
		name <- d.name
        )
}

rule SequenceFlow {
from	d:MM!SequenceFlow
to		dd:MM1!SequenceFlow(
		name <- d.name
        )
}

rule StartEvent {
from	d:MM!StartEvent
to		dd:MM1!StartEvent(
		name <- d.name
        )
}

rule IntermediateThrowEvent {
from	d:MM!IntermediateThrowEvent
to		dd:MM1!IntermediateThrowEvent(
		name <- d.name
        )
}
 
rule Task {
from    d:MM!Task(
         thisModule.optionalRule(d.name)
)

to        dd:MM1!Task(
        name <- thisModule.replaceRules(d)
        )

}
`;
    return atlContent;
}

// Función para rescatar la información del modelo de reglas de transformación
function obtainTransformationRules(): activity[] {
    // Variable en donde se almacenarán las reglas de transformación encontradas en el modelo
    let activities: activity[] = [];

    // Crear el modelo completo y parsearlo a un formato procesable
    const xmlTailoringModel = createCompleteModel();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlTailoringModel, "text/xml");

    // Extraer los datos del modelos reglas que están en el modelo completo generado
    const rulesModel = xmlDoc.querySelector("RulesModel");
    const contentRules = rulesModel ? rulesModel.querySelectorAll("ContentRule")! : [];

    // Obtenemos los atributos y valores que se encuentran en el modelo importado incialmente
    const attributesAndValues = loadAtributtes()[0];
    const onlyAttributes = loadAtributtes()[1];

    // Recorremos el modelo de reglas para obtener la información de cada regla y almacenarla en la variable activities
    contentRules.forEach((contentRule, index) => {
        const activity: activity = {
            id: index,
            type: contentRule.getAttribute("typeofactivity") || "",
            name: contentRule.getAttribute("name") || "",
            subname: contentRule.getAttribute("subname") || "",
            rules: parseRules(contentRule, onlyAttributes, attributesAndValues),
            deleted: contentRule.getAttribute("deleted") === "true" ? true : contentRule.getAttribute("deleted") === "false" ? false : undefined,
            replaced: contentRule.getAttribute("replace") ? true : undefined,
            replaceActivity: contentRule.getAttribute("replace") || undefined,
        };
        activities.push(activity);
    });

    return activities;
}


// Función para obtener las reglas opcionales
function obtainOptionalRules(taskActivities: activity[]): activity[] {
    let optionalRules: activity[] = [];
    taskActivities.forEach((activity: activity) => {
        if (activity.deleted != undefined) {
            optionalRules.push(activity);
        }
    });
    return optionalRules;
}

// Función para obtener las reglas reemplazo
function obtainReplaceRules(taskActivities: activity[]): activity[] {
    let replaceRules: activity[] = [];
    taskActivities.forEach((activity: activity) => {
        if (activity.replaced) {
            replaceRules.push(activity);
        }
    });
    return replaceRules;
}

// Función para filtrar solo los nombres de las actividades sin repetir
function filterOnlyNames(elements: activity[]): string[] {
    // Filtrar solo los nombres de las actividades sin repetir
    const names: string[] = [];
    elements.forEach((element: activity) => {
        if (!names.includes(element.name)) {
            names.push(element.name);
        }
    });
    return names;
}

// Función para encontrar una actividad por nombre
function findElementsByName(elements: activity[], name: string): activity[] {
    return elements.filter((element: activity) => element.name === name);
}

// Función para generar la función "GENERAL" de reglas opcionales
function generateOptionalRule(elements: activity[]): string {
    if (elements.length === 0) {
        return "true;";
    }
    const nameActivity: string[] = filterOnlyNames(elements);
    // Caso especial para un solo elemento
    if (nameActivity.length === 1) {
        const element = nameActivity[0];
        let singlerule = `\nif(Sequence{'${element}'}.includes(name)) then\n\t(if ('${element}' = name) then`;
        const activities = findElementsByName(elements, element);
        let index = 0;
        activities.forEach(() => {
            singlerule += `\n\t\tthisModule.ruleOpt${index + 1}()`;
            if (index < activities.length - 1) {
                singlerule += `\tand`;
            }
            index++;
        });
        singlerule += `\n\telse\n\t\ttrue\n\tendif)\nelse\n\ttrue\nendif;`;
        return singlerule;
    }

    // Manejo para más de un elemento
    let rule = `\nif(Sequence{${nameActivity.map(e => `'${e}'`).join(',')}}.includes(name)) then\n(`;
    let activities: activity[] = [];
    let index: number = 0;
    nameActivity.forEach((element: string) => {
        if (index === 0) {
            rule += `if ('${element}' = name) then`;
            activities = findElementsByName(elements, element);
            activities.forEach((element, index_activities) => {
                rule += `\n\t\tthisModule.ruleOpt${index + 1}()`;
                if (index_activities < activities.length - 1) {
                    rule += `\tand`;
                }
                index++;
            });
        } else {
            rule += `\n\telse\n\t\t(if ('${element}' = name) then`;
            activities = findElementsByName(elements, element);
            activities.forEach((element, index_activities) => {
                rule += `\n\t\t\tthisModule.ruleOpt${index + 1}()`;
                if (index_activities < activities.length - 1) {
                    rule += `\tand`;
                }
                index++;
            });
        }
    });

    // Cerrar el último if con else true, y añadir el paréntesis de cierre
    rule += `\n\t\t\telse\n\t\t\t\ttrue\n\t\t\tendif)`;

    // Cerrar los bloques intermedios si hay más de dos elementos
    for (let i = 0; i < nameActivity.length - 2; i++) {
        rule += `\n\t\tendif)`;
    }

    rule += `\nendif)\nelse\n\ttrue\nendif;`;

    return rule;
}

// Función para generar la función "GENERAL" de reglas de reemplazo
function generateReplaceRule(elements: activity[]): string {
    if (elements.length === 0) {
        return "dd.name;";
    }
    const nameActivity: string[] = filterOnlyNames(elements);
    // Caso especial para un solo elemento
    if (nameActivity.length === 1) {
        const element = nameActivity[0];
        let singlerule = `\nif(Sequence{'${element}'}.includes(dd.name)) then\n\t(if ('${element}' = dd.name) then`;
        const activities = findElementsByName(elements, element);
        let index = 0;
        activities.forEach(() => {
            singlerule += `\n\t\tthisModule.ruleRep${index + 1}(dd)`;
            if (index < activities.length - 1) {
                singlerule += `\tand`;
            }
            index++;
        });
        singlerule += `\n\telse\n\t\tdd.name\n\tendif)\nelse\n\tdd.name\nendif;`;
        return singlerule;
    }

    // Manejo para más de un elemento
    let rule = `\nif(Sequence{${nameActivity.map(e => `'${e}'`).join(',')}}.includes(dd.name)) then\n(`;
    let activities: activity[] = [];
    let index: number = 0;
    nameActivity.forEach((element: string) => {
        if (index === 0) {
            rule += `if ('${element}' = dd.name) then`;
            activities = findElementsByName(elements, element);
            activities.forEach((element, index_activities) => {
                rule += `\n\t\tthisModule.ruleRep${index + 1}(dd)`;
                if (index_activities < activities.length - 1) {
                    rule += `\tand`;
                }
                index++;
            });
        } else {
            rule += `\n\telse\n\t\t(if ('${element}' = dd.name) then`;
            activities = findElementsByName(elements, element);
            activities.forEach((element, index_activities) => {
                rule += `\n\t\t\tthisModule.ruleRep${index + 1}(dd)`;
                if (index_activities < activities.length - 1) {
                    rule += `\tand`;
                }
                index++;
            });
        }
    });

    // Cerrar el último if con else true, y añadir el paréntesis de cierre
    rule += `\n\t\t\telse\n\t\t\t\tdd.name\n\t\t\tendif)`;

    // Cerrar los bloques intermedios si hay más de dos elementos
    for (let i = 0; i < nameActivity.length - 2; i++) {
        rule += `\n\t\tendif)`;
    }

    rule += `\nendif)\nelse\n\tdd.name\nendif;`;

    return rule;
}

// Función para generar la reglas que dictaminan si una actividad es eliminada o no (En base a las reglas de transformación)
function generateOptFunction(elements: activity[]): string {
    if (elements.length === 0) {
        return "";
    }
    let ruleOptFunction = "";
    var ruleConditions = "";
    const nameActivity: string[] = filterOnlyNames(elements);
    var index = 0;
    nameActivity.forEach((element) => {
        const activities = findElementsByName(elements, element);
        activities.forEach((activity) => {
            // Parsear las reglas de la actividad
            ruleConditions = activity.rules.map(parseRule).join(" ");
            if (index === 0) {
                ruleOptFunction = `helper def:ruleOpt${index + 1}():Boolean=if (${ruleConditions})`;
                if (!activity.deleted) {
                    ruleOptFunction += ` then true else false endif;`;
                } else {
                    ruleOptFunction += ` then false else true endif;`;
                }
            } else {
                // Se agrega el salto de linea para que sea más legible
                ruleOptFunction += `\nhelper def:ruleOpt${index + 1}():Boolean=if (${ruleConditions})`;
                if (!activity.deleted) {
                    ruleOptFunction += ` then true else false endif;`;
                } else {
                    ruleOptFunction += ` then false else true endif;`;
                }
            }
            index++;
        });
    });
    return ruleOptFunction;
}

// Función para generar la reglas que dictaminan si una actividad es reemplazada (En base a las reglas de transformación)
function generateRepFunction(elements: activity[]): string {
    if (elements.length === 0) {
        return "";
    }
    let ruleRepFunction = "";
    var ruleConditions = "";
    const nameActivity: string[] = filterOnlyNames(elements);
    var index = 0;
    nameActivity.forEach((element) => {
        const activities = findElementsByName(elements, element);
        activities.forEach((activity) => {
            // Parsear las reglas de la actividad
            ruleConditions = activity.rules.map(parseRule).join(" ");
            if (index === 0) {
                ruleRepFunction = `helper def:ruleRep${index + 1}(task:MM!Task):String=if (${ruleConditions})`;
                if (activity.replaced) {
                    ruleRepFunction += ` then '${activity.replaceActivity}' else task.name endif;`;
                }
            } else {
                // Se agrega el salto de linea para que sea más legible
                ruleRepFunction += `\nhelper def:ruleRep${index + 1}(task:MM!Task):String=if (${ruleConditions})`;
                if (activity.replaced) {
                    ruleRepFunction += ` then '${activity.replaceActivity}' else task.name endif;`;
                }
            }
            index++;
        });
    });
    return ruleRepFunction;
}

// Función para parsear las reglas a ATL
function parseRule(rule: any): string {
    if (rule.type === "Simple") {
        return `thisModule.getValue('${rule.attribute}') = '${rule.value}'`;
    } else if (rule.type === "Conector") {
        return rule.logical_operator.toLowerCase();
    } else if (rule.type === "Complex") {
        const complexRules = rule.rules.map(parseRule).join(" ");
        return `(${complexRules})`;
    } else {
        throw new Error("Tipo de regla no reconocido");
    }
}

export function downloadATL() {
    const atlCode = generateATL();
    const blob = new Blob([atlCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "BPMNTailoringRules.atl";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
