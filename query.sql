CREATE DATABASE banco;
\c banco;

CREATE TABLE cuentas(
    id INT PRIMARY KEY,
    saldo DECIMAL NOT NULL CHECK (saldo >=0)
);

CREATE TABLE transacciones(
descripcion VARCHAR(50) NOT NULL,
fecha VARCHAR(10) NOT NULL,
monto DECIMAL NOT NULL,
cuenta INT NOT NULL REFERENCES cuentas(id)
);


INSERT INTO cuentas values (1, 20000);
