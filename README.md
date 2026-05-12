# Presu Rápido - Aplicación de Presupuestos con Servidor

Aplicación web completa para crear, gestionar, almacenar e imprimir presupuestos y remitos. Con backend Node.js que puede desplegarse en Vercel o cualquier servidor compatible.

## Características

✅ Crear nuevos presupuestos con numeración automática (DDMMYYYYNNNN)  
✅ Guardar presupuestos en servidor con estructura de carpetas (Storage/Fecha/Número/)  
✅ Abrir y editar presupuestos guardados  
✅ Generar remitos desde presupuestos (sin precios)  
✅ Imprimir y guardar como PDF  
✅ Información editable del cliente  
✅ Cálculo automático de totales e IVA  
✅ Acceder desde cualquier máquina (desplegado en la nube)  
✅ Interfaz responsiva

## Estructura de Carpetas de Almacenamiento

```
Storage/
├── 08052026/           # Carpeta con fecha (DDMMYYYY)
│   ├── 0001/           # Carpeta con número de presupuesto
│   │   └── presupuesto.json
│   ├── 0002/
│   │   └── presupuesto.json
│   └── 0003/
│       └── presupuesto.json
├── 09052026/
│   └── 0001/
│       └── presupuesto.json
```


## Arquitectura

La aplicación fue modularizada para facilitar crecimiento y mantenimiento. Revisa [`ARCHITECTURE.md`](./ARCHITECTURE.md) para lineamientos y roadmap de evolución.

## Uso Local

### Requisitos
- Node.js 18+
- npm

### Instalación y Ejecución

1. Instala dependencias:
```bash
npm install
```

2. Inicia el servidor:
```bash
npm start
```

3. Abre en el navegador:
```
http://localhost:3000
```

### Flujo de Uso de la Aplicación

1. **Nuevo Presupuesto**: Clic en "📋 Nuevo Presupuesto"
   - Se genera automáticamente el número DDMMYYYYNNNN (ej: 08052026001)
   - Se crea la carpeta Storage/08052026/0001/ en el servidor
   - Se cargan datos de ejemplo

2. **Editar Presupuesto**:
   - Edita información del cliente directamente en los campos
   - Agregar artículos con "+ Agregar producto"
   - Edita cantidades y precios
   - Los cálculos se actualizan automáticamente

3. **Guardar**: Clic en "💾 Guardar"
   - Se guarda presupuesto.json en Storage/Fecha/Número/
   - Se puede guardar múltiples veces
   - Dentro de esa carpeta puedes guardar otros archivos (facturas, etc.)

4. **Abrir Presupuesto**: Clic en "📂 Abrir Presupuesto"
   - Se muestra lista de todos los presupuestos guardados
   - Ordenados por fecha más reciente
   - Clic en "Abrir" para cargar y editar

5. **Imprimir Presupuesto**: Clic en "🖨️ Imprimir / Guardar PDF"
   - Abre el diálogo de impresión
   - Puedes guarar como PDF con el navegador

6. **Generar Remito**: Clic en "📄 Remito"
   - Genera un remito de la misma información
   - Oculta columnas de Precio y Monto
   - Cambia "X" por "R"
   - Abre diálogo de impresión
   - Se puede guardar como PDF

## Despliegue en Vercel (En la Nube)

### Paso 1: Preparar el Repositorio Git

```bash
# Inicializar git si no lo está
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Presu Rápido - Aplicación de presupuestos"

# Si ya tienes un repositorio remoto
git remote add origin https://github.com/tuusuario/PruebaPresuRapido.git
git push -u origin main

# Si quieres usar push con tu nombre de usuario (sin HTTPS)
# git remote set-url origin git@github.com:tuusuario/PruebaPresuRapido.git
```

### Paso 2: Conectar Vercel

