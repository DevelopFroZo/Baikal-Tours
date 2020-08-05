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

const mailing =         "<tr class=\"mailing\">" +
                            "<td>" +
                                "<span class=\"mailing__text\" style=\"display:block;margin-top:30px;color:#4F4F4F;font-size:14px;\" >" +
                                    "{mailingText} " +
                                    "<a href=\"{domain}\" class=\"mailing__link\" target=\"_blank\" style=\"color:#0A92DB;text-decoration:none;\" >{domainWithoutHttp}</a>" +
                                "</span>" +
                                "<a href=\"http://baikal.events\" class=\"mailing__disabling\" target=\"_blank\" style=\"display:block;margin-top:30px;font-size:18px;color:#4F4F4F;text-decoration:none;\" >{disabledMailing}</a>" +
                            "</td>" +
                        "</tr>"

const ticketsCategory = "<tr class=\"tickets-table__category\" colspan=\"5\">" +
                            "<td style=\"color:#4F4F4F;padding-top:30px;font-size:12px;font-weight:600;\" >{category}</td>" +
                        "</tr>"

const ticketData =      "<tr class=\"tickets-table__ticket\">" +
                            "<td style=\"font-size:14px;color:#4F4F4F;padding-top:10px;\" >{ticketName}</td>" +
                            "<td class=\"tickets-table__ticket_center\" style=\"text-align:center;font-size:14px;color:#4F4F4F;padding-top:10px;\" >{ticketBookedCount}</td>" +
                            "<td class=\"tickets-table__ticket_center\" style=\"text-align:center;font-size:14px;color:#4F4F4F;padding-top:10px;\" >{ticketPaidCount}</td>" +
                            "<td class=\"tickets-table__ticket_center\" style=\"text-align:center;font-size:14px;color:#4F4F4F;padding-top:10px;\" >{ticketPrice}</td>" +
                            "<td class=\"tickets-table__ticket_center\" style=\"text-align:center;font-size:14px;color:#4F4F4F;padding-top:10px;\" >{ticketAmount}</td>" +
                        "</tr>"

module.exports = {
    ticket,
    ticketsTable,
    ticketsBlock,
    mailing,
    ticketsCategory,
    ticketData
}