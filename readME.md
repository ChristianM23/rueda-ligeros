# Rueda de Actos - Filà Ligeros
## Documentación Técnica y Manual de Usuario

### Creador
Christian Micó

---

## 1. DESCRIPCIÓN DEL PROYECTO

La **Rueda de Actos de la Filà Ligeros** es una aplicación web desarrollada para gestionar la participación de festeros en diferentes actos de las Fiestas de Moros y Cristianos. La aplicación permite asignar festeros a distintos roles (escuadreros y dianeros) y llevar un control detallado de su participación anual.

### Características Principales
- **Gestión de festeros**: Añadir, editar y eliminar miembros de la filà
- **Control de actos**: Asignación a diferentes tipos de actos (Escuadras y Dianas)
- **Sistema de turnos**: Rotación automática basada en números de rueda
- **Seguimiento de carnés**: Control del estado de carnés de avantcarga
- **Exportación de datos**: Funciones para guardar y exportar información
- **Interfaz responsive**: Compatible con dispositivos móviles y escritorio

---

## 2. ESPECIFICACIONES TÉCNICAS

### Lenguajes y Tecnologías
- **Frontend**: HTML5, CSS3, JavaScript
- **Framework CSS**: Bootstrap 5.3
- **Librería JavaScript**: jQuery 3.7
- **Servidor local**: MiniWeb
- **Alertas**: SweetAlert2
- **Exportación Excel**: SheetJS (XLSX)

### Estructura de Archivos
```
Rueda-Actos/
├── index.html                 # Archivo principal
├── ejecutar.vbs              # Script para iniciar servidor local
├── miniweb.exe               # Servidor web ligero
├── data/
│   └── rueda-ligeros.json    # Datos de festeros
├── scripts/
│   └── script.js             # Lógica principal de la aplicación
├── styles/
│   └── styles.css            # Estilos personalizados
├── libs/
│   ├── bootstrap.min.css     # Framework CSS
│   ├── bootstrap.bundle.min.js
│   ├── jquery-3.7.1.min.js  # Librería JavaScript
│   ├── sweetalert2.min.css   # Alertas bonitas
│   ├── sweetalert2.min.js
│   └── xlsx.full.min.js      # Exportación Excel
└── img/                      # Iconos e imágenes
    ├── green-card.png        # Carné vigente
    ├── red-card.png          # Sin carné
    ├── orange-card.png       # Carné caducado
    └── mayor-50.png          # Indicador mayor de 50 años
```

---

## 3. INSTALACIÓN Y CONFIGURACIÓN

### Requisitos Previos
- Windows (para ejecutar miniweb.exe)
- Navegador web moderno

### Instalación
1. **Descargar** todos los archivos del proyecto
2. **Ejecutar** `ejecutar.vbs` (doble clic)
3. **Esperar** que se abra automáticamente el navegador en `http://localhost:8000`

### Configuración del Servidor
El archivo `ejecutar.vbs` configura automáticamente:
- Puerto: 8000
- Servidor: MiniWeb (invisible en background)
- Apertura automática del navegador

---

## 4. ESTRUCTURA DE DATOS

### Formato JSON de Festeros
```json
{
  "num_rueda": 1,
  "nombre": "NOMBRE APELLIDOS",
  "genero": "Hombre|Mujer",
  "categoria": "Fester|Veterano|Supernumerario",
  "mayor_50": true|false,
  "avantcarga": "Sí|No|Caducado",
  "inclusion_rueda": 2025,
  "escuadra1": null|año,
  "diana1": null|año,
  "escuadra2": null|año,
  "diana3": null|año,
  "diana2": null|año
}
```

### Tipos de Actos
1. **Arrancà escuadra** (escuadra1): Máximo 11 festeros
2. **Arrancà diana** (diana1): Máximo 11 festeros  
3. **2n tram escuadra** (escuadra2): Máximo 11 festeros
4. **3r tram diana** (diana3): Máximo 11 festeros
5. **2n tram diana** (diana2): Máximo 11 festeros

---

## 5. FUNCIONALIDADES PRINCIPALES

