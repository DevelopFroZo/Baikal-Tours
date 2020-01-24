import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Filters" );
  }

  async get(){
    const transaction = await super.transaction();

    const locations = ( await transaction.query(
      `select *
      from locations`
    ) ).rows;
    const companions = ( await transaction.query(
      `select *
      from companions`
    ) ).rows;
    const subjects = ( await transaction.query(
      `select *
      from subjects`
    ) ).rows;
    const prices = ( await transaction.query(
      `select
         min( price ) as min,
         max( price ) as max
       from actions`
    ) ).rows;
    await transaction.end();

    return super.success( 0, { locations, companions, subjects, prices } );
  }
}
