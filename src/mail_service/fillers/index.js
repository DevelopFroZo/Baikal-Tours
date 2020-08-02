export {
    payment,
    eventRegistration,
    registration,
    newPassword,
    organizerDisable
}

function payment(template, text, data){
    import {ticket, ticketsTable, ticketsBlock} from "./components";

    text = {
        header: "Спасибо за ваш заказ",
        orderHeader: "Ваш заказ",
        greeting: "Здравствуйте, {userName}",
        message: "Вы зарегистрировались на событие. Подтверждаем, что Ваша регистрация прошла успешно.",
        userData: "Ваши данные",
        name: "Имя Фамилия",
        phone: "Телефон",
        mailingText: "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
        disableMailing: "Отказаться от подписки",
        ticketsHeader: "Билеты",
        additionalsHeader: "Дополнительно",
        eventInfo: "Информация о событии",
        eName: "Название",
        location: "Место проведения",
        eDate: "Дата и время",
        goToSite: "Перейти на сайт",
        disableLink: "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    }

    data = {
        date: "Понедельник, 20 июля 2020 г. , 8:00",
        name: "Максим Жуков",
        phone: "882281488",
        email: "idinahuy@mail.com",
        buyable: [
            {
                type: "ticket",
                price: 1000,
                count: 2,
                name: "Детский"
            },
            {
                type: "additional",
                price: 500,
                count: 1,
                name: "Крутой"
            }
        ],
        userName: "Анастасия Захарова",
        eName: "Веревочные соревнования среди взрослых и детей в Вуки-Парк",
        location: "г.Байкальск, горнолыжный курорт “Гора Соболинная”",
        eDate: "с 1 октября - по 30 сентября",
        _ :{
            rub: "руб.",
            pieces: "шт."
        }
    }

    let ticketsblockС = "";

    if(data.buyable.length){
        ticketsBlockС = ticketsBlock;

        let tickets =       [];
        let additionals =  [];
        const total = data.buyable.reduce((sec, cur) => {

            const {count, price, type} = cur;

            if(type === "ticket")   tickets.push(cur)
            else                    additionals.push(cur)

            return sec + count * price;
        }, 0);

        let ticketsTableС = "";
        let additionalsTableC = "";

        if(tickets.length){
            ticketsTableС = ticketsTable;
            ticketsTable = ticketsTable.replace("{ticketsHeader}", text.ticketsHeader);
            ticketsTable = ticketsTable.replace("{tickets}", setTickets(tickets, ticket));
        }
        
        if(additionals.length){
            additionalsTableС = ticketsTable;
            additionalsTable = additionalsTable.replace("{ticketsHeader}", text.additionalsHeader);
            additionalsTable = additionalsTable.replace("{tickets}", setTickets(additionals, ticket));
        }

        ticketsblockС = ticketsBlockC.replace("{ticketsTable}", ticketsTableС);
        ticketsblockС = ticketsblockС.replace("{additionalsBlock}", additionalsTableC);
        ticketsblockС = ticketsBlockC.replace("{total}", data.total);
        ticketsblockС = ticketsBlockC.replace("{price}", `${total}${data._.rub}`);
    }

    template = template.replace("{ticketsBlock}", ticketsBlockC);

    for(const [key, value] of Object.entries({...text, ...data}))
        template = template.replace(`{${key}}`, value);

    return template;
}

function eventRegistration(template, text, data){

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
    //     siteLink:           "https://baikal.events"
    // }

    for(const [key, value] of Object.entries({...text, ...data}))
        template = template.replace(`{${key}}`, value);
    
    return template;
}

function registration(template, text, data){

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
    //     userPassword:       "password"
    //     siteLink:           "https://baikal.events"
    // }

    for(const [key, value] of Object.entries({...text, ...data}))
        template = template.replace(`{${key}}`, value);

    return template;
}

function newPassword(template, text, data){

    // text = {
    //     header:             "Восстановление пароля",
    //     greeting:           "Здравствуйте, {userName}",
    //     newPassword:        "Для вашей учетной записи username был запрошен сброс проля. Ваш новый пароль:",
    //     password:           "Пароль"
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:    "Отказаться от подписки"
    // }

    // data = {
    //     userName:           "Анастасия Захарова",
    //     userPassword:       "userpassword"
    //     siteLink:           "https://baikal.events"
    // }

    for(const [key, value] of Object.entries({...text, ...data}))
        template = template.replace(`{${key}}`, value);

    return template;
}

function organizerDisable(template, text, data){

    // text = {
    //     header:             "Организация события",
    //     greeting:           "Здравствуйте, {userName}",
    //     message:            "<b>Вы больше <span class="main-block__message_danger" style="color:#ED2D33;" >не являетесь организатором</span></b> события\"{event}\",
    //     goToSite:           "Перейти на сайт",
    //     disableLink:        "Если у вас не работает кнопка “Перейти на сайт”, скопируйте данную ссылку и откройте в браузере:",
    //     mailingText:        "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
    //     disabledMailing:    "Отказаться от подписки"
    // }

    // data = {
    //     userName:           "Анастасия Захарова",
    //     event:              "Веревочные соревнования среди взрослых и детей в Вуки-Парк"
    //     siteLink:           "https://baikal.events"
    // }

    for(const [key, value] of Object.entries({...text, ...data}))
        template = template.replace(`{${key}}`, value);

    return template;
}

function setTickets(tickets, ticket){
    const ticketsС = "";

    for(let _ticket of tickets){
        const ticketC = ticket;
        ticketC = ticketC.replace("{ticketName}", `${ticket.name} - ${ticket.count}${data._.pieces}`);
        ticketC = tickerC.replace("{ticketPrice}", `${ticker.price}${data._.rub}`);
        ticketsС += ticketC;
    }

    return ticketsС;
}