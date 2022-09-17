import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column( 'text' , {
        unique  : true,
        nullable: true
    })
    email:string;

    @Column( 'text' , {
        unique  : true,
        nullable: true
    })
    password:string;

    @Column( 'text' )
    fullName:string;

    @Column( 'bool' ,{
        default: true
    } )
    isActive:boolean;

    @Column( 'text', {
        array   : true,
        default : [ 'user' ]
    })
    roles:string[];
    
}
