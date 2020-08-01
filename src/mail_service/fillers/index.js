export {
    payment
}

// const text = {
//     header: "Спасибо за ваш заказ",
//     orderHeader: "Ваш заказ",
//     userData: "Ваши данные",
//     name: "Имя Фамилия",
//     phone: "Телефон",
//     mailingText: "Вы получаете новостную рассылку, потому что вы подписались на нашу рассылку через:",
//     disableMailing: "Отказаться от подписки",
//     ticketsHeader: "Билеты",
//     additionalsHeader: "Дополнительно"
// }

// const data = {
//     date: "Понедельник, 20 июля 2020 г. , 8:00",
//     name: "Максим Жуков",
//     phone: "882281488",
//     email: "idinahuy@mail.com",
//     buyable: [
//         {
//             type: "ticket",
//             price: 1000,
//             count: 2,
//             name: "Детский"
//         },
//         {
//             type: "additional",
//             price: 500,
//             count: 1,
//             name: "Крутой"
//         }
//     ],
//     _ :{
//         rub: "руб.",
//         pieces: "шт."
//     }
// }

function payment(template, text, data){
    import {ticket, ticketsTable, ticketsBlock} from "./components";

    template = template.replace("{header}", text.header);
    template = template.replace("{orderHeader}", text.orderHeader);
    template = template.replace("{date}", data.date);
    template = template.replace("{userData}", text.userData);
    template = template.replace("{name}", text.name);
    template = template.replace("{userName}", data.name);
    template = template.replace("{phone}", text.phone);
    template = template.replace("{userPhone}", data.phone);
    template = template.replace("{userEmail}", data.email);
    template = template.replace("{mailingText}", text.mailingText);
    template = template.replace("{disableMailing}", text.disableMailing);

    const ticketsblockС = "";

    if(data.buyable.length){
        ticketsBlockС = ticketsBlock;

        const tickets =     data.buyable.filter(el => el.type === "ticket");
        const additionals = data.buyable.filter(el => el.type === "additional");
        const total =       data.buyable.reduce((sec, cur) => sec + cur.count * cur.price, 0);

        const ticketsTableС = "";
        const additionalsTableC = "";

        if(tickets.length){
            ticketsTableС = ticketsTable;
            ticketsTable = ticketsTable.replace("{ticketsHeader}", text.ticketsHeader);
            ticketsTable = ticketsTable.replace("{tickets}", setTickets(tickets));
        }
        
        if(additionals.length){
            additionalsTableС = ticketsTable;
            additionalsTable = additionalsTable.replace("{ticketsHeader}", text.additionalsHeader);
            additionalsTable = additionalsTable.replace("{tickets}", setTickets(additionals));
        }

        ticketsblockС = ticketsBlockC.replace("{ticketsTable}", ticketsTableС);
        ticketsblockС = ticketsblockС.replace("{additionalsBlock}", additionalsTableC);
        ticketsblockС = ticketsBlockC.replace("{total}", data.total);
        ticketsblockС = ticketsBlockC.replace("{price}", `${total}${data._.rub}`);
    }

    template = template.replace("{ticketsBlock}", ticketsBlockC);

    return template;

    
    function setTickets(tickets){
        const ticketsС = "";

        for(let _ticket of tickets){
            const ticketC = ticket;
            ticketC = ticketC.replace("{ticketName}", `${ticket.name} - ${ticket.count}${data._.pieces}`);
            ticketC = tickerC.replace("{ticketPrice}", `${ticker.price}${data._.rub}`);
            ticketsС += ticketC;
        }

        return ticketsС;
    }
}