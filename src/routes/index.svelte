<script>
	import Header from "../components/header.svelte";
	import Footer from "../components/footer.svelte";
	import Card from "../components/card_of_event.svelte";

	let cardInfo = {
		name: "О, да! Еда!",
		date: "20 июля - 2 августа",
		img: "img/test.png",
		price: "250p",
		category: "фестивали и праздники",
		place: "Иркутск, о. Конный"
	}
</script>

<style lang="scss">
	@import "./styles/global";

	.form-width{
		margin: 45px auto 15px;
	}
</style>

<svelte:head>
	<title>Каталог событий</title>
</svelte:head>

<Header />
<div class = "form-width">
	<div class = "cards-block">
		<Card {...cardInfo}/>
	</div>
</div>
<Footer />