### 5.1 Gestión de Festeros

#### Añadir Nuevo Festero
- **Botón**: "Añadir festero" en el header
- **Campos obligatorios**: Nombre, género, categoría
- **Campos opcionales**: Mayor de 50 años, carné avantcarga
- **Asignación automática**: Número de rueda consecutivo

#### Editar Festero Existente
- **Acceso**: Botón "Editar" en cada fila de la tabla
- **Modal**: Formulario completo con todos los datos
- **Campos editables**: Todos excepto número de rueda
- **Validación**: Campos requeridos marcados

#### Eliminar Festero
- **Confirmación**: Mensaje de SweetAlert2
- **Reasignación**: Los números de rueda se reorganizan automáticamente
- **Persistencia**: Cambios guardados en sessionStorage

### 5.2 Asignación de Actos

#### Sistema de Selección
- **Activación**: Doble clic en las celdas de actos
- **Año actual**: Se marca con el año festero actual
- **Límites**: Cada acto tiene un máximo de participantes
- **Colores**: Cada año tiene un color distintivo

#### Restricciones por Género
- **Escuadras tradicionales**: Solo hombres o mujeres
- **Escuadras mixtas**: Opción activable desde controles
- **Validación automática**: Bloqueo de selecciones incompatibles

#### Completado de Actos
- **Notificación**: Aviso cuando se completa un acto
- **Reorganización**: Los seleccionados se mueven al final de la rueda
- **Progreso**: Contadores en tiempo real en la parte superior

### 5.3 Sistema de Carnés de Avantcarga

#### Estados Posibles
- **Sí** (Verde): Carné vigente
- **No** (Rojo): Sin carné
- **Caducado** (Naranja): Carné expirado

#### Seguimiento para Escuadras
- **Conteo automático**: Solo para actos de escuadra
- **Indicadores visuales**: Iconos de colores en la tabla
- **Resumen**: Totales mostrados en la parte superior

### 5.4 Configuraciones Avanzadas

#### Múltiples Actos por Persona
- **Switch**: "Permitir múltiples actos por persona"
- **Comportamiento**: Una persona puede hacer varios actos en el mismo año
- **Validación**: Actualización automática de restricciones

#### Escuadras Mixtas
- **Switch**: "Permitir escuadras mixtas"
- **Efecto**: Elimina restricciones de género
- **Flexibilidad**: Permite participación masculina y femenina en escuadras

---

## 6. INTERFAZ DE USUARIO

### 6.1 Layout Principal

#### Header Fijo
- **Título**: "Filà Ligeros - Rueda de actos"
- **Botones principales**: Exportar, Añadir festero, Guardar
- **Responsive**: Se adapta a pantallas móviles

#### Panel de Control Superior
- **Contadores por género**: Hombres y mujeres por acto
- **Estado carnés**: Resumen de carnés de avantcarga
- **Controles**: Switches para múltiples actos y escuadras mixtas
- **Sticky**: Se fija al hacer scroll

#### Tabla Principal
- **Columnas**:
  - Nº rueda
  - Nombre (con indicadores visuales)
  - Género
  - Categoría
  - Columnas de actos (5 tipos)
  - Acciones (Editar)

### 6.2 Indicadores Visuales

#### Iconos de Estado
- 🟢 **Carné vigente**: Tarjeta verde
- 🔴 **Sin carné**: Tarjeta roja  
- 🟠 **Carné caducado**: Tarjeta naranja
- 👤 **Mayor de 50**: Icono de persona

