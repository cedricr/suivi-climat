<script>
  import { onMount } from "svelte";
  export let standalone = false;
  let plotDiv;
  const MIN_YEAR = 1950;
  const MAX_YEAR = 2022;

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
        console.log(parsedData[0]);

        const stationsData = parsedData.slice(1);
        const indexes = [];
        const numRecordsHot = [];
        const numRecordsCold = [];
        const customdataHot = [];
        const customdataCold = [];
        let totalHot = 0;
        let totalCold = 0;

        for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
          const numStationsForYear = stationsData.filter(
            (station) => station[6] <= year && year <= station[7]
          ).length;

          const date = `${year}`;
          let hotDataForDate = [];
          let coldDataForDate = [];
          for (let month_idx = 0; month_idx < 12; month_idx++) {
            hotDataForDate = hotDataForDate.concat(
              filterDataForDate(stationsData, 21 + month_idx, date)
            );
            coldDataForDate = coldDataForDate.concat(
              filterDataForDate(stationsData, 47 + month_idx, date)
            );
          }

          indexes.push(new Date(date.toString()));
          const hotValue = hotDataForDate.length / numStationsForYear;
          numRecordsHot.push(hotValue);
          totalHot += hotValue;
          const coldValue = coldDataForDate.length / numStationsForYear;
          numRecordsCold.push(-coldValue);
          totalCold -= coldValue;
          customdataHot.push({
            date: date,
            numRecords: hotDataForDate.length,
            numStationsForYear,
            percent: Math.round(
              ((hotDataForDate.length / numStationsForYear) * 100) / 12
            ),
          });
          customdataCold.push({
            date: date,
            numRecords: coldDataForDate.length,
            numStationsForYear,
            percent: Math.round(
              ((coldDataForDate.length / numStationsForYear) * 100) / 12
            ),
          });
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
          height: 400,
          margin: {
            l: 40,
            r: 80,
            b: 40,
            t: 10,
            pad: 0,
          },

          showlegend: false,
          barmode: "relative",
          bargap: 0.1,
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
            showgrid: true,
            autorange: true,
            visible: true,
            tickmode: "array",
            tickvals: [
              totalCold / (MAX_YEAR - MIN_YEAR + 1),
              totalHot / (MAX_YEAR - MIN_YEAR + 1),
            ],
            ticktext: ["moy.", "moy."],
            tickfont: {
              size: 10,
              color: "#71768D",
              family: "Arial, sans-serif",
            },
          },
          dragmode: false,
        };

        const config = {
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
  <h1 class="mb-1 text-[#010931]">Records de température en France</h1>
  <p class="text-sm italic text-[#71768D]">
    Données Météo-France juin 2022<br />
    Sommes des nombres mensuels de records, pondérées par le nombre de station.
  </p>
{:else}
  <h2 class="mb-1 text-[#010931]">Records annuels</h2>
{/if}
<div class="my-4 flex h-1/2">
  <div bind:this={plotDiv} class="h-full" />
</div>
<div class="mt-12 mr-8 flex flex-row items-center justify-end gap-2">
  <a href="https://twitter.com/cedricr" class="text-sm italic text-[#71768D]"
    >@cedricr</a>
  <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">
    <img
      alt="Licence Creative Commons cc-by-sa 4.0"
      src="https://i.creativecommons.org/l/by-sa/4.0/80x15.png" />
  </a>
</div>
