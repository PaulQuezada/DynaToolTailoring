<img src="https://github.com/user-attachments/assets/500be891-257e-4098-845f-bc5b9af53799" alt="Logo" width="150"/>

# DynaWorld

DynaWorld es un herramienta creada para apoyar el metodo DynaTail, su utilidad es ayudar la transformación de procesos en base al contexto organizacional y los objetivos que tenga la empresa u organizacion.

## Ejecución

Para ejecutar la herramienta de manera local se tienen que seguir los siguientes pasos:
```bash
# Ir a la carpeta "memoria"
cd memoria

# Instalar dependencias
npm ci

# Ejecutar la herramienta
npm run dev
```
## Funciones 

Aqui se muestran las funciones importantes de las herramientas, tanto para las herramientas que crea el contexto del proyecto como para la herramienta *injector-extractor*

### Contexto del proyecto e injector-extractor

Las herramientas para crear el contexto del proyecto y el *injector-extractor* que hace la transformación del BPMN a XMI se encuentran en la carpeta *memoria/src/components*.

| Carpeta | Utilidad |
|------------|------------|
| context    | Aqui estan todas las vistas relaciondas con la creación del contexto del proyecto (Herramienta hecha por Daniel)    |
| process    | Aqui estan todas las vistas relaciondas con la transformación del archivo BPMN a un modelo XMI (Herramienta hecha por Andres)   |
| transform    | Aqui estan la vista que ejecuta el JAR en el sistema para hacer la transformación del BPMN a XMI y ademas guarda los datos de los archivos XMI en el sistema.   |
| evaluate    | Aqui estan las vistas relacionadas con el grafo de influencia.  |
| graph    | Aqui estan las vistas que construyen el grafo.   |

### Creación de reglas de transformación y generación de código ATL


La herramienta para crear reglas de transformación y generar el código ATL ejecutable se encuentra en la carpeta *memoria/src/functions*.

| Función | Utilidad |
|------------|------------|
| atlcreation.ts    | Aqui estan toda la lógica que genera el código ATL en base al modelo de persistencia de las reglas de transformación.    |
| datamanager.ts    | Aqui estan toda la lógica que maneja los datos del sistema, tanto para obtener datos como para almancenarlos.    |
| importdata.ts    | Aqui estan toda la lógica que extrae los datos de los archivos del proceso de negocio y del contexto organizacional.   |
| exportdata.ts    | Aqui estan toda la lógica que hace la petición de generación del modelo de persistencia de reglas y el código ATL para descargar.  |
| rulecreation.ts    | Aqui estan toda la lógica donde se crean las reglas simples y complejas que finalmente se convierte en código ATL ejecutable.   |

## Menciones importantes
Antes, cuando se guardaban los archivos del contexto del proyecto y el archivo BPMN importado, estos se almacenaban en una carpeta personalizada según el nombre que el usuario asignaba al proyecto. Ahora, ya no se solicita el nombre del proyecto, por lo que los archivos se guardan directamente en la carpeta *files*.

## Visualización de uso

[![Visualización de DynaTool](https://i.ibb.co/G7JXbNp/logo-Dyna-World.jpg)](https://youtu.be/imQGYoPhEaU)
