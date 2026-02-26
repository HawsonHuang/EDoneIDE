<template>
  <div class="h-full w-full bg-gray-100 flex flex-col border-t border-gray-300">
    <div class="flex items-center px-4 gap-6 border-b border-gray-200 text-[11px] h-8 shrink-0">
      <div class="text-gray-800 border-b border-blue-500 h-full flex items-center px-1 cursor-pointer">TERMINAL</div>
      <div class="text-gray-600 hover:text-gray-800 h-full flex items-center px-1 cursor-pointer transition">OUTPUT</div>
      <div class="text-gray-600 hover:text-gray-800 h-full flex items-center px-1 cursor-pointer transition">DEBUG CONSOLE</div>
    </div>
    
    <div class="flex-1 p-3 font-mono text-xs text-green-700 overflow-y-auto">
      <div class="flex gap-2">
        <span class="text-blue-600 font-bold">➜</span>
        <span class="text-gray-600">graphix-ide</span>
        <span class="text-gray-800">npm run dev</span>
      </div>
      <div class="mt-1 text-gray-600">> VITE v5.0.0  ready in 245 ms</div>
      <div class="text-gray-600">  ➜  Local:   <span class="text-blue-600 underline cursor-pointer">http://localhost:5173/</span></div>
    </div>
  </div>
</template>