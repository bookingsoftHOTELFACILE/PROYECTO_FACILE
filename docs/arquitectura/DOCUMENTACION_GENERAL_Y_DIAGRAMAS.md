# Documentación General y Diagramas del Proyecto — BookingSoft

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Programa:** Análisis y Desarrollo de Software (ADSO) — SENA  
**Autores:** David López, José Chico, Maicol Mayor, Sebastián Parada y Ashly Echeverri

---

## 1. Diagrama de Arquitectura del Sistema (Criterio 5)

Trabajamos una arquitectura cliente-servidor separada en contenedores con **Docker Compose**:

```mermaid
flowchart TD
    User["Huésped / Empleado"] -->|HTTP :3001| Nginx["Contenedor Frontend (Nginx + React 18)"]
    Nginx -->|Proxy /api| FastAPI["Contenedor Backend (FastAPI Python 3.11 :4000 / :4001)"]
    FastAPI -->|SQL con psycopg2 y Pool :5432| Postgres[("Contenedor PostgreSQL 15 + btree_gist")]
    Admin["Administrador"] -->|HTTP :5050| PgAdmin["Contenedor pgAdmin 4"]
    PgAdmin --> Postgres
```

---

## 2. Diagrama de Casos de Uso (UML)

```mermaid
flowchart LR
    Admin((Administrador))
    Recep((Recepcionista 24h))
    Ama((Ama de Llaves))
    Mant((Mantenimiento))
    Huesped((Huésped))

    subgraph BookingSoft["BookingSoft — Apartahotel Facile"]
        CU01["CU-01: Iniciar Sesión (JWT)"]
        CU02["CU-02: Gestionar Empleados y Roles"]
        CU03["CU-03: Ver Catálogo y Disponibilidad"]
        CU04["CU-04: Crear y Editar Reservas"]
        CU05["CU-05: Registrar Check-In y Check-Out"]
        CU06["CU-06: Registrar Pagos y Folio"]
        CU07["CU-07: Cambiar Estado a Limpieza / Disponible"]
        CU08["CU-08: Reportar Mantenimiento de Unidad"]
        CU09["CU-09: Reservar Salas y Coworking"]
    end

    Admin --> CU01
    Admin --> CU02
    Admin --> CU04
    Admin --> CU05
    Admin --> CU06

    Recep --> CU01
    Recep --> CU04
    Recep --> CU05
    Recep --> CU06
    Recep --> CU09

    Ama --> CU01
    Ama --> CU07

    Mant --> CU01
    Mant --> CU08

    Huesped --> CU03
    Huesped --> CU04
    Huesped --> CU09
```

---

## 3. Diagrama de Clases del Dominio (UML)

```mermaid
classDiagram
    class Empleado {
        +int id_empleado
        +string nombre
        +string usuario
        +string rol
        +string estado
    }

    class Huesped {
        +int id_huesped
        +string nombre
        +string documento
        +string telefono
        +string correo
        +string lealtad
        +string estado
    }

    class Habitacion {
        +int id_habitacion
        +string numero
        +string tipo
        +int capacidad
        +decimal precio_noche
        +string estado
        +string detalle_mantenimiento
    }

    class ReservaHabitacion {
        +int id_reserva
        +int id_huesped
        +int id_habitacion
        +date fecha_entrada
        +date fecha_salida
        +string estado
        +timestamp checkin_at
        +timestamp checkout_at
    }

    class Pago {
        +int id_pago
        +int id_reserva
        +decimal monto
        +string metodo
        +string estado
    }

    class Factura {
        +int id_factura
        +int id_reserva
        +string consecutivo
        +string cufe
        +string estado
    }

    class EspacioNegocio {
        +int id_espacio
        +string nombre
        +string tipo
        +int capacidad
        +decimal precio_hora
    }

    class ReservaNegocio {
        +int id_reserva_negocio
        +int id_espacio
        +int id_huesped
        +date fecha
        +time hora_inicio
        +time hora_fin
        +decimal precio_total
    }

    Huesped "1" --> "*" ReservaHabitacion : realiza
    Habitacion "1" --> "*" ReservaHabitacion : asignada en
    ReservaHabitacion "1" --> "*" Pago : recibe
    ReservaHabitacion "1" --> "0..1" Factura : genera
    EspacioNegocio "1" --> "*" ReservaNegocio : reservado en
    Huesped "0..1" --> "*" ReservaNegocio : solicita
```

---

## 4. Modelo Entidad-Relación (MER) y Modelo Relacional Real (`backend/schema.sql`)

