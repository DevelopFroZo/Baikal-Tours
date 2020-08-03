"use strict";

const { promises: { readFile } } = require( "fs" );

export {
  getTemplate,
  getTemplateTexts
};

async function getTemplate( templateName ){
  try{
    const template = await readFile( `src/mail_service/templates/${templateName}.html`, "utf8" );

    return template;
  } catch( e ) {
    if( e.errno === -4058 ) return false;

    throw e;
  }
}

async function getTemplateTexts( client, locales, templateName ){
  const { rows: [ row ] } = await client.query(
    `select mt_.texts
    from
    	mail_templates as mt,
    	mail_templates_ as mt_
    where
    	mt_.locale = any( $1 ) and
    	mt.name = $2 and
    	mt.id = mt_.id_`,
    [ locales, templateName ]
  );

  return row ? row.texts : null;
}
