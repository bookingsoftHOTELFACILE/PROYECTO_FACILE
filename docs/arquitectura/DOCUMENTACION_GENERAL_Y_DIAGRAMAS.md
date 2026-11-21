# 📐 Documentación General de Ingeniería de Software y Diagramas UML / MER / MR

**Proyecto:** BookingSoft PMS — Apartahotel Facile  
**Programa:** Análisis y Desarrollo de Software (ADSO) — SENA  
**Fecha:** Noviembre 2026  
**Autores:** Equipo de Desarrollo ADSO (Chico, Mayor, Echeverri, Parada, López)  

---

## 1. Diagrama de Arquitectura del Sistema (Criterio 5)

El sistema adopta una arquitectura desacoplada basada en microservicios orquestados mediante **Docker Compose**, asegurando alta disponibilidad, seguridad perimetral y aislamiento de red:

```mermaid
flowchart TD
    subgraph Cliente["Capa de Presentación (Frontend)"]
        User["Huésped / Recepcionista / Admin"] -->|HTTPS / HTTP :3001| Nginx["Nginx Reverse Proxy"]
        Nginx -->|Sirve SPA estática| ReactApp["React 18 + Vite SPA"]
    end

    subgraph Perimetro["Perímetro de Seguridad & Enrutamiento"]
        ReactApp -->|Peticiones /api/* (CORS + Bearer JWT)| APIGateway["FastAPI Gateway & Router :4000/:4001"]
    end

    subgraph Logica["Capa de Lógica de Negocio (Backend)"]
        APIGateway --> AuthModule["Módulo de Autenticación & RBAC"]
        APIGateway --> ReservasModule["Motor de Reservas & Disponibilidad"]
        APIGateway --> FolioModule["Módulo Contable & Liquidación COP"]
        APIGateway --> CoworkingModule["Módulo Centro de Negocios"]
        APIGateway --> MantenimientoModule["Módulo Ama de Llaves & Aseo"]
    end

    subgraph Persistencia["Capa de Persistencia de Datos"]
        AuthModule --> DBEngine["SQLAlchemy + ConnectionPool"]
        ReservasModule --> DBEngine
        FolioModule --> DBEngine
        CoworkingModule --> DBEngine
        MantenimientoModule --> DBEngine
        DBEngine -->|TCP :5432 / Protocolo Binario| Postgres[("PostgreSQL 15 (GiST + daterange)")]
    end

    subgraph Administracion["Monitoreo & Auditoría"]
        DBA["Administrador DBA"] -->|HTTP :5050| PgAdmin["pgAdmin 4"]
        PgAdmin --> Postgres
    end
```

---

## 2. Diagrama de Casos de Uso Global (UML)

```mermaid
flowchart LR
    Admin((Administrador))
    Recep((Recepcionista))
    Ama((Ama de Llaves))
    Huesped((Huésped))

    subgraph SistemaPMS["BookingSoft PMS - Sistema de Gestión"]
        CU01["CU-01: Autenticación & Recuperación"]
        CU02["CU-02: Gestionar Colaboradores"]
        CU03["CU-03: Crear Reserva Walk-In"]
        CU04["CU-04: Registrar Check-In & Llave Digital"]
        CU05["CU-05: Registrar Check-Out & Folio"]
        CU06["CU-06: Asignar Aseo de Habitación"]
        CU07["CU-07: Reportar Daño / Mantenimiento"]
        CU08["CU-08: Reservar Sala de Coworking"]
        CU09["CU-09: Consultar Catálogo & Tarifas"]
        CU10["CU-10: Cierre de Turno & Reporte Financiero"]
    end

    Admin --> CU01
    Admin --> CU02
    Admin --> CU10
    Admin --> CU03

    Recep --> CU01
    Recep --> CU03
    Recep --> CU04
    Recep --> CU05
    Recep --> CU08

    Ama --> CU01
    Ama --> CU06
    Ama --> CU07

    Huesped --> CU09
    Huesped --> CU08
```

---

## 3. Diagrama de Clases del Dominio (UML)