```mermaid
erDiagram
    HUESPED ||--o{ RESERVA_HABITACION : realiza
    HABITACION ||--o{ RESERVA_HABITACION : asignada_en
    RESERVA_HABITACION ||--o{ PAGO : tiene
    RESERVA_HABITACION ||--o| FACTURA : genera
    ESPACIO_NEGOCIO ||--o{ RESERVA_NEGOCIO : reservado_en
    HUESPED ||--o{ RESERVA_NEGOCIO : opcional_en

    EMPLEADO {
        int id_empleado PK
        string usuario UK
        string rol
        string estado
    }
    HUESPED {
        int id_huesped PK
        string documento UK
        string nombre
        string correo
    }
    HABITACION {
        int id_habitacion PK
        string numero UK
        string tipo
        decimal precio_noche
        string estado
    }
    RESERVA_HABITACION {
        int id_reserva PK
        int id_huesped FK
        int id_habitacion FK
        date fecha_entrada
        date fecha_salida
        string estado
    }
    PAGO {
        int id_pago PK
        int id_reserva FK
        decimal monto
        string metodo
        string estado
    }
    FACTURA {
        int id_factura PK
        int id_reserva FK
        string consecutivo UK
        string estado
    }
```

### Tablas Reales en PostgreSQL (3FN):
1. **`empleado`**: `id_empleado` (`SERIAL` PK), `nombre`, `usuario` (UNIQUE), `contrasena` (hash bcrypt), `rol`, `tipo_documento`, `numero_documento` (UNIQUE), `correo` (UNIQUE), `estado`.
2. **`huesped`**: `id_huesped` (`SERIAL` PK), `nombre`, `documento` (UNIQUE), `telefono`, `correo`, `password_hash`, `empresa`, `lealtad`, `estado`, `creado_por`, `modificado_por`.
3. **`habitacion`**: `id_habitacion` (`SERIAL` PK), `numero` (UNIQUE), `tipo`, `capacidad`, `precio_noche`, `estado` (`Disponible`, `Ocupada`, `En limpieza`, `Mantenimiento`), `detalle_mantenimiento`.
4. **`reserva_habitacion`**: `id_reserva` (`SERIAL` PK), `id_huesped` (FK), `id_habitacion` (FK), `fecha_entrada`, `fecha_salida`, `estado` (`Confirmada`, `Check-In`, `Completada`, `Cancelada`), `checkin_at`, `checkout_at`, `observaciones`. Incluye la restricción **`EXCLUDE USING gist`** para impedir doble reserva en fechas solapadas.
5. **`pago`**: `id_pago` (`SERIAL` PK), `id_reserva` (FK), `monto`, `metodo`, `estado`, `referencia`, `gateway`.
6. **`factura`**: `id_factura` (`SERIAL` PK), `id_reserva` (FK UNIQUE), `consecutivo` (UNIQUE), `cufe`, `estado`, `xml`.
7. **`espacio_negocio`**: `id_espacio` (`SERIAL` PK), `nombre` (UNIQUE), `tipo` (`Sala de Juntas`, `Coworking`), `capacidad`, `precio_hora`, `estado`.
8. **`reserva_negocio`**: `id_reserva_negocio` (`SERIAL` PK), `id_espacio` (FK), `tipo_cliente`, `id_huesped` (FK opcional), `nombre_cliente`, `fecha`, `hora_inicio`, `hora_fin`, `duracion_horas`, `precio_total`, `estado`.

---

## 5. Diagrama de Secuencia: Flujo de Reserva en Recepción

```mermaid
sequenceDiagram
    autonumber
    actor Recepcionista
    participant Front as React (VistaPms)
    participant Back as FastAPI (routes/reservas.py)
    participant DB as PostgreSQL

    Recepcionista->>Front: Selecciona huésped, habitación y fechas
    Front->>Back: POST /api/reservas (Bearer JWT)
    Back->>Back: Valida fechas, estado y capacidad
    Back->>DB: BEGIN TRANSACTION + INSERT reserva_habitacion
    alt Sin traslape de fechas
        DB-->>Back: Reserva creada (COMMIT)
        Back-->>Front: HTTP 201 Created + cotización
        Front-->>Recepcionista: Muestra confirmación de reserva
    else Choque de fechas (GiST 23P01)
        DB-->>Back: Error de exclusión (ROLLBACK)
        Back-->>Front: HTTP 400 (Double Booking Detectado)
        Front-->>Recepcionista: Muestra alerta en pantalla
    end
```