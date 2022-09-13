export const fileFilter = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {

    if( !file ) return callback( new Error('File is empty'), false );
    
    const validExtension = [ 'jpg','jpeg','png','gif'];

    if( validExtension.includes( file.mimetype.split('/')[1] ) ) return callback( null, true );

    callback( null, false );

}