```mermaid
classDiagram
    class Empleado {
        +int id_empleado
        +string nombre
        +string usuario
        +string contrasena_hash
        +string rol
        +string estado
        +verificarPassword(pass) bool
        +generarTokenJWT() string
    }

    class Huesped {
        +int id_huesped
        +string nombre
        +string documento
        +string telefono
        +string correo
        +string lealtad
        +esMayorDeEdad() bool
    }

    class Habitacion {
        +int id_habitacion
        +string numero
        +string tipo
        +int capacidad
        +decimal precio_noche
        +string estado
        +cambiarEstado(nuevoEstado)
        +estaDisponible(fEntrada, fSalida) bool
    }

    class ReservaHabitacion {
        +int id_reserva
        +int id_huesped
        +int id_habitacion
        +date fecha_entrada
        +date fecha_salida
        +string estado
        +int numero_personas
        +calcularNoches() int
        +ejecutarCheckIn()
        +ejecutarCheckOut()
    }

    class FolioContable {
        +int id_folio
        +int id_reserva
        +decimal total_hospedaje
        +decimal deposito_garantia
        +decimal consumos_extras
        +decimal total_pagado
        +decimal saldo_pendiente
        +registrarAbono(monto)
        +liquidarEstadia()
    }

    class ReservaCoworking {
        +int id_reserva_coworking
        +int id_espacio
        +int id_huesped
        +date fecha
        +time hora_inicio
        +time hora_fin
        +decimal precio_total
    }

    Empleado "1" --> "*" ReservaHabitacion : "Registra / Modifica"
    Huesped "1" --> "*" ReservaHabitacion : "Realiza"
    Habitacion "1" --> "*" ReservaHabitacion : "Aloja"
    ReservaHabitacion "1" --> "1" FolioContable : "Genera"
    Huesped "1" --> "*" ReservaCoworking : "Contrata"
```

---

## 4. Modelo Entidad-Relación (MER) y Modelo Relacional (MR)

### 4.1 Modelo Entidad-Relación (ERD)

```mermaid
erDiagram
    EMPLEADO ||--o{ RESERVA_HABITACION : "gestiona"
    HUESPED ||--o{ RESERVA_HABITACION : "solicita"
    HABITACION ||--o{ RESERVA_HABITACION : "asignada_en"
    RESERVA_HABITACION ||--|| FOLIO_CONTABLE : "posee"
    FOLIO_CONTABLE ||--o{ CARGO_FOLIO : "contiene"
    HUESPED ||--o{ RESERVA_COWORKING : "agenda"
    ESPACIO_COWORKING ||--o{ RESERVA_COWORKING : "utilizado_en"

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
    FOLIO_CONTABLE {
        int id_folio PK
        int id_reserva FK
        decimal total_facturado
        decimal saldo_pendiente
        string estado
    }
```

### 4.2 Modelo Relacional Normalizado (Tercera Forma Normal - 3FN)

A continuación se listan las tablas relacionales con sus restricciones de integridad referencial:

1. **`empleados`**  
   - `id_empleado` (INT, PK, AUTO_INCREMENT)  
   - `nombre` (VARCHAR(150), NOT NULL)  
   - `usuario` (VARCHAR(50), UK, NOT NULL)  
   - `contrasena` (VARCHAR(255), NOT NULL) — Hash Bcrypt  
   - `rol` (VARCHAR(50), NOT NULL) — `['Administrador', 'Recepcionista 24h', 'Ama de llaves', 'Personal de mantenimiento']`  
   - `tipo_documento` (VARCHAR(30), NOT NULL)  
   - `numero_documento` (VARCHAR(30), UK, NOT NULL)  
   - `correo` (VARCHAR(150), UK, NOT NULL)  
   - `estado` (VARCHAR(20), NOT NULL, DEFAULT 'Activo')  
   - `creado_en` (TIMESTAMP, DEFAULT NOW())

2. **`huespedes`**  
   - `id_huesped` (INT, PK, AUTO_INCREMENT)  
   - `nombre` (VARCHAR(150), NOT NULL)  
   - `tipo_documento` (VARCHAR(30), NOT NULL)  
   - `documento` (VARCHAR(30), UK, NOT NULL)  
   - `telefono` (VARCHAR(25), NOT NULL)  
   - `correo` (VARCHAR(150), NOT NULL)  
   - `empresa` (VARCHAR(150), NULL)  
   - `lealtad` (VARCHAR(20), DEFAULT 'Estandar')  
   - `estado` (VARCHAR(20), DEFAULT 'Activo')  
   - `creado_por` (VARCHAR(50))  
   - `modificado_por` (VARCHAR(50))

