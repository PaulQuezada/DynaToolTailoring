import "../routes/types";
import { XMLParser } from "fast-xml-parser";

// Creando la instancia del parser y del builder que se utilizará para procesar los archivos XML
const parserOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "",
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
};
const parser = new XMLParser(parserOptions);


// ********************** FUNCIONES PARA OBTENER DATOS DEL SISTEMA ****************

// Función para obtener los datos del contexto organizacional
export function getDataContext(){
    let xmlContext = localStorage.getItem("xmlContext")!;
    const jsonObj = parser.parse(xmlContext);
    return jsonObj;
}

// Función para obtener los datos del proceso de negocio
export function getDataProcess(){
    let xmlProcess = localStorage.getItem("xmlBpmn")!;
    const jsonObj = parser.parse(xmlProcess);
    return jsonObj;
}

// Función para obtener los datos de las reglas para las tareas
export function getDataRulesTask(){
    var taskLocalStorage = localStorage.getItem("rulesTask")!;
    return JSON.parse(taskLocalStorage);
}

// Función para obtener los datos de las actividad seleccionada (Si es que la hay)
export function getDataSelectedActivity(){
    var activitySelect = localStorage.getItem("activitySelect")!;
    return JSON.parse(activitySelect);
}

// Función para obtener los datos de las actividades seleccionadas (Si es que al hay)
export function getDataSelectedActivities(){
    var selectedActivities = localStorage.getItem("selectedActivities")!;
    return JSON.parse(selectedActivities);
}

// Función para obtener los datos del nombre de las reglas para las tareas
export function getDataNameRuleForActivities(){
    var nameRule = localStorage.getItem("nameRuleForActivities")!;
    return JSON.parse(nameRule);
}

// Función para obtener los datos del modelo de persistencia de las reglas de transformación
export function getModelRules(){
    var modelRules = localStorage.getItem("xmiModelRules")!;
    return modelRules;
}

// ********************** FUNCIONES PARA ASIGNAR DATOS DEL SISTEMA ****************



// Función para asignar los datos del contexto organizacional
export function setDataContext(xmlContext: any){
    localStorage.setItem("xmlContext", xmlContext);
}
// Función para asignar los datos del proceso de negocio
export function setDataProcess(xmlBpmn: any){
    localStorage.setItem("xmlBpmn", xmlBpmn);
}

// Función para asignar los datos de las reglas para las tareas
export function setDataRulesTask(data: any){
    localStorage.setItem("rulesTask", data);
}

// Función para asignar los datos de la actividad seleccionada
export function setDataSelectedActivity(data: any){
    localStorage.setItem("activitySelect", data);
}

// Función para asignar los datos de las actividades seleccionadas
export function setDataSelectedActivities(data: any){
    localStorage.setItem("selectedActivities", data);
}

// Función para asignar los datos del nombre de las reglas para las tareas
export function setDataNameRuleForActivities(data: any){
    localStorage.setItem("nameRuleForActivities", data);
}

// Función para asignar los datos del modelo de persistencia de las reglas de transformación
export function setDataModelRules(data: any){
    localStorage.setItem("xmiModelRules", data);
}

// ********************** FUNCIONES PARA ELIMINAR DATOS DEL SISTEMA ****************

// Función para eliminar los datos del contexto organizacional
export function deleteDataContext(){
    localStorage.removeItem("xmlContext");
}

// Función para eliminar los datos del proceso de negocio
export function deleteDataProcess(){
    localStorage.removeItem("xmlBpmn");
}

// Función para eliminar los datos de las reglas para las tareas
export function deleteDataRulesTask(){
    localStorage.removeItem("rulesTask");
}

// Función para eliminar los datos de la actividad seleccionada
export function deleteDataSelectedActivity(){
    localStorage.removeItem("activitySelect");
}

// Función para eliminar los datos de las actividades seleccionadas
export function deleteDataSelectedActivities(){
    localStorage.removeItem("selectedActivities");
}

// Función para eliminar los datos del nombre de las reglas para las tareas
export function deleteDataNameRuleForActivities(){
    localStorage.removeItem("nameRuleForActivities");
}

// Función para eliminar los datos del modelo de persistencia de las reglas de transformación
export function deleteDataModelRules(){
    localStorage.removeItem("xmiModelRules");
}

// Función para eliminar todos los datos del sistema
export function deleteAll(){
    deleteDataContext();
    deleteDataProcess();
    deleteDataRulesTask();
    deleteDataSelectedActivity();
    deleteDataSelectedActivities();
    deleteDataNameRuleForActivities();
    deleteDataModelRules();
}


// ********************** FUNCION PARA LIMPIAR LOS DATOS DEL SISTEMA ****************

// Función para limpiar todos los datos del sistema
export function clearAllData(){
    localStorage.clear();
}