1. Accede a [vercel.com](https://vercel.com)
2. Inicia sesión (puedes usar tu cuenta GitHub)
3. Clic en **"New Project"**
4. Selecciona **"Import Git Repository"**
5. Busca y selecciona tu repositorio `PruebaPresuRapido`
6. Vercel auto-detectará la configuración de `vercel.json`
7. Clic en **"Deploy"**

### Paso 3: Acceder a la Aplicación

- La URL será: `https://tu-proyecto.vercel.app`
- La puedes compartir con otros usuarios
- Se pueden acceder desde cualquier dispositivo

### Paso 4: Actualizar en Producción

Cuando hagas cambios locales:
```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

Vercel se re-deployará automáticamente.

## API Rest

### POST /api/budgets/new
Genera un nuevo número de presupuesto y crea la carpeta

**Response:**
```json
{
  "success": true,
  "budgetNumber": "08052026001"
}
```

### POST /api/budgets/save
Guarda un presupuesto en servidor

**Request:**
```json
{
  "budgetNumber": "08052026001",
  "data": {
    "number": "08052026001",
    "date": "08/05/2026",
    "iva": "21",
    "items": [...],
    "clientInfo": {...},
    "observations": "...",
    "savedAt": "2026-05-08T10:30:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Presupuesto guardado correctamente",
  "path": "Storage/08052026/0001"
}
```

### GET /api/budgets/list
Lista todos los presupuestos guardados

**Response:**
```json
{
  "success": true,
  "budgets": [
    {
      "number": "08052026003",
      "date": "2026-05-08T14:50:00Z",
      "path": "Storage/08052026/0003"
    },
    {
      "number": "08052026002",
      "date": "2026-05-08T12:20:00Z",
      "path": "Storage/08052026/0002"
    }
  ]
}
```

### GET /api/budgets/:number
Carga un presupuesto específico

**Response:**
```json
{
  "success": true,
  "budget": {
    "number": "08052026001",
    "date": "08/05/2026",
    "iva": "21",
    "items": [...],
    "clientInfo": {...},
    "observations": "...",
    "savedAt": "2026-05-08T10:30:00Z"
  }
}
```

## Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Backend**: Node.js + Express
- **Almacenamiento**: Sistema de archivos (local) o `/tmp` (Vercel)
- **Deploy**: Vercel

## Estructura del Proyecto

```
├── index.html          # Interfaz principal
├── app.js             # Lógica del frontend
├── styles.css         # Estilos
├── server.js          # Servidor Node.js/Express
├── package.json       # Dependencias Node
├── vercel.json        # Configuración Vercel
├── .gitignore         # Archivos a ignorar en git
├── README.md          # Este archivo
└── Storage/           # Presupuestos guardados (creado automáticamente)
    └── DDMMYYYY/
        └── NNNN/
            └── presupuesto.json
```

## Solución de Problemas

### El servidor no inicia localmente
```bash
# Verifica que Node.js esté instalado
node --version  # Debe ser v18+

# Reinstala dependencias
rm -rf node_modules package-lock.json
npm install

# Intenta iniciar de nuevo
npm start
```

### No aparece la barra de navegación
- Verifica que `index.html` incluya los elementos: `#new-budget`, `#load-budget`, `#save-budget`
- Revisa la consola del navegador (F12 → Console) para errores

### Error al guardar presupuesto
- En desarrollo local: Verifica permisos de escritura en la carpeta
- En Vercel: Los archivos se guardan temporalmente, nota que se pierden en cada deploy
- Para persistencia real en Vercel, considera usar MongoDB o PostgreSQL

### Presupuestos desaparecen en Vercel
- Vercel usa almacenamiento temporal (`/tmp`)
- Para mantener datos permanentes, necesitas una base de datos
- Opción: Integrar MongoDB Atlas o Firebase

## Mejoras Futuras

- [ ] Base de datos (MongoDB, PostgreSQL)
- [ ] Autenticación de usuarios
- [ ] Historial de cambios
- [ ] Exportación a Excel
- [ ] Facturación automática
- [ ] Notificaciones por email
- [ ] Gestión de clientes frecuentes
- [ ] Plantillas de presupuestos

## Licencia

MIT

## Autor

Bassignani Herrajes

## Soporte

Para problemas o sugerencias, contacta con el administrador del proyecto.
