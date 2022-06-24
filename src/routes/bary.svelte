<script>
  import TempRecordsY from "$lib/temp-records-bar-yearly.svelte";
  import TempRecordsM from "$lib/temp-records-bar.svelte";
</script>

<div class="m-8">
  <h1 class="mb-1 text-[#010931]">Nombre de records de température</h1>
  <p class="text-sm italic text-[#71768D]">Données Météo-France</p>
  <div class="mt-8 flex flex-col gap-8">
    <TempRecordsY />
    <TempRecordsM />
  </div>
</div>
