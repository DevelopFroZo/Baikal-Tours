export {
  contactsToString
};

function contactsToString( contact_faces, emails, phones ){
  contact_faces = contact_faces ? contact_faces : [];
  emails = emails ? emails : [];
  phones = phones ? phones : [];

  const maxCount = Math.max( Math.max( contact_faces.length, emails.length ), phones.length );
  let contacts = [];

  for( let i = 0; i < maxCount; i++ ){
    contacts[i] = [];

    if( contact_faces[i] !== undefined )
      contacts[i].push( contact_faces[i] );
    if( emails[i] !== undefined )
      contacts[i].push( emails[i] );
    if( phones[i] !== undefined )
      contacts[i].push( phones[i] );

    contacts[i] = contacts[i].join( ", " );
  }

  return contacts;
}
