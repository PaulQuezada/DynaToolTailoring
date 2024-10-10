<script lang="ts">
    // Importaciones de módulos
    import "../../app.css";
    import { goto } from "$app/navigation";
    import { themeStore } from "../../stores";
    import "../types";
    import { onMount } from "svelte";
    import { get, writable, type Writable } from "svelte/store";
    import { fileUploadBpmn } from "../../functions/importdata";
    import "../../functions/datamanager";
    import { getNotificationsContext } from "svelte-notifications";
    import {
        deleteDataNameRuleForActivities,
        deleteDataSelectedActivity,
        getDataProcess,
        getDataRulesTask,
        setDataNameRuleForActivities,
        setDataRulesTask,
        setDataSelectedActivities,
        setDataSelectedActivity,
    } from "../../functions/datamanager";
    import { rule } from "postcss";
    const { addNotification } = getNotificationsContext();
    // Variables
    let searchQuery = "";
    let activities: Writable<activity[]> = writable([]);
    let name_activities = writable<any[]>([]);
    let showModal = false;
    let showModalCrear = false;
    let showModalEditar = false;
    let showModalFiltro = false;
    let idruledelete: number;
    let idruleedit: number;
    let name_activity_create: String;
    let subname_activity_create: String;
    let activity_type_create: String;
    let subname_activity_edit: String;

    // Variables filtros
    let filterNormalTask = true;
    let filterUserTask = true;
    let filterAnotherTask = false;

    // Variables para la barra de datos
    let numberRulesDeleteOrKeep: number = 0;
    let numberRulesReplace: number = 0;
    let numberRulesWithoutType: number = 0;
    let percentageRemoveOrKeep: number = 0;
    let percentageReplace: number = 0;
    let percentageWithoutType: number = 0;
    let showBar: boolean = false;

    // Variable para crear para varias actividades la misma regla
    let commandModal: boolean = false;
    let selectedAllActivities: boolean = false;
    let selectedActivities: string[] = [];
    let createRuleforActivities: Writable<boolean> = writable(false);

    let osName: string = "detecting...";
    let commandText: string = "detected";

    // Función para validar los datos antes de pasar a la siguiente vista
    function validateToNextStage(): Boolean {
        const rulesTask = getDataRulesTask();
        if (rulesTask.length != 0) {
            var validate = true;
            rulesTask.forEach((ruleTask: activity) => {
                // Si al menos una regla esta vacia, no se puede pasar a la siguiente vista
                if(ruleTask.rules.length == 0){
                    validate = false;
                }
            });
            return validate;
        } else {
            return false;
        }
    }
    // Función para detectar el sistema operativo
    function detectOS(): string {
        const platform = navigator.platform.toLowerCase();

        if (platform.includes("win")) {
            commandText = "Alt+B";
            return "Windows";
        } else if (platform.includes("mac")) {
            commandText = "Command+B";
            return "MacOS";
        } else if (platform.includes("linux")) {
            commandText = "Alt+B";
            return "Linux";
        } else {
            commandText = "Alt+B";
            return "Unknown OS";
        }
    }

    // Función para filtrar las actividades por tipo (En este caso por Task, UserTask y otro tipo que tenga el nombre task en algun lado)
    function typefilters(typeActivity: any): Boolean {
        // Filtramos las actividades por tipo
        if (
            (typeActivity == "bpmn2:Task" && filterNormalTask) ||
            (typeActivity == "bpmn2:UserTask" && filterUserTask) ||
            (typeActivity.type != "bpmn2:Task" &&
                typeActivity.type != "bpmn2:UserTask" &&
                filterAnotherTask)
        ) {
            return true;
        }
        return false;
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (osName === "MacOS") {
            if (event.metaKey && event.key === "b") {
                commandModal = !commandModal; // Cambia el valor de la variable
                console.log(`isActive: ${commandModal}`);
            }
        } else {
            if (event.altKey && event.key === "b") {
                commandModal = !commandModal; // Cambia el valor de la variable
                console.log(`isActive: ${commandModal}`);
            }
        }
    }

    function handleSelection(activity: string) {
        // Si la actividad ya esta seleccionada, la eliminamos
        if (selectedActivities.includes(activity)) {
            selectedActivities = selectedActivities.filter(
                (a) => a !== activity,
            );
        } else {
            selectedActivities = [...selectedActivities, activity];
        }
    }

    function selectionAllActivities() {
        selectedActivities = [];
        if (selectedAllActivities) {
            $name_activities.forEach((activity: any) => {
                selectedActivities = [...selectedActivities, activity];
            });
        }
    }

    // Filtrar actividades por nombre y por tipo
    $: {
        numberRulesDeleteOrKeep = 0;
        numberRulesReplace = 0;
        percentageRemoveOrKeep = 0;
        percentageReplace = 0;
        if ($activities.length !== 0) {
            $activities.forEach((regla_activity: activity) => {
                if (regla_activity.deleted !== undefined) {
                    numberRulesDeleteOrKeep++;
                } else if (regla_activity.replaced !== undefined) {
                    numberRulesReplace++;
                } else {
                    numberRulesWithoutType++;
                }
            });
            if (
                numberRulesDeleteOrKeep !== 0 ||
                numberRulesReplace !== 0 ||
                numberRulesWithoutType !== 0
            ) {
                // Calculamos el porcentaje de las reglas
                percentageRemoveOrKeep =
                    (numberRulesDeleteOrKeep / $activities.length) * 100;
                percentageReplace =
                    (numberRulesReplace / $activities.length) * 100;
                percentageWithoutType =
                    (numberRulesWithoutType / $activities.length) * 100;
                // Truncamos el porcentaje
                percentageRemoveOrKeep = Math.trunc(percentageRemoveOrKeep);
                percentageReplace = Math.trunc(percentageReplace);
                percentageWithoutType = Math.trunc(percentageWithoutType);
            }
        }
    }

    // cuando montamos la pagina recolectamos los datos y los guardamos en el store
    onMount(async () => {
        // Detectar el sistema operativo
        osName = detectOS();
        console.log(osName);
        // Eliminamos las actividad/es seleccionadas guardadas en el sistema (Esos datos solo sirven para cuando se crean las reglas)
        deleteDataSelectedActivity();
        deleteDataNameRuleForActivities();
        deleteDataNameRuleForActivities();
        // Verificamos si rulesTask existe en el sistema
        var taskSystem = getDataRulesTask();
        console.log(taskSystem);
        if (taskSystem != null) {
            // Guardamos las actividades
            activities.set(taskSystem);
            // Extraemos solo los nombres de las actividades(sin que se repitan)
            saveNamesActivities();
        } else {
            console.log("No hay actividades");
            await loadDataBPMN();
            setDataRulesTask(JSON.stringify([])); // Inicializamos las reglas para cada actividad en vacio
        }
        // Se agrega el event listener cuando el componente se monta
        window.addEventListener("keydown", handleKeyDown);
    });

    // Función para manejar la carga de archivos BPMN
    async function loadDataBPMN() {
        // Extraemos los datos el archivo BPMN
        const xmlBpmn: string = await getDataProcess();
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
        name_activities.set(uniqueTaskNames);
        console.log(uniqueTaskNames);
    }

    // Función para guardar los nombres de las actividades
    function saveNamesActivities() {
        const actividades_json = getDataRulesTask();
        if (actividades_json.length == 0) {
            loadDataBPMN();
        } else {
            loadDataBPMN();
            activities.set(actividades_json);
        }
    }

    // Filtrar actividades por nombre y por tipo
    $: filteredActivities = $name_activities.filter((activity) =>
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    function deleteRuleById(taskId: number): void {
        var tasks = getDataRulesTask();
        var newTasks = tasks.filter((task: any) => task.id !== taskId);
        setDataRulesTask(JSON.stringify(newTasks));
        activities.set(newTasks);
    }

    function createRuleActivity() {
        var tasks = getDataRulesTask();
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
            name: name_activity_create,
            subname: subname_activity_create,
            type: activity_type_create,
            rules: [],
        };
        tasks.push(newRule);
        setDataRulesTask(JSON.stringify(tasks));
        activities.set(tasks);
    }

    function editRuleActivity() {
        var tasks = getDataRulesTask();
        tasks.forEach((task: any) => {
            if (task.id === idruleedit) {
                task.subname = subname_activity_edit;
            }
        });
        console.log(tasks);
        setDataRulesTask(JSON.stringify(tasks));
        activities.set(tasks);
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
        class="mx-auto w-2/3 mt-10 flex flex-col rounded-lg shadow-lg border {$themeStore ===
        'Light'
            ? 'bg-[#ffffff] border-[#dad4e1] shadow-[0_0_30px_#f0e9f8]'
            : 'bg-[#14111c] border-[#31214c] shadow-[0_0_30px_#31214c]'} transition duration-300"
    >
        <!-- Command + B or Alt + B-->
        <div
            class="flex mt-3 w-3/4 h-[50px] rounded border mx-auto {$themeStore ===
            'Light'
                ? 'bg-[#fef8ca] border-[#e3d290] text-[#202328]'
                : 'bg-[#5e4821] border-[#27211a] text-white'}"
        >
            <!-- Mostramos los iconos de los S.O-->
            {#if osName === "MacOS"}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-[30px] h-[30px] my-auto mx-2 {$themeStore ===
                    'Light'
                        ? 'fill-[#936921]'
                        : 'fill-[#c99b3e]'}"
                    viewBox="0 0 24 24"
                >
                    <path
                        d="M19.665 16.811a10.316 10.316 0 0 1-1.021 1.837c-.537.767-.978 1.297-1.316 1.592-.525.482-1.089.73-1.692.744-.432 0-.954-.123-1.562-.373-.61-.249-1.17-.371-1.683-.371-.537 0-1.113.122-1.73.371-.616.25-1.114.381-1.495.393-.577.025-1.154-.229-1.729-.764-.367-.32-.826-.87-1.377-1.648-.59-.829-1.075-1.794-1.455-2.891-.407-1.187-.611-2.335-.611-3.447 0-1.273.275-2.372.826-3.292a4.857 4.857 0 0 1 1.73-1.751 4.65 4.65 0 0 1 2.34-.662c.46 0 1.063.142 1.81.422s1.227.422 1.436.422c.158 0 .689-.167 1.593-.498.853-.307 1.573-.434 2.163-.384 1.6.129 2.801.759 3.6 1.895-1.43.867-2.137 2.08-2.123 3.637.012 1.213.453 2.222 1.317 3.023a4.33 4.33 0 0 0 1.315.863c-.106.307-.218.6-.336.882zM15.998 2.38c0 .95-.348 1.838-1.039 2.659-.836.976-1.846 1.541-2.941 1.452a2.955 2.955 0 0 1-.021-.36c0-.913.396-1.889 1.103-2.688.352-.404.8-.741 1.343-1.009.542-.264 1.054-.41 1.536-.435.013.128.019.255.019.381z"
                    />
                </svg>
            {:else if osName == "Windows"}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-[30px] h-[30px] my-auto mx-2 {$themeStore ===
                    'Light'
                        ? 'fill-[#936921]'
                        : 'fill-[#c99b3e]'}"
                    viewBox="0 0 24 24"
                    style="color:#936921 ;"
                >
                    <path
                        d="m3 5.557 7.357-1.002.004 7.097-7.354.042L3 5.557zm7.354 6.913.006 7.103-7.354-1.011v-6.14l7.348.048zm.892-8.046L21.001 3v8.562l-9.755.077V4.424zm9.758 8.113-.003 8.523-9.755-1.378-.014-7.161 9.772.016z"
                    />
                </svg>
            {/if}

            <p class="my-auto w-3/4 text-sm">
                <strong>Using</strong> the key {commandText} you can create the same
                rule for more than one activity
            </p>
            <button
                class="my-auto rounded py-1 px-2 text-sm border text-white
                {$themeStore === 'Light'
                    ? 'bg-[#428646] border-[#3d7741]'
                    : 'bg-[#386de3] border-[#4c7ce6]'}"
                on:click={() => {
                    commandModal = !commandModal;
                }}>Create the rule</button
            >
        </div>
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
        {#if showBar}
            <div
                class="mx-auto w-3/4 border-b border-x {$themeStore === 'Light'
                    ? 'border-[#875fc7] bg-[#ffffff]'
                    : 'border-[#462a72] bg-[#14111b]'}"
            >
                <div class="flex flex-row w-full mx-auto my-auto py-2 px-8">
                    <!-- Barra para mostrar las reglas para eliminar o no eliminar -->
                    {#if percentageRemoveOrKeep > 0}
                        <div
                            class="border rounded-l rounded-r flex h-[20px] bg-[#4476c0]"
                            style="width: {percentageRemoveOrKeep}%"
                        >
                            <span class="text-white mx-auto my-auto text-xs"
                                >{percentageRemoveOrKeep}%</span
                            >
                        </div>
                    {/if}
                    <!-- Barra para mostrar las reglas para reemplazar -->
                    {#if percentageReplace > 0}
                        <div
                            class="border rounded-r flex w-[{percentageReplace}%] h-[20px] bg-[#cb6329]"
                            style="width: {percentageReplace}%"
                        >
                            <span class="text-white mx-auto my-auto text-xs"
                                >{percentageReplace}%</span
                            >
                        </div>
                    {/if}
                    <!-- Barra para mostrar las reglas sin tipo -->
                    {#if percentageWithoutType > 0}
                        <div
                            class="border rounded-r flex w-[{percentageWithoutType}%] h-[20px] bg-[#523e78]"
                            style="width: {percentageWithoutType}%"
                        >
                            <span class="text-white mx-auto my-auto text-xs"
                                >{percentageWithoutType}%</span
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
                            Created delete/keep rules: {numberRulesDeleteOrKeep}
                        </h1>
                    </div>
                    <div class="flex flex-row">
                        <div
                            class="w-[10px] h-[10px] rounded-xl bg-[#cb6329] my-auto mx-2"
                        ></div>
                        <h1 class="text-[#cb6329] my-auto">
                            Created replacement rules: {numberRulesReplace}
                        </h1>
                    </div>
                    <div class="flex flex-row">
                        <div
                            class="w-[10px] h-[10px] rounded-xl bg-[#523e78] my-auto mx-2"
                        ></div>
                        <h1 class="text-[#523e78] my-auto">
                            Rules created without type: {numberRulesWithoutType}
                        </h1>
                    </div>
                </div>
                <div class="flex">
                    <button
                        class="w-[40px] mx-auto border-t border-r border-l border-[#8161c1] rounded-tl rounded-tr"
                        on:click={() => {
                            showBar = false;
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
                        showBar = true;
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
                    {#if filterNormalTask != null && filterUserTask != null && filterAnotherTask != null && typefilters(nombre_actividad.type)}
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
                                    name_activity_create =
                                        nombre_actividad.name;
                                    activity_type_create =
                                        nombre_actividad.type;
                                    showModalCrear = true;
                                }}
                            >
                                Add Rule
                            </button>
                        </div>
                        <!-- Reglas de la actividad -->
                        {#each $activities as activity (activity.id)}
                            {#if activity.name == nombre_actividad.name}
                                <div class="flex">
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
                                                                idruledelete =
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
                                                                idruleedit =
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
                                                            setDataSelectedActivity(
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
                                                            idruledelete =
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
                                                            setDataSelectedActivity(
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
                                                            idruledelete =
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
                on:click={() => {
                    goto("/");
                    window.removeEventListener("keydown", handleKeyDown);
                }}
            >
                <div class="flex my-auto">
                    <span class="material-symbols-outlined text-lg mr-1"
                        >arrow_back_ios</span
                    >
                    <h1 class="my-auto text-sm mx-2">Back Home</h1>
                </div>
            </button>
            <button
                class="border font-bold rounded-md p-2 hover:shadow-2xl transition duration-300 {$themeStore ===
                'Light'
                    ? 'border-[#855dc7] bg-[#f1e9f9] text-[#855dc7]'
                    : 'border-[#6d44ba] bg-[#231833] text-[#6d44ba]'}"
                on:click={() => {
                    validateToNextStage()
                    if (validateToNextStage()) {
                        goto("/savefiles");
                        window.removeEventListener("keydown", handleKeyDown);
                    } else {
                        addNotification({
                            text: "You can't have empty rules to proceed to the next stage",
                            position: "top-right",
                            type: "error",
                            removeAfter: 4000,
                        });
                    }
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
                        deleteRuleById(idruledelete);
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
                bind:value={subname_activity_create}
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
                        subname_activity_create = "";
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
                        subname_activity_create = "";
                        showModalCrear = false;
                    }}
                    on:keydown={(event) => {
                        console.log(event);
                        if (event.key === "Enter") {
                            createRuleActivity();
                            subname_activity_create = "";
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
                bind:value={subname_activity_edit}
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
                        subname_activity_edit = "";
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
                        subname_activity_create = "";
                        showModalEditar = false;
                    }}>Edit name</button
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
                        <button
                            class="flex text-[#6e48ba] mx-2 my-2"
                            on:click={() => {
                                selectedAllActivities = !selectedAllActivities;
                                selectionAllActivities();
                            }}
                        >
                            {#if selectedAllActivities}
                                <span class="my-auto material-symbols-outlined">
                                    check_box
                                </span>
                            {:else}
                                <span class="my-auto material-symbols-outlined">
                                    check_box_outline_blank
                                </span>
                            {/if}
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
                        class="w-4/5 rounded border {$themeStore === 'Light'
                            ? 'border-[#875fc7] bg-[#f0e9f8] text-[#875fc7]'
                            : 'border-[#462a72] bg-[#211831] text-[#684ab4]'}  my-2 mx-auto"
                        on:click={() => {
                            $createRuleforActivities = true;
                        }}
                    >
                        <h1 class="mx-auto">Create rule</h1>
                    </button>
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
                        bind:value={subname_activity_create}
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
                                setDataNameRuleForActivities(
                                    JSON.stringify(subname_activity_create),
                                );
                                setDataSelectedActivities(
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
                            setDataNameRuleForActivities(
                                JSON.stringify(subname_activity_create),
                            );
                            setDataSelectedActivities(
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
