export {
    ticket,
    ticketsTable,
    ticketsBlock
}

const ticket =          "<tr class=\"tickets__ticket\">" +
                            "<td class=\"tickets__left\" style=\"text-align:left;padding-top:10px;\">" +
                                "<span class=\"tickets__name\"" +
                                    "style=\"color:#4F4F4F;font-size:18px;\">" +
                                    "{ticketName}" +
                                "</span>" +
                            "</td>" +
                            "<td class=\"tickets__right\" style=\"text-align:right;padding-top:10px;\">" +
                                "<span class=\"tickets__price\"" +
                                    "style=\"color:#0A92DB;letter-spacing:0.03em;\">" +
                                    "<b>{ticketPrice}</b>" +
                                "</span>" +
                            "</td>" +
                        "</tr>";

const ticketsTable =    "<table class=\"tickets\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"" +
                            "style=\"margin-top:25px;width:100%;\">" +
                            "<tr class=\"tickets__header\">" +
                                "<th class=\"tickets__left\" style=\"text-align:left;padding-bottom:15px;\">" +
                                    "<span class=\"tickets__name\"" +
                                        "style=\"color:#4F4F4F;font-size:18px;\">" +
                                        "<b>{ticketsHeader}</b>" +
                                    "</span>" +
                                "</th>" +
                            "</tr>" +
                            "{tickets}" +
                        "</table>";

const ticketsBlock =    "<tr>" +
                            "<td>" +
                                "{ticketsTable}" +
                                "{additionalsTable}" +
                                "<table class=\"total\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"" +
                                    "style=\"margin-top:20px;width:100%;padding-top:10px;border-top-width:1px;border-top-style:solid;border-top-color:#F0F0F0;\">" +
                                    "<tr class=\"total__left\">" +
                                        "<td class=\"total__left\">" +
                                            "<span class=\"total__text\"" +
                                                "style=\"text-transform:uppercase;color:#4F4F4F;font-size:18px;\">" +
                                                "<b>{total}</b>" +
                                            "</span>" +
                                        "</td>" +
                                        "<td class=\"total__right\" style=\"text-align:right;\">" +
                                            "<span" +
                                                "class=\"total__price\"" +
                                                "style=\"color:#0A92DB;letter-spacing:0.03em;font-size:18px;\">" +
                                                "<b>{price}</b>" +
                                            "</span>" +
                                        "</td>" +
                                    "</tr>" +
                                "</table>" +
                            "</td>" +
                        "</tr>"