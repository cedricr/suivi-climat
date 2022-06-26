<script>
  import { onMount } from "svelte";
  let plotDiv;
  const MIN_YEAR = 1950;
  const MAX_YEAR = 2022;

  const HOT_COLOR = "#FF9A7F";
  const COLD_COLOR = "#7FBCFE";
  const GRID_COLOR = "#EEEEEE";
  const TEXT_COLOR = "#71768D";
  const FONT_FAMILY = "Arial, sans-serif";

  function filterDataForDate(allData, col_idx, date) {
    return allData.filter((stationRow) => stationRow[col_idx].startsWith(date));
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
        const opacity = [];

        for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
          const numStationsForYear = stationsData.filter(
            (station) => station[6] <= year && year <= station[7]
          ).length;

          const date = year.toString();
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

          const hotValue =
            ((hotDataForDate.length / numStationsForYear) * 100) / 12;
          numRecordsHot.push(hotValue);
          const coldValue =
            ((coldDataForDate.length / numStationsForYear) * 100) / 12;
          numRecordsCold.push(-coldValue);

          opacity.push(year === 2022 ? 0.5 : 1);

          customdataHot.push({
            date: date,
            numRecords: hotDataForDate.length,
            numStationsForYear,
            percent: Math.round(hotValue * 10) / 10,
            notes: year === 2022 ? "données incomplètes pour l’année" : "",
          });
          customdataCold.push({
            date: date,
            numRecords: coldDataForDate.length,
            numStationsForYear,
            percent: Math.round(coldValue * 10) / 10,
            notes: year === 2022 ? "données incomplètes pour l’année" : "",
          });
        }

        const traces = [
          {
            name: "records de chaleur",
            type: "bar",
            hoverlabel: {
              bgcolor: "#FFF",
              bordercolor: GRID_COLOR,
              font: { color: HOT_COLOR, family: FONT_FAMILY },
            },
            marker: {
              color: HOT_COLOR,
              opacity: opacity,
            },
            customdata: customdataHot,
            hovertemplate:
              "<b>%{customdata.date}</b><br><b>%{customdata.notes}</b><br>%{customdata.numRecords} record(s) de chaleur mensuels<br>sur un total de %{customdata.numStationsForYear} stations (%{customdata.percent} %)<br><extra></extra>",
            x: indexes,
            y: numRecordsHot,
          },

          {
            name: "records de froid",
            type: "bar",
            hoverlabel: {
              bgcolor: "#FFF",
              bordercolor: GRID_COLOR,
              font: { color: COLD_COLOR, family: FONT_FAMILY },
            },
            marker: {
              color: COLD_COLOR,
              opacity: opacity,
            },
            customdata: customdataCold,
            hovertemplate:
              "<b>%{customdata.date}</b><br><b>%{customdata.notes}</b><br>%{customdata.numRecords} record(s) de fraîcheur mensuels<br>sur un total de %{customdata.numStationsForYear} stations (%{customdata.percent} %)<br><extra></extra>",
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

          showlegend: true,
          legend: {
            xanchor: "left",
            yanchor: "top",
            x: 0.0,
            y: 1,
            itemclick: false,
            itemdoubleclick: false,
            font: {
              size: 14,
              color: TEXT_COLOR,
              family: FONT_FAMILY,
            },
          },
          barmode: "relative",
          bargap: 0.1,
          bargroupgap: 0.0,
          xaxis: {
            range: [new Date(MIN_YEAR - 1, 1, 1), new Date(MAX_YEAR + 1, 1, 1)],
            tickfont: {
              size: 14,
              color: TEXT_COLOR,
              family: FONT_FAMILY,
            },
            tickangle: -50,
            nticks: 30,
            showgrid: true,
            hoverformat: "%Y",
          },
          yaxis: {
            zeroline: true,
            zerolinecolor: GRID_COLOR,
            zerolinewidth: 2,
            dtick: 3,
            showgrid: true,
            autorange: true,
            visible: true,
            showticklabels: false,
          },
          dragmode: false,
        };

        const config = {
          responsive: true,
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

<h1 class="mb-1 max-w-3xl text-gray-800">
  De quand datent les records de température actuels&nbsp;?
</h1>

<p class="mb-4 max-w-lg text-sm italic text-gray-500">
  Données <a
    href="https://donneespubliques.meteofrance.fr/?fond=produit&id_produit=117&id_rubrique=39"
    class="underline">Météo-France</a>
  juin 2022
</p>
<p class="text-m mb-6 max-w-xl leading-tight text-gray-500">
  Répartition des records <strong>actuels</strong> de température mensuels en France,
  normalisés par le nombre de stations disponibles l’année correspondante.
</p>

<div class="my-4 flex h-1/2">
  <div bind:this={plotDiv} class="h-full" />
</div>
<div class="mt-12 mr-12 flex flex-row items-center justify-end gap-2">
  <a href="https://twitter.com/cedricr" class="text-sm italic text-gray-500">
    @cedricr
  </a>
  <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">
    <img
      alt="Licence Creative Commons cc-by-sa 4.0"
      src="https://i.creativecommons.org/l/by-sa/4.0/80x15.png" />
  </a>
</div>
