const { Pool } = require("pg");
const Cursor = require("pg-cursor");
const argv = process.argv.slice(2);


let tipoConsulta = argv[0]
let arg1 = argv[1]
let arg2 = argv[2]
let arg3 = argv[3]
let arg4 = argv[4]

const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'banco',
    password: 'raby1949',
    port: 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    }
    const pool = new Pool(config);

//1. Crear una función asíncrona que registre una nueva transacción utilizando valores
//ingresados como argumentos en la línea de comando. Debe mostrar por consola la
//última transacción realizada.


pool.connect((error_conexion, client, release) => {
    if(error_conexion){
        console.log("Error de Conexion a DB, codigo:", error_conexion.code)
    }else{

    try {

        if (tipoConsulta == "nueva") {
            const nuevaTransaccion = async() => {

                try {
                await client.query("BEGIN");

                const SQLQuery = {
                    text: "insert into transacciones (descripcion,fecha, monto, cuenta) values ($1, $2, $3, $4) RETURNING *;",
                    values: [arg1, arg2, arg3, arg4],
                };

                const res = await client.query(SQLQuery);
                    console.log("Ultima TRansaccion Realizada", res.rows);
                
                const SQLQueryUpdate = {
                    text: "update cuentas SET saldo = saldo - $1 WHERE id = $2 RETURNING *;",
                    values: [arg3, arg4],
                    };
        
                const update = await client.query(SQLQueryUpdate);
                    console.log(update.rows);


                    await client.query("COMMIT");    

                } catch (error) {
                    console.log(
                    `El error se encuentra en la tabla: ${error.table}.
                     El detalle del error es: ${error.detail}.
                     El codigo de error es: ${error.code}.
                     Restricción violada: ${error.constraint}.`);

                     await client.query('ROLLBACK');
                }

                release();

            }
            nuevaTransaccion();
        }

//2. Realizar una función asíncrona que consulte la tabla de transacciones y retorne
//máximo 10 registros de una cuenta en específico. Debes usar cursores para esto.
        

        if(tipoConsulta == "consulta"){
            const consultaTrans = async()=>{
              const cursor = await client.query(new Cursor(`select * from transacciones where cuenta = ${arg1}`));
              cursor.read(10, (error, rows)=>{
                  console.log(`Registro de transacciones de la cuenta "${arg1}",(MAX 10)`, rows);
                  cursor.close()   
                  //Se tomo en cuenta las recomendaciones y se optimizo el codigo
                  release();
              })  
            }

            consultaTrans();
        }

//3. Realizar una función asíncrona que consulte el saldo de una cuenta y que sea
//ejecutada con valores ingresados como argumentos en la línea de comando. Debes
//usar cursores para esto.

        if(tipoConsulta == "saldo"){
            const consultaSaldo = async()=>{
                const cursor = await client.query(new Cursor(`select * from cuentas where id = ${arg1}`));
                cursor.read(1,(error, rows) =>{
                    console.log(`Saldo de la cuenta "${arg1}": \n`,rows);
                    cursor.close();
                    release();
                })
            }
            consultaSaldo();
        }

    } catch (error) {
        console.log("Error en la consulta ", error);
    }
    pool.end();
}
});