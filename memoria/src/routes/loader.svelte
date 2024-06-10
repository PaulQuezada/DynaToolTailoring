<script>
    import { themeStore } from "../stores";
  </script>
  <div class="w-full h-full flex flex-col">
        <div class="h-[250px] w-full"></div>
      <div class="flex loader mx-auto" style="border-color: {$themeStore === 'Light' ? '#6841b0' : '#aaaaaa'};"></div>
      <div>
        <h1 class="text-center text-xs mt-5 font-bold {$themeStore === 'Light' ? 'text-[rgb(104,65,176)]' : 'text-[#aaaaaa]'}">
          Hello! We are loading your data
        </h1>
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
      0%   { border-radius: 50% 50% 0 0; }
      25%  { border-radius: 0 50% 50% 0; }
      50%  { border-radius: 0 0 50% 50%; }
      75%  { border-radius: 50% 0 0 50%; }
      100% { border-radius: 50% 50% 0 0; }
    }
  </style>
  