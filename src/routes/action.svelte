<script>
  import Header from "../components/header.svelte";
  import Footer from "../components/footer.svelte";
  import Fetcher from "./_helpers/fetcher.js";
  import { onMount } from "svelte";

  const fetcher = new Fetcher();
  let response;

  onMount(async () => {
    getActionInfo();
  });

  async function getActionInfo() {
    var actionId = window.location.toString().split("id=")[1];
    response = await fetcher.get("/api/actions/" + actionId);
    console.log(response);
  }
</script>

<style lang="scss">
  @import "./styles/global";

  .form-width {
    margin: 45px auto 15px;
    min-height: calc(100vh - 175px - 60px);
    font-size: $Medium_Font_Size;
  }

  h1 {
    font-weight: bold;
    font-size: $UltraBig_Font_Size;
  }

  .italic-bold {
    font-weight: bold;
    font-style: italic;
    font-size: $LowBig_Font_Size;
    margin-top: 32px;
  }

  .italic {
    margin-top: 20px;
    font-style: italic;
  }

  .info-block {
    display: flex;
    align-items: flex-start;
    margin-top: 57px;
  }

  .left-side {
    font-style: italic;
    flex: 0.33;
  }

  .right-side {
    flex: 0.9;
    white-space: pre-wrap;
    padding-left: 45px;
  }

  .line {
    display: flex;
    align-items: flex-start;

    & > span {
      white-space: pre-wrap;
    }

    & > div {
      margin-right: 15px;
      min-width: 20px;
    }

    &:not(:first-child) {
      margin-top: 17px;
    }
  }

  .register-form {
    margin: 68px auto 42px;
    width: 500px;
    padding: 54px 95px 30px;
    background: #f1f1f1;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
    border-radius: 20px;
    box-sizing: border-box;
  }

  label {
    font-weight: bold;
  }

  input {
    background: #ffffff99;
    border: 0.5px solid #00000033;
    box-sizing: border-box;
    box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
    width: 100%;
    margin-top: 6px;
    height: 20px;
  }

  .input-block:not(:first-child) {
    margin-top: 16px;
  }

  .register-button {
    display: block;
    margin: 29px auto 0;
    background: #85da5d;
    box-shadow: inset 0px 0px 7px rgba(0, 0, 0, 0.25);
    border-radius: 15px;
    padding: 15px 9px;
    color: white;
    font-size: $Big_Font_Size;
  }
</style>

<svelte:head>
  <title>событие</title>
</svelte:head>

<Header />
{#await response}
  Загрузка
{:then}
  <div class="form-width">
    <h1>О, да! Еда!</h1>
    <p class="italic-bold">
      24-25 августа остров Конный вновь станет гастрономическим центром
      Иркутска.
    </p>
    <p class="italic">
      В последний уикенд лета на «О, да! Еда!» будут будут представлены самые
      актуальные направления современной культуры: музыка, спорт, стрит-арт, а
      главное – гастрономия.
    </p>

    <div class="info-block">
      <div class="left-side">
        <div class="line">
          <div>
            <img src="img/date.png" alt="date" />
          </div>
          <span>20 июля - 2 августа</span>
        </div>
        <div class="line">
          <div>
            <img src="img/place.png" alt="date" />
          </div>
          <span>г. Иркутск, о. Конный</span>
        </div>
        <div class="line">
          <div>
            <img src="img/org.png" alt="date" />
          </div>
          <span>
            Организатор фестиваля в Иркутске: Елена Кухта odaedairk@ya.ru
          </span>
        </div>
        <div class="line">
          <div>
            <img src="img/price.png" alt="date" />
          </div>
          <span>Стоимость: бесплатно</span>
        </div>
        <div class="line">
          <div>
            <img src="img/pages.png" alt="date" />
          </div>
          <span>Официальный сайт Группа “ВКонтакте” Инстаграм Фейсбук</span>
        </div>
        <div class="line">
          <div>
            <img src="img/transfer.png" alt="date" />
          </div>
          <span>Трансфер: самостоятельно</span>
        </div>
        <div class="line">
          <div>
            <img src="img/birk.png" alt="date" />
          </div>
          <span>ГАСТРОНОМИЯ</span>
        </div>
      </div>
      <div class="right-side">
        В последний уикенд лета на «О, да! Еда!» будут будут представлены самые
        актуальные направления современной культуры: музыка, спорт, стрит-арт, а
        главное – гастрономия. Тема фестиваля в 2019 году – кругосветное
        путешествие. Ожидаемое количество гостей фестиваля в 2019 году более 40
        тыс. человек. Участники фестиваля в Иркутске представят оригинальные
        ресторанные концепции – национальные кухни, монопродукты, стритфуд,
        стартапы. «О, да! Еда!» 2019 в Иркутске – это гастрономическая панорама
        мира, пять мини-фестивалей от Азии до Америки, пять культур с раменными,
        гавайскими коктейлями, азиатским базаром, барбекю на заднем дворе,
        сиестой, шведской фикой и новой русской кухней. Это гастроперфомансы,
        pop-up пространства и летние активности, новые технологии и
        интерактивные площадки на каждом «континенте». Приглашаем к участию
        гастрономические проекты, шеф-поваров и стартапы. Фестиваль "О, да!
        Еда!" - это самый узнаваемый и ожидаемый гастрономический фестиваль в
        России.
      </div>
    </div>

    <div class="register-form">
      <div class="input-block">
        <label for="name">Имя и фамилия</label>
        <br />
        <input type="text" name="name" />
      </div>
      <div class="input-block">
        <label for="phone">Телефон</label>
        <br />
        <input type="text" name="phone" />
      </div>
      <div class="input-block">
        <label for="email">Email</label>
        <br />
        <input type="text" name="email" />
      </div>
      <button class="register-button">Зарегистрироваться</button>
    </div>
  </div>
{/await}
<Footer />