3. **`habitaciones`**  
   - `id_habitacion` (INT, PK, AUTO_INCREMENT)  
   - `numero` (VARCHAR(10), UK, NOT NULL)  
   - `tipo` (VARCHAR(50), NOT NULL) — `['Dúplex', 'Dobles', 'Familiares', 'Habitaciones']`  
   - `capacidad` (INT, NOT NULL)  
   - `precio_noche` (NUMERIC(12, 2), NOT NULL)  
   - `estado` (VARCHAR(25), NOT NULL, DEFAULT 'Disponible') — `['Disponible', 'Ocupada', 'Limpieza', 'Mantenimiento']`  
   - `detalle_mantenimiento` (TEXT, NULL)

4. **`reservas_habitacion`**  
   - `id_reserva` (INT, PK, AUTO_INCREMENT)  
   - `id_huesped` (INT, FK ➔ `huespedes.id_huesped`, NOT NULL)  
   - `id_habitacion` (INT, FK ➔ `habitaciones.id_habitacion`, NOT NULL)  
   - `fecha_entrada` (DATE, NOT NULL)  
   - `fecha_salida` (DATE, NOT NULL)  
   - `numero_personas` (INT, NOT NULL, DEFAULT 1)  
   - `estado` (VARCHAR(25), NOT NULL, DEFAULT 'Confirmada') — `['Confirmada', 'Check-In', 'Check-Out', 'Cancelada']`  
   - *Constraint:* `CHECK (fecha_salida > fecha_entrada)`  
   - *Exclusion Constraint (PostgreSQL):* `EXCLUDE USING gist (id_habitacion WITH =, daterange(fecha_entrada, fecha_salida) WITH &&)`

5. **`folios_contables`**  
   - `id_folio` (INT, PK, AUTO_INCREMENT)  
   - `id_reserva` (INT, FK ➔ `reservas_habitacion.id_reserva`, UK, NOT NULL)  
   - `subtotal` (NUMERIC(12, 2), NOT NULL)  
   - `descuento` (NUMERIC(12, 2), DEFAULT 0)  
   - `impuestos` (NUMERIC(12, 2), NOT NULL)  
   - `deposito_garantia` (NUMERIC(12, 2), NOT NULL, DEFAULT 150000)  
   - `total` (NUMERIC(12, 2), NOT NULL)  
   - `saldo_pendiente` (NUMERIC(12, 2), NOT NULL)  
   - `estado` (VARCHAR(20), DEFAULT 'Pendiente') — `['Pendiente', 'Parcial', 'Pagado']`

---

## 5. Diagrama de Secuencia: Flujo Walk-In con Check-In y Emisión de Llave

```mermaid
sequenceDiagram
    autonumber
    actor Recepcionista
    participant Front as Frontend (React / PMS)
    participant Back as Backend (FastAPI)
    participant DB as Base de Datos (PostgreSQL)
    participant Lock as Servicio Yale Connect (Lógico)

    Recepcionista->>Front: Ingresa Cédula del Huésped
    Front->>Back: GET /api/huespedes/buscar?documento=1017283944
    Back->>DB: SELECT * FROM huespedes WHERE documento = '...'
    DB-->>Back: Retorna datos del huésped
    Back-->>Front: Huésped Frecuente (Autocompletado)

    Recepcionista->>Front: Selecciona Suite, Fechas y activa "Check-In Directo"
    Front->>Back: POST /api/reservas (Walk-In Payload)
    Back->>DB: BEGIN TRANSACTION
    Back->>DB: Verificar disponibilidad (daterange &&)
    Back->>DB: INSERT INTO reservas_habitacion (...)
    Back->>DB: UPDATE habitaciones SET estado = 'Ocupada' WHERE id = ...
    Back->>DB: INSERT INTO folios_contables (...)
    Back->>DB: COMMIT TRANSACTION
    
    Back->>Lock: Generar PIN seguro de cerradura (6 dígitos)
    Lock-->>Back: Token Yale emitido (expira al checkout)
    Back-->>Front: HTTP 201 Created (Reserva, Folio, Llave Digital)
    Front-->>Recepcionista: Confirmación en pantalla + Enlace de Llave Móvil
```
