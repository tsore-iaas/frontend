# Étape 1 : Utiliser l'image officielle Node.js pour la compilation
FROM node:18 AS build

# Étape 2 : Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier tout le code source dans le conteneur
COPY . .

# Étape 6 : Construire le projet Next.js
RUN npm run build

# Étape 7 : Créer l'image finale pour l'exécution de l'application
FROM node:18-slim AS runtime

# Étape 8 : Définir le répertoire de travail pour l'application
WORKDIR /app

# Étape 9 : Copier les fichiers nécessaires depuis l'étape de construction
COPY --from=build /app ./

# Étape 10 : Exposer le port sur lequel l'application Next.js écoute
EXPOSE 3000

# Étape 11 : Lancer l'application Next.js en mode production
CMD ["npm", "start"]
