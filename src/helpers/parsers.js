export {
    parseDate,
    dateOptions,
    parseDateToDateAndDay,
    parsePrice
}

var dateOptions = {
    era: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timezone: 'UTC',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};

function parseDate(date) {
    return date.getFullYear() + "-" + dateFormat(parseInt(date.getMonth() + 1) + "") + "-" + dateFormat(date.getDate());
}

function dateFormat(date) {
    return date.length === 1 ? "0" + date : date;
}

function parseDateToDateAndDay(date) {
    date = new Date(date);
    date = date.toLocaleString("ru", dateOptions).split(", ")[1].split(" ");
    date = date[0] + " " + date[1];
    return date;
}

function parsePrice(price_min, price_max, _) {
    var second_price;
    if (price_min === 0 && price_max === 0) second_price = _("free");
    else if (price_min === 0 && price_max !== 0)
        second_price = _("free") + " - " + price_max;
    else second_price = price_min + " - " + price_max;
    return second_price;
}