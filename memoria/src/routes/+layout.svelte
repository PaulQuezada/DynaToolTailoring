<script lang="ts">
    import "../app.css";
    import "../routes/types.ts";
    let activeSection = "get-started";
    import Notifications from "svelte-notifications";
    import { themeStore } from "../stores";
    function setActive(section: string) {
        activeSection = section;
    }
    function toggleTheme() {
        themeStore.update((currentTheme) =>
            currentTheme === "Light" ? "Dark" : "Light",
        );
    }
</script>

<Notifications>
    <div
        class="{$themeStore === 'Light'
            ? 'bg-[#ffffff]'
            : 'bg-gradient-to-br from-[#14111b] to-[#281428]'} transition duration-500"
    >
        <div class="h-screen w-screen">
            <div class="flex-1 h-1/6 flex justify-between">
                <div class="flex my-auto mx-5">
                    <span
                        class="material-symbols-outlined text-3xl mr-3 font-bold {$themeStore ===
                        'Light'
                            ? 'text-[#4f4d54]'
                            : 'text-[#ffffff]'}">deployed_code</span
                    >
                    <h1
                        class="{$themeStore === 'Light'
                            ? 'text-[#4f4d54]'
                            : 'text-[#ffffff]'} my-auto text-2xl"
                    >
                        DynaToolTailoring
                    </h1>
                </div>
                <div class="flex my-auto">
                    <div class="flex flex-col">
                        <button
                            class="{$themeStore === 'Light'
                                ? 'text-[#868592] hover:text-[#13111b]'
                                : 'text-[#9c989e] hover:text-[#ffffff]'} p-2 rounded-lg mx-2 transition duration-300"
                            on:click={() => setActive("get-started")}
                        >
                            <div class="my-auto flex">
                                <span class="material-symbols-outlined mr-1"
                                    >play_circle</span
                                >
                                <h1 class="mx-auto text-center">Get started</h1>
                            </div>
                        </button>
                        {#if activeSection === "get-started"}
                            <div
                                class="mx-auto w-[140px] h-[2px] {$themeStore ===
                                'Light'
                                    ? 'bg-black'
                                    : 'bg-white'}"
                            ></div>
                        {/if}
                    </div>
                    <div class="flex flex-col">
                        <button
                            class="{$themeStore === 'Light'
                                ? 'text-[#868592] hover:text-[#13111b]'
                                : 'text-[#9c989e] hover:text-[#ffffff]'} p-2 rounded-lg mx-2 transition duration-300"
                            on:click={toggleTheme}
                        >
                            <div class="my-auto flex">
                                {#if $themeStore === "Light"}
                                    <span class="mr-2 material-symbols-outlined"
                                        >wb_sunny</span
                                    >
                                {:else}
                                    <span class="mr-2 material-symbols-outlined"
                                        >clear_night</span
                                    >
                                {/if}
                                <h1>{$themeStore} theme</h1>
                            </div>
                        </button>
                    </div>
                    <div class="flex flex-col">
                        <button
                            class="{$themeStore === 'Light'
                                ? 'text-[#868592] hover:text-[#13111b]'
                                : 'text-[#9c989e] hover:text-[#ffffff]'} p-2 rounded-lg mx-2 transition duration-300"
                            on:click={() => setActive("about")}
                        >
                            <div class="my-auto flex">
                                <h1>About DynaTool</h1>
                            </div>
                        </button>
                        {#if activeSection === "about"}
                            <div
                                class="mx-auto w-[140px] h-[2px] {$themeStore ===
                                'Light'
                                    ? 'bg-black'
                                    : 'bg-white'}"
                            ></div>
                        {/if}
                    </div>
                </div>
            </div>
            <div class="flex-1 h-5/6">
                <div
                    class="w-full -mt-8 h-[1px] {$themeStore === 'Light'
                        ? 'bg-[#f6f6f6]'
                        : 'bg-[#2e1e4d]'}"
                ></div>
                <slot></slot>
            </div>
        </div>
    </div>
</Notifications>
