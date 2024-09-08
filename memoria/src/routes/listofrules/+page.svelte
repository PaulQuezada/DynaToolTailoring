<script lang="ts">
    // Importaciones de módulos
    import "../../app.css";
    import { goto } from "$app/navigation";
    import { themeStore } from "../../stores";
    import "../types";
    import { onMount, onDestroy } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { fileUploadBpmn } from "../../functions/importdata";
    import { fly } from "svelte/transition";

    // Variable para la notificación
    let notificationActive: boolean = false;
    // Variables
    let searchQuery = "";
    let actividades: Writable<activity[]> = writable([]);
    let nombre_actividades = writable<any[]>([]);
    let showModal = false;
    let showModalCrear = false;
    let showModalEditar = false;
    let showModalFiltro = false;
    let idactividad_eliminar: number;
    let idactividad_editar: number;
    let nombre_actividad_crear: String;
    let subnombre_actividad_crear: String;
    let tipo_actividad_crear: String;
    let subnombre_actividad_editar: String;

    // Variables filtros
    let filterNormalTask = true;
    let filterUserTask = false;
    let filterAnotherTask = false;

    // Variables para la barra de datos
    let numeroReglasEliminarMantener: number = 0;
    let numeroReglasReemplazar: number = 0;
    let numeroReglasSinTipo: number = 0;
    let porcentajeEliminarMantener: number = 0;
    let porcentajeReemplazar: number = 0;
    let porcentajeSinTipo: number = 0;
    let mostrarBarra: boolean = false;

    // Variable para crear para varias actividades la misma regla
    let commandModal: boolean = false;
    let selectedActivities: string[] = [];
    let createRuleforActivities: Writable<boolean> = writable(false);

    // Función para mostrar la notificación durante 1 minuto
    const showNotification = () => {
        notificationActive = true;
        setTimeout(() => {
            notificationActive = false;
        }, 30000); // 30000 ms = 30 segundos
    };
    function handleKeyDown(event: KeyboardEvent) {
        if (event.metaKey && event.key === "b") {
            commandModal = !commandModal; // Cambia el valor de la variable
            console.log(`isActive: ${commandModal}`);
        }
    }

    function handleSelection(activity: string) {
        if (selectedActivities.includes(activity)) {
            selectedActivities = selectedActivities.filter(
                (a) => a !== activity,
            );
        } else {
            selectedActivities = [...selectedActivities, activity];
        }
    }

    // Filtrar actividades por nombre y por tipo
    $: {
        numeroReglasEliminarMantener = 0;
        numeroReglasReemplazar = 0;
        porcentajeEliminarMantener = 0;
        porcentajeReemplazar = 0;
        if ($actividades.length !== 0) {
            $actividades.forEach((regla_activity: activity) => {
                if (regla_activity.deleted !== undefined) {
                    numeroReglasEliminarMantener++;
                } else if (regla_activity.replaced !== undefined) {
                    numeroReglasReemplazar++;
                } else {
                    numeroReglasSinTipo++;
                }
            });
            if (
                numeroReglasEliminarMantener !== 0 ||
                numeroReglasReemplazar !== 0 ||
                numeroReglasSinTipo !== 0
            ) {
                // Calculamos el porcentaje de las reglas
                porcentajeEliminarMantener =
                    (numeroReglasEliminarMantener / $actividades.length) * 100;
                porcentajeReemplazar =
                    (numeroReglasReemplazar / $actividades.length) * 100;
                porcentajeSinTipo =
                    (numeroReglasSinTipo / $actividades.length) * 100;
                // Truncamos el porcentaje
                porcentajeEliminarMantener = Math.trunc(
                    porcentajeEliminarMantener,
                );
                porcentajeReemplazar = Math.trunc(porcentajeReemplazar);
                porcentajeSinTipo = Math.trunc(porcentajeSinTipo);
            }
        }
    }

    // cuando montamos la pagina recolectamos los datos y los guardamos en el store
    onMount(async () => {
        // Mostramos la notificación
        showNotification();
        // Eliminamos el activitySelect del localstorage
        localStorage.removeItem("activitySelect");
        localStorage.removeItem("selectedActivities");
        localStorage.removeItem("nameRuleForActivities");
        // Verificamos si taskNames existe en el localStorage
        var taskLocalStorage = localStorage.getItem("taskNames")!;
        console.log(taskLocalStorage);
        if (taskLocalStorage != null) {
            const jsonTask = JSON.parse(taskLocalStorage);
            console.log(jsonTask);
            // Ahora igualamos taskNames con jsonTask
            actividades.set(jsonTask);
            // Extraemos solo los nombres de las actividades(sin que se repitan)
            saveNamesActivities();
        } else {
            console.log("No hay actividades");
            await loadDataBPMN();
            localStorage.setItem("taskNames", JSON.stringify([])); // Inicializamos las reglas para cada actividad en vacio
        }
        // Se agrega el event listener cuando el componente se monta
        window.addEventListener("keydown", handleKeyDown);
    });

    // Función para manejar la carga de archivos BPMN
    async function loadDataBPMN() {
        // Extraemos los datos el archivo BPMN
        const xmlBpmn: string = localStorage.getItem("xmlBpmn")!;
        var task = await fileUploadBpmn(xmlBpmn);
        // Los convertimos a un objeto JSON para manejarlos de mejor forma, dandole un id a cada actividad, subnombre y reglas (que por ahora estan vacias)
        var id: number = 0;
        var taskConverted: activity[] = task.map((task: any) => {
            return {
                id: id++,
                type: task.type,
                name: task.name,
                subname: "Task: " + task.name,
                rules: [],
            };
        });
        // Extraemos solo los nombres y tipos de las actividades(sin que se repitan), esto es para agrupar las reglas de las actividades
        const uniqueTaskNames = taskConverted
            .filter(
                (value: any, index: any, self: any) =>
                    self.indexOf(value) === index,
            )
            .map((task: any) => ({
                name: task.name,
                type: task.type,
            }));
        nombre_actividades.set(uniqueTaskNames);
        console.log(uniqueTaskNames);
    }

    // Función para guardar los nombres de las actividades
    function saveNamesActivities() {
        const actividades_json = JSON.parse(localStorage.getItem("taskNames")!);
        if (actividades_json.length == 0) {
            loadDataBPMN();
        } else {
            loadDataBPMN();
            actividades.set(actividades_json);
        }
    }

    // Filtrar actividades por nombre y por tipo
    $: filteredActivities = $nombre_actividades.filter((activity) =>
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    function deleteActivityById(taskId: number): void {
        var tasks = JSON.parse(localStorage.getItem("taskNames")!);
        var newTasks = tasks.filter((task: any) => task.id !== taskId);
        localStorage.setItem("taskNames", JSON.stringify(newTasks));
        actividades.set(newTasks);
    }

    function createRuleActivity() {
        var tasks = JSON.parse(localStorage.getItem("taskNames")!);
        // Objetenemos el ultimo id de las actividades si es que no esta vacio
        var lastId: number = 0;
        if (tasks.length == 0) {
            lastId = 0;
        } else {
            lastId = tasks[tasks.length - 1].id;
        }
        console.log(lastId);
        // Creamos la regla
        var newRule = {
            id: lastId + 1,
            name: nombre_actividad_crear,
            subname: subnombre_actividad_crear,
            type: tipo_actividad_crear,
            rules: [],
        };
        tasks.push(newRule);
        localStorage.setItem("taskNames", JSON.stringify(tasks));
        actividades.set(tasks);
    }

    function editRuleActivity() {
        var tasks = JSON.parse(localStorage.getItem("taskNames")!);
        tasks.forEach((task: any) => {
            if (task.id === idactividad_editar) {
                task.subname = subnombre_actividad_editar;
            }
        });
        localStorage.setItem("taskNames", JSON.stringify(tasks));
        actividades.set(tasks);
    }
</script>

{#if notificationActive}
    <div
        class="p-1 fixed top-4 right-4 bg-[#e9a845] w-[400px] text-white px-4 py-2 rounded shadow-lg z-50"
        transition:fly={{ x: 300, duration: 500 }}
    >
        <div class="flex">
            <span class="my-auto material-symbols-outlined"> info </span>
            <p class="ml-2 mr-1 flex">Using the key combination</p>
            <svg
                class="mt-[3px] mr-1"
                fill="#ffffff"
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                width="20px"
                height="20px"
                viewBox="0 0 80 80"
                xml:space="preserve"
            >
                <g>
                    <path
                        d="M64,48L64,48h-8V32h8c8.836,0,16-7.164,16-16S72.836,0,64,0c-8.837,0-16,7.164-16,16v8H32v-8c0-8.836-7.164-16-16-16
                    S0,7.164,0,16s7.164,16,16,16h8v16h-8l0,0l0,0C7.164,48,0,55.164,0,64s7.164,16,16,16c8.837,0,16-7.164,16-16l0,0v-8h16v7.98
                    c0,0.008-0.001,0.014-0.001,0.02c0,8.836,7.164,16,16,16s16-7.164,16-16S72.836,48.002,64,48z M64,8c4.418,0,8,3.582,8,8
                    s-3.582,8-8,8h-8v-8C56,11.582,59.582,8,64,8z M8,16c0-4.418,3.582-8,8-8s8,3.582,8,8v8h-8C11.582,24,8,20.417,8,16z M16,72
                    c-4.418,0-8-3.582-8-8s3.582-8,8-8l0,0h8v8C24,68.418,20.418,72,16,72z M32,48V32h16v16H32z M64,72c-4.418,0-8-3.582-8-8l0,0v-8
                    h7.999c4.418,0,8,3.582,8,8S68.418,72,64,72z"
                    />
                </g>
            </svg>
            <p>+ B you can create the same rule for more than one activity</p>
        </div>
    </div>
{/if}

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
        class="mx-auto w-2/3 mt-10 flex flex-col rounded-lg shadow-lg border {$themeStore ===
        'Light'
            ? 'bg-[#ffffff] border-[#dad4e1] shadow-[0_0_30px_#f0e9f8]'
            : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'} transition duration-300"
    >
        <!-- Buscador -->
        <div class="relative mx-auto mt-5 w-3/4">
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search by activity..."
                class="text-[#6f40b8] h-[50px] w-full rounded-tl-lg rounded-tr-lg border pl-10 pr-14
                {$themeStore === 'Light'
                    ? 'border-[#875fc7] bg-[#ffffff]'
                    : 'border-[#462a72] bg-[#14111b]'}
                focus:bg-[#6e48ba] focus:text-white focus:border-[#6e48ba] focus:outline-none transition-colors duration-300 ease-in-out
                placeholder:text-[#6f40b8] focus:placeholder:text-white"
            />
            <button
                type="button"
                class="absolute top-0 right-0 h-[50px] w-[50px] rounded-tr-lg text-[#6e48ba]"
                on:click={() => (showModalFiltro = true)}
            >
                <span class="material-symbols-outlined"> tune </span>
            </button>
        </div>

        <!-- Barra con porcentajes -->
        {#if mostrarBarra}
            <div
                class="mx-auto w-3/4 border-b border-x {$themeStore === 'Light'
                    ? 'border-[#875fc7] bg-[#ffffff]'
                    : 'border-[#462a72] bg-[#14111b]'}"
            >
                <div class="flex flex-row w-full mx-auto my-auto py-2 px-8">
                    <!-- Barra para mostrar las reglas para eliminar o no eliminar -->
                    {#if porcentajeEliminarMantener > 0}
                        <div
                            class="border rounded-l rounded-r flex h-[20px] bg-[#4476c0]"
                            style="width: {porcentajeEliminarMantener}%"
                        >
                            <span class="text-white mx-auto my-auto text-xs"
                                >{porcentajeEliminarMantener}%</span
                            >
                        </div>
                    {/if}
                    <!-- Barra para mostrar las reglas para reemplazar -->
                    {#if porcentajeReemplazar > 0}
                        <div
                            class="border rounded-r flex w-[{porcentajeReemplazar}%] h-[20px] bg-[#cb6329]"
                            style="width: {porcentajeReemplazar}%"
                        >
                            <span class="text-white mx-auto my-auto text-xs"
                                >{porcentajeReemplazar}%</span
                            >
                        </div>
                    {/if}
                    <!-- Barra para mostrar las reglas sin tipo -->
                    {#if porcentajeSinTipo > 0}
                        <div
                            class="border rounded-r flex w-[{porcentajeSinTipo}%] h-[20px] bg-[#523e78]"
                            style="width: {porcentajeSinTipo}%"
                        >
                            <span class="text-white mx-auto my-auto text-xs"
                                >{porcentajeSinTipo}%</span
                            >
                        </div>
                    {/if}
                </div>
                <div class="flex px-10 my-2">
                    <div class="flex flex-row">
                        <div
                            class="w-[10px] h-[10px] rounded-xl bg-[#4476c0] my-auto mx-2"
                        ></div>
                        <h1 class="text-[#4476c0] my-auto">
                            Created delete/keep rules: {numeroReglasEliminarMantener}
                        </h1>
                    </div>
                    <div class="flex flex-row">
                        <div
                            class="w-[10px] h-[10px] rounded-xl bg-[#cb6329] my-auto mx-2"
                        ></div>
                        <h1 class="text-[#cb6329] my-auto">
                            Created replacement rules: {numeroReglasReemplazar}
                        </h1>
                    </div>
                    <div class="flex flex-row">
                        <div
                            class="w-[10px] h-[10px] rounded-xl bg-[#523e78] my-auto mx-2"
                        ></div>
                        <h1 class="text-[#523e78] my-auto">
                            Rules created without type: {numeroReglasSinTipo}
                        </h1>
                    </div>
                </div>
                <div class="flex">
                    <button
                        class="w-[40px] mx-auto border-t border-r border-l border-[#8161c1] rounded-tl rounded-tr"
                        on:click={() => {
                            mostrarBarra = false;
                        }}
                    >
                        <span
                            class="text-[#8161c1] text-sm my-auto mx-auto material-symbols-outlined"
                        >
                            keyboard_double_arrow_up
                        </span>
                    </button>
                </div>
            </div>
        {:else}
            <div
                class="flex w-3/4 mx-auto border-r border-l {$themeStore ===
                'Light'
                    ? 'border-[#875fc7] bg-[#ffffff]'
                    : 'border-[#462a72] bg-[#14111b]'}"
            >
                <button
                    class="w-[40px] mx-auto border-b border-l border-r border-[#8161c1] rounded-bl rounded-br"
                    on:click={() => {
                        mostrarBarra = true;
                    }}
                >
                    <span
                        class="text-[#8161c1] text-sm my-auto mx-auto material-symbols-outlined"
                    >
                        keyboard_double_arrow_down
                    </span>
                </button>
            </div>
        {/if}

        <!-- Tabla donde estaran las actividades -->
        <div
            class="w-3/4 h-[380px] mb-5 overflow-y-auto mx-auto rounded-bl-lg rounded-br-lg border-r border-l border-b {$themeStore ===
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
            <div class="text-center">
                {#each filteredActivities as nombre_actividad}
                    {#if (nombre_actividad.type == "bpmn2:Task" && filterNormalTask) || (nombre_actividad.type == "bpmn2:UserTask" && filterUserTask) || (nombre_actividad.type != "bpmn2:Task" && nombre_actividad.type != "bpmn2:UserTask" && filterAnotherTask)}
                        <!-- Tabla donde estaran las actividades listadas por nombre -->
                        <div class="flex justify-between mt-3">
                            <h1
                                class="mx-10 font-bold text-lg {$themeStore ===
                                'Light'
                                    ? 'text-[#855dc7]'
                                    : 'text-[#6d44ba]'}"
                            >
                                {nombre_actividad.name}
                            </h1>
                            <button
                                class="border rounded-md p-2 mx-10 text-sm {$themeStore ===
                                'Light'
                                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                on:click={() => {
                                    nombre_actividad_crear =
                                        nombre_actividad.name;
                                    tipo_actividad_crear =
                                        nombre_actividad.type;
                                    showModalCrear = true;
                                }}
                            >
                                Add Rule
                            </button>
                        </div>
                        {#each $actividades as activity (activity.id)}
                            {#if activity.name == nombre_actividad.name}
                                <div class="flex">
                                    <!-- Timeline -->
                                    <div class="flex-col">
                                        <div
                                            class="w-[2px] ml-12 h-[32px] bg-[#7546c1]"
                                        ></div>
                                        <div class="flex flex-row ml-12">
                                            <div
                                                class="w-[20px] h-[2px] bg-[#7546c1]"
                                            ></div>
                                            <div
                                                class="w-[12px] mt-[-5px] h-[12px] rounded-xl bg-[#7546c1]"
                                            ></div>
                                        </div>
                                        <div
                                            class="w-[2px] ml-12 h-[25px] bg-[#7546c1] mt-[-5px]"
                                        ></div>
                                    </div>
                                    <!-- Las reglas que estan para esa actividad -->
                                    <div
                                        class="mt-[18px] ml-2 flex-col h-full w-full"
                                    >
                                        <div
                                            class="flex flex-row justify-between"
                                        >
                                            <div class="text-[#7546c1]">
                                                <div class="flex">
                                                    {#if activity.rules.length > 0}
                                                        <span
                                                            class="mr-2 my-auto material-symbols-outlined"
                                                        >
                                                            check_circle
                                                        </span>

                                                        <h1 class="my-auto">
                                                            <span
                                                                class="text-lg text-bold"
                                                                >Rule name</span
                                                            >: {activity.subname}
                                                        </h1>

                                                        <button
                                                            class="border rounded-md mx-2 text-xs {$themeStore ===
                                                            'Light'
                                                                ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                                                : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                                            on:click={() => {
                                                                idactividad_editar =
                                                                    activity.id;
                                                                showModalEditar = true;
                                                            }}
                                                        >
                                                            <span
                                                                class="mx-auto my-auto material-symbols-outlined"
                                                            >
                                                                edit
                                                            </span>
                                                        </button>
                                                    {:else}
                                                        <span
                                                            class="mr-2 text-md my-auto material-symbols-outlined"
                                                        >
                                                            square_foot
                                                        </span>
                                                        <h1
                                                            class="my-auto text-sm"
                                                        >
                                                            <span
                                                                class="text-lg font-medium"
                                                                >Rule name:
                                                            </span>{activity.subname}
                                                        </h1>
                                                        <button
                                                            class="border rounded-md mx-2 text-xs {$themeStore ===
                                                            'Light'
                                                                ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                                                : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                                            on:click={() => {
                                                                idactividad_editar =
                                                                    activity.id;
                                                                showModalEditar = true;
                                                            }}
                                                        >
                                                            <span
                                                                class="mx-auto my-auto material-symbols-outlined"
                                                            >
                                                                edit
                                                            </span>
                                                        </button>
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
                                                            localStorage.setItem(
                                                                "activitySelect",
                                                                JSON.stringify(
                                                                    activity,
                                                                ),
                                                            );
                                                            goto(
                                                                "/createrules",
                                                            );
                                                            window.removeEventListener(
                                                                "keydown",
                                                                handleKeyDown,
                                                            );
                                                        }}
                                                    >
                                                        <h1
                                                            class="mx-auto my-auto text-sm"
                                                        >
                                                            Edit
                                                        </h1>
                                                    </button>
                                                    <!-- Tambien el boton de eliminar -->
                                                    <button
                                                        class="my-auto mx-auto w-1/3 h-[40px] border rounded-md {$themeStore ===
                                                        'Light'
                                                            ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                                            : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                                        on:click={() => {
                                                            idactividad_eliminar =
                                                                activity.id;
                                                            showModal = true;
                                                        }}
                                                    >
                                                        <h1
                                                            class="mx-auto my-auto text-sm"
                                                        >
                                                            Delete
                                                        </h1>
                                                    </button>
                                                {:else}
                                                    <!-- Si la actividad tiene reglas, se muestra el boton de editar reglas -->
                                                    <button
                                                        class="my-auto mx-auto mr-2 w-1/3 h-[40px] border rounded-md {$themeStore ===
                                                        'Light'
                                                            ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                                            : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                                        on:click={() => {
                                                            localStorage.setItem(
                                                                "activitySelect",
                                                                JSON.stringify(
                                                                    activity,
                                                                ),
                                                            );
                                                            goto(
                                                                "/createrules",
                                                            );
                                                            window.removeEventListener(
                                                                "keydown",
                                                                handleKeyDown,
                                                            );
                                                        }}
                                                    >
                                                        <h1
                                                            class="mx-auto my-auto text-sm"
                                                        >
                                                            Create rule
                                                        </h1>
                                                    </button>
                                                    <!-- Tambien el boton de eliminar -->
                                                    <button
                                                        class="my-auto mx-auto w-1/3 h-[40px] border rounded-md {$themeStore ===
                                                        'Light'
                                                            ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                                                            : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                                                        on:click={() => {
                                                            idactividad_eliminar =
                                                                activity.id;
                                                            showModal = true;
                                                        }}
                                                    >
                                                        <h1
                                                            class="mx-auto my-auto text-sm"
                                                        >
                                                            Delete
                                                        </h1>
                                                    </button>
                                                {/if}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    {/if}
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
                    goto("/savefiles");
                    window.removeEventListener("keydown", handleKeyDown);
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

<!-- Modal para eliminar las reglas de una actividad -->
{#if showModal}
    <div
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
        <div
            class="relative border rounded-lg shadow-lg p-8 w-1/2 {$themeStore ===
            'Light'
                ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
                : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'}"
        >
            <h1
                class="text-lg font-bold mb-4 {$themeStore === 'Light'
                    ? 'text-[#14111b]'
                    : 'text-[#b498df]'}"
            >
                Are you sure you want to delete everything from this activity?
            </h1>
            <div class="flex justify-end">
                <button
                    class="border rounded-md px-4 py-2 mr-2 {$themeStore ===
                    'Light'
                        ? 'bg-[#efe9f8] border-[#5e3fa1] text-[#5e3fa1] hover:shadow-[0_0_2px_#7443bf]'
                        : 'bg-[#251835] border border-[#7443bf] text-[#7443bf] hover:shadow-[0_0_2px_#5e3fa1]'} transition duration-300"
                    on:click={() => (showModal = false)}>Cancel</button
                >
                <button
                    class="border rounded-md px-4 py-2 bg-red-500 text-white {$themeStore ===
                    'Light'
                        ? 'bg-[#efe9f8] border-[#5e3fa1] text-[#5e3fa1] hover:shadow-[0_0_2px_#7443bf]'
                        : 'bg-[#251835] border border-[#7443bf] text-[#7443bf] hover:shadow-[0_0_2px_#5e3fa1]'} transition duration-300"
                    on:click={() => {
                        deleteActivityById(idactividad_eliminar);
                        showModal = false;
                    }}>Delete</button
                >
            </div>
        </div>
    </div>
{/if}

<!-- Modal para agregar una regla a una actividad -->
{#if showModalCrear}
    <div
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
        <div
            class="relative border rounded-lg shadow-lg p-8 w-1/2 {$themeStore ===
            'Light'
                ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
                : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'}"
        >
            <h1
                class="text-2xl text-center font-bold mb-4 {$themeStore ===
                'Light'
                    ? 'text-[#14111b]'
                    : 'text-[#b498df]'}"
            >
                Create a rule for an activity
            </h1>
            <input
                bind:value={subnombre_actividad_crear}
                class="text-[#6f40b8] pl-5 pr-14 mx-auto mb-5 h-[50px] w-full rounded-lg border {$themeStore ===
                'Light'
                    ? 'border-[#875fc7] bg-[#ffffff]'
                    : 'border-[#462a72] bg-[#14111b]'}
                focus:bg-[#6e48ba] focus:text-white focus:border-[#6e48ba] focus:outline-none transition-colors duration-300 ease-in-out
                placeholder:text-[#6f40b8] focus:placeholder:text-white"
                type="text"
                placeholder="Enter rule name"
                on:keydown={(event) => {
                    if (event.key === "Enter") {
                        createRuleActivity();
                        subnombre_actividad_crear = "";
                        showModalCrear = false;
                    }
                }}
            />
            <div class="flex justify-end">
                <button
                    class=" rounded-md px-4 py-2 mr-2 bg-red-500 text-white transition duration-300"
                    on:click={() => (showModalCrear = false)}>Cancel</button
                >
                <button
                    class="border rounded-md px-4 py-2{$themeStore === 'Light'
                        ? 'border border-[#7a5bb9] bg-[#f0e9f8] text-[#7a5bb9]'
                        : 'border border-[#8973ae] text-[#8973ae] bg-[#251835]'} transition duration-300"
                    on:click={() => {
                        createRuleActivity();
                        subnombre_actividad_crear = "";
                        showModalCrear = false;
                    }}
                    on:keydown={(event) => {
                        console.log(event);
                        if (event.key === "Enter") {
                            createRuleActivity();
                            subnombre_actividad_crear = "";
                            showModalCrear = false;
                        }
                    }}>Crear regla</button
                >
            </div>
        </div>
    </div>
{/if}

<!-- Modal para editar el nombre de una regla perteneciente a una actividad -->
{#if showModalEditar}
    <div
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
        <div
            class="relative border rounded-lg shadow-lg p-8 w-1/2 {$themeStore ===
            'Light'
                ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
                : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'}"
        >
            <h1
                class="text-2xl text-center font-bold mb-4 {$themeStore ===
                'Light'
                    ? 'text-[#14111b]'
                    : 'text-[#b498df]'}"
            >
                Edit rule name
            </h1>
            <input
                bind:value={subnombre_actividad_editar}
                class="text-[#6f40b8] pl-5 pr-14 mx-auto mb-5 h-[50px] w-full rounded-lg border {$themeStore ===
                'Light'
                    ? 'border-[#875fc7] bg-[#ffffff]'
                    : 'border-[#462a72] bg-[#14111b]'}
                focus:bg-[#6e48ba] focus:text-white focus:border-[#6e48ba] focus:outline-none transition-colors duration-300 ease-in-out
                placeholder:text-[#6f40b8] focus:placeholder:text-white"
                type="text"
                placeholder="Enter rule name"
                on:keydown={(event) => {
                    if (event.key === "Enter") {
                        editRuleActivity();
                        subnombre_actividad_crear = "";
                        showModalEditar = false;
                    }
                }}
            />
            <div class="flex justify-end">
                <button
                    class=" rounded-md px-4 py-2 mr-2 bg-red-500 text-white transition duration-300"
                    on:click={() => (showModalEditar = false)}>Cancel</button
                >
                <button
                    class="border rounded-md px-4 py-2{$themeStore === 'Light'
                        ? 'border border-[#7a5bb9] bg-[#f0e9f8] text-[#7a5bb9]'
                        : 'border border-[#8973ae] text-[#8973ae] bg-[#251835]'} transition duration-300"
                    on:click={() => {
                        editRuleActivity();
                        subnombre_actividad_crear = "";
                        showModalEditar = false;
                    }}>Editar nombre</button
                >
            </div>
        </div>
    </div>
{/if}

<!-- Modal para el filtro-->
{#if showModalFiltro}
    <div
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
        <div
            class="relative border rounded-lg shadow-lg p-8 h-[500px] w-1/2 {$themeStore ===
            'Light'
                ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
                : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'}"
        >
            <button
                on:click={() => {
                    showModalFiltro = false;
                }}
                class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
                <svg
                    class="fill-current h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                >
                    <path
                        d="M10 8.586l4.293-4.293 1.414 1.414L11.414 10l4.293 4.293-1.414 1.414L10 11.414l-4.293 4.293-1.414-1.414L8.586 10 4.293 5.707l1.414-1.414L10 8.586z"
                    />
                </svg>
            </button>
            <div class="flex flex-col h-full">
                <h1
                    class="mx-auto text-2xl font-bold mb-4 {$themeStore ===
                    'Light'
                        ? 'text-[#14111b]'
                        : 'text-[#b498df]'}"
                >
                    Activity filter
                </h1>
                <div class="mx-10">
                    <!-- Filtro por tipos-->
                    <h1
                        class="text-lg {$themeStore === 'Light'
                            ? 'text-[#14111b]'
                            : 'text-[#b498df]'}"
                    >
                        Filter by type
                    </h1>
                    <div
                        class="mt-3 w-full h-[1px] {$themeStore === 'Light'
                            ? 'bg-[#14111b]'
                            : 'bg-[#b498df]'}"
                    ></div>
                    <!-- CheckBox-->
                    <div class="flex flex-col space-y-2 mt-5">
                        <label class="inline-flex items-center">
                            <input
                                type="checkbox"
                                class="form-checkbox h-5 w-5 text-[#6e48ba]"
                                bind:checked={filterNormalTask}
                            />
                            <span
                                class="ml-2 {$themeStore === 'Light'
                                    ? 'text-[#855dc7]'
                                    : 'text-[#6d44ba]'}">View normal task</span
                            >
                        </label>

                        <label class="inline-flex items-center">
                            <input
                                type="checkbox"
                                class="form-checkbox h-5 w-5 text-[#6e48ba]"
                                bind:checked={filterUserTask}
                            />
                            <span
                                class="ml-2 {$themeStore === 'Light'
                                    ? 'text-[#855dc7]'
                                    : 'text-[#6d44ba]'}">View user task</span
                            >
                        </label>

                        <label class="inline-flex items-center">
                            <input
                                type="checkbox"
                                class="form-checkbox h-5 w-5 text-[#6e48ba]"
                                bind:checked={filterAnotherTask}
                            />
                            <span
                                class="ml-2 {$themeStore === 'Light'
                                    ? 'text-[#855dc7]'
                                    : 'text-[#6d44ba]'}"
                                >View another type of task</span
                            >
                        </label>
                    </div>

                    <!-- Filtro por orden-->
                    <h1
                        class="mt-5 text-lg {$themeStore === 'Light'
                            ? 'text-[#14111b]'
                            : 'text-[#b498df]'}"
                    >
                        Filter by order
                    </h1>
                    <div
                        class="mt-3 w-full h-[1px] {$themeStore === 'Light'
                            ? 'bg-[#14111b]'
                            : 'bg-[#b498df]'}"
                    ></div>
                    <!-- CheckBox-->
                    <div class="flex flex-col space-y-2 mt-5">
                        <label class="inline-flex items-center">
                            <input
                                type="checkbox"
                                class="form-checkbox h-5 w-5 text-[#6e48ba]"
                            />
                            <span
                                class="ml-2 {$themeStore === 'Light'
                                    ? 'text-[#855dc7]'
                                    : 'text-[#6d44ba]'}"
                                >Alphabetical order (NO FUNCIONAL)</span
                            >
                        </label>

                        <label class="inline-flex items-center">
                            <input
                                type="checkbox"
                                class="form-checkbox h-5 w-5 text-[#6e48ba]"
                            />
                            <span
                                class="ml-2 {$themeStore === 'Light'
                                    ? 'text-[#855dc7]'
                                    : 'text-[#6d44ba]'}"
                                >Less rules created (NO FUNCIONAL)</span
                            >
                        </label>

                        <label class="inline-flex items-center">
                            <input
                                type="checkbox"
                                class="form-checkbox h-5 w-5 text-[#6e48ba]"
                            />
                            <span
                                class="ml-2 {$themeStore === 'Light'
                                    ? 'text-[#855dc7]'
                                    : 'text-[#6d44ba]'}"
                                >More rules created (NO FUNCIONAL)</span
                            >
                        </label>
                    </div>
                </div>
                <div class="mt-auto mx-10">
                    <button
                        class="w-full h-[40px] rounded-md text-sm {$themeStore ===
                        'Light'
                            ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                            : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'} border"
                        on:click={() => {
                            showModalFiltro = false;
                        }}
                    >
                        <div class="flex mx-10">
                            <h1 class="my-auto mx-auto">Apply filter</h1>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

