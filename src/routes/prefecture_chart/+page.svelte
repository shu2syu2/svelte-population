<script>
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    const location = get(page).url;
    import { onMount, tick } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    Chart.register(...registerables);
  
    export let data;
  
    let chartCanvas;
    let chart;
  
    let selectedPrefId = data.prefId !== null && data.prefId !== undefined ? String(data.prefId) : '';

    let startYear = data.minYear;
    let endYear = data.maxYear;
  
    let showTotal = true;
    let showMale = true;
    let showFemale = true;
    let errorMessage = '';

  
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('showTotal')) showTotal = params.get('showTotal') === '1';
      if (params.has('showMale')) showMale = params.get('showMale') === '1';
      if (params.has('showFemale')) showFemale = params.get('showFemale') === '1';
    }
  
    onMount(async () => {
      await tick();
  
      if (!chartCanvas || !data.population.length) return;
  
      const labels = data.population.map(p => p.year);
      const datasets = [];
  
      if (showTotal) {
        datasets.push({
          label: '総人口',
          data: data.population.map(p => p.population),
          borderColor: '#333',
          fill: false
        });
      }
      if (showMale) {
        datasets.push({
          label: '男性',
          data: data.population.map(p => p.population_man),
          borderColor: '#4A90E2',
          fill: false
        });
      }
      if (showFemale) {
        datasets.push({
          label: '女性',
          data: data.population.map(p => p.population_woman),
          borderColor: '#E94E77',
          fill: false
        });
      }
  
      if (chart) chart.destroy();
  
      chart = new Chart(chartCanvas, {
        type: 'line',
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `${data.prefectures.find(p => p.id == selectedPrefId)?.name}の年別人口推移`
            },
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (v) => Number(v).toLocaleString()
              }
            }
          }
        }
      });
    });
  
    function submitForm(event) {
      event.preventDefault();

      errorMessage = ''; // 初期化

      const prefIdNum = Number(selectedPrefId);
      const startNum = Number(startYear);
      const endNum = Number(endYear);

      if (selectedPrefId === '' || selectedPrefId === null || isNaN(prefIdNum)) {
        errorMessage = "都道府県を選択してください。";
        clearChart();
        return;
      }

      if (
        startYear === '' || endYear === '' ||
        startYear === null || endYear === null ||
        isNaN(startNum) || isNaN(endNum)
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

      // クエリ作成して遷移
      const query = new URLSearchParams({
        prefId: prefIdNum,
        start: startNum,
        end: endNum,
        showTotal: showTotal ? '1' : '',
        showMale: showMale ? '1' : '',
        showFemale: showFemale ? '1' : ''
      });

      window.location.href = `/prefecture_chart?${query.toString()}`;
    }
    function clearChart() {
      if (chart) {
        chart.destroy();
        chart = null;
      }
      data.population = []; // 前回の結果を消す
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
      <label><input type="checkbox" bind:checked={showTotal}> 総人口</label>
      <label><input type="checkbox" bind:checked={showMale}> 男性</label>
      <label><input type="checkbox" bind:checked={showFemale}> 女性</label>
    </fieldset>
    <label><button type="submit">表示</button></label>
    {#if errorMessage}
      <p class="error-message">{errorMessage}</p>
    {/if}
  </form>
  </div>
  
  {#if data.population.length > 0}
    <p>対象：{data.prefectures.find(p => p.id == data.prefId)?.name}（{data.start}年～{data.end}年）</p>
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
  select, input[type="number"] {
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
  .checkbox-group {
    display: inline-block;
    border: 1px solid #ccc;
    padding: 0.5rem 1rem;
    margin-top: 1rem;
    border-radius: 6px;
  }

  .checkbox-group legend {
    font-weight: bold;
    padding: 0 0.5rem;
  }

  .checkbox-group label {
    display: inline-block;
    margin-right: 1rem;
  }
  .error-message {
    color: red;
    font-weight: bold;
    margin-top: 0.5rem;
  }
</style>
 