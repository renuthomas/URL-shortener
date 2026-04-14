import {Pool} from "pg";

const pool=new Pool({
    user:"postgres",
    host:"localhost",
    database:"postgres",
    password:"renu3001",
    port:5432
})

export {pool};

