import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Action Tickets Translates" );
  }

  async create( client, actionTicketId, locale, name ){
    await client.query(
      `insert into action_tickets_translates( action_ticket_id, locale, name )
      values( $1, $2, $3 )`,
      [ actionTicketId, locale, name ]
    );
  }

  async edit( client, actionTicketId, locale, name ){
    await client.query(
      `update action_tickets_translates
      set name = $1
      where
        action_ticket_id = $2 and
        locale = $3`,
      [ name, actionTicketId, locale ]
    );
  }
}
