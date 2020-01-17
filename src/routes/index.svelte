<script>
  import Header from "../components/header.svelte";
  import Footer from "../components/footer.svelte";
  import Card from "../components/card_of_event.svelte";

  let cards = [
    {
      id: 1,
      name: "О, да! Еда!",
      date: "20 июля - 2 августа",
      img: "img/test.png",
      price: "250p",
      category: "фестивали и праздники",
      place: "Иркутск, о. Конный"
    },
    {
      id: 2,
      name: "О, да! Еда!",
      date: "20 июля - 2 августа",
      img: "img/test.png",
      price: "250p",
      category: "фестивали и праздники",
      place: "Иркутск, о. Конный"
    },
    {
      id: 3,
      name: "О, да! Еда!",
      date: "20 июля - 2 августа",
      img: "img/test.png",
      price: "250p",
      category: "фестивали и праздники",
      place: "Иркутск, о. Конный"
    },
    {
      id: 4,
      name: "О, да! Еда!",
      date: "20 июля - 2 августа",
      img: "img/test.png",
      price: "250p",
      category: "фестивали и праздники",
      place: "Иркутск, о. Конный"
    }
  ];
</script>

<style lang="scss">
  @import "./styles/global";

  .form-width {
    margin: 45px auto 15px;
    min-height: calc(100vh - 175px - 60px);
  }

  .cards-block {
    display: grid;
    grid-template-columns: repeat(3, auto);
    justify-content: space-between;
    grid-row-gap: 41px;
  }

  input {
    border: 1px solid #7b7b7b;
    background: white;
    font-style: italic;
    padding: 0 3px;
    font-size: 13px;
    height: 23px;

    &[type="date"] {
      padding: 0;
    }

    &.date {
      width: 70px;
      position: relative;
	}
	
	&[type="number"]{
		width: 70px;
	}
  }

  .date::-webkit-inner-spin-button,
  .date::-webkit-clear-button {
    display: none;
    -webkit-appearance: none;
  }

  .date::-webkit-calendar-picker-indicator {
    background-color: transparent;
    position: absolute;
    right: 3px;
    top: 50%;
    transform: translateY(-50%);
  }

  #date-end, #price-end {
    margin-left: -5px;
  }

  h1 {
    font-weight: normal;
    font-size: $MaxBig_Font_Size;
  }

  .filters {
    background: $Light_Gray;
    padding: 18px 20px;
	margin: 20px 0;
	display: flex;
	justify-content: space-between;
  }

  select{
	  background: white;
	  width: 140px;
	  font-style: italic;
  }
</style>

<svelte:head>
  <title>Каталог событий</title>
</svelte:head>

<Header />
<div class="form-width">
  <h1>Каталог событий</h1>
  <div class="filters">
    <div>
      <input
        placeholder="Дата с"
        class="date"
        type="text"
        on:focus={function(e) {
          e.target.type = 'date';
        }}
        on:blur={function(e) {
          e.target.type = 'text';
        }}
        id="date-start" />
      <input
        placeholder="Дата по"
        class="date"
        type="text"
        on:focus={function(e) {
          e.target.type = 'date';
        }}
        on:blur={function(e) {
          e.target.type = 'text';
        }}
        id="date-end" />
    </div>
	<div>
		<button class = "select">где</button>
		<div class = "option">
			
		</div>
	</div>
	<select id = "kompany">
		<option disabled selected>с кем</option>
		<option>Один</option>
		<option>С семьей</option>
		<option>С друзьями</option>
	</select>
	<select id = "theme">
		<option disabled selected>тематика</option>
		<option>Фестивали и праздники</option>
		<option>Форумы</option>
		<option>Путешествия</option>
	</select>
	<div>
		<input type="number" placeholder="цена от" id="price-start"/>
		<input type="number" placeholder="до" id = "price-end"/>
	</div>
  </div>
  <div class="cards-block">
    {#each cards as cardInfo (cardInfo.id)}
      <Card {...cardInfo} />
    {/each}
  </div>
</div>
<Footer />
