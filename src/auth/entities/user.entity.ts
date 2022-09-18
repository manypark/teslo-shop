import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
        nullable: true,
        select  : false
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

    @BeforeInsert()
    checkFieldsInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsUpdate() {
        this.checkFieldsInsert();
    }
    
}