{#if commandModal}
    <div
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
        {#if !$createRuleforActivities}
            <div
                class="relative border rounded-lg shadow-lg p-8 h-[500px] w-1/2 {$themeStore ===
                'Light'
                    ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
                    : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'}"
            >
                <button
                    on:click={() => {
                        commandModal = false;
                        $createRuleforActivities = false;
                        searchQuery = "";
                        selectedActivities = [];
                    }}
                    class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                    <svg
                        class="fill-current h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                    >
                        <path
                            d="M10 8.586l4.293-4.293 1.414 1.414L11.414 10l4.293 4.293-1.414 1.414L10 11.414l-4.293 4.293-1.414-1.414L8.586 10 4.293 5.707l1.414-1.414L10 8.586z"
                        />
                    </svg>
                </button>
                <div class="flex flex-col h-full w-full">
                    <h1
                        class="mx-auto text-2xl font-bold mb-4 {$themeStore ===
                        'Light'
                            ? 'text-[#6d44b9]'
                            : 'text-[#b498df]'}"
                    >
                        Create rule for selected activities
                    </h1>
                    <div
                        class="w-4/5 h-[370px] flex flex-col mx-auto my-auto border border-[#6e48ba] rounded-xl"
                    >
                        <button class="flex text-[#6e48ba] mx-2 my-2">
                            <span class="my-auto material-symbols-outlined">
                                check_box_outline_blank
                            </span>
                            <h1 class="my-auto ml-2">Select all</h1>
                        </button>
                        <div class="w-full h-[1px] bg-[#6e48ba]"></div>
                        <div class="relative flex w-[90%] my-2 mx-auto">
                            <span
                                class="absolute top-0 left-0 ml-2 text-[#6e48ba] material-symbols-outlined"
                            >
                                search
                            </span>
                            <input
                                class="pl-10 w-full rounded border {$themeStore ===
                                'Light'
                                    ? 'border-[#875fc7] bg-[#ffffff]'
                                    : 'border-[#462a72] bg-[#14111b]'}
                focus:bg-[#6e48ba] focus:text-white focus:border-[#6e48ba] focus:outline-none transition-colors duration-300 ease-in-out
                placeholder:text-[#6f40b8] focus:placeholder:text-white"
                                type="text"
                                placeholder="Find activity..."
                                bind:value={searchQuery}
                            />
                        </div>
                        <div class="w-full h-[1px] bg-[#6e48ba]"></div>
                        <div class="flex-col overflow-y-auto">
                            {#each filteredActivities as nombre_actividad}
                                <button
                                    on:click={() =>
                                        handleSelection(nombre_actividad)}
                                    class="mx-2 my-1 flex text-[#6e48ba]"
                                >
                                    {#if selectedActivities.includes(nombre_actividad)}
                                        <span
                                            class="my-auto material-symbols-outlined"
                                        >
                                            check_box
                                        </span>
                                    {:else}
                                        <span
                                            class="my-auto material-symbols-outlined"
                                        >
                                            check_box_outline_blank
                                        </span>
                                    {/if}
                                    <h1 class="ml-2">
                                        {nombre_actividad.name}
                                    </h1>
                                </button>
                            {/each}
                        </div>
                    </div>
                    <button
                        class="w-4/5 border border-[#7f5fc1] bg-[#f0e9f8] text-[#7f5fc1] my-2 mx-auto"
                        on:click={() => {
                            //localStorage.setItem("selectedActivities", JSON.stringify(selectedActivities));
                            //goto("/createrules");
                            //window.removeEventListener("keydown", handleKeyDown);
                            $createRuleforActivities = true;
                        }}
                    >
                        <h1 class="mx-auto">Create rule</h1>
                    </button>
                    <p>
                        Actividades seleccionadas: {JSON.stringify(
                            selectedActivities,
                        )}
                    </p>
                </div>
            </div>
        {:else}
            <div
                class="relative border rounded-lg shadow-lg p-8 h-[250px] w-1/2 {$themeStore ===
                'Light'
                    ? 'bg-[#ffffff] border-[#f0eaf9] shadow-[0_0_30px_#f0eaf9]'
                    : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'}"
            >
                <button
                    on:click={() => {
                        commandModal = false;
                        $createRuleforActivities = false;
                        searchQuery = "";
                        selectedActivities = [];
                    }}
                    class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                    <svg
                        class="fill-current h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                    >
                        <path
                            d="M10 8.586l4.293-4.293 1.414 1.414L11.414 10l4.293 4.293-1.414 1.414L10 11.414l-4.293 4.293-1.414-1.414L8.586 10 4.293 5.707l1.414-1.414L10 8.586z"
                        />
                    </svg>
                </button>
                <div class="flex flex-col h-full w-full">
                    <h1
                        class="mx-auto text-2xl font-bold mb-4 {$themeStore ===
                        'Light'
                            ? 'text-[#6d44b9]'
                            : 'text-[#b498df]'}"
                    >
                        Name the rule that will be created for the selected
                        rules
                    </h1>
                    <input
                        bind:value={subnombre_actividad_crear}
                        class="text-[#6f40b8] pl-5 pr-14 mx-auto mb-5 h-[50px] w-full rounded-lg border {$themeStore ===
                        'Light'
                            ? 'border-[#875fc7] bg-[#ffffff]'
                            : 'border-[#462a72] bg-[#14111b]'}
                focus:bg-[#6e48ba] focus:text-white focus:border-[#6e48ba] focus:outline-none transition-colors duration-300 ease-in-out
                placeholder:text-[#6f40b8] focus:placeholder:text-white"
                        type="text"
                        placeholder="Enter rule name"
                        on:keydown={(event) => {
                            if (event.key === "Enter") {
                                localStorage.setItem(
                                    "nameRuleForActivities",
                                    JSON.stringify(subnombre_actividad_crear),
                                );
                                localStorage.setItem(
                                    "selectedActivities",
                                    JSON.stringify(selectedActivities),
                                );
                                goto("/createrules");
                                window.removeEventListener(
                                    "keydown",
                                    handleKeyDown,
                                );
                            }
                        }}
                    />
                    <button
                        class="w-full h-[50px] rounded-lg border border-[#7f5fc1] bg-[#f0e9f8] text-[#7f5fc1] mx-auto"
                        on:click={() => {
                            localStorage.setItem(
                                "nameRuleForActivities",
                                JSON.stringify(subnombre_actividad_crear),
                            );
                            localStorage.setItem(
                                "selectedActivities",
                                JSON.stringify(selectedActivities),
                            );
                            goto("/createrules");
                            window.removeEventListener(
                                "keydown",
                                handleKeyDown,
                            );
                        }}
                    >
                        <h1 class="mx-auto">Create rule</h1>
                    </button>
                </div>
            </div>
        {/if}
    </div>
{/if}
