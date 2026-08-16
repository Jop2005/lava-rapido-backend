-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('CLIENTE', 'ADMINISTRADOR', 'LAVANDERO', 'CONDUCTOR');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('SOLICITADA', 'EN_PROCESO', 'COMPLETADA');

-- CreateEnum
CREATE TYPE "TratamientoEspecial" AS ENUM ('NINGUNO', 'PLANCHADO', 'DOBLADO', 'AMBOS');

-- CreateEnum
CREATE TYPE "EstadoRecogida" AS ENUM ('PENDIENTE', 'REALIZADA');

-- CreateEnum
CREATE TYPE "EstadoEntrega" AS ENUM ('PENDIENTE', 'REALIZADA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombreUsuario" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "correo" TEXT NOT NULL,
    "fotoPerfil" TEXT,
    "rol" "Rol" NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solicitud" (
    "codigoSeguimiento" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estadoActual" "EstadoSolicitud" NOT NULL,
    "tratamientoEspecial" "TratamientoEspecial" NOT NULL DEFAULT 'NINGUNO',
    "idCliente" TEXT NOT NULL,

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("codigoSeguimiento")
);

-- CreateTable
CREATE TABLE "LineaSolicitud" (
    "idSolicitud" TEXT NOT NULL,
    "tipoPrenda" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "LineaSolicitud_pkey" PRIMARY KEY ("idSolicitud","tipoPrenda")
);

-- CreateTable
CREATE TABLE "TipoDePrenda" (
    "tipo" TEXT NOT NULL,

    CONSTRAINT "TipoDePrenda_pkey" PRIMARY KEY ("tipo")
);

-- CreateTable
CREATE TABLE "Recogida" (
    "id" SERIAL NOT NULL,
    "lugar" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "estado" "EstadoRecogida" NOT NULL DEFAULT 'PENDIENTE',
    "idSolicitud" TEXT NOT NULL,
    "idConductor" TEXT,

    CONSTRAINT "Recogida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrega" (
    "id" SERIAL NOT NULL,
    "lugar" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoEntrega" NOT NULL DEFAULT 'PENDIENTE',
    "idSolicitud" TEXT NOT NULL,
    "idConductor" TEXT,

    CONSTRAINT "Entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialEstado" (
    "idSolicitud" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoSolicitud" NOT NULL,
    "idResponsable" TEXT NOT NULL,

    CONSTRAINT "HistorialEstado_pkey" PRIMARY KEY ("idSolicitud","fechaHora")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_nombreUsuario_key" ON "Usuario"("nombreUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE INDEX "Usuario_correo_idx" ON "Usuario"("correo");

-- CreateIndex
CREATE INDEX "Usuario_nombreUsuario_idx" ON "Usuario"("nombreUsuario");

-- CreateIndex
CREATE INDEX "Solicitud_idCliente_idx" ON "Solicitud"("idCliente");

-- CreateIndex
CREATE INDEX "Solicitud_fechaCreacion_idx" ON "Solicitud"("fechaCreacion");

-- CreateIndex
CREATE INDEX "LineaSolicitud_idSolicitud_idx" ON "LineaSolicitud"("idSolicitud");

-- CreateIndex
CREATE UNIQUE INDEX "Recogida_idSolicitud_key" ON "Recogida"("idSolicitud");

-- CreateIndex
CREATE INDEX "Recogida_idSolicitud_idx" ON "Recogida"("idSolicitud");

-- CreateIndex
CREATE INDEX "Recogida_idConductor_idx" ON "Recogida"("idConductor");

-- CreateIndex
CREATE INDEX "Recogida_estado_idx" ON "Recogida"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Entrega_idSolicitud_key" ON "Entrega"("idSolicitud");

-- CreateIndex
CREATE INDEX "Entrega_idSolicitud_idx" ON "Entrega"("idSolicitud");

-- CreateIndex
CREATE INDEX "Entrega_idConductor_idx" ON "Entrega"("idConductor");

-- CreateIndex
CREATE INDEX "Entrega_estado_idx" ON "Entrega"("estado");

-- CreateIndex
CREATE INDEX "HistorialEstado_idSolicitud_idx" ON "HistorialEstado"("idSolicitud");

-- CreateIndex
CREATE INDEX "HistorialEstado_idResponsable_idx" ON "HistorialEstado"("idResponsable");

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaSolicitud" ADD CONSTRAINT "LineaSolicitud_idSolicitud_fkey" FOREIGN KEY ("idSolicitud") REFERENCES "Solicitud"("codigoSeguimiento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaSolicitud" ADD CONSTRAINT "LineaSolicitud_tipoPrenda_fkey" FOREIGN KEY ("tipoPrenda") REFERENCES "TipoDePrenda"("tipo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recogida" ADD CONSTRAINT "Recogida_idSolicitud_fkey" FOREIGN KEY ("idSolicitud") REFERENCES "Solicitud"("codigoSeguimiento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recogida" ADD CONSTRAINT "Recogida_idConductor_fkey" FOREIGN KEY ("idConductor") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrega" ADD CONSTRAINT "Entrega_idSolicitud_fkey" FOREIGN KEY ("idSolicitud") REFERENCES "Solicitud"("codigoSeguimiento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrega" ADD CONSTRAINT "Entrega_idConductor_fkey" FOREIGN KEY ("idConductor") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstado" ADD CONSTRAINT "HistorialEstado_idSolicitud_fkey" FOREIGN KEY ("idSolicitud") REFERENCES "Solicitud"("codigoSeguimiento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstado" ADD CONSTRAINT "HistorialEstado_idResponsable_fkey" FOREIGN KEY ("idResponsable") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
