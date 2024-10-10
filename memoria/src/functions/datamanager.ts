import "../routes/types";
import { XMLParser } from "fast-xml-parser";
import axios from 'axios';

// Creando la instancia del parser y del builder que se utilizará para procesar los archivos XML
const parserOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "",
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
};
const parser = new XMLParser(parserOptions);

// ********************** FUNCIONES PARA TRANSFORMAR DATOS ****************
export function parseDataForRootElements(data: any) {
    const parsed = parser.parse(data);
    return parsed;
}
// ********************** FUNCIONES PARA OBTENER DATOS DEL SISTEMA ****************

// Función para obtener los datos del contexto organizacional
export async function getDataContext() {
    /* USANDO LOCALSTORAGE */
    // let xmlContext = localStorage.getItem("xmlContext")!;
    // const jsonObj = parser.parse(xmlContext);
    // return jsonObj;
    /* USANDO UNA BASE DE DATOS REAL */
    try {
        const apiUrl = 'http://localhost:3000/api';
        const response = await axios.get(`${apiUrl}/getprocessandcontext`);
        console.log('Respuesta del servidor:', response.data[0].context);
        return response.data.process;
    } catch (error) {
        console.error('Error al enviar la solicitud POST:', error);
        return null;
    }
}

// Función para obtener los datos del proceso de negocio
export async function getDataProcess() {
    /* USANDO LOCALSTORAGE */
    // let xmlProcess = localStorage.getItem("xmlBpmn")!;
    // const jsonObj = parser.parse(xmlProcess);
    // return jsonObj;
    
    /* USANDO UNA BASE DE DATOS REAL */
    try {
        const apiUrl = 'http://localhost:3000/api';
        const response = await axios.get(`${apiUrl}/getprocessandcontext`);
        const data_return = JSON.parse(response.data[0].process);
        return data_return;
    } catch (error) {
        console.error('Error al enviar la solicitud POST:', error);
        return null;
    }
}

// Función para obtener los datos de las reglas para las tareas
export function getDataRulesTask() {
    var taskLocalStorage = localStorage.getItem("rulesTask")!;
    return JSON.parse(taskLocalStorage);
}

// Función para obtener los datos de las actividad seleccionada (Si es que la hay)
export function getDataSelectedActivity() {
    var activitySelect = localStorage.getItem("activitySelect")!;
    return JSON.parse(activitySelect);
}

// Función para obtener los datos de las actividades seleccionadas (Si es que al hay)
export function getDataSelectedActivities() {
    var selectedActivities = localStorage.getItem("selectedActivities")!;
    return JSON.parse(selectedActivities);
}

// Función para obtener los datos del nombre de las reglas para las tareas
export function getDataNameRuleForActivities() {
    var nameRule = localStorage.getItem("nameRuleForActivities")!;
    return JSON.parse(nameRule);
}

// Función para obtener los datos del modelo de persistencia de las reglas de transformación
export function getModelRules() {
    var modelRules = localStorage.getItem("xmiModelRules")!;
    return modelRules;
}

// ********************** FUNCIONES PARA ASIGNAR DATOS DEL SISTEMA ****************



// Función para asignar los datos del contexto organizacional y del proceso de negocio
export async function setDataFile(xmlContext: any, xmlBpmn: any) {
    /* USANDO LOCALSTORAGE */
    //localStorage.setItem("xmlContext", xmlContext);
    //localStorage.setItem("xmlBpmn", xmlBpmn);
    /* USANDO UNA BASE DE DATOS REAL */
    const dataElement = {
        usuario: "Prueba de mantenibilidad",
        context: JSON.stringify(xmlContext),
        process: JSON.stringify(xmlBpmn)
    };
    try {
        const apiUrl = 'http://localhost:3000/api';
        const response = await axios.post(`${apiUrl}/postprocessandcontext`,dataElement);
        console.log('Respuesta del servidor:', response.data);
    } catch (error) {
        console.error('Error al enviar la solicitud POST:', error);
    }
}

// Función para asignar los datos de las reglas para las tareas
export async function setDataRulesTask(data: any) {
    /* USANDO EL LOCALSTORAGE */
    localStorage.setItem("rulesTask", data);
}

// Función para asignar los datos de la actividad seleccionada
export function setDataSelectedActivity(data: any) {
    localStorage.setItem("activitySelect", data);
}

// Función para asignar los datos de las actividades seleccionadas
export function setDataSelectedActivities(data: any) {
    localStorage.setItem("selectedActivities", data);
}

// Función para asignar los datos del nombre de las reglas para las tareas
export function setDataNameRuleForActivities(data: any) {
    localStorage.setItem("nameRuleForActivities", data);
}

// Función para asignar los datos del modelo de persistencia de las reglas de transformación
export function setDataModelRules(data: any) {
    localStorage.setItem("xmiModelRules", data);
}

// ********************** FUNCIONES PARA ELIMINAR DATOS DEL SISTEMA ****************

// Función para eliminar los datos del contexto organizacional
export function deleteDataContext() {
    localStorage.removeItem("xmlContext");
}

// Función para eliminar los datos del proceso de negocio
export function deleteDataProcess() {
    localStorage.removeItem("xmlBpmn");
}

// Función para eliminar los datos de las reglas para las tareas
export function deleteDataRulesTask() {
    localStorage.removeItem("rulesTask");
}

// Función para eliminar los datos de la actividad seleccionada
export function deleteDataSelectedActivity() {
    localStorage.removeItem("activitySelect");
}

// Función para eliminar los datos de las actividades seleccionadas
export function deleteDataSelectedActivities() {
    localStorage.removeItem("selectedActivities");
}

// Función para eliminar los datos del nombre de las reglas para las tareas
export function deleteDataNameRuleForActivities() {
    localStorage.removeItem("nameRuleForActivities");
}


// ********************** FUNCION PARA LIMPIAR LOS DATOS DEL SISTEMA ****************

// Función para limpiar todos los datos del sistema
export function clearAllData() {
    localStorage.clear();
}