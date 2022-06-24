<script>
  import { onMount } from "svelte";

  let map;
  let frames = [];
  const MIN_LAT = 41;
  const MAX_LAT = 52;
  const MIN_LON = -6;
  const MAX_LON = 10;
  const MIN_YEAR = 1987;
  const DURATION = 100;

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
          stationRow[col_idx - 13], // temp
        ];
      });
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
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
        const sliderSteps = [];
        const numRecordsHot = [];
        const numRecordsCold = [];
        const indexes = [];

        for (let year = MIN_YEAR; year <= 2022; year++) {
          for (let month = 1; month <= 12; month++) {
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
            indexes.push(date);
            numRecordsHot.push(hotDataForDate.length);
            numRecordsCold.push(-coldDataForDate.length);

            frames.push({
              name: date,
              data: [
                // Records de chaleur
                {
                  traces: [0],
                  customdata: hotDataForDate,
                  hovertemplate:
                    "Station %{customdata[0]} :<br><b>%{customdata[1]}</b><br>%{customdata[5]}°C le<br>%{customdata[4]}<extra></extra>",
                  lat: hotDataForDate.map((row) => row[2]),
                  lon: hotDataForDate.map((row) => row[3]),
                },
                {
                  traces: [1],
                  hovertemplate: "%{y} record(s) de chaleur<extra></extra>",
                  x: clone(indexes),
                  y: clone(numRecordsHot),
                },
                // Records de froid
                {
                  traces: [2],
                  customdata: coldDataForDate,
                  hovertemplate:
                    "Station %{customdata[0]} :<br><b>%{customdata[1]}</b><br>%{customdata[5]}°C le<br>%{customdata[4]}<extra></extra>",
                  lat: coldDataForDate.map((row) => row[2]),
                  lon: coldDataForDate.map((row) => row[3]),
                },
                {
                  traces: [3],
                  hovertemplate: "%{y} record(s) de fraîcheur<extra></extra>",
                  x: clone(indexes),
                  y: clone(numRecordsCold),
                },
              ],
            });
            sliderSteps.push({
              method: "animate",
              label: date.replace("-", "/"),
              args: [
                [date],
                {
                  mode: "immediate",
                  transition: { duration: DURATION },
                  frame: { duration: DURATION, redraw: true },
                },
              ],
            });
          }
        }

        const traces = [
          {
            type: "scattergeo",
            mode: "markers",
            name: "Record de chaleur",
            hoverlabel: {
              bgcolor: "#FFF",
              bordercolor: "#cdcdcd",
              font: { color: "#ff7f00", family: "Arial, sans-serif" },
            },
            marker: {
              size: 10,
              color: "#ff7f00",
              opacity: 0.5,
            },
          },
          {
            type: "bar",
            name: "num record de chaleur",
            hoverlabel: {
              bgcolor: "#FFF",
              bordercolor: "#cdcdcd",
              font: { color: "#ff7f00", family: "Arial, sans-serif" },
            },
            marker: {
              color: "#ff7f00",
              opacity: 0.5,
            },
          },
          {
            type: "scattergeo",
            mode: "markers",
            name: "Record de froid",
            hoverlabel: {
              bgcolor: "#FFF",
              bordercolor: "#cdcdcd",
              font: { color: "#0078FF", family: "Arial, sans-serif" },
            },
            marker: {
              size: 10,
              color: "#0078FF",
              opacity: 0.5,
            },
          },
          {
            type: "bar",
            name: "num record de froid",
            hoverlabel: {
              bgcolor: "#FFF",
              bordercolor: "#cdcdcd",
              font: { color: "#0078FF", family: "Arial, sans-serif" },
            },
            marker: {
              color: "#0078FF",
              opacity: 0.5,
            },
          },
        ];
        const layout = {
          width: 600,
          height: 800,
          margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0,
            pad: 0,
          },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",

          font: {
            family: "Arial, sans-serif",
            size: 26,
          },
          showlegend: false,
          geo: {
            domain: {
              y: [0.2, 1],
            },
            fitbounds: false,
            scope: "europe",
            resolution: 50,
            lonaxis: {
              range: [MIN_LON, MAX_LON],
            },
            lataxis: {
              range: [MIN_LAT, MAX_LAT],
            },
            showland: true,
            showocean: true,
            showsubunits: true,
            showframe: true,
            framewidth: 20,
            framecolor: "green",
            landcolor: "#f4f4f1",
            oceancolor: "#dadada",
            countrycolor: "#b3b3b3",
            countrywidth: 1,
            projection: {
              // Lambert93
              // https://fr.wikipedia.org/wiki/Projection_conique_conforme_de_Lambert#Lambert_93
              type: "conic conformal",
              parallels: [44, 49],
              rotation: { lon: 3 },
            },
          },
          xaxis: {
            domain: [0, 1],
            fixedrange: true,
            type: "date",
            range: [indexes[0], indexes[indexes.length - 1]],
            tickfont: { size: 10, color: "#666", family: "Arial, sans-serif" },
          },
          yaxis: {
            domain: [0, 0.2],
            fixedrange: true,
            range: [Math.min(...numRecordsCold), Math.max(...numRecordsHot)],
            visible: false,
          },
          dragmode: false,
          sliders: [
            {
              pad: { b: 20, t: 30 },
              currentvalue: {
                visible: true,
                prefix: "",
                xanchor: "center",
                font: { size: 20, color: "#666", family: "Arial, sans-serif" },
                offset: 20,
              },
              font: {
                size: 10,
                color: "transparent",
                family: "Arial, sans-serif",
              },
              tickcolor: "transparent",
              steps: sliderSteps,
              yanchor: "top",
            },
          ],
          updatemenus: [
            {
              x: 0,
              y: 0,
              yanchor: "top",
              xanchor: "left",
              showactive: false,
              direction: "left",
              type: "buttons",
              pad: { t: 25 },
              font: { size: 10, color: "#666", family: "Arial, sans-serif" },
              buttons: [
                {
                  method: "animate",
                  args: [
                    null,
                    {
                      mode: "immediate",
                      fromcurrent: true,
                      transition: { duration: 300 },
                      frame: { duration: 500, redraw: true },
                    },
                  ],
                  label: "Démarrer",
                },
                {
                  method: "animate",
                  args: [
                    [null],
                    {
                      mode: "immediate",
                      transition: { duration: 0 },
                      frame: { duration: 0, redraw: true },
                    },
                  ],
                  label: "Pause",
                },
              ],
            },
          ],
        };

        const config = {
          responsive: true,
          displayModeBar: false,
          locale: "fr",
          scrollZoom: false,
          doubleClick: false,
          fillFrame: true,
        };
        Plotly.newPlot(map, { data: traces, layout, frames, config });
      });
  });

  // function handleStartAnimation() {
  //   Plotly.animate(map, null, {
  //     mode: "immediate",
  //     fromcurrent: true,
  //     transition: { duration: DURATION },
  //     frame: { duration: DURATION, redraw: true },
  //   });
  // }
  // function handleStopAnimation() {
  //   Plotly.animate(map, [], {
  //     mode: "immediate",
  //     transition: { duration: 0 },
  //     frame: { duration: 0, redraw: true },
  //   });
  // }
</script>

<h1 class="mb-1">Records de température mensuels</h1>
<p class="text-sm italic text-gray-500">Données Météo-France</p>

<div class="mt-4 flex h-3/4">
  <div bind:this={map} class="h-full" />
</div>
