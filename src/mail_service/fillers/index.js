const { ticket, ticketsTable, ticketsBlock, mailing } = require("./components");

module.exports = {
    payment,
    eventRegistration,
    registration,
    newPassword,
    removeFromOrganizers,
    successWithdraw,
    rejectedWithdraw,
    addToOrganizers,
    secondEvent
}

function payment(template, text, data) {

    // text = {
    //     header:             "Спасибо за ваш заказ",
    //     orderHeader:        "Ваш заказ",
    //     greeting:           "Здравствуйте, {userName}",
    //     message:            "Вы зарегистрировались на событие. Подтверждаем, что Ваша регистрация прошла успешно.",
    //     userData:           "Ваши данные",
    //     name:               "Имя Фамилия",
    //     phone:              "Телефон",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:    "Отказаться от подписки",
    //     ticketsHeader:      "Билеты",
    //     additionalsHeader:  "Дополнительно",
    //     eventInfo:          "Информация о событии",
    //     eName:              "Название",
    //     location:           "Место проведения",
    //     eDate:              "Дата и время",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     total:              "Итого",
    //     orderTitle:         "Номер заказа:"
    // }

    // data = {
    //     date:               "Понедельник, 20 июля 2020 г. , 8:00",
    //     name:               "Максим Жуков",
    //     userPhone:          "882281488",
    //     userEmail:          "test@mail.com",
    //     orderId:            "123456",
    //     buyable: [
    //         {
    //             type:       "ticket",
    //             price:       1000,
    //             count:       2,
    //             name:       "Детский"
    //         },
    //         {
    //             type:       "additional",
    //             price:       500,
    //             count:       1,
    //             name:       "Крутой"
    //         }
    //     ],
    //     userName:           "Анастасия Захарова",
    //     eventName:          "Веревочные соревнования среди взрослых и детей в Вуки-Парк",
    //     eventLocation:      ["г.Байкальск, горнолыжный курорт “Гора Соболинная”"],
    //     eventDate:          "с 1 октября - по 30 сентября",
    //     domain:             "https://baikal.events",
    //     _: {
    //         rub:            "руб.",
    //         pieces:         "шт."
    //     }
    // }

    data.eventLocation = data.eventLocation.join("<br>");

    return setData(setTicketsTable(template, text, data), { ...text, ...data });
}

function eventRegistration(template, text, data) {

    // text = {
    //     header:             "Спасибо за регистрацию!",
    //     greeting:           "Здравствуйте, {userName}",
    //     successRegister:    "Вы зарегистрировались на событие. Подтверждаем, что Ваша регистрация прошла успешно.",
    //     eventInfo:          "Информация о событии",
    //     name:               "Название",
    //     location:           "Место проведения",
    //     date:               "Дата и время",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:     "Отказаться от подписки"
    // }

    // data = {
    //     userName:           "Анастасия Захарова",
    //     eventName:          "Веревочные соревнования среди взрослых и детей в Вуки-Пар",
    //     eventLocation:      "г.Байкальск, горнолыжный курорт “Гора Соболинная”",
    //     eventDate:          "с 1 октября - по 30 сентября",
    //     domain:             "https://baikal.events"
    // }

    data.eventLocation = data.eventLocation.join("<br>");

    return setData(template, { ...text, ...data });
}

function registration(template, text, data) {

    // text = {
    //     header:             "Вы зарегистрированы!",
    //     greeting:           "Здравствуйте",
    //     successRegister:    "Благодарим вас за регистрацию на сайте. Очень рекомедуем сохранить это сообщение. Ваши данные для входа:",
    //     password:           "Пароль",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:     "Отказаться от подписки"
    // }

    // data = {
    //     userEmail:          "email",
    //     userPassword:       "password",
    //     domain:             "https://baikal.events"
    // }

    return setData(template, { ...text, ...data });
}

