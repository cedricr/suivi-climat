<script>
  import { onMount } from "svelte";
  let plotDiv;

  const BARS_COLOR = "#557EFF";
  const GRID_COLOR = "#EEEEEE";
  const TEXT_COLOR = "#71768D";
  const FONT_FAMILY = "Arial, sans-serif";

  onMount(() => {
    fetch(
      "https://gist.githubusercontent.com/cedricr/6f542971c85ade6a61bb3c3cddee5c97/raw/4e3f7a0dba64ddb1427317335067b8ea42f5bc6d/data.csv"
    )
      .then((response) => response.text())
      .then((rawData) => {
        let parsedData = rawData
          .split(/\r?\n|\r/)
          .map((line) => line.split(","))
          .map((cols) => [cols[0], cols[1], cols[6], cols[7]]);

        // headers
        // console.log(parsedData[0]);
        const stationsData = parsedData.slice(1);
        // console.log(stationsData);

        const years = [];
        const numStations = [];

        let min_year = Number.POSITIVE_INFINITY;
        let max_year = Number.NEGATIVE_INFINITY;

        stationsData.forEach((row) => {
          if (row[2] < min_year) min_year = row[2];
          if (row[3] > max_year) max_year = row[3];
        });

        console.log(min_year, max_year);

        for (let year = 1950; year <= max_year; year++) {
          years.push(year);
          numStations.push(
            stationsData.filter((row) => row[2] <= year && year <= row[3])
              .length
          );
        }
        console.log(years);
        console.log(numStations);

        const traces = [
          {
            type: "scatter",
            mode: "lines+markers",
            hoverlabel: {
              bgcolor: "#FFF",
              bordercolor: GRID_COLOR,
              font: { color: BARS_COLOR, family: FONT_FAMILY, size: 14 },
            },
            marker: {
              color: BARS_COLOR,
              opacity: 0.6,
              size: 6,
            },
            line: {
              color: BARS_COLOR,
              opacity: 1,
              width: 2,
            },
            x: years,
            y: numStations,
          },
        ];

        const layout = {
          height: 400,
          margin: {
            l: 40,
            r: 80,
            b: 60,
            t: 10,
            pad: 10,
          },
          showlegend: false,
          xaxis: {
            autorange: true,
            hoverformat: "%Y",
            showgrid: true,
            showticklabels: true,
            tickangle: -50,
            type: "date",
            visible: true,
            tickfont: {
              size: 12,
              color: TEXT_COLOR,
              family: FONT_FAMILY,
            },
          },
          yaxis: {
            range: [0, Math.max(...numStations)],
            dtick: 300,
            showgrid: true,
            showticklabels: true,
            visible: true,
            zeroline: true,
            zerolinecolor: GRID_COLOR,
            zerolinewidth: 4,
            tickfont: {
              size: 12,
              color: TEXT_COLOR,
              family: FONT_FAMILY,
            },
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
  Évolution du nombre de stations Météo-France en Open Data
</h1>

<p class="mb-4 max-w-lg text-sm italic text-gray-500">
  Données Météo-France juin 2022
</p>
<p class="text-m mb-6 max-w-xl leading-tight text-gray-500">
  Pour chaque <a
    href="https://donneespubliques.meteofrance.fr/?fond=produit&id_produit=117&id_rubrique=39"
    class="underline">fiche climatologique</a>
  Météo-France, on extrait l’année de début et l’année de fin d’activité à partir
  de l’intervalle indiqué pour la prise en compte des records, puis on compte le
  nombre de stations disponibles pour une année donnée.
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
