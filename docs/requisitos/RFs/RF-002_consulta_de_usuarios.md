# RF-002 — Consulta de Usuarios

<!--
  ¿Qué? Requisito funcional que define la visualización del listado de usuarios registrados.
  ¿Para qué? Permitir al administrador supervisar y gestionar el personal con acceso al sistema.
  ¿Impacto? Sin este requisito el administrador no puede conocer qué usuarios existen en el sistema.
-->

---

## Identificación

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | RF-002                     |
| **Nombre**       | Consulta de Usuarios       |
| **Módulo**       | Módulo de Usuarios         |
| **Prioridad**    | Alta |
| **Estado**       | Pendiente |
| **Fecha**        | 2026-08-22 |

---

## Descripción

El sistema deberá permitir al administrador visualizar el listado completo de usuarios registrados en BookingSoft. La consulta debe mostrar la información esencial de cada usuario y permitir la aplicación de filtros básicos para facilitar la búsqueda y supervisión del personal.

---

## Entradas

| Campo         | Tipo         | Obligatorio | Validaciones                                      |
| ------------- | ------------ | ----------- | ------------------------------------------------- |
| Filtro estado | Texto / Enum | No          | Valor: activo / inactivo                          |
| Filtro rol    | Texto / Enum | No          | Valor dentro de los roles definidos por el sistema |

---

## Proceso

1. El administrador accede al módulo de gestión de usuarios.
2. El sistema consulta el listado de usuarios registrados.
3. El sistema aplica los filtros seleccionados si el administrador los ha especificado.
4. El sistema presenta el listado con la información esencial de cada usuario.
5. Si no existen usuarios registrados, el sistema muestra un mensaje informativo.

---

## Salidas

| Escenario                        | Resultado                                             |
| -------------------------------- | ----------------------------------------------------- |
| Consulta exitosa con registros   | Listado de usuarios con nombre, documento, rol y estado |
| Consulta sin resultados          | Mensaje informando que no hay usuarios registrados    |
| Filtro aplicado con resultados   | Listado filtrado según los criterios seleccionados    |
| Filtro sin resultados            | Listado vacío con mensaje informativo                 |

---

## Endpoints asociados

Ninguno

---

## Reglas de negocio

- RN-002.1: Solo el administrador puede acceder al listado completo de usuarios del sistema.
- RN-002.2: El listado debe incluir al menos: nombre completo, tipo de documento, número de documento, correo electrónico, rol y estado de cada usuario.

---

## HUs relacionadas

- HU-003 — Consulta de Usuarios del Sistema
