# RNF-002 — Motor de Base de Datos

<!--
  ¿Qué? Requisito no funcional que define el sistema gestor de base de datos de BookingSoft.
  ¿Para qué? Establecer PostgreSQL como la tecnología de persistencia del sistema.
  ¿Impacto? La elección del motor define la forma en que se almacenan, consultan y protegen los datos del hotel.
-->

---

## Identificación

| Campo             | Valor                      |
| ----------------- | -------------------------- |
| **ID**            | RNF02                      |
| **Referencia**    | RNF-002                    |
| **Nombre**        | Motor de Base de Datos     |
| **Categoría**     | Persistencia de Datos      |
| **Prioridad**    | Alta |
| **Estado**       | Implementado y probado |
| **Fecha**        | 2026-08-22 |

---

## Descripción

La base de datos utilizada por BookingSoft será PostgreSQL. Todas las operaciones de persistencia del sistema (registro de usuarios, reservas, estadías, inventario, servicios y demás entidades del dominio) deberán realizarse sobre este motor de base de datos relacional.

---

## Justificación

PostgreSQL es un sistema gestor de base de datos relacional de código abierto con amplio soporte para operaciones transaccionales, integridad referencial y concurrencia. Su elección es coherente con las necesidades de BookingSoft, que requiere consistencia de datos en operaciones críticas como la gestión de reservas y disponibilidad de unidades.

---

## Criterios de cumplimiento

- La aplicación de BookingSoft está configurada para conectarse a una instancia de PostgreSQL.
- Todas las operaciones de lectura y escritura de datos del sistema se realizan sobre PostgreSQL.
- Las entidades del dominio de BookingSoft (usuarios, reservas, unidades, servicios, etc.) están representadas en la base de datos PostgreSQL.

---

## Restricciones / Consideraciones

- No se deben utilizar otros motores de base de datos (MySQL, SQLite, MongoDB, etc.) como base de datos principal del sistema.
- La configuración de conexión a la base de datos debe gestionarse mediante variables de entorno (véase RNF08).

---

## Verificación

- Verificar que la configuración de la aplicación apunte a una instancia de PostgreSQL.
- Verificar que las operaciones de persistencia se ejecuten correctamente sobre PostgreSQL.

---

## RF relacionados

- RF-001 — Registro de Usuario
- RF-002 — Consulta de Usuarios
- RF-003 — Consulta de Usuario Específico
- RF-011 — Creación de Reserva
- RF-012 — Consulta de Disponibilidad
