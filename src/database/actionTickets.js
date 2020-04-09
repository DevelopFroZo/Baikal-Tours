import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Action Tickets" );
  }

  async create( actionId, price ){
    const transaction = await super.transaction();

    const id = ( await transaction.query(
      `insert into action_tickets( action_id, price )
      values( $1, $2 )
      returning id`,
      [ actionId, price ]
    ) ).rows[0].id;

    return { transaction, id };
  }

  async edit( client, id, price ){
    await client.query(
      `update action_tickets
      set price = $1
      where id = $2`,
      [ price, id ]
    );
  }

  async delete( id ){
    await super.query(
      `delete from action_tickets
      where id = $1`,
      [ id ]
    );

    return super.success();
  }
}
