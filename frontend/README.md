# Refugio-CMBS

Aplicación híbrida para gestión de refugio de animales.

---

# FRONTEND

## Entrar a frontend

```bash
cd frontend
```

## Instalar dependencias

```bash
npm install
```

## Levantar Expo

```bash
npx expo start
```

---

# BACKEND

## Entrar a backend

```bash
cd backend
```

## Crear entorno virtual

### Windows

```bash
python -m venv venv
```

## Activar entorno virtual

### Windows PowerShell

```bash
.\venv\Scripts\Activate.ps1
```

## Instalar dependencias

```bash
pip install -r requirements.txt
```

---

# VARIABLES DE ENTORNO

Crear archivo:

```text
backend/.env
```
Contenido:

```env
url_bdd=postgresql://postgres:password@localhost:5432/refugio_db
SECRET_KEY=tu_secret
```

---

# FIREBASE

Tienen que :

1. Entrar a Firebase Console
2. Ir a:
   - Project Settings
   - Service Accounts
3. Generar una nueva private key
4. Descargar el archivo JSON
5. Renombrarlo a:

```text
firebase-key.json
```

6. Guardarlo en:

```text
backend/firebase-key.json
```

## IMPORTANTE

Ese archivo NO debe subirse a GitHub.

---

# EJECUTAR BACKEND

```bash
flask run
```

---

# BASE DE DATOS POSTGRESQL

Crear la base de datos  en pgAdmin (PostgreSQL):
- Click derecho Databases -> Create -> Database 
- Nombre: 
```text
refugio_db
```

Crear las tablas, ejecutando migraciones:
```bash
flask db upgrade
```
Crear variable de entorno en archivo .env (usando hostname, port, username y password de tu conexión local):

```env
url_bdd=postgresql://postgres:password@localhost:5432/refugio_db
SECRET_KEY=tu_secret
```

## Cuando hay cambios en los modelos

Quien hizo el cambio:
```bash
flask db migrate -m "descripcion del cambio"
flask db upgrade
```
Y luego commitear y pushear incluyendo la carpeta `migrations/`

Los demás integrantes:
```bash
flask db upgrade
```

---

## CREAR MIGRACIONES (Configuración inicial)

```bash
flask db init
flask db migrate -m "initial migration"
flask db upgrade
```

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
