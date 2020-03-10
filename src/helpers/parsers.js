export {
    parseDate,
    parsePrice,
    parseDateForActiveFilter,
    parsePriceForActiveFilter,
    parseDateForCards
}

function parseDate(date) {
    return date.getFullYear() + "-" + dateFormat(parseInt(date.getMonth() + 1) + "") + "-" + dateFormat(date.getDate());
}

function dateFormat(date) {
    return date.length === 1 ? "0" + date : date;
}

function parsePrice(price_min, price_max, _) {
    var second_price;
    if (price_min === 0 && price_max === 0) second_price = _("free");
    else if (price_min === 0 && price_max !== 0)
        second_price = _("free") + " - " + price_max;
    else second_price = price_min + " - " + price_max;
    return second_price;
}

function parseDateForActiveFilter(filter) {
    let date;

    if (filter[0][0].active && filter[0][1].active)
        date = filter[0][0].value + " - " + filter[0][1].value;
    else if (filter[0][0].active) date = filter[0][0].value;
    else if (filter[0][1].active) date = filter[0][1].value;
    else date = "";

    return date;
}

function parsePriceForActiveFilter(filter, _) {
    let price;

    if (filter[4][0].active && filter[4][1].active)
        price =
            _("from") +
            " " +
            filter[4][0].value +
            "₽ " +
            _("to") +
            " " +
            filter[4][1].value +
            "₽";
    else if (filter[4][0].active)
        price = _("from") + " " + filter[4][0].value + "₽";
    else if (filter[4][1].active)
        price = _("to") + " " + filter[4][1].value + "₽";
    else price = "";

    return price;
}

function parseDateForCards(date_starts, date_ends, _) {
    let dates = [];

    for (let i = 0; i < date_starts.length; i++) {
        if (date_starts[i] !== date_ends[i]) {
            if (date_starts[i] === null) {
                let end = parseDate(new Date(date_ends[i]));
                dates.push(_("date_to_string.end") + " " + end);
            } else if (date_ends[i] === null) {
                let start = parseDate(new Date(date_starts[i]));
                dates.push(_("date_to_string.start") + " " + start);
            } else {
                let start = parseDate(new Date(date_starts[i]));
                let end = parseDate(new Date(date_ends[i]));
                dates.push(_("date_to_string.start") + " " + start + " " + _("date_to_string.end") + " " + end);
            }
        }
        else {
            dates.push(parseDate(new Date(date_starts[i])))
        }
    }

    return dates;
}