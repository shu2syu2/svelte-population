<script>
  export let data;

  let selectedPrefId = '';
  let startYear = data.minYear;
  let endYear = data.maxYear;
  let errorMessage = '';
  let sortKey = 'year';
  let sortAsc = true;
  let selectedPrefName = '';
  let showResult = false;


  $: filtered = [...data.populationByRange]
    .filter(row => selectedPrefId && startYear && endYear
      ? row.year >= Number(startYear) && row.year <= Number(endYear)
      : true)
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      return sortAsc ? valA - valB : valB - valA;
    });

  function toggleSort(key) {
    if (sortKey === key) {
      sortAsc = !sortAsc;
    } else {
      sortKey = key;
      sortAsc = true;
    }
  }

  function validateForm(event) {
    if (!selectedPrefId || !startYear || !endYear) {
      event.preventDefault();
      errorMessage = '都道府県と開始年・終了年をすべて入力してください。';
      selectedPrefName = '';
      showResult = false;
    } else {
      errorMessage = '';
      const selectedPref = data.prefectures.find(p => p.id == selectedPrefId);
      selectedPrefName = selectedPref ? selectedPref.name : '';
      showResult = true;
    }
  }

</script>

<h2>年範囲で都道府県人口を検索</h2>

<div class="form-section">
  <h3>検索条件</h3>
  <form method="GET" on:submit={validateForm}>
    <label>
      都道府県：
      <select name="prefId" bind:value={selectedPrefId}>
        <option value="">選択してください</option>
        {#each data.prefectures as pref}
          <option value={pref.id}>{pref.name}</option>
        {/each}
      </select>
    </label>
    <label>
      年範囲：
      <input type="number" min={data.minYear} max={data.maxYear} name="start" bind:value={startYear} />
      年～
      <input type="number" min={data.minYear} max={data.maxYear} name="end" bind:value={endYear} />
      年
    </label>
    <button type="submit">表示</button>
  </form>
  {#if errorMessage}
    <p class="error-message">{errorMessage}</p>
  {/if}
</div>


{#if showResult && selectedPrefId && filtered.length > 0}
  <div class="range-table">
    <h3>
      検索結果：
      {#if selectedPrefName}
        {selectedPrefName}（{startYear}年～{endYear}年）
      {/if}
    </h3>
   
    <div class="table-half">
      <table>
        <thead>
          <tr>
            <th style="width: 25%" on:click={() => toggleSort('year')}>年 {sortKey === 'year' ? (sortAsc ? '▲' : '▼') : ''}</th>
            <th style="width: 25%" on:click={() => toggleSort('population')}>総人口 {sortKey === 'population' ? (sortAsc ? '▲' : '▼') : ''}</th>
            <th style="width: 25%" on:click={() => toggleSort('population_man')}>男性 {sortKey === 'population_man' ? (sortAsc ? '▲' : '▼') : ''}</th>
            <th style="width: 25%" on:click={() => toggleSort('population_woman')}>女性 {sortKey === 'population_woman' ? (sortAsc ? '▲' : '▼') : ''}</th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as row}
            <tr>
              <td>{row.year}</td>
              <td>{Number(row.population).toLocaleString()}</td>
              <td>{Number(row.population_man).toLocaleString()}</td>
              <td>{Number(row.population_woman).toLocaleString()}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}

<style>
  .form-section, .range-table {
    margin-top: 2rem;
  }
  form label {
    display: block;
    margin: 0.5rem 0;
  }
  .error-message {
    color: red;
    margin-top: 0.5rem;
  }
  .table-half {
    width: 50%;
    float: left;
    box-sizing: border-box;
    padding-right: 1rem;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin-top: 1rem;
    font-size: 0.9rem;
    table-layout: fixed;
  }
  th {
    border: 1px solid #444;
    padding: 6px 8px;
    text-align: right;
    word-wrap: break-word;
    cursor: pointer;
  }
  td {
    border: 1px solid #444;
    padding: 6px 8px;
    text-align: right;
    word-wrap: break-word;
    cursor: default;
  }
  th:first-child, td:first-child {
  text-align: right;
  }
  thead {
    background-color: #f0f0f0;
  }
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
</style>
