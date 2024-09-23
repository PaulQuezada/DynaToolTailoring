<script>
  import { themeStore } from "../stores";
</script>

<div class="fixed inset-0 z-[9999]">
  <div class="absolute inset-0 flex flex-col justify-center items-center z-50 {$themeStore === "Light"
        ? "bg-[#ffffff]"
        : "bg-[#14111a]"}">
    <div
      class="flex loader"
      style="border-color: {$themeStore === 'Light' ? '#6841b0' : '#aaaaaa'};"
    ></div>
    <div>
      <h1
        class="text-center text-xs mt-5 font-bold {$themeStore === 'Light'
          ? 'text-[rgb(104,65,176)]'
          : 'text-[#aaaaaa]'}"
      >
        Hello! We are loading your data
      </h1>
    </div>
  </div>
</div>

<style>
  .loader {
    width: 35px;
    aspect-ratio: 1;
    border: 3px solid transparent; /* Establece el color inicial como transparente */
    border-top-color: transparent; /* Establece el color inicial del borde superior como transparente */
    animation: l1 2s infinite;
  }

  @keyframes l1 {
    0% {
      border-radius: 50% 50% 0 0;
    }
    25% {
      border-radius: 0 50% 50% 0;
    }
    50% {
      border-radius: 0 0 50% 50%;
    }
    75% {
      border-radius: 50% 0 0 50%;
    }
    100% {
      border-radius: 50% 50% 0 0;
    }
  }
</style>