function newPassword(template, text, data) {

    // text = {
    //     header:             "Восстановление пароля",
    //     greeting:           "Здравствуйте, {userName}",
    //     newPassword:        "Для вашей учетной записи username был запрошен сброс проля. Ваш новый пароль:",
    //     password:           "Пароль",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:    "Отказаться от подписки",
    //     ignore:             "Если вы не запрашивали это сообщение, просто проигнорируйте его"
    // }

    // data = {
    //     userName:           "Анастасия Захарова",
    //     userPassword:       "userpassword",
    //     domain:             "https://baikal.events"
    // }

    return setData(template, { ...text, ...data });
}

function removeFromOrganizers(template, text, data) {

    // text = {
    //     header:             "Организация события",
    //     greeting:           "Здравствуйте, {userName}",
    //     message:            "<b>Вы больше <span class=\"main-block__message_danger\" style=\"color:#ED2D33;\" >не являетесь организатором</span></br> события\"{event}\"",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:    "Отказаться от подписки"
    // }

    // data = {
    //     userName:           "Анастасия Захарова",
    //     event:              "Веревочные соревнования среди взрослых и детей в Вуки-Парк",
    //     domain:             "https://baikal.events"
    // }

    return setData(template, { ...text, ...data });
}

function successWithdraw(template, text, data) {

    // text = {
    //     header:             "Снятие средств",
    //     greeting:           "Здравствуйте, {userName}",
    //     message:            "<b>Ваша заявка на вывод средств <span class=\"main-block__message_success\" style=\"color:#8CC261;\" >одобрена</span></b> на сумму" +
    //                         "<span class=\"main-block__price\" style=\"font-weight:600;color:#0A92DB;\" >{amount} руб.</span> Проверьте балланс вашего счета в банке",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:    "Отказаться от подписки"
    // }

    // data = {
    //     userName:           "Анастасия Захарова",
    //     amount:             9500,
    //     domain:             "https://baikal.events"
    // }

    return setData(template, { ...text, ...data });
}

function rejectedWithdraw(template, text, data) {

    // text = {
    //     header:             "Снятие средств",
    //     greeting:           "Здравствуйте, {userName}",
    //     message:            "<b>Ваша заявка на вывод средств</b> на сумму  <span class=\"main-block__price\" style=\"font-weight:600;color:#0A92DB;\" >{amount} руб.</span>" +
    //                         "<span class=\"main-block__message_danger\" style=\"color:#ED2D33;\" >отклонена</span> <b>по причине: </b>{rejectMessage}",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:    "Отказаться от подписки"
    // }
    // data = {
    //     userName:           "Анастасия Захарова",
    //     amount:             9500,
    //     rejectMessage:      "Потому что отказано и все",
    //     domain:             "https://baikal.events"
    // }

    return setData(template, { ...text, ...data });
}

function addToOrganizers(template, text, data) {

    // text = {
    //     header:             "Вы Организатор события!",
    //     greeting:           "Здравствуйте",
    //     message:            "<b>Ваша заявка <span class=\"main-block__message_success\" style=\"color:#8CC261;\" >" +
    //                         "одобрена</span></b>, Вы явлетесь организатором события.<br> Вот информация о нем:",
    //     eventInfo:          "Информация о событии",
    //     name:               "Название",
    //     location:           "Место проведения",
    //     date:               "Дата и время",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:     "Отказаться от подписки"
    // }

    // data = {
    //     eventName:          "Веревочные соревнования среди взрослых и детей в Вуки-Пар",
    //     eventLocation:      "г.Байкальск, горнолыжный курорт “Гора Соболинная”",
    //     eventDate:          "с 1 октября - по 30 сентября",
    //     domain:             "https://baikal.events"
    // }

    data.eventLocation = data.eventLocation.join("<br>");

    return setData(template, { ...text, ...data });
}

