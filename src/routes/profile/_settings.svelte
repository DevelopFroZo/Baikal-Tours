<script>
  import { validatePhone, validateMail } from "/helpers/validators";
  import { validateNewData } from "/helpers/edit.js";
  import Fetcher from "/helpers/fetcher.js";
  import { stores } from "@sapper/app";

  export let userInfo, name, surname, phone, email, subjectsInfo;

  let userName = [name, surname].filter(el => el !== null).join(" ");
  let newData = {},
    oldPassword = null,
    newPassword = null,
    confirmNewPassword = null;

  const fetcher = new Fetcher();
  const { session } = stores();

  $: console.log(newData);

  $: {
    let allName = userName
      .replace(/\s+/g, " ")
      .trim()
      .split(" ");

    name = allName[0] === "" ? null : allName[0];
    surname = allName[1] === undefined ? null : allName[1];
  }

  $: newData = validateNewData(name, userInfo.name, "name", newData);

  $: newData = validateNewData(surname, userInfo.surname, "surname", newData);

  $: {
    phone = phone === "" ? null : phone;
    newData = validateNewData(phone, userInfo.phone, "phone", newData);
  }

  $: {
    email = email === "" ? null : email;
    newData = validateNewData(email, userInfo.email, "email", newData);
  }

  $: {
    oldPassword = oldPassword === "" ? null : oldPassword;
    newData = validateNewData(oldPassword, null, "oldPassword", newData);
  }

  $: {
    newPassword = newPassword === "" ? null : newPassword;
    newData = validateNewData(newPassword, null, "newPassword", newData);
  }

  $: confirmNewPassword === "" ? null : confirmNewPassword;

  async function saveData() {
    if (Object.keys(newData).length !== 0) {
      let message = "";
      if (email !== null && !validateMail(email))
        message = "Некорректный формат почты";
      else if (message === "" && oldPassword !== null) {
        if (newPassword === null || confirmNewPassword === null)
          message =
            "Чтобы изменить пароль, введите текущий пароль, новый пароль и подтвердите новый пароль";
        else if (newPassword !== confirmNewPassword)
          message = "Новый пароль не совпадает с подтвержденным";
      }

      if (message !== "") alert(message);
      else {
        let result = await fetcher.put(`/api/users/${$session.userId}`, newData);

        let keys = Object.keys(newData);
        for (let key of keys) {
          if (key !== "oldPassword" && key !== "newPassword")
            userInfo[key] = newData[key];
        }
        newData = {};
        oldPassword = null;
        newPassword = null;
        confirmNewPassword = null;
      }
    }
  }
</script>

<style lang="scss">
  @import "./styles/profile.scss";

  .contacts-data {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 30px;

    & > div {
      & > h2 {
        margin-top: 0;
      }

      & > div {
        margin-top: 15px;

        & > label {
          font-weight: bold;
          font-size: $Medium_Font_Size;
          display: block;
        }

        & > input {
          margin-top: 7px;
          width: 210px;
          border: 1px solid $Gray;
          padding: 5px;
        }
      }
    }
  }

  .subjects-block {
    display: grid;
    grid-template-columns: repeat(2, 200px);
    grid-row-gap: 15px;
    margin-top: 10px;

    & > label {
      display: flex;
      align-items: center;

      & > input {
        margin: 0 5px;
      }
    }
    &:last-child {
      margin-left: 115px;
    }
  }

  .periodicity-block {
    margin-top: 10px;

    & > label {
      display: flex;
      align-items: center;

      &:not(:first-child) {
        margin-top: 16px;
      }

      & > input {
        margin: 0 5px;
      }
    }
  }

  .question-text {
    margin-top: 25px;
  }

  #save {
    padding: 15px 25px;
    margin: 50px auto 0;
    display: block;
    background: $Gray;
    border-radius: 6px;
    font-weight: bold;
  }
</style>

<div>
  <div class="contacts-data">
    <div>
      <h2>Контактные данные</h2>
      <div>
        <label for="name">Имя Фамилия</label>
        <input type="text" name="name" bind:value={userName} />
      </div>
      <div>
        <label for="phone">Телефон</label>
        <input
          type="text"
          name="phone"
          on:keydown={validatePhone}
          bind:value={phone} />
      </div>
      <div>
        <label for="email">E-mail</label>
        <input type="text" name="email" bind:value={email} />
      </div>
    </div>
    <div>
      <h2>Смена пароля</h2>
      <div>
        <label for="oldPassword">Текущий пароль</label>
        <input type="password" name="oldPassword" bind:value={oldPassword} />
      </div>
      <div>
        <label for="newPassword">Новый пароль</label>
        <input type="password" name="newPassword" bind:value={newPassword} />
      </div>
      <div>
        <label for="confirmNewPassword">Подтвердите новый пароль</label>
        <input
          type="password"
          name="confirmNewPassword"
          bind:value={confirmNewPassword} />
      </div>
    </div>
  </div>
  <h2>Дайджест событий</h2>
  <p class="digest-text">
    Дайджест событий – это email рассылка о ближайших событиях по выбранным
    тематикам
  </p>
  <p class="question-text">Выберите тематики, которые Вам интересны</p>
  <div class="subjects-block">
    {#each subjectsInfo as subject}
    <label for="sport">
      <input type="checkbox" name="sport" />
      {subject.name}
    </label>
    {/each}
  </div>
  <p class="question-text">
    С какой периодичностью Вы хотите получать дайджест событий?
  </p>
  <div class="periodicity-block">
    <label for="periodicity">
      <input type="radio" name="periodicity" />
      1 раз в месяц
    </label>
    <label for="periodicity">
      <input type="radio" name="periodicity" />
      1 раз в 2 месяца
    </label>
    <label for="periodicity">
      <input type="radio" name="periodicity" />
      1 раз в полгода
    </label>
    <label for="periodicity">
      <input type="radio" name="periodicity" />
      Не хочу получать дайджест
    </label>
  </div>
  <button id="save" on:click={saveData}>СОХРАНИТЬ</button>
</div>
