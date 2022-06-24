<script>
  import { onMount } from "svelte";

  export let standalone = false;
  let plotDiv;
  const MIN_YEAR = 1950;

  function filterDataForDate(allData, col_idx, date) {
    return allData
      .filter((stationRow) => stationRow[col_idx].startsWith(date))
      .map((stationRow) => {
        return [
          stationRow[0], // id
          stationRow[1], // name
          stationRow[4], // lat
          stationRow[5], // lon
          stationRow[col_idx], // date
          stationRow[col_idx - 13], // temperature
        ];
      });
  }

  onMount(() => {
    fetch(
      "https://gist.githubusercontent.com/cedricr/6f542971c85ade6a61bb3c3cddee5c97/raw/4e3f7a0dba64ddb1427317335067b8ea42f5bc6d/data.csv"
    )
      .then((response) => response.text())
      .then((rawData) => {
        let parsedData = rawData
          .split(/\r?\n|\r/)
          .map((line) => line.split(","));

        // headers
        // console.log(parsedData[0]);

        const stationsData = parsedData.slice(1);
        const indexes = [];
        const numRecordsHot = [];
        const numRecordsCold = [];
        const customdataHot = [];
        const customdataCold = [];

        for (let year = MIN_YEAR; year <= 2022; year++) {
          const numStationsForYear = stationsData.filter(
            (station) => station[6] <= year && year <= station[7]
          ).length;
          for (let month = 1; month <= 12; month++) {
            if (year === 2022 && month >= 6) break;
            const date = `${year}-${month.toString().padStart(2, "0")}`;
            const hotDataForDate = filterDataForDate(
              stationsData,
              20 + month,
              date
            );
            const coldDataForDate = filterDataForDate(
              stationsData,
              46 + month,
              date
            );
            indexes.push(new Date(date));
            numRecordsHot.push(hotDataForDate.length / numStationsForYear);
            numRecordsCold.push(-coldDataForDate.length / numStationsForYear);
            customdataHot.push({
              date: date,
              numRecords: hotDataForDate.length,
              numStationsForYear,
              percent: Math.round(
                (hotDataForDate.length / numStationsForYear) * 100
              ),
            });
            customdataCold.push({
              date: date,
              numRecords: coldDataForDate.length,
              numStationsForYear,
              percent: Math.round(
                (coldDataForDate.length / numStationsForYear) * 100
              ),
            });
          }
        }
        const traces = [
          {
            type: "bar",
            hoverlabel: {
              bgcolor: "#FFF",
              bordercolor: "#cdcdcd",
              font: { color: "#FF3500", family: "Arial, sans-serif" },
            },
            marker: {
              color: "#FF3500",
              opacity: 0.5,
            },
            customdata: customdataHot,
            hovertemplate:
              "%{customdata.numRecords} record(s) de chaleur pour %{customdata.numStationsForYear} stations (%{customdata.percent} %)<br><extra></extra>",
            x: indexes,
            y: numRecordsHot,
          },

          {
            type: "bar",
            hoverlabel: {
              bgcolor: "#FFF",
              bordercolor: "#cdcdcd",
              font: { color: "#0078FF", family: "Arial, sans-serif" },
            },
            marker: {
              color: "#0078FF",
              opacity: 0.5,
            },
            customdata: customdataCold,
            hovertemplate:
              "%{customdata.numRecords} record(s) de fraîcheur pour %{customdata.numStationsForYear} stations (%{customdata.percent} %)<br><extra></extra>",
            x: indexes,
            y: numRecordsCold,
          },
        ];

        const layout = {
          height: 300,
          margin: {
            l: 40,
            r: 80,
            b: 40,
            t: 10,
            pad: 0,
          },

          showlegend: false,
          barmode: "relative",
          bargap: 0,
          bargroupgap: 0.0,

          xaxis: {
            range: { range: [indexes[0], indexes[indexes.length - 1]] },
            tickfont: {
              size: 14,
              color: "#71768D",
              family: "Arial, sans-serif",
            },
            tickangle: -50,
            nticks: 30,
            showgrid: true,
          },
          yaxis: {
            autorange: true,
            visible: false,
          },
          dragmode: false,
        };

        const config = {
          // responsive: true,
          displayModeBar: false,
          locale: "fr",
          scrollZoom: false,
          doubleClick: false,
          fillFrame: true,
        };
        Plotly.newPlot(plotDiv, { data: traces, layout, config });
      });
  });
</script>

{#if standalone}
  <h1 class="mb-1 text-[#010931]">Nombre de records de température mensuels</h1>
  <p class="text-sm italic text-[#71768D]">Données Météo-France</p>
{:else}
  <h2 class="mb-1 text-[#010931]">Records mensuels</h2>
{/if}
<div class="mt-4 flex h-1/2">
  <div bind:this={plotDiv} class="h-full" />
</div>
