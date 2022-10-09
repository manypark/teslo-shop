import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "src/products/entities";

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
        default : [ 'user', 'admin' ]
    })
    roles:string[];

    @OneToMany(
        () => Product,
        ( product ) => product.user
    )
    product:Product

    @BeforeInsert()
    checkFieldsInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsUpdate() {
        this.checkFieldsInsert();
    }
    
}