function secondEvent(template, text, data){
    text = {
        header:             "Спасибо за ваш заказ",
        orderHeader:        "Ваш заказ",
        greeting:           "Здравствуйте, {userName}",
        message:            "Вы зарегистрировались на событие. Подтверждаем, что Ваша регистрация прошла успешно.",
        userData:           "Ваши данные",
        name:               "Имя Фамилия",
        phone:              "Телефон",
        mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
        disabledMailing:    "Отказаться от подписки",
        ticketsHeader:      "Билеты",
        additionalsHeader:  "Дополнительно",
        eventInfo:          "Информация о событии",
        eName:              "Название",
        location:           "Место проведения",
        eDate:              "Дата и время",
        goToSite:           "Перейти на сайт",
        disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
        total:              "Итого",
        reminderMessage:    "<b>Если вы еще не оплатили Ваш заказ, сделайте это сейчас!</b> Вот ссылка для оплаты: <br>"
    }

    data = {
        date:               "Понедельник, 20 июля 2020 г. , 8:00",
        name:               "Максим Жуков",
        userPhone:          "882281488",
        userEmail:          "idinahuy@mail.com",
        buyable: [
            {
                type:       "ticket",
                price:       1000,
                count:       2,
                name:       "Детский"
            },
            {
                type:       "additional",
                price:       500,
                count:       1,
                name:       "Крутой"
            }
        ],
        userName:           "Анастасия Захарова",
        eventName:          "Веревочные соревнования среди взрослых и детей в Вуки-Парк",
        eventLocation:      ["г.Байкальск, горнолыжный курорт “Гора Соболинная”"],
        eventDate:          "с 1 октября - по 30 сентября",
        domain:             "https://baikal.events",
        reminderLink:       "sberbank.ru",
        _: {
            rub:            "руб.",
            pieces:         "шт."
        }
    }

    data.eventLocation = data.eventLocation.join("<br>");

    return setData(setTicketsTable(template, text, data), { ...text, ...data });
}

function setData(template, data) {

    data.domainWithoutHttp = data.domain.replace(/http.*:\/\//, "");

    template = template.replace("{mailing}", mailing);

    for (const [key, value] of Object.entries(data)) {
        const replace = new RegExp(`{${key}}`, "g");
        template = template.replace(replace, value);
    }

    return template;
}

function setTickets(tickets, ticket, data) {
    let ticketsС = "";

    for (let _ticket of tickets) {
        let ticketC = ticket;
        ticketC = ticketC.replace("{ticketName}", `${_ticket.name} - ${_ticket.count}${data._.pieces}`);
        ticketC = ticketC.replace("{ticketPrice}", `${_ticket.price * _ticket.count}${data._.rub}`);
        ticketsС += ticketC;
    }

    return ticketsС;
}

function setTicketsTable(template, text, data){
    let ticketsblockС = ticketsBlock;

    let tickets = [];
    let additionals = [];

    const total = data.buyable.reduce((sec, cur) => {

        const { count, price, type } = cur;

        if (type === "ticket") tickets.push(cur)
        else additionals.push(cur)

        return sec + count * price;
    }, 0);

    let ticketsTableС = "";
    let additionalsTableC = "";

    if (tickets.length) {
        ticketsTableС = ticketsTable;
        ticketsTableС = ticketsTableС.replace("{ticketsHeader}", text.ticketsHeader);
        ticketsTableС = ticketsTableС.replace("{tickets}", setTickets(tickets, ticket, data));
    }

    if (additionals.length) {
        additionalsTableC = ticketsTable;
        additionalsTableC = additionalsTableC.replace("{ticketsHeader}", text.additionalsHeader);
        additionalsTableC = additionalsTableC.replace("{tickets}", setTickets(additionals, ticket, data));
    }

    ticketsblockС = ticketsblockС.replace("{ticketsTable}", ticketsTableС);
    ticketsblockС = ticketsblockС.replace("{additionalsTable}", additionalsTableC);
    ticketsblockС = ticketsblockС.replace("{price}", `${total}${data._.rub}`);

    template = template.replace("{ticketsBlock}", ticketsblockС);

    return template;
}