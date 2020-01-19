import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Subjects" );
  }

  async getAll(){
    const rows = ( await super.query(
      `select *
      from subjects`
    ) ).rows;

    return super.success( 0, rows );
  }
}