#### Colores por Año
- **2022**: Rojo claro (#ffd6d6)
- **2023**: Naranja claro (#ffe6b3)
- **2024**: Amarillo claro (#ffffb3)
- **2025**: Azul claro (#d6f0ff)
- **2026**: Verde claro (#d6ffd6)
- **2027**: Rosa claro (#ffd6ff)
- **2028**: Violeta claro (#f0d6ff)
- **2029**: Turquesa claro (#d6ffff)
- **2030**: Gris claro (#f2f2f2)

### 6.3 Modales

#### Modal de Edición
- **Campos**: Información completa del festero
- **Validación**: Campos requeridos
- **Acciones**: Guardar cambios, Borrar persona, Cancelar

#### Modal de Nuevo Festero
- **Formulario**: Datos básicos del nuevo miembro
- **Autocompletado**: Número de rueda automático
- **Validación**: Nombre requerido en mayúsculas

---

## 7. ALMACENAMIENTO DE DATOS

### 7.1 SessionStorage
- **Propósito**: Mantener datos durante la sesión
- **Clave**: "listaPersonas"
- **Formato**: JSON array con todos los festeros
- **Persistencia**: Se pierde al cerrar el navegador

### 7.2 Archivo JSON Local
- **Ubicación**: `/data/rueda-ligeros.json`
- **Carga inicial**: Al abrir la aplicación
- **Estructura**: Array de objetos festeros
- **Backup**: Punto de partida para cada sesión

### 7.3 Exportación

#### Descarga JSON
- **Botón**: "Guardar" en el header
- **Formato**: JSON pretty-printed
- **Nombre**: "rueda-ligeros.json"
- **Uso**: Backup y transferencia de datos

#### Exportación Excel
- **Botón**: "Exportar" en el header
- **Formato**: XLSX estándar
- **Nombre**: "rueda-ligeros.xlsx"
- **Contenido**: Todos los campos de los festeros

---

## 8. INSTRUCCIONES DE USO

### 8.1 Inicio Rápido
1. **Ejecutar** `ejecutar.vbs`
2. **Esperar** carga automática en navegador
3. **Verificar** que se muestran los datos iniciales
4. **Comenzar** a gestionar festeros y actos

### 8.2 Flujo de Trabajo Típico

#### Inicio de Temporada
1. **Revisar** lista de festeros actual
2. **Añadir** nuevos miembros si es necesario
3. **Actualizar** carnés de avantcarga
4. **Configurar** preferencias (mixtas, múltiples actos)

#### Asignación de Actos
1. **Seleccionar acto** actual desde los controles
2. **Doble clic** en festeros para asignar
3. **Monitorear** contadores en tiempo real
4. **Completar** acto hasta el límite máximo
5. **Confirmar** reorganización automática

#### Final de Proceso
1. **Revisar** asignaciones finales
2. **Exportar** datos para archivo
3. **Guardar** JSON como backup
4. **Cerrar** aplicación

### 8.3 Resolución de Problemas

#### La aplicación no carga
- Verificar que `miniweb.exe` está ejecutándose
- Comprobar puerto 8000 no está ocupado
- Intentar acceder manualmente a `http://localhost:8000`

#### Datos no se guardan
- Los cambios se guardan en sessionStorage automáticamente
- Para persistencia permanente usar botón "Guardar"
- Verificar que los archivos JSON se descargan correctamente

#### Errores de asignación
- Revisar límites máximos por acto
- Comprobar restricciones de género
- Verificar configuración de múltiples actos

---

## 9. MANTENIMIENTO Y DESARROLLO

### 9.1 Actualización de Datos
- **Archivo base**: Modificar `/data/rueda-ligeros.json`
- **Campos nuevos**: Actualizar estructura en `script.js`
- **Validaciones**: Ajustar en formularios modal

### 9.2 Personalización Visual
- **Colores**: Modificar `/styles/styles.css`
- **Años**: Agregar nuevas clases `.año-XXXX`
- **Iconos**: Reemplazar archivos en `/img/`

### 9.3 Funcionalidades Adicionales
- **Límites**: Cambiar `limitePorColumna` en script.js
- **Campos**: Añadir en estructura JSON y formularios
- **Validaciones**: Extender funciones de verificación

---

## 10. SOPORTE Y CONTACTO

### Desarrollador
**Christian Micó**

### Versión
1.0 - Sistema completo de gestión de festeros

### Licencia
Uso interno para Filà Ligeros

---

*Esta documentación cubre todas las funcionalidades actuales del sistema. Para consultas específicas o nuevas características, contactar con el desarrollador.*