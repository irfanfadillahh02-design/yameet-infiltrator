# Menggunakan image resmi Playwright dari Microsoft (Sudah lengkap dengan Chromium)
FROM mcr.microsoft.com/playwright:v1.59.1-jammy

# Buat direktori kerja
WORKDIR /app

# Copy daftar amunisi
COPY package*.json ./

# Install amunisi
RUN npm install

# Copy seluruh kode
COPY . .

# Buka port untuk API
EXPOSE 3000

# Jalankan mesin
CMD ["npm", "start"]
