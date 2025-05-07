<!-- <script>
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    const location = get(page).url;
  </script>
  
  <nav style="margin-bottom: 1rem;">
    <a href="/population" target="_blank" style="margin-right: 1rem; font-weight: {location.pathname === '/population' ? 'bold' : 'normal'};">人口一覧</a>
    <a href="/prefecture" target="_blank" style="margin-right: 1rem; font-weight: {location.pathname === '/prefecture' ? 'bold' : 'normal'};">都道府県別人口</a>
    <a href="/prefecture_chart" target="_blank" style="font-weight: {location.pathname === '/prefecture_chart' ? 'bold' : 'normal'};">人口推移グラフ</a>
  </nav>
  
  <h2>ホームページ</h2>
  <p>上のリンクから各人口データページを別タブで開けます。</p>
   -->
<script>
  import { page } from "$app/stores";
  import { get } from "svelte/store";

  const location = get(page).url;

  let iframeSrc = "";
</script>

<p>下のリンクから各人口データページを別タブで開けます。</p>

<nav style="margin-bottom: 1rem;">
  <a href="/population" target="_blank" style="margin-right: 1rem; font-weight: {location.pathname === '/population' ? 'bold' : 'normal'};">人口一覧</a>
  <a href="/prefecture" target="_blank" style="margin-right: 1rem; font-weight: {location.pathname === '/prefecture' ? 'bold' : 'normal'};">都道府県別人口</a>
  <a href="/prefecture_chart" target="_blank" style="font-weight: {location.pathname === '/prefecture_chart' ? 'bold' : 'normal'};">人口推移グラフ</a>
</nav>

<hr/>

<p>下のリンクをクリックすると、下の iframe に表示されます。</p>

<nav style="margin-bottom: 1rem;">
  <a
    href="#"
    on:click={(e) => {
      e.preventDefault();
      iframeSrc = "/population";
    }}
    style="margin-right: 1rem; font-weight: {location.pathname === '/population'
      ? 'bold'
      : 'normal'};"
  >
    人口一覧
  </a>
  <a
    href="#"
    on:click={(e) => {
      e.preventDefault();
      iframeSrc = "/prefecture";
    }}
    style="margin-right: 1rem; font-weight: {location.pathname === '/prefecture'
      ? 'bold'
      : 'normal'};"
  >
    都道府県別人口
  </a>
  <a
    href="#"
    on:click={(e) => {
      e.preventDefault();
      iframeSrc = "/prefecture_chart";
    }}
    style="font-weight: {location.pathname === '/prefecture_chart'
      ? 'bold'
      : 'normal'};"
  >
    人口推移グラフ
  </a>
</nav>

<iframe
  src={iframeSrc}
  style="width: 80%; height: 700px; border: 1px solid #ccc;"
></iframe>
