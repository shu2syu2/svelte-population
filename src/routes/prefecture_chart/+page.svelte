<script>
  import { page } from "$app/stores";
  import { get } from "svelte/store";
  const location = get(page).url;
  import { onMount, tick } from "svelte";
  import { Chart, registerables } from "chart.js";
  import annotationPlugin from "chartjs-plugin-annotation";
  Chart.register(...registerables, annotationPlugin);
  export let data;

  let chartCanvas;
  let chart;

  let selectedPrefId =
    data.prefId !== null && data.prefId !== undefined
      ? String(data.prefId)
      : "";

  let startYear = data.minYear;
  let endYear = data.maxYear;

  let showTotal = true;
  let showMale = true;
  let showFemale = true;
  let chartType = "bar"; // 追加: 棒グラフ or 折れ線グラフ
  let errorMessage = "";

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.has("showTotal")) showTotal = params.get("showTotal") === "1";
    if (params.has("showMale")) showMale = params.get("showMale") === "1";
    if (params.has("showFemale")) showFemale = params.get("showFemale") === "1";
    if (params.has("chartType")) chartType = params.get("chartType");
  }

  onMount(async () => {
    await tick();

    if (!chartCanvas || !data.population.length) return;

    const labels = data.population.map((p) => p.year);

    function calculateDifferences(values) {
      const diffs = [null];
      for (let i = 1; i < values.length; i++) {
        diffs.push(values[i] - values[i - 1]);
      }
      return diffs;
    }

    const datasets = [];

    if (showTotal) {
      const total = data.population.map((p) => p.population);
      datasets.push({
        type: chartType,
        label: "総人口（千人）",
        data: total,
        backgroundColor: 'rgba(102, 102, 102, 0.6)',
        borderColor: '#333333',
        fill: false,
        yAxisID: "y",
      });
      datasets.push({
        label: "総人口の差分（千人）",
        data: calculateDifferences(total),
        borderColor: "#999",
        borderDash: [5, 5],
        fill: false,
        yAxisID: "yDiff",
      });
    }

    if (showMale) {
      const male = data.population.map((p) => p.population_man);
      datasets.push({
        type: chartType,
        label: "男性（千人）",
        data: male,
        backgroundColor: 'rgba(74, 144, 226, 0.5)',
        borderColor: "#4A90E2",
        fill: false,
        yAxisID: "y",
      });
      datasets.push({
        label: "男性の差分（千人）",
        data: calculateDifferences(male),
        borderColor: "#4A90E2",
        borderDash: [4, 2],
        fill: false,
        yAxisID: "yDiff",
      });
    }

    if (showFemale) {
      const female = data.population.map((p) => p.population_woman);
      datasets.push({
        type: chartType,
        label: "女性（千人）",
        data: female,
        backgroundColor: 'rgba(233, 78, 119, 0.5)',
        borderColor: "#E94E77",
        fill: false,
        yAxisID: "y",
      });
      datasets.push({
        label: "女性の差分（千人）",
        data: calculateDifferences(female),
        borderColor: "#E94E77",
        borderDash: [4, 2],
        fill: false,
        yAxisID: "yDiff",
      });
    }

    if (chart) chart.destroy();

    chart = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${data.prefectures.find((p) => String(p.id) === selectedPrefId)?.name}の年別人口推移（千人）`,
          },
          legend: {
            position: "bottom",
          },
          annotation: {
            annotations: {
              zeroLine: {
                type: "line",
                yMin: 0,
                yMax: 0,
                borderColor: "gray",
                borderWidth: 1,
                borderDash: [3, 3],
                label: {
                  enabled: true,
                  content: "差分 0",
                  position: "end",
                  backgroundColor: "rgba(0,0,0,0.1)",
                  color: "black",
                },
                yScaleID: "yDiff",
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "年[10月1日基準]",
              font: { size: 14 },
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "人口 [千人]",
              font: { size: 14 },
            },
            ticks: {
              callback: (v) => Number(v).toLocaleString(),
            },
          },
          yDiff: {
            position: "right",
            beginAtZero: false,
            grid: { drawOnChartArea: false },
            title: {
              display: true,
              text: "前年比差分 [千人]",
              font: { size: 14 },
            },
            ticks: {
              callback: (v) => Number(v).toLocaleString(),
            },
          },
        },
      },
    });
  });

  function submitForm(event) {
    event.preventDefault();

    errorMessage = "";

    const prefIdNum = Number(selectedPrefId);
    const startNum = Number(startYear);
    const endNum = Number(endYear);

    if (selectedPrefId === "" || selectedPrefId === null || isNaN(prefIdNum)) {
      errorMessage = "都道府県を選択してください。";
      clearChart();
      return;
    }

    if (
      startYear === "" ||
      endYear === "" ||
      startYear === null ||
      endYear === null ||
      isNaN(startNum) ||
      isNaN(endNum)
    ) {
      errorMessage = "年の範囲を指定してください。";
      clearChart();
      return;
    }

    if (startNum > endNum) {
      errorMessage = "開始年は終了年以下にしてください。";
      clearChart();
      return;
    }

    if (!showTotal && !showMale && !showFemale) {
      errorMessage = "表示対象を1つ以上選択してください。";
      clearChart();
      return;
    }

    const query = new URLSearchParams({
      prefId: prefIdNum,
      start: startNum,
      end: endNum,
      showTotal: showTotal ? "1" : "",
      showMale: showMale ? "1" : "",
      showFemale: showFemale ? "1" : "",
      chartType,
    });

    window.location.href = `/prefecture_chart?${query.toString()}`;
  }

  function clearChart() {
    if (chart) {
      chart.destroy();
      chart = null;
    }
    data.population = [];
  }
</script>

<h2>人口推移グラフ</h2>

<div class="form-section">
  <h3>検索条件</h3>
  <form method="GET" on:submit={submitForm}>
    <label>
      都道府県：
      <select name="prefId" bind:value={selectedPrefId}>
        <option value="">選択してください</option>
        {#each data.prefectures as pref}
          <option value={String(pref.id)}>{pref.name}</option>
        {/each}
      </select>
    </label>
    <label>
      年範囲：
      <input type="number" min={data.minYear} max={data.maxYear} bind:value={startYear} />
      年～
      <input type="number" min={data.minYear} max={data.maxYear} bind:value={endYear} />
      年
    </label>
    <fieldset class="checkbox-group">
      <legend>表示対象</legend>
      <label><input type="checkbox" bind:checked={showTotal} /> 総人口</label>
      <label><input type="checkbox" bind:checked={showMale} /> 男性</label>
      <label><input type="checkbox" bind:checked={showFemale} /> 女性</label>
    </fieldset>

    <fieldset class="radio-group">
      <legend>表示方法</legend>
      <label><input type="radio" bind:group={chartType} value="bar" /> 棒グラフ</label>
      <label><input type="radio" bind:group={chartType} value="line" /> 折れ線グラフ</label>
    </fieldset>

    <label><button type="submit">表示</button></label>
    {#if errorMessage}
      <p class="error-message">{errorMessage}</p>
    {/if}
  </form>
</div>

{#if data.population.length > 0}
  <p>
    対象：{data.prefectures.find((p) => String(p.id) === selectedPrefId)?.name ?? "未選択"}（{startYear}年～{endYear}年）
  </p>
  <div class="chart-wrapper">
    <canvas bind:this={chartCanvas} width="400" height="200"></canvas>
  </div>
{/if}

<style>
  .form-section {
    margin-top: 2rem;
  }
  form label {
    display: block;
    margin: 0.5rem 0;
  }
  label {
    display: block;
    margin: 0.5rem 0;
  }
  select,
  input[type="number"] {
    margin-left: 0.5rem;
    padding: 0.2rem 0.4rem;
  }
  canvas {
    margin-top: 2rem;
    border: 1px solid #ccc;
  }
  .chart-wrapper {
    max-width: 100%;
    overflow-x: auto;
  }
  .checkbox-group,
  .radio-group {
    display: inline-block;
    border: 1px solid #ccc;
    padding: 0.5rem 1rem;
    margin-top: 1rem;
    margin-right: 1rem;
    border-radius: 6px;
  }
  .checkbox-group legend,
  .radio-group legend {
    font-weight: bold;
    padding: 0 0.5rem;
  }
  .checkbox-group label,
  .radio-group label {
    display: inline-block;
    margin-right: 1rem;
  }
  .error-message {
    color: red;
    font-weight: bold;
    margin-top: 0.5rem;
  }
</